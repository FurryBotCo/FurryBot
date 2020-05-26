import Command from "../../modules/CommandHandler/Command";
import { Strings } from "../../util/Functions";

export default new Command({
	triggers: [
		"test"
	],
	permissions: {
		user: [],
		bot: []
	},
	cooldown: 0,
	donatorCooldown: 0,
	restrictions: ["developer"],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (!msg.args[0]) return msg.reply("tested..");

	switch (msg.args[0].toLowerCase()) {
		case "err": {
			throw new Error("ERR_TESTING");
			break;
		}

		case "reload": {
			return msg.reply("hello.");
			break;
		}

		case "ban": {
			return msg.member.ban(0, "test");
			break;
		}

		case "mention": {
			return msg.channel.createMessage({
				embed: {
					title: "Mention Test",
					fields: [
						{
							name: "Mention Map",
							value: Object.keys(msg.mentionMap).map(m => `**${Strings.ucwords(m)}**: ${msg.mentionMap[m].length}`).join("\n"),
							inline: false
						},
						{
							name: "Users",
							value: msg.mentionMap.users.map((u, i) => `**${i}**: <@!${u.id}> (${u.id})`).join("\n") || "NONE",
							inline: false
						},
						{
							name: "Members",
							value: msg.mentionMap.members.map((m, i) => `**${i}**: <@!${m.id}> (${m.id})`).join("\n") || "NONE",
							inline: false
						},
						{
							name: "Roles",
							value: msg.mentionMap.roles.map((r, i) => `**${i}**: <@&${r.id}> (${r.id})`).join("\n") || "NONE",
							inline: false
						},
						{
							name: "Channels",
							value: msg.mentionMap.channels.map((ch, i) => `**${i}**: <#${ch.name}>`).join("\n") || "NONE",
							inline: false
						}
					],
					author: {
						name: msg.author.tag,
						icon_url: msg.author.avatarURL
					}
				}
			});
			break;
		}

		case "fromargs": {
			msg.args = msg.args.slice(1);
			const l = Object.keys(msg.mentionMap).reduce((a, b) => a + msg.mentionMap[b].length, 0);
			const len = Object.keys(msg.dashedArgs.parsed.keyValue).includes("len") ? Number(msg.dashedArgs.parsed.keyValue.len) : l > 2 ? 2 : l;
			const u: string[] = [], m: string[] = [], r: string[] = [], ch: string[] = [], g: string[] = [];
			for (let i = 0; i < len; i++) {
				const a = await msg.getUserFromArgs(i, null, null, i);
				const b = await msg.getMemberFromArgs(i, null, null, i);
				const c = await msg.getRoleFromArgs(i, null, null, i);
				const d = await msg.getChannelFromArgs(i, null, null, i);
				const e = await msg.getGuildFromArgs(i, null, null);

				u.push(!a ? `**${i}**: NONE` : `<@!${a.id}> (${a.id})`);
				m.push(!b ? `**${i}**: NONE` : `<@!${b.id}> (${b.id})`);
				r.push(!c ? `**${i}**: NONE` : `<@*${c.id}> (${c.id})`);
				ch.push(!d ? `**${i}**: NONE` : `<#${d.id}> (${d.id})`);
				g.push(!e ? `**${i}**: NONE` : `${e.name} (${e.id})`);

			}
			return msg.channel.createMessage({
				embed: {
					title: "get<X>FromArgs Test",
					fields: [{
						name: "Users",
						value: u.join("\n") || "NONE",
						inline: false
					},
					{
						name: "Members",
						value: m.join("\n") || "NONE",
						inline: false
					},
					{
						name: "Roles",
						value: r.join("\n") || "NONE",
						inline: false
					},
					{
						name: "Channels",
						value: ch.join("\n") || "NONE",
						inline: false
					},
					{
						name: "Guilds",
						value: g.join("\n") || "NONE",
						inline: false
					}
					],
					author: {
						name: msg.author.tag,
						icon_url: msg.author.avatarURL
					}
				}
			});
		}

		case "music": {
			console.log("a");
			const p = this.v.get(msg.channel.guild.id);
			console.log("b");
			if (!msg.member.voiceState || !msg.member.voiceState.channelID) return msg.reply("join a voice channel.");
			console.log("c");
			// const t = await this.v.load("ytsearch:paws to the walls fursona version");
			const q = this.getQueue(msg.channel.guild.id, msg.channel.id, msg.member.voiceState.channelID);
			console.log("d");
			const t = await q.search("youtube", msg.args.slice(1).join(" ") || "https://www.youtube.com/watch?v=zGDzdps75ns");
			console.log("e");
			q.add(t[0], msg.author.id, true);
			console.log("f");
			return msg.reply("playing.");
			break;
		}

		default: {
			return msg.reply("invalid test.");
		}
	}
}));
