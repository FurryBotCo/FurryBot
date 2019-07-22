import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import { performance } from "perf_hooks";
import * as Eris from "eris";
import functions from "@util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";
import _eval from "@util/eval";
import * as fs from "fs";
import { mdb, mongo } from "@modules/Database";
import Permissions from "@util/Permissions";

export default new Command({
	triggers: [
		"eval",
		"exec",
		"ev",
		"e"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 0,
	description: "evaluate code",
	usage: "<code>",
	nsfw: false,
	devOnly: true,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	// extra check, to be safe
	if (!config.developers.includes(msg.author.id)) return msg.channel.createMessage(`<@!${msg.author.id}>, You cannot run this command as you are not a developer of this bot.`);

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
		// an external functions is used because typescript screws with the context and the variables
		res = await _eval.call(this, ev, {
			config,
			msg,
			phin,
			functions,
			util,
			fs,
			mdb,
			mongo,
			Permissions
		});
	} catch (e) {
		res = e;
		error = true;
	}
	const end = performance.now();

	if (typeof res !== "string") {
		if (typeof res === "undefined") res = "No Return";
		// else if (res instanceof Array) res = res.join(" ");
		else if (typeof res === "object") res = util.inspect(res, { depth: 3, showHidden: true });
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
					api_paste_name: "Furry Bot Eval",
					api_paste_expire_date: "1W"
				}
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
			color: error ? 16711680 : functions.randomColor(),
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
					api_paste_name: "Furry Bot Silent Eval",
					api_paste_expire_date: "1W"
				}
			});
			res = `Uploaded ${req.body.toString()}`;
		}

		return this.logger.log(`Silent shell eval return: ${res}`);
	}
}));