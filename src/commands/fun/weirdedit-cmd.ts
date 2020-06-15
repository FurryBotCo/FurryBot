import Command from "../../modules/CommandHandler/Command";
import CommandError from "../../modules/CommandHandler/CommandError";

export default new Command({
	triggers: [
		"weirdedit"
	],
	permissions: {
		user: [],
		bot: []
	},
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const char = "\u202B";
	if (msg.args.length < 1) return new CommandError("ERR_INVALID_USAGE", cmd);
	const p = msg.args.join(" ").split(",");
	if (!p[0]) return msg.reply("{lang:commands.fun.weirdedit.missing0}");
	if (!p[1]) return msg.reply("{lang:commands.fun.weirdedit.missing1}");

	const m = await msg.channel.createMessage("{lang:commands.fun.weirdedit.edited}");
	await m.edit(`${p[0]} ${char}${char} ${p[1]} ${char}${char}`);
}));
