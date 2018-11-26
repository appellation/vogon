const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');

module.exports = {
	Query: {
		filters: (_, args, { dataSources }) => dataSources.db.models.filter.findAll({ where: args }),
		actions: (_, args, { dataSources }) => dataSources.db.models.action.findAll({ where: args }),
		users: (_, args, { dataSources }) => dataSources.db.models.user.findAll({ where: args })
	},
	Filter: {
		actions(filter) {
			return filter.getActions();
		}
	},
	Action: {
		filters(action) {
			return action.getFilters();
		}
	},
	User: {
		username(user) {
			return user.fetchProfile();
		},
		discriminator(user) {
			return user.fetchProfile();
		},
		avatar(user) {
			return user.fetchProfile();
		}
	},
	RegExp: new GraphQLScalarType({
		name: 'RegExp',
		description: 'A regular expression.',
		parseValue(value) {
			const match = value.match(/\/(.*)\/([gimuy]+)?$/);
			return [match[1], match[2]];
		},
		serialize(value) {
			return new RegExp(value[0], value[1]).toString();
		},
		parseLiteral(ast) {
			if (ast.kind === Kind.INT) {
				return parseInt(ast.value, 10);
			}

			return null;
		}
	})
};
