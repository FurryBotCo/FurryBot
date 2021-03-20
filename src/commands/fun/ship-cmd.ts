import Eris from "eris";
import config from "../../config";
import Command from "../../util/cmd/Command";
import { Colors } from "../../util/Constants";
import EmbedBuilder from "../../util/EmbedBuilder";
import Request from "../../util/Functions/Request";
import Utility from "../../util/Functions/Utility";
import Language from "../../util/Language";
import Logger from "../../util/Logger";
import FluxPoint from "../../util/req/FluxPoint";

export default new Command(["ship"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(true)
	.setExecutor(async function (msg, cmd) {
		let member1 = msg.member, member2: Eris.Member, amount = Math.floor(Math.random() * 100) + 1;
		if (Object.keys(msg.dashedArgs.keyValue).includes("percent")) {
			if (!config.developers.includes(msg.author.id)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.devOnlyOption`, ["percent"]));
			amount = Number(msg.dashedArgs.keyValue.percent);
		}

		if (msg.args.length === 0) member2 = msg.channel.guild.members.random();
		else if (msg.args.length === 1) member2 = await msg.getMemberFromArgs(0, true, 0);
		else {
			member1 = await msg.getMemberFromArgs(0, true, 0);
			member2 = await msg.getMemberFromArgs(1, true, 1);
		}

		if (!member1 || !member2) return msg.channel.createMessage({
			embed: Utility.genErrorEmbed(msg.gConfig.settings.lang, "INVALID_MEMBER", true)
		});

		if (!Object.keys(msg.dashedArgs.keyValue).includes("random")) amount = Number((BigInt(member1.id) + BigInt(member2.id)) % 100n);

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

		const color1 = Utility.getColorRole(member1)?.color || null;
		const color2 = Utility.getColorRole(member2)?.color || null;

		const img = await FluxPoint.customGen({
			base: {
				type: "bitmap",
				x: 0,
				y: 0,
				width: 768,
				height: 256,
				color: "0, 0, 0, 0"
			},
			images: [
				{
					type: "url",
					url: member1.user.avatarURL,
					x: 0,
					y: 0,
					round: 0,
					width: 256,
					height: 256
				},
				{
					type: "bitmap",
					x: 256,
					y: 0,
					width: 256,
					height: 256,
					color: color1?.toString(16)?.padStart(6, "0") || "FFFFFF"
				},
				{
					type: "triangle",
					x: 256,
					y: 0,
					width: 128,
					height: 256,
					color: color2?.toString(16)?.padStart(6, "0") || "FFFFFF",
					cut: ship.amount > 50 ? "topright" : "topleft"
				},
				{
					type: "triangle",
					x: 384,
					y: 0,
					width: 128,
					height: 256,
					color: color2?.toString(16)?.padStart(6, "0") || "FFFFFF",
					cut: ship.amount > 50 ? "topleft" : "topright"
				},
				{
					type: "url",
					url: `https://assets.furry.bot/ship/${ship.image}.png`,
					x: 256,
					y: 0,
					round: 0,
					width: 256,
					height: 256
				},
				{
					type: "url",
					url: member2.user.avatarURL,
					x: 512,
					y: 0,
					round: 0,
					width: 256,
					height: 256
				}
			],
			texts: [],
			output: "jpg"
		});

		if (!(img instanceof Buffer)) {
			Logger.error("FluxPoint Gen", img);
			throw new TypeError("Unknown Error");
		}

		return msg.channel.createMessage({
			embed: new EmbedBuilder(msg.gConfig.settings.lang)
				.setTitle(`{lang:${cmd.lang}.title}`)
				.setDescription(`{lang:${cmd.lang}.text|${member1.id}|${member2.id}|${ship.amount}|${ship.name}}`)
				.setColor(Colors.gold)
				.setTimestamp(new Date().toISOString())
				.setFooter(config.emojis.default.heart, this.bot.user.avatarURL)
				.setImage("attachment://ship.png")
				.toJSON()
		}, {
			name: "ship.png",
			file: img
		});
	});
