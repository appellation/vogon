module.exports = (sequelize, DataTypes) => sequelize.define('filter', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true,
		unique: true
	},
	guildID: {
		type: DataTypes.BIGINT,
		allowNull: false
	},
	regex: {
		type: DataTypes.ARRAY(DataTypes.STRING), // eslint-disable-line new-cap
		allowNull: false
	},
	minLength: {
		'type': DataTypes.INTEGER,
		'default': 0
	},
	count: {
		type: DataTypes.FLOAT,
		allowNull: false
	},
	period: {
		type: DataTypes.FLOAT,
		allowNull: false
	}
}, {
	indexes: [{ fields: ['guildID'] }],
	timestamps: false
});
