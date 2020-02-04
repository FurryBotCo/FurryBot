import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import { Colors } from "../../util/Constants";
import Eris from "eris";
import { Internal } from "../../util/Functions";
import config from "../../config";
import { mdb } from "../../modules/Database";

export default new Command({
	triggers: [
		"unlink"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 15e3,
	donatorCooldown: 15e3,
	description: "Remove your donor perks.",
	usage: "",
	features: ["devOnly"],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	const c = await msg.uConfig.premiumCheck();
	if (!c.active) return msg.reply(`you are not currently marked as a donator.\nTo try to look for your patreon donation, use \`${msg.gConfig.settings.prefix}link\`.`);
	await mdb.collection("premium").findOneAndDelete(c);
	return msg.reply(`removed your donator perks.\nYou can use \`${msg.gConfig.settings.prefix}link\` to look for them again.`);
}));
