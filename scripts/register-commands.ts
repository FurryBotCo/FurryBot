import { ApplicationCommandOptionType } from "../src/util/DiscordCommands/Constants";
import CommandHelper from "../src/util/DiscordCommands/main";
import Language from "../src/util/Language";
import config from "../src/config";

const h = new CommandHelper("Mzk4MjUxNDEyMjQ2NDk1MjMz.Wk1ihw.VfdOG_ca7_n91eQ8o3M8784f2YE", /* "347221999963340810" */ "398251412246495233");

const guildId = "760631859385335838";

process.nextTick(async () => {
	await h.createGlobalCommand("help", Language.get(config.devLanguage, "commands.misc.help.description"), [
		{
			type: ApplicationCommandOptionType.STRING,
			name: "category",
			description: "The category to get help with",
			choices: [
				{
					name: "Animals",
					value: "animals"
				},
				{
					name: "Fun",
					value: "fun"
				},
				{
					name: "Images",
					value: "images"
				},
				{
					name: "Informaton",
					value: "information"
				},
				{
					name: "Miscellaneous",
					value: "misc"
				},
				{
					name: "Moderation",
					value: "moderation"
				},
				{
					name: "NSFW",
					value: "nsfw"
				},
				{
					name: "Utility",
					value: "utility"
				}
			]
		}
	]);

	/* start nsfw */

	await h.createGlobalCommand("yiff", Language.get(config.devLanguage, "commands.nsfw.yiff.description"), [
		{
			type: ApplicationCommandOptionType.STRING,
			name: "type",
			description: "The type of yiff to get.",
			required: true,
			choices: [
				{
					name: "Gay",
					value: "gay"
				},
				{
					name: "Straight",
					value: "straight"
				},
				{
					name: "Lesbian",
					value: "lesbian"
				},
				{
					name: "Gynomorph",
					value: "gynomorph"
				}
			]
		}
	]);

	await h.createGlobalCommand("e621", Language.get(config.devLanguage, "commands.nsfw.e621.description"), [
		{
			type: ApplicationCommandOptionType.STRING,
			name: "tags",
			description: "The tags to search for",
			required: false
		},
		{
			type: ApplicationCommandOptionType.BOOLEAN,
			name: "hide-flash",
			description: "Hide flash content in results.",
			required: false
		},
		{
			type: ApplicationCommandOptionType.BOOLEAN,
			name: "hide-video",
			description: "Hide video content in results.",
			required: false
		}
	]);

	await h.createGlobalCommand("bulge", "Get a picture of a bulge.", []);

	/* end nsfw */

	/* start moderaton */

	await h.createGlobalCommand("ban", Language.get(config.devLanguage, "commands.moderation.ban.description"), [
		{
			type: ApplicationCommandOptionType.USER,
			name: "member",
			required: true,
			description: "The member to ban."
		},
		{
			type: ApplicationCommandOptionType.STRING,
			name: "time",
			required: false,
			description: "The time the ban will last. Ex: 1mn2d3h5m (1 month, 2 days, 3 hours, 5 minutes)"
		},
		{
			type: ApplicationCommandOptionType.STRING,
			name: "reason",
			required: false,
			description: "The reason for the ban."
		},
		{
			type: ApplicationCommandOptionType.INTEGER,
			name: "days",
			required: false,
			description: "The amount of days to delete messages from the user. Between 0 and 7."
		}
	]);

	await h.createGlobalCommand("kick", Language.get(config.devLanguage, "commands.moderation.kick.description"), [
		{
			type: ApplicationCommandOptionType.USER,
			name: "member",
			required: true,
			description: "The member to kick."
		},
		{
			type: ApplicationCommandOptionType.STRING,
			name: "reason",
			required: false,
			description: "The reason for the kick."
		}
	]);

	await h.createGlobalCommand("lock", Language.get(config.devLanguage, "commands.moderation.lock.description"), [
		{
			type: ApplicationCommandOptionType.CHANNEL,
			name: "channel",
			required: false,
			description: "The channel to lock. (current channel if not specified)"
		}
	]);

	await h.createGlobalCommand("modlog", Language.get(config.devLanguage, "commands.moderation.modlog.description"), [
		{
			type: ApplicationCommandOptionType.SUB_COMMAND,
			name: "set",
			description: "Set the modlog channel",
			options: [
				{
					type: ApplicationCommandOptionType.CHANNEL,
					name: "channel",
					description: "The channel to put the modlog in.",
					required: true
				}
			]
		},
		{
			type: ApplicationCommandOptionType.SUB_COMMAND,
			name: "disable",
			description: "Disable the modlog."
		},
		{
			type: ApplicationCommandOptionType.SUB_COMMAND,
			name: "list",
			description: "List a users modlog entries",
			options: [
				{
					type: ApplicationCommandOptionType.USER,
					name: "user",
					description: "The user to list modlog entries for.",
					required: true
				}
			]
		}
	]);

	await h.createGlobalCommand("mute", Language.get(config.devLanguage, "commands.moderation.mute.description"), [
		{
			type: ApplicationCommandOptionType.USER,
			name: "member",
			required: true,
			description: "The member to mute."
		},
		{
			type: ApplicationCommandOptionType.INTEGER,
			name: "time",
			required: false,
			description: "The time the mute will last. Ex: 1mn2d3h5m (1 month, 2 days, 3 hours, 5 minutes)"
		},
		{
			type: ApplicationCommandOptionType.STRING,
			name: "reason",
			required: false,
			description: "The reaon for the mute."
		}
	]);

	await h.createGlobalCommand("prune", Language.get(config.devLanguage, "commands.moderation.prune.description"), [
		{
			type: ApplicationCommandOptionType.INTEGER,
			name: "amount",
			required: true,
			description: "The amount of messages to remove. Between 2 and 1000."
		}
	]);

	await h.createGlobalCommand("reason", Language.get(config.devLanguage, "commands.moderation.reason.description"), [
		{
			type: ApplicationCommandOptionType.INTEGER,
			name: "id",
			required: true,
			description: "The id of the case to change."
		},
		{
			type: ApplicationCommandOptionType.STRING,
			name: "reason",
			required: true,
			description: "The reason to add to the case."
		}
	]);

	await h.createGlobalCommand("unban", Language.get(config.devLanguage, "commands.moderation.unban.description"), [
		{
			type: ApplicationCommandOptionType.STRING,
			name: "id",
			required: true,
			description: "The id or mention of someone to unban."
		},
		{
			type: ApplicationCommandOptionType.STRING,
			name: "reason",
			required: false,
			description: "The reason for unbanning them."
		}
	]);

	await h.createGlobalCommand("unlock", Language.get(config.devLanguage, "commands.moderation.unlock.description"), [
		{
			type: ApplicationCommandOptionType.CHANNEL,
			name: "channel",
			required: false,
			description: "The channel to unlock. (current channel if not specified)"
		}
	]);

	await h.createGlobalCommand("unmute", Language.get(config.devLanguage, "commands.moderation.unmute.description"), [
		{
			type: ApplicationCommandOptionType.USER,
			name: "user",
			required: true,
			description: "The user to unmute."
		},
		{
			type: ApplicationCommandOptionType.STRING,
			name: "reason",
			required: false,
			description: "The reason for unmuting them."
		}
	]);

	await h.createGlobalCommand("warn", Language.get(config.devLanguage, "commands.moderation.warn.description"), [
		{
			type: ApplicationCommandOptionType.USER,
			name: "user",
			required: true,
			description: "The user to warn."
		},
		{
			type: ApplicationCommandOptionType.STRING,
			name: "reason",
			required: false,
			description: "The reason for warning them."
		}
	]);

	await h.createGlobalCommand("warnings", Language.get(config.devLanguage, "commands.moderation.warnings.description"), [
		{
			type: ApplicationCommandOptionType.SUB_COMMAND,
			name: "list",
			description: "List a user's warnings",
			options: [
				{
					type: ApplicationCommandOptionType.USER,
					name: "user",
					description: "The user to list the warnings of.",
					required: true
				},
				{
					type: ApplicationCommandOptionType.INTEGER,
					name: "page",
					description: "The page of warnings to list.",
					required: false
				}
			]
		},
		{
			type: ApplicationCommandOptionType.SUB_COMMAND,
			name: "remove",
			description: "Remove a warning from a user.",
			options: [
				{
					type: ApplicationCommandOptionType.USER,
					name: "user",
					description: "The user to remove a warning from.",
					required: true
				},
				{
					type: ApplicationCommandOptionType.INTEGER,
					name: "id",
					description: "The warning id to remove.",
					required: true
				}
			]
		},
		{
			type: ApplicationCommandOptionType.SUB_COMMAND,
			name: "clear",
			description: "Clear a user's warnings.",
			options: [
				{
					type: ApplicationCommandOptionType.USER,
					name: "user",
					description: "The user to clear the warnings of.",
					required: true
				}
			]
		}
	]);

	/* end moderation */

	/* start information */

	await h.createGlobalCommand("info", Language.get(config.devLanguage, "commands.information.info.description"), []);

	await h.createGlobalCommand("ping", Language.get(config.devLanguage, "commands.information.ping.description"), []);

	await h.createGlobalCommand("shards", Language.get(config.devLanguage, "commands.information.shards.description"), []);

	await h.createGlobalCommand("sinfo", Language.get(config.devLanguage, "commands.information.sinfo.description"), []);

	await h.createGlobalCommand("uinfo", Language.get(config.devLanguage, "commands.information.uinfo.description"), [
		{
			type: ApplicationCommandOptionType.USER,
			name: "user",
			description: "The user to get information about.",
			required: false
		}
	]);

	await h.createGlobalCommand("invite", Language.get(config.devLanguage, "commands.information.inv.description"), []);

	/* end information */

	/* start fun */

	await h.createGlobalCommand("8ball", Language.get(config.devLanguage, "commands.fun.8ball.description"), [
		{
			type: ApplicationCommandOptionType.STRING,
			name: "question",
			description: "The question to ask.",
			required: true
		}
	]);

	await h.createGlobalCommand("bap", Language.get(config.devLanguage, "commands.fun.bap.description"), [
		{
			type: ApplicationCommandOptionType.USER,
			name: "user",
			description: "The user to bap.",
			required: true
		}
	]);

	await h.createGlobalCommand("boop", Language.get(config.devLanguage, "commands.fun.boop.description"), [
		{
			type: ApplicationCommandOptionType.USER,
			name: "user",
			description: "The user to boop.",
			required: true
		}
	]);

	await h.createGlobalCommand("cuddle", Language.get(config.devLanguage, "commands.fun.cuddle.description"), [
		{
			type: ApplicationCommandOptionType.USER,
			name: "user",
			description: "The user to cuddle.",
			required: true
		}
	]);

	await h.createGlobalCommand("dadjoke", Language.get(config.devLanguage, "commands.fun.dadjoke.description"), []);

	await h.createGlobalCommand("gayrate", Language.get(config.devLanguage, "commands.fun.gayrate.description"), [
		{
			type: ApplicationCommandOptionType.USER,
			name: "user",
			description: "The user to rate.",
			required: true
		}
	]);

	await h.createGlobalCommand("hug", Language.get(config.devLanguage, "commands.fun.hug.description"), [
		{
			type: ApplicationCommandOptionType.USER,
			name: "user",
			description: "The user to hug.",
			required: true
		}
	]);

	await h.createGlobalCommand("kiss", Language.get(config.devLanguage, "commands.fun.kiss.description"), [
		{
			type: ApplicationCommandOptionType.USER,
			name: "user",
			description: "The user to kiss.",
			required: true
		}
	]);

	await h.createGlobalCommand("lick", Language.get(config.devLanguage, "commands.fun.lick.description"), [
		{
			type: ApplicationCommandOptionType.USER,
			name: "user",
			description: "The user to lick.",
			required: true
		}
	]);

	await h.createGlobalCommand("ship", Language.get(config.devLanguage, "commands.fun.ship.description"), [
		{
			type: ApplicationCommandOptionType.USER,
			name: "user1",
			description: "The first user to ship.",
			required: false
		},
		{
			type: ApplicationCommandOptionType.USER,
			name: "user2",
			description: "The second user to ship.",
			required: false
		}
	]);

	await h.createGlobalCommand("slap", Language.get(config.devLanguage, "commands.fun.slap.description"), [
		{
			type: ApplicationCommandOptionType.USER,
			name: "user",
			description: "The user to slap.",
			required: true
		}
	]);

	await h.createGlobalCommand("spray", Language.get(config.devLanguage, "commands.fun.spray.description"), [
		{
			type: ApplicationCommandOptionType.USER,
			name: "user",
			description: "The user to spray.",
			required: true
		}
	]);

	/* end fun */

	/* start images */

	await h.createGlobalCommand("fursuit", Language.get(config.devLanguage, "commands.images.fursuit.description"), []);

	await h.createGlobalCommand("kadi", Language.get(config.devLanguage, "commands.images.kadi.description"), []);

	await h.createGlobalCommand("chris", Language.get(config.devLanguage, "commands.images.chris.description"), []);

	/* end images */

	/* start animals */

	await h.createGlobalCommand("birb", Language.get(config.devLanguage, "commands.animals.birb.description"), []);

	await h.createGlobalCommand("bunny", Language.get(config.devLanguage, "commands.animals.bunny.description"), []);

	await h.createGlobalCommand("cat", Language.get(config.devLanguage, "commands.animals.cat.description"), []);

	await h.createGlobalCommand("duck", Language.get(config.devLanguage, "commands.animals.duck.description"), []);

	await h.createGlobalCommand("fox", Language.get(config.devLanguage, "commands.animals.fox.description"), []);

	await h.createGlobalCommand("koala", Language.get(config.devLanguage, "commands.animals.koala.description"), []);

	await h.createGlobalCommand("otter", Language.get(config.devLanguage, "commands.animals.otter.description"), []);

	await h.createGlobalCommand("panda", Language.get(config.devLanguage, "commands.animals.panda.description"), []);

	await h.createGlobalCommand("snek", Language.get(config.devLanguage, "commands.animals.snek.description"), []);

	await h.createGlobalCommand("turtle", Language.get(config.devLanguage, "commands.animals.turtle.description"), []);

	await h.createGlobalCommand("wah", Language.get(config.devLanguage, "commands.animals.wah.description"), []);

	await h.createGlobalCommand("wolf", Language.get(config.devLanguage, "commands.animals.wolf.description"), []);

	/* end animals */

	/* start utility */

	await h.createGlobalCommand("snipe", Language.get(config.devLanguage, "commands.utility.snipe.description"), []);

	/* end utility */

	/* count */

	await h.fetchGlobalCommands().then(c => console.log("We have", c.length, "global commands."));
	await h.fetchGuildCommands(guildId).then(c => console.log("We have", c.length, "guild commands."));
});
