import SubCommand from "../../../util/CommandHandler/lib/SubCommand";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../../config";
import * as Eris from "eris";
import { Colors } from "../../../util/Constants";
import { performance } from "perf_hooks";
import * as fs from "fs-extra";
import { execSync } from "child_process";
import Command from "util/CommandHandler/lib/Command";
import Category from "util/CommandHandler/lib/Category";

export default new SubCommand({
	triggers: [
		"cmd"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Reload a category.",
	usage: "<cat/all> [rebuild:yes/no]",
	features: ["devOnly"],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	const start = performance.now();
	let cmd: Command, cat: Category, cmds: number, newCat: Category[];
	if (!msg.args[0] || msg.args[0].toLowerCase() !== "all") {
		const cmds = this.cmd.commandTriggers.reduce((a, b) => a.concat(b));
		if (msg.args.length < 1 || !cmds.includes(msg.args[0])) return msg.reply("please provide a valid command to reload.");
		// this weird bit is to keep this in one line
		[cmd, cat] = Object.values(this.cmd.getCommand(msg.args[0])) as any;
		if (!fs.existsSync(cmd.file)) return msg.reply(`cannot find the file "${cmd.file}" for the command **${cmd.triggers[0]}** on disk, not reloading. (if removing command, reload full category)`);
	}
	let rebuild: boolean, m: Eris.Message, a: string;
	if (msg.args.length === 1) {
		m = await msg.reply("would you like to rebuild the code? **Yes** or **No**.");
		const b = await this.messageCollector.awaitMessage(msg.channel.id, msg.author.id, 15e3);
		if (!b || !b.content || !["false", "true", "no", "yes"].includes(b.content.toLowerCase())) return msg.reply("invalid response.");
		a = b.content.toLowerCase();

		await b.delete().catch(err => null);
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

	try {
		if (rebuild) {
			m = await m.edit("Rebuilding code, please wait..");
			const start = performance.now();
			const rb = execSync("npm run build", {
				cwd: config.rootDir
			});
			const end = performance.now();
			m = await m.edit(`Rebuild finished in ${Number((end - start).toFixed(3)).toLocaleString()}ms\`\`\`fix\n${rb.toString()}\n\`\`\``);
		} else m = await m.edit("not rebuilding code.");

		if (msg.args[0] === "all") {
			const oldCat = [...this.cmd.categories];
			oldCat.map(c => {
				delete require.cache[c.file];
				this.cmd.removeCategory(c.name);
				c.commands.map(cmd => {
					delete require.cache[cmd.file];
					function loopSub(o: SubCommand) {
						if (o.subCommands.length > 0) o.subCommands.map(s => loopSub(s));

						delete require.cache[o.file];
					}
					if (cmd.subCommands.length > 0) cmd.subCommands.map(s => loopSub(s));
				});
			});

			newCat = oldCat.map(c => this.cmd.addCategory(require(c.file).default));
			cmds = newCat.reduce((a, b) => a + b.commands.length, 0);
		} else {
			delete require.cache[cmd.file];
			function loopSub(o: SubCommand) {
				if (o.subCommands.length > 0) o.subCommands.map(s => loopSub(s));

				delete require.cache[o.file];
			}
			if (cmd.subCommands.length > 0) cmd.subCommands.map(s => loopSub(s));
			this.cmd.getCategory(cat.name).removeCommand(cmd);
			const n = require(cmd.file).default;
			this.cmd.getCategory(cat.name).addCommand(n);
		}
	} catch (e) {
		return msg.channel.createMessage({
			embed: {
				title: "Error",
				color: Colors.red,
				description: `Error while reloading **${msg.args[0].toLowerCase() === "all" ? "all" : cmd.triggers[0]}**:\n${e.stack}`,
				timestamp: new Date().toISOString(),
				author: {
					name: msg.author.tag,
					icon_url: msg.author.avatarURL
				},
				footer: {
					text: "(a full restart will most likely be required)",
					icon_url: "https://i.furry.bot/furry.png"
				}
			}
		});
	}
	const end = performance.now();

	if (msg.args[0] === "all") return m.edit(`${m.content}\n\nReloaded **${cmds}** commands from **${newCat.length}** categories in ${Number((end - start).toFixed(3)).toLocaleString()}ms`);
	else return m.edit(`${m.content}\n\nReloaded the command **${cmd.triggers[0]}** from the category **${cat.name}** in ${Number((end - start).toFixed(3)).toLocaleString()}ms`);
}));
