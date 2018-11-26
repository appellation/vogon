const rest = require('@spectacles/rest');

module.exports = (sequelize, DataTypes) => {
	const User = sequelize.define('user', {
		id: {
			type: DataTypes.BIGINT,
			primaryKey: true,
			unique: true
		},
		lastTokenReset: DataTypes.DATE,
		accessToken: DataTypes.STRING,
		expiresAt: DataTypes.DATE,
		refreshToken: DataTypes.STRING,
		scopes: DataTypes.ARRAY(DataTypes.STRING) // eslint-disable-line new-cap
	});

	Object.defineProperty(User.prototype, 'rest', {
		get() {
			return this._rest || (this._rest = rest(this.accessToken));
		}
	});

	User.prototype.fetchProfile = async function fetchProfile() {
		const profile = await this.rest.users['@me'].get();
		this.set(profile);
		return this;
	};

	return User;
};
