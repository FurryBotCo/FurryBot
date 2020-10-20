import Command from "../../util/cmd/Command";
import Language from "../../util/Language";

export default new Command(["dice"], __filename)
	.setBotPermissions([])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {
		const min = typeof msg.args[0] !== "undefined" ? Number(msg.args[0]) : 1;
		const max = typeof msg.args[1] !== "undefined" ? Number(msg.args[1]) : 20;

		if (min > max) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.minLess`));
		return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.text`, [Math.floor(Math.random() * (max - min)) + min]));
	});
