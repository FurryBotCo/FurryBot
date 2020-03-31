import Command from "../../util/CommandHandler/lib/Command";
import { mdb } from "../../modules/Database";
import Eris from "eris";
import { Utility } from "../../util/Functions";
import config from "../../config";
import Language from "../../util/Language";
import EmbedBuilder from "../../util/EmbedBuilder";

export default new Command({
	triggers: [
		"hackban",
		"hb"
	],
	userPermissions: [
		"banMembers"
	],
	botPermissions: [
		"banMembers"
	],
	cooldown: 3e3,
	donatorCooldown: 3e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length < 1) throw new Error("ERR_INVALID_USAGE");
	let user: Eris.User;
	user = await msg.getUserFromArgs();

	if (!user) user = await this.getRESTUser(msg.args[0]).catch(err => null);
	if (!user) return msg.errorEmbed("INVALID_USER");

	if ((await msg.channel.guild.getBans().then(res => res.map(u => u.user.id))).includes(user.id)) return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.moderation.hackban.title}")
			.setDescription(`{lang:commands.moderation.hackban.desc|${user.username}#${user.discriminator}}`)
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setTimestamp(new Date().toISOString())
			.setColor(Math.floor(Math.random() * 0xFFFFFF))

	});

	if (user.id === msg.member.id && !config.developers.includes(msg.author.id)) return msg.reply("{lang:commands.moderation.hackban.noSelf}");
	const reason = msg.args.length >= 2 ? msg.args.splice(1).join(" ") : "{lang:commands.moderation.hackban.noReason}";
	msg.channel.guild.banMember(user.id, 7, `Hackban: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(async () => {
		await msg.channel.createMessage(`******{lang:commands.moderation.hackban.banned|${user.username}#${user.discriminator}|${reason}}***`).catch(noerr => null);
		await this.m.create(msg.channel, {
			type: "hackban",
			reason,
			target: user,
			blame: msg.author
		});
	}).catch(async (err) => {
		msg.channel.createMessage(`{lang:commands.moderation.hackban.couldNotHackban|${user.username}#${user.discriminator}|${err}}`);
		/*if (m !== undefined) {
			await m.delete();
		}*/
	});

	if (msg.channel.permissionsOf(this.user.id).has("manageMessages")) msg.delete().catch(error => null);
}));
