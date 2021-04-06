import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import Trello from "../../util/req/Trello";
import config from "../../config";
import { Command, CommandError, EmbedBuilder } from "core";
import Language from "language";

export default new Command<FurryBot, UserConfig, GuildConfig>(["suggest"], __filename)
	.setBotPermissions([
		"attachFiles"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(9e5, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 1) return new CommandError("INVALID_USAGE", cmd);
		const [title, desc] = msg.args.join(" ").split("|").map(v => v.trim());
		if (!title) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.missingTitle`));
		const t = await Trello.addCard({
			name: `Suggestion - ${title}`,
			desc: `${desc || title}\n\nUser: ${msg.author.tag} (${msg.author.id})\nGuild: ${msg.channel.guild.name} (${msg.channel.guild.id})`,
			idList: config.apis.trello.lists.suggestions
		}) as { id: string; shortUrl: string; };
		await Trello.post({
			path: `/1/cards/${t.id}/idLabels`,
			options: {
				value: config.apis.trello.labels.unapproved
			}
		});
		const v = await this.w.get("suggestions")!.execute({
			embeds: [
				new EmbedBuilder(config.devLanguage)
					.setTitle(`Suggestion by ${msg.author.tag} from guild ${msg.channel.guild.name}`)
					.setThumbnail(msg.author.avatarURL)
					.setDescription(`${title}${desc ? `\n\n${desc}` : ""}`)
					.setFooter(`User ID: ${msg.author.id} | Guild ID: ${msg.channel.guild.id}`)
					.setTimestamp(new Date().toISOString())
					.toJSON()
			]
		});
		/* eslint-disable deprecation/deprecation */
		await v.addReaction(config.emojis.custom.upvote).catch(() => null);
		await v.addReaction(config.emojis.custom.downvote).catch(() => null);
		/* eslint-enable deprecation/deprecation */
		return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.done`, [t.shortUrl, config.client.socials.discord]));
	});
