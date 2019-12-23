import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";
import phin from "phin";
import * as Eris from "eris";
import { db, mdb, mongo } from "../../modules/Database";

export default new Command({
	triggers: [
		"marry",
		"propose"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 3e4,
	donatorCooldown: 1.5e4,
	description: "Propose to someone!",
	usage: "<@member>",
	features: []
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	await msg.channel.startTyping();
	const member = await msg.getMemberFromArgs();
	if (!member) return msg.errorEmbed("INVALID_USER");
	const m = await db.getUser(member.id);

	if ([undefined, null].includes(msg.uConfig.marriage)) await msg.uConfig.edit({
		marriage: {
			married: false,
			partner: null
		}
	}).then(d => d.reload());

	if (msg.uConfig.marriage.married) {
		const u = await this.getRESTUser(msg.uConfig.marriage.partner).then(res => `${res.username}#${res.discriminator}`).catch(err => "Unknown#0000");
		return msg.reply(`hey, hey! You're already married to **${u}**! You can get a divorce though..`);
	}

	if (m.marriage.married) {
		const u = await this.getRESTUser(m.marriage.partner).then(res => `${res.username}#${res.discriminator}`) || "Unknown#0000";
		return msg.reply(`hey, hey! They're already married to **${u}**!`);
	}

	const img = await this.f.imageAPIRequest(false, "propose", true, true);

	if (["embedLinks", "attachFiles"].some(p => msg.channel.permissionsOf(this.user.id).has(p)) && img.success === true) await msg.channel.createMessage({
		embed: {
			title: "Marriage Proposal!",
			description: `<@!${msg.author.id}> has proposed to <@!${member.id}>!`,
			author: {
				name: msg.author.tag,
				icon_url: msg.author.avatarURL
			},
			image: {
				url: "attachment://marry.png"
			},
			color: Math.floor(Math.random() * 0xFFFFFF),
			timestamp: new Date().toISOString()
		},
		content: `<@!${msg.author.id}> has proposed to <@!${member.id}>!\n<@!${member.id}> do you accept? **yes** or **no**.`
	}, {
		file: await this.f.getImageFromURL(img.response.image),
		name: "marry.png"
	});
	else await msg.channel.createMessage(`<@!${msg.author.id}> has proposed to <@!${member.id}>!\n<@!${member.id}> do you accept? **yes** or **no**.${img.success ? "\n\n(TIP: you could get images in this command if I had the `attachFiles`, and `embedLinks` permissions!)" : ""}`);

	const d = await this.messageCollector.awaitMessage(msg.channel.id, member.id, 6e4);
	if (!d) return msg.reply("Seems like we didn't get a reply..");
	if (!["yes", "no"].includes(d.content.toLowerCase())) return msg.channel.createMessage(`<@!${member.id}>, that wasn't a valid option..`);
	if (d.content.toLowerCase() === "yes") {
		await msg.uConfig.edit({
			marriage: {
				married: true,
				partner: member.id
			}
		}).then(d => d.reload());
		await m.edit({
			marriage: {
				married: true,
				partner: msg.author.id
			}
		}).then(d => d.reload());
		return msg.channel.createMessage(`Congrats <@!${msg.author.id}> and <@!${member.id}> :ring:!`);
	} else {
		return msg.reply("Better luck next time!");
	}
}));
