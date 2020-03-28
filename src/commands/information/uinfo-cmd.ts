import Command from "../../util/CommandHandler/lib/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Time } from "../../util/Functions";

export default new Command({
	triggers: [
		"uinfo",
		"userinfo",
		"ui"
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
	const user = msg.args.length === 0 || !msg.args ? msg.member : await msg.getMemberFromArgs();

	if (!user) return msg.errorEmbed("INVALID_USER");

	const m = Array.from(msg.channel.guild.members.values()).sort((a, b) => a.joinedAt - b.joinedAt).map(m => m.id);

	const around = [...workItOut(true), user.id, ...workItOut(false)];

	function workItOut(n: boolean) {
		const k: string[] = [];
		for (let i = 1; i < 3; i++) {
			const d = n ? m.indexOf(user.id) - i : m.indexOf(user.id) + i;
			console.log(d);
			if (d < 0 || d > (m.length - 1)) continue;
			else k.push(m[d]);
		}
		return k;
	}

	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle(`{lang:commands.information.uinfo.title}`)
			.setImage(user.avatarURL)
			.setDescription([
				`\u25FD {lang:commands.information.uinfo.tag}: ${user.username}#${user.discriminator} (<@!${user.id}>)`,
				`\u25FD {lang:commands.information.uinfo.id}: ${user.id}`,
				`\u25FD {lang:commands.information.uinfo.joinDate}: ${Time.formatDateWithPadding(user.joinedAt, true)}`,
				`\u25FD {lang:commands.information.uinfo.creationDate}: ${Time.formatDateWithPadding(user.createdAt, true)}`,
				`\u25FD {lang:commands.information.uinfo.roles} [${user.roles.length}]: ${user.roles.reduce((a, b) => a + msg.channel.guild.roles.get(b).name.length, 0) > 750 ? `{lang:commands.information.uinfo.tooManyRoles|${gConfig.settings.prefix}|${user.user.id}}` : user.roles.length === 0 ? "NONE" : user.roles.map(r => `<@&${r}>`).join(" ")}`,
				`\u25FD {lang:commands.information.uinfo.joinPos}: #${m.indexOf(user.id) + 1}`,
				`\u25FD {lang:commands.information.uinfo.nearbyJoins} ${around.map(a => a === msg.author.id ? `**<@!${a}>**` : `<@!${a}>`).join(" > ")}`
			].join("\n"))
			.setTimestamp(new Date().toISOString())
			.setColor(Math.floor(Math.random() * 0xFFFFFF))
	});
}));
