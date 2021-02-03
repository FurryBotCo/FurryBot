import Eris from "eris";
import { f } from "yiffy";
import FurryBot from "../../main";
import Command from "../../util/cmd/Command";
import CommandError from "../../util/cmd/CommandError";
import { Colors } from "../../util/Constants";
import DiscordSlashCommands from "../../util/DiscordCommands/types";
import EmbedBuilder from "../../util/EmbedBuilder";
import Time from "../../util/Functions/Time";
import Utility from "../../util/Functions/Utility";
import Language from "../../util/Language";

export default new Command(["remindme", "reminder"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		async function makeReply(this: FurryBot, content: Eris.MessageContent) {
			if (msg.slash) {
				if (typeof content === "string") content = { content };
				if (content.embed) (content as DiscordSlashCommands.InteractionApplicationCommandCallbackData).embeds = [content.embed];
				return this.h.createFollowupResponse(this.bot.user.id, msg.slashInfo.token, content);
			} else return msg.reply(content);
		}
		if (msg.args.length === 0) return new CommandError("ERR_INVALID_USAGE", cmd);
		let t = Time.parseTime(msg.args.join(" "));

		if (!t || t < 1000) return makeReply.call(this, Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalidTime`));
		// round to nearest second
		t = Math.round(t / 1000) * 1000;

		// kill me
		const l = msg.args
			.join(" ")
			.split(",")
			.map(v =>
				v
					.replace(/and/gi, "")
					.trim()
					.split(" ")
					.slice(0, 2)
			)
			.slice(-1)[0]
			.join(" "),

			index = msg.args
				.join(" ")
				.indexOf(l),

			reason = msg.args.join(" ").slice(index + l.length).trim();

		const r = {
			channel: msg.channel.id,
			time: t,
			end: new Date(Date.now() + t).toISOString(),
			reason
		};

		await msg.uConfig.mongoEdit({
			$push: {
				reminders: r
			}
		});

		return makeReply.call(this, {
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.title}`)
				.setDescription(`{lang:${cmd.lang}.desc|${Time.ms(t)}}`)
				.setColor(Colors.gold)
				.toJSON()
		});
	});
