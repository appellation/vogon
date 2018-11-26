const { regexRatio } = require('../util');

module.exports = async function MESSAGE_CREATE(message, { ack }) {
	ack();
	if (message.author.id === this.id) return;

	const filters = await this.db.models.filter.findAll({ where: { guildID: message.guild_id } });
	await Promise.all(filters.map(async model => {
		if (message.content.length < model.minLength) return;

		const key = `${message.author.id}:${message.guild_id}:${model.id}`;
		const regex = new RegExp(model.regex);
		const ratio = regexRatio(message.content, regex);

		const totalRating = await this.redis.zaddrangescore(key, message.id, ratio, Date.now() - (model.period * 1000), '+inf');
		if (parseFloat(totalRating) >= model.count) {
			const actions = await model.getActions();
			await Promise.all(actions.map(async action => {
				if (action.channelID && action.message) await this.rest.channels[action.channelID].messages.post(action.message);

				const mod = {
					kick: () => this.rest.guilds[action.guildID].members[message.author.id].delete({ reason: action.reason }),
					ban: () => this.rest.guilds[action.guildID].bans[message.author.id].put({
						'reason': action.reason,
						'delete-message-days': action.deleteDays || 0
					}),
					softban: async () => {
						await mod.ban();
						return this.rest.guilds[action.guildID].bans[message.author.id].delete({ reason: `Softban: ${action.reason}` });
					}
				};

				if (action.mod && mod[action.mod]) await mod[action.mod]();
			}));
		}
	}));
};
