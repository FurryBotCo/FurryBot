import Command from "../../modules/CommandHandler/Command";
import CommandError from "../../modules/CommandHandler/CommandError";

export default new Command({
	triggers: [
		"leaveserver"
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
	if (msg.args.length < 1) return new CommandError("ERR_INVALID_USAGE", cmd);
	const guild = await this.bot.getRESTGuild(msg.args[0]).catch(err => null);

	if (!guild) return msg.reply("failed to fetch guild.");

	return guild
		.leave()
		.then(() => msg.reply(`left guild **${guild.name}** (${guild.id})`))
		.catch((err) => msg.reply(`there was an error while doing this: ${err}`));
}));
