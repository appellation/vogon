module.exports = (sequelize, DataTypes) => sequelize.define('action', {
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
	channelID: DataTypes.BIGINT,
	message: DataTypes.JSON,
	mod: DataTypes.ENUM('KICK', 'BAN', 'SOFTBAN'), // eslint-disable-line new-cap
	deleteDays: DataTypes.INTEGER,
	reason: DataTypes.STRING
}, {
	indexes: [{ fields: ['guildID'] }],
	timestamps: false
});
