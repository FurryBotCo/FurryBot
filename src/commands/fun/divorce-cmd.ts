import Command from "../../util/CommandHandler/lib/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import Eris from "eris";
import db from "../../modules/Database";

export default new Command({
	triggers: [
		"divorce"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	features: [],
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

	const u = await this.getRESTUser(uConfig.marriage.partner).catch(err => ({ username: "Unknown", discriminator: "0000" }));
	await msg.channel.createMessage(`Are you sure you want to divorce **${u.username}#${u.discriminator}**? **yes** or **no**.`).then(async () => {
		const d = await this.col.awaitMessage(msg.channel.id, msg.author.id, 6e4);
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
