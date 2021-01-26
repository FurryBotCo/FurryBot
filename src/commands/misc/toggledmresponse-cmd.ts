import Command from "../../util/cmd/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import Redis from "../../util/Redis";
import Language from "../../util/Language";

export default new Command(["toggledmresponse"], __filename)
	.setBotPermissions([])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		await msg.uConfig.edit({
			dmResponse: !msg.uConfig.dmResponse
		});

		return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.${msg.uConfig.dmResponse === true ? "on" : "off"}`));
	});
