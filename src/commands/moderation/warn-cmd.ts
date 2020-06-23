import Command from "../../modules/CommandHandler/Command";
import { Strings } from "../../util/Functions";
import Language from "../../util/Language";
import db, { mdb } from "../../modules/Database";

export default new Command({
	triggers: [
		"warn"
	],
	permissions: {
		user: [
			"manageMessages"
		],
		bot: []
	},
	cooldown: 2e3,
	donatorCooldown: 2e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const member = await msg.getMemberFromArgs();

	if (!member) return msg.errorEmbed("INVALID_MEMBER");

	const reason = msg.args.length > 1 ? msg.args.slice(1).join(" ") : Language.get(gConfig.settings.lang, "other.words.noReason", false);
	if (reason.length > 100) return msg.reply(Language.get(gConfig.settings.lang).get("other.error.tooLong").format("a warning", "100"));
	const id = await db.getWarningEntryId(msg.channel.guild.id, member.id);
	const w = await mdb.collection<Warning>("warnings").insertOne({
		blameId: msg.author.id,
		guildId: msg.channel.guild.id,
		userId: member.id,
		id,
		reason,
		date: Date.now()
	});


	await msg.channel.createMessage(`***{lang:commands.moderation.warn.warned|${member.username}#${member.discriminator}|${reason}}***`).then(async () => {
		await this.m.create(msg.channel, {
			type: "warn",
			target: member,
			blame: msg.author,
			reason,
			id
		});
	});

	if (msg.channel.permissionsOf(this.bot.user.id).has("manageMessages")) await msg.delete().catch(error => null);
}));
