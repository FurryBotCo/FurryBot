import Command from "../../modules/CommandHandler/Command";
import EmbedBuilder from "../../util/EmbedBuilder";
import { Colors } from "../../util/Constants";
import Eris from "eris";

export default new Command({
	triggers: [
		"tag"
	],
	permissions: {
		user: [],
		bot: []
	},
	cooldown: 3e3,
	donatorCooldown: 3e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const tags: {
		[k: string]: string
	} = {};
	await Promise.all(gConfig.tags.map(async (t, i) => {
		if (!gConfig.tags[i] || !gConfig.tags[i].content) await gConfig.mongoEdit({ $pull: { tags: t } });
		else tags[t.name.toLowerCase()] = t.content;
	}));
	const values = Object.values(tags);
	if (msg.args.length < 1) return msg.reply(`{lang:commands.utility.tag.invalidUsage}`);

	if (["create", "delete", "edit"].includes(msg.args[0].toLowerCase()) && !msg.channel.permissionsOf(this.bot.user.id).has("sendMessages")) return msg.reply("{lang:commands.utility.tag.missingPerms}");

	if (msg.args[0].toLowerCase() === "list") {
		const pages: string[][] = [];
		let i = 0;
		for (const tag of Object.keys(tags)) {
			const name = Object.keys(tags)[values.indexOf(tag)];
			if (!pages[i]) pages[i] = [];
			const len = pages[i].reduce((a, b) => a + b.length, 0);
			if (len + tag.length >= 1000) (i++, pages[i] = []);
			pages[i].push(tag);
		}
		if (pages.length === 0) return msg.reply("{lang:commands.utility.tag.noTags}");
		const page = msg.args.length >= 2 ? Number(msg.args[1]) : 1;
		if (page < 0) return msg.reply("{lang:commands.utility.tag.pageLess}");
		if (page > pages.length) return msg.reply(`{lang:commands.utility.tag.invalidPage|${pages.length}}`);

		return msg.channel.createMessage({
			embed: new EmbedBuilder(gConfig.settings.lang)
				.setTitle(`{lang:commands.utility.tag.page|${page}|${pages.length}}`)
				.setDescription(`\`${pages[page - 1].join("` `")}\`${pages.length > page ? `\n\n{lang:commands.utility.tag.next|${gConfig.settings.prefix}|${page + 1}}` : ""}`)
				.setFooter(`{lang:commands.utility.tag.use|${gConfig.settings.prefix}}`)
				.setColor(Math.floor(Math.random() * 0xFFFFFF))
				.setTimestamp(new Date().toISOString())
				.toJSON()

		});
	}
	if (msg.args.length === 1 || !["create", "delete", "edit"].includes(msg.args[0].toLowerCase())) {
		if (msg.args[0].toLowerCase() === "create") return msg.reply(`{lang:commands.utility.tag.createUsage|${gConfig.settings.prefix}}`);
		if (msg.args[0].toLowerCase() === "delete") return msg.reply(`{lang:commands.utility.tag.deleteusage|${gConfig.settings.prefix}}`);
		if (msg.args[0].toLowerCase() === "edit") return msg.reply(`{lang:commands.utility.tag.editUsage|${gConfig.settings.prefix}}`);
		if (!Object.keys(tags).includes(msg.args[0].toLowerCase())) return msg.reply(`{lang:commands.utility.tag.invalid}.`);

		return msg.channel.createMessage(tags[msg.args[0].toLowerCase()]);
	} else {
		if (!msg.args[1]) return msg.reply("{lang:commands.utility.tag.needName}");
		switch (msg.args[0].toLowerCase()) {
			case "create": {
				if (Object.keys(tags).includes(msg.args[1].toLowerCase())) return msg.reply(`{lang:commands.utility.tag.alreadyExists|${msg.args[1].toLowerCase()}}`);
				const content = msg.args.slice(2).join(" ");
				if (!content || content.length === 0) return msg.reply("{lang:commands.utility.tag.needContent}");
				await gConfig.mongoEdit({
					$push: {
						tags: {
							creationBlame: msg.author.id,
							creationDate: Date.now(),
							name: msg.args[1].toLowerCase(),
							content
						}
					}
				});

				return msg.channel.createMessage({
					embed: new EmbedBuilder(gConfig.settings.lang)
						.setTitle("{lang:commands.utility.tag.created}")
						.addField("{lang:commands.utility.tag.name}", msg.args[1].toLowerCase(), false)
						.addField("{lang:commands.utility.tag.content}", content, false)
						.setColor(Math.floor(Math.random() * 0xFFFFFF))
						.setTimestamp(new Date().toISOString())
						.toJSON()
				});
				break;
			}

			case "edit": {
				if (!gConfig.tags.map(t => t.name.toLowerCase()).includes(msg.args[1].toLowerCase())) return msg.reply(`{lang:commands.utility.tag.doesNotExist|${msg.args[1].toLowerCase()}}`);
				const c = gConfig.tags.find(t => t.name.toLowerCase() === msg.args[1].toLowerCase());
				const content = msg.args.slice(2).join(" ");
				if (!content || content.length === 0) return msg.reply("{lang:commands.utility.needContent}");
				await gConfig.mongoEdit({
					$pull: c,
					$push: {
						tags: {
							creationBlame: msg.author.id,
							creationDate: Date.now(),
							name: msg.args[1].toLowerCase(),
							content
						}
					}
				});

				return msg.channel.createMessage({
					embed: new EmbedBuilder(gConfig.settings.lang)
						.setTitle("{lang:commands.utility.tag.edited}")
						.addField("{lang:commands.utility.tag.name}", msg.args[1].toLowerCase(), false)
						.addField("{lang:commands.utility.tag.oldContent}", c.content, false)
						.addField("{lang:commands.utility.tag.newContent}", content, false)
						.setColor(Math.floor(Math.random() * 0xFFFFFF))
						.setTimestamp(new Date().toISOString())
						.toJSON()
				});
				break;
			}

			case "delete": {
				if (gConfig.tags.map(t => t.name.toLowerCase()).includes(msg.args[1].toLowerCase())) return msg.reply(`{lang:commands.utility.doesNotExist|${msg.args[1].toLowerCase()}}`);
				await gConfig.mongoEdit({
					$pull: {
						tags: gConfig.tags.find(t => t.name.toLowerCase() === msg.args[1].toLowerCase())
					}
				});
				return msg.reply(`{lang:commands.utility.tag.deleted|${msg.args[1].toLowerCase()}}`);
				break;
			}
		}
	}
}));
