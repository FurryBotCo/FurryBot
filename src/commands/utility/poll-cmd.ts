import Command from "../../util/cmd/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import CommandError from "../../util/cmd/CommandError";
import time from "parse-duration";
import Time from "../../util/Functions/Time";
import Eris from "eris";
import config from "../../config";
import Language from "../../util/Language";

const maxOptions = 5;

export default new Command(["poll"], __filename)
	.setBotPermissions([])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e4, false)
	.setDonatorCooldown(2e4)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		const p = msg.args.slice(1).join(" ").split(";");
		if (msg.args.length === 0 || p.length === 0) return new CommandError("ERR_INVALID_USAGE", cmd, "NONE_PROVIDED");
		if (p.length < 2 || p.length > maxOptions) return new CommandError("ERR_INVALID_USAGE", cmd, "OPTION_COUNT");

		const d = Date.now();
		const t = time(msg.args[0], "ms");

		if (!t || t < 3e5 || t > 8.64e+7) return new CommandError("ERR_INVALID_USAGE", cmd, "INVALID_TIME");
		if (p.some(o => o.length > 200)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.optionTooLarge`));

		const m = await msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.title|${msg.author.tag}}`)
				.setDescription([
					`{lang:${cmd.lang}.time}: **${Time.ms(t, true)}**`,
					`{lang:${cmd.lang}.double}`,
					"",
					...p.map((o, i) => `${Object.values(config.emojis.default.numbers)[i]} ${o}`)
				].join("\n"))
				.setTimestamp(d + t)
				.setColor(Colors.gold)
				.setFooter(`{lang:${cmd.lang}.endsAt}`)
				.toJSON()
		});

		await Promise.all(p.map((o, i) => m.addReaction(Object.values(config.emojis.default.numbers)[i]))).catch(err => null);

		this.p.addPoll(m, p, msg.gConfig.settings.lang, d + t);
	})
	.setOverride("invalidUsage", async function (msg, cmd, err) {
		switch (err.extra) {
			case "NONE_PROVIDED":
			case "OPTION_COUNT": {
				await msg.channel.createMessage({
					embed: new EmbedBuilder(msg.gConfig.settings.lang)
						.setAuthor(msg.author.tag, msg.author.avatarURL)
						.setTitle("\u274c {lang:other.words.invalid$ucwords$} {lang:other.words.usage$ucwords$}")
						.setDescription([
							`{lang:${cmd.lang}.wrongOptionsAmount|${maxOptions}}`,
							`{lang:other.words.example$ucwords$}: \`{lang:${cmd.lang}.example|${msg.gConfig.settings.prefix}}\``
						].join("\n"))
						.setTimestamp(new Date().toISOString())
						.setColor(Colors.red)
						.toJSON()
				});
				break;
			}

			case "INVALID_TIME": {
				await msg.channel.createMessage({
					embed: new EmbedBuilder(msg.gConfig.settings.lang)
						.setAuthor(msg.author.tag, msg.author.avatarURL)
						.setTitle("\u274c {lang:other.words.invalid$ucwords$} {lang:other.words.usage$ucwords$}")
						.setDescription([
							`{lang:${cmd.lang}.invalidTime}`,
							`{lang:other.words.example$ucwords$}: \`{lang:${cmd.lang}.example|${msg.gConfig.settings.prefix}}\``
						].join("\n"))
						.setTimestamp(new Date().toISOString())
						.setColor(Colors.red)
						.toJSON()
				});
				break;
			}

			default: return "DEFAULT";
		}
	});
