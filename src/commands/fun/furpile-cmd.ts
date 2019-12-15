import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "clustersv2";
import phin from "phin";
import * as Eris from "eris";
import { db, mdb, mongo } from "../../modules/Database";

export default new Command({
	triggers: [
		"furpile"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 5e3,
	donatorCooldown: 2.5e3,
	description: "Start a furpile on someone, or join in!",
	usage: "[@user]",
	features: []
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	if (msg.args.length === 0) {
		if (msg.channel.furpile !== undefined && msg.channel.furpile.active) {
			if (msg.channel.furpile.inPile.includes(msg.author.id) && !msg.user.isDeveloper) return msg.channel.createMessage(`<@!${msg.author.id}>, you are already in this furpile!`);
			clearTimeout(msg.channel.furpile.timeout);
			msg.channel.furpile.inPile.push(msg.author.id);
			msg.channel.createMessage(`<@!${msg.author.id}> joined a furpile on <@!${msg.channel.furpile.member.id}>!\n<@!${msg.channel.furpile.member.id}> now has ${msg.channel.furpile.inPile.length} furs on them!\nJoin in using \`${msg.gConfig.settings.prefix}furpile\`.`);
			msg.channel.furpile.timeout = setTimeout((ch) => {
				delete ch.furpile;
			}, 3e5, msg.channel);
			return;
		}
		else throw new Error("ERR_INVALID_USAGE");
	} else {
		const member = await msg.getMemberFromArgs();
		if (!member) return msg.errorEmbed("INVALID_USER");
		await msg.channel.createMessage(`<@!${msg.author.id}> started a furpile on <@!${member.id}>!\nJoin in using \`${msg.gConfig.settings.prefix}furpile\`.`);
		msg.channel.furpile = {
			active: true,
			member,
			inPile: [],
			timeout: setTimeout((ch) => {
				delete ch.furpile;
			}, 3e5, msg.channel)
		};
		return msg.channel.furpile.inPile.push(msg.author.id, member.id);
	}
}));
