import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";

export default new Command({
	triggers: [
		"ping",
		"pong"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: .5e3,
	donatorCooldown: .25e3,
	description: "Get my average ping.",
	usage: "",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	await msg.channel.startTyping();
	return msg.channel.createMessage("Checking Ping..")
		.then(m => m.edit("Ping Calculated!"))
		.then(async (m) => {
			await msg.channel.createMessage(`Client Ping: ${Number(m.timestamp - msg.timestamp).toLocaleString()}ms${"\n"}Shard Ping: ${Number(msg.guild.shard.latency).toLocaleString()}ms`);
			return m.delete();
		});
}));
