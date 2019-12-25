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
	userPermissions: [
		"manageMessages"
	],
	botPermissions: [],
	cooldown: 3e3,
	donatorCooldown: 2e3,
	description: "Manages",
	usage: "<tag/create/delete>",
	features: []
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	const tags: { [k: string]: string; } = {};
	Object.keys(msg.gConfig.tags).map(t =>
		tags[t.toLowerCase()] = msg.gConfig.tags[t]
	);
	if (msg.args.length < 1) return msg.reply(`invalid usage. Either provide a tag name to view tags, or \`create\` / \`delete\` to manage tags.`);
	else if (msg.args.length === 1 || !["create", "delete"].includes(msg.args[0].toLowerCase())) {
		if (msg.args[0].toLowerCase() === "create") return msg.reply(`provide a tag name and content. Usage: \`${msg.gConfig.settings.prefix}tag create <name> <content>\``);
		if (msg.args[0].toLowerCase() === "delete") return msg.reply(`provide a tag name to delete. Usage: \`${msg.gConfig.settings.prefix}tag delete <name>\``);
		if (!Object.keys(tags).includes(msg.args[0].toLowerCase())) return msg.reply(`invalid tag.`);

		return msg.channel.createMessage(tags[msg.args[0].toLowerCase()]);
	} else {
		if (!msg.args[1]) return msg.reply("please provide a tag name.");
		switch (msg.args[0].toLowerCase()) {
			case "create":
				if (Object.keys(tags).includes(msg.args[1].toLowerCase())) return msg.reply(`a tag with the name "${msg.args[1].toLowerCase()}" already exists.`);
				const content = msg.args.slice(2).map(c => c.toLowerCase()).join(" ");
				await msg.gConfig.edit({ tags: { [msg.args[2].toLowerCase()]: content } });
				const embed: Eris.EmbedOptions = {
					title: "Tag Created",
					fields: [
						{
							name: "Tag Name",
							value: msg.args[2].toLowerCase(),
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

			case "delete":
				if (!Object.keys(tags).includes(msg.args[1].toLowerCase())) return msg.reply(`a tag with the name "${msg.args[1].toLowerCase()}" does not exist.`);
				await msg.gConfig.edit({ tags: { [msg.args[1].toLowerCase()]: null } });
				return msg.reply(`deleted the tag ${msg.args[1].toLowerCase()}.`);
				break;
		}
	}
}));
