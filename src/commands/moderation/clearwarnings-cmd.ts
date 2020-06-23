import Command from "../../modules/CommandHandler/Command";
import Eris from "eris";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Time, Utility } from "../../util/Functions";
import Language from "../../util/Language";
import { mdb } from "../../modules/Database";
import CommandError from "../../modules/CommandHandler/CommandError";

export default new Command({
	triggers: [
		"clearwarnings"
	],
	permissions: {
		user: [
			"administrator"
		],
		bot: []
	},
	cooldown: 2e3,
	donatorCooldown: 2e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length < 1) return new CommandError("ERR_INVALID_USAGE", cmd);
	const member = await msg.getMemberFromArgs();

	if (!member) return msg.errorEmbed("INVALID_MEMBER");

	const w = await mdb.collection<Warning>("warnings").find({
		guildId: msg.channel.guild.id,
		userId: member.id
	}).toArray();

	await Promise.all(w.map(async (j) => mdb.collection<Warning>("warnings").findOneAndDelete({ id: j.id })));

	return msg.reply(`{lang:commands.moderation.clearwarnings.cleared|${member.username}#${member.discriminator}}`).then(async () => {
		await this.m.create(msg.channel, {
			type: "clearwarnings",
			target: member,
			blame: msg.author,
			totalWarnings: w.length
		});
	});
}));
