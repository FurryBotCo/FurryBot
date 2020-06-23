import Command from "../../modules/CommandHandler/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import Eris from "eris";

export default new Command({
	triggers: [
		"avatar"
	],
	permissions: {
		user: [],
		bot: [
			"embedLinks",
			"attachFiles"
		]
	},
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	let user: Eris.User;
	if (msg.args.length < 1) user = msg.author;
	else user = await msg.getUserFromArgs();

	if (!user) return msg.errorEmbed("INVALID_USER");

	let color;
	if (msg.channel.guild.members.has(user.id)) {
		const member = msg.channel.guild.members.get(user.id);
		const r = member.roles.map(r => msg.channel.guild.roles.get(r)).filter(r => !!r && r.color !== 0);
		const role = r[r.length - 1];
		if (role && role.color) color = role.color;
	}

	if ([undefined, null].includes(color)) color = Math.floor(Math.random() * 0xFFFFFF);

	return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.misc.avatar.title}")
			.setDescription(`[{lang:commands.misc.avatar.link}](${user.avatarURL})`)
			.setFooter(`${user.username}#${user.discriminator}`, user.avatarURL)
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setImage(user.avatarURL)
			.setColor(color)
			.setTimestamp(new Date().toISOString())
			.toJSON()
	});
}));
