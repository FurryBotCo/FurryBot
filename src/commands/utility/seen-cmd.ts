import Command from "../../util/CommandHandler/lib/Command";
import * as Eris from "eris";
import EmbedBuilder from "../../util/EmbedBuilder";

export default new Command({
	triggers: [
		"seen",
		"seenon"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 2e3,
	donatorCooldown: 1e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const user = msg.args.length === 0 || !msg.args ? msg.member : await msg.getMemberFromArgs();

	if (!user) return msg.errorEmbed("INVALID_USER");

	const a = this.guilds.filter(g => g.members.has(user.id)),
		b = a.map(g => `${g.name} (${g.id})`),
		guilds = [],
		fields: Eris.EmbedField[] = [];

	let i = 0;

	for (const key in b) {
		if (!guilds[i]) guilds[i] = "";
		if (guilds[i].length > 1000 || +guilds[i].length + b[key].length > 1000) {
			i++;
			guilds[i] = b[key];
		} else {
			guilds[i] += `\n${b[key]}`;
		}
	}

	guilds.forEach((g, c) =>
		fields.push({
			name: `Server List #${+c + 1}`,
			value: g,
			inline: false
		})
	);

	const embed = new EmbedBuilder(gConfig.settings.lang)
		.setTitle(`{lang:commands.utility.seen.amountTitle|${b.length}|${user.user.username}#${user.user.discriminator}|${user.id}}`)
		.setDescription(`{lang:commands.utility.seen.amountDesc|${a.length}}`)
		.setColor(Math.random() * 0xFFFFFF)
		.setTimestamp(new Date().toISOString());

	if (a.length > 30) {
		embed.setDescription(`${embed.getDescription()}\n{lang:commands.utility.seen.tooManyServers}`);
	} else fields.map(f => embed.addField(f.name, f.value, f.inline));

	msg.channel.createMessage({ embed });
}));
