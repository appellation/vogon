const { ApolloServer } = require('apollo-server-express');
const polka = require('polka');
const Sequelize = require('sequelize');
const fs = require('fs');
const klawSync = require('klaw-sync');
const rest = require('@spectacles/rest');

const Oauth2 = require('./oauth2/Client');
const routes = require('./oauth2/routes');

const JWT = require('./JWT');
const resolvers = require('./resolvers');

module.exports = class Client {
	static _loadDB(options) {
		const db = new Sequelize(options);
		for (const [name, importer] of Object.entries(require('./models'))) db.import(name, importer);
		db.models.filter.belongsToMany(db.models.action, { through: 'filter_actions' });
		db.models.action.belongsToMany(db.models.filter, { through: 'filter_actions' });
		return db;
	}

	static _loadGQL(dir) {
		let typeDefs = '';
		const files = klawSync(dir, { nodir: true });
		for (const { path: gql } of files) typeDefs += fs.readFileSync(gql).toString();
		return typeDefs;
	}

	constructor(options) {
		this.options = Object.freeze(options);
		this.db = Client._loadDB(this.options.db);
		this.oauth = new Oauth2(this.options.oauth);
		this.jwt = new JWT(this.options.oauth.keys[0], this.db.model('user'));
		this.rest = rest(this.options.token);
		this.app = polka(options.server);

		this.server = new ApolloServer({
			typeDefs: Client._loadGQL('./schema'),
			resolvers,
			dataSources: () => ({
				db: this.db
			}),
			context: async ({ req }) => {
				const token = req.headers.authorization;
				const user = await this.jwt.verify(token);
				if (user.expiresAt <= Date.now()) await this.oauth.refresh(user.refreshToken);
				return { user };
			}
		});

		this.server.applyMiddleware({ app: this.app });
		routes.register(this);
	}

	async start(options) {
		await this.db.sync();
		return new Promise(r => this.app.listen(options, r));
	}
};
