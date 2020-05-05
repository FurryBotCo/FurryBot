import Command from "../../util/CommandHandler/lib/Command";

export default new Command({
	triggers: [
		"leaveserver"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Make me leave a server.",
	usage: "<id>",
	features: ["devOnly"],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");
	const guild = await this.getRESTGuild(msg.args[0]).catch(err => null);

	if (!guild) return msg.reply("failed to fetch guild.");

	return guild
		.leave()
		.then(() => msg.reply(`left guild **${guild.name}** (${guild.id})`))
		.catch((err) => msg.reply(`there was an error while doing this: ${err}`));
}));
