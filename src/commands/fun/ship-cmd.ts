import Command from "../../modules/CommandHandler/Command";
import { Request } from "../../util/Functions";
import config from "../../config";
import { Colors } from "../../util/Constants";
import Eris from "eris";
import * as fs from "fs-extra";

export default new Command({
	triggers: [
		"ship"
	],
	permissions: {
		user: [],
		bot: []
	},
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	restrictions: [],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	let member1 = msg.member, member2: Eris.Member, amount = Math.floor(Math.random() * 100) + 1, reset = false;
	if (Object.keys(msg.dashedArgs.parsed.keyValue).includes("percent")) {
		if (!config.developers.includes(msg.author.id)) return msg.reply("this option, `percent` is developer only.");
		amount = Number(msg.dashedArgs.parsed.keyValue.percent);
		msg.args = msg.args.filter(a => a !== `--percent=${amount}`);
	}

	if (msg.dashedArgs.parsed.value.includes("reset")) {
		if (!config.developers.includes(msg.author.id)) return msg.reply("this option, `reset` is developer only.");
		reset = true;

	}

	// const f = `${config.dir.base}/src/config/extra/other/ship.json`;
	// if (!fs.existsSync(f)) fs.writeFileSync(f, JSON.stringify([]));
	const a = []; /*JSON.parse(fs.readFileSync(f).toString()) as {
		user1: string;
		user2: string;
		amount: number;
		name: string;
	}[];*/

	if (msg.args.length === 0) member2 = msg.channel.guild.members.random();
	else if (msg.args.length === 1) member2 = await msg.getMemberFromArgs(0, false);
	else {
		member1 = await msg.getMemberFromArgs(0, null, null, 0);
		member2 = await msg.getMemberFromArgs(1, null, null, 1);
	}

	if (!member1 || !member2) return msg.errorEmbed("INVALID_MEMBER");

	const ship = {
		amount,
		name: member1.username.slice(0, Math.floor(Math.random() * 5) + 3) + member2.username.slice(-(Math.floor(Math.random() * 5) + 3)),
		get image() {
			if (this.amount === 1) return "1-percent";
			else if (this.amount >= 2 && this.amount <= 19) return "2-19-percent";
			else if (this.amount >= 20 && this.amount <= 39) return "20-39-percent";
			else if (this.amount >= 40 && this.amount <= 59) return "40-59-percent";
			else if (this.amount >= 60 && this.amount <= 79) return "60-79-percent";
			else if (this.amount >= 80 && this.amount <= 99) return "80-99-percent";
			else if (this.amount === 100) return "100-percent";
		}
	};

	/*const c = a.find(b => b.user1 === member1.id && b.user2 === member2.id || b.user1 === member2.id && b.user2 === member1.id);

	if (!reset) {
		if (!!c) Object.assign(ship, {
			amount: c.amount,
			name: c.name
		});
		else {
			a.push({
				user1: member1.id,
				user2: member2.id,
				amount: ship.amount,
				name: ship.name
			});
			fs.writeFileSync(f, JSON.stringify(a));
		}
	} else {
		if (!!c) a.splice(a.indexOf(c));
		a.push({
			user1: member1.id,
			user2: member2.id,
			amount: ship.amount,
			name: ship.name
		});
		fs.writeFileSync(f, JSON.stringify(a));
	}*/

	const img = await Request.getImageFromURL(`https://api.furry.bot/V2/ship?avatars[]=${member1.user.avatarURL}&avatars[]=${member2.user.avatarURL}&shipImage=https://assets.furry.bot/ship/${ship.image}.png`);

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
