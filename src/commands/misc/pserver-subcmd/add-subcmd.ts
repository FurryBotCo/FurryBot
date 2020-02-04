import SubCommand from "../../../util/CommandHandler/lib/SubCommand";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import { mdb } from "../../../modules/Database";
import config = require("../../../config");

export default new SubCommand({
	triggers: [
		"add"
	],
	userPermissions: [
		"manageChannels",
		"manageGuild"
	],
	botPermissions: [
		"attachFiles",
		"embedLinks"
	],
	cooldown: 3e3,
	donatorCooldown: 3e3,
	description: "Add this server as a premium server",
	usage: "",
	features: ["donatorOnly"],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	const check = await msg.gConfig.premiumCheck();
	if (check.active) return msg.reply("this server is already premium.");

	const g = await mdb.collection("premium").findOne({
		type: "guild",
		user: msg.author.id
	});

	if (!!g && !config.developers.includes(msg.author.id)) return msg.reply("you have already activated a premium server.");

	await msg.reply("are you sure you want to activate your premium server in this server? **Yes** or **no**.");
	const d = await this.messageCollector.awaitMessage(msg.channel.id, msg.author.id, 6e4);
	if (!d || !d.content) return msg.reply("got no reply, canceled.");

	if (["no", "n", "cancel"].includes(d.content.toLowerCase())) return msg.reply("canceled.");

	await mdb.collection("premium").insertOne({
		type: "guild",
		active: true,
		activationDate: Date.now(),
		user: msg.author.id,
		guildId: msg.channel.guild.id
	} as GlobalTypes.PremiumGuildEntry);

	return msg.reply("activated premium on this server.");
}));
