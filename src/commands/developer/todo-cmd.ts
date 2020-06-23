import Command from "../../modules/CommandHandler/Command";
import config from "../../config";
import phin from "phin";
import uuid from "uuid";
import CommandError from "../../modules/CommandHandler/CommandError";

export default new Command({
	triggers: [
		"todo"
	],
	permissions: {
		user: [],
		bot: []
	},
	cooldown: 0,
	donatorCooldown: 0,
	description: "Manage the todo list.",
	usage: "",
	restrictions: ["helper"],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length < 2) return new CommandError("ERR_INVALID_USAGE", cmd);

	switch (msg.args[0].toLowerCase()) {
		case "add": {
			const p = await phin<any>({
				method: "POST",
				url: "https://api.todoist.com/sync/v8/sync",
				data: {
					token: config.apiKeys.todoist.token,
					commands: [
						{
							type: "item_add",
							temp_id: `item.add.${msg.author.id}`,
							uuid: uuid.v4(),
							args: {
								content: msg.args.slice(1).join(" "),
								project_id: config.apiKeys.todoist.projectId
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
					description: `Item: ${msg.args.slice(1).join(" ")}\n[Link To Item](https://todoist.com/showTask?id=${p.body.temp_id_mapping[`item.add.${msg.author.id}`]})`,
					timestamp: new Date().toISOString(),
					color: Math.floor(Math.random() * 0xFFFFFF)
				}
			});
			break;
		}

		default: {
			return msg.reply("invalud subcommand.");
		}
	}
}));
