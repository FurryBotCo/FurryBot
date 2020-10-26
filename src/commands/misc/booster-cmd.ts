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
	.setExecutor(async function (msg, cmd) {
		if (!msg.member.roles.includes(config.roles.booster)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.notABooster`));
		const check = await msg.uConfig.checkBooster();
		// await msg.channel.createMessage(`\`\`\`json\n${JSON.stringify(check, null, "  ")}\n\`\`\``);

		if (check.active) {
			const d = new Date(check.expiry);
			return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.alreadyActive`, [`${Language.get(msg.gConfig.settings.lang, `other.months.${d.getMonth()}`)} ${d.getDate()}, ${d.getFullYear()}`]));
		}

		const d = new Date().setHours(0, 0, 0, 0);

		await msg.uConfig.edit({
			booster: {
				active: true,
				expiry: new Date(d + 8.64e+8).toISOString()
			}
		});

		return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.done`));
	});
