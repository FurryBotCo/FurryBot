import { Route } from "..";
import config from "../../config";
import UserConfig from "../../util/config/UserConfig";
import { Colors } from "../../util/Constants";
import db from "../../util/Database";
import EmbedBuilder from "../../util/EmbedBuilder";
import Time from "../../util/Functions/Time";

export default class InfoRoute extends Route {
	constructor() {
		super("/donate");
	}

	setup() {
		super.setup();
		const app = this.app;
		const client = this.client;

		app
			.get("/", async (req, res) => {
				if (!req.data.user) {
					req.data.return = req.originalUrl;
					return res.redirect("/socials/discord");
				}

				return res.status(200).render("donate/index");
			})
			.get("/ko-fi/setup", async (req, res) => {
				if (!req.data.user) {
					req.data.return = req.originalUrl;
					return res.redirect("/socials/discord");
				}

				const user = await db.getUser(req.data.user.id);

				if (user.donations["ko-fi"].name) return res.redirect("/donate/ko-fi/go");

				return res.status(200).render("donate/ko-fi/setup", {
					username: req.data.user.username,
					discriminator: req.data.user.discriminator
				});
			})
			.get("/ko-fi/go", async (req, res) => {
				if (!req.data.user) {
					req.data.return = req.originalUrl;
					return res.redirect("/socials/discord");
				}

				const user = await db.getUser(req.data.user.id);
				if (!user.donations["ko-fi"].name) return res.redirect("/donate/ko-fi/setup");

				return res.status(200).render("donate/ko-fi/setup-done", {
					link: config.client.socials["ko-fi"],
					name: user.donations["ko-fi"].name,
					supportServer: config.client.socials.discord
				});
			})
			.post("/ko-fi/setup", async (req, res) => {
				if (!req.data.user) {
					req.data.return = req.originalUrl;
					return res.redirect("/socials/discord");
				}

				const user = await db.getUser(req.data.user.id);

				await user.edit({
					donations: {
						"ko-fi": {
							name: req.body.name
						}
					}
				});

				return res.redirect("/donate/ko-fi/go");
			})
			.post("/ko-fi/count", async (req, res) => {
				if (req.query.auth?.toString() !== config.apis["ko-fi"].webhookKey) return res.status(401).json({
					success: false,
					error: "Invalid authentication."
				});

				let b: {
					[k: string]: any;
				};
				try {
					b = JSON.parse(req.body.data);
				} catch (e) {
					return res.status(400).json({
						success: false,
						error: "Invalid body."
					});
				}

				if (b.type.toLowerCase() !== "donation") return res.status(204).end();

				const user = await db.collection("users").findOne({
					"donations.ko-fi.name": new RegExp(b.from_name, "i")
				}).then(v => !v ? null : new UserConfig(v.id, v));
				const u = !user ? null : await client.bot.getRESTUser(user.id);

				const pub = !!b.is_public;

				const e = new EmbedBuilder(config.devLanguage)
					.setTitle("{lang:other.donations.ko-fi.title}")
					.setThumbnail("https://assets.furry.bot/donate/ko-fi/icon.png")
					.setColor(Colors.gold)
					.setTimestamp(new Date().toISOString())
					.setAuthor(pub ? !u ? b.from_name : `${u.username}#${u.discriminator}` : "{lang:other.words.private$ucwords$}", pub && u ? u.avatarURL : null)
					.setDescription(pub ? b.message : "[{lang:other.words.message$ucwords$} {lang:other.words.hidden$ucwords$}]")
					.setFooter(`{lang:other.words.amount$ucwords$}: ${[null, "USD"].includes(b.currency) ? `$${b.amount}` : `${b.amount} ${b.currency}`} | {lang:other.donations.ko-fi.user}: ${pub ? b.from_name : "{lang:other.words.private$ucwords$}"}`, client.bot.user.avatarURL);

				await client.w.get("donations").execute({
					embeds: [
						e.toJSON()
					]
				});
				let d: boolean;

				if (user && u) {
					await user.edit({
						donations: {
							totalMonths: user.donations.totalMonths + 1
						}
					});

					d = await u.getDMChannel().then(dm => dm.createMessage({
						embed: new EmbedBuilder(config.devLanguage)
							.setTitle("{lang:other.donations.ko-fi.dmTitle}")
							.setDescription(`{lang:other.donations.ko-fi.dmDescription|${user.donations.totalMonths}}`)
							.setFooter(`{lang:other.donations.ko-fi.dmFooter|${config.emojis.default.blueHeart}}`, client.bot.user.avatarURL)
							.setTimestamp(new Date().toISOString())
							.setColor(Colors.gold)
							.setAuthor(`${u.username}#${u.discriminator}`, u.avatarURL)
							.toJSON()
					})).then(() => true).catch(() => false);
				}

				e
					.setDescription(b.message)
					.setTimestamp(new Date().toISOString())
					.addField("{lang:other.donations.ko-fi.extraInfo}", [
						`{lang:other.donations.ko-fi.messageId}: \`${b.message_id}\``,
						`{lang:other.donations.ko-fi.transactionId}: \`${b.kofi_transaction_id}\``,
						`{lang:other.donations.ko-fi.timestamp}: ${Time.formatDateWithPadding(new Date(b.timestamp).getTime(), true, false)}`,
						`{lang:other.donations.ko-fi.public}: ${pub ? "{lang:other.words.yes$ucwords$}" : "{lang:other.words.no$ucwords$}"}`,
						`{lang:other.donations.ko-fi.email}: ${b.email || "{lang:other.words.none$upper$}"}`,
						`{lang:other.donations.ko-fi.subscription}: ${b.is_subscription_payment ? "{lang:other.words.yes$ucwords$}" : "{lang:other.words.no$ucwords$}"}`,
						`{lang:other.donations.ko-fi.firstSubscription}: ${b.is_first_subscription_payment ? "{lang:other.words.yes$ucwords$}" : "{lang:other.words.no$ucwords$}"}`,
						`{lang:other.donations.ko-fi.dmStatus}: ${d === undefined ? "{lang:other.donations.ko-fi.noAttempt}" : d ? "{lang:other.words.success$ucwords$}" : "{lang:other.words.fail$ucwords$}"}`,
						"",
						`{lang:other.donations.ko-fi.discordUser}: ${!u ? "{lang:other.words.unknown$ucwords$}" : `**${u.username}#${u.discriminator}** (${u.id})`}`
					].join("\n"));

				await client.w.get("donations-dev").execute({
					embeds: [
						e.toJSON()
					]
				});

				return res.status(204).end();
			});
	}
}
