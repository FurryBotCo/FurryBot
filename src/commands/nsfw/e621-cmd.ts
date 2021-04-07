import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import { Redis } from "../../db";
import E621 from "../../util/req/E621";
import config from "../../config";
import { Colors, Command, defaultEmojis, EmbedBuilder } from "core";
import Language from "language";
import Eris from "eris";

export default new Command<FurryBot, UserConfig, GuildConfig>(["e621", "e6"], __filename)
	.setBotPermissions([
		"embedLinks",
		"attachFiles"
	])
	.setUserPermissions([])
	.setRestrictions([
		"nsfw"
	])
	.setCooldown(1e4, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		if (Redis === null) return msg.reply(Language.get(msg.gConfig.settings.lang, "other.errors.redisNotReady"));
		const a = await Redis.smembers("cmd:e621:active");
		// because we can't have nice things without jackasses ruining it,
		// this has to have a ratelimiting system
		if (a.includes(msg.channel.id)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.alreadyRunning`, [defaultEmojis.stop]));
		if (!msg.channel.permissionsOf(this.bot.user.id).has("manageMessages")) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.permsRequired`));
		let slice = msg.args.length;
		if (msg.slash) {
			if (/(true|false)/.exec(msg.args[msg.args.length - 2]) && /(true|false)/.exec(msg.args[msg.args.length - 1])) {
				// both provided
				if (msg.args[msg.args.length - 2] === "true") msg.dashedArgs.value.push("no-flash");
				if (msg.args[msg.args.length - 1] === "true") msg.dashedArgs.value.push("no-video");
				slice -= 2;
			} else {
				// only one provided
				if (msg.args[msg.args.length - 1] === "true") msg.dashedArgs.value.push("no-flash");
				slice--;
			}
		}

		const noVideo = msg.dashedArgs.value.includes("no-video");
		const noFlash = msg.dashedArgs.value.includes("no-flash");
		const t = [...msg.args.slice(0, slice)];
		let ratelimited = false, rlTimeout: NodeJS.Timeout | null = null;
		if (t.every(j => j.indexOf("order:") === -1)) t.push("order:favcount");
		if (noVideo) t.push("-type:webm");
		if (noFlash) t.push("-type:swf");
		const img = await E621.getPosts(t, 50).then(v => v.filter(p =>
			noVideo && p.file.ext === "webm" ? false :
				noFlash && p.file.ext === "swf" ? false :
					true));
		if (img.length === 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noPosts`));

		const reactions = [defaultEmojis.arrows.right, defaultEmojis.stop, defaultEmojis.arrows.left];
		let v = 0;
		const e = new EmbedBuilder(msg.gConfig.settings.lang)
			.setTitle(`{lang:${cmd.lang}.title}`)
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setFooter("OwO", this.bot.user.avatarURL)
			.setTimestamp(new Date().toISOString())
			.setColor(Colors.gold)
			.setDescription(`{lang:${cmd.lang}.loading}`);

		const m = await msg.channel.createMessage({
			embed: e.toJSON()
		});
		// eslint-disable-next-line deprecation/deprecation
		for (const r of reactions) await m.addReaction(r);
		await Redis.sadd("cmd:e621:active", msg.channel.id);
		function filtering() {
			return [
				`**{lang:${cmd.lang}.filterTitle}**`,
				noVideo || noFlash || msg.slash ? "" : `{lang:${cmd.lang}.filterNote}`,
				"",
				`{lang:${cmd.lang}.videoFilter}: <:${config.emojis.custom[noVideo ? "greenTick" : "redTick"]}>`,
				`{lang:${cmd.lang}.flashFilter}: <:${config.emojis.custom[noFlash ? "greenTick" : "redTick"]}>`,
				"\u200b",
				"\u200b",
				"\u200b"
			].join("\n");
		}
		const setPost = (async (index: number, limit?: boolean) => {
			if (typeof limit === "undefined" || limit === true) {
				if (ratelimited) {
					return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.ratelimited`));
				} else {
					ratelimited = true;
					rlTimeout = setTimeout(() => {
						ratelimited = false;
						rlTimeout = null;
					}, 3e3);
				}
			}
			const p = img[index];
			e.setFooter(`{lang:${cmd.lang}.num|${index + 1}|${img.length}}`, this.bot.user.avatarURL);
			if (p.file.ext === "webm") e.removeImage().setDescription(`${filtering()}{lang:${cmd.lang}.video|https://e621.net/posts/${p.id}}`);
			else e.setImage(p.file.url).setDescription(`${filtering()}{lang:${cmd.lang}.post|https://e621.net/posts/${p.id}}`);
			await m.edit({
				embed: e.toJSON()
			}).catch(() => null);
		});

		await setPost(0);
		const remove = (async () => {
			if (int) clearTimeout(int);
			if (rlTimeout) clearTimeout(rlTimeout);
			await Redis!.srem("cmd:e621:active", msg.channel.id);
			e.setFooter(`{lang:${cmd.lang}.inactive}`);
			await m.edit({
				embed: e.toJSON()
			}).catch(() => null);
			this.bot.off("messageReactionAdd", f);
			await m.removeReactions().catch(() => null);
		});

		let int = setTimeout(remove, 6e4);

		async function reactionHandler(this: FurryBot, message: Eris.PossiblyUncachedMessage, emoji: Eris.Emoji, reactor: Eris.Member | string) {
			if (reactor instanceof Eris.Member) reactor = reactor.id;
			if (message.id !== m.id) return;
			await m.removeReaction(emoji.id || emoji.name, reactor);
			if (!reactions.includes(emoji.name) || reactor !== msg.author.id) return;
			switch (emoji.name) {
				case reactions[0]: { // back
					v--;
					if (v < 0) v = img.length - 1;
					await setPost(v);
					break;
				}

				case reactions[1]: { // stop
					return remove();
					break;
				}

				case reactions[2]: { // next
					v++;
					if (v >= img.length) v = 0;
					await setPost(v);
					break;
				}

				default: return;
			}

			int = setTimeout(remove, 6e4);
		}

		// need a reference to the exact listener we used
		const f = reactionHandler.bind(this);

		this.bot.on("messageReactionAdd", f);
	});
