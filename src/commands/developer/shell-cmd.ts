import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";
import phin from "phin";
import util from "util";
import * as Eris from "eris";
import { execSync } from "child_process";
import { performance } from "perf_hooks";

export default new Command({
	triggers: [
		"shell",
		"sh"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Execute shell code.",
	usage: "<code>",
	features: ["devOnly"],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	let silent = false;
	let error = false;
	let deleteInvoke = false;
	let ev = msg.unparsedArgs.join(" ");
	if (ev.indexOf("-s") !== -1) {
		silent = true;
		ev = ev.replace("-s", "");
	}
	if (ev.indexOf("-d") !== -1) {
		deleteInvoke = true;
		ev = ev.replace("-d", "");
	}
	const start = performance.now();
	let res;
	try {
		res = execSync(ev).toString();
	} catch (e) {
		res = e;
		error = true;
	}
	const end = performance.now();

	if (typeof res !== "string") {
		if (typeof res === "undefined") res = "No Return";
		// else if (res instanceof Array) res = res.join(" ");
		else if (typeof res === "object") res = util.inspect(res, { depth: 2, showHidden: true });
		else if (res instanceof Promise) res = await res;
		else if (res instanceof Function) res = res.toString();
		else if (res instanceof Buffer) res = res.toString();
		else res = res.toString();
	}

	if (deleteInvoke) await msg.delete();
	if (!silent) {

		if (res.length > 1000) {
			const req = await phin({
				method: "POST",
				url: "https://pastebin.com/api/api_post.php",
				form: {
					api_dev_key: config.apis.pastebin.devKey,
					api_user_key: config.apis.pastebin.userKey,
					api_option: "paste",
					api_paste_code: res,
					api_paste_private: "2",
					api_paste_name: "Furry Bot Shell Eval",
					api_paste_expire_date: "1D"
				},
				timeout: 5e3
			});
			res = `Uploaded ${req.body.toString()}`;
		}

		const embed: Eris.EmbedOptions = {
			title: `Evaluated in \`${(end - start).toFixed(3)}ms\``,
			author: {
				name: msg.author.tag,
				icon_url: msg.author.avatarURL
			},
			timestamp: new Date().toISOString(),
			color: error ? 16711680 : Math.floor(Math.random() * 0xFFFFFF),
			fields: [
				{
					name: ":inbox_tray: Input",
					value: `\`\`\`bash\n${ev}\`\`\``,
					inline: false
				},
				{
					name: ":outbox_tray: Output",
					value: `\`\`\`bash\n${res}\`\`\``,
					inline: false
				}
			]
		};

		return msg.channel.createMessage({ embed });
	} else {
		if (res.length > 3000) {
			const req = await phin({
				method: "POST",
				url: "https://pastebin.com/api/api_post.php",
				form: {
					api_dev_key: config.apis.pastebin.devKey,
					api_user_key: config.apis.pastebin.userKey,
					api_option: "paste",
					api_paste_code: res,
					api_paste_private: "2",
					api_paste_name: "Furry Bot Silent Shell Eval",
					api_paste_expire_date: "1W"
				},
				timeout: 5e3
			});
			res = `Uploaded ${req.body.toString()}`;
		}

		return Logger.log(`Silent shell eval return: ${res}`, msg.guild.shard.id);
	}
}));
