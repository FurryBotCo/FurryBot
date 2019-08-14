import FurryBot from "@FurryBot";
import ExtendedMessage from "../../modules/extended/ExtendedMessage";
import Command from "../../modules/cmd/Command";
import * as Eris from "eris";
import functions from "../../util/functions";
import * as util from "util";
import phin from "phin";
import config from "../../config/config";

export default new Command({
	triggers: [
		"awoo",
		"howl"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 5e3,
	description: "Start a howl, or join in!",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {

	if (msg.channel.awoo !== undefined && msg.channel.awoo.active) {
		if (msg.channel.awoo.inAwoo.includes(msg.author.id) && !msg.user.isDeveloper) return msg.channel.createMessage(`<@!${msg.author.id}>, you are already in this awoo!`);
		clearTimeout(msg.channel.awoo.timeout);
		msg.channel.awoo.inAwoo.push(msg.author.id);
		const txt = "<:Awoo:596965580481888258>".repeat(msg.channel.awoo.inAwoo.length);
		msg.channel.createMessage(`<@!${msg.author.id}> joined a howl with ${msg.channel.awoo.inAwoo.length} furs!\nJoin in using \`${msg.gConfig.prefix}awoo\`.\n${msg.channel.awoo.inAwoo.length > 30 ? "This howl is too large for emojis!" : txt}`);
		msg.channel.awoo.timeout = setTimeout((ch) => {
			delete ch.awoo;
		}, 6e4, msg.channel);
	} else {
		await msg.channel.createMessage(`<@!${msg.author.id}> started a howl!\nJoin in using \`${msg.gConfig.prefix}awoo\`.\n<:Awoo:596965580481888258>`);
		msg.channel.awoo = {
			active: true,
			inAwoo: [],
			timeout: setTimeout((ch) => {
				delete ch.awoo;
			}, 6e4, msg.channel)
		};
		return msg.channel.awoo.inAwoo.push(msg.author.id);
	}
}));