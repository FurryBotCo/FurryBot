import Command from "../../modules/CommandHandler/Command";
import db from "../../modules/Database";

export default new Command({
	triggers: [
		"divorce"
	],
	permissions: {
		user: [],
		bot: []
	},
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (!uConfig.marriage.married) return msg.reply("you have to marry someone before you can divorce them..");

	const m = await db.getUser(uConfig.marriage.partner);

	if ([undefined, null].includes(uConfig.marriage)) await uConfig.edit({
		marriage: {
			married: false,
			partner: null
		}
	}).then(d => d.reload());

	const u = await this.bot.getRESTUser(uConfig.marriage.partner).catch(err => ({ username: "Unknown", discriminator: "0000" }));
	await msg.channel.createMessage(`Are you sure you want to divorce **${u.username}#${u.discriminator}**? **yes** or **no**.`).then(async () => {
		const d = await this.c.awaitMessages(msg.channel.id, 6e4, (m) => m.author.id === msg.author.id, 1);
		if (!d || !["yes", "no"].includes(d.content.toLowerCase())) return msg.reply("that wasn't a valid option..");
		if (d.content.toLowerCase() === "yes") {
			await uConfig.edit({
				marriage: {
					married: false,
					partner: null
				}
			}).then(d => d.reload());
			await m.edit({
				marriage: {
					married: false,
					partner: null
				}
			}).then(d => d.reload());
			return msg.reply(`you've divorced **${u.username}#${u.discriminator}**...`);
		} else return msg.reply(`you've stayed with **${u}**!`);
	});
}));
