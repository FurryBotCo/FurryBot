import Command from "../../util/CommandHandler/lib/Command";
import { mdb } from "../../modules/Database";
import Eris from "eris";
import { Utility, Strings, Time } from "../../util/Functions";
import config from "../../config";
import Language from "../../util/Language";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import Warning from "../../util/@types/Warning";
import chunk from "chunk";

export default new Command({
	triggers: [
		"warnings",
		"warnlog"
	],
	userPermissions: [
		"kickMembers"
	],
	botPermissions: [],
	cooldown: 3e3,
	donatorCooldown: 3e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	let member = await msg.getMemberFromArgs();
	if (!member) member = msg.member;

	if (!member) return msg.errorEmbed("INVALID_MEMBER");

	const w: Warning[] = await mdb.collection("warnings").find({ userId: member.id, guildId: msg.channel.guild.id } as Warning).toArray().then((res: Warning[]) => res.sort((a, b) => a.date - b.date));
	if (w.length === 0) return msg.reply(`{lang:commands.moderation.warnings.noWarnings|${member.username}#${member.discriminator}}`);

	const fields: Eris.EmbedField[][] = chunk(await Promise.all(w.map(async (k: Warning, i: number) => {
		const u = this.users.has(k.blameId) ? this.users.get(k.blameId) : await this.getRESTUser(k.blameId);
		return {
			name: `{lang:commands.moderation.warnings.warning|${i + 1}}`,
			value: [
				`{lang:commands.moderation.warnings.blame}: ${u.username}#${u.discriminator}`,
				`{lang:commands.moderation.warnings.reason}: ${k.reason.length > 100 ? "[TOO LONG TO DISPLAY]" : k.reason}`,
				`{lang:commands.moderation.warnings.date}: ${Time.formatDateWithPadding(k.date).split(" ")[0]}`,
				`{lang:commands.moderation.warnings.id}: ${k.id}`
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

	const embed = new EmbedBuilder(gConfig.settings.lang)
		.setTitle(`{lang:commands.moderation.warnings.title} ${member.username}#${member.discriminator}`)
		.setTimestamp(new Date().toISOString())
		.setColor(Math.floor(Math.random() * 0xFFFFFF))
		.setAuthor(`${member.username}#${member.discriminator}`, member.avatarURL)
		.setFooter(fields.length === 1 ? `{lang:commands.moderation.warnings.pageWithoutMore|${p}|${fields.length}}` : `{lang:commands.moderation.warnings.page|${p}|${fields.length}|${gConfig.settings.prefix}|${member.username}#${member.discriminator}|${p === fields.length ? p - 1 : p + 1}}`);

	fields[p - 1].map(w => embed.addField(w.name, w.value, w.inline));

	return msg.channel.createMessage({
		embed
	});
}));
