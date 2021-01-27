import config from "../../config";
import Command from "../../util/cmd/Command";
import CommandError from "../../util/cmd/CommandError";
import Utility from "../../util/Functions/Utility";
import Language from "../../util/Language";

export default new Command(["booster"], __filename)
	.setBotPermissions([])
	.setUserPermissions([])
	.setRestrictions([
		"supportServer"
	])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		if (!msg.member.roles.includes(config.roles.booster)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.notABooster`));
		const c = await msg.uConfig.checkPremium(true);
		if (c.active) {
			return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.alreadyActive`));
		}

		await msg.uConfig.edit({
			booster: true
		});

		return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.done`));
	});
