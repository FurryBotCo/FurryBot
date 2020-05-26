import Command from "../../modules/CommandHandler/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import { Time } from "../../util/Functions";
import chunk from "chunk";
import MusicQueue from "../../util/MusicQueue";

export default new Command({
	triggers: [
		"volume"
	],
	permissions: {
		user: [],
		bot: [
			"embedLinks"
		]
	},
	cooldown: 3e3,
	donatorCooldown: 3e3,
	restrictions: [
		"developer"
	],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const q = this.q.get(msg.channel.guild.id);
	if (!msg.member.voiceState || !msg.member.voiceState.channelID) return msg.reply("{lang:other.music.joinVC}");
	if (!msg.channel.guild.me.voiceState && !msg.channel.guild.me.voiceState.channelID) return msg.reply("{lang:other.music.notInVC}");
	if (msg.channel.guild.me.voiceState.channelID !== msg.member.voiceState.channelID) return msg.reply("{lang:other.music.wrongVC}");
	if (!q) return msg.reply("{lang:other.music.noQueue}");
	const r = msg.channel.guild.roles.find(r => r.id === gConfig.settings.djRole);
	if (!(msg.member.roles.includes(gConfig.settings.djRole) || ["manageGuild", "manageChannels", "manageMessages"].some(p => msg.member.permission.has(p)))) return msg.reply({
		content: `{lang:commands.music.volume.missingPerms${!r ? `NoRole|${gConfig.settings.prefix}` : `|${r.id}`}}`,
		allowedMentions: {
			roles: []
		}
	});
	const v = Number(msg.args[0]);
	if (isNaN(v) || v < 1 || v > 1000) return msg.reply("{lang:commands.music.volume.invalidVolume}");
	await q.player.setVolume(v);
	return msg.reply(`{lang:commands.music.volume.set|${v}}`);

}));
