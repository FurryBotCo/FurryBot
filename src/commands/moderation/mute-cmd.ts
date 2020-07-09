import Command from "../../modules/CommandHandler/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { mdb } from "../../modules/Database";
import { Utility, Time } from "../../util/Functions";
import Language from "../../util/Language";
import { Colors } from "../../util/Constants";
import CommandError from "../../modules/CommandHandler/CommandError";
import Logger from "../../util/LoggerV10";
import Eris from "eris";

export default new Command({
	triggers: [
		"mute"
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
	let time = 0, m: Eris.Message;
	// get member from message
	const member = await msg.getMemberFromArgs();

	if (!member) return msg.errorEmbed("INVALID_MEMBER");

	if (gConfig.settings.muteRole === null) return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.moderation.mute.noRole}")
			.setDescription(`{lang:commands.moderation.mute.noRoleDesc|${msg.prefix}}`)
			.setColor(Colors.red)
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setTimestamp(new Date().toISOString())
			.toJSON()
	});

	if (!msg.channel.guild.roles.has(gConfig.settings.muteRole)) {
		await gConfig.edit({ settings: { muteRole: null } }).then(d => d.reload());
		return msg.channel.createMessage({
			embed: new EmbedBuilder(gConfig.settings.lang)
				.setTitle("{lang:commands.moderation.mute.roleNotFound}")
				.setDescription(`{lang:commands.moderation.mute.roleNotFoundDesc|${gConfig.settings.muteRole}|${gConfig.settings.muteRole}|${msg.prefix}}`)
				.setColor(Colors.red)
				.setAuthor(msg.author.tag, msg.author.avatarURL)
				.setTimestamp(new Date().toISOString())
				.toJSON()
		});
	}


	const a = Utility.compareMemberWithRole(msg.channel.guild.members.get(this.bot.user.id), msg.channel.guild.roles.get(gConfig.settings.muteRole));
	if (a.same || a.lower) return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.moderation.mute.invalidRole}")
			.setDescription(`{lang:commands.moderation.mute.invalidRoleDesc|${gConfig.settings.muteRole}|${gConfig.settings.muteRole}|${msg.prefix}}`)
			.setColor(Colors.red)
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setTimestamp(new Date().toISOString())
			.toJSON()
	});

	if (member.roles.includes(gConfig.settings.muteRole)) return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.moderation.mute.alreadyMuted}")
			.setDescription(`{lang:commands.moderation.mute.alreadyMutedDesc|${member.username}#${member.discriminator}|${msg.prefix}|${member.id}}`)
			.setColor(Colors.red)
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setTimestamp(new Date().toISOString()).toJSON()
	});

	if (msg.args.length >= 2) {
		try {
			time = Time.modParsing(msg.args[1]);
			if (!!time) {
				const a = [...msg.args];
				a.splice(1, 1);
				msg.args = a;
			}
		}
		catch (e) {
			if (e instanceof Error) {// for typings, catch clause cannot be annotated (TS1196)
				if (e.name !== "ERR_INVALID_FORMAT") throw e; // rethrow the error if it's not what we expect

				return msg.reply("{lang:other.errors.invalidTime}");
			}
		}
	}

	if (member.id === msg.member.id) return msg.reply("{lang:commands.moderation.noSelf}");
	const b = Utility.compareMembers(member, msg.member);
	if ((b.member1.higher || b.member1.same) && msg.author.id !== msg.channel.guild.ownerID) return msg.reply(`{lang:commands.moderation.mute.noMuteOther|${member.username}#${member.discriminator}}`);
	// if (user.permission.has("administrator")) return msg.channel.createMessage(`<@!${msg.author.id}>, That user has the \`ADMINISTRATOR\` permission, that would literally do nothing.`);
	const reason = msg.args.length >= 2 ? msg.args.splice(1).join(" ") : Language.get(gConfig.settings.lang, "other.words.noReason", false);

	if (!member.bot) m = await member.user.getDMChannel().then(dm => dm.createMessage(Language.parseString(gConfig.settings.lang, `{lang:other.dm.mute${time === 0 ? "Permanent" : ""}|${msg.channel.guild.name}|${Time.ms(time)}|${reason}}\n\n{lang:other.dm.notice}`))).catch(err => null);

	member.addRole(gConfig.settings.muteRole, `Mute: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(async () => {
		await msg.channel.createMessage(`***{lang:commands.moderation.mute.muted|${member.username}#${member.discriminator}|${reason}}***`).catch(noerr => null);
		await this.m.create(msg.channel, {
			type: "mute",
			time,
			reason,
			target: member.user,
			blame: msg.author
		});
		if (time !== 0) await mdb.collection<GlobalTypes.TimedEntry>("timed").insertOne({
			time,
			expiry: Date.now() + time,
			userId: member.id,
			guildId: msg.channel.guild.id,
			type: "mute",
			reason
		} as any); // apparently mongodb's types require specifying "_id" so we'll do this now
	}).catch(async (err) => {
		if (err.name.indexOf("ERR_INVALID_CHAR") !== -1) await msg.reply(`{lang:commands.moderation.mute.englishOnly}`);
		else {
			Logger.error("Mute Command", err);
			await msg.reply(`{lang:commands.moderation.mute.couldNotMute|${member.username}#${member.discriminator}|${err}}`);

			await m.delete();
		}
	});
	if (msg.channel.permissionsOf(this.bot.user.id).has("manageMessages")) msg.delete().catch(error => null);
}));
