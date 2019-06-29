import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";
import { mdb } from "@modules/Database";
import UserConfig from "@src/modules/config/UserConfig";

export default new Command({
	triggers: [
		"divorce"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 3e4,
	description: "Revoke your marriage..",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	let member: Eris.Member, m: UserConfig, u: Eris.User | {
		username: string;
		discriminator: string;
	};
	m = await mdb.collection("users").findOne({
		id: msg.uConfig.marriage.partner
	}).then(res => new UserConfig(msg.uConfig.marriage.partner, res));
	if (!m) {
		await mdb.collection("users").insertOne(Object.assign({
			id: msg.uConfig.marriage.partner
		}, config.defaults.userConfig));
		m = await mdb.collection("users").findOne({
			id: msg.uConfig.marriage.partner
		}).then(res => new UserConfig(msg.uConfig.marriage.partner, res));;
	}

	if ([undefined, null].includes(msg.uConfig.marriage)) await msg.uConfig.edit({
		marriage: {
			married: false,
			partner: null
		}
	}).then(d => d.reload());

	if (!msg.uConfig.marriage.married) return msg.reply("You have to marry someone before you can divorce them..");
	u = await this.getRESTUser(msg.uConfig.marriage.partner).catch(err => ({ username: "Unknown", discriminator: "0000" }));
	msg.channel.createMessage(`Are you sure you want to divorce **${u.username}#${u.discriminator}**? **yes** or **no**.`).then(async () => {
		const d = await this.MessageCollector.awaitMessage(msg.channel.id, msg.author.id, 6e4);
		if (!d || !["yes", "no"].includes(d.content.toLowerCase())) return msg.reply("that wasn't a valid option..");
		if (d.content.toLowerCase() === "yes") {
			await msg.uConfig.edit({
				marriage: {
					married: false,
					partner: null
				}
			}).then(d => d.reload());
			await m.edit({
				marriage: {
					married: false,
					partner: null
				}
			}).then(d => d.reload());
			return msg.channel.createMessage(`You've divorced **${u.username}#${u.discriminator}**...`);
		} else {
			return msg.reply(`You've stayed with **${u}**!`);
		}
	})
}));