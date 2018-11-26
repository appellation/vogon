exports.register = client => {
	client.app.get('/auth/discord', client.oauth.authorize());

	client.app.get('/auth/discord/callback', async (req, res) => {
		const token = await client.oauth.token(req, res);
		if (token.error) {
			res.statusCode = 400;
			res.end(token.error);
			return;
		}

		try {
			const me = await client.rest.users['@me'].get();

			const expiry = new Date();
			expiry.setSeconds(expiry.getSeconds() + token.expires_in);

			await client.db.models.user.upsert({
				id: me.id,
				accessToken: token.access_token,
				expiresAt: expiry,
				refreshToken: token.refresh_token,
				scopes: token.scope.split(' ')
			});

			// TODO: redirect somewhere else
			const genToken = await client.jwt.sign(me.id);
			res.end(genToken);
		} catch (e) {
			res.statusCode = 500;
			res.end(e);
		}
	});
};
