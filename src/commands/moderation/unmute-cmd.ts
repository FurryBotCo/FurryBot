import Command from "../../modules/CommandHandler/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Utility } from "../../util/Functions";
import Language from "../../util/Language";
import { Colors } from "../../util/Constants";
import CommandError from "../../modules/CommandHandler/CommandError";
import Eris from "eris";

export default new Command({
	triggers: [
		"unmute"
	],
	permissions: {
		user: [
			"manageMessages"
		],
		bot: [
			"manageRoles"
		]
	},
	cooldown: 2e3,
	donatorCooldown: 2e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length < 1) throw new CommandError("ERR_INVALID_USAGE", cmd);

	// get member from message
	const member = await msg.getMemberFromArgs();

	if (!member) return msg.errorEmbed("INVALID_MEMBER");

	let m: Eris.Message;
	const reason = msg.args.length >= 2 ? msg.args.splice(1).join(" ") : Language.get(gConfig.settings.lang, "other.words.noReason", false);
	if (gConfig.settings.muteRole === null) return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.moderation.unmute.unmuteRole}")
			.setDescription(`{lang:commands.moderation.unmute.noRole|${msg.prefix}}`)
			.setColor(Colors.red)
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setTimestamp(new Date().toISOString())
			.toJSON()
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
				.toJSON()
		});
	}


	const a = Utility.compareMemberWithRole(msg.channel.guild.members.get(this.bot.user.id), msg.channel.guild.roles.get(gConfig.settings.muteRole));
	if (a.same || a.lower) return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.moderation.unmute.invalidRole}")
			.setDescription(`{lang:commands.moderation.unmute.invalidRoleDesc|${gConfig.settings.muteRole}|${gConfig.settings.muteRole}|${msg.prefix}}`)
			.setColor(Colors.red)
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setTimestamp(new Date().toISOString())
			.toJSON()
	});

	if (!member.roles.includes(gConfig.settings.muteRole)) return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.moderation.unmute.notMuted}")
			.setDescription(`{lang:commands.moderation.unmute.notMutedDesc|${member.username}#${member.discriminator}|${msg.prefix}|${member.id}}`)
			.setColor(Colors.red)
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setTimestamp(new Date().toISOString())
			.toJSON()
	});

	if (!member.bot) m = await member.user.getDMChannel().then(dm => dm.createMessage(Language.parseString(gConfig.settings.lang, `{lang:other.dm.unMute|${msg.channel.guild.name}|${reason}}\n\n{lang:other.dm.notice}`))).catch(err => null);
	await member.removeRole(gConfig.settings.muteRole, `Unmute: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(async () => {
		await msg.channel.createMessage(`***{lang:commands.moderation.unmute.unmuted|${member.username}#${member.discriminator}|${reason}}***`).catch(noerr => null);
		await this.m.create(msg.channel, {
			type: "unmute",
			target: member,
			blame: msg.author,
			reason
		});
	}).catch(async (err) => {
		if (err.name.indexOf("ERR_INVALID_CHAR") !== -1) await msg.reply("{lang:commands.moderation.unmute.englishOnly}");
		else await msg.channel.createMessage(`{lang:commands.moderation.unmute.couldNotUnmute|${member.username}#${member.discriminator}|${err}}`);
		if (m !== undefined) {
			await m.delete();
		}
	});
	if (msg.channel.permissionsOf(this.bot.user.id).has("manageMessages")) msg.delete().catch(error => null);
}));
