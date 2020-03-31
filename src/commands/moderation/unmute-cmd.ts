import Command from "../../util/CommandHandler/lib/Command";
import { mdb } from "../../modules/Database";
import Eris from "eris";
import { Utility } from "../../util/Functions";
import config from "../../config";
import Language from "../../util/Language";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";

export default new Command({
	triggers: [
		"unmute",
		"um"
	],
	userPermissions: [
		"kickMembers"
	],
	botPermissions: [
		"manageRoles"
	],
	cooldown: 3e3,
	donatorCooldown: 3e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length === 0) throw new Error("ERR_INVALID_USAGE");

	// get member from message
	const user = await msg.getMemberFromArgs();

	if (!user) return msg.errorEmbed("INVALID_USER");

	// if(user.id === msg.member.id && !config.developers.includes(msg.author.id)) return msg.channel.createMessage("Pretty sure you don't want to do this to yourthis.");
	// if(user.roles.highest.rawPosition >= msg.member.roles.highest.rawPosition && msg.author.id !== msg.channel.guild.ownerID) return msg.channel.createMessage(`You cannot mute ${user.username}#${user.discriminator} as their highest role is higher than yours!`);
	// if(user.permissions.has("administrator")) return msg.channel.createMessage("That user has `ADMINISTRATOR`, that would literally do nothing.");
	const reason = msg.args.length >= 2 ? msg.args.splice(1).join(" ") : "No Reason Specified";
	if (gConfig.settings.muteRole === null) return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.moderation.unmute.unmuteRole}")
			.setDescription(`{lang:commands.moderation.unmute.noRole|${msg.prefix}}`)
			.setColor(Colors.red)
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setTimestamp(new Date().toISOString())
	});

	if (!msg.channel.guild.roles.has(gConfig.settings.muteRole)) {
		await gConfig.edit({ settings: { muteRole: null } }).then(d => d.reload());
		return msg.channel.createMessage({
			embed: new EmbedBuilder(gConfig.settings.lang)
				.setTitle("{lang:commands.moderation.unmute.roleNotFound}")
				.setDescription(`{lang:commands.moderation.unmute.roleNotFoundDesc|${gConfig.settings.muteRole}|${gConfig.settings.muteRole}|${msg.prefix}}`)
				.setColor(Colors.red)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setTimestamp(new Date().toISOString())
		});
	}


	const a = Utility.compareMemberWithRole(msg.channel.guild.members.get(this.user.id), msg.channel.guild.roles.get(gConfig.settings.muteRole));
	if (a.same || a.lower) return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.moderation.unmute.invalidRole}")
			.setDescription(`{lang:commands.moderation.unmute.invalidRoleDesc|${gConfig.settings.muteRole}|${gConfig.settings.muteRole}|${msg.prefix}}`)
			.setColor(Colors.red)
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setTimestamp(new Date().toISOString())
	});

	if (!user.roles.includes(gConfig.settings.muteRole)) return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.moderation.unmute.notMuted}")
			.setDescription(`{lang:commands.moderation.unmute.notMutedDesc|${user.username}#${user.discriminator}|${msg.prefix}|${user.id}}`)
			.setColor(Colors.red)
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setTimestamp(new Date().toISOString())
	});

	user.removeRole(gConfig.settings.muteRole, `Unmute: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(async () => {
		await msg.channel.createMessage(`***{lang:commands.moderation.unmute.unmuted|${user.username}#${user.discriminator}|${reason}}***`).catch(noerr => null);
		await this.m.create(msg.channel, {
			type: "unmute",
			target: user,
			blame: msg.author,
			reason
		});
	}).catch(async (err) => {
		msg.channel.createMessage(`{lang:commands.moderation.unmute.couldNotUnmute|${user.username}#${user.discriminator}|${err}}`);
		/*if (m !== undefined) {
			await m.delete();
		}*/
	});
	if (msg.channel.permissionsOf(this.user.id).has("manageMessages")) msg.delete().catch(error => null);
}));
