import client from "../../../index";
import FurryBot from "../../main";
import config from "../../config";
import functions from "../../util/functions";
import ExtendedMessage from "../../modules/extended/ExtendedMessage";
import { mdb } from "../../modules/Database";
import * as Eris from "eris";
import UserConfig from "../../modules/config/UserConfig";
import { Command, CommandError } from "../../util/CommandHandler";

type CommandContext = FurryBot & { _cmd: Command };


export default [
	new Command(true, {
		triggers: [
			"check"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 0,
		donatorCooldown: 0,
		description: "Check a users balance.",
		usage: "<id>",
		features: ["devOnly"],
		subCommands: [],
		category: null,
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			if (msg.args.length < 1) return new CommandError(null, "ERR_INVALID_USAGE");

			const u = await msg.getUserFromArgs();

			if (!u) return msg.reply("I couldn't find that user.");

			let d: UserConfig = await mdb.collection("users").findOne({ id: u.id });

			if (!d) {
				await mdb.collection("users").insertOne({ id: u.id, ...config.defaults.userConfig });

				d = await mdb.collection("users").findOne({ id: u.id });
			}

			d = new UserConfig(u.id, d);

			return msg.reply(`the balance of **${u.username}#${u.discriminator}** (${u.id}) is ${d.bal}.`);
		})
	}, client.cmdHandler, client),
	new Command(true, {
		triggers: [
			"give",
			"add",
			"+"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 0,
		donatorCooldown: 0,
		description: "Add to someones economy balance.",
		usage: "<id> <amount>",
		features: ["devOnly"],
		subCommands: [],
		category: null,
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			if (msg.args.length < 2) return new CommandError(null, "ERR_INVALID_USAGE");

			const u = await msg.getUserFromArgs();

			if (!u) return msg.reply("I couldn't find that user.");

			let d: UserConfig = await mdb.collection("users").findOne({ id: u.id });

			if (!d) {
				await mdb.collection("users").insertOne({ id: u.id, ...config.defaults.userConfig });

				d = await mdb.collection("users").findOne({ id: u.id });
			}

			d = new UserConfig(u.id, d);

			const oldBal = d.bal;

			const amount = parseInt(msg.args[1], 10);

			if (isNaN(amount) || amount < 1) return msg.reply("second parameter must be a positive integer.");

			const newBal = d.bal + amount; // "new" cannot be used because it is a reserved keyword

			await d.edit({ bal: newBal }).then(d => d.reload());

			return msg.reply(`gave ${amount} to **${u.username}#${u.discriminator}** (${u.id})\nOld Balance: ${oldBal}\nNew Balance: ${newBal}`);
		})
	}, client.cmdHandler, client),
	new Command(true, {
		triggers: [
			"reset"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 0,
		donatorCooldown: 0,
		description: "Reset a users balance.",
		usage: "<id>",
		features: ["devOnly"],
		subCommands: [],
		category: null,
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			if (msg.args.length < 1) return new CommandError(null, "ERR_INVALID_USAGE");

			const u = await msg.getUserFromArgs();

			if (!u) return msg.reply("I couldn't find that user.");

			let d: UserConfig = await mdb.collection("users").findOne({ id: u.id });

			if (!d) {
				await mdb.collection("users").insertOne({ id: u.id, ...config.defaults.userConfig });

				d = await mdb.collection("users").findOne({ id: u.id });
			}

			d = new UserConfig(u.id, d);

			await d.edit({ bal: config.defaults.userConfig.bal }).then(d => d.reload());

			return msg.reply(`reset the balance of **${u.username}#${u.discriminator}** (${u.id})`);
		})
	}, client.cmdHandler, client),
	new Command(true, {
		triggers: [
			"set"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 0,
		donatorCooldown: 0,
		description: "Set a users economy balance.",
		usage: "<id> <amount>",
		features: ["devOnly"],
		subCommands: [],
		category: null,
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			if (msg.args.length < 1) return new CommandError(null, "ERR_INVALID_USAGE");

			const u = await msg.getUserFromArgs();

			if (!u) return msg.reply("I couldn't find that user.");

			let d: UserConfig = await mdb.collection("users").findOne({ id: u.id });

			if (!d) {
				await mdb.collection("users").insertOne({ id: u.id, ...config.defaults.userConfig });

				d = await mdb.collection("users").findOne({ id: u.id });
			}

			d = new UserConfig(u.id, d);

			const oldBal = d.bal;

			const amount = parseInt(msg.args[1], 10);

			if (isNaN(amount) || amount < 1) return msg.reply("second parameter must be a positive integer.");

			await d.edit({ bal: amount }).then(d => d.reload());

			return msg.reply(`set the balance of **${u.username}#${u.discriminator}** (${u.id}) to ${amount}\nOld Balance: ${oldBal}`);
		})
	}, client.cmdHandler, client),
	new Command(true, {
		triggers: [
			"take",
			"remove",
			"rm",
			"-"
		],
		userPermissions: [],
		botPermissions: [],
		cooldown: 0,
		donatorCooldown: 0,
		description: "Remove from a users economy balance.",
		usage: "<id> <amount>",
		features: ["devOnly"],
		subCommands: [],
		category: null,
		run: (async function (this: FurryBot, msg: ExtendedMessage) {
			if (msg.args.length < 2) return new CommandError(null, "ERR_INVALID_USAGE");

			const u = await msg.getUserFromArgs();

			if (!u) return msg.reply("I couldn't find that user.");

			let d: UserConfig = await mdb.collection("users").findOne({ id: u.id });

			if (!d) {
				await mdb.collection("users").insertOne({ id: u.id, ...config.defaults.userConfig });

				d = await mdb.collection("users").findOne({ id: u.id });
			}

			d = new UserConfig(u.id, d);

			const oldBal = d.bal;

			const amount = parseInt(msg.args[1], 10);

			if (isNaN(amount) || amount < 1) return msg.reply("second parameter must be a positive integer.");

			const newBal = d.bal - amount; // "new" cannot be used because it is a reserved keyword

			await d.edit({ bal: newBal }).then(d => d.reload());

			return msg.reply(`took ${amount} from **${u.username}#${u.discriminator}** (${u.id})\nOld Balance: ${oldBal}\nNew Balance: ${newBal}`);
		})
	}, client.cmdHandler, client)
];