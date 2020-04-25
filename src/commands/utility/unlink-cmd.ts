import Command from "../../util/CommandHandler/lib/Command";
import { mdb } from "../../modules/Database";

export default new Command({
	triggers: [
		"unlink"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 15e3,
	donatorCooldown: 15e3,
	features: ["devOnly"],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	return msg.reply("{lang:other.error.commandDisabled}");
	const c = await uConfig.premiumCheck();
	if (!c.active) return msg.reply(`you are not currently marked as a donator.\nTo try to look for your patreon donation, use \`${gConfig.settings.prefix}link\`.`);
	await mdb.collection("premium").findOneAndDelete(c);
	return msg.reply(`removed your donator perks.\nYou can use \`${gConfig.settings.prefix}link\` to look for them again.`);
}));
