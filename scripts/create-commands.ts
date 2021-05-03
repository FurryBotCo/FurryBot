import config from "../src/config";
import { ApplicationCommand, ApplicationCommandOption, ApplicationCommandOptionType, DiscordInteractions as CommandHelper } from "slash-commands";
import Language from "language";
import { Strings } from "utilities";
import util from "util";
Language.setDir(config.dir.lang);

const h = new CommandHelper({
	applicationId: config.client.id,
	authToken: config.client.token,
	publicKey: config.client.key
});

interface RateLimitedResponse {
	global: boolean;
	message: string;
	retry_after: number;
}

function doLang(loc: string, opts: Array<ApplicationCommandOption>) {
	// avoid references
	const v = JSON.parse(JSON.stringify(opts)) as typeof opts;
	for (const o of v) {
		const a = /lang:(.*)/.exec(o.description);
		if (a) {
			const b = Language.get(config.devLanguage, a[1], [], true, true, true);
			if (b) o.description = b;
			const c = Language.get(config.devLanguage, `${loc}.${a[1]}`, [], true, true, true);
			if (c) o.description = c;
		}
		if (o.options) o.options = doLang(loc, o.options);
	}

	return v;
}

const useLang = (...parts: Array<string>) => `lang:${parts.join(".")}`;

async function create(cat: string, name: string, options?: Array<ApplicationCommandOption>, overrideDesc?: string): Promise<void> {
	return h.createApplicationCommand({
		name,
		description: !overrideDesc ? Language.get(config.devLanguage, `commands.${cat}.${name}.description`, [], false, true, true) : overrideDesc,
		options: doLang(`commands.${cat}.${name}`, options ?? [])
	}, GUILD).then(async(v: ApplicationCommand | RateLimitedResponse) => {
		if ("retry_after" in v) {
			console.log(`Recieved ratelimit response (${cat}:${name}),`, v.retry_after * 1e3);
			await new Promise(a => setTimeout(a, (v.retry_after + 1) * 1e3));
			return create(cat, name, options, overrideDesc);
		} else console.log(`Created ${name} command.`, util.inspect(v, { depth: null }));
	});
}

// const GUILD = undefined;
// const GUILD = config.client.supportServerId;
const GUILD = "329498711338123268";
const ENABLED = {
	ANIMALS: false,
	FUN: false,
	IMAGES: false,
	INFORMATION: false,
	MEME: false,
	MISC: false,
	MODERATION: true,
	NSFW: false,
	UTILITY: true
};

