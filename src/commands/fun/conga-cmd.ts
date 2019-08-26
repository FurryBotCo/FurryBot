import FurryBot from "@FurryBot";
import ExtendedMessage from "../../modules/extended/ExtendedMessage";
import Command from "../../modules/cmd/Command";
import * as Eris from "eris";
import functions from "../../util/functions";
import * as util from "util";
import phin from "phin";
import config from "../../config";

export default new Command({
	triggers: [
		"conga"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 5e3,
	donatorCooldown: 2.5e3,
	description: "Start a conga with someone, or join in!",
	usage: "[@user]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	if (msg.args.length === 0) {
		if (msg.channel.conga !== undefined && msg.channel.conga.active) {
			if (msg.channel.conga.inConga.includes(msg.author.id) && !msg.user.isDeveloper) return msg.channel.createMessage(`<@!${msg.author.id}>, you are already in this conga!`);
			clearTimeout(msg.channel.conga.timeout);
			msg.channel.conga.inConga.push(msg.author.id);
			const txt = "<a:furdancing:596817635023519777>".repeat(msg.channel.conga.inConga.length);
			msg.channel.createMessage(`<@!${msg.author.id}> joined a conga with <@!${msg.channel.conga.member.id}>!\n<@!${msg.channel.conga.member.id}> now has ${msg.channel.conga.inConga.length} furs congaing them!\nJoin in using \`${msg.gConfig.prefix}conga\`.\n${msg.channel.conga.inConga.length > 30 ? "This conga line is too long for emojis!" : txt}`);
			msg.channel.conga.timeout = setTimeout((ch) => {
				delete ch.conga;
			}, 6e4, msg.channel);
			return;
		}
		else return new Error("ERR_INVALID_USAGE");
	} else {
		const member = await msg.getMemberFromArgs();
		if (!member) return msg.errorEmbed("INVALID_USER");
		await msg.channel.createMessage(`<@!${msg.author.id}> started a conga with <@!${member.id}>!\nJoin in using \`${msg.gConfig.prefix}conga\`.\n<a:furdancing:596817635023519777><a:furdancing:596817635023519777>`);
		msg.channel.conga = {
			active: true,
			member,
			inConga: [],
			timeout: setTimeout((ch) => {
				delete ch.conga;
			}, 6e4, msg.channel)
		};
		return msg.channel.conga.inConga.push(msg.author.id, member.id);
	}
}));