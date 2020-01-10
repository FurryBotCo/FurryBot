import SubCommand from "../../../util/CommandHandler/lib/SubCommand";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../../config";
import { Logger } from "../../../util/LoggerV8";
import { db, mdb } from "../../../modules/Database";
import Eris from "eris";
import phin from "phin";
import short from "short-uuid";
const uuid = short().generate;

export default new SubCommand({
	triggers: [
		"add"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Add an item to the todo list",
	usage: "<item>",
	features: ["devOnly"],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");

	const p = await phin({
		method: "POST",
		url: "https://api.todoist.com/sync/v8/sync",
		data: {
			token: config.apis.todoist.token,
			commands: [
				{
					type: "item_add",
					temp_id: `item.add.${msg.author.id}`,
					uuid: uuid(),
					args: {
						content: msg.args.join(" "),
						project_id: config.apis.todoist.projectId
					}
				}
			]
		},
		parse: "json"
	});

	if (p.statusCode !== 200) {
		Logger.error(`Shard #${msg.channel.guild.shard.id}`, {
			statusCode: p.statusCode,
			statusMessage: p.statusMessage,
			body: p.body
		});
		return msg.reply("request failed, check console.");
	}

	return msg.reply({
		embed: {
			title: "Item Added To To-Do List",
			description: `Item: ${msg.args.join(" ")}\n[Link To Item](https://todoist.com/showTask?id=${p.body.temp_id_mapping[`item.add.${msg.author.id}`]})`,
			timestamp: new Date().toISOString(),
			color: Math.floor(Math.random() * 0xFFFFFF)
		}
	});
}));
