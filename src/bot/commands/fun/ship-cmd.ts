import Eris from "eris";
import config from "../../../config";
import Command from "../../../util/cmd/Command";
import { Colors } from "../../../util/Constants";
import EmbedBuilder from "../../../util/EmbedBuilder";
import Request from "../../../util/Functions/Request";
import Utility from "../../../util/Functions/Utility";
import Language from "../../../util/Language";

export default new Command(["ship"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {
		let member1 = msg.member as Eris.Member, member2: Eris.Member, amount = Math.floor(Math.random() * 100) + 1, reset = false;
		if (Object.keys(msg.dashedArgs.keyValue).includes("percent")) {
			if (!config.developers.includes(msg.author.id)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.devOnlyOption`));
			amount = Number(msg.dashedArgs.keyValue.percent);
			msg.args = msg.args.filter(a => a !== `--percent=${amount}`);
		}

		if (msg.dashedArgs.value.includes("reset")) {
			if (!config.developers.includes(msg.author.id)) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.devOnlyOption`));
			reset = true;

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

		const img = await Request.getImageFromURL(`https://api.furry.bot/V2/ship?avatars[]=${member1.user.avatarURL}&avatars[]=${member2.user.avatarURL}&shipImage=https://assets.furry.bot/ship/${ship.image}.png`);


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
