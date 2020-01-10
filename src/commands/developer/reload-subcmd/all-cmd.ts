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
		"all"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Clear the entire node cache.",
	usage: "[rebuild:yes/no]",
	features: ["devOnly"],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	const start = performance.now();
	let rebuild: boolean, m: Eris.Message, a: string, i = 0;
	if (msg.args.length === 0) {
		m = await msg.reply("would you like to rebuild the code? **Yes** or **No**.");
		const b = await this.messageCollector.awaitMessage(msg.channel.id, msg.author.id, 15e3);
		if (!b || !b.content || !["false", "true", "no", "yes"].includes(b.content.toLowerCase())) return msg.reply("invalid response.");
		a = b.content.toLowerCase();

		await b.delete().catch(err => null);
	} else {
		a = msg.args[0].toLowerCase();
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

		Object.keys(require.cache).map(cache => cache.startsWith(config.rootDir) ? (delete require.cache[cache], i++) : null);

	} catch (e) {
		return msg.channel.createMessage({
			embed: {
				title: "Error",
				color: Colors.red,
				description: `Error while reloading all:\n${e.stack}`,
				timestamp: new Date().toISOString(),
				author: {
					name: msg.author.tag,
					icon_url: msg.author.avatarURL
				},
				footer: {
					text: "",
					icon_url: "https://i.furry.bot/furry.png"
				}
			}
		});
	}
	const end = performance.now();

	return m.edit(`${m.content}\n\nRemoved ${i} items from the node cache in ${Number((end - start).toFixed(3)).toLocaleString()}ms`);
}));
