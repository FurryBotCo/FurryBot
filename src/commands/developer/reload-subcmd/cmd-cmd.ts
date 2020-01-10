import SubCommand from "../../../util/CommandHandler/lib/SubCommand";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../../config";
import { Logger } from "../../../util/LoggerV8";
import phin from "phin";
import * as Eris from "eris";
import { db, mdb, mongo } from "../../../modules/Database";
import { Colors } from "../../../util/Constants";
import { performance } from "perf_hooks";
import * as fs from "fs-extra";
import { execSync } from "child_process";

export default new SubCommand({
	triggers: [
		"cmd"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Reload a category.",
	usage: "<cat> [rebuild:yes/no]",
	features: ["devOnly"],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	const cmds = this.cmd.commandTriggers.reduce((a, b) => a.concat(b));
	if (msg.args.length < 1 || !cmds.includes(msg.args[0])) return msg.reply("please provide a valid command to reload.");
	const start = performance.now();
	const { cmd, cat } = this.cmd.getCommand(msg.args[0]);
	if (!fs.existsSync(cmd.file)) return msg.reply(`cannot find the file "${cmd.file}" for the command **${cmd.triggers[0]}** on disk, not reloading. (if removing command, reload full category)`);
	let rebuild: boolean, m: Eris.Message, a: string;
	if (msg.args.length === 1) {
		m = await msg.reply("would you like to rebuild the code? **Yes** or **No**.");
		const b = await this.messageCollector.awaitMessage(msg.channel.id, msg.author.id, 15e3);
		if (!b || !b.content || !["false", "true", "no", "yes"].includes(b.content.toLowerCase())) return msg.reply("invalid response.");
		a = b.content.toLowerCase();
	} else {
		a = msg.args[1].toLowerCase();
		m = await msg.channel.createMessage("Processing..");
	}

	switch (a.toLowerCase()) {
		case "false":
		case "no":
			rebuild = false;
			break;

		case "true":
		case "yes":
			rebuild = true;
			break;
	}

	if (rebuild) {
		await m.edit("Rebuilding code, please wait..");
		const start = performance.now();
		const rb = execSync("npm run build", {
			cwd: config.rootDir
		});
		const end = performance.now();
		await m.edit(`Rebuild finished in ${Number((end - start).toFixed(3)).toLocaleString()}ms\`\`\`fix\n${rb.toString()}\n\`\`\``);
	} else await msg.edit("not rebuilding code.");
	try {
		delete require.cache[cmd.file];
		cat.removeCommand(cmd);
		const n = require(cmd.file).default;
		cat.addCommand(n);
	} catch (e) {
		return msg.channel.createMessage({
			embed: {
				title: "Error",
				color: Colors.red,
				description: `Error while reloading **${cmd.triggers[0]}**:\n${e.stack}`,
				timestamp: new Date().toISOString(),
				author: {
					name: msg.author.tag,
					icon_url: msg.author.avatarURL
				}
			}
		});
	}
	const end = performance.now();
	const { cmd: newCmd } = this.cmd.getCommand(cmd.triggers[0]);

	return msg.channel.createMessage(`Reloaded the command **${cmd.triggers[0]}** from the category **${cat.name}** in ${Number((end - start).toFixed(3)).toLocaleString()}ms`);
}));
