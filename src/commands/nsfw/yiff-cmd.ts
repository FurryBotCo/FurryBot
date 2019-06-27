import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@src/util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";

export default new Command({
	triggers: [
		"yiff"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 3e3,
	description: "Get some yiff!",
	usage: "[gay/straight]",
	nsfw: true,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	let extra, type, embed, short;
	extra = "";
	if (msg.args.length === 0) {
		for (let ytype of config.yiff.types) {
			if (msg.channel.name.indexOf(ytype) !== -1) type = ytype;
		}

		if (!type) {
			type = config.yiff.types[0];
			if (!this.yiffNoticeViewed.has(msg.channel.guild.id)) {
				this.yiffNoticeViewed.add(msg.channel.guild.id);
				extra += `Showing default yiff type **${type}**\nTo change this, add one of these values somewhere in the channel __name__: **${config.yiff.types.join("**, **")}**.\n\n`;
			}
		}

	} else {
		type = msg.args.join(" ");
		if (!config.yiff.types.includes(type)) {
			embed = {
				title: "Invalid yiff type",
				description: `The type you provided **${type}** is invalid, valid types are: **${config.yiff.types.join("**, **")}**.`
			};
			Object.assign(embed, msg.embed_defaults());
			return msg.channel.createMessage({ embed });
		}
	}

	const img = await functions.imageAPIRequest(false, `yiff/${type}`, true, false);
	if (img.success !== true) {
		if (typeof img.error === "object") return msg.channel.createMessage(`<@!${msg.author.id}>, API Error:\nCode: ${img.error.code}\nDescription: \`${img.error.description}\``);
		else return msg.channel.createMessage(`<@!${msg.author.id}>, API Error:\n${img.error}`);
	}
	short = await functions.shortenURL(img.response.image);
	extra += short.new ? `**this is the first time this has been viewed! Image #${short.linkNumber}**\n\n` : "";
	return msg.channel.createMessage(`${extra}Short URL: <${short.link}${config.beta ? "?beta" : ""}>\n\nType: ${type}\n\nRequested By: ${msg.author.username}#${msg.author.discriminator}`, {
		file: await functions.getImageFromURL(img.response.image),
		name: img.response.name
	});
}));