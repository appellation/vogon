const Client = require('../src/Client');
const client = new Client({
	redis: process.env.REDIS_HOST || 'redis',
	db: process.env.DB_HOST || 'postgres',
	amqp: process.env.AMQP_HOST || 'rabbit',
	token: process.env.DISCORD_TOKEN,
	id: process.env.DISCORD_CLIENT_ID
});

client.start();
