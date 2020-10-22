import Command from "../../util/cmd/Command";
import config from "../../config";
import Eris from "eris";
import Language from "../../util/Language";

export default new Command(["awoo"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {
		const h = this.v.awoo[msg.channel.id];

		if (h) {
			const t = h.timeout;
			clearTimeout(t);
			if (h.users.includes(msg.author.id) && !config.developers.includes(msg.author.id)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.alreadyPresent`));
			h.users.push(msg.author.id);
			h.timeout = setTimeout((ch: Eris.GuildTextableChannel) => {
				delete this.v.awoo[ch.id];
			}, 18e5, msg.channel);
			this.v.awoo[msg.channel.id] = h;
			return msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.join`, [msg.author.id, h.users.length, msg.gConfig.settings.prefix, h.users.length > 30 ? Language.get(msg.gConfig.settings.lang, `${cmd.lang}.tooLarge`) : `<:${config.emojis.custom.awoo}>`.repeat(h.users.length)]));
		} else {
			this.v.awoo[msg.channel.id] = {
				users: [msg.author.id],
				timeout: setTimeout((ch: Eris.GuildTextableChannel) => {
					delete this.v.awoo[ch.id];
				}, 18e5, msg.channel)
			};
			await msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.start`, [msg.author.id, msg.gConfig.settings.prefix, `<:${config.emojis.custom.awoo}>`]));
		}
	});
