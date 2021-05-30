import FurryBot from "../main";
import config from "../config";
import { db } from "../db";
import SnipeHandler from "../util/handler/SnipeHandler";
import { ClientEvent, Colors, EmbedBuilder, ErisPermissions } from "core";
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
			const l = [...g.logEvents];
			l.splice(l.indexOf(log), 1);
			await db.table("guilds").get(g.id).update({
				logEvents: l
			}).run(db.conn);
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

	this.bot.emit("messageCreate", message, true);
});
