import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import config from "../../config";
import { Colors, Command, EmbedBuilder } from "core";
import Logger from "logger";
import { Request } from "utilities";
import util from "util";
import { performance } from "perf_hooks";
import { execSync } from "child_process";


export default new Command<FurryBot, UserConfig, GuildConfig>(["shell", "sh"], __filename)
	.setBotPermissions([])
	.setUserPermissions([])
	.setRestrictions([
		"developer"
	])
	.setCooldown(0, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg) {
		const
			silent = !!msg.dashedArgs.value.includes("silent"),
			deleteInvoke = !!msg.dashedArgs.value.includes("delete");
		let error = false;
		const start = performance.now();
		let res: unknown;
		try {
			res = execSync(msg.args.join(" ")).toString();
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
			else res = String(res).toString();
		}

		if (deleteInvoke) await msg.delete();
		if (!silent) {

			if (String(res).length > 1000) {
				const link = await Request.createPaste(String(res), "FurryBot Shell Execution", "1H", 2);
				res = `Uploaded ${link}`;
			}

			return msg.channel.createMessage({
				embed: new EmbedBuilder(config.devLanguage)
					.setTitle(`Evaluated in \`${(end - start).toFixed(3)}ms\``)
					.setAuthor(msg.author.tag, msg.author.avatarURL)
					.setTimestamp(new Date().toISOString())
					.setColor(error ? Colors.red : Colors.gold)
					.addField(":inbox_tray: Input", `\`\`\`bash\n${msg.args.join(" ").slice(0, 1000)}\`\`\``, false)
					.addField(":outbox_tray: Output", `\`\`\`bash\n${String(res)}\`\`\``, false)
					.toJSON()
			});
		} else {
			if (String(res).length > 3000) {
				const link = await Request.createPaste(String(res), "FurryBot Silent Shell Execution", "1H", 2);
				res = `Uploaded ${link}`;
			}

			Logger.log([`Shard #${msg.channel.guild.id}`, "Silent Shell Execution Result"], res);
		}
	});
