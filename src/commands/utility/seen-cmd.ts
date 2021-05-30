import GuildConfig from "../../db/Models/GuildConfig";
import UserConfig from "../../db/Models/UserConfig";
import FurryBot from "../../main";
import { BotFunctions, Command, EmbedBuilder } from "core";
import { EmbedField } from "slash-commands";

export default new Command<FurryBot, UserConfig, GuildConfig>(["seen"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		// @TODO across clusters
		const showLocation = msg.dashedArgs.value.includes("show-location") || msg.dashedArgs.value.includes("show-all");
		const showIds = msg.dashedArgs.value.includes("show-id") || msg.dashedArgs.value.includes("show-all");
		let user = msg.args.length === 0 || !msg.args ? msg.author : await msg.getMemberFromArgs().then(m => !m ? null : m.user);
		if (!user) user = await msg.getUserFromArgs();

		if (user === null) return msg.channel.createMessage({
			embed: BotFunctions.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_USER", true)
		});

		const seen = this.bot.guilds.filter(g => g.members.has(user!.id)).sort((a, b) => a.memberCount - b.memberCount);
		const guilds = [];
		const fields: Array<EmbedField> = [];

		let i = 0;

		for (const s of seen) {
			let v = "";
			if (showLocation) v += `[#${this.cluster.id} / #${s.shard.id}]`; // @FIXME
			if (showIds) v += `[${s.id}]`;
			v += `[${s.memberCount.toLocaleString()}] ${s.name}`;
			if (!guilds[i]) guilds[i] = "";
			if (guilds[i].length > 1000 || +guilds[i].length + v.length > 1000) {
				i++;
				guilds[i] = v;
			} else {
				guilds[i] += `\n${v}`;
			}
		}

		guilds.map((g, c) =>
			fields.push({
				name: `{lang:${cmd.lang}.list|${c + 1}}`,
				value: g,
				inline: false
			})
		);

		let t = "";
		if (showLocation) t += `{lang:${cmd.lang}.info.location}`;
		if (showIds) t += `{lang:${cmd.lang}.info.id}`;
		t += `{lang:${cmd.lang}.info.memberCount} {lang:${cmd.lang}.info.name}`;

		const embed = new EmbedBuilder(msg.gConfig.settings.lang)
			.setTitle(`{lang:${cmd.lang}.amountTitle|${seen.length}|${user.username}#${user.discriminator}|${user.id}}`)
			.setDescription(`{lang:${cmd.lang}.flags}\n\n{lang:${cmd.lang}.amountDesc|${seen.length}}\n\n${t}`)
			.setColor(Math.random() * 0xFFFFFF)
			.setTimestamp(new Date().toISOString());

		if (seen.length > 30) embed.setDescription(`${embed.getDescription() ?? ""}\n{lang:${cmd.lang}.tooManyServers}`);
		else fields.map(f => embed.addField(f.name, f.value, f.inline));

		void msg.channel.createMessage({
			embed: embed.toJSON()
		});
	});
