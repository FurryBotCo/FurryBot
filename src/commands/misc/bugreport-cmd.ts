import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import Trello from "../../util/req/Trello";
import config from "../../config";
import { Command, CommandError } from "core";
import Language from "language";

export default new Command<FurryBot, UserConfig, GuildConfig>(["bugreport", "bug"], __filename)
	.setBotPermissions([
		"attachFiles"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 1) return new CommandError("INVALID_USAGE", cmd);
		const [title, desc] = msg.args.join(" ").split("|").map(v => v.trim());
		if (!title) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.missingTitle`));
		if (!desc) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.missingDescription`));
		const t = await Trello.addCard({
			name: `Bug Report - ${title}`,
			desc: `${desc}\n\nUser: ${msg.author.tag} (${msg.author.id})\nGuild: ${msg.channel.guild.name} (${msg.channel.guild.id})`,
			idList: config.apis.trello.lists.bugreport
		}) as Record<"id" | "shortUrl", string>;
		await Trello.post({
			path: `/1/cards/${t.id}/idLabels`,
			options: {
				value: config.apis.trello.labels.unconfirmed
			}
		});
		return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.done`, [t.shortUrl]));
	});
