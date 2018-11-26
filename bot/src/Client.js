const fs = require('fs');
const path = require('path');
const Redis = require('ioredis');
const Sequelize = require('sequelize');
const { Amqp } = require('@spectacles/brokers');
const rest = require('@spectacles/rest');

module.exports = class Client {
	constructor(options) {
		this.options = options;
		this.redis = new Redis(options.redis);
		this.amqp = new Amqp('workers');
		this.db = new Sequelize(options.db);
		this.rest = rest(options.token);
		this.id = options.id;

		this.redis.defineCommand('zaddrangescore', {
			numberOfKeys: 1,
			lua: fs.readFileSync(path.resolve(__dirname, '..', 'scripts', 'zaddrangescore.lua'))
		});
	}

	async start() {
		await this.amqp.connect(this.options.amqp);
		this.amqp.on('MESSAGE_CREATE', require('./events/MESSAGE_CREATE').bind(this));
	}
};
