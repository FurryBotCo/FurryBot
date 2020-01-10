import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";
import phin from "phin";
import * as Eris from "eris";
import { db, mdb, mongo } from "../../modules/Database";
import { Colors } from "../../util/Constants";
import { performance } from "perf_hooks";
import * as fs from "fs-extra";
import { execSync } from "child_process";

export default new Command({
	triggers: [
		"reload"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Reload something.",
	usage: "<cmd/cat/event> [rebuild:yes/no]",
	features: ["devOnly"],
	subCommandDir: `${__dirname}/reload-subcmd`,
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	if (msg.args.length === 0) return cmd.sendSubCommandEmbed(msg);
	else return cmd.handleSubCommand(msg, this);
}));
