import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";
import { mdb } from "@modules/Database";

export default new Command({
	triggers: [
		"multiplier",
		"multi"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 3e3,
	description: "Check your economy multiplier",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	if ([undefined, null].includes(msg.uConfig.bal)) await msg.uConfig.edit({ bal: 100 }).then(d => d.reload());

	const m = await functions.calculateMultiplier(msg.member);

	const embed: Eris.EmbedOptions = {
		title: `${msg.author.tag}'s Multipliers`,
		description: `[Support Server](https://discord.gg/YazeA7e): ${m.multi.supportServer ? "<:greenTick:599105055240749089>" : "<:redTick:599105059275407381>"} - \`${config.eco.multipliers.supportServer * 100}%\`\n\
		[Vote](https://discordbots.org/bot/398251412246495233/vote): ${m.multi.vote ? "<:greenTick:599105055240749089>" : "<:redTick:599105059275407381>"} - \`${config.eco.multipliers.vote * 100}%\`\n\
		[Weekend Vote](https://discordbots.org/bot/398251412246495233/vote): ${m.multi.voteWeekend ? "<:greenTick:599105055240749089>" : "<:redTick:599105059275407381>"} - \`${config.eco.multipliers.voteWeekend * 100}%\`\n\
		[Support Server](https://discord.gg/YazeA7e) Booster: ${m.multi.booster ? "<:greenTick:599105055240749089>" : "<:redTick:599105059275407381>"} - \`${config.eco.multipliers.booster * 100}%\`\n\
		Tips Enabled: ${m.multi.tips ? "<:greenTick:599105055240749089>" : "<:redTick:599105059275407381>"} - \`${config.eco.multipliers.tips * 100}%\``,
		timestamp: new Date().toISOString(),
		color: functions.randomColor(),
		footer: {
			text: `Multiplier Total: ${isNaN(m.amount) ? 0 : m.amount * 100}%`
		}
	};

	return msg.channel.createMessage({ embed });


}));