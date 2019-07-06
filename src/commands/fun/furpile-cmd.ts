import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";

export default new Command({
	triggers: [
		"furpile"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 5e3,
	description: "Start a furpile on someone, or join in!",
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
		if (msg.channel.furpile !== undefined && msg.channel.furpile.active) {
			if (msg.channel.furpile.inPile.includes(msg.author.id) && !msg.user.isDeveloper) return msg.channel.createMessage(`<@!${msg.author.id}>, you are already in this furpile!`);
			clearTimeout(msg.channel.furpile.timeout);
			msg.channel.furpile.inPile.push(msg.author.id);
			msg.channel.createMessage(`<@!${msg.author.id}> joined a furpile on <@!${msg.channel.furpile.member.id}>!\n<@!${msg.channel.furpile.member.id}> now has ${msg.channel.furpile.inPile.length} furs on them!\nJoin in using \`${msg.gConfig.prefix}furpile\`.`);
			msg.channel.furpile.timeout = setTimeout((ch) => {
	delete ch.furpile;
			}, 6e4, msg.channel);
			return;
		}
		else return new Error("ERR_INVALID_USAGE");
	} else {
		const member = await msg.getMemberFromArgs();
		if (!member) return msg.errorEmbed("INVALID_USER");
		await msg.channel.createMessage(`<@!${msg.author.id}> started a furpile on <@!${member.id}>!\nJoin in using \`${msg.gConfig.prefix}furpile\`.`);
		msg.channel.furpile = {
			active: true,
			member,
			inPile: [],
			timeout: setTimeout((ch) => {
	delete ch.furpile;
			}, 6e4, msg.channel)
		};
		return msg.channel.furpile.inPile.push(msg.author.id, member.id);
	}
}));