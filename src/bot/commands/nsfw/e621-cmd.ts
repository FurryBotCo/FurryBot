import Command from "../../../util/cmd/Command";
import EmbedBuilder from "../../../util/EmbedBuilder";
import { Colors } from "../../../util/Constants";
import E6API from "../../../util/req/E6API";
import Language from "../../../util/Language";
import config from "../../../config";
import FurryBot from "../..";
import Eris from "eris";

export default new Command(["e621", "e6"], __filename)
	.setBotPermissions([
		"embedLinks",
		"attachFiles"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {
		// because we can't have nice things without jackasses ruining it,
		// this has to have a ratelimiting system
		if (this.e6Active.includes(msg.channel.id)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.alreadyRunning`, [config.emojis.default.stop]));
		if (!msg.channel.permissionsOf(this.bot.user.id).has("manageMessages")) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.permsRequired`));
		const noVideo = msg.dashedArgs.value.includes("no-video");
		const noFlash = msg.dashedArgs.value.includes("no-flash");
		const t = [...msg.args];
		let ratelimited = false, rlTimeout: NodeJS.Timeout = null;
		if (t.every(j => j.indexOf("order") === -1)) t.push("order:favcount");
		if (noVideo) t.push("-type:webm");
		else if (noFlash) t.push("-type:swf");
		const img = await E6API.listPosts(t, 50, null, null, config.apis.e621.blacklistedTags).then(v => v.filter(p =>
			noVideo && p.file.ext === "webm" ? false :
				noFlash && p.file.ext === "swf" ? false :
					true));
		if (img.length === 0) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noPosts`));

		const reactions = [config.emojis.default.arrows.right, config.emojis.default.stop, config.emojis.default.arrows.left];
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
		for (const r of reactions) await m.addReaction(r);
		this.e6Active.push(msg.channel.id);
		function filtering() {
			return [
				`**{lang:${cmd.lang}.filterTitle}**`,
				`{lang:${cmd.lang}.filterNote}`,
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
			});
		});

		await setPost(0);
		const remove = (async () => {
			if (int) clearTimeout(int);
			if (rlTimeout) clearTimeout(rlTimeout);
			this.e6Active.splice(this.e6Active.indexOf(msg.channel.id), 1);
			e.setFooter(`{lang:${cmd.lang}.inactive}`);
			await m.edit({
				embed: e.toJSON()
			});
			this.bot.off("messageReactionAdd", f);
			await m.removeReactions().catch(err => null);
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
