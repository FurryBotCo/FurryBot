import Command from "../../modules/CommandHandler/Command";
import config from "../../config";
import Eris from "eris";
import { Time, Strings } from "../../util/Functions";
import ExtendedMessage from "../../modules/ExtendedMessage";
import db, { mdb } from "../../modules/Database";
import GuildConfig from "../../modules/config/GuildConfig";
import UserConfig from "../../modules/config/UserConfig";
import chunk from "chunk";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";

export default new Command({
	triggers: [
		"blacklist",
		"bl"
	],
	permissions: {
		user: [],
		bot: []
	},
	cooldown: 0,
	donatorCooldown: 0,
	restrictions: ["helper"],
	file: __filename
}, (async function (msg: ExtendedMessage<Eris.GuildTextableChannel, { time?: string; inline?: string; }>, uConfig, gConfig, cmd) {
	function formatEntry(pos: number, date: number, blame: string, reason: string, expiry: number, id: string) {
		return {
			name: `{lang:other.words.entry} #${pos}`,
			value: [
				`\t**{lang:other.words.date}**: ${Time.formatDateWithPadding(date)}`,
				`\t**{lang:other.words.blame}**: ${blame}`,
				`\t**{lang:other.words.reason}**: \`${reason}\``,
				`\t**{lang:other.words.expiry}**: ${[null, 0].includes(expiry) ? "{lang:other.words.never}" : Time.formatDateWithPadding(expiry)}`,
				`\t**{lang:other.words.id}**: ${id}`
			].join("\n"),
			inline: msg.dashedArgs.unparsed.value.includes("inline")
		};

	}
	const types = ["add", "check", "get", "remove"];
	const subTypes = ["guild", "user"];
	const type: "add" | "check" | "get" | "remove" = msg.args.length > 0 ? msg.args[0].toLowerCase() as any : null;
	const subType: "guild" | "user" = msg.args.length > 1 ? msg.args[1].toLowerCase() as any : null;
	const id = msg.args.length > 2 ? msg.args[2] : null;
	let d: Eris.Guild | Eris.User;
	let dbEntry: GuildConfig | UserConfig;
	const reason = msg.args[3] || "No Reason";
	if (!types.includes(type)) return msg.reply(`{lang:commands.dev.blacklist.invalidType|${type === null ? "none" : type}|${types.join("**, **")}}`);
	if (type === "get") {
		const entry = await mdb.collection<Blacklist.GenericEntry>("blacklist").findOne({ id: msg.args[1] });
		const entries = await mdb.collection<Blacklist.GenericEntry>("blacklist").find(typeof entry.guildId !== "undefined" ? { guildId: entry.guildId } : { userId: entry.userId }).toArray();
		let pos: number;
		entries.filter((e, i) => {
			if (e.id === entry.id) pos = i;
		});
		const field = formatEntry(pos, entry.created, entry.blame, entry.reason, entry.expire, entry.id);
		let text: string;
		if (typeof entry.guildId !== "undefined") {
			const d = await this.getRESTGuild(entry.guildId);
			text = `{lang:commands.dev.blacklist.get.guild|${msg.args[1]}|${d.name}}`;
		} else if (typeof entry.userId !== "undefined") {
			const d = await this.getRESTUser(entry.userId);
			text = `{lang:commands.dev.blacklist.get.user|${msg.args[1]}|${d.username}#${d.discriminator}}`;
		} else throw new TypeError("Invalid blacklist entry.");

		await msg.reply(text);
		await msg.channel.createMessage({
			embed: new EmbedBuilder(gConfig.settings.lang)
				.setTitle("{lang:other.words.current}")
				.setColor(Colors.red)
				.setTimestamp(new Date().toISOString())
				.addField(field.name, field.value, field.inline)
				.toJSON()
		});
		return;
	}
	if (!subTypes.includes(subType)) return msg.reply(`{lang:commands.dev.blacklist.invalidSubType|${subType === null ? "none" : subType}|${subTypes.join("**, **")}}`);
	// ids will be 19 soon
	// they can technically be anywhere between 15 and 21 if I recall correctly, but I doubt
	// I'll run into that issue anytime soon
	if ((!id || id.length < 16 || id.length > 19)) return msg.reply("{lang:commands.dev.blacklist.invalidId}");

	switch (subType) {
		case "guild": {
			try {
				d = await this.getRESTGuild(id);
				dbEntry = await db.getGuild(id);
			} catch (e) {
				return msg.reply(`{lang:commands.dev.blacklist.invalidGuild|${id}}`);
			}
			break;
		}

		case "user": {
			try {
				d = await this.getRESTUser(id);
				dbEntry = await db.getUser(id);
			} catch (e) {
				return msg.reply(`{lang:commands.dev.blacklist.invalidUser|${id}}`);
			}
			break;
		}
	}

	switch (type) {
		case "add": {
			let expire = Number(msg.dashedArgs.unparsed.keyValue.time);
			if (typeof expire === "undefined" || isNaN(expire)) expire = 0;

			if (subType === "user" && d instanceof Eris.User && dbEntry instanceof UserConfig) {
				let t: string;
				if (config.developers.includes(id)) t = "developer";
				else if (config.contributors.includes(id) && !config.developers.includes(msg.author.id)) t = "contributor";
				else if (config.helpers.includes(id) && !(config.developers.includes(msg.author.id) || config.contributors.includes(msg.author.id))) t = "helper";

				if (!!t) return msg.reply(`{lang:commands.dev.blacklist.cannotBlacklist.${t}|${d.username}#${d.discriminator}}`);

				const strike = await dbEntry.checkBlacklist().then(b => b.all.length);
				const e = await dbEntry.addBlacklist(msg.author.tag, msg.author.id, reason, expire);

				return msg.reply(`{lang:commands.dev.blacklist.added.user|${d.username}#${d.discriminator}|${reason}|${[null, 0].includes(expire) ? "Never" : Time.formatDateWithPadding(expire)}|${strike}|${e.id}}`);
			} else if (subType === "guild" && d instanceof Eris.Guild && dbEntry instanceof GuildConfig) {
				if (id === config.client.mainGuild) return msg.reply(`{lang:commands.dev.blacklist.cannotBlacklist.supportServer|${d.name}}`);

				const strike = await dbEntry.checkBlacklist().then(b => b.all.length);
				const e = await dbEntry.addBlacklist(msg.author.tag, msg.author.id, reason, expire);

				return msg.reply(`{lang:commands.dev.blacklist.added.guild|${d.name}|${reason}|${[null, 0].includes(expire) ? "Never" : Time.formatDateWithPadding(expire)}|${strike}|${e.id}}`);
			} else throw new TypeError("We shouldn't be here.");
			break;
		}

		case "check": {
			const page = !msg.args[2] ? Number(msg.args[2]) : 1;
			if (subType === "user" && d instanceof Eris.User && dbEntry instanceof UserConfig) {
				const bl = await dbEntry.checkBlacklist();
				const expired: ReturnType<typeof formatEntry>[][] = chunk(bl.expired.map((e, i) => formatEntry(i + 1, e.created, e.blame, e.reason, e.expire, e.id)), 3);
				const current: ReturnType<typeof formatEntry>[][] = chunk(bl.current.map((e, i) => formatEntry(i + 1, e.created, e.blame, e.reason, e.expire, e.id)), 3);
				const e = expired.length >= page ? expired[page - 1] : [];
				const c = current.length >= page ? current[page - 1] : [];

				if ((!expired || expired.length === 0) && (!current || current.length === 0)) return msg.reply(`{lang:commands.dev.blacklist.check.noHistoryUser|${d.username}#${d.discriminator}}`);
				if ((!e || e.length === 0) && (!c || c.length === 0)) return msg.reply(`{lang:commands.dev.blacklist.check.invalidPage|${page}|${expired.length > current.length ? expired.length : current.length}}`);

				await msg.reply(`{lang:commands.dev.blacklist.check.${current.length === 0 ? "notBlacklistedUser" : "isBlacklistedUser"}|${d.username}#${d.discriminator}}${expired.length === 0 ? "" : " {lang:commands.dev.blacklist.check.previouslyBlacklistedUser}"} {lang:commands.dev.blacklist.check.entries}.`);
				await msg.channel.createMessage({
					embed: new EmbedBuilder(gConfig.settings.lang)
						.setTitle("{lang:other.words.expired}")
						.setDescription(e.length === 0 ? `{lang:commands.dev.blacklist.check.noEntries}${page !== 1 ? " {lang:commands.dev.blacklist.check.onThisPage}" : ""}` : "")
						.setColor(Colors.red)
						.setTimestamp(new Date().toISOString())
						.addFields(...e)
						.setFooter(`{lang:commands.dev.blacklist.check.page|${page}|${expired.length > current.length ? expired.length : current.length}}`)
						.toJSON()
				});
				await msg.channel.createMessage({
					embed: new EmbedBuilder(gConfig.settings.lang)
						.setTitle("{lang:other.words.current}")
						.setDescription(c.length === 0 ? `{lang:commands.dev.blacklist.check.noEntries}${page !== 1 ? " {lang:commands.dev.blacklist.check.onThisPage}" : ""}` : "")
						.setColor(Colors.red)
						.setTimestamp(new Date().toISOString())
						.addFields(...c)
						.setFooter(`{lang:commands.dev.blacklist.check.page|${page}|${expired.length > current.length ? expired.length : current.length}}`)
						.toJSON()
				});
				return;
			}
			else if (subType === "guild" && d instanceof Eris.Guild && dbEntry instanceof GuildConfig) {
				const bl = await dbEntry.checkBlacklist();
				const expired: ReturnType<typeof formatEntry>[][] = chunk(bl.expired.map((e, i) => formatEntry(i + 1, e.created, e.blame, e.reason, e.expire, e.id)), 3);
				const current: ReturnType<typeof formatEntry>[][] = chunk(bl.current.map((e, i) => formatEntry(i + 1, e.created, e.blame, e.reason, e.expire, e.id)), 3);
				const e = expired.length >= page ? expired[page - 1] : [];
				const c = current.length >= page ? current[page - 1] : [];

				if ((!expired || expired.length === 0) && (!current || current.length === 0)) return msg.reply(`{lang:commands.dev.blacklist.check.noHistoryUser|${d.name}}`);
				if ((!e || e.length === 0) && (!c || c.length === 0)) return msg.reply(`{lang:commands.dev.blacklist.check.invalidPage|${page}|${expired.length > current.length ? expired.length : current.length}}`);

				await msg.reply(`{lang:commands.dev.blacklist.check.${current.length === 0 ? "notBlacklistedUser" : "isBlacklistedUser"}|${d.name}}${expired.length === 0 ? "" : " {lang:commands.dev.blacklist.check.previouslyBlacklistedUser}"} {lang:commands.dev.blacklist.check.entries}.`);
				await msg.channel.createMessage({
					embed: new EmbedBuilder(gConfig.settings.lang)
						.setTitle("{lang:other.words.expired}")
						.setDescription(e.length === 0 ? `{lang:commands.dev.blacklist.check.noEntries}${page !== 1 ? " {lang:commands.dev.blacklist.check.onThisPage}" : ""}` : "")
						.setColor(Colors.red)
						.setTimestamp(new Date().toISOString())
						.addFields(...e)
						.setFooter(`{lang:commands.dev.blacklist.check.page|${page}|${expired.length > current.length ? expired.length : current.length}}`)
						.toJSON()
				});
				await msg.channel.createMessage({
					embed: new EmbedBuilder(gConfig.settings.lang)
						.setTitle("{lang:other.words.current}")
						.setDescription(c.length === 0 ? `{lang:commands.dev.blacklist.check.noEntries}${page !== 1 ? " {lang:commands.dev.blacklist.check.onThisPage}" : ""}` : "")
						.setColor(Colors.red)
						.setTimestamp(new Date().toISOString())
						.addFields(...c)
						.setFooter(`{lang:commands.dev.blacklist.check.page|${page}|${expired.length > current.length ? expired.length : current.length}}`)
						.toJSON()
				});
				return;
			}
			else throw new TypeError("We shouldn't be here.");
			break;
		}

		case "remove": {
			if (subType === "user" && d instanceof Eris.User && dbEntry instanceof UserConfig) {
				const bl = await dbEntry.checkBlacklist();

				if (bl.current.length === 0) return msg.reply(`{lang:commands.dev.blacklist.remove.notBlacklisterUser|${d.username}#${d.discriminator}}`);

				let m: Eris.Message;
				if (bl.current.length === 1) {
					await msg.reply(`{lang:commands.dev.blacklist.remove.confirmUser|${d.username}#${d.discriminator}}`);
					const k = await this.c.awaitMessages(msg.channel.id, 6e4, (m) => m.author.id === msg.author.id);
					if (!k.content || k.content.toLowerCase() !== "yes") return msg.reply("{lang:other.words.canceled}.");
					m = { content: bl.current[0].id } as any;
				}
				else {
					await msg.reply("{lang:commands.dev.blacklist.remove.chose}");
					await msg.channel.createMessage({
						embed: new EmbedBuilder(gConfig.settings.lang)
							.setTitle("{lang:other.words.current}")
							.setDescription(bl.current.map((c, i) => `#${i + 1}: \`${c.id}\``))
							.setColor(Colors.red)
							.setTimestamp(new Date().toISOString())
							.toJSON()
					});
					m = await this.c.awaitMessages(msg.channel.id, 6e4, (m) => m.author.id === msg.author.id);
				}
				if (!m) return msg.reply("{lang:commands.dev.blacklist.remove.noReply}");
				if (m.content.toLowerCase() === "cancel") return msg.reply("{lang:other.words.canceled}.");
				if (!isNaN(Number(m.content))) {
					if (Number(m.content) > bl.current.length) return msg.reply(`{lang:commands.dev.blacklist.remove.invalidPos|${bl.current.length}}`);
					m.content = bl.current[Number(m.content) - 1].id;
				}
				if (!bl.current.map(c => c.id).includes(m.content)) return msg.reply("{lang:commands.dev.blacklist.remove.invalid}");
				const e = bl.current.find(c => c.id === m.content);
				await mdb.collection<Blacklist.GenericEntry>("blacklist").findOneAndUpdate({
					id: e.id
				}, {
					$set: {
						expire: Date.now()
					}
				});
				await this.w.get("logs").execute({
					embeds: [
						{
							title: `${Strings.ucwords(subType)} Unblacklisted`,
							description: [
								`${Strings.ucwords(subType)} Id: ${d.id}`,
								`Entry ID: ${e.id}`,
								`Tag: ${d.username}#${d.discriminator}`,
								`Previous Reason: ${reason}`,
								`Previous Blame: ${e.blame} (${e.blameId})`,
								`Previous Expiry: ${[0, null, undefined].includes(e.expire) ? "Never" : Time.formatDateWithPadding(e.expire, false)}`
							].join("\n")
						}
					]
				});
				return msg.reply(`{lang:commands.dev.blacklist.remove.user|${e.id}|${d.username}#${d.discriminator}}`);
			}
			else if (subType === "guild" && d instanceof Eris.Guild && dbEntry instanceof GuildConfig) {
				const bl = await dbEntry.checkBlacklist();

				if (bl.current.length === 0) return msg.reply(`{lang:commands.dev.blacklist.remove.notBlacklisterGuikd|${d.name}}`);

				let m: Eris.Message;
				if (bl.current.length === 1) {
					await msg.reply(`{lang:commands.dev.blacklist.remove.confirmGuild|${d.name}}`);
					const k = await this.c.awaitMessages(msg.channel.id, 6e4, (m) => m.author.id === msg.author.id);
					if (!k.content || k.content.toLowerCase() !== "yes") return msg.reply("{lang:other.words.canceled}.");
					m = { content: bl.current[0].id } as any;
				}
				else {
					await msg.reply("{lang:commands.dev.blacklist.remove.chose}");
					await msg.channel.createMessage({
						embed: new EmbedBuilder(gConfig.settings.lang)
							.setTitle("{lang:other.words.current}")
							.setDescription(bl.current.map((c, i) => `#${i + 1}: \`${c.id}\``))
							.setColor(Colors.red)
							.setTimestamp(new Date().toISOString())
							.toJSON()
					});
					m = await this.c.awaitMessages(msg.channel.id, 6e4, (m) => m.author.id === msg.author.id);
				}
				if (!m) return msg.reply("{lang:commands.dev.blacklist.remove.noReply}");
				if (m.content.toLowerCase() === "cancel") return msg.reply("{lang:other.words.canceled}.");
				if (!isNaN(Number(m.content))) {
					if (Number(m.content) > bl.current.length) return msg.reply(`{lang:commands.dev.blacklist.remove.invalidPos|${bl.current.length}}`);
					m.content = bl.current[Number(m.content) - 1].id;
				}
				if (!bl.current.map(c => c.id).includes(m.content)) return msg.reply("{lang:commands.dev.blacklist.remove.invalid}");
				const e = bl.current.find(c => c.id === m.content);
				await mdb.collection<Blacklist.GenericEntry>("blacklist").findOneAndUpdate({
					id: e.id
				}, {
					$set: {
						expire: Date.now()
					}
				});
				await this.w.get("logs").execute({
					embeds: [
						{
							title: `${Strings.ucwords(subType)} Unblacklisted`,
							description: [
								`${Strings.ucwords(type)} Id: ${d.id}`,
								`Entry ID: ${e.id}`,
								`Name: ${d.name}`,
								`Previous Reason: ${reason}`,
								`Previous Blame: ${e.blame} (${e.blameId})`,
								`Previous Expiry: ${[0, null, undefined].includes(e.expire) ? "Never" : Time.formatDateWithPadding(e.expire, false)}`
							].join("\n")
						}
					]
				});
				return msg.reply(`{lang:commands.dev.blacklist.remove.guild|${e.id}|${d.name}}`);
			}
			else throw new TypeError("We shouldn't be here.");
			break;
		}
	}
}));
