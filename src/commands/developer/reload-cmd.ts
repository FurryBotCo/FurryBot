import Command from "../../modules/CommandHandler/Command";
import CommandError from "../../modules/CommandHandler/CommandError";
import Category from "../../modules/CommandHandler/Category";
import * as fs from "fs-extra";
import config from "../../config";

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
			if (!msg.args[1]) return msg.reply("{lang:commands.developer.reload.cmdMissing}");
			const c = this.cmd.getCommand(msg.args[1].toLowerCase()) as { cmd: Command; cat: Category; };
			if (!c) return msg.reply("{lang:commands.developer.reload.cmdMissing}");

			c.cat.reloadCommand(c.cmd);

			return msg.reply(`{lang:commands.developer.reload.cmdDone|${msg.args[1].toLowerCase()}}`);
		}

		case "lang": {
			let i = 0;
			fs.readdirSync(`${config.dir.lang}`).filter(f => !fs.lstatSync(`${config.dir.lang}/${f}`).isDirectory() && f.endsWith(".json")).map(f => (i++, fs.unlinkSync(`${config.dir.lang}/${f}`)));
			return msg.reply(`{lang:commands.developer.reload.lang|${i}}`);
			break;
		}

		case "all": {
			const cache = Object.keys(require.cache);
			for (const r of cache) delete require.cache[r];
			return msg.reply(`{lang:commands.developer.reload.all|${cache.length}}`);
		}

		default: {
			return msg.reply(`{lang:commands.developer.reload.invalid|${msg.args[0].toLowerCase()}}`);
		}
	}
}));
