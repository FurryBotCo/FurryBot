import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import { Internal } from "../../util/Functions";

export default new Command({
	triggers: [
		"divorce"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 3e4,
	donatorCooldown: 1.5e4,
	description: "Revoke your marriage..",
	usage: "<@member>",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	if (!msg.uConfig.marriage.married) return msg.reply("you have to marry someone before you can divorce them..");

	const m = await Internal.getUser(msg.uConfig.marriage.partner);

	if ([undefined, null].includes(msg.uConfig.marriage)) await msg.uConfig.edit({
		marriage: {
			married: false,
			partner: null
		}
	}).then(d => d.reload());

	const u = await this.getRESTUser(msg.uConfig.marriage.partner).catch(err => ({ username: "Unknown", discriminator: "0000" }));
	await msg.channel.createMessage(`Are you sure you want to divorce **${u.username}#${u.discriminator}**? **yes** or **no**.`).then(async () => {
		const d = await this.messageCollector.awaitMessage(msg.channel.id, msg.author.id, 6e4);
		if (!d || !["yes", "no"].includes(d.content.toLowerCase())) return msg.reply("that wasn't a valid option..");
		if (d.content.toLowerCase() === "yes") {
			await msg.uConfig.edit({
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
