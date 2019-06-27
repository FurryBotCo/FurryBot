import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@src/util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";
import Permissions from "@util/Permissions";

export default new Command({
	triggers: [
		"invite",
		"inv",
		"discord"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks"
	],
	cooldown: 2e3,
	description: "Get some invite links for the bot",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	let p = [
		"kickMembers",
		"banMembers",
		"manageChannels",
		"manageGuild",
		"addReactions",
		"viewAduitLog",
		"voicePrioritySpeaker",
		"readMessages",
		"sendMessages",
		"manageMessages",
		"embedLinks",
		"attachFiles",
		"readMessageHistory",
		"externalEmojis",
		"voiceConnect",
		"voiceSpeak",
		"voiceMuteMembers",
		"voiceDeafenMembers",
		"voiceMoveMembers",
		"voiceuserVAD",
		"changeNickname",
		"manageNicknames",
		"manageRoles"
	];
	let botPerms = p.map(perm => Permissions.constant[perm]).reduce((a, b) => a + b);

	let embed: Eris.EmbedOptions;
	embed = {
		title: "Discord",
		description: `[Join Our Discord Server!](https://furry.bot/inv)\n[Invite Me To Your Server](https://discordapp.com/oauth2/authorize?client_id=${this.user.id}&scope=bot&permissions=${botPerms})`,
		thumbnail: {
			url: "https://cdn.discordapp.com/embed/avatars/0.png"
		}
	};
	Object.assign(embed, msg.embed_defaults());
	msg.channel.createMessage({ embed });
}));