import Command from "../../modules/CommandHandler/Command";
import { Utility } from "../../util/Functions";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import Eris from "eris";
import CommandError from "../../modules/CommandHandler/CommandError";

export default new Command({
	triggers: [
		"reembed"
	],
	permissions: {
		user: [
			"manageMessages"
		],
		bot: [
			"manageMessages"
		]
	},
	cooldown: 3e3,
	donatorCooldown: 3e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length < 1) return new CommandError("ERR_INVALID_USAGE", cmd);

	let id: string;
	let g: string;
	let ch: string;
	let m: RegExpMatchArray;
	/*if (
		(m = msg.args[0].match(/^([0-9]{15,21})$/))
		||
		(m = msg.args[0].match(/^https?:\/\/(?:canary|ptb)?\.discord(?:app)?\.com\/channels\/[0-9]{15,21}\/[0-9]{15,21}\/([0-9]{15,21})$/))
	) id = m[1];*/

	if (
		(m = msg.args[0].match(/^https?:\/\/(?:canary|ptb)?\.discord(?:app)?\.com\/channels\/([0-9]{15,21})\/([0-9]{15,21})\/([0-9]{15,21})$/))
	) (g = m[1], ch = m[2], id = m[3]);
	console.log(m);

	if (!g) return msg.reply("{lang:commands.utility.reembed.invalidGuild}");
	if (!id) return msg.reply("{lang:commands.utility.reembed.noId}");

	const channel = await msg.channel.guild.channels.get<Eris.TextChannel>(ch);

	if (!channel || ![Eris.Constants.ChannelTypes.GUILD_TEXT, Eris.Constants.ChannelTypes.GUILD_NEWS].includes(channel.type)) return msg.reply("{lang:commands.utility.reembed.invalidChannel}");

	const message = await channel.getMessage(id).catch(null) as Eris.Message & { flags: number; };

	if (!message) return msg.reply("{lang:commands.utility.reembed.invalidMessage}");
	if (!(message.flags & Eris.Constants.MessageFlags.SUPPRESS_EMBEDS)) return msg.reply("{lang:commands.utility.reembed.notSuppressed}");

	// may not work in prod due to some weird way Eris works?
	await message.edit({ flags: message.flags - Eris.Constants.MessageFlags.SUPPRESS_EMBEDS });

	return msg.reply("{lang:commands.utility.reembed.unsuppressed}");
}));
