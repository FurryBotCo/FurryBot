import Command from "../../util/cmd/Command";
import CommandError from "../../util/cmd/CommandError";
import Language from "../../util/Language";
import config from "../../config";
import EvalUtil from "../../util/EvalUtil";
import * as fs from "fs-extra";
import db, { mdb, mongo } from "../../util/Database";
import Internal from "../../util/Functions/Internal";
import Request from "../../util/Functions/Request";
import Strings from "../../util/Functions/Strings";
import Time from "../../util/Functions/Time";
import Utility from "../../util/Functions/Utility";
import * as Eris from "eris";
import Redis from "../../util/Redis";
import Logger from "../../util/Logger";
import util from "util";
import EmbedBuilder from "../../util/EmbedBuilder";
import { performance } from "perf_hooks";
import EconomyUtil from "../../util/EconomyUtil";

export default new Command(["eval", "ev"], __filename)
	.setBotPermissions([])
	.setUserPermissions([])
	.setRestrictions(["developer"])
	.setCooldown(0, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length === 0) return new CommandError("ERR_INVALID_USAGE", cmd);
		const
			silent = !!msg.dashedArgs.value.includes("silent"),
			deleteInvoke = !!msg.dashedArgs.value.includes("delete");
		let error = false, res, o, stack;

		const start = performance.now();
		try {
			// an external functions is used because typescript screws with the context and the variables
			res = await EvalUtil.call(this, msg.args.join(" "), {
				config,
				msg,
				util,
				fs,
				db,
				mdb,
				mongo,
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
				EconomyUtil,
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
				const j = res instanceof Object ? Utility.toStringFormat(res) : null;
				if (j && j !== res.toString()) {
					if (res instanceof Error) (error = true, o = res); // eslint-disable-line @typescript-eslint/no-unused-expressions
					res = j;
				} else if (typeof res === "object") res = util.inspect(res, { depth: 2, showHidden: true });
				else if (res instanceof Promise) res = await res;
				else if (res instanceof Function) res = res.toString();
				else if (res instanceof Buffer) res = res.toString();
				else res = res.toString();
			}
		}

		if (res.indexOf(config.client.token) !== -1) res = res.replace(new RegExp(config.client.token, "g"), "[BOT TOKEN]");

		if (deleteInvoke) await msg.delete();

		if (!silent) {
			if (res.length > 1000) {
				const pasteURL = await Request.createPaste(res, "FurryBot Eval", "1H", 1);
				res = `Uploaded ${pasteURL}`;
			}

			if (error) {
				Logger.error(`Shard #${msg.channel.guild.shard.id}`, ![undefined, null].includes(o) ? o : res);
				const st: string[] = o.stack.split("\n");
				let i = 0;
				if (!stack) stack = "";

				// extra 50 for padding
				for (const line of st) if ((res.length + 50) + stack.length < 950) (stack += `\n${line}`, ++i); // eslint-disable-line @typescript-eslint/no-unused-expressions
				if (st.length !== i) stack += `\n(...) and ${st.length - i} more lines`;
			}

			return msg.channel.createMessage({
				embed: new EmbedBuilder(config.defaults.config.guild.settings.lang as any)
					.setTitle(`Evaluated in \`${(end - start).toFixed(3)}ms\``)
					.setAuthor(msg.author.tag, msg.author.avatarURL)
					.setTimestamp(new Date().toISOString())
					.setColor(error ? 16711680 : Math.floor(Math.random() * 0xFFFFFF))
					.addField(":inbox_tray: Input", `\`\`\`js\n${msg.args.join(" ").slice(0, 1000)}\`\`\``, false)
					.addField(":outbox_tray: Output", `\`\`\`js\n${res}\`\`\`${error && res.indexOf("Uploaded") === -1 ? `\n[stack (hover)](https://furry.bot '${stack.replace(/'/g, "\u0060")}')` : ""}`, false)
					.toJSON()
			});
		} else {
			if (res.length > 3000) {
				const pasteURL = await Request.createPaste(res, "FurryBot Silent Eval", "1H", 2);
				res = pasteURL;
			}

			return Logger.log(`Shard #${msg.channel.guild.shard.id}`, `Silent eval return: ${res}`);
		}
	});
