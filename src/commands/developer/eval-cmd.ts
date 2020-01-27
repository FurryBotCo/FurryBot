import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";
import _eval from "../../util/eval";
import phin from "phin";
import util from "util";
import * as Eris from "eris";
import * as fs from "fs";
import { db, mdb, mongo } from "../../modules/Database";
import * as os from "os";
import { performance } from "perf_hooks";
import Permissions from "../../util/Permissions";
import * as F from "../../util/Functions";
import Redis from "../../util/Redis";

export default new Command({
	triggers: [
		"eval",
		"ev",
		"exec"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Evaluate some stuffs.",
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
	let res, o;
	try {
		// an external functions is used because typescript screws with the context and the variables
		res = await _eval.call(this, ev, {
			config,
			msg,
			phin,
			util,
			fs,
			db,
			mdb,
			mongo,
			Permissions,
			os,
			F,
			Functions: F,
			...F,
			Redis
		});
	} catch (e) {
		res = e;
		error = true;
	}
	const end = performance.now();
	if (typeof res !== "string") {
		if (typeof res === "undefined") res = "No Return";
		else {
			const j = res instanceof Object ? F.Utility.toStringFormat(res) : null;
			if (!!j && j !== res.toString()) {
				if (res instanceof Error) (error = true, o = res);
				res = j;
			}
			else if (typeof res === "object") res = util.inspect(res, { depth: 2, showHidden: true });
			else if (res instanceof Promise) res = await res;
			else if (res instanceof Function) res = res.toString();
			else if (res instanceof Buffer) res = res.toString();
			else res = res.toString();
		}
	}

	if (res.indexOf(config.bot.token) !== -1) res = res.replace(new RegExp(config.bot.token, "g"), "[BOT TOKEN]");
	if (res.indexOf(config.universalKey) !== -1) res = res.replace(new RegExp(config.universalKey, "g"), "[UNIVERSAL KEY]");

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
					api_paste_name: "Furry Bot Eval",
					api_paste_expire_date: "1D"
				},
				timeout: 5e3
			});
			res = `Uploaded ${req.body.toString()}`;
		}

		if (error) Logger.error(`Shard #${msg.channel.guild.shard.id}`, ![undefined, null].includes(o) ? o : res);

		return msg.channel.createMessage({
			embed: {
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
						value: `\`\`\`js\n${ev}\`\`\``,
						inline: false
					},
					{
						name: ":outbox_tray: Output",
						value: `\`\`\`js\n${res}\`\`\``,
						inline: false
					}
				]
			}
		});
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
					api_paste_name: "Furry Bot Silent Eval",
					api_paste_expire_date: "1D"
				},
				timeout: 5e3
			});
			res = `Uploaded ${req.body.toString()}`;
		}

		return Logger.log(`Silent eval return: ${res}`, msg.guild.shard.id);
	}
}));
