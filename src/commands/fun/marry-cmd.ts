import Command from "../../util/CommandHandler/lib/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Request, Internal } from "../../util/Functions";
import Logger from "../../util/LoggerV8";
import db from "../../modules/Database";
import Eris from "eris";
import config from "../../config";

export default new Command({
	triggers: [
		"marry"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const member = await msg.getMemberFromArgs();
	if (!member) return msg.errorEmbed("INVALID_USER");
	const m = await db.getUser(member.id);

	if ([undefined, null].includes(uConfig.marriage)) await uConfig.edit({
		marriage: {
			married: false,
			partner: null
		}
	}).then(d => d.reload());

	if (msg.author.id === member.id) return msg.reply("{lang:commands.fun.marry.noSelf}");
	if (member.bot) return msg.reply("{lang:commands.fun.marry.noBot}");
	if (uConfig.marriage.married) {
		const u = await this.getRESTUser(uConfig.marriage.partner).then(res => `${res.username}#${res.discriminator}`).catch(err => "Unknown#0000");
		return msg.reply(`{lang:commands.fun.marry.selfAlreadyMarried|${u}}`);
	}

	if (m.marriage.married) {
		const u = await this.getRESTUser(m.marriage.partner).then(res => `${res.username}#${res.discriminator}`) || "Unknown#0000";
		return msg.reply(`{lang:commands.fun.marry.otherAlreadyMarried|${u}}`);
	}

	const img = await Request.imageAPIRequest(false, "propose", true, true);

	let d: Eris.Message<Eris.TextableChannel>;
	let force = false;
	if (msg.dashedArgs.parsed.value.includes("force")) {
		if (!config.developers.includes(msg.author.id)) return msg.reply("{lang:commands.fun.marry.devOnly}");
		else force = true;
	}
	if (!force) {
		if (["embedLinks", "attachFiles"].some(p => msg.channel.permissionsOf(this.user.id).has(p)) && img.success === true) await msg.channel.createMessage({
			embed: new EmbedBuilder(gConfig.settings.lang)
				.setTitle("{lang:commands.fun.marry.title}")
				.setDescription(`{lang:commands.fun.marry.text|${msg.author.id}|${member.id}}`)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setImage("attachment://marry.png")
				.setColor(Math.floor(Math.random() * 0xFFFFFF))
				.setTimestamp(new Date().toISOString()),
			content: `{lang:commands.fun.marry.content|${msg.author.id}|${member.id}}`
		}, {
			file: await Request.getImageFromURL(img.response.image),
			name: "marry.png"
		});
		else await msg.channel.createMessage(`{lang:commands.fun.marry.content|${msg.author.id}|${member.id}}${img.success ? "\n\n(TIP: you could get images in this command if I had the `attachFiles`, and `embedLinks` permissions!)" : ""}`);

		d = await this.col.awaitMessage(msg.channel.id, member.id, 6e4);
		if (!d) return msg.reply("{lang:commands.fun.marry.noReply}");
		if (!["yes", "no"].includes(d.content.toLowerCase())) return msg.channel.createMessage(`{lang:commands.fun.marry.invalidOption|${member.id}}`);
	} else d = { content: "yes" } as any;
	if (d.content.toLowerCase() === "yes") {
		await uConfig.edit({
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
		return msg.channel.createMessage(`{lang:commands.fun.marry.accepted|${msg.author.id}|${member.id}}`);
	} else {
		return msg.reply("{lang:commands.fun.marry.denied}");
	}
}));
