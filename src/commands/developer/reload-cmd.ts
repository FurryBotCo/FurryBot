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

		case "file": {
			const nm = msg.dashedArgs.unparsed.value.indexOf("--node-modules");
			let c = Object.keys(require.cache).filter(e => e.toLowerCase().indexOf(msg.args[1].toLowerCase()) !== -1);
			if (!nm) c = c.filter(e => e.indexOf("node_modules") === -1);
			if (!c || c.length === 0) return msg.reply(`{lang:commands.developer.reload.fileNotFound|${msg.args[1]}}`);
			c.map(e => delete require.cache[e]);

			if (c.length === 1) return msg.reply(`{lang:commands.developer.reload.file|${c[0]}}`);
			else return msg.reply(`{lang:commands.developer.reload.files|${c.length}}\n${c.map(e => `- **${e}**`).join("\n")}`);

		}

		default: {
			return msg.reply(`{lang:commands.developer.reload.invalid|${msg.args[0].toLowerCase()}}`);
		}
	}
}));
