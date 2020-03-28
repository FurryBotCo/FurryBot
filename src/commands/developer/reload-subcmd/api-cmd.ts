import SubCommand from "../../../util/CommandHandler/lib/SubCommand";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../../config";
import { Logger } from "../../../util/LoggerV8";
import * as Eris from "eris";
import { Colors } from "../../../util/Constants";
import { performance } from "perf_hooks";
import { execSync } from "child_process";
import path from "path";

export default new SubCommand({
	triggers: [
		"api"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Reload the api.",
	usage: "[rebuild:yes/no]",
	features: ["devOnly"],
	file: __filename
}, (async function (msg: ExtendedMessage) {
	const start = performance.now();
	let rebuild: boolean, m: Eris.Message, a: string;
	if (msg.args.length === 0) {
		m = await msg.reply("would you like to rebuild the code? **Yes** or **No**.");
		const b = await this.col.awaitMessage(msg.channel.id, msg.author.id, 15e3);
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
				cwd: config.dir.base
			});
			const end = performance.now();
			m = await m.edit(`Rebuild finished in ${Number((end - start).toFixed(3)).toLocaleString()}ms\`\`\`fix\n${rb.toString()}\n\`\`\``);
		} else m = await m.edit("not rebuilding code.");

		const d = path.resolve(`${__dirname}/../../../api`);
		Object.keys(require.cache).map(cache => cache.startsWith(d) ? delete require.cache[cache] : null);
		// @FIXME
		// this.srv.close();
		const p = await (require(`${d}/index.js`).default)(this);
		// this.srv = p.listen(config.web.api.port, config.web.api.ip, () => Logger.debug("APIServer", `Listening on ${config.apiBindIp}:${config.apiPort}`));
	} catch (e) {
		return msg.channel.createMessage({
			embed: {
				title: "Error",
				color: Colors.red,
				description: `Error while reloading api:\n${e.stack}`,
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

	return m.edit(`${m.content}\n\nReloaded and restarted the api server in ${Number((end - start).toFixed(3)).toLocaleString()}ms`);
}));
