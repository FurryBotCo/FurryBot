import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import * as Eris from "eris";
import Logger from "../../../LoggerV8";
import { Utility, Request } from "../../../Functions";

export default {
	handleImage: (async function (client: FurryBot, msg: ExtendedMessage, path: string, extra?: { avatars?: string[]; usernames?: string[]; text?: string; fileType?: string; }) {
		let imgurl, j;
		if (msg.args.length >= 1) {
			// get member from message
			const user = await msg.getMemberFromArgs();

			imgurl = user instanceof Eris.Member ? `${user.user.staticAvatarURL.split("?")[0]}?size=2048` : msg.args.join("%20");
		} else if (msg.attachments[0]) imgurl = msg.attachments[0].url;
		else imgurl = `${msg.author.staticAvatarURL.split("?")[0]}?size=2048`;
		if (!imgurl) return msg.reply("please either attach an image or provide a url");
		const test = await Utility.validateURL(imgurl);
		if (!test) return msg.reply("either what you provided wasn't a valid url, or the server responded with a non-200 OK response.\n(either provide a link to an image, a user mention, or nothing.)");
		// const req = await client.f.memeRequest(`/${path}`, extra && extra.avatars && extra.avatars.length > 0 ? extra.avatars : [], extra && extra.usernames && extra.usernames.length > 0 ? extra.usernames : [], text);
		const req = await Request.memeRequest(`/${path}`, [imgurl, ...(extra && extra.avatars && extra.avatars.length > 0 ? extra.avatars : [])], extra && extra.usernames && extra.usernames.length > 0 ? extra.usernames : [], extra && extra.text ? extra.text : null);
		if (req.statusCode !== 200) {
			try {
				j = { status: req.statusCode, message: req.body.toString() };
			} catch (error) {
				j = { status: req.statusCode, message: req.body };
			}
			msg.reply(`API eror:\nStatus: ${j.status}\nMessage: ${j.message}`);
			return Logger.log(`Shard #${msg.channel.guild.shard.id}`, `imgurl: ${imgurl}`);
		}
		return msg.channel.createMessage("", {
			file: req.body,
			name: `${path}.${extra && extra.fileType ? extra.fileType : "png"}`
		}).catch(err => msg.reply(`Error sending: ${err}`));
	}),
	handleText: (async function (client: FurryBot, msg: ExtendedMessage, path: string, extra?: { avatars?: string[]; usernames?: string[]; }) {

		let j;
		let text = msg.args.join(" ");
		// replace mentions with usernames
		if (msg.mentions.length > 0) {
			msg.mentions.map(m => text = text.replace(new RegExp(`<@\!?${m.id}>`, "ig"), m.username));
		}
		if (!text) text = "Provide Some Text";
		const req = await Request.memeRequest(`/${path}`, extra && extra.avatars && extra.avatars.length > 0 ? extra.avatars : [], extra && extra.usernames && extra.usernames.length > 0 ? extra.usernames : [], text);
		if (req.statusCode !== 200) {
			try {
				j = { status: req.statusCode, message: req.body.toString() };
			} catch (error) {
				j = { status: req.statusCode, message: req.body };
			}
			msg.reply(`API eror:\nStatus: ${j.status}\nMessage: ${j.message}`);
			return Logger.log(`Shard #${msg.channel.guild.shard.id}`, `text: ${text}`);
		}
		return msg.channel.createMessage("", {
			file: req.body,
			name: `${path}.png`
		}).catch(err => msg.reply(`Error sending: ${err}`));
	})
};
