import Command from "../../modules/CommandHandler/Command";
import Eris from "eris";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Time, Utility } from "../../util/Functions";
import Language from "../../util/Language";
import { mdb } from "../../modules/Database";
import Warning from "../../util/@types/Warning";

export default new Command({
	triggers: [
		"delwarn",
		"rmwarn"
	],
	permissions: {
		user: [
			"kickMembers"
		],
		bot: []
	},
	cooldown: 2e3,
	donatorCooldown: 2e3,
	restrictions: [],
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
