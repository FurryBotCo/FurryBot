import Command from "../../util/CommandHandler/lib/Command";

export default new Command({
	triggers: [
		"say"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Make me say something.",
	usage: "<text>",
	features: ["contribOnly"],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	await msg.delete().catch(err => null);
	return msg.channel.createMessage(msg.unparsedArgs.join(" "));
}));
