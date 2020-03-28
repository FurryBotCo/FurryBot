import Command from "../../util/CommandHandler/lib/Command";
import { Colors } from "../../util/Constants";
import { Request } from "../../util/Functions";
import * as fs from "fs-extra";
import { Canvas } from "canvas-constructor";
import Eris from "eris";
import config from "../../config";

export default new Command({
	triggers: [
		"ship"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 5e3,
	donatorCooldown: 2.5e3,
	features: [],
	file: __filename
}, (async function (this, msg, uConfig, gConfig) {
	let member1 = msg.member, member2: Eris.Member, amount = Math.floor(Math.random() * 100) + 1;
	if (Object.keys(msg.dashedArgs.parsed.keyValue).includes("percent")) {
		if (!config.developers.includes(msg.author.id)) return msg.reply("this option, `percent` is developer only.");
		amount = Number(msg.dashedArgs.parsed.keyValue.percent);
		msg.args = msg.args.filter(a => a !== `--percent=${amount}`);
	}


	if (msg.args.length === 0) member2 = msg.channel.guild.members.random();
	else if (msg.args.length === 1) member2 = await msg.getMemberFromArgs(0, false);
	else {
		// I know it's backwards but it's a minor thing that only shows up here
		// and I don't want to touch the mostrosity that is get<X>FromArgs
		member1 = await msg.getMemberFromArgs(null, null, null, 1);
		member2 = await msg.getMemberFromArgs(null, null, null, 0);
	}

	if (!member1 || !member2) return msg.errorEmbed("INVALID_MEMBER");

	const ship = {
		amount,
		name: member1.username.slice(0, Math.floor(Math.random() * 5) + 3) + member2.username.slice(-(Math.floor(Math.random() * 5) + 3)),
		get image(this: typeof ship) {
			if (this.amount === 1) return "ship-1-percent";
			else if (this.amount >= 2 && this.amount <= 19) return "ship-2-19-percent";
			else if (this.amount >= 20 && this.amount <= 39) return "ship-20-39-percent";
			else if (this.amount >= 40 && this.amount <= 59) return "ship-40-59-percent";
			else if (this.amount >= 60 && this.amount <= 79) return "ship-60-79-percent";
			else if (this.amount >= 80 && this.amount <= 99) return "ship-80-99-percent";
			else if (this.amount === 100) return "ship-100-percent";
		}
	};

	const sh = fs.readFileSync(`${config.dir.base}/src/assets/images/ship/${ship.image}.png`);
	const av1 = await Request.getImageFromURL(member1.user.avatarURL);
	const av2 = await Request.getImageFromURL(member2.user.avatarURL);

	const img = new
		Canvas(768, 256)
		.addImage(av1, 0, 0, 256, 256)
		.addImage(sh, 256, 0, 256, 256)
		.addImage(av2, 512, 0, 256, 256)
		.toBuffer();

	return msg.channel.createMessage({
		embed: {
			title: "Shipping Users",
			description: `Shipping <@!${member1.id}> and <@!${member2.id}>\n**${ship.amount}%** - ${ship.name}`,
			color: Colors.gold,
			timestamp: new Date().toISOString(),
			image: {
				url: "attachment://ship.png"
			}
		}
	}, {
		name: "ship.png",
		file: img
	});
}));
