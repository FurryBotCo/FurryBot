import SubCommand from "../../../util/CommandHandler/lib/SubCommand";

export default new SubCommand({
	triggers: [
		"game"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Change the bots game.",
	usage: "<type> <game>",
	features: ["devOnly"],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length <= 1) return new Error("ERR_INVALID_USAGE");
	let type;
	switch (msg.args[0].toLowerCase()) {
		case "playing":
			type = 0;
			break;

		case "streaming":
			type = 1;
			break;

		case "listening":
			type = 2;
			break;

		case "watching":
			type = 3;
			break;

		default:
			return msg.channel.createMessage(`<@!${msg.author.id}>, invalid type. Possible types: **playing**, **listening**, **watching**, **streaming**.`);
	}
	msg.args.shift();

	if (type === 1) return this.editStatus(msg.channel.guild.shard.presence.status, { url: msg.args.shift(), name: msg.args.join(" "), type });
	else return this.editStatus(msg.channel.guild.shard.presence.status, { name: msg.args.join(" "), type });
}));
