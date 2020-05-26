import Command from "../../modules/CommandHandler/Command";
import config from "../../config";

export default new Command({
	triggers: [
		"reset",
		"resetguild",
		"resetguildsettings"
	],
	permissions: {
		user: [
			"administrator"
		],
		bot: []
	},
	cooldown: 36e5,
	donatorCooldown: 36e5,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	await msg.channel.createMessage("{lang:commands.utility.reset.confirm}");
	const d = await this.c.awaitMessages(msg.channel.id, 6e4, (m) => m.author.id === msg.author.id);
	if (!d || !["yes", "no"].includes(d.content.toLowerCase())) return msg.reply("{lang:commands.utility.reset.invalid}");
	const choice = d.content.toLowerCase() === "yes";

	if (!choice) {
		return msg.channel.createMessage("{lang:commands.utility.reset.canceled}");
	} else {

		// await msg.gConfig.modlog.add({ blame: this.client.user.id, action: "resetSettings", old: msg.gConfig, timestamp: Date.now() });
		await msg.channel.createMessage(`{lang:commands.utility.reset.done|${config.defaults.prefix}}`);
		try {
			await gConfig.reset().then(d => d.reload());
		} catch (e) {
			this.log("error", e, `Shard #${msg.channel.guild.shard.id}`);
			return msg.channel.createMessage("{lang:commands.utility.reset.error}");
		}
	}
}));
