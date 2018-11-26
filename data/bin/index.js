const Client = require('../src/Client');

const port = process.env.GQL_PORT || 4000;
const host = `${process.env.GQL_HOST || 'http://localhost'}:${port}`;

const client = new Client({
	db: process.env.DB_HOST || 'postgres',
	oauth: {
		endpoint: 'https://discordapp.com/api/oauth2',
		clientID: process.env.DISCORD_CLIENT_ID,
		clientSecret: process.env.DISCORD_CLIENT_SECRET,
		scopes: ['guilds', 'identify'],
		redirectURI: `${host}/auth/discord/callback`,
		keys: (process.env.KEYS || ['hello,world']).split(',')
	},
	token: process.env.DISCORD_TOKEN
});

client.start({ port }).then(() => {
	console.log(`🚀 Server ready at ${host}${client.server.graphqlPath}`);
});
