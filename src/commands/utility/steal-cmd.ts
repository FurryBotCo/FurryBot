import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import config from "../../config";
import { Command, CommandError } from "core";
import Language from "language";
import fetch from "node-fetch";
import Tinify from "tinify";
import { DiscordHTTPError, Message } from "eris";
import Logger from "logger";
import { URL } from "url";
Tinify.key = config.apis.tinify;

export default new Command<FurryBot, UserConfig, GuildConfig>(["steal"], __filename)
	.setBotPermissions([])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 1) return new CommandError("INVALID_USAGE", cmd);
		const e = /(?:<a?:(.*):)?([0-9]{15,21})(?:>)?/i.exec(msg.args[0]);

		// https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)
		const id = e?.[2];
		let name = msg.args.slice(1).join(" ") || e?.[1] || id, m: Message | undefined;

		if (!id) {
			if (/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/.test(msg.args[0])) {
				const url = new URL(msg.args[0]);
				if (!name) name = url.pathname.substring(url.pathname.lastIndexOf("/") + 1).replace(/\.(png|jpe?g|gif|webp)/, "").slice(0, 32);
				m = await msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.fetching`));
				await msg.channel.sendTyping();
			} else return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalid`));
		}

		if (!name) name = "Unknown";

		const img = await fetch(`https://proxy-request.yiff.workers.dev?url=${encodeURIComponent(!id ? msg.args[0] : `https://cdn.discordapp.com/emojis/${id}`)}`, {
			headers: {
				"Authorization": config.apis.proxyReq,
				"User-Agent": config.web.userAgent
			}
		});
		const og = await img.buffer();
		let b: Uint8Array;
		if (og.byteLength > 256000) {
			if (m) await m.edit(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.resizing`));
			try {
				b = await Tinify.fromBuffer(og).toBuffer();
			} catch (err) {
				if (m) await m.delete();
				await msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.compressionError`));
				Logger.error([`Shard #${msg.channel.guild.shard.id}`], `Error while running Tinify for the url "${img.url}",`, err);
				return;
			}
		} else b = og;

		if (name.length < 2 || name.length > 32) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.nameLength`));

		if (m) await m.delete();
		if (img.status !== 200) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalid`));

		await msg.channel.guild.createEmoji({
			name,
			image: `data:${img.headers.get("Content-Type")!};base64,${Buffer.from(b).toString("base64")}`
		}, encodeURIComponent(`steal command: ${msg.author.tag} (${msg.author.id})`)).then(j =>
			msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.success`, [`<${j.animated ? "a" : ""}:${j.name}:${j.id}>`, j.name]))
		).catch(error  => {
			const err = error as Error | DiscordHTTPError;
			if ("code" in err) switch (err.code) {
				case 30008: return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.tooMany`, [((/\((\d+)\)/.exec(err.message)) ?? [0])[1]]));
				case 50035: {
					if (err.message.indexOf("File cannot be larger than 256.0 kb") !== -1) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.size`));
					if (err.message.indexOf("name: String value did not match validation regex.") !== -1) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalidName`));
					break;
				}
			}
			return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.fail`, [`${err.name}: ${err.message}`]));
		});
	});
