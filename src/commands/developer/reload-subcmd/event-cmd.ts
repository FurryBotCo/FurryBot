import SubCommand from "../../../util/CommandHandler/lib/SubCommand";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../../config";
import * as Eris from "eris";
import { Colors } from "../../../util/Constants";
import { performance } from "perf_hooks";
import * as fs from "fs-extra";
import { execSync } from "child_process";
import path from "path";
import ClientEvent from "util/ClientEvent";

export default new SubCommand({
	triggers: [
		"event"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Reload an event.",
	usage: "<event> [rebuild:yes/no]",
	features: ["devOnly"],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	const events = this.eventNames();
	const ext = __filename.split(".").reverse()[0];
	const d = path.resolve(`${__dirname}/../../../events`);
	const files = fs.readdirSync(d).filter(e => e.endsWith(`.${ext}`));
	if (msg.args.length < 1 || !events.includes(msg.args[0])) return msg.reply("please provide a valid event to reload.");
	const start = performance.now();
	const ev = path.resolve(`${d}/${msg.args[0]}.${ext}`);
	if (!fs.existsSync(ev)) return msg.reply(`cannot find the file "${ev}" for the event **${msg.args[0]}** on disk, not reloading.`);

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

		delete require.cache[ev];
		this.removeAllListeners(msg.args[0]);
		const e: ClientEvent = require(ev).default;
		this.on(e.event, e.listener.bind(this));
	} catch (e) {
		return msg.channel.createMessage({
			embed: {
				title: "Error",
				color: Colors.red,
				description: `Error while reloading the event **${msg.args[0]}**:\n${e.stack}`,
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

	return m.edit(`${m.content}\n\nReloaded the event **${msg.args[0]}** in ${Number((end - start).toFixed(3)).toLocaleString()}ms`);
}));
