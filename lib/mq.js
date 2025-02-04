'use strict'

const { v4: uuidv4 } = require('uuid');
const amqp = require('amqplib');
const {
  PROTOCOL,
  USER,
  PASSWORD,
  HOST,
  PORT,
  VHOST,
  CURRENT_SERVICE_NAME } = require('../config').AMQP;

class RabbitMQ {
  constructor() {
    if (!RabbitMQ.instance) {
      RabbitMQ.instance = this;
      this.connection = null;
      this.connectionPromise = null;
      this.isReconnecting = false;
      this.isClosing = false;
    }
    return RabbitMQ.instance;
  }

  async connect() {
    if (this.connection) {
      // console.log('Reusing existing RabbitMQ connection.');
      return this.connection;
    }

    if (this.connectionPromise) {
      // console.log('Waiting for ongoing connection attempt...');
      return this.connectionPromise;
    }

    // console.log('Connecting to RabbitMQ...');
    this.connectionPromise = this._connectWithTimeout(5000); // 10-second timeout
    try {
      this.connection = await this.connectionPromise;

      // Reset flags
      this.connectionPromise = null;
      this.isReconnecting = false;
      this.isClosing = false;

      // Set up event handlers
      this.connection.on('close', () => {
        if (this.isClosing) {
          console.log('RabbitMQ connection closed gracefully.');
        } else {
          console.error('RabbitMQ connection closed unexpectedly. Reconnecting...');
          this.connection = null;
          this.reconnect();
        }
      });

      this.connection.on('error', (err) => {
        console.error('RabbitMQ connection error:', err.message);
      });

      console.log('RabbitMQ connection established.');
      return this.connection;
    } catch (error) {
      this.connectionPromise = null; // Reset promise on failure
      console.error('Error connecting to RabbitMQ:', error.message);
      this.reconnect();
      throw error; // Propagate the error
    }
  }

  async _connectWithTimeout(timeout) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('RabbitMQ connection timed out.'));
      }, timeout);

      amqp
        .connect(`${PROTOCOL}://${USER}:${PASSWORD}@${HOST}:${PORT}/${VHOST}`)
        .then((connection) => {
          clearTimeout(timer); // Clear timeout on success
          resolve(connection);
        })
        .catch((error) => {
          clearTimeout(timer); // Clear timeout on failure
          reject(error);
        });
    });
  }

  async createChannel() {
    try {
      if (!this.connection) {
        // console.log('No active RabbitMQ connection. Establishing a new connection...');
        await this.connect();
      }

      // console.log('Creating a new RabbitMQ channel...');
      const channel = await this.connection.createChannel();

      // Set up event handlers for the channel
      channel.on('close', () => {
        // console.log('RabbitMQ channel closed.');
      });

      channel.on('error', (err) => {
        console.error('RabbitMQ channel error:', err);
      });

      // console.log('New RabbitMQ channel created.');
      return channel;
    } catch (error) {
      console.error('Error creating RabbitMQ channel:', error.message);
      throw error; // Propagate the error
    }
  }

  async publish(exchange, routingKey, message, options = {}) {
    try {
      const channel = await this.createChannel();

      let dataType = typeof message;
      if (dataType === 'object') {
        if (Array.isArray(message)) {
          dataType = 'array';
        }
      }

      const msg = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        source: CURRENT_SERVICE_NAME,
        dataType: dataType,
        payload: message
      }

      channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(msg)), options);
      // console.log(`Message published to exchange "${exchange}" with routing key "${routingKey}"`);
      console.log(`Published to "${exchange}/${routingKey}"`);
      await channel.close(); // Close the channel after publishing
    } catch (error) {
      console.error('Error publishing message:', error.message);
      throw error;
    }
  }

  async listen(exchangeName, routingKey, onMessage) {
    try {
      const channel = await this.createChannel();

      // Create a dynamic queue
      // const { queue } = await channel.assertQueue(queueName, {
      //   exclusive: true, // Dynamic, auto-deleted queue
      // });
      const queueName = `${CURRENT_SERVICE_NAME}/${exchangeName}/${routingKey}`;
      await channel.assertQueue(queueName, {
        // exclusive: true, // Dynamic, auto-deleted queue
      });

      // console.log(`Dynamic queue "${queue}" created. Binding to exchange "${exchangeName}" with routing key "${routingKey}".`);
      // console.log(`Asserting queue "${queueName}". Binding to exchange "${exchangeName}" with routing key "${routingKey}".`);

      // Bind the queue to the exchange with the routing key
      await channel.bindQueue(queueName, exchangeName, routingKey);

      console.log(`Listening to ${queueName}`);
      channel.consume(queueName, (msg) => {
        if (msg) {
          const data = JSON.parse(msg.content.toString());
          onMessage(data, () => channel.ack(msg), () => channel.nack(msg), queueName);
          // channel.ack(msg); // Acknowledge the message
        }
      });
    } catch (error) {
      console.error('Error setting up listener:', error.message);
      throw error;
    }
  }

  reconnect() {
    if (this.isReconnecting || this.isClosing) {
      console.log('Reconnection attempt skipped. Already reconnecting or closing.');
      return;
    }

    this.isReconnecting = true;

    setTimeout(async () => {
      console.log('Attempting to reconnect to RabbitMQ...');
      try {
        await this.connect();
      } catch (err) {
        console.error('Reconnection failed:', err.message);
        this.isReconnecting = false; // Allow subsequent reconnection attempts
        this.reconnect(); // Retry reconnection
      }
    }, 5000); // Retry connection after 5 seconds
  }

  async close() {
    try {
      console.log('Gracefully closing RabbitMQ connection...');
      this.isClosing = true;

      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }

      console.log('RabbitMQ connection closed gracefully.');
    } catch (error) {
      console.error('Error closing RabbitMQ connection:', error.message);
    } finally {
      this.isClosing = false; // Reset closing flag
    }
  }
}

module.exports = new RabbitMQ();