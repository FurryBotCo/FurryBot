import config from "../../config";
import Command from "../../util/cmd/Command";
import CommandError from "../../util/cmd/CommandError";
import Language from "../../util/Language";
import Trello from "../../util/Trello";

export default new Command(["bugreport"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(9e5, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 1) return new CommandError("ERR_INVALID_USAGE", cmd);
		const [title, desc] = msg.args.join(" ").split("|").map(v => v.trim());
		if (!title) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.missingTitle`));
		if (!desc) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.missingDescription`));
		const t = await Trello.addCard({
			name: `Bug Report - ${title}`,
			desc: `${desc}\n\nUser: ${msg.author.tag} (${msg.author.id})\nGuild: ${msg.channel.guild.name} (${msg.channel.guild.id})`,
			idList: config.apis.trello.lists.bugreport
		});
		await Trello.post({
			path: `/1/cards/${t.id}/idLabels`,
			options: {
				value: config.apis.trello.labels.unconfirmed
			}
		});
		return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.done`, [t.shortUrl]));
	});
