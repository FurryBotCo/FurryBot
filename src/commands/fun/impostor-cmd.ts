import FurryBot from "../../main";
import UserConfig from "../../db/Models/UserConfig";
import GuildConfig from "../../db/Models/GuildConfig";
import { Command } from "core";
import Language from "language";

export default new Command<FurryBot, UserConfig, GuildConfig>(["impostor", "imposter"], __filename)
	.setBotPermissions([])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		const v = msg.args.length === 0 ? msg.member : await msg.getMemberFromArgs();
		return msg.channel.createMessage([
			"。　　　　•　    　ﾟ　　。",
			" 　　.　　　.　　　  　　.　　　　　。　　   。　.",
			" 　.　　      。　        ඞ   。　    .    •",
			// eslint-disable-next-line no-irregular-whitespace
			`    •                ${Language.get(msg.gConfig.settings.lang, `${cmd.lang}.possible`, [!v ? msg.args.join(" ") : v.nick || v.username], false, true)}　 。　.`,
			"　 　　。　　 　　　　ﾟ　　　.　    　　　."
		].join("\n"));
	});
