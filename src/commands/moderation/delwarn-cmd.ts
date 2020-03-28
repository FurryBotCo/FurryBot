import Command from "../../util/CommandHandler/lib/Command";
import { mdb } from "../../modules/Database";
import Eris from "eris";
import { Utility } from "../../util/Functions";
import config from "../../config";
import Language from "../../util/Language";
import { Colors } from "../../util/Constants";
import Warning from "../../util/@types/Warning";

export default new Command({
	triggers: [
		"delwarn",
		"rmwarn"
	],
	userPermissions: [
		"kickMembers"
	],
	botPermissions: [],
	cooldown: 3e3,
	donatorCooldown: 3e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length < 2) return new Error("ERR_INVALID_USAGE");
	const member = await msg.getMemberFromArgs();

	if (!member) return msg.errorEmbed("INVALID_MEMBER");

	const id = msg.args[1];

	const w = await mdb.collection("warnings").findOne<Warning>({
		guildId: msg.channel.guild.id,
		userId: member.id,
		id
	});

	if (!w) return msg.reply(`{lang:commands.moderation.delwarn.couldNotFind|${member.username}#${member.discriminator}|${id}}`);

	await mdb.collection("warnings").findOneAndDelete({
		guildId: msg.channel.guild.id,
		userId: member.id,
		id
	});

	return msg.reply(`{lang:commands.moderation.delwarn.deleted|${id}|${member.username}#${member.discriminator}}`).then(async () => {
		await this.m.create(msg.channel, {
			type: "delwarn",
			reason: w.reason,
			target: member,
			blame: msg.author,
			oldBlame: w.blameId,
			id
		});
	});
}));
