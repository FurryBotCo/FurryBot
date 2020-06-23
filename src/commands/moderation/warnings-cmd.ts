import Command from "../../modules/CommandHandler/Command";
import { mdb } from "../../modules/Database";
import chunk from "chunk";
import Eris from "eris";
import { Time } from "../../util/Functions";
import EmbedBuilder from "../../util/EmbedBuilder";

export default new Command({
	triggers: [
		"warnings",
		"warnlog"
	],
	permissions: {
		user: [],
		bot: []
	},
	cooldown: 2e3,
	donatorCooldown: 2e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	let member = await msg.getMemberFromArgs();
	if (!member) member = msg.member;

	if (!member) return msg.errorEmbed("INVALID_MEMBER");

	const w = await mdb.collection<Warning>("warnings").find({ userId: member.id, guildId: msg.channel.guild.id }).toArray().then((res) => res.sort((a, b) => a.date - b.date));
	if (w.length === 0) return msg.reply(`{lang:commands.moderation.warnings.noWarnings|${member.username}#${member.discriminator}}`);

	await Promise.all(w.filter(async (warning, i) => {
		if (isNaN(Number(warning.id))) {
			await mdb.collection<Warning>("warnings").findOneAndUpdate({ id: warning.id }, { $set: { id: i + 1 } });
			w.find(wk => wk.id === warning.id).id = i + 1;
		}
	}));
	const fields: Eris.EmbedField[][] = chunk(await Promise.all(w.map(async (k: Warning, i: number) => {
		const u = this.bot.users.has(k.blameId) ? this.bot.users.get(k.blameId) : await this.bot.getRESTUser(k.blameId);
		return {
			name: `{lang:commands.moderation.warnings.warning|${i + 1}}`,
			value: [
				`{lang:commands.moderation.warnings.blame}: ${u.username}#${u.discriminator}`,
				`{lang:commands.moderation.warnings.reason}: ${k.reason.length > 100 ? "[TOO LONG TO DISPLAY]" : k.reason}`,
				`{lang:commands.moderation.warnings.date}: ${Time.formatDateWithPadding(k.date).split(" ")[0]}`
			].join("\n"),
			inline: false
		};
	})), 5);

	let p;
	if (msg.args.length > 1) {
		const pg = Number(msg.args[1]);
		if (isNaN(pg) || !pg || pg < 1 || pg > fields.length) return msg.reply("{lang:commands.moderation.warnings.invalidPage}");
		p = pg;
	} else p = 1;

	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle(`{lang:commands.moderation.warnings.title} ${member.username}#${member.discriminator}`)
			.setTimestamp(new Date().toISOString())
			.setColor(Math.floor(Math.random() * 0xFFFFFF))
			.setAuthor(`${member.username}#${member.discriminator}`, member.avatarURL)
			.setFooter(fields.length === 1 ? `{lang:commands.moderation.warnings.pageWithoutMore|${p}|${fields.length}}` : `{lang:commands.moderation.warnings.page|${p}|${fields.length}|${gConfig.settings.prefix}|${member.username}#${member.discriminator}|${p === fields.length ? p - 1 : p + 1}}`)
			.addFields(...fields[p - 1].map(w => ({ name: w.name, value: w.value, inline: w.inline })))
			.toJSON()
	});
}));
