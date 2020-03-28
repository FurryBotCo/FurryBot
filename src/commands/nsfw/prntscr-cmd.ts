import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import phin from "phin";
import cheerio from "cheerio";
import { Colors } from "../../util/Constants";
import { Strings } from "../../util/Functions";

export default new Command({
	triggers: [
		"prntscr",
		"printscreen",
		"pr"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	features: ["nsfw"],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	const alphabet = "abcdefghijklmnopqrstuvwxyz";
	const num = "0123456789";
	let tries = 0;

	const h = (async () => {
		const getImage = async (): Promise<{ img: string; n: string; char: string; }> => {
			const t = Math.random() > .5;
			let n: string, char: string, link: string;

			if (t) {
				n = Strings.random(2, num);
				char = Strings.random(4, alphabet);

				link = `https://prnt.sc/${n}${char}`;
			} else {
				n = Strings.random(3, num);
				char = Strings.random(3, alphabet);

				link = `https://prnt.sc/${n}${char}`;
			}

			const p = await phin({
				method: "GET",
				url: link,
				headers: {
					"User-Agent": config.web.userAgent
				}
			}).catch(err => null);

			const img = cheerio.load(p.body.toString())(".no-click.screenshot-image").attr("src");

			const k = await phin({ method: "GET", url: img, parse: "none" }).catch(err => null);
			if (!img || img.startsWith("//st") || !k || k.statusCode !== 200) {
				tries++;
				if (tries >= 5) return null;
				return getImage();
			} else return {
				img,
				n,
				char
			};
		};

		const i = await getImage();

		if (!i) return msg.reply("failed to fetch an image after 5 tries.");

		return msg.channel.createMessage({
			embed: {
				image: {
					url: i.img
				},
				color: Colors.gold,
				title: `${i.n}${i.char}`,
				url: `https://prnt.sc/${i.n}${i.char}`,
				footer: {
					text: `random image from prnt.sc (images are not filtered)`
				}
			}
		}).catch(h);
	});

	return h();
}));
