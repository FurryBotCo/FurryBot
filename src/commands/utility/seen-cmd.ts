import Command from "../../modules/CommandHandler/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import Eris from "eris";

export default new Command({
	triggers: [
		"seen"
	],
	permissions: {
		user: [],
		bot: [
			"embedLinks"
		]
	},
	cooldown: 3e3,
	donatorCooldown: 3e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	let user = msg.args.length === 0 || !msg.args ? msg.author : await msg.getMemberFromArgs().then(m => !m ? null : m.user);
	if (!user) user = await msg.getUserFromArgs();

	if (!user) return msg.errorEmbed("INVALID_USER");

	const seen = await this.broadcastEval<{ id: string; name: string; clusterId: number; shardId: number; }>(`this.bot.guilds.filter(g => g.members.has("${user.id}")).map(g => ({ id: g.id, name: g.name, clusterId: this.clusterID, shardId: g.shard.id }))`).then(res => res.map(r => r.result).reduce((a, b) => a.concat(b), []));

	const guilds = [];
	const fields: Eris.EmbedField[] = [];

	let i = 0;

	for (const s of seen) {
		console.log(s);
		const t = `[#${s.clusterId + 1} / #${s.shardId + 1}] ${s.name} (${s.id})`;
		if (!guilds[i]) guilds[i] = "";
		if (guilds[i].length > 1000 || +guilds[i].length + t.length > 1000) {
			i++;
			guilds[i] = t;
		} else {
			guilds[i] += `\n${t}`;
		}
	}

	guilds.map((g, c) =>
		fields.push({
			name: `Server List #${c + 1}`,
			value: g,
			inline: false
		})
	);

	const embed = new EmbedBuilder(gConfig.settings.lang)
		.setTitle(`{lang:commands.utility.seen.amountTitle|${seen.length}|${user.username}#${user.discriminator}|${user.id}}`)
		.setDescription(`{lang:commands.utility.seen.amountDesc|${seen.length}}\n\n{lang:commands.utility.seen.cs}`)
		.setColor(Math.random() * 0xFFFFFF)
		.setTimestamp(new Date().toISOString());

	if (seen.length > 30) {
		embed.setDescription(`${embed.getDescription()}\n{lang:commands.utility.seen.tooManyServers}`);
	} else fields.map(f => embed.addField(f.name, f.value, f.inline));

	msg.channel.createMessage({
		embed: embed.toJSON()
	});
}));
