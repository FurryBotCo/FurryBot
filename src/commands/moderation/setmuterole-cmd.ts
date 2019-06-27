import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@src/util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";
import Permissions from "@src/util/Permissions";

export default new Command({
	triggers: [
		"setmuterole"
	],
	userPermissions: [
		"manageGuild"
	],
	botPermissions: [
		"manageChannels"
	],
	cooldown: 2.5e3,
	description: "Set the role used to mute people",
	usage: "<@role/role id/role name>",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	if (msg.args.length < 1) return new Error("ERR_INVALID_USAGE");

	let role, embed, g, a;
	if (msg.args[0] === "reset") {
		msg.channel.guild.channels.forEach(async (ch) => {
			if (![null, undefined, ""].includes(msg.gConfig.muteRole) && ch.permissionOverwrites.has(msg.gConfig.muteRole)) {
				await ch.deletePermission(msg.gConfig.muteRole).catch(err => null);
			}
		});

		await msg.gConfig.edit({ muteRole: null }).then(d => d.reload());
		return msg.channel.createMessage("Reset channel overwrites and mute role.");
	}
	// get role from message
	role = await msg.getRoleFromArgs();

	if (!role) return msg.errorEmbed("INVALID_ROLE");

	a = functions.compareMemberWithRole(msg.channel.guild.members.get(this.user.id), role);
	if (role.managed || role.rawPosition === 0 || a.higher || a.same) {
		embed = {
			title: "Invalid Role",
			description: `this role (<@&${role.id}>) cannot be used as the muted role, check that is not any of these:\n\t- The guilds \`everyone\` role\n\t- A bots role (generated when a bot is invited)\n\t- Higher than me`,
			color: 15601937
		};
		Object.assign(embed, msg.embed_defaults("color"));
		return msg.channel.createMessage({ embed });
	}
	g = await msg.gConfig.edit({ muteRole: role.id }).then(d => d.reload());
	if (!g) {
		msg.channel.createMessage("There was an internal error while doing this, please try again");
		return this.logger.log(g);
	}
	await msg.channel.createMessage(`Set the new muted role to **${role.name}**`);

	msg.channel.guild.channels.forEach(async (ch) => {
		await ch.editPermission(msg.gConfig.muteRole, null, 2048, "role").catch(err => null);
	});
}));