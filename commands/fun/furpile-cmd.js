module.exports = {
	triggers: [
		"furpile",
		"pileon",
		"pile"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 5e3,
	description: "Start a furpile on someone, or join in!",
	usage: "[@user]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async function(message) {
		if(message.args.length === 0) {
			if(message.channel.furpileActive) return;
			else return new Error("ERR_INVALID_USAGE");
		} else {
			const member = await message.getMemberFromArgs(),
				inPile = [];
			if(!member) return message.errorEmbed("INVALID_USER");
			await message.channel.send(`<@!${message.author.id}> started a furpile on <@!${member.id}>!\nJoin in using \`${message.gConfig.prefix}furpile\`.`);
			inPile.push(message.author.id,member.id);
			message.channel.furpileActive = true;
			const awaitJoin = (async(msg) => {
				const a = await msg.channel.awaitMessages(m => !m.author.bot && m.content.toLowerCase() === `${message.gConfig.prefix}furpile` && (msg.client.config.developers.includes(m.author.id) || !inPile.includes(m.author.id)),{max: 1, time: 6e5, errors: ["time"]}).then(c => {
					inPile.push(c.first().author.id);
					return c.first().channel.send(`<@!${c.first().author.id}> joined a furpile on <@!${member.id}>!\n<@!${member.id}> now has ${inPile.length} furs on them!\nJoin in using \`${message.gConfig.prefix}furpile\`.`).then(true).catch(false);
				}).catch(false);
				if(a) return awaitJoin(msg);
				else {
					message.channel.furpileActive = false;
					return false;
				}
			});
			awaitJoin(message);
		}
	})
};