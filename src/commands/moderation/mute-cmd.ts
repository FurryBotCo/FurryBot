import Command from "../../util/CommandHandler/lib/Command";
import { mdb } from "../../modules/Database";
import Eris from "eris";
import { Utility } from "../../util/Functions";
import config from "../../config";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import Language from "../../util/Language";

export default new Command({
	triggers: [
		"mute",
		"m"
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
	let time = 0;
	// get member from message
	const user = await msg.getMemberFromArgs();

	if (!user) return msg.errorEmbed("INVALID_USER");

	if (gConfig.settings.muteRole === null) return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.moderation.mute.noRole}")
			.setDescription(`{lang:commands.moderation.mute.noRoleDesc|${msg.prefix}}`)
			.setColor(Colors.red)
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setTimestamp(new Date().toISOString())
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
		});
	}


	const a = Utility.compareMemberWithRole(msg.channel.guild.members.get(this.user.id), msg.channel.guild.roles.get(gConfig.settings.muteRole));
	if (a.same || a.lower) return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.moderation.mute.invalidRole}")
			.setDescription(`{lang:commands.moderation.mute.invalidRoleDesc|${gConfig.settings.muteRole}|${gConfig.settings.muteRole}|${msg.prefix}}`)
			.setColor(Colors.red)
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setTimestamp(new Date().toISOString())
	});

	if (user.roles.includes(gConfig.settings.muteRole)) return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.moderation.mute.alreadyMuted}")
			.setDescription(`{lang:commands.moderation.mute.alreadyMutedDesc|${user.username}#${user.discriminator}|${msg.prefix}|${user.id}}`)
			.setColor(Colors.red)
			.setAuthor(msg.author.tag, msg.author.avatarURL)
			.setTimestamp(new Date().toISOString())
	});

	if (msg.args.length > 1 && msg.args[1].match(/[0-9]{1,4}[ymdh]/i)) {
		const labels = {
			h: 3.6e+6,
			d: 8.64e+7,
			m: 2.628e+9,
			y: 3.154e+10
		};
		const t = Number(msg.args[1].slice(0, msg.args[1].length - 1).toLowerCase());
		const i = msg.args[1].slice(msg.args[1].length - 1).toLowerCase();
		if (t < 1) return msg.reply("{lang:commands.moderation.mute.tooLittleTime}");
		if (!Object.keys(labels).includes(i)) return msg.reply("{lang:commands.moderation.invalidTime}");
		const a = [...msg.args];
		a.splice(1, 1);
		msg.args = a;
		time = labels[i] * t;
	}

	if (user.id === msg.member.id && !config.developers.includes(msg.author.id)) return msg.reply("{lang:commands.moderation.noSelf}");
	const b = Utility.compareMembers(msg.member, user);
	if ((b.member2.higher || b.member2.same) && msg.author.id !== msg.channel.guild.ownerID) return msg.reply(`{lang:commands.moderation.mute.noMuteOther|${user.username}#${user.discriminator}}`);
	// if (user.permission.has("administrator")) return msg.channel.createMessage(`<@!${msg.author.id}>, That user has the \`ADMINISTRATOR\` permission, that would literally do nothing.`);
	const reason = msg.args.length >= 2 ? msg.args.splice(1).join(" ") : Language.get(gConfig.settings.lang).get("other.noReason").toString();

	user.addRole(gConfig.settings.muteRole, `Mute: ${msg.author.username}#${msg.author.discriminator} -> ${reason}`).then(async () => {
		await msg.channel.createMessage(`***{lang:commands.moderation.mute.muted|${user.username}#${user.discriminator}|${reason}}***`).catch(noerr => null);
		await this.m.create(msg.channel, {
			type: "mute",
			time,
			reason,
			target: user.user,
			blame: msg.author
		});
		if (time !== 0) await mdb.collection<GlobalTypes.TimedEntry>("timed").insertOne({
			time,
			expiry: Date.now() + time,
			userId: user.id,
			guildId: msg.channel.guild.id,
			type: "mute",
			reason
		} as any); // apparently mongodb's types require specifying "_id" so we'll do this now
	}).catch(async (err) => {
		if (err.name.indexOf("ERR_INVALID_CHAR") !== -1) await msg.reply(`{lang:commands.moderation.mute.englishOnly}`);
		else await msg.reply(`{lang:commands.moderation.mute.couldNotMute|${user.username}#${user.discriminator}|${err}}`);
		/*if (m !== undefined) {
			await m.delete();
		}*/
	});
	if (msg.channel.permissionsOf(this.user.id).has("manageMessages")) msg.delete().catch(error => null);
}));
