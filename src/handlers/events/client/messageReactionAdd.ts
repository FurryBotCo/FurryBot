import ClientEvent from "../../../modules/ClientEvent";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../../../config";
import { mdb } from "../../../modules/Database";
import GuildConfig from "../../../modules/config/GuildConfig";
import uuid from "uuid/v4";
import functions from "../../../util/functions";

export default new ClientEvent("messageReactionAdd", (async function (this: FurryBot, m, emoji, userID) {

	/*await this.track("clientEvent", "events.messageReactionAdd", {
		hostname: this.f.os.hostname(),
		beta: config.beta,
		clientId: config.bot.clientID,
		msg: {
			id: m.id,
			channelId: m.channel.id
		},
		emoji,
		userID
	}, new Date());*/

	return;

	if (!config.beta) return;

	console.log(emoji);

	let t;
	if (emoji.id !== null) t = `<${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>`;
	else t = emoji.name;

	const msg = await m.channel.getMessage(m.id);
	const user: Eris.User = this.users.has(userID) ? this.users.get(userID) : await this.getRESTUser(userID).catch(err => null);
	if (!user || user.bot /*|| msg.author.id === user.id*/) return;

	let gConfig: GuildConfig = await mdb.collection("guilds").findOne({ id: msg.member.guild.id });

	if (!gConfig) {
		await mdb.collection("guilds").insertOne({ id: msg.member.guild.id, ...config.defaults.guildConfig });

		gConfig = await mdb.collection("guilds").findOne({ id: msg.member.guild.id });
	}

	gConfig = new GuildConfig(msg.member.guild.id, gConfig);

	if (!gConfig.pawboard) gConfig.edit({ pawboard: config.defaults.guildConfig.pawboard });

	console.log(gConfig.pawboard.emoji);
	console.log(t);
	console.log(gConfig.pawboard.emoji === t);

	if (!gConfig.pawboard.channel || !msg.member.guild.channels.has(gConfig.pawboard.channel) || gConfig.pawboard.emoji !== t) return;

	const st = await mdb.collection("pawboard").findOne({ messageId: msg.id });

	const ch: Eris.TextChannel = await msg.member.guild.channels.get(gConfig.pawboard.channel) as Eris.TextChannel;

	if (!st) {
		let pbMsg: Eris.Message;
		// st = await mdb.collection("pawboard").findOne({ messageId: msg.id });
		if (msg.attachments.length < 0) {
			pbMsg = await ch.createMessage({
				embed: {
					title: `${gConfig.pawboard.emoji} 1 in <#${msg.channel.id}>`
				}
			}, {
				name: msg.attachments[0].filename,
				file: await this.f.getImageFromURL(msg.attachments[0].url)
			});
		} else {
			pbMsg = await ch.createMessage(`${gConfig.pawboard.emoji} 1\n${!msg.content ? "" : msg.content}`);
		}


		return mdb.collection("starboard").insertOne({ guildId: msg.member.guild.id, channelId: msg.channel.id, messageId: msg.id, id: uuid(), count: 1, pbMsgId: pbMsg.id });
	}

	const pbMsg = await ch.getMessage(st.pbMsgId);

	if (!pbMsg) return mdb.collection("starboard").findOneAndDelete({ pbMsgId: st.pbMsgId });

	await pbMsg.edit(`${gConfig.pawboard.emoji} ${st.count + 1}\n${pbMsg.content.split("\n")[1]}`);

	return mdb.collection("pawboard").findOneAndUpdate({ messageId: msg.id }, { $set: { count: st.count + 1 } });
}));