import Command from "../../modules/CommandHandler/Command";
import CommandError from "../../modules/CommandHandler/CommandError";
import Category from "../../modules/CommandHandler/Category";

export default new Command({
	triggers: [
		"reload"
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

	switch (msg.args[0].toLowerCase()) {
		case "cmd": {
			if (!msg.args[1]) return msg.reply("{lang:commands.dev.reload.cmdMissing}");
			const c = this.cmd.getCommand(msg.args[1].toLowerCase()) as { cmd: Command; cat: Category; };
			if (!c) return msg.reply("{lang:commands.dev.reload.cmdMissing}");

			c.cat.reloadCommand(c.cmd);

			return msg.reply(`{lang:commands.dev.reload.cmdDone|${msg.args[0].toLowerCase()}}`);
		}
	}
}));
