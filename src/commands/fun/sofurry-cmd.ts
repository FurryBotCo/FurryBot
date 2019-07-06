import FurryBot from "@FurryBot";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import Command from "@modules/cmd/Command";
import * as Eris from "eris";
import functions from "@util/functions";
import * as util from "util";
import phin from "phin";
import config from "@config";

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
	cooldown: 2e3,
	description: "Get a random post from sofurry!",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	hasSubCommands: functions.hasSubCmds(__dirname, __filename),
	subCommands: functions.subCmds(__dirname, __filename)
}, (async function (this: FurryBot, msg: ExtendedMessage): Promise<any> {
	// saved for when sofurry api has issues
	// return msg.channel.createMessage(`<@!${msg.author.id}>, Sorry, sofurry is having issues right now, and we cannot fetch anything from their api.\n(if it's back, and I haven't noticed, let me know in my support server - https://discord.gg/SuccpZw)`);
	const contentType = [
		"story",
		"art",
		"music",
		"journal",
		"photo"
	];
	let tags, bl, req, jsn, rr, submission, short, extra;
	tags = msg.unparsedArgs.length > 0 ? msg.unparsedArgs.join("%20") : "furry";
	bl = tags.match(config.tagBlacklist);
	if (bl !== null && bl.length > 0) return msg.channel.createMessage(`<@!${msg.author.id}>, Your search contained blacklisted tags, **${bl.join("**, **")}**`);
	const m = await msg.channel.createMessage(`Fetching.. <a:loading:592976588761726977>`);
	req = await phin({
		method: "GET",
		url: `https://api2.sofurry.com/browse/search?search=${tags}&format=json&minlevel=0&maxlevel=0`,
		headers: {
			"User-Agent": config.web.userAgent
		}
	});
	if (req.body.toString().indexOf("block.opendns.com") !== -1) return msg.reply("This command is blocked on the current network the bot is being ran on.");
	try {
		jsn = JSON.parse(req.body.toString());
		rr = Math.floor(Math.random() * jsn.data.entries.length);
		submission = jsn.data.entries[rr];
		if (typeof submission.contentLevel === "undefined") throw new Error("secondary");
		if (submission.contentLevel !== 0) {
			this.logger.log(`unsafe image:\n${util.inspect(submission, { depth: 3, showHidden: true })}`);
			this.logger.log(`Body: ${util.inspect(jsn, { depth: null })}`);
			return msg.edit("Image API returned a non-safe image! Please try again later.").catch(err => msg.channel.createMessage(`Command failed: ${err}`));
		}
		short = await functions.shortenURL(`http://www.sofurry.com/view/${submission.id}`);
		extra = short.new ? `**this is the first time this has been viewed! Image #${short.linkNumber}**\n` : "";
		if ([1, 4].includes(submission.contentType)) return m.edit(`${extra}${submission.title} (type ${functions.ucwords(contentType[submission.contentType])}) by ${submission.artistName}\n<${short.url}${config.beta ? "?beta" : ""}>\nRequested By: ${msg.author.username}#${msg.author.discriminator}\nIf a bad image is returned, blame the service, not the bot author!`).catch(err => msg.channel.createMessage(`Command failed: ${err}`)).then(async () => msg.channel.createMessage("", {
			file: await functions.getImageFromURL(submission.full),
			name: "sofurry.png"
		}));
		else return m.edit(`${extra}${submission.title} (type ${functions.ucwords(contentType[submission.contentType])}) by ${submission.artistName}\n<http://www.sofurry.com/view/${submission.id}>\nRequested By: ${msg.author.username}#${msg.author.discriminator}\nIf something bad is returned, blame the service, not the bot author!`).catch(err => msg.channel.createMessage(`Command failed: ${err}`));
	} catch (e) {
		this.logger.error(`Error:\n${e}`);
		this.logger.log(`Body: ${req.body}`);
		return m.edit("Unknown API Error").then(async () => msg.channel.createMessage("", {
			file: await functions.getImageFromURL(config.images.serverError),
			name: "error.png"
		})).catch(err => msg.channel.createMessage(`Command failed: ${err}`));
	}
	/* eslint-enable no-unreachable */
}));