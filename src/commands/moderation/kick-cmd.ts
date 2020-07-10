import Command from "../../modules/CommandHandler/Command";
import { Utility } from "../../util/Functions";
import Language from "../../util/Language";
import Eris from "eris";
import CommandError from "../../modules/CommandHandler/CommandError";

export default new Command({
	triggers: [
		"kick"
	],
	permissions: {
		user: [
			"kickMembers"
		],
		bot: [
			"kickMembers"
		]
	},
	cooldown: 2e3,
	donatorCooldown: 2e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length < 1) throw new CommandError("ERR_INVALID_USAGE", cmd);
	let m: Eris.Message;
	// get member from message
	const member = await msg.getMemberFromArgs();

	if (!member) return msg.errorEmbed("INVALID_MEMBER");

	if (member.id === msg.member.id) return msg.reply("{lang:commands.moderation.kick.noSelf}");
	if (member.id === msg.channel.guild.ownerID) return msg.reply("{lang:commands.moderation.kick.noKickOwner}");
	const a = Utility.compareMembers(member, msg.member);
	if ((a.member1.higher || a.member1.same) && msg.author.id !== msg.channel.guild.ownerID) return msg.channel.createMessage(`<@!${msg.author.id}>, {lang:commands.moderation.kick.noKick|${member.username}#${member.discriminator}}`);
	// if(!user.kickable) return msg.channel.createMessage(`I cannot kick ${user.username}#${user.discriminator}! Do they have a higher role than me? Do I have kick permissions?`);
	const reason = msg.args.length >= 2 ? msg.args.splice(1).join(" ") : Language.get(gConfig.settings.lang, "other.words.noReason", false);
	if (!member.user.bot) m = await member.user.getDMChannel().then(dm => dm.createMessage(`{lang:other.dm.kick|${msg.channel.guild.name}|${reason}}\n\n{lang:other.dm.notice}`)).catch(err => null);
	member.kick(`Kick: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(async () => {
		await msg.channel.createMessage(`***{lang:commands.moderation.kick.kicked|${member.username}#${member.discriminator}|${reason}}***`).catch(noerr => null);
		await this.m.create(msg.channel, {
			type: "kick",
			reason,
			target: member,
			blame: msg.author
		});
	}).catch(async (err) => {
		if (err.name.indexOf("ERR_INVALID_CHAR") !== -1) await msg.reply("{lang:commands.moderation.kick.englishOnly}");
		else await msg.reply(`{lang:commands.moderation.kick.couldNotKick|${member.username}#${member.discriminator}|${err}}`);
		if (m !== undefined) await m.delete();
	});

	if (msg.channel.permissionsOf(this.bot.user.id).has("manageMessages")) msg.delete().catch(error => null);
}));
