import FurryBot from "../main";
import ExtendedMessage from "../modules/extended/ExtendedMessage";
import config from "../config";
import { Command, CommandError } from "../util/CommandHandler";
import phin from "phin";
import * as Eris from "eris";
import Permissions from "../util/Permissions";
import UserConfig from "../modules/config/UserConfig";
import { mdb } from "../modules/Database";
import CmdHandler from "../util/cmd";
import { Logger } from "@donovan_dmc/ws-clusters";

type CommandContext = FurryBot & { _cmd: Command };

CmdHandler
	.addCategory({
		name: "information",
		displayName: ":tools: Information",
		devOnly: false,
		description: "Some information that may be useful to you, may not be, I don't know."
	})
	.addCommand({
		triggers: [
			"botlistinfo",
			"blinfo"
		],
		userPermissions: [],
		botPermissions: [
			"embedLinks"
		],
		cooldown: 3e3,
		donatorCooldown: 3e3,
		description: "Get some info about a bot from some botlists.",
		usage: "<@bot/id>",
		features: [],
		category: "information",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			let list;
			if (msg.args.length === 0) throw new CommandError(null, "ERR_INVALID_USAGE");
			// get user from message
			const user = await msg.getUserFromArgs();

			if (!user) return msg.errorEmbed("INVALID_USER");

			if (!user.bot) return msg.reply("You cannot look up users.");

			// botlist lookup
			const req = await phin({
				method: "GET",
				url: `https://botblock.org/api/bots/${user.id}`
			});

			let rs;
			try {
				rs = JSON.parse(req.body.toString());
				for (const ls in rs.list_data) {
					const ll = rs.list_data[ls];
					if (ll[1] !== 200) continue;
					list.push(`[${ls}](https://api.furry.bot/botlistgo/${encodeURIComponent(ls)}/${encodeURIComponent(user.id)})`);
				}

				// list = Object.keys(this._.pickBy(rs.list_data,((val,key) => ([null,undefined,""].includes(val[0]) || ((typeof val[0].bot !== "undefined" && val[0].bot.toLowerCase() === "no bot found") || (typeof val[0].success !== "undefined" && [false,"false"].includes(val[0].success)))) ?  false : val[1] === 200))).map(list => ({name: list,url:`https://api.furry.bot/botlistgo.php?list=${list}&id=${user.id}`}));
			} catch (e) {
				Logger.log(`Cluster #${this.cluster.id}`, {
					headers: req.headers,
					body: req.body.toString(),
					statusCode: req.statusCode
				});
				Logger.error(e, msg.guild.shard.id);
				rs = req.body;
				list = "Lookup Failed.";
			}

			let i = 0;
			const b = [];
			for (const key in list) {
				if (list[key].startsWith("(")) continue;
				if (typeof b[i] === "undefined") b[i] = "";
				if (b[i].length + list[key].length >= 1000) {
					i++;
					b[i] = list[key];
				} else {
					b[i] += `${list[key]}\n`;
				}
			}

			const embed = {
				title: "Botlist Info",
				description: "All links redirect from our api to make keeping links up to date easier.\nNote: we use an external api to fetch these, so some may be wrongfully listed.",
				fields: [

				],
				color: this.f.randomColor(),
				timestamp: new Date().toISOString()
			};
			b.forEach((l, c) => {
				embed.fields.push({
					name: `List #${+c + 1}`,
					value: l,
					inline: false
				});
			});

			return msg.channel.createMessage({
				embed
			});
		})
	})
	.addCommand({
		triggers: [
			"info",
			"inf",
			"i"
		],
		userPermissions: [],
		botPermissions: [
			"embedLinks"
		],
		cooldown: 2e3,
		donatorCooldown: 1e3,
		description: "Get some info about me.",
		usage: "",
		features: [],
		category: "information",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			const st = await this.cluster.getMainStats();
			if (st.clusters.length === 0) return msg.reply("hey, I haven't recieved any stats from other clusters yet, please try again later!");

			const embed: Eris.EmbedOptions = {
				title: "Bot Info!",
				fields: [
					{
						name: "Process Memory Usage",
						value: `${Math.round(st.memoryUsage.heapUsed / 1024 / 1024)}MB/${Math.round(this.f.memory.process.getTotal() / 1024 / 1024)}MB`,
						inline: false
					}, {
						name: "System Memory Usage",
						value: `${Math.round(this.f.memory.system.getUsed() / 1024 / 1024 / 1024)}GB/${Math.round(this.f.memory.system.getTotal() / 1024 / 1024 / 1024)}GB`,
						inline: false
					}, {
						name: "Library",
						value: "Eris",
						inline: false
					}, {
						name: "Uptime",
						value: `${this.f.parseTime(process.uptime())} (${this.f.secondsToHours(process.uptime())})`,
						inline: false
					}, {
						name: "Stats",
						value: `Shard: ${msg.guild.shard.id + 1}/${(st.clusters[st.clusters.length - 1].lastShardId) + 1}\nCluster: ${this.cluster.id + 1}/${st.clusters.length}\n Server Count: ${st.guildCount}\n User Count: ${st.userCount}\n Channel Count: ${st.channelCount}\nLarge Guild Count: ${st.largeGuildCount}\nVoice Connection Count: ${st.voiceConnectionCount}\nAverage Ping: ${Math.floor(st.shards.map(s => s.latency).reduce((a, b) => a + b) / st.shards.length)}ms`,
						inline: false
					}, {
						name: "Commands",
						value: `${CmdHandler.commands.length} total commands`,
						inline: false
					}, {
						name: "API Version",
						value: "7",
						inline: false
					}, {
						name: "Bot Version",
						value: config.version,
						inline: false
					}, {
						name: `Eris Version`,
						value: Eris.VERSION,
						inline: false
					}, {
						name: "Node.JS Version",
						value: process.version,
						inline: false
					}, {
						name: "Support Server",
						value: "[https://furry.bot/inv](https://furry.bot/inv)",
						inline: false
					}, {
						name: "Bot Creator",
						value: "Donovan_DMC#3621, [@Donovan_DMC](https://twitter.com/Donovan_DMC)",
						inline: false
					}
				]
			};
			Object.assign(embed, msg.embed_defaults());
			msg.channel.createMessage({ embed });
		})
	})
	.addCommand({
		triggers: [
			"invite",
			"inv",
			"discord"
		],
		userPermissions: [],
		botPermissions: [
			"embedLinks"
		],
		cooldown: 2e3,
		donatorCooldown: 1e3,
		description: "Get some invite links for me!",
		usage: "",
		features: [],
		category: "information",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			const botPerms = [
				"kickMembers",
				"banMembers",
				"manageChannels",
				"manageGuild",
				"addReactions",
				"viewAuditLogs",
				"voicePrioritySpeaker",
				"readMessages",
				"sendMessages",
				"manageMessages",
				"embedLinks",
				"attachFiles",
				"readMessageHistory",
				"externalEmojis",
				"voiceConnect",
				"voiceSpeak",
				"voiceMuteMembers",
				"voiceDeafenMembers",
				"voiceMoveMembers",
				"voiceUseVAD",
				"changeNickname",
				"manageNicknames",
				"manageRoles"
			].map(perm => Permissions.constant[perm] || 0).reduce((a, b) => a + b);

			let embed: Eris.EmbedOptions;
			embed = {
				title: "Discord",
				description: `[Join Our Discord Server!](https://discord.gg/YazeA7e)\n[Invite Me To Your Server](https://discordapp.com/oauth2/authorize?client_id=${this.bot.user.id}&scope=bot&permissions=${botPerms})`,
				thumbnail: {
					url: "https://cdn.discordapp.com/embed/avatars/0.png"
				}
			};

			Object.assign(embed, msg.embed_defaults());
			return msg.channel.createMessage({ embed });
		})
	})
	.addCommand({
		triggers: [
			"ipinfo",
			"ip"
		],
		userPermissions: [],
		botPermissions: [
			"embedLinks"
		],
		cooldown: 1e4,
		donatorCooldown: .5e4,
		description: "Get info about an ip address.",
		usage: "<ip>",
		features: [],
		category: "information",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			if (msg.unparsedArgs.length === 0) throw new CommandError(null, "ERR_INVALID_USAGE");
			// if(config.apis.ipinfo.regex.ipv4.test(msg.unparsedArgs.join(" ")) || config.apis.ipinfo.regex.ipv6.test(msg.unparsedArgs.join(" "))) {
			const req = await phin({
				method: "GET",
				url: `https://ipapi.co/${msg.unparsedArgs.join(" ")}/json`,
				headers: {
					"User-Agent": config.web.userAgent
				}
			}).then(rq => JSON.parse(rq.body.toString()));
			if (req.error || req.reserved) {
				if (![undefined, null, ""].includes(req.reason)) return msg.channel.createMessage(`<@!${msg.author.id}>, Error processing request: ${req.reason}.`);
				if (req.reserved) return msg.channel.createMessage(`<@!${msg.author.id}>, The supplied ip is a reserved ip, these have no specific information associated with them.`);
			}

			const embed: Eris.EmbedOptions = {
				title: `IP Info for ${req.ip}`,
				fields: [{
					name: "Location",
					value: `${req.city}, ${req.region} (${req.region_code}) - ${req.country_name} (lat: ${req.latitude} long: ${req.longitude})`,
					inline: false
				}, {
					name: "Owner",
					value: `${req.org} (${req.asn})`,
					inline: false
				}, {
					name: "Timezone",
					value: `${req.timezone} (UTC-${req.utc_offset})`,
					inline: false
				}]
			};

			return msg.channel.createMessage({
				embed
			});
			// } else {
			// return msg.channel.createMessage("Invalid ip address.");
			// }
		})
	})
	.addCommand({
		triggers: [
			"perms",
			"listperms"
		],
		userPermissions: [],
		botPermissions: [
			"embedLinks"
		],
		cooldown: 2e3,
		donatorCooldown: 1e3,
		description: "Check your permissions, and my permissions.",
		usage: "",
		features: [],
		category: "information",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			const allowUser = [],
				denyUser = [],
				allowBot = [],
				denyBot = [],
				b = msg.channel.permissionsOf(this.bot.user.id);

			for (const p in Permissions.constant) {
				if (msg.member.permission.allow & Permissions.constant[p]) allowUser.push(p);
				else denyUser.push(p);
			}

			for (const p in Permissions.constant) {
				if (b.allow & Permissions.constant[p]) allowBot.push(p);
				else denyBot.push(p);
			}

			const au = allowUser.length === 0 ? "NONE" : allowUser.join("**, **");
			const du = denyUser.length === Object.keys(Permissions.constant).length ? "NONE" : denyUser.join("**, **");
			const ab = allowBot.length === 0 ? "NONE" : allowBot.join("**, **");
			const db = denyBot.length === Object.keys(Permissions.constant).length ? "NONE" : denyBot.join("**, **");
			const embed = {
				title: "Permission Info",
				fields: [
					{
						name: "User",
						value: `__Allow__:\n**${au.length === 0 ? "NONE" : au
							}**\n\n\n__Deny__:\n**${du.length === 0 ? "NONE" : du}**`,
						inline: false
					}, {
						name: "Bot",
						value: `__Allow__:\n**${ab.length === 0 ? "NONE" : ab}**\n\n\n__Deny__:\n**${db.length === 0 ? "NONE" : db}**`,
						inline: false
					}
				]
			};
			Object.assign(embed, msg.embed_defaults());
			return msg.channel.createMessage({ embed });
		})
	})
	.addCommand({
		triggers: [
			"ping",
			"pong"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: .5e3,
		donatorCooldown: .25e3,
		description: "Get my average ping.",
		usage: "",
		features: [],
		category: "information",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			return msg.channel.createMessage("Checking Ping..")
				.then(m => m.edit("Ping Calculated!"))
				.then(async (m) => {
					await msg.channel.createMessage(`Client Ping: ${+m.timestamp - +msg.timestamp}ms${"\n"}Shard Ping: ${Math.round(msg.guild.shard.latency)}ms`);
					return m.delete();
				});
		})
	})
	.addCommand({
		triggers: [
			"seen",
			"seenon"
		],
		userPermissions: [],
		botPermissions: [
			"embedLinks"
		],
		cooldown: 2e3,
		donatorCooldown: 1e3,
		description: "Get the servers I share with a user.",
		usage: "<@member/id>",
		features: [],
		category: "information",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			const user = msg.args.length === 0 || !msg.args ? msg.member : await msg.getMemberFromArgs();

			if (!user) return msg.errorEmbed("INVALID_USER");

			const a = this.bot.guilds.filter(g => g.members.has(user.id)),
				b = a.map(g => `${g.name} (${g.id})`),
				guilds = [],
				fields = [];

			let i = 0;

			for (const key in b) {
				if (!guilds[i]) guilds[i] = "";
				if (guilds[i].length > 1000 || +guilds[i].length + b[key].length > 1000) {
					i++;
					guilds[i] = b[key];
				} else {
					guilds[i] += `\n${b[key]}`;
				}
			}

			guilds.forEach((g, c) => {
				fields.push({
					name: `Server List #${+c + 1}`,
					value: g,
					inline: false
				});
			});

			const embed = {
				title: `Seen On ${b.length} Servers - ${user.user.username}#${user.user.discriminator} (${user.id})`,
				description: `I see this user in ${b.length} other guilds.`,
				fields
			};

			msg.channel.createMessage({ embed });
		})
	})
	.addCommand({
		triggers: [
			"shard"
		],
		userPermissions: [],
		botPermissions: [
			"embedLinks"
		],
		cooldown: 2e3,
		donatorCooldown: 1e3,
		description: "Get some info about your servers current shard.",
		usage: "",
		features: [],
		category: "information",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			const embed: Eris.EmbedOptions = {
				title: "Shard Info",
				description: `Guilds: ${this.bot.guilds.filter(g => g.shard.id === msg.guild.shard.id).length}\nPing: ${msg.guild.shard.latency}ms`,
				color: this.f.randomColor(),
				timestamp: new Date().toISOString()
			};

			return msg.channel.createMessage({
				embed
			});
		})
	})
	.addCommand({
		triggers: [
			"shards"
		],
		userPermissions: [],
		botPermissions: [
			"embedLinks"
		],
		cooldown: 2e3,
		donatorCooldown: 1e3,
		description: "Get some info about my shards.",
		usage: "[cluster id]",
		features: [],
		category: "information",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			const st =
				!isNaN(msg.args[0] as any) ?
					await this.cluster.getClusterStats(parseInt(msg.args[0], 10)) :
					this.cluster.stats;

			if (!st) return msg.reply("I have not recieved any stats from my manager, please wait a bit!");

			const embed: Eris.EmbedOptions = {
				title: "Shard Info",
				fields: st.shards.map(s => ({
					name: `Shard #${s.id}`,
					value: `Guilds: ${s.guildCount}\nPing: ${s.latency !== Infinity ? `${s.latency}ms` : "N/A"}\nStatus: ${s.status}`,
					inline: true
				})),
				color: this.f.randomColor(),
				timestamp: new Date().toISOString()
			};

			if (st.shards.map(s => s.id).includes(msg.guild.shard.id)) embed.fields.find(f => f.name === `Shard #${msg.guild.shard.id}`).name = `Shard #${msg.guild.shard.id} (current)`;

			return msg.channel.createMessage({
				embed
			});
		})
	})
	.addCommand({
		triggers: [
			"clusters"
		],
		userPermissions: [],
		botPermissions: [
			"embedLinks"
		],
		cooldown: 2e3,
		donatorCooldown: 1e3,
		description: "Get some info about my clusters.",
		usage: "",
		features: [],
		category: "information",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			const st = await this.cluster.getMainStats();

			if (!st) return msg.reply("I have not recieved any stats from my manager, please wait a bit!");

			const embed: Eris.EmbedOptions = {
				title: "Cluster Info",
				fields: st.clusters.map(c => ({
					name: `Cluster #${c.id}`,
					value: `Shards ${c.firstShardId} - ${c.lastShardId} (${c.shards.length})\nAverage Ping: ${Math.floor(c.shards.map(s => s.latency).reduce((a, b) => a + b) / c.shards.length)}ms\nGuild Count: ${c.guildCount} (${c.largeGuildCount} large)`,
					inline: true
				})),
				color: this.f.randomColor(),
				timestamp: new Date().toISOString(),
				footer: {
					text: `Total Guild Count: ${st.guildCount}`
				}
			};

			embed.fields[this.cluster.id].name = `Cluster #${this.cluster.id} (current)`;

			return msg.channel.createMessage({
				embed
			});
		})
	})
	.addCommand({
		triggers: [
			"sinfo",
			"serverinfo",
			"server",
			"si"
		],
		userPermissions: [],
		botPermissions: [
			"embedLinks"
		],
		cooldown: 2e3,
		donatorCooldown: 1e3,
		description: "Get some info about the current server.",
		usage: "",
		features: [],
		category: "information",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			const textChCount = msg.guild.channels.filter(c => c.type === 0).length,
				voiceChCount = msg.guild.channels.filter(c => c.type === 2).length,
				categoryChCount = msg.guild.channels.filter(c => c.type === 4).length;
			let owner;
			const o = msg.guild.members.find(m => m.id === msg.guild.ownerID);
			if (!o) {
				owner = "Unknown";
			} else {
				owner = `${o.user.username}#${o.user.discriminator} (${o.id})`;
			}

			let features = "";

			const f = {
				INVITE_SPLASH: "Invite Splash",
				VIP_REGIONS: "Vip Voice Regions/320kbps Voice Channels",
				VANITY_URL: "Vanity URL",
				VERIFIED: "Verified",
				PARTNERED: "Partnered",
				LURKABLE: "Lurkable",
				COMMERCE: "Store Channels",
				NEWS: "News Channels",
				DISCOVERABLE: "Discoverable",
				FEATURABLE: "Featurable",
				ANIMATED_ICON: "Animated Icon",
				BANNER: "Guild Banner",
				PUBLIC: "Public"
			};

			Object.keys(f).forEach((k) => msg.guild.features.includes(k) ? features += `**${k}** - ${f[k]}\n` : null);
			if (features === "") features = "NONE";
			const verificationLevel = [
				"**NONE** - unrestricted",
				"**LOW** - 	must have verified email on account",
				"**MEDIUM** - 	must be registered on Discord for longer than 5 minutes",
				"**HIGH** - (╯°□°）╯︵ ┻━┻ - must be a member of the server for longer than 10 minutes",
				"**VERY HIGH** - ┻━┻ミヽ(ಠ益ಠ)ﾉ彡┻━┻ - must have a verified phone number"
			];
			// let s;
			// if (msg.channel.guild.memberCount < 1000) s = await Promise.all(msg.guild.members.filter(m => !m.user.bot).map((m) => mdb.collection("users").findOne({ id: m.id }))).then(res => res.map(m => m === null ? config.defaults.userConfig : m).map(m => ({ owoCount: m.owoCount === undefined ? 0 : m.owoCount, uwuCount: m.uwuCount === undefined ? 0 : m.uwuCount })));
			// else s = false;
			const mfaLevel = [
				"Not Enabled",
				"Enabled"
			];

			const defaultNotifications = [
				"All Messages",
				"Only Mentions"
			];
			const roles = msg.guild.roles.map(role => role.name === "@everyone" ? "@everyone" : `<@&${role.id}>`).join(",");
			const rr = roles.length > 1000 ? `Too many to list.` : roles;
			const embed = {
				title: `Server Info - **${msg.guild.name}**`,
				image: {
					url: msg.guild.iconURL
				},
				fields: [
					{
						name: "Guild ID",
						value: msg.channel.guild.id,
						inline: false
					},
					{
						name: "Guild Owner",
						value: owner,
						inline: false
					},
					{
						name: "Members",
						value: `Total: ${msg.guild.memberCount}\n\n\
	<:online:590067324837691401>: ${msg.guild.members.filter(m => m.status === "online").length}\n\
	<:idle:590067351806803968>: ${msg.guild.members.filter(m => m.status === "idle").length}\n\
	<:dnd:590067389782032384>: ${msg.guild.members.filter(m => m.status === "dnd").length}\n\
	<:offline:590067411080970241>: ${msg.guild.members.filter(m => m.status === "offline").length}\n\n\
	Non Bots: ${msg.channel.guild.members.filter(m => !m.bot).length}\n\
	Bots: ${msg.channel.guild.members.filter(m => m.bot).length}`,
						inline: false
					},
					{
						name: "Channels",
						value: `Total: ${msg.guild.channels.size}\n\
	Text: ${textChCount}\n\
	Voice: ${voiceChCount}\n\
	Category: ${categoryChCount}`,
						inline: false
					},
					{
						name: "Guild Creation Date",
						value: new Date(msg.guild.createdAt).toString().split("GMT")[0],
						inline: false
					},
					{
						name: "Region",
						value: msg.guild.region,
						inline: false
					},
					{
						name: `Roles [${msg.guild.roles.size - 1}]`,
						value: rr,
						inline: false
					},
					{
						name: "Extra",
						value: `**Large Guild**: ${msg.guild.large ? "Yes" : "No"}\n**Verification**: ${verificationLevel[msg.guild.verificationLevel]}\n**2FA**: ${mfaLevel[msg.guild.mfaLevel]}\n**Default Notifications**: ${defaultNotifications[msg.guild.defaultNotifications]}\n**[Features](https://discordapp.com/developers/docs/resources/guild#guild-object-guild-features)**:\n${features}`,
						inline: false
					}/*, {
	name: "Counters",
	value: !s ? "Guild is too large to display counts." : `OwO Counts: ${s.map(j => j.owoCount).reduce((a, b) => a + b)}\nUwU Counts: ${s.map(j => j.uwuCount).reduce((a, b) => a + b)}`,
	inline: false
			}*/
				],
				timestamp: new Date().toISOString(),
				color: this.f.randomColor()
			};

			return msg.channel.createMessage({ embed });
		})
	})
	.addCommand({
		triggers: [
			"uinfo",
			"userinfo",
			"ui"
		],
		userPermissions: [],
		botPermissions: [
			"embedLinks"
		],
		cooldown: 2e3,
		donatorCooldown: 1e3,
		description: "Get some info about a user.",
		usage: "[@member/id]",
		features: [],
		category: "information",
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			const user = msg.args.length === 0 || !msg.args ? msg.member : await msg.getMemberFromArgs();

			if (!user) return msg.errorEmbed("INVALID_USER");

			const roles = user.roles.map(role => role !== msg.channel.guild.id ? `<@&${role}>` : "@everyone");

			const embed = {
				title: "User info",
				fields: [{
					name: "Tag",
					value: `${user.user.username}#${user.user.discriminator}`,
					inline: true
				}, {
					name: "User ID",
					value: user.id,
					inline: true
				}, {
					name: "Joined Server",
					value: new Date(user.joinedAt).toString().split("GMT")[0],
					inline: true
				}, {
					name: "Joined Discord",
					value: new Date(user.user.createdAt).toString().split("GMT")[0],
					inline: true
				}, {
					name: `Roles [${roles.length}]`,
					value: roles.length > 15 ? `Too many roles to list, please use \`${msg.gConfig.prefix}roles ${user.user.id}\`` : roles.length === 0 ? "NONE" : roles.toString(),
					inline: false
				}]
			};

			if (!user.user.bot) {
				let u: UserConfig = await mdb.collection("users").findOne({ id: user.id });
				if (!u) {
					await mdb.collection("users").insertOne({ id: user.id, ...config.defaults.userConfig });
					u = await mdb.collection("users").findOne({ id: user.id });
				}

				if (u.blacklist.blacklisted) embed.fields.push({
					name: "Blacklist",
					value: `User is blacklisted.\nReason: ${u.blacklist.reason}\nBlame: ${u.blacklist.blame}`,
					inline: true
				});

				else embed.fields.push({
					name: "Blacklist",
					value: "User is not blacklisted.",
					inline: true
				});

				if (u.marriage.married) embed.fields.push({
					name: "Marriage Status (on this bot)",
					value: `Married to ${await this.bot.getRESTUser(u.marriage.partner).then(usr => `${usr.username}#${usr.discriminator}`).catch(err => "Unknown#0000")}`,
					inline: true
				});

				else embed.fields.push({
					name: "Marriage Status (on this bot)",
					value: "Not Married.",
					inline: false
				});
			} else embed.fields.push({
				name: "Blacklist",
				value: "Bots cannot be blacklisted.",
				inline: false
			});
			return msg.channel.createMessage({
				embed
			});
		})
	});

export default null;
