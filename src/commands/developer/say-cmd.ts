import Command from "../../modules/CommandHandler/Command";

export default new Command({
	triggers: [
		"say"
	],
	permissions: {
		user: [],
		bot: []
	},
	cooldown: 0,
	donatorCooldown: 0,
	restrictions: ["developer"],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	await msg.delete().catch(err => null);
	return msg.channel.createMessage(msg.unparsedArgs.join(" "));
}));
