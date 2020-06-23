import Command from "../../modules/CommandHandler/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Request } from "../../util/Functions";
import { FurryBotAPI } from "../../modules/External";
import db from "../../modules/Database";
import Eris from "eris";
import config from "../../config";

export default new Command({
	triggers: [
		"marry"
	],
	permissions: {
		user: [],
		bot: [
			"embedLinks"
		]
	},
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	restrictions: [],
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
		const u = await this.bot.getRESTUser(uConfig.marriage.partner).then(res => `${res.username}#${res.discriminator}`).catch(err => "Unknown#0000");
		return msg.reply(`{lang:commands.fun.marry.selfAlreadyMarried|${u}}`);
	}

	if (m.marriage.married) {
		const u = await this.bot.getRESTUser(m.marriage.partner).then(res => `${res.username}#${res.discriminator}`) || "Unknown#0000";
		return msg.reply(`{lang:commands.fun.marry.otherAlreadyMarried|${u}}`);
	}

	const img = await FurryBotAPI.furry.propose("json", 1);

	let d: Eris.Message<Eris.TextableChannel>;
	let force = false;
	if (msg.dashedArgs.parsed.value.includes("force")) {
		if (!config.developers.includes(msg.author.id)) return msg.reply("{lang:commands.fun.marry.devOnly}");
		else force = true;
	}
	if (!force) {
		if (["embedLinks", "attachFiles"].some(p => msg.channel.permissionsOf(this.bot.user.id).has(p))) await msg.channel.createMessage({
			embed: new EmbedBuilder(gConfig.settings.lang)
				.setTitle("{lang:commands.fun.marry.title}")
				.setDescription(`{lang:commands.fun.marry.text|${msg.author.id}|${member.id}}`)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setImage("attachment://marry.png")
				.setColor(Math.floor(Math.random() * 0xFFFFFF))
				.setTimestamp(new Date().toISOString())
				.toJSON(),
			content: `{lang:commands.fun.marry.content|${msg.author.id}|${member.id}}`
		}, {
			file: await Request.getImageFromURL(img.url),
			name: "marry.png"
		});
		else await msg.channel.createMessage(`{lang:commands.fun.marry.content|${msg.author.id}|${member.id}}\n\n{lang:commands.fun.marry.imageTip}"`);

		d = await this.c.awaitMessages(msg.channel.id, 6e4, (m) => m.author.id === member.id, 1);
		if (!d || !d.content) return msg.reply("{lang:commands.fun.marry.noReply}");
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
