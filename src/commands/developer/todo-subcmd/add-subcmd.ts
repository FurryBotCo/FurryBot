import SubCommand from "../../../util/CommandHandler/lib/SubCommand";
import config from "../../../config";
import { Logger } from "../../../util/LoggerV8";
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
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");

	const p = await phin<any>({
		method: "POST",
		url: "https://api.todoist.com/sync/v8/sync",
		data: {
			token: config.keys.todoist.token,
			commands: [
				{
					type: "item_add",
					temp_id: `item.add.${msg.author.id}`,
					uuid: uuid(),
					args: {
						content: msg.args.join(" "),
						project_id: config.keys.todoist.projectId
					}
				}
			]
		} as any,
		parse: "json"
	});

	if (p.statusCode !== 200) {
		this.log("error", {
			statusCode: p.statusCode,
			statusMessage: p.statusMessage,
			body: p.body
		}, `Shard #${msg.channel.guild.shard.id}`);
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
