import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@src/util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";
import { mdb } from "@modules/Database";
import UserConfig from "@src/modules/config/UserConfig";

export default new Command({
	triggers: [
		"marry"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 3e4,
	description: "Propose to someone!",
	usage: "<@user>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	let member: Eris.Member, m: UserConfig, u: Eris.User | string;
	member = await msg.getMemberFromArgs();
	if (!member) return msg.errorEmbed("INVALID_USER");
	m = await mdb.collection("users").findOne({
		id: member.id
	}).then(res => new UserConfig(member.id, res));
	if (!m) {
		await mdb.collection("users").insertOne(Object.assign({
			id: member.id
		}, config.defaults.userConfig));
		m = await mdb.collection("users").findOne({
			id: member.id
		}).then(res => new UserConfig(member.id, res));;
	}

	if ([undefined, null].includes(msg.uConfig.marriage)) await msg.uConfig.edit({
		marriage: {
			married: false,
			partner: null
		}
	}).then(d => d.reload());

	if (msg.uConfig.marriage.married) {
		u = await this.getRESTUser(msg.uConfig.marriage.partner).then(res => `${res.username}#${res.discriminator}`).catch(err => "Unknown#0000");
		return msg.reply(`Hey, hey! You're already married to **${u}**! You can get a divorce though..`);
	}

	if (m.marriage.married) {
		u = await this.getRESTUser(m.marriage.partner).then(res => `${res.username}#${res.discriminator}`) || "Unknown#0000";
		return msg.reply(`Hey, hey! They're already married to **${u}**!`);
	}
	msg.channel.createMessage(`<@!${msg.author.id}> has proposed to <@!${member.id}>!\n<@!${member.id}> do you accept? **yes** or **no**.`).then(async () => {
		const d = await this.MessageCollector.awaitMessage(msg.channel.id, member.id, 6e4);
		if (!d) return msg.reply("Seems like we didn't get a reply..");
		if (!["yes", "no"].includes(d.content.toLowerCase())) return msg.channel.createMessage(`<@!${member.id}>, that wasn't a valid option..`);
		if (d.content.toLowerCase() === "yes") {
			await msg.uConfig.edit({
				marriage: {
					married: true,
					partner: member.id
				}
			}).then(d => d.reload());
			await m.edit({
				marriage: {
					married: true,
					partner: msg.author.id
				}
			}).then(d => d.reload());
			return msg.channel.createMessage(`Congrats <@!${msg.author.id}> and <@!${member.id}>!`);
		} else {
			return msg.reply("Better luck next time!");
		}
	})
}));