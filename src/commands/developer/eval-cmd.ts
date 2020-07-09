import Command from "../../modules/CommandHandler/Command";
import config from "../../config";
import _eval from "../../util/eval";
import phin from "phin";
import util from "util";
import * as Eris from "eris";
import * as fs from "fs";
import { db, mdb, mongo } from "../../modules/Database";
import * as os from "os";
import { performance } from "perf_hooks";
import * as F from "../../util/Functions";
import Language from "../../util/Language";
import { Permissions } from "../../util/Constants";
import { Redis } from "../../modules/External";
import Logger from "../../util/LoggerV10";
import truncate from "truncate";
import EmbedBuilder from "../../util/EmbedBuilder";

export default new Command({
	triggers: [
		"eval",
		"ev",
		"exec"
	],
	permissions: {
		user: [],
		bot: []
	},
	cooldown: 0,
	donatorCooldown: 0,
	restrictions: ["developer"],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const
		silent = msg.dashedArgs.unparsed.value.includes("s"),
		deleteInvoke = msg.dashedArgs.unparsed.value.includes("d");
	let error = false, res, o, stack;

	const start = performance.now();
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
			Redis,
			Logger
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
			if (j && j !== res.toString()) {
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

	if (res.indexOf(config.client.token) !== -1) res = res.replace(new RegExp(config.client.token, "g"), "[BOT TOKEN]");
	if (res.indexOf(config.universalKey) !== -1) res = res.replace(new RegExp(config.universalKey, "g"), "[UNIVERSAL KEY]");

	if (deleteInvoke) await msg.delete();

	if (!silent) {
		if (res.length > 1000) {
			const pasteURL = await F.Internal.makePastebinPost(res, "2", "Furry Bot Eval", "1D");
			res = `Uploaded ${pasteURL}`;
		}

		if (error) {
			this.log("error", ![undefined, null].includes(o) ? o : res, `Shard #${msg.channel.guild.shard.id}`);
			const st: string[] = o.stack.split("\n");
			let i = 0;
			if (!stack) stack = "";

			// extra 50 for padding
			for (const line of st) if ((res.length + 50) + stack.length < 950) (stack += `\n${line}`, ++i);
			if (st.length !== i) stack += `\n(...) and ${st.length - i} more lines`;
		}

		return msg.channel.createMessage({
			embed: new EmbedBuilder(config.defaults.config.guild.settings.lang)
				.setTitle(`Evaluated in \`${(end - start).toFixed(3)}ms\``)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setTimestamp(new Date().toISOString())
				.setColor(error ? 16711680 : Math.floor(Math.random() * 0xFFFFFF))
				.addField(":inbox_tray: Input", `\`\`\`js\n${truncate(msg.unparsedArgs.join(" "), 1000)}\`\`\``, false)
				.addField(":outbox_tray: Output", `\`\`\`js\n${res}\`\`\`${error && res.indexOf("Uploaded") === -1 ? `\n[stack (hover)](https://furry.bot '${stack}')` : ""}`, false)
				.toJSON()
		});
	} else {
		if (res.length > 3000) {
			const pasteURL = await F.Internal.makePastebinPost(res, "2", "Furry Bot Silent Eval", "1D");
			res = pasteURL;
		}

		return this.log("log", `Silent eval return: ${res}`, `Shard #${msg.channel.guild.shard.id}`);
	}
}));
