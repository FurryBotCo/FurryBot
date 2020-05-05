import SubCommand from "../../../util/CommandHandler/lib/SubCommand";

export default new SubCommand({
	triggers: [
		"name",
		"username"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Change the bots username.",
	usage: "<username>",
	features: ["devOnly"],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.unparsedArgs.length === 0) return new Error("ERR_INVALID_USAGE");
	const username = msg.unparsedArgs.join(" ");
	if (username.length < 2 || username.length > 32) return msg.channel.createMessage("Username must be between **2** and **32** characters.");
	this.editSelf({ username })
		.then((user) => msg.reply(`set username to "${user.username}"`))
		.catch((err) => msg.reply(`there was an error while doing this: ${err}`));
}));
