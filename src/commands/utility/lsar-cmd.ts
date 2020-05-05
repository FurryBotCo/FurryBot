import Command from "../../util/CommandHandler/lib/Command";
import { mdb } from "../../modules/Database";
import chunk from "chunk";
import EmbedBuilder from "../../util/EmbedBuilder";

export default new Command({
	triggers: [
		"lsar",
		"listselfassignableroles"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 5e3,
	donatorCooldown: 5e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const roles = gConfig.selfAssignableRoles;
	const page = msg.args.length > 0 ? parseInt(msg.args[0], 10) : 1;
	if (roles.length === 0) return msg.reply("{lang:commands.utility.lsar.noRoles}");
	const c = chunk(roles, 10);
	if (c.length === 0) return msg.reply("{lang:commands.utility.lsar.noRoles}");
	if (!page || page > c.length) return msg.reply("{lang:commands.utility.lsar.invalidPage}");
	const remove = [];
	const rl = roles.map(a => {
		const b = msg.channel.guild.roles.get(a);
		if (!b) {
			remove.push(a);
			return `{lang:commands.utility.lsar.notFound} - \`${a}\``;
		}
		return b.name;
	}).join("\n");
	if (remove.length > 0) await mdb.collection("guilds").findOneAndUpdate({ id: msg.channel.guild.id }, { $pull: { selfAssignableRoles: { $each: remove } } });

	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.utility.lsar.title}")
			.setDescription(`{lang:commands.utility.lsar.desc|${gConfig.settings.prefix}|${page}|${c.length}}`)
			.addField("{lang:commands.utility.lsar.roles}", rl, false)
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setTimestamp(new Date().toISOString())
			.setColor(Math.floor(Math.random() * 0xFFFFFF))
	});
}));
