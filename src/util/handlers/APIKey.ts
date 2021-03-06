import FurryBot from "../../main";
import { mongo } from "../Database";
import { Interaction } from "../DiscordCommands/types";
import util from "util";
import { ObjectId } from "mongodb";
import config from "../../config";
import crypto from "crypto";
import EmbedBuilder from "../EmbedBuilder";
import { Colors } from "../Constants";
import Logger from "../Logger";

interface DBEntry {
	_id: ObjectId;
	key: string;
	unlimited: boolean;
	owner: string;
	application: string;
	active: boolean;
	contact: string;
	disabled: boolean;
	disabledReason: string | null;
	flowAccess: false;
}

interface UsageEntry {
	ip: string;
	ua: string[];
	key: string;
	usage: {
		[k: string]: number;
	};
}

export default class APIKey {
	static client: FurryBot = null;
	static setClient(v: FurryBot) { return this.client = v; }
	static get col() { return mongo.db("furry-services").collection<DBEntry>("apikeys"); }

	static async handle(data: Interaction) {
		const client = this.client;
		if (!client) return;

		const { name: sub, options: o } = data.data.options[0];
		const opt: {
			key?: string;
			name?: string;
			contact?: string;
		} = (o || []).map(v => ({
			[v.name]: v.value
		})).reduce((a, b) => ({ ...a, ...b }), {});

		Logger.debug([`Cluster #${client.cluster.id}`, "APIKeyHandler"], `Command "${sub}" ran with ${Object.keys(opt).length === 0 ? "no arguments" : `the arguments '${JSON.stringify(opt)}'`}`)

		switch (sub) {
			case "create": {
				const keys = await this.col.find({
					owner: data.member.user.id
				}).toArray();

				if (keys.length >= 3) return client.h.createFollowupResponse(client.bot.user.id, data.token, {
					content: "You already have 3 keys, please contact an administrator if you need more.",
					flags: 1 << 6
				});

				if (keys.some(k => k.application.toLowerCase() === opt.name.toLowerCase())) return client.h.createFollowupResponse(client.bot.user.id, data.token, {
					content: "You already have an api key with that application name.",
					flags: 1 << 6
				});

				if (opt.name.length > 250) return client.h.createFollowupResponse(client.bot.user.id, data.token, {
					content: "Please select a shorter application name.",
					flags: 1 << 6
				});

				if (opt.contact.length > 100) return client.h.createFollowupResponse(client.bot.user.id, data.token, {
					content: "Please provide a shorter contact.",
					flags: 1 << 6
				});

				const key = crypto.randomBytes(20).toString("hex");

				const { ops: [k] } = await this.col.insertOne({
					key,
					unlimited: false,
					owner: data.member.user.id,
					application: opt.name,
					active: true,
					contact: opt.contact,
					disabled: false,
					disabledReason: null,
					flowAccess: false
				});

				await client.w.get("apikey").execute({
					embeds: [
						new EmbedBuilder(config.devLanguage)
							.setTitle("API Key Created")
							.setDescription([
								`Key: \`${key}\``,
								`Application: **${k.application}**`,
								`Contact: ${k.contact || "**NONE**"}`,
								`Active: <:${config.emojis.custom[k.active ? "greenTick" : "redTick"]}>`,
								`Disabled: <:${config.emojis.custom[k.disabled ? "greenTick" : "redTick"]}>${k.disabled ? ` (Reason: ${k.disabledReason})` : ""}`,
								`Unlimited: <:${config.emojis.custom[k.unlimited ? "greenTick" : "redTick"]}>`,
								`Flow Access: <:${config.emojis.custom[k.flowAccess ? "greenTick" : "redTick"]}>`
							].join("\n"))
							.setColor(Colors.green)
							.setTimestamp(new Date().toISOString())
							.setAuthor(`${data.member.user.username}#${data.member.user.discriminator}`, `https://cdn.discordapp.com/avatars/${data.member.user.id}/${data.member.user.avatar}.png?size=256`)
							.toJSON()
					]
				});

				return client.h.createFollowupResponse(client.bot.user.id, data.token, {
					content: `An api key has been created with the application name **${opt.name}**, your key:\n||${key}||\n\nYou can delete this key using the \`delete\` subcommand.`,
					flags: 1 << 6
				});
				break;
			}

			case "delete": {
				const k = await this.col.findOne({
					key: opt.key
				});
				if (!k) return client.h.createFollowupResponse(client.bot.user.id, data.token, {
					content: "We could not find that key.",
					flags: 1 << 6
				});

				if (k.owner !== data.member.user.id) return client.h.createFollowupResponse(client.bot.user.id, data.token, {
					content: "You are not the owner of that key.",
					flags: 1 << 6
				});

				await this.col.findOneAndDelete({
					key: opt.key,
					owner: data.member.user.id
				});

				await client.w.get("apikey").execute({
					embeds: [
						new EmbedBuilder(config.devLanguage)
							.setTitle("API Key Deleted")
							.setDescription([
								`Key: \`${opt.key}\``,
								`Application: **${k.application}**`,
								`Contact: ${k.contact || "**NONE**"}`,
								`Active: <:${config.emojis.custom[k.active ? "greenTick" : "redTick"]}>`,
								`Disabled: <:${config.emojis.custom[k.disabled ? "greenTick" : "redTick"]}>${k.disabled ? ` (Reason: ${k.disabledReason})` : ""}`,
								`Unlimited: <:${config.emojis.custom[k.unlimited ? "greenTick" : "redTick"]}>`,
								`Flow Access: <:${config.emojis.custom[k.flowAccess ? "greenTick" : "redTick"]}>`
							].join("\n"))
							.setColor(Colors.red)
							.setTimestamp(new Date().toISOString())
							.setAuthor(`${data.member.user.username}#${data.member.user.discriminator}`, `https://cdn.discordapp.com/avatars/${data.member.user.id}/${data.member.user.avatar}.png?size=256`)
							.toJSON()
					]
				});

				return client.h.createFollowupResponse(client.bot.user.id, data.token, {
					content: "That key has been deleted.",
					flags: 1 << 6
				});
				break;
			}

			case "list": {
				const keys = await this.col.find({
					owner: data.member.user.id
				}).toArray();

				if (keys.length === 0) return client.h.createFollowupResponse(client.bot.user.id, data.token, {
					content: "We couldn't find any api keys related to you.",
					flags: 1 << 6
				});

				await client.h.createFollowupResponse(client.bot.user.id, data.token, {
					content: `We found the following api keys related to you:\n\n${keys.map((v, i) => `${i + 1}.)\n- Key: ||${v.key}||\n- Application: **${v.application}**\n- Contact: ${v.contact || "**NONE**"}\n- Active: <:${config.emojis.custom[v.active ? "greenTick" : "redTick"]}>\n- Disabled: <:${config.emojis.custom[v.disabled ? "greenTick" : "redTick"]}>${v.disabled ? ` (Reason: ${v.disabledReason})` : ""}\n- Unlimited: <:${config.emojis.custom[v.unlimited ? "greenTick" : "redTick"]}>\n- Flow Access: <:${config.emojis.custom[v.flowAccess ? "greenTick" : "redTick"]}>`).join("\n\n")}`,
					flags: 1 << 6
				});
				break;
			}

			case "edit": {
				// @TODO
				break;
			}

			case "usage": {
				const keys = await this.col.find({
					owner: data.member.user.id
				}).toArray();

				if (keys.length === 0) return client.h.createFollowupResponse(client.bot.user.id, data.token, {
					content: "We couldn't find any api keys related to you.",
					flags: 1 << 6
				});

				for (const { key } of keys) {
					const usage = await mongo.db("furry-services").collection<UsageEntry>("usage").findOne({ key });
					await client.h.createFollowupResponse(client.bot.user.id, data.token, {
						content: `Key: \`${key}\`\nUsage:`,
						flags: 1 << 6
					});
				}
				break;
			}
		}
	}
}
