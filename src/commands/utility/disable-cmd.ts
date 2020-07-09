import Command from "../../modules/CommandHandler/Command";
import { Strings } from "../../util/Functions";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import chunk from "chunk";

export default new Command({
	triggers: [
		"disable"
	],
	permissions: {
		user: [
			"manageGuild"
		],
		bot: []
	},
	cooldown: 3e3,
	donatorCooldown: 3e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const c = ["disable"];
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
				`\u25FD {lang:commands.utility.disable.help.removeAll}: \`${msg.prefix}disable remove all\``,
				"",
				"**{lang:commands.utility.disable.help.list}**:",
				`\u25FD {lang:commands.utility.disable.help.list} \`${msg.prefix}disable list\``
			].join("\n"))
			.toJSON()
	});

	// due to the structure changing
	if (!(gConfig.disable instanceof Array)) await gConfig.mongoEdit<typeof gConfig>({
		$set: {
			disable: []
		}
	});

	switch (msg.args[0].toLowerCase()) {
		case "add": {
			const all = msg.args[1].toLowerCase() === "all";
			const d: any = {};
			let type: "cmd" | "cat";
			if (!all) {
				const cmds = this.cmd.triggers.map(t => t.toLowerCase());
				const cats = this.cmd.categories.map(c => c.name.toLowerCase());
				if (cmds.includes(msg.args[1].toLowerCase())) (type = "cmd", d.command = msg.args[1].toLowerCase());
				else if (cats.includes(msg.args[1].toLowerCase())) (type = "cat", d.category = msg.args[1].toLowerCase());
				else return msg.reply(`{lang:commands.utility.disable.invalid|${msg.args[1].toLowerCase()}}`);
			} else d.all = true;

			if (d.command && c.includes(d.command.toLowerCase())) return msg.reply(`{lang:commands.utility.disable.commandNotAllowed|${d.command}}`);

			if (msg.args.length === 2) {
				if (d.all) return msg.reply("{lang:commands.utility.disable.noAllServer}");
				const c = {
					type: "server",
					...d
				};
				for (const dis of gConfig.disable) if (JSON.stringify(dis) === JSON.stringify(c)) return msg.reply("{lang:commands.utility.disable.duplicate}");

				await gConfig.mongoEdit({
					$push: {
						disable: c
					}
				});
				return msg.reply({
					allowedMentions: {
						everyone: false,
						roles: false,
						users: false
					},
					content: `{lang:commands.utility.disable.success.${type}Server|${msg.args[1].toLowerCase()}}`
				});
			}
			else {
				const ch = await msg.getChannelFromArgs(2, null, null);
				const role = await msg.getRoleFromArgs(2, null, null);
				const user = await msg.getMemberFromArgs(2, null, null);

				if (ch) {
					const c = {
						type: "channel",
						id: ch.id,
						...d
					};

					for (const dis of gConfig.disable) if (JSON.stringify(dis) === JSON.stringify(c)) return msg.reply("{lang:commands.utility.disable.duplicate}");

					await gConfig.mongoEdit({
						$push: {
							disable: c
						}
					});
					return msg.reply({
						allowedMentions: {
							everyone: false,
							roles: false,
							users: false
						},
						content: `{lang:commands.utility.disable.success.${type || "all"}Channel|${!type ? "" : `${msg.args[1].toLowerCase()}|`}${ch.id}}`
					});
				} else if (role) {
					const c = {
						type: "role",
						id: role.id,
						...d
					};

					for (const dis of gConfig.disable) if (JSON.stringify(dis) === JSON.stringify(c)) return msg.reply("{lang:commands.utility.disable.duplicate}");

					await gConfig.mongoEdit({
						$push: {
							disable: c
						}
					});
					return msg.reply({
						allowedMentions: {
							everyone: false,
							roles: false,
							users: false
						},
						content: `{lang:commands.utility.disable.success.${type || "all"}Role|${!type ? "" : `${msg.args[1].toLowerCase()}|`}${role.id}}`
					});
				} else if (user) {
					const c = {
						type: "user",
						id: user.id,
						...d
					};

					for (const dis of gConfig.disable) if (JSON.stringify(dis) === JSON.stringify(c)) return msg.reply("{lang:commands.utility.disable.duplicate}");

					await gConfig.mongoEdit({
						$push: {
							disable: c
						}
					});
					return msg.reply({
						allowedMentions: {},
						content: `{lang:commands.utility.disable.success.${type || "all"}User|${!type ? "" : `${msg.args[1].toLowerCase()}|`}${user.id}}`
					});
				} else return msg.reply({
					allowedMentions: {
						everyone: false,
						roles: false,
						users: false
					},
					content: `{lang:commands.utility.disable.noAddFound|${msg.args[2].toLowerCase()}}`
				});
			}
			break;
		}

		case "remove": {
			if (msg.args.length === 1) return msg.reply("{lang:commands.utility.disable.remove.missingId}");

			if (msg.args[1].toLowerCase() === "all") {
				await gConfig.mongoEdit({
					$set: {
						disable: []
					}
				});
				return msg.reply("{lang:commands.utility.disable.remove.cleared}");
			} else {
				const id = Number(msg.args[1]);
				if (isNaN(id)) return msg.reply("{lang:commands.utility.disable.remove.NaNId}");
				if (id < 1 || id > gConfig.disable.length) return msg.reply(`{lang:commands.utility.disable.remove.invlidId|${id}}`);
				const e = gConfig.disable[id - 1];
				await gConfig.mongoEdit({
					$pull: {
						disable: e
					}
				});
				return msg.reply(`{lang:commands.utility.disable.remove.success|${id}}`);
			}
			break;
		}

		case "list": {
			if (gConfig.disable.length === 0) return msg.reply("{lang:commands.utility.disable.list.empty}");
			const pages = chunk(gConfig.disable, 10);
			if (pages.length === 0) return msg.reply("{lang:commands.utility.disable.list.empty}");
			const page = msg.args.length === 1 ? 1 : Number(msg.args[1]);
			if (isNaN(page) || page > 1 || page < pages.length) return msg.reply(`{lang:commands.utility.disable.list.invalidPage|1|${pages.length}}`);

			return msg.channel.createMessage({
				embed: new EmbedBuilder(gConfig.settings.lang)
					.setDescription([
						...pages[page - 1].map(d => `[#${gConfig.disable.indexOf(d) + 1}]: {lang:commands.utility.disable.list.${(d as any).command ? "cmd" : (d as any).category ? "cat" : "all"}${Strings.ucwords(d.type)}${(d as any).command ? `|${(d as any).command}` : (d as any).category ? `|${(d as any).category}` : ""}${d.type !== "server" ? `|${(d as any).id}` : ""}}`)
					].join("\n"))
					.setColor(Colors.green)
					.setTimestamp(new Date().toISOString())
					.setAuthor(msg.author.tag, msg.author.avatarURL)
					.setFooter(`{lang:commands.utility.disable.list.footer|${page}|${pages.length}|${gConfig.disable.length}|${gConfig.settings.prefix}}`)
					.toJSON()
			});
			break;
		}

		default: {
			return msg.reply(`{lang:commands.utility.disable.invalidFirst|${msg.args[0]}}`);
		}
	}
}));
