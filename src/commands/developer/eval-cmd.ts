import Command from "../../util/CommandHandler/lib/Command";
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
import Language from "../../util/Language";
import rClient from "../../util/Redis";

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
}, (async function (msg, uConfig, gConfig, cmd) {
	const
		silent = msg.dashedArgs.unparsed.value.includes("s"),
		deleteInvoke = msg.dashedArgs.unparsed.value.includes("d");
	let error = false;

	const start = performance.now();
	let res, o;
	try {
		// an external functions is used because typescript screws with the context and the variables
		res = await _eval.call(this, msg.unparsedArgs.join(" "), {
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
			Eris,
			uConfig,
			gConfig,
			cmd,
			Language,
			rClient
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

	if (res.indexOf(config.bot.client.token) !== -1) res = res.replace(new RegExp(config.bot.client.token, "g"), "[BOT TOKEN]");
	if (res.indexOf(config.universalKey) !== -1) res = res.replace(new RegExp(config.universalKey, "g"), "[UNIVERSAL KEY]");

	if (deleteInvoke) await msg.delete();

	if (!silent) {
		if (res.length > 1000) {
			const req = await phin({
				method: "POST",
				url: "https://pastebin.com/api/api_post.php",
				form: {
					api_dev_key: config.keys.pastebin.devKey,
					api_user_key: config.keys.pastebin.userKey,
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

		if (error) this.log("error", ![undefined, null].includes(o) ? o : res, `Shard #${msg.channel.guild.shard.id}`);

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
						value: `\`\`\`js\n${msg.unparsedArgs.join(" ")}\`\`\``,
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
					api_dev_key: config.keys.pastebin.devKey,
					api_user_key: config.keys.pastebin.userKey,
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

		return this.log("log", `Silent eval return: ${res}`, `Shard #${msg.channel.guild.shard.id}`);
	}
}));
