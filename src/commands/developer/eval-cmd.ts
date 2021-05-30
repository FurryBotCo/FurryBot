import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import config from "../../config";
import db, { rdb, Redis } from "../../db";
import { Colors, Command, CommandError, EmbedBuilder, EvalUtil } from "core";
import Language from "language";
import * as fs from "fs-extra";
import Eris from "eris";
import Logger from "logger";
import { Internal, Request, Strings, Time, Utility } from "utilities";
import util from "util";
import { performance } from "perf_hooks";


export default new Command<FurryBot, UserConfig, GuildConfig>(["eval", "ev"], __filename)
	.setBotPermissions([])
	.setUserPermissions([])
	.setRestrictions([
		"developer"
	])
	.setCooldown(0, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length === 0) return new CommandError("INVALID_USAGE", cmd);
		const
			silent = !!msg.dashedArgs.value.includes("silent"),
			deleteInvoke = !!msg.dashedArgs.value.includes("delete");
		let error = false, res: unknown, o, stack;

		const start = performance.now();
		try {
			// an external functions is used because typescript screws with the context and the variables
			res = await EvalUtil.call(this, msg.args.join(" "), {
				config,
				msg,
				util,
				fs,
				db,
				rdb,
				Eris,
				cmd,
				Language,
				Redis,
				Logger,
				Internal,
				Request,
				Strings,
				Time,
				Utility,
				EmbedBuilder
			});
		} catch (e) {
			res = e;
			error = true;
		}
		const end = performance.now();
		if (typeof res !== "string") {
			if (typeof res === "undefined") res = "No Return";
			else {
				const j = res instanceof Object ? Utility.toStringFormat(res, config.toStringFormatNames) : null;
				if (j && j !== String(res).toString()) {
					if (res instanceof Error) (error = true, o = res); // eslint-disable-line @typescript-eslint/no-unused-expressions
					res = j;
				} else if (typeof res === "object") res = util.inspect(res, { depth: 2, showHidden: true });
				else if (res instanceof Promise) res = await res;
				else if (res instanceof Function) res = res.toString();
				else if (res instanceof Buffer) res = res.toString();
				else res = String(res).toString();
			}
		}

		if (String(res).indexOf(config.client.token) !== -1) res = String(res).replace(new RegExp(config.client.token, "g"), "[BOT TOKEN]");

		if (deleteInvoke) await msg.delete();

		if (!silent) {
			if (String(res).length > 1000) {
				const pasteURL = await Request.createPaste(String(res), "FurryBot Eval", "1H", 2);
				res = `Uploaded ${pasteURL}`;
			}

			if (error) {
				Logger.error(`Shard #${msg.channel.guild.shard.id}`, !o ? res : o);
				const st: Array<string> = (o as Error)!.stack!.split("\n");
				let i = 0;
				if (!stack) stack = "";

				// extra 50 for padding
				for (const line of st) if ((String(res).length + 50) + stack.length < 950) (stack += `\n${line}`, ++i); // eslint-disable-line @typescript-eslint/no-unused-expressions
				if (st.length !== i) stack += `\n(...) and ${st.length - i} more lines`;
			}

			return msg.channel.createMessage({
				embed: new EmbedBuilder(config.devLanguage)
					.setTitle(`Evaluated in \`${(end - start).toFixed(3)}ms\``)
					.setAuthor(msg.author.tag, msg.author.avatarURL)
					.setTimestamp(new Date().toISOString())
					.setColor(error ? Colors.red : Colors.furry)
					.addField(":inbox_tray: Input", `\`\`\`js\n${msg.args.join(" ").slice(0, 1000)}\`\`\``, false)
					.addField(":outbox_tray: Output", `\`\`\`js\n${String(res)}\`\`\`${error && String(res).indexOf("Uploaded") === -1 ? `\n[stack (hover)](https://furry.bot '${stack === undefined ? "" : stack.replace(/'/g, "\u0060")}')` : ""}`, false)
					.toJSON()
			});
		} else {
			if (String(res).length > 3000) {
				const pasteURL = await Request.createPaste(String(res), "FurryBot Silent Eval", "1H", 2);
				res = pasteURL;
			}

			return Logger.log(`Shard #${msg.channel.guild.shard.id}`, `Silent eval return: ${String(res)}`);
		}
	});
