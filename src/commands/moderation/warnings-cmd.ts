import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";
import phin from "phin";
import * as Eris from "eris";
import { db, mdb, mongo } from "../../modules/Database";
import Warning from "../../util/@types/Warning";
import chunk from "chunk";

export default new Command({
	triggers: [
		"warnings",
		"warnlog"
	],
	userPermissions: [
		"kickMembers"
	],
	botPermissions: [],
	cooldown: 3e3,
	donatorCooldown: 3e3,
	description: "Add a warning to someone.",
	usage: "<@member/id> [page]",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	const member = await msg.getMemberFromArgs();

	if (!member) return msg.errorEmbed("INVALID_MEMBER");

	const w: Warning[] = await mdb.collection("warnings").find({ userId: member.id, guildId: msg.channel.guild.id } as Warning).toArray().then((res: Warning[]) => res.sort((a, b) => a.date - b.date));
	if (w.length === 0) return msg.reply(`couldn't find any warnings for the user **${member.username}#${member.discriminator}**.`);

	const fields = chunk(await Promise.all(w.map(async (k: Warning, i) => {
		const u = await this.getRESTUser(k.blameId);
		return {
			name: `Warning #${i + 1}`,
			value: `Blame: ${u.username}#${u.discriminator}\nReason: ${k.reason}\nDate: ${new Date(k.date).toDateString()}\nID: ${k.id}`,
			inline: false
		};
	}, 5)));

	let p;
	if (msg.args.length > 1) {
		const pg = parseInt(msg.args[1], 10);
		if (isNaN(pg) || !pg || pg < 1 || pg > fields.length) return msg.reply("invalid page number.");
		p = pg;
	} else p = 1;

	const embed: Eris.EmbedOptions = {
		title: `Warnings for ${member.username}#${member.discriminator}`,
		fields: fields[p - 1],
		timestamp: new Date().toISOString(),
		color: this.f.randomColor()
	};

	return msg.channel.createMessage({
		embed
	});
}));
