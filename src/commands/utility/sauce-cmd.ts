import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import E621 from "../../util/req/E621";
import SauceNAO from "../../util/req/SauceNAO";
import { Command, ExtendedMessage } from "core";
import Language from "language";
import { SagiriResult } from "sagiri";
import { APIError, Post } from "e621";
import { GuildTextableChannel, Message } from "eris";
import Logger from "logger";

async function sauce(url: string, msg: ExtendedMessage<FurryBot, UserConfig, GuildConfig, GuildTextableChannel>, cmd: Command<FurryBot, UserConfig, GuildConfig>) {
	await msg.channel.sendTyping();
	let s: Array<SagiriResult>;
	try {
		s = await SauceNAO(url);
	} catch (er) {
		const err = er as Error;
		if (err.message.indexOf("file no longer exists") !== -1) {
			await msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.fileNotFound`));
			return null;
		}
		throw err;
	}
	if (s.length === 0) {
		await msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.notFoundSauceNAO`));
		return null;
	}
	let post: Post | null = null;
	try {
		post = await E621.getPostById(Number(s[0].raw.data.e621_id!)).catch(() => null);
	} catch (err) {
		if (err instanceof APIError) {
			Logger.error([`Shard #${msg.channel.guild.shard.id}`, `SauceCommand[${msg.channel.guild.id}]`], err);
			return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.error`, [err.message]));
		} else throw err;
	}
	const type = "SauceNAO" as const;
	if (post === null) {
		await msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.notFoundSauceNAO`));
		return null;
	}

	return {
		post,
		type
	};
}

export default new Command<FurryBot, UserConfig, GuildConfig>(["sauce"], __filename)
	.setBotPermissions([
		"embedLinks",
		"attachFiles"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(5e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		// I could include file extensions, but I couldn't be bothered since I only need the md5
		const e621Regex = /(?:https?:\/\/)?static\d\.(?:e621|e926)\.net\/data\/(?:sample\/)(?:[a-z\d]{2}\/){2}([a-z\d]+)\.[a-z]+/;
		const yiffyRegex = /(?:https?:\/\/)?yiff\.media\/V2\/(?:.*\/)+([a-z\d]+)\.[a-z]+/;
		let c = msg.args.join(" ");
		// for disabling embeds
		if (c.startsWith("<") && c.endsWith(">")) c = c.slice(1, -1);
		const sn = msg.dashedArgs.value.includes("saucenao");
		let post: Post | null = null, type: "SauceNAO" | "MD5";
		if (c) {
			// url
			if (/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/.test(c)) {
				const e = e621Regex.exec(c);
				const y = yiffyRegex.exec(c);
				const v = (e && e[1]) ?? (y && y[1]) ?? null;
				if (v) {
					if (sn) {
						const s = await sauce(v, msg, cmd);
						if (s === null) return;
						if (s instanceof Message) return s;
						post = s.post;
						type = s.type;
					} else {
						try {
							post = await E621.getPostByMD5(v);
						} catch (err) {
							if (err instanceof APIError) {
								Logger.error([`Shard #${msg.channel.guild.shard.id}`, `SauceCommand[${msg.channel.guild.id}]`], err);
								return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.error`, [err.message]));
							} else throw err;
						}
						type = "MD5";
						if (post === null) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.notFoundMD5`));
					}

				} else {
					const s = await sauce(c, msg, cmd);
					if (s === null) return;
					if (s instanceof Message) return s;
					post = s.post;
					type = s.type;
				}
			} else return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalidURL`));
		} else {
			if (msg.attachments.length === 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noAttachmentOrURL`));

			const s = await sauce(msg.attachments[0].url, msg, cmd);
			if (s === null) return;
			if (s instanceof Message) return s;
			post = s.post;
			type = s.type;
		}

		if (post === null) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.notFound${type}`));
		if (post.rating !== "s" && !msg.channel.nsfw) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.nsfwPost`));
		return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.found${type}`, [`https://${post.rating === "s" ? "e926" : "e621"}.net/posts/${post.id}`]));
	});
