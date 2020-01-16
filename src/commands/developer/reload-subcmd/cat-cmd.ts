import SubCommand from "../../../util/CommandHandler/lib/SubCommand";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../../config";
import * as Eris from "eris";
import { Colors } from "../../../util/Constants";
import { performance } from "perf_hooks";
import * as fs from "fs-extra";
import { execSync } from "child_process";

export default new SubCommand({
	triggers: [
		"cat"
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
	const cats = this.cmd.categories.map(c => c.name);
	if (msg.args.length < 1 || !cats.includes(msg.args[0])) return msg.channel.createMessage({
		embed: {
			title: "Categories",
			description: `Please provide a valid category. Categories:\n\n${this.cmd.categories.map(c => `${c.displayName}: \`${c.name}\``).join("\n")}`,
			color: Colors.red
		}
	});
	const start = performance.now();
	const cat = this.cmd.categories.find(c => c.name === msg.args[0]);
	if (!fs.existsSync(cat.file)) return msg.reply(`cannot find the file "${cat.file}" for the category **${cat.name}** on disk, not reloading.`);
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

		this.cmd.removeCategory(cat);
		delete require.cache[cat.file];
		cat.commands.map(c => {
			delete require.cache[c.file];
			function loopSub(o: SubCommand) {
				if (o.subCommands.length > 0) o.subCommands.map(s => loopSub(s));

				delete require.cache[o.file];
			}
			if (c.subCommands.length > 0) c.subCommands.map(s => loopSub(s));
		});
		const n = require(cat.file).default;
		this.cmd.addCategory(n);
	} catch (e) {
		return msg.channel.createMessage({
			embed: {
				title: "Error",
				color: Colors.red,
				description: `Error while reloading **${cat.name}**:\n${e.stack}`,
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
	const newCat = this.cmd.getCategory(cat.name);

	const o = cat.commands.map(c => c.triggers[0]);
	const n = newCat.commands.map(c => c.triggers[0]);
	const added = [];
	const removed = [];
	const change = [];

	o.map(k => !n.includes(k) ? removed.push(k) : null);
	n.map(k => !o.includes(k) ? added.push(k) : null);

	if (added.length !== 0) added.map(a => change.push(`+ ${a}`));
	if (removed.length !== 0) removed.map(r => change.push(`- ${r}`));

	return m.edit(`${m.content}\n\nReloaded ${newCat.commands.length} commands from the category **${cat.name}** in ${Number((end - start).toFixed(3)).toLocaleString()}ms\n${change.length === 0 ? "No Command Additions/Removals Detected." : `\`\`\`diff\n${change.join("\n")}\n\`\`\``}`);
}));
