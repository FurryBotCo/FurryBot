import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";
import phin from "phin";
import * as Eris from "eris";
import { db, mdb, mongo } from "../../modules/Database";

export default new Command({
	triggers: [
		"tag"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 3e3,
	donatorCooldown: 2e3,
	description: "Manages",
	usage: "<tag/create/delete/edit/list>",
	features: []
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	const tags: { [k: string]: string; } = {};
	Object.keys(msg.gConfig.tags).map(t =>
		tags[t.toLowerCase()] = msg.gConfig.tags[t]
	);
	const values = Object.values(tags);
	if (msg.args.length < 1) return msg.reply(`invalid usage. Either provide a tag name to view tags, or \`create\` / \`delete\` to manage tags.`);

	if (["create", "delete", "edit"].includes(msg.args[0].toLowerCase()) && !msg.channel.permissionsOf(this.user.id).has("sendMessages")) return msg.reply("you must have the `sendMessages` permission to use the **create**/**delete**/**edit** functionalities.");

	if (msg.args[0].toLowerCase() === "list") {
		const pages: string[][] = [];
		let i = 0;
		for (const tag of Object.keys(tags)) {
			const name = Object.keys(tags)[values.indexOf(tag)];
			if (!pages[i]) pages[i] = [];
			const len = pages[i].reduce((a, b) => a + b.length, 0);
			if (len + tag.length >= 1000) (i++ , pages[i] = []);
			pages[i].push(tag);
		}
		if (pages.length === 0) return msg.reply("no tags were found.");
		const page = msg.args.length >= 2 ? Number(msg.args[1]) : 1;
		if (page < 0) return msg.reply("please provide a page number that is greater than zero.");
		if (page > pages.length) return msg.reply(`invalid page number, max page number: **${pages.length}**.`);

		return msg.reply({
			embed: {
				title: `Page ${page}/${pages.length}`,
				description: `\`${pages[page - 1].join("` `")}\`${pages.length > page ? `\n\nUse \`${msg.gConfig.settings.prefix}tag list ${page + 1}\` to view the next page.` : ""}`,
				footer: {
					text: `To use a tag, run ${msg.gConfig.settings.prefix}tag <name>`
				},
				color: Math.floor(Math.random() * 0xFFFFFF),
				timestamp: new Date().toISOString()
			}
		});
	}
	if (msg.args.length === 1 || !["create", "delete", "edit"].includes(msg.args[0].toLowerCase())) {
		if (msg.args[0].toLowerCase() === "create") return msg.reply(`provide a tag name and content. Usage: \`${msg.gConfig.settings.prefix}tag create <name> <content>\``);
		if (msg.args[0].toLowerCase() === "delete") return msg.reply(`provide a tag name to delete. Usage: \`${msg.gConfig.settings.prefix}tag delete <name>\``);
		if (msg.args[0].toLowerCase() === "edit") return msg.reply(`provide a tag name to edit. Usage: \`${msg.gConfig.settings.prefix}tag edit <name> <content>\``);
		if (!Object.keys(tags).includes(msg.args[0].toLowerCase())) return msg.reply(`invalid tag.`);

		return msg.channel.createMessage(tags[msg.args[0].toLowerCase()]);
	} else {
		let content: string, embed: Eris.EmbedOptions;
		if (!msg.args[1]) return msg.reply("please provide a tag name.");
		switch (msg.args[0].toLowerCase()) {
			case "create":
				if (Object.keys(tags).includes(msg.args[1].toLowerCase())) return msg.reply(`a tag with the name "${msg.args[1].toLowerCase()}" already exists.`);
				content = msg.args.slice(2).join(" ");
				await msg.gConfig.edit({ tags: { [msg.args[1].toLowerCase()]: content } });
				embed = {
					title: "Tag Created",
					fields: [
						{
							name: "Tag Name",
							value: msg.args[1].toLowerCase(),
							inline: false
						},
						{
							name: "Tag Content",
							value: content,
							inline: false
						}
					],
					color: Math.floor(Math.random() * 0xFFFFFF),
					timestamp: new Date().toISOString()
				};

				return msg.channel.createMessage({ embed });
				break;

			case "edit":
				if (!Object.keys(tags).includes(msg.args[1].toLowerCase())) return msg.reply(`a tag with the name "${msg.args[1].toLowerCase()}" does not exist.`);
				const c = tags[msg.args[1].toLowerCase()];
				content = msg.args.slice(2).join(" ");
				await msg.gConfig.edit({ tags: { [msg.args[1].toLowerCase()]: content } });
				embed = {
					title: "Tag Edited",
					fields: [
						{
							name: "Tag Name",
							value: msg.args[1].toLowerCase(),
							inline: false
						},
						{
							name: "Old Content",
							value: c,
							inline: false
						},
						{
							name: "New Content",
							value: content,
							inline: false
						}
					],
					color: Math.floor(Math.random() * 0xFFFFFF),
					timestamp: new Date().toISOString()
				};

				return msg.channel.createMessage({ embed });
				break;

			case "delete":
				if (!Object.keys(tags).includes(msg.args[1].toLowerCase())) return msg.reply(`a tag with the name "${msg.args[1].toLowerCase()}" does not exist.`);
				await msg.gConfig.edit({ tags: { [msg.args[1].toLowerCase()]: null } });
				return msg.reply(`deleted the tag **${msg.args[1].toLowerCase()}**.`);
				break;
		}
	}
}));
