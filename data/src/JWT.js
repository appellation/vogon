const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

module.exports = class Auth {
	constructor(key, users) {
		this.key = key;
		this.users = users;
	}

	async verify(token) {
		if (!token) return null;

		try {
			const decoded = await new Promise((resolve, reject) => {
				jwt.verify(token, this.key, (err, res) => {
					if (err) reject(err);
					else resolve(res);
				});
			});

			// verify that the user exists and this token hasn't been reset
			return await this.users.findOne({
				where: {
					lastTokenReset: {
						[Op.or]: {
							[Op.lt]: decoded.iat * 1000,
							[Op.eq]: null
						}
					},
					id: decoded.id
				}
			});
		} catch (e) {
			return null;
		}
	}

	sign(id, options) {
		return new Promise((resolve, reject) => {
			jwt.sign({ id }, this.key, options, (err, token) => {
				if (err) reject(err);
				else resolve(token);
			});
		});
	}
};
