import config from "../../../config";
import Command from "../../../util/cmd/Command";
import CommandError from "../../../util/cmd/CommandError";
import Language from "../../../util/Language";
import Trello from "../../../util/Trello";

export default new Command(["todo"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([
		"developer"
	])
	.setCooldown(0, true)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 1) return new CommandError("ERR_INVALID_USAGE", cmd);
		const name = msg.args.join(" ").trim();
		if (!name) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.missingTitle`));
		const t = await Trello.addCard({
			name,
			desc: `Add more info here, or in the comments..\n\nUser: ${msg.author.tag} (${msg.author.id})\nGuild: ${msg.channel.guild.name} (${msg.channel.guild.id})`,
			idList: config.apis.trello.lists.suggestions
		});
		return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.done`, [t.shortUrl]));
	});