process.nextTick(async() => {
	let c = 0;

	await h.getApplicationCommands(GUILD).then(async(v) => {
		c = v.length;
		await Promise.all(v.map(async(d) => h.deleteApplicationCommand(d.id, GUILD)));
	});
	console.log(`Deleted ${c} Commands.`);

	/* start animals */

	if (ENABLED.ANIMALS) {
		await create("animals", "birb");
		await create("animals", "bunny");
		await create("animals", "cat");
		await create("animals", "dikdik");
		await create("animals", "duck");
		await create("animals", "fox");
		await create("animals", "koala");
		await create("animals", "otter");
		await create("animals", "panda");
		await create("animals", "snek");
		await create("animals", "turtle");
		await create("animals", "wah");
		await create("animals", "wolf");
	}

	/* end animals */

	/* start fun */
	/* end fun */

	/* start images */

	if (ENABLED.IMAGES) {
		await create("images", "chris");
		await create("images", "fursuit");
		await create("images", "kadi");
	}

	/* end images */

	/* start information */

	if (ENABLED.INFORMATION) {
		await create("information", "info");
		await create("information", "inv");
		await create("information", "sinfo", [
			{
				type: ApplicationCommandOptionType.STRING,
				name: "section",
				description: useLang("sectionDesc"),
				choices: [
					{
						name: "Help",
						value: "help"
					},
					{
						name: "Channels",
						value: "channels"
					},
					{
						name: "Members",
						value: "members"
					},
					{
						name: "Server",
						value: "server"
					},
					{
						name: "Banner",
						value: "banner"
					},
					{
						name: "Splash",
						value: "splash"
					},
					{
						name: "Emojis",
						value: "emojis"
					}
				],
				required: false
			}
		]);
		await create("information", "stats", [
			{
				type: ApplicationCommandOptionType.STRING,
				name: "section",
				description: useLang("sectionDesc"),
				choices: [
					{
						name: "Commands",
						value: "commands"
					}
				]
			}
		]);
		await create("information", "uinfo", [
			{
				type: ApplicationCommandOptionType.USER,
				name: "user",
				description: useLang("userDesc"),
				required: true
			}
		]);
		await create("information", "whoplays", [
			{
				type: ApplicationCommandOptionType.STRING,
				name: "game",
				description: useLang("gameDesc"),
				required: true
			}
		]);
	}

	/* end information */

	/* start meme */

	if (ENABLED.MEME) {
		// @TODO

	}
	/* end meme */

	/* start misc */

	if (ENABLED.MISC) {
		// @TODO
		await create("misc", "afk", [
			{
				type: ApplicationCommandOptionType.STRING,
				name: "reason",
				description: useLang("reasonDesc"),
				required: false
			}
		]);

		await create("misc", "auto", [
			{
				type: ApplicationCommandOptionType.SUB_COMMAND,
				name: "add",
				description: useLang("help", "add"),
				options: [
					{
						type: ApplicationCommandOptionType.STRING,
						name: "type",
						description: useLang("help", "typeDesc"),
						required: true,
						choices: config.autoTypes.map(v => ({
							name: Strings.ucwords(v.replace(/\./g, " ")).replace(/\s/g, "."),
							value: v
						}))
					},
					{
						type: ApplicationCommandOptionType.INTEGER,
						name: "time",
						description: useLang("help", "timeDesc"),
						required: true,
						choices: [
							{
								name: useLang("time", "5"),
								value: 5
							},
							{
								name: useLang("time", "10"),
								value: 10
							},
							{
								name: useLang("time", "15"),
								value: 15
							},
							{
								name: useLang("time", "30"),
								value: 30
							},
							{
								name: useLang("time", "60"),
								value: 60
							}
						]
					}
				]
			},
			{
				type: ApplicationCommandOptionType.SUB_COMMAND,
				name: "remove",
				description: useLang("help", "remove"),
				options: [
					{
						type: ApplicationCommandOptionType.INTEGER,
						name: "id",
						description: useLang("help", "idDesc"),
						required: true
					}
				]
			},
			{
				type: ApplicationCommandOptionType.SUB_COMMAND,
				name: "list",
				description: useLang("help", "list")
			},
			{
				type: ApplicationCommandOptionType.SUB_COMMAND,
				name: "available",
				description: useLang("help", "available")
			},
			{
				type: ApplicationCommandOptionType.SUB_COMMAND,
				name: "clear",
				description: useLang("help", "clear")
			}
		]);
		await create("misc", "avatar", [
			{
				type: ApplicationCommandOptionType.USER,
				name: "user",
				description: useLang("userDesc"),
				required: true
			}
		]);
		await create("misc", "bugreport", [
			{
				type: ApplicationCommandOptionType.STRING,
				name: "title",
				description: useLang("titleDesc"),
				required: true
			},
			{
				type: ApplicationCommandOptionType.STRING,
				name: "description",
				description: useLang("descDesc")
			}
		]);
		await create("misc", "help", [
			{
				type: ApplicationCommandOptionType.STRING,
				name: "category",
				description: useLang("catDesc"),
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
						name: "Meme",
						value: "meme"
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
		await create("misc", "leaderboard", [
			{
				type: ApplicationCommandOptionType.INTEGER,
				name: "page",
				description: useLang("pageDesc")
			},
			{
				type: ApplicationCommandOptionType.BOOLEAN,
				name: "global",
				description: useLang("globalDesc")
			}
		]);
		await create("misc", "rank", [
			{
				type: ApplicationCommandOptionType.USER,
				name: "user",
				description: useLang("userDesc")
			}
		]);
		await create("misc", "suggest", [
			{
				type: ApplicationCommandOptionType.STRING,
				name: "title",
				description: useLang("titleDesc"),
				required: true
			},
			{
				type: ApplicationCommandOptionType.STRING,
				name: "description",
				description: useLang("descDesc")
			}
		]);
	}
	/* end misc */

	/* start moderation */

	if (ENABLED.MODERATION) {
		await create("moderation", "ban", [
			{
				type: ApplicationCommandOptionType.USER,
				name: "user",
				description: useLang("userDesc"),
				required: true
			},
			{
				type: ApplicationCommandOptionType.STRING,
				name: "reason",
				description: useLang("reasonDesc")
			},
			{
				type: ApplicationCommandOptionType.INTEGER,
				name: "deleteDays",
				description: useLang("deleteDaysDesc"),
				choices: [
					{
						name: "None",
						value: 0
					},
					{
						name: "1 Day",
						value: 1
					},
					{
						name: "2 Days",
						value: 3
					},
					{
						name: "3 Days",
						value: 3
					},
					{
						name: "4 Days",
						value: 4
					},
					{
						name: "5 Days",
						value: 5
					},
					{
						name: "6 Days",
						value: 6
					},
					{
						name: "7 Days",
						value: 7
					}
				]
			},
			{
				type: ApplicationCommandOptionType.STRING,
				name: "time",
				description: useLang("timeDesc")
			}
		]);
		await create("moderation", "kick", [
			{
				type: ApplicationCommandOptionType.USER,
				name: "user",
				description: useLang("userDesc"),
				required: true
			},
			{
				type: ApplicationCommandOptionType.STRING,
				name: "reason",
				description: useLang("reasonDesc")
			}
		]);
		await create("moderation", "lock", [
			{
				type: ApplicationCommandOptionType.CHANNEL,
				name: "channel",
				description: useLang("channelDesc"),
				required: true
			}
		]);
		await create("moderation", "lockdown");
		// @TODO maybe a full setup command?
		await create("moderation", "modlog", [
			{
				type: ApplicationCommandOptionType.SUB_COMMAND,
				name: "setup",
				description: useLang("help", "setup")
			},
			{
				type: ApplicationCommandOptionType.SUB_COMMAND,
				name: "get",
				description: useLang("help", "get")
			},
			{
				type: ApplicationCommandOptionType.SUB_COMMAND,
				name: "reset",
				description: useLang("help", "main")
			}
		]);
		await create("moderation", "mute", [
			{
				type: ApplicationCommandOptionType.USER,
				name: "user",
				description: useLang("userDesc"),
				required: true
			},
			{
				type: ApplicationCommandOptionType.STRING,
				name: "reason",
				description: useLang("reasonDesc")
			},
			{
				type: ApplicationCommandOptionType.STRING,
				name: "time",
				description: useLang("timeDesc")
			}
		]);
		await create("moderation", "purge", [
			{
				type: ApplicationCommandOptionType.INTEGER,
				name: "amount",
				description: useLang("amountDesc"),
				required: true
			}
		]);
		await create("moderation", "reason", [
			{
				type: ApplicationCommandOptionType.INTEGER,
				name: "id",
				description: useLang("idDesc"),
				required: true
			},
			{
				type: ApplicationCommandOptionType.STRING,
				name: "reason",
				description: useLang("reasonDesc"),
				required: true
			}
		]);
		await create("moderation", "softban", [
			{
				type: ApplicationCommandOptionType.USER,
				name: "user",
				description: useLang("userDesc"),
				required: true
			},
			{
				type: ApplicationCommandOptionType.STRING,
				name: "reason",
				description: useLang("reasonDesc")
			},
			{
				type: ApplicationCommandOptionType.INTEGER,
				name: "deleteDays",
				description: useLang("deleteDaysDesc"),
				choices: [
					{
						name: "None",
						value: 0
					},
					{
						name: "1 Day",
						value: 1
					},
					{
						name: "2 Days",
						value: 3
					},
					{
						name: "3 Days",
						value: 3
					},
					{
						name: "4 Days",
						value: 4
					},
					{
						name: "5 Days",
						value: 5
					},
					{
						name: "6 Days",
						value: 6
					},
					{
						name: "7 Days",
						value: 7
					}
				]
			}
		]);
		await create("moderation", "unban", [
			{
				type: ApplicationCommandOptionType.USER,
				name: "user",
				description: useLang("userDesc"),
				required: true
			},
			{
				type: ApplicationCommandOptionType.STRING,
				name: "reason",
				description: useLang("reasonDesc")
			}
		]);
		await create("moderation", "unlock", [
			{
				type: ApplicationCommandOptionType.CHANNEL,
				name: "channel",
				description: useLang("channelDesc"),
				required: true
			}
		]);
		await create("moderation", "unlockdown");
		await create("moderation", "unmute", [
			{
				type: ApplicationCommandOptionType.USER,
				name: "user",
				description: useLang("userDesc"),
				required: true
			},
			{
				type: ApplicationCommandOptionType.STRING,
				name: "reason",
				description: useLang("reasonDesc")
			}
		]);
		await create("moderation", "warn", [
			{
				type: ApplicationCommandOptionType.USER,
				name: "user",
				description: useLang("userDesc"),
				required: true
			},
			{
				type: ApplicationCommandOptionType.STRING,
				name: "reason",
				description: useLang("reasonDesc")
			}
		]);
		await create("moderation", "warnings", [
			{
				type: ApplicationCommandOptionType.SUB_COMMAND,
				name: "list",
				description: useLang("help", "listDesc"),
				options: [
					{
						type: ApplicationCommandOptionType.USER,
						name: "user",
						description: useLang("list", "userDesc"),
						required: true
					},
					{
						type: ApplicationCommandOptionType.INTEGER,
						name: "page",
						description: useLang("list", "pageDesc"),
						required: false
					}
				]
			},
			{
				type: ApplicationCommandOptionType.SUB_COMMAND,
				name: "remove",
				description: useLang("help", "removeDesc"),
				options: [
					{
						type: ApplicationCommandOptionType.USER,
						name: "user",
						description: useLang("remove", "userDesc"),
						required: true
					},
					{
						type: ApplicationCommandOptionType.INTEGER,
						name: "id",
						description: useLang("remove", "idDesc"),
						required: true
					}
				]
			},
			{
				type: ApplicationCommandOptionType.SUB_COMMAND,
				name: "clear",
				description: useLang("help", "clearDesc"),
				options: [
					{
						type: ApplicationCommandOptionType.USER,
						name: "user",
						description: useLang("help", "userDesc"),
						required: true
					}
				]
			}
		]);
	}

	/* end moderation */

	/* start nsfw */

	if (ENABLED.NSFW) {
		await create("nsfw", "bulge");
		await create("nsfw", "e621", [
			{
				type: ApplicationCommandOptionType.STRING,
				name: "tags",
				description: useLang("tagsDesc")
			},
			{
				type: ApplicationCommandOptionType.STRING,
				name: "hide-flash",
				description: useLang("hideFlashDesc"),
				choices: [
					{
						name: "Yes",
						value: "--hide-flash"
					},
					{
						name: "No",
						value: ""
					}
				]
			},
			{
				type: ApplicationCommandOptionType.STRING,
				name: "hide-video",
				description: useLang("hideVideoDesc"),
				choices: [
					{
						name: "Yes",
						value: "--hide-video"
					},
					{
						name: "No",
						value: ""
					}
				]
			}
		]);
		await create("nsfw", "fursuitbutt");
		await create("nsfw", "yiff", [
			{
				type: ApplicationCommandOptionType.STRING,
				name: "type",
				description: useLang("typeDesc"),
				choices: [
					{
						name: "Andromorph",
						value: "andromorph"
					},
					{
						name: "Gay",
						value: "gay"
					},
					{
						name: "Gynomorph",
						value: "gynomorph"
					},
					{
						name: "Lesbian",
						value: "lesbian"
					},
					{
						name: "Straight",
						value: "straight"
					}
				]
			}
		]);
	}

	/* end nsfw */

	/* start utility */

	if (ENABLED.UTILITY) {
		await create("utility", "asar", [
			{
				type: ApplicationCommandOptionType.ROLE,
				name: "role",
				description: useLang("roleDesc"),
				required: true
			}
		]);
		// disabled cannot be made into a slash command due to the way it's designed (arguments can be user/role/channel, etc)
		await create("utility", "editsnipe", [
			{
				type: ApplicationCommandOptionType.CHANNEL,
				name: "channel",
				description: useLang("channelDesc")
			}
		]);
		await create("utility", "inviteinfo", [
			{
				type: ApplicationCommandOptionType.STRING,
				name: "invite",
				description: useLang("invDesc")
			}
		]);

		await create("utility", "levelroles", [
			{
				type: ApplicationCommandOptionType.SUB_COMMAND,
				name: "list",
				description: useLang("help", "listDesc")
			},
			{
				type: ApplicationCommandOptionType.SUB_COMMAND,
				name: "remove",
				description: useLang("help", "removeDesc"),
				options: [
					{
						type: ApplicationCommandOptionType.ROLE,
						name: "index",
						description: useLang("remove", "indexDesc"),
						required: true
					}
				]
			},
			{
				type: ApplicationCommandOptionType.SUB_COMMAND,
				name: "add",
				description: useLang("help", "addDesc"),
				options: [
					{
						type: ApplicationCommandOptionType.ROLE,
						name: "role",
						description: useLang("add", "roleDesc"),
						required: true
					},
					{
						type: ApplicationCommandOptionType.INTEGER,
						name: "level",
						description: useLang("add", "levelDesc"),
						required: true
					}
				]
			}
		]);

		// await create("")
	}

	/* end utility */

	/* start count */
	await h.getApplicationCommands(GUILD).then(v => console.log(v.length, `Total ${GUILD ? "Guild" : "Global"} Commands`));
	/* end count */
});
