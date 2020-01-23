import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import config from "../../config";
import { Logger } from "../../util/LoggerV8";
import phin from "phin";
import util from "util";
import { Utility, Request, Strings } from "../../util/Functions";

export default new Command({
	triggers: [
		"sofurry",
		"sf"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles",
		"embedLinks"
	],
	cooldown: 3e3,
	donatorCooldown: 3e3,
	description: "Get a random post from sofurry!",
	usage: "",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	// await msg.channel.startTyping();
	// saved for when sofurry api has issues
	// return msg.channel.createMessage(`<@!${msg.author.id}>, Sorry, sofurry is having issues right now, and we cannot fetch anything from their api.\n(if it's back, and I haven't noticed, let me know in my support server - https://discord.gg/SuccpZw)`);
	const contentType = [
		"story",
		"art",
		"music",
		"journal",
		"photo"
	];
	const tags = msg.unparsedArgs.length > 0 ? msg.unparsedArgs.join("%20") : "furry";
	const bl = tags.match(new RegExp(`(${config.tagBlacklist.join("|")})`, "i"));
	if (bl !== null && bl.length > 0) return msg.channel.createMessage(`<@!${msg.author.id}>, Your search contained blacklisted tags, **${bl.join("**, **")}**`);
	const m = await msg.channel.createMessage(`Fetching.. <a:loading:592976588761726977>`);
	const req = await phin({
		method: "GET",
		url: `https://api2.sofurry.com/browse/search?search=${tags}&format=json&minlevel=0&maxlevel=0`,
		headers: {
			"User-Agent": config.web.userAgent
		},
		timeout: 5e3
	});
	if (req.body.toString().indexOf("block.opendns.com") !== -1) return msg.reply("This command is blocked on the current network the bot is being ran on.");
	try {
		const jsn = JSON.parse(req.body.toString());
		const rr = Math.floor(Math.random() * jsn.data.entries.length);
		const submission = jsn.data.entries[rr];
		if (typeof submission.contentLevel === "undefined") throw new Error("secondary");
		if (submission.contentLevel !== 0) {
			Logger.log(`unsafe image:\n${util.inspect(submission, { depth: 3, showHidden: true })}`, msg.guild.shard.id);
			Logger.log(`Body: ${util.inspect(jsn, { depth: null })}`, msg.guild.shard.id);
			return msg.edit("Image API returned a non-safe image! Please try again later.").catch(err => msg.channel.createMessage(`Command failed: ${err}`));
		}
		const short = await Utility.shortenURL(`http://www.sofurry.com/view/${submission.id}`);
		const extra = short.new ? `**this is the first time this has been viewed! Image #${short.linkNumber}**\n` : "";
		if ([1, 4].includes(submission.contentType)) return m.edit(`${extra}${submission.title} (type ${Strings.ucwords(contentType[submission.contentType])}) by ${submission.artistName}\n<${short.url}>\nRequested By: ${msg.author.username}#${msg.author.discriminator}\nIf a bad image is returned, blame the service, not the bot author!`).catch(err => msg.channel.createMessage(`Command failed: ${err}`)).then(async () => msg.channel.createMessage("", {
			file: await Request.getImageFromURL(submission.full),
			name: "sofurry.png"
		}));
		else return m.edit(`${extra}${submission.title} (type ${Strings.ucwords(contentType[submission.contentType])}) by ${submission.artistName}\n<http://www.sofurry.com/view/${submission.id}>\nRequested By: ${msg.author.username}#${msg.author.discriminator}\nIf something bad is returned, blame the service, not the bot author!`).catch(err => msg.channel.createMessage(`Command failed: ${err}`));
	} catch (e) {
		Logger.error(`Error:\n${e}`, msg.guild.shard.id);
		Logger.log(`Body: ${req.body}`, msg.guild.shard.id);
		return m.edit("Unknown API Error").then(async () => msg.channel.createMessage("", {
			file: await Request.getImageFromURL(config.images.serverError),
			name: "error.png"
		})).catch(err => msg.channel.createMessage(`Command failed: ${err}`));
	}
	/* eslint-enable no-unreachable */
}));
