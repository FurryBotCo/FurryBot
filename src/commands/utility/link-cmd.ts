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
		"link"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 15e3,
	donatorCooldown: 15e3,
	description: "Look for your Patreon subscription.",
	usage: "",
	features: []
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	if (msg.uConfig.patreon.donator) return msg.reply("you are already marked as a donator.");

	const p = await this.f.loopPatrons();

	for (const patron of p) {
		const discord = patron.attributes.social_connections.discord;
		if (discord && patron.payment_data && (discord.user_id === msg.author.id)) {
			await msg.uConfig.edit({
				patreon: {
					amount: patron.payment_data.amount_cents / 100,
					createdAt: new Date(patron.payment_data.created_at).getTime(),
					declinedAt: new Date(patron.payment_data.declined_id).getTime(),
					donator: true,
					patronId: patron.id
				}
			}).then(d => d.reload());

			const dm = await msg.author.getDMChannel();

			const embed: Eris.EmbedOptions = {
				title: "Successfully Linked!",
				description: `Thanks for donating! Donator perks are still in beta, so they may be a bit buggy on being enabled. You can gain some extra ${config.eco.emoji} by using \`${msg.gConfig.settings.prefix}redeem\`.`,
				color: this.f.randomColor(),
				timestamp: new Date().toISOString()
			};

			if (!dm) await msg.channel.createMessage({ embed });
			try {
				await dm.createMessage({ embed });
			} catch (e) {
				await msg.channel.createMessage({ embed });
			}

			await this.executeWebhook(config.webhooks.logs.id, config.webhooks.logs.token, {
				embeds: [
					{
						author: {
							name: msg.author.tag,
							icon_url: msg.author.avatarURL
						},
						description: `User ${msg.author.tag} (${msg.author.id}) linked their patreon account **${patron.attributes.full_name}** with the donation amount $${patron.payment_data.amount_cents / 100}, and has recieved donator perks.`
					}
				],
				username: `Furry Bot Donation Logs${config.beta ? " - Beta" : ""}`,
				avatarURL: "https://i.furry.bot/furry.png"
			});

			return msg.reply(`Successfully linked your Discord account to Patreon, if you need any help, you can visit our support server here: ${config.bot.supportInvite}`);
		}

		return msg.reply(`We were unable to link your Discord account with your Patreon account, make sure you have donated, and that the payment was successful. If you need more help, you can visit us here: ${config.bot.supportInvite}`);
	}
}));
