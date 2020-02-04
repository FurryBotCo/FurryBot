import SubCommand from "../../../util/CommandHandler/lib/SubCommand";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import { mdb } from "../../../modules/Database";

export default new SubCommand({
	triggers: [
		"remove"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles",
		"embedLinks"
	],
	cooldown: 3e3,
	donatorCooldown: 3e3,
	description: "Disable premium in this server",
	usage: "",
	features: ["donatorOnly"],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	// @FIXME auto remove on user leave
	const check = await msg.gConfig.premiumCheck();
	if (!check.active) return msg.reply("this server is not already premium.");
	if (check.user !== msg.author.id) return msg.reply("your premium is not being used here.");

	const g = await mdb.collection("premium").findOneAndDelete(check);

	return msg.reply("removed premium from this server.");
}));
