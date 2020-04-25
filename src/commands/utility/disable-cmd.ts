import Command from "../../util/CommandHandler/lib/Command";
import EmbedBuilder from "../../util/EmbedBuilder";

export default new Command({
	triggers: [
		"disable"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 3e3,
	donatorCooldown: 3e3,
	features: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {

	if (msg.args.length === 0) return msg.channel.createMessage({
		embed: new EmbedBuilder(gConfig.settings.lang)
			.setTitle("{lang:commands.utility.disable.help.title}")
			.setDescription([
				"**{lang:commands.utility.disable.help.add}**:",
				`\u25FD {lang:commands.utility.disable.help.entireServer}: \`${msg.prefix}disable add all\``,
				`\u25FD {lang:commands.utility.disable.help.specificChannel}: \`${msg.prefix}disable add all <channel>\``,
				`\u25FD {lang:commands.utility.disable.help.specificRole}: \`${msg.prefix}disable add all <role>\``,
				`\u25FD {lang:commands.utility.disable.help.specificUser}: \`${msg.prefix}disable add all <user>\``,
				`\u25FD {lang:commands.utility.disable.help.cmdTip}`,
				"",
				"**{lang:commands.utility.disable.help.remove}**:",
				`\u25FD {lang:commands.utility.disable.help.withId}: \`${msg.prefix}disable remove <id>\``,
				`\u25FD {lang:commands.utility.disable.help.removeAll}: \`${msg.prefix}disable clear\``,
				"",
				"**{lang:commands.utility.disable.help.list}**:",
				`\u25FD {lang:commands.utility.disable.help.list} \`${msg.prefix}disable list\``
			].join("\n"))
	});

	switch (msg.args[0].toLowerCase()) {
		case "add": {
			break;
		}

		case "remove": {
			break;
		}

		case "list": {
			break;
		}

		default: {
			return msg.reply("{lang:commands.utility.disable.invalid}");
		}
	}

}));
