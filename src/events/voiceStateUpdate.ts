import ClientEvent from "../util/ClientEvent";
import FurryBot from "../main";
import * as Eris from "eris";
import { db } from "../modules/Database";
import { Colors } from "../util/Constants";
import { Utility } from "../util/Functions";
import config from "../config";

export default new ClientEvent("voiceStateUpdate", (async function (this: FurryBot, member: Eris.Member, oldState: Eris.OldVoiceState) {
	this.track("events", "voiceStateUpdate");

	if (config.beta && !config.client.betaEventGuilds.includes(member.guild.id)) return;

	const g = await db.getGuild(member.guild.id);
	if (!g || !g.logEvents || !(g.logEvents instanceof Array)) return;
	const e = g.logEvents.find(l => l.type === "voiceStateUpdate");
	if (!e || !e.channel) return;
	if (!/^[0-9]{15,21}$/.test(e.channel)) return g.mongoEdit({ $pull: e });
	const ch = member.guild.channels.get(e.channel) as Eris.GuildTextableChannel;
	const vc = member.guild.channels.get(member.voiceState.channelID) as Eris.VoiceChannel;
	if (!ch) return g.mongoEdit({ $pull: e });

	if (!vc) return;

	if (member.voiceState.selfDeaf !== oldState.selfDeaf) {
		const embed: Eris.EmbedOptions = {
			title: `Member Voice Self ${member.voiceState.selfDeaf ? "Deafened" : "Undeafened"}`,
			author: {
				name: `${member.username}#${member.discriminator}`,
				icon_url: member.avatarURL
			},
			description: `Member: ${member.username}#${member.discriminator} (<@!${member.id}>)\nVoice Channel: ${vc.name}`,
			timestamp: new Date().toISOString(),
			color: Colors.orange
		};

		await ch.createMessage({ embed });
	}

	if (member.voiceState.selfMute !== oldState.selfMute) {
		const embed: Eris.EmbedOptions = {
			title: `Member Voice Self ${member.voiceState.selfMute ? "Muted" : "Unmuted"}`,
			author: {
				name: `${member.username}#${member.discriminator}`,
				icon_url: member.avatarURL
			},
			description: `Member: ${member.username}#${member.discriminator} (<@!${member.id}>)\nVoice Channel: ${vc.name}`,
			timestamp: new Date().toISOString(),
			color: Colors.orange
		};

		await ch.createMessage({ embed });
	}

	if (member.voiceState.selfStream !== oldState.selfStream) {
		const embed: Eris.EmbedOptions = {
			title: "Member Voice Streaming",
			author: {
				name: `${member.username}#${member.discriminator}`,
				icon_url: member.avatarURL
			},
			description: `Member: ${member.username}#${member.discriminator} (<@!${member.id}>)`,
			timestamp: new Date().toISOString(),
			color: Colors.orange
		};

		if (member.voiceState.selfStream) embed.description += `Member started streaming in the voice channel ${vc.name}.`;
		else embed.description += `Member stopped streaming in the voice channel ${vc.name}.`;

		await ch.createMessage({ embed });
	}

	if (member.voiceState.deaf !== oldState.deaf) {
		const embed: Eris.EmbedOptions = {
			title: `Member Voice ${member.voiceState.deaf ? "Deafened" : "Undeafened"}`,
			author: {
				name: `${member.username}#${member.discriminator}`,
				icon_url: member.avatarURL
			},
			description: `Member: ${member.username}#${member.discriminator} (<@!${member.id}>)\nVoice Channel: ${vc.name}`,
			timestamp: new Date().toISOString(),
			color: Colors.orange
		};

		const log = await Utility.fetchAuditLogEntries(this, member.guild, Eris.Constants.AuditLogActions.MEMBER_UPDATE, member.id);
		if (log.success === false) embed.description += `\n${log.error.text} (${log.error.code})`;
		else if (log.success) embed.description += `\nBlame: ${log.blame.username}#${log.blame.discriminator}\nReason: ${log.reason}`;

		await ch.createMessage({ embed });
	}

	if (member.voiceState.mute !== oldState.mute) {
		const embed: Eris.EmbedOptions = {
			title: `Member Voice ${member.voiceState.mute ? "Muted" : "Unmuted"}`,
			author: {
				name: `${member.username}#${member.discriminator}`,
				icon_url: member.avatarURL
			},
			description: `Member: ${member.username}#${member.discriminator} (<@!${member.id}>)\nVoice Channel: ${vc.name}`,
			timestamp: new Date().toISOString(),
			color: Colors.orange
		};

		const log = await Utility.fetchAuditLogEntries(this, member.guild, Eris.Constants.AuditLogActions.MEMBER_UPDATE, member.id);
		if (log.success === false) embed.description += `\n${log.error.text} (${log.error.code})`;
		else if (log.success) embed.description += `\nBlame: ${log.blame.username}#${log.blame.discriminator}\nReason: ${log.reason}`;

		await ch.createMessage({ embed }).catch(err => null);
	}

	return;

	/*const props: { [k: string]: { type: string; name: string; } } = {
		selfDeaf: {
			type: "boolean",
			name: "Self Deaf"
		},
		selfMute: {
			type: "boolean",
			name: "Self Mute"
		},
		selfSteam: {
			type: "boolean",
			name: "Self Stream"
		},
		deaf: {
			type: "boolean",
			name: "Deaf"
		},
		mute: {
			type: "boolean",
			name: "Mute"
		}
	};
	const changes: ("selfDeaf" | "selfMute" | "selfStream" | "deaf" | "mute")[] = [];


	if (changes.length === 0) return;

	const embed: Eris.EmbedOptions = {
		title: "Voice State Updated",
		author: {
			name: `${member.username}#${member.discriminator}`,
			icon_url: member.avatarURL
		},
		description: [
			`Member: ${member.username}#${member.discriminator} (<@!${member.id}>)`,
			...(await Promise.all(changes.map(async (c) => {
				const ch = props[c];
				switch (ch.type) {
					case "boolean":
						return `${ch.name}: **${oldState[c] ? "Yes" : "No"}** -> **${member.voiceState[c] ? "Yes" : "No"}**`;
						break;

					case "string":
						return `${ch.name}: **${oldState[c] || "None"}** -> **${member.voiceState[c] || "None"}**`;
						break;

					case "number":
						return `${ch.name}: **${oldState[c] || 0}** -> **${member.voiceState[c] || 0}**`;
						break;

					case "time":
						return `${ch.name}: **${this.f.ms((oldState[c] || 0 as any) * 1000, true)}** -> **${this.f.ms((member.voiceState[c] || 0 as any) * 1000, true)}**`;
						break;
				}
			})))
		].join("\n"),
		timestamp: new Date().toISOString(),
		color: Colors.orange
	};

	if ((["mute", "deaf"] as typeof changes).some(c => changes.includes(c))) {
		const log = await Utility.fetchAuditLogEntries(member.guild, Eris.Constants.AuditLogActions.MEMBER_UPDATE, member.id);
		if (log.success === false) embed.description += `\n${log.error.text} (${log.error.code})`;
		else if (log.success) embed.description += `\nBlame: ${log.blame.username}#${log.blame.discriminator}\nReason: ${log.reason}`;
	}

	return ch.createMessage({ embed });*/
}));
