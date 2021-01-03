import Command from "../../util/cmd/Command";
import Language from "../../util/Language";

export default new Command(["impostor", "imposter"], __filename)
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
			`    •                ${Language.get(msg.gConfig.settings.lang, `${cmd.lang}.possible`, [!v ? msg.args.join(" ") : v.nick || v.username])}　 。　.`,
			"　 　　。　　 　　　　ﾟ　　　.　    　　　."
		].join("\n"));
	});
