import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import { Colors } from "../../util/Constants";
import Eris from "eris";
import { Internal } from "../../util/Functions";
import config from "../../config";
import { mdb } from "../../modules/Database";

export default new Command({
	triggers: [
		"link"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 15e3,
	donatorCooldown: 15e3,
	description: "Look for your Patreon subscription.",
	usage: "",
	features: ["devOnly"],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	const c = await msg.uConfig.premiumCheck();
	if (c.active) return msg.reply(`you are already marked as a donator.\nNote: if something has changed, and you want to refresh it, you can run \`${msg.gConfig.settings.prefix}unlink\` to remove your perks, then run this to gain them again.`);

	const p = await Internal.loopPatrons();

	for (const patron of p) {
		const discord = patron.attributes.social_connections.discord;
		if (discord && patron.payment_data && (discord.user_id === msg.author.id)) {
			await mdb.collection("premium").insertOne({
				type: "user",
				amount: patron.payment_data.amount_cents / 100,
				activationDate: new Date(patron.payment_data.created_at).getTime(),
				active: true,
				patronId: patron.id,
				userId: msg.author.id
			} as GlobalTypes.PremiumUserEntry);

			const dm = await msg.author.getDMChannel();

			const embed: Eris.EmbedOptions = {
				title: "Successfully Linked!",
				description: `Thanks for donating! Donator perks are still in beta, so they may be a bit buggy on being enabled.\nIf you need any help, you can ask in our support server: ${config.bot.supportInvite}.`,
				color: Colors.gold,
				timestamp: new Date().toISOString()
			};

			if (!dm) await msg.channel.createMessage({ embed });
			else await dm.createMessage({ embed }).catch(err => msg.channel.createMessage({ embed }));

			await this.executeWebhook(config.webhooks.logs.id, config.webhooks.logs.token, {
				embeds: [
					{
						author: {
							name: msg.author.tag,
							icon_url: msg.author.avatarURL
						},
						description: `User ${msg.author.tag} (${msg.author.id}) linked their patreon account **${patron.attributes.full_name}** with the donation amount $${patron.payment_data.amount_cents / 100}, and has recieved donator perks.`,
						color: Colors.gold,
						timestamp: new Date().toISOString()
					}
				],
				username: `Furry Bot Donation Logs${config.beta ? " - Beta" : ""}`,
				avatarURL: "https://i.furry.bot/furry.png"
			});

			return msg.reply(`successfully linked your Discord account to Patreon. If you need any help, you can visit our support server here: ${config.bot.supportInvite}`);
		}

		return msg.reply(`we were unable to link your Discord account with your Patreon account. Make sure you have donated, and that the payment was successful. If you need more help, you can visit us here: ${config.bot.supportInvite}`);
	}
}));
