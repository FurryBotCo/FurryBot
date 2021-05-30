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
		} else console.log(`Created ${cat}:${name} command.`, !v.id ? util.inspect(v, { depth: null }) : "");
	});
}

// const GUILD = undefined;
// const GUILD = config.client.supportServerId;
const GUILD = "329498711338123268";
const ENABLED = {
	ANIMALS: true,
	FUN: true,
	IMAGES: true,
	INFORMATION: true,
	MEME: true,
	MISC: true,
	MODERATION: true,
	NSFW: true,
	UTILITY: true
};

process.nextTick(async() => {
	// 67 total commands
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
	if (ENABLED.FUN) {
		await create("fun", "8ball", [
			{
				type: ApplicationCommandOptionType.STRING,
				name: "question",
				description: useLang("questionDesc"),
				required: true
			}
		]);
		await create("fun", "awoo");
		await create("fun", "bap", [
			{
				type: ApplicationCommandOptionType.USER,
				name: "user",
				description: useLang("userDesc"),
				required: true
			}
		]);
		await create("fun", "boop", [
			{
				type: ApplicationCommandOptionType.USER,
				name: "user",
				description: useLang("userDesc"),
				required: true
			}
		]);
		await create("fun", "cuddle", [
			{
				type: ApplicationCommandOptionType.USER,
				name: "user",
				description: useLang("userDesc"),
				required: true
			}
		]);
		await create("fun", "dadjoke");
		await create("fun", "dice", [
			{
				type: ApplicationCommandOptionType.INTEGER,
				name: "min",
				description: useLang("minDesc")
			},
			{
				type: ApplicationCommandOptionType.INTEGER,
				name: "max",
				description: useLang("maxDesc")
			}
		]);
		await create("fun", "dictionary", [
			{
				type: ApplicationCommandOptionType.USER,
				name: "user",
				description: useLang("userDesc"),
				required: true
			}
		]);
		await create("fun", "flop", [
			{
				type: ApplicationCommandOptionType.USER,
				name: "user",
				description: useLang("userDesc"),
				required: true
			}
		]);
		await create("fun", "furpile", [
			{
				type: ApplicationCommandOptionType.USER,
				name: "user",
				description: useLang("userDesc")
			}
		]);
		await create("fun", "fursuit");
		await create("fun", "gayrate", [
			{
				type: ApplicationCommandOptionType.USER,
				name: "user",
				description: useLang("userDesc")
			}
		]);
		await create("fun", "glomp", [
			{
				type: ApplicationCommandOptionType.USER,
				name: "user",
				description: useLang("userDesc"),
				required: true
			}
		]);
		await create("fun", "hug", [
			{
				type: ApplicationCommandOptionType.USER,
				name: "user",
				description: useLang("userDesc"),
				required: true
			}
		]);
		await create("fun", "impostor", [
			{
				type: ApplicationCommandOptionType.USER,
				name: "user",
				description: useLang("userDesc")
			}
		]);
		await create("fun", "kiss", [
			{
				type: ApplicationCommandOptionType.USER,
				name: "user",
				description: useLang("userDesc"),
				required: true
			}
		]);
		await create("fun", "marry", [
			{
				type: ApplicationCommandOptionType.USER,
				name: "user",
				description: useLang("userDesc"),
				required: true
			}
		]);
		await create("fun", "nap", [
			{
				type: ApplicationCommandOptionType.USER,
				name: "user",
				description: useLang("userDesc"),
				required: true
			}
		]);
		await create("fun", "nuzzle", [
			{
				type: ApplicationCommandOptionType.USER,
				name: "user",
				description: useLang("userDesc"),
				required: true
			}
		]);
		await create("fun", "pat", [
			{
				type: ApplicationCommandOptionType.USER,
				name: "user",
				description: useLang("userDesc"),
				required: true
			}
		]);
		await create("fun", "poke", [
			{
				type: ApplicationCommandOptionType.USER,
				name: "user",
				description: useLang("userDesc"),
				required: true
			}
		]);
		await create("fun", "pounce", [
			{
				type: ApplicationCommandOptionType.USER,
				name: "user",
				description: useLang("userDesc"),
				required: true
			}
		]);
		await create("fun", "russianroulette", [
			{
				type: ApplicationCommandOptionType.INTEGER,
				name: "bullets",
				description: useLang("bulletsDesc")
			}
		]);
		await create("fun", "ship", [
			{
				type: ApplicationCommandOptionType.USER,
				name: "user1",
				description: useLang("user1Desc")
			},
			{
				type: ApplicationCommandOptionType.USER,
				name: "user2",
				description: useLang("user2Desc")
			}
		]);
		await create("fun", "slap", [
			{
				type: ApplicationCommandOptionType.USER,
				name: "user",
				description: useLang("userDesc"),
				required: true
			}
		]);
		await create("fun", "sniff", [
			{
				type: ApplicationCommandOptionType.USER,
				name: "user",
				description: useLang("userDesc"),
				required: true
			}
		]);
		await create("fun", "snowball", [
			{
				type: ApplicationCommandOptionType.USER,
				name: "user",
				description: useLang("userDesc"),
				required: true
			}
		]);
		await create("fun", "spray", [
			{
				type: ApplicationCommandOptionType.USER,
				name: "user",
				description: useLang("userDesc"),
				required: true
			}
		]);
		await create("fun", "whosagoodboi", [
			{
				type: ApplicationCommandOptionType.USER,
				name: "user",
				description: useLang("userDesc"),
				required: true
			}
		]);
	}
	/* end fun */

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
				]
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
				description: useLang("userDesc")
			}
		]);
		await create("information", "whoplays", [
			{
				type: ApplicationCommandOptionType.STRING,
				name: "game",
				description: useLang("gameDesc"),
				required: true
			},
			{
				type: ApplicationCommandOptionType.STRING,
				name: "global",
				description: useLang("globalDesc"),
				choices: [
					{
						name: "Yes",
						value: "--global"
					},
					{
						name: "No",
						value: ""
					}
				]
			}
		]);
	}

	/* end information */

	/* start meme */

	if (ENABLED.MEME) {
		await create("meme", "brain", [
			{
				type: ApplicationCommandOptionType.STRING,
				name: "first",
				description: useLang("firstDesc"),
				required: true
			},
			{
				type: ApplicationCommandOptionType.STRING,
				name: "second",
				description: useLang("secondDesc"),
				required: true
			},
			{
				type: ApplicationCommandOptionType.STRING,
				name: "third",
				description: useLang("thirdDesc"),
				required: true
			},
			{
				type: ApplicationCommandOptionType.STRING,
				name: "fourth",
				description: useLang("fourthDesc"),
				required: true
			}
		]);
		await create("meme", "bed", [
			{
				type: ApplicationCommandOptionType.USER,
				name: "user1",
				description: useLang("user1Desc")
			},
			{
				type: ApplicationCommandOptionType.USER,
				name: "user2",
				description: useLang("user2Desc")
			}
		]);
		await create("meme", "crab", [
			{
				type: ApplicationCommandOptionType.STRING,
				name: "first",
				description: useLang("firstDesc"),
				required: true
			},
			{
				type: ApplicationCommandOptionType.STRING,
				name: "second",
				description: useLang("secondDesc"),
				required: true
			}
		]);
		await create("meme", "gay", [
			{
				type: ApplicationCommandOptionType.USER,
				name: "user",
				description: useLang("userDesc")
			}
		]);
		await create("meme", "magik", [
			{
				type: ApplicationCommandOptionType.USER,
				name: "user",
				description: useLang("userDesc")
			}
		]);
		await create("meme", "warp", [
			{
				type: ApplicationCommandOptionType.USER,
				name: "user",
				description: useLang("userDesc")
			}
		]);
		await create("meme", "yomomma");

	}
	/* end meme */

	/* start misc */

	if (ENABLED.MISC) {
		await create("misc", "afk", [
			{
				type: ApplicationCommandOptionType.STRING,
				name: "reason",
				description: useLang("reasonDesc")
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
								name: "5 Minutes",
								value: 5
							},
							{
								name: "10 Minutes",
								value: 10
							},
							{
								name: "15 Minutes",
								value: 15
							},
							{
								name: "30 Minutes",
								value: 30
							},
							{
								name: "60 Minutes",
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
				description: useLang("userDesc")
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
				name: "delete_days",
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
				name: "delete_days",
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
						description: useLang("list", "pageDesc")
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
		await create("utility", "log", [
			{
				type: ApplicationCommandOptionType.SUB_COMMAND,
				name: "add",
				description: useLang("help", "add"),
				options: [
					{
						type: ApplicationCommandOptionType.STRING,
						name: "type",
						description: useLang("help", "addType"),
						choices: ["all", ...config.logTypes].map(type => {
							const parts = type.split(/(?=[A-Z])/);
							parts[0] = `${parts[0].charAt(0).toUpperCase()}${parts[0].slice(1)}`;
							return {
								name: parts.join(" "),
								value: type
							};
						}),
						required: true
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
						description: useLang("help", "removeId")
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
		await create("utility", "lsar");
		await create("utility", "makeinv", [
			{
				type: ApplicationCommandOptionType.CHANNEL,
				name: "channel",
				description: useLang("help", "channel"),
				required: true
			},
			{
				type: ApplicationCommandOptionType.BOOLEAN,
				name: "temp",
				description: useLang("help", "temp")
			},
			{
				type: ApplicationCommandOptionType.INTEGER,
				name: "max_age",
				description: useLang("help", "maxAge")
			},
			{
				type: ApplicationCommandOptionType.INTEGER,
				name: "max_uses",
				description: useLang("help", "maxUses")
			}
		]);
		await create("utility", "moveall", [
			{
				type: ApplicationCommandOptionType.CHANNEL,
				name: "from",
				description: useLang("fromDesc"),
				required: true
			},
			{
				type: ApplicationCommandOptionType.CHANNEL,
				name: "to",
				description: useLang("toDesc"),
				required: true
			}
		]);
		await create("utility", "prefix", [
			{
				type: ApplicationCommandOptionType.SUB_COMMAND,
				name: "add",
				description: useLang("addDesc"),
				options: [
					{
						type: ApplicationCommandOptionType.STRING,
						name: "prefix",
						description: useLang("addPrefixDesc"),
						required: true
					}
				]
			},
			{
				type: ApplicationCommandOptionType.SUB_COMMAND,
				name: "remove",
				description: useLang("removeDesc"),
				options: [
					{
						type: ApplicationCommandOptionType.STRING,
						name: "prefix",
						description: useLang("removePrefixDesc"),
						required: true
					}
				]
			},
			{
				type: ApplicationCommandOptionType.SUB_COMMAND,
				name: "list",
				description: useLang("listDesc")
			},
			{
				type: ApplicationCommandOptionType.SUB_COMMAND,
				name: "reset",
				description: useLang("resetDesc"),
				options: [
					{
						type: ApplicationCommandOptionType.BOOLEAN,
						name: "confirm",
						description: useLang("confirmDesc")
					}
				]
			}
		]);
		await create("utility", "reembed", [
			{
				type: ApplicationCommandOptionType.STRING,
				name: "url",
				description: useLang("urlDesc"),
				required: true
			}
		]);
		await create("utility", "rsar", [
			{
				type: ApplicationCommandOptionType.ROLE,
				name: "role",
				description: useLang("roleDesc"),
				required: true
			}
		]);
		await create("utility", "sauce", [
			{
				type: ApplicationCommandOptionType.STRING,
				name: "url",
				description: useLang("urlDesc"),
				required: true
			}
		]);
		await create("utility", "seen", [
			{
				type: ApplicationCommandOptionType.USER,
				name: "user",
				description: useLang("userDesc"),
				required: true
			}
		]);
		// this is a mess
		await create("utility", "settings", config.settings.map(set => {
			// name can only use lowercase characters, underscores, and dashes
			let name = set.name.toLowerCase().replace(/\s/g, "-");
			if (name.length >= 100) name = `${Strings.truncate(name, 94)} (...)`;
			let description = set.description;
			if (description.length >= 100) description = `${Strings.truncate(description, 94)} (...)`;
			const type  = set.type === "boolean" ? ApplicationCommandOptionType.BOOLEAN :
				set.type === "role" ? ApplicationCommandOptionType.ROLE : null;
			if (type === null) {
				switch (set.dbName) {
					case "defaultYiffType": return {
						type: ApplicationCommandOptionType.SUB_COMMAND,
						name,
						description,
						options: [
							{
								type: ApplicationCommandOptionType.STRING,
								name: "value",
								description: "The value for this setting.",
								required: true,
								choices: config.yiffTypes.map(v => ({
									name: Strings.ucwords(v),
									value: v
								}))
							}
						]
					};
					case "lang": return {
						type: ApplicationCommandOptionType.SUB_COMMAND,
						name,
						description,
						options: [
							{
								type: ApplicationCommandOptionType.STRING,
								name: "value",
								description: "The value for this setting.",
								required: true,
								choices: config.languages.map(v => ({
									name: v,
									value: v
								}))
							}
						]
					};

					default: return null;
				}
			} else return {
				type: ApplicationCommandOptionType.SUB_COMMAND,
				name,
				description,
				options: [
					{
						type,
						name: "value",
						description: "The value for this setting.",
						required: true
					}
				]
			};
		}).filter(Boolean) as Array<ApplicationCommandOption>);

		await create("utility", "slowmode", [
			{
				type: ApplicationCommandOptionType.INTEGER,
				name: "seconds",
				description: useLang("secondsDesc"),
				required: true
			},
			{
				type: ApplicationCommandOptionType.CHANNEL,
				name: "channel",
				description: useLang("channelDesc")
			}
		]);
		await create("utility", "snipe", [
			{
				type: ApplicationCommandOptionType.CHANNEL,
				name: "channel",
				description: useLang("channelDesc")
			}
		]);
		await create("utility", "steal", [
			{
				type: ApplicationCommandOptionType.STRING,
				name: "url",
				description: useLang("urlDesc")
			}
		]);
		await create("utility", "tag", [
			{
				type: ApplicationCommandOptionType.SUB_COMMAND,
				name: "create",
				description: useLang("createDesc"),
				options: [
					{
						type: ApplicationCommandOptionType.STRING,
						name: "name",
						description: useLang("nameDesc"),
						required: true
					},
					{
						type: ApplicationCommandOptionType.STRING,
						name: "value",
						description: useLang("valueDesc"),
						required: true
					}
				]
			},
			{
				type: ApplicationCommandOptionType.SUB_COMMAND,
				name: "delete",
				description: useLang("deleteDesc"),
				options: [
					{
						type: ApplicationCommandOptionType.STRING,
						name: "name",
						description: useLang("nameDesc"),
						required: true
					}
				]
			},
			{
				type: ApplicationCommandOptionType.SUB_COMMAND,
				name: "edit",
				description: useLang("editDesc"),
				options: [
					{
						type: ApplicationCommandOptionType.STRING,
						name: "name",
						description: useLang("nameDesc"),
						required: true
					},
					{
						type: ApplicationCommandOptionType.STRING,
						name: "value",
						description: useLang("valueDesc"),
						required: true
					}
				]
			},
			{
				type: ApplicationCommandOptionType.SUB_COMMAND,
				name: "list",
				description: useLang("listDesc"),
				options: []
			}
		]);
	}

	/* end utility */

	/* start count */
	await h.getApplicationCommands(GUILD).then(v => console.log(v.length, `Total ${GUILD ? "Guild" : "Global"} Commands`));
	/* end count */
});
