import Command from "../../util/cmd/Command";
import { Colors } from "../../util/Constants";
import EmbedBuilder from "../../util/EmbedBuilder";
import { execSync } from "child_process";
import util from "util";
import Request from "../../util/Functions/Request";
import Logger from "../../util/Logger";
import { performance } from "perf_hooks";
import config from "../../config";

export default new Command(["shell", "sh"], __filename)
	.setBotPermissions([])
	.setUserPermissions([])
	.setRestrictions(["developer"])
	.setCooldown(0, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		const
			silent = !!msg.dashedArgs.value.includes("silent"),
			deleteInvoke = !!msg.dashedArgs.value.includes("delete");
		let error = false;
		const start = performance.now();
		let res;
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
			else res = res.toString();
		}

		if (deleteInvoke) await msg.delete();
		if (!silent) {

			if (res.length > 1000) {
				const link = await Request.createPaste(res, "FurryBot Shell Execution", "1H", 1);
				res = `Uploaded ${link}`;
			}

			return msg.channel.createMessage({
				embed: new EmbedBuilder(config.devLanguage)
					.setTitle(`Evaluated in \`${(end - start).toFixed(3)}ms\``)
					.setAuthor(msg.author.tag, msg.author.avatarURL)
					.setTimestamp(new Date().toISOString())
					.setColor(error ? Colors.red : Colors.gold)
					.addField(":inbox_tray: Input", `\`\`\`bash\n${msg.args.join(" ").slice(0, 1000)}\`\`\``, false)
					.addField(":outbox_tray: Output", `\`\`\`bash\n${res}\`\`\``, false)
					.toJSON()
			});
		} else {
			if (res.length > 3000) {
				const link = await Request.createPaste(res, "FurryBot Silent Shell Execution", "1H", 2);
				res = `Uploaded ${link}`;
			}

			Logger.log([`Shard #${msg.channel.guild.id}`, "Silent Shell Execution Result"], res);
		}
	});
