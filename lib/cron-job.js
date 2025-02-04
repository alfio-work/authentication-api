'use strict'

const cron = require('node-cron');
const configs = require('../config')['CRON'];

module.exports = function () {
	for (const [key, config] of Object.entries(configs)) {
		if (!config.isEnabled) {
			console.log('\x1b[33m%s\x1b[0m', key, 'cron job \x1b[31mDISABLED\x1b[0m');
			continue;
		}
		console.log('\x1b[33m%s\x1b[0m', key, 'cron job \x1b[32mENABLED\x1b[0m');
		const callback = require(`../cron-jobs/${key}`);
		if (callback) {
			cron.schedule(config.cronSchedule, callback);
		};
	}
};
