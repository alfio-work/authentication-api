'use strict'

const db = require('./db')();

/**
 *
 * @param {Object} options - Mail options
 *
 * @param {string} options.sendDate - YYYY-MM-DD HH:MM.
 * @param {string} options.from - The email address of the sender.
 * @param {string|string[]} options.to - Comma separated list or an array of recipients email addresses that will appear on the To: field
 * @param {string|string[]} options.cc - Comma separated list or an array of recipients email addresses that will appear on the Cc: field
 * @param {string|string[]} options.bcc - Comma separated list or an array of recipients email addresses that will appear on the Bcc: field
 * @param {string} options.subject - The subject of the email
 * @param {string} options.html - The HTML version of the message as an Unicode string, Buffer, Stream or an attachment-like object ({path: ‘http://…‘})
 * @param {Object[]} options.attachments - An array of attachment objects
 * @returns {Promise}
 */
function send(options) {
	return new Promise((resolve, reject) => {
		if (!options || !options.subject || !options.html) {
			return reject('Subject and html are required');
		}

		if (Array.isArray(options.to)) {
			options.to = options.to.join();
		}

		if (Array.isArray(options.cc)) {
			options.cc = options.cc.join();
		}

		if (Array.isArray(options.bcc)) {
			options.bcc = options.bcc.join();
		}

		db('sysEmail')
			.insert({
				'sendDate': options.sendDate || db.fn.now(),
				'from': options.from,
				'to': options.to,
				'cc': options.cc || null,
				'bcc': options.bcc || null,
				'subject': options.subject,
				'html': options.html,
				'createdDate': db.fn.now(),
				'createdUser': options.userId
			})
			.then(result => {
				resolve(result[0]);
			})
			.catch(err => reject(err));
	});

}

module.exports = {
	send: send
}
