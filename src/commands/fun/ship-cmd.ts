import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";
import * as fs from "fs";
import { Canvas } from "canvas-constructor";

export default new Command({
	triggers: [
		"ship"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles",
		"embedLinks"
	],
	cooldown: 5e3,
	description: "Ship some people!",
	usage: "<@user1> [@user2]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	return msg.reply("This command has been temporarily disabled as it is very error prone, and crashes the bot when it errors.");

	/*if (msg.args.length === 0) return new Error("ERR_INVALID_USAGE");
	let user1: Eris.Member | Eris.User, user2: Eris.Member | Eris.User, rand1: number, rand2: number, r1: number, r2: number, shipname: string, t, amount: number, u1: string[], u2: string[], imgpath1: string, imgpath2: string, profile1: Buffer, profile2: Buffer, embed: Eris.EmbedOptions, tt: Eris.Member[];
	if (msg.args[0] === "random") {
		tt = msg.channel.guild.members.filter(u => u.id !== msg.author.id && !u.user.bot);
		user1 = tt[Math.floor(Math.random() * tt.length)];
	} else user1 = await msg.getUserFromArgs(0, false, false, 0);

	// 2
	if (msg.args.length > 1) {
		if (msg.args[1] === "random") {
			if (!user1) { } else {
	tt = msg.channel.guild.members.filter(u => u.id !== user1.id && u.id !== msg.author.id && !u.user.bot);
	user2 = tt[Math.floor(Math.random() * tt.length)];
			}
		} else user2 = await msg.getUserFromArgs(1, false, false, 1);
	}
	if (!user1) return msg.errorEmbed("INVALID_USER");
	if (user1 instanceof Eris.Member) user1 = user1.user;
	if (user2 instanceof Eris.Member) user2 = user2.user;
	if (!user2) user2 = msg.author;

	if (user1.id === user2.id) {
		return msg.channel.createMessage(`<@!${msg.author.id}>, That's a bit self centered...`);
	}

	const builtin = [{
		users: [
			"365255872181567489", // owopup#7756
			"398251412246495233" // Furry Bot#7119
		],
		percent: 100
	}, {
		users: [
			"398251412246495233", // Furry Bot#7119
			"434662676547764244" // Jinjin#1806
		],
		percent: 100
	}, {
		users: [
			"242843345402069002", // Donovan_DMC#3621
			"434662676547764244" // Jinjin#1806
		],
		percent: 100
	}, {
		users: [
			"158750488563679232", // Skullbite#5245
			"242843345402069002" // Donovan_DMC#3621
		],
		percent: 100
	}, {
		users: [

			"242843345402069002", // Donovan_DMC#3621
			"398251412246495233" // Furry Bot#7119
		],
		percent: 100
	}, {
		users: [
			"346702890368368640", // Sheri Blossom#8443
			"398251412246495233" // Furry Bot#7119
		],
		percent: 0
	}];
	try {
		rand1 = Math.floor(Math.random() * 3),
			rand2 = Math.floor(Math.random() * 3);

		if (rand1 < 2) rand1 += 2;
		if (rand2 < 2) rand2 += 2;

		r1 = Math.round(user1.username.length / rand1),
			r2 = Math.round(user2.username.length / rand2);

		shipname = user1.username.substr(0, r1) + user2.username.substr(user2.username.length - r2, r2);
		t = builtin.filter(b => b.users.includes(user1.id)).filter(b => b.users.includes(user2.id));
		amount = t.length > 0 ? t[0].percent : Math.floor(Math.random() * 101);
		const heart = [undefined, null].includes(amount) ? "unknown" : amount <= 1 ? "1" : amount >= 2 && amount <= 19 ? "2-19" : amount >= 20 && amount <= 39 ? "20-39" : amount >= 40 && amount <= 59 ? "40-59" : amount >= 60 && amount <= 79 ? "60-79" : amount >= 80 && amount <= 99 ? "80-99" : amount === 100 ? "100" : "unknown",
			shiptext = [undefined, null].includes(amount) ? "unknown" : amount <= 1 ? "Not Happening.." : amount >= 2 && amount <= 19 ? "Unlikely.." : amount >= 20 && amount <= 39 ? "Maybe?" : amount >= 40 && amount <= 59 ? "Hopeful!" : amount >= 60 && amount <= 79 ? "Good!" : amount >= 80 && amount <= 99 ? "Amazing!" : amount === 100 ? "Epic!" : "unknown",
			heartIcon = await fs.readFileSync(`${config.rootDir}/src/assets/images/ship/ship-${heart}-percent.png`);
		u1 = user1.avatarURL.split(".");
		u1.pop();
		imgpath1 = `${config.rootDir}/src/tmp/${msg.channel.guild.id}-${msg.channel.id}-${msg.author.id}-ship-u1.png`;
		await functions.downloadImage(`${u1.join(".")}.png`, imgpath1);
		profile1 = await fs.readFileSync(imgpath1);
		u2 = user2.avatarURL.split(".");
		u2.pop();
		imgpath2 = `${config.rootDir}/src/tmp/${msg.channel.guild.id}-${msg.channel.id}-${msg.author.id}-ship-u2.png`;
		await functions.downloadImage(`${u2.join(".")}.png`, imgpath2);
		profile2 = await fs.readFileSync(imgpath2);
		const img = new Canvas(384, 128)
			.addImage(profile1, 0, 0, 128, 128)
			.addImage(heartIcon, 128, 0, 128, 128)
			.addImage(profile2, 256, 0, 128, 128);
		const file = await img.toBufferAsync();
		embed = {
			title: ":heart: **Shipping!** :heart:",
			description: `Shipping **${user1.username}#${user1.discriminator}** with **${user2.username}#${user2.discriminator}**\n**${amount}%** - ${shiptext}\nShipname: ${shipname}`,
			image: {
	url: "attachment://ship.png"
			}
		};
		Object.assign(embed, msg.embed_defaults());
		await msg.channel.createMessage({
			embed
		}, {
	file,
	name: "ship.png"
			});
		fs.unlinkSync(imgpath1);
		fs.unlinkSync(imgpath2);
	} catch (e) {
		this.logger.error({
			shipname,
			amount
		});
		throw e;
	}*/
}));