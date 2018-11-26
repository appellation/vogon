const { ApolloServer } = require('apollo-server-express');
const polka = require('polka');
const Sequelize = require('sequelize');
const fs = require('fs');
const klawSync = require('klaw-sync');
const rest = require('@spectacles/rest');

const Oauth2 = require('./oauth2/Client');
const routes = require('./oauth2/routes');

const JWT = require('./JWT');
const Loader = require('./Loader');
const resolvers = require('./resolvers');

module.exports = class Client {
	constructor(options) {
		this.options = Object.freeze(options);
		this.models = new Loader('./src/models');
		this.db = new Sequelize(this.options.db);
		this.oauth = new Oauth2(this.options.oauth);
		this.jwt = new JWT(this.options.oauth.keys[0]);
		this.rest = rest(this.options.token);
		this.app = polka(options.server);

		let typeDefs = '';
		const files = klawSync('./schema', { nodir: true });
		for (const { path } of files) typeDefs += fs.readFileSync(path).toString();

		this.server = new ApolloServer({
			typeDefs,
			resolvers,
			dataSources: () => ({
				db: this.db
			}),
			context: async ({ req }) => {
				const token = req.getHeader('authorization');
				const user = await this.jwt.verify(token);
				return { user };
			}
		});

		this.server.applyMiddleware({ app: this.app });
		routes.register(this);
	}

	async start(options) {
		await this._db();
		return new Promise(r => this.app.listen(options, r));
	}

	async _db() {
		await this.models.awaitReady();
		for (const [name, loader] of this.models) this.db.import(name, loader);

		this.db.models.filter.belongsToMany(this.db.models.action, { through: 'filter_actions' });
		this.db.models.action.belongsToMany(this.db.models.filter, { through: 'filter_actions' });

		return this.db.sync();
	}
};
