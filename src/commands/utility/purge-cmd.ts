import Command from "../../modules/CommandHandler/Command";
import CommandError from "../../modules/CommandHandler/CommandError";

export default new Command({
	triggers: [
		"purge",
		"prune",
		"clear"
	],
	permissions: {
		user: [
			"manageMessages"
		],
		bot: [
			"manageMessages"
		]
	},
	cooldown: 1.5e3,
	donatorCooldown: 1.5e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	let count = Number(msg.args[0]);
	if (msg.args.length === 0 || isNaN(count)) throw new CommandError("ERR_INVALID_USAGE", cmd);
	if (count < 2 || count > 100) return msg.reply("{lang:commands.utility.prune.amount}");
	if (count < 100) count++;

	const m = await msg.channel.getMessages(count);
	const f = m.filter(d => !(d.timestamp + 12096e5 < Date.now()));
	await msg.channel.deleteMessages(f.map(j => j.id));
	// await msg.gConfig.modlog.add({ blame: this.client.user.id, action: "purgeMessages", count, actual: f.length, timestamp: Date.now() });
	if (m.length !== f.length) await msg.channel.createMessage(`{lang:commands.utility.prune.skipped|${m.length - f.length}}`);
}));
