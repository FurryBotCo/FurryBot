import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";
import phin from "phin";
import * as fs from "fs-extra";
import { Colors } from "../../util/Constants";

export default new Command({
	triggers: [
		"dog",
		"doggo",
		"puppy"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 3e3,
	donatorCooldown: 1.5e3,
	description: "Get a picture of a doggo!",
	usage: "",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage) {
	await msg.channel.startTyping();

	interface Breeds {
		breeds: {
			weight: {
				imperial: string;
				metric: string;
			};
			height: {
				imperial: string;
				metric: string;
			};
			id: number;
			name: string;
			bred_for: string;
			breed_group: string;
			life_span: string;
			temperament: string;
			origin: string;
		}[];
		timestamp: number;
	}
	async function refresh(): Promise<Breeds> {
		const timestamp = Date.now();
		Logger.debug(`Shard #${msg.channel.guild.shard.id}`, "Refreshing dog breeds.");
		const b = await phin({
			method: "GET",
			url: "https://api.thedogapi.com/v1/breeds",
			headers: {
				"X-API-Key": config.apis.dog.apiKey,
				"User-Agent": config.web.userAgent
			},
			parse: "json"
		});

		fs.writeFileSync(`${config.tmpDir}/dog-breeds.json`, JSON.stringify({ breeds: b.body, timestamp }));

		return { breeds: b.body, timestamp: Date.now() };
	}

	let b: Breeds;
	if (!fs.existsSync(`${config.tmpDir}/dog-breeds.json`)) b = await refresh();
	else {
		const k: Breeds = JSON.parse(fs.readFileSync(`${config.tmpDir}/dog-breeds.json`).toString());
		if (k.timestamp < (Date.now() + 8.64e+7)) b = await refresh();
		else b = k;
	}

	let breed: Breeds["breeds"][0];
	if (msg.unparsedArgs.length > 0) {
		if (msg.args[0].toLowerCase() === "breeds") {
			const pages: string[][] = [];
			let i = 0;
			b.breeds.map(br => {
				const j = `\`${br.name}\``;
				if (!pages[i]) pages[i] = [];

				if (pages[i].reduce((a, b) => a + b, "").length + j.length < 800) pages[i].push(j);
				else pages[++i] = [j];
			});
			return msg.channel.createMessage({
				embed: {
					title: "Valid Dog Breeds",
					fields: pages.map((p, i) => ({
						name: `Breeds List #${i + 1}`,
						value: `\`${p.join("`, `")}\``,
						inline: false
					})),
					color: Colors.gold,
					timestamp: new Date().toISOString()
				}
			});
		} else {
			const s = msg.unparsedArgs.join(" ");

			breed = b.breeds.find(br => br.name.toLowerCase() === s.toLowerCase());

			if (!breed) return msg.reply(`**${s}** is not a valid breed. You can use\`${msg.gConfig.settings.prefix}dog breeds\` to list breeds, or provide none to get a random breed.`);
		}
	} else breed = b.breeds[Math.floor(Math.random() * b.breeds.length)];
	const img = await phin({
		method: "GET",
		url: `https://api.thedogapi.com/v1/images/search?breed_id=${breed.id}`,
		headers: {
			"X-API-Key": config.apis.dog.apiKey,
			"User-Agent": config.web.userAgent
		},
		parse: "json"
	}).then(res => res.body[0]);

	return msg.channel.createMessage({
		embed: {
			title: breed.name,
			description: [
				`Bred For: ${breed.bred_for || "Unknown"}`,
				`Breed Group: ${breed.breed_group || "Unknown"}`,
				`Life Span: ${breed.life_span || "Unknown"}`,
				`Temperament: ${breed.temperament || "Unknown"}`,
				`Origin: ${breed.origin || "Unknown"}`
			].join("\n"),
			color: Colors.green,
			image: {
				url: img.url
			},
			timestamp: new Date().toISOString()
		}
	});
}));
