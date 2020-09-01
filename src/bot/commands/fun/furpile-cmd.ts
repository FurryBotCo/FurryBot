import Command from "../../../util/cmd/Command";
import config from "../../../config";
import Eris from "eris";
import Language from "../../../util/Language";
import CommandError from "../../../util/cmd/CommandError";
import Utility from "../../../util/Functions/Utility";

export default new Command(["furpile"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {
		const h = this.v.furpile[msg.channel.id];

		if (h && msg.args.length === 0) {
			const t = h.timeout;
			clearTimeout(t);
			if (h.users.includes(msg.author.id) && !config.developers.includes(msg.author.id)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.alreadyPresent`));
			h.users.push(msg.author.id);
			h.timeout = setTimeout((ch: Eris.GuildTextableChannel) => { delete this.v.awoo[ch.id]; }, 18e5, msg.channel);
			this.v.furpile[msg.channel.id] = h;
			return msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.join`, [msg.author.id, h.users.length - 1, h.users.length, msg.gConfig.settings.prefix]));
		} else {
			if (msg.args.length < 1) return new CommandError("ERR_INVALID_USAGE", cmd);
			const m = await msg.getMemberFromArgs();
			if (!m) return msg.channel.createMessage({
				embed: Utility.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_MEMBER", true)
			});
			if (m.id === msg.author.id) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.noSelf`));
			this.v.furpile[msg.channel.id] = {
				users: [msg.author.id, m.id],
				timeout: setTimeout((ch: Eris.GuildTextableChannel) => { delete this.v.awoo[ch.id]; }, 18e5, msg.channel)
			};
			await msg.channel.createMessage(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.start`, [msg.author.id, m.id, msg.gConfig.settings.prefix]));
		}
	});
