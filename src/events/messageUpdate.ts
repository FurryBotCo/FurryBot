import FurryBot from "../main";
import config from "../config";
import db from "../db";
import SnipeHandler from "../util/handler/SnipeHandler";
import { ClientEvent, Colors, EmbedBuilder, ErisPermissions, ExtendedMessage } from "core";
import Eris from "eris";

export default new ClientEvent<FurryBot>("messageUpdate", async function (message, oldMessage) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	if (!this || !message || !message.author || !oldMessage || !(message.content && oldMessage.content) || ![Eris.Constants.ChannelTypes.GUILD_NEWS, Eris.Constants.ChannelTypes.GUILD_STORE, Eris.Constants.ChannelTypes.GUILD_TEXT].includes(message.channel.type as any) || message.content === oldMessage.content || (config.beta && !config.developers.includes(message.author.id))) return;
	// might do some different handling later, for now we just toss it out
	if (message.type !== Eris.Constants.MessageTypes.DEFAULT) return;

	// we want to get bots here so we don't check bots yet
	const { guild } = (message.channel as Eris.AnyGuildChannel);
	const g = await db.getGuild(guild.id).then(v => v.fix());
	const e = g.logEvents.filter(l => l.type === "messageEdit");
	for (const log of e) {
		const ch = guild.channels.get(log.channel) as Eris.GuildTextableChannel;
		if (!ch || !(["viewChannel", "sendMessages"] as Array<ErisPermissions>).some(perm => ch.permissionsOf(this.bot.user.id).has(perm))) {
			await g.mongoEdit({
				$pull: {
					logEvents: log
				}
			});
			continue;
		}

		const eb = new EmbedBuilder(g.settings.lang)
			.setColor(Colors.orange)
			.setTimestamp(new Date().toISOString())
			.setAuthor(guild.name, guild.iconURL ?? undefined)
			.setTitle("{lang:other.events.messageUpdate.title}")
			.setDescription([
				`{lang:other.words.message$ucwords$}: [{lang:other.words.jump$ucwords$} {lang:other.words.to$ucwords$}](${message.jumpLink})`,
				`{lang:other.words.author$ucwords$}: **${message.author.username}#${message.author.discriminator}** <@!${message.author.id}>`,
				`{lang:other.words.channel$ucwords$}: <#${message.channel.id}>`
			].join("\n"))
			.addField(
				"{lang:other.words.old$ucwords$} {lang:other.words.content$ucwords$}",
				oldMessage.content.slice(0, 1000) || "{lang:other.words.none$upper$}",
				false
			)
			.addField(
				"{lang:other.words.new$ucwords$} {lang:other.words.content$ucwords$}",
				message.content.slice(0, 1000) || "{lang:other.words.none$upper$}",
				false
			);

		await ch.createMessage({
			embed: eb.toJSON()
		});
	}

	if (message.author.bot) return;


	SnipeHandler.add("edit", message.channel.id, {
		oldContent: oldMessage.content,
		newContent: message.content,
		author: message.author.id,
		time: new Date().toISOString()
	});

	const msg = new ExtendedMessage({
		id: message.id,
		channel_id: message.channel.id,
		guild_id: guild.id,
		author: {
			...message.author.toJSON(),
			public_flags: message.author.publicFlags
		},
		member: {
			...message.member,
			user: {
				...message.author.toJSON(),
				public_flags: message.author.publicFlags
			},
			joined_at: new Date(message.member?.joinedAt ?? 0).toISOString(),
			premium_since: message.member?.premiumSince,
			deaf: !!message.member?.voiceState.deaf,
			mute: !!message.member?.voiceState.mute,
			pending: message.member?.pending
		},
		content: message.content,
		timestamp: new Date(message.timestamp).toISOString(),
		edited_timestamp: new Date(message.editedTimestamp ?? 0).toISOString(),
		tts: !!message.tts,
		mention_everyone: message.mentionEveryone,
		mentions: message.mentions.map(m => ({
			...m.toJSON(),
			public_flags: m.publicFlags,
			// I don't know what this is supposed to have, as the docs don't make
			// a distinction between normal members and partial members
			member: {
				...message.member,
				user: {
					...message.author.toJSON(),
					public_flags: message.author.publicFlags
				},
				joined_at: new Date(message.member?.joinedAt ?? 0).toISOString(),
				premium_since: message.member?.premiumSince,
				deaf: !!message.member?.voiceState.deaf,
				mute: !!message.member?.voiceState.mute,
				pending: message.member?.pending
			}
		})),
		mention_roles: message.roleMentions,
		mention_channels: message.channelMentions,
		attachments: message.attachments,
		embeds: message.embeds,
		reactions: Object.entries(message.reactions).map(([k, v]) => ({
			count: v.count,
			me: v.me,
			emoji: k.indexOf(":") !== -1 ? {
				id: null,
				name: k
			} : {
				id: k.split(":")[0],
				name: k.split(":")[1]
			}
		})),
		pinned: !!message.pinned,
		webhook_id: message.webhookID,
		type: message.type,
		activity: message.activity,
		application: message.application,
		application_id: message.application?.id,
		message_reference: message.messageReference === null ? undefined : {
			message_id: message.messageReference.messageID,
			channel_id: message.messageReference.channelID,
			guild_id: message.messageReference.guildID
		},
		flags: message.flags,
		stickers: message.stickers,
		// I'm not doing all of this garbage a second time
		referenced_message: undefined,
		interaction: null,
		components: message.components
	}, this);
	this.client.emit("messageCreate", msg, true, false, undefined);
});
