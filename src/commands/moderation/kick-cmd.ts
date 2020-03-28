import Command from "../../util/CommandHandler/lib/Command";
import { mdb } from "../../modules/Database";
import Eris from "eris";
import { Utility } from "../../util/Functions";
import config from "../../config";
import Language from "../../util/Language";
import EmbedBuilder from "../../util/EmbedBuilder";

export default new Command({
	triggers: [
		"kick",
		"k"
	],
	userPermissions: [
		"kickMembers"
	],
	botPermissions: [
		"kickMembers"
	],
	cooldown: 3e3,
	donatorCooldown: 3e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length < 1) throw new Error("ERR_INVALID_USAGE");
	let m;
	// get member from message
	const member = await msg.getMemberFromArgs();

	if (!member) return msg.errorEmbed("INVALID_USER");

	if (member.id === msg.member.id && !config.developers.includes(msg.author.id)) return msg.reply("{lang:commands.moderation.kick.noSelf}");
	const a = Utility.compareMembers(member, msg.member);
	if ((a.member2.higher || a.member2.same) && msg.author.id !== msg.channel.guild.ownerID) return msg.channel.createMessage(`<@!${msg.author.id}>, {lang:commands.moderation.kick.noKick|${member.username}#${member.discriminator}}`);
	// if(!user.kickable) return msg.channel.createMessage(`I cannot kick ${user.username}#${user.discriminator}! Do they have a higher role than me? Do I have kick permissions?`);
	const reason = msg.args.length >= 2 ? msg.args.splice(1).join(" ") : "{lang:commands.moderation.kick.noReason}";
	if (!member.user.bot) m = await member.user.getDMChannel().then(dm => dm.createMessage(`{lang:commands.moderation.kick.dm|${msg.channel.guild.name}|${reason}}`)).catch(err => null);
	member.kick(`Kick: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(async () => {
		await msg.channel.createMessage(`{lang:commands.moderation.kick.kicked|${member.username}#${member.discriminator}|${reason}}`).catch(noerr => null);
		await this.m.create(msg.channel, {
			type: "kick",
			reason,
			target: member,
			blame: msg.author
		});
	}).catch(async (err) => {
		await msg.reply(`{lang:commands.moderation.kick.couldNotKick|${member.username}#${member.discriminator}|${err}}`);
		if (m !== undefined) {
			await m.delete();
		}
	});

	if (msg.channel.permissionsOf(this.user.id).has("manageMessages")) msg.delete().catch(error => null);
}));
