import Eris from "eris";
import Command from "../../../util/cmd/Command";
import EmbedBuilder from "../../../util/EmbedBuilder";
import Utility from "../../../util/Functions/Utility";

export default new Command(["seen"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {
		// @TODO across clusters
		let user = msg.args.length === 0 || !msg.args ? msg.author : await msg.getMemberFromArgs().then(m => !m ? null : m.user);
		if (!user) user = await msg.getUserFromArgs();

		if (!user) return msg.channel.createMessage({
			embed: Utility.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_USER", true)
		});

		const seen = this.bot.guilds.filter(g => g.members.has(user.id));
		const guilds = [];
		const fields: Eris.EmbedField[] = [];

		let i = 0;

		for (const s of seen) {
			const t = `[#${s.shard.id + 1}] ${s.name} (${s.id})`;
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
				name: `{lang:${cmd.lang}.list|${c + 1}}`,
				value: g,
				inline: false
			})
		);

		const embed = new EmbedBuilder(msg.gConfig.settings.lang)
			.setTitle(`{lang:${cmd.lang}.amountTitle|${seen.length}|${user.username}#${user.discriminator}|${user.id}}`)
			.setDescription(`{lang:${cmd.lang}.amountDesc|${seen.length}}\n\n{lang:${cmd.lang}.cs}`)
			.setColor(Math.random() * 0xFFFFFF)
			.setTimestamp(new Date().toISOString());

		if (seen.length > 30) embed.setDescription(`${embed.getDescription()}\n{lang:${cmd.lang}.tooManyServers}`);
		else fields.map(f => embed.addField(f.name, f.value, f.inline));

		msg.channel.createMessage({
			embed: embed.toJSON()
		});
	});
