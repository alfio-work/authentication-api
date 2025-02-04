'use strict';

const config = require('./../config');
const db = require('knex');

class KnexSingleton {
  constructor(database = 'default') {
    if (!KnexSingleton.instances) {
      KnexSingleton.instances = {};
    }

    if (!KnexSingleton.instances[database]) {
      const databases = config.DB;
      const selectedDatabase = databases[database];

      if (!selectedDatabase) {
        throw new Error(`Database configuration for "${database}" not found.`);
      }

      const dbConfig = {
        client: selectedDatabase.client,
        connection: {
          host: selectedDatabase.host,
          user: selectedDatabase.user,
          password: selectedDatabase.password,
          database: selectedDatabase.database,
          requestTimeout: 600000,
          connectionTimeout: 20000,
          options: {
            encrypt: false,
            enableArithAbort: true,
          },
        },
      };

      KnexSingleton.instances[database] = db(dbConfig);
    }

    return KnexSingleton.instances[database];
  }
}

module.exports = (database) => new KnexSingleton(database);