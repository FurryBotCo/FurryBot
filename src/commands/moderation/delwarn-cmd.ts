import Command from "../../modules/CommandHandler/Command";
import Language from "../../util/Language";
import { mdb } from "../../modules/Database";
import CommandError from "../../modules/CommandHandler/CommandError";

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
	if (msg.args.length < 2) return new CommandError("ERR_INVALID_USAGE", cmd);
	const member = await msg.getMemberFromArgs();

	if (!member) return msg.errorEmbed("INVALID_MEMBER");

	const id = isNaN(Number(msg.args[1])) ? msg.args[1] /* assume legacy */ : Number(msg.args[1]);

	const w = await mdb.collection<Warning>("warnings").findOne({
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

	return msg.reply(`{lang:commands.moderation.delwarn.deleted${isNaN(Number(id)) ? "Legacy" : ""}|${id}|${member.username}#${member.discriminator}}`).then(async () => {
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
