import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";

export default new Command({
	triggers: [
		"roll"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	donatorCooldown: 1e3,
	description: "Roll the dice.",
	usage: "[min] [max]",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	const min = typeof msg.args[0] !== "undefined" ? Number(msg.args[0]) : 1;
	const max = typeof msg.args[1] !== "undefined" ? Number(msg.args[1]) : 20;

	if (min > max) return msg.reply("the minimum must be less than the maximum.");

	return msg.channel.createMessage(`<@!${msg.author.id}>, you rolled a ${Math.floor(Math.random() * (max - min)) + min}!`);
}));
