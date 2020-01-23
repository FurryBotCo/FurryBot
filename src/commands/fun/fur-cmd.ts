import Command from "../../util/CommandHandler/lib/Command";
import FurryBot from "@FurryBot";
import ExtendedMessage from "@ExtendedMessage";
import { Request, Utility, Strings } from "../../util/Functions";

export default new Command({
	triggers: [
		"fur"
	],
	userPermissions: [],
	botPermissions: [
		"attachFiles"
	],
	cooldown: 2e3,
	donatorCooldown: 1e3,
	description: "Get a random fur image! Use **fur list** to get a list of valid types.",
	usage: "[type/list]",
	features: [],
	file: __filename
}, (async function (this: FurryBot, msg: ExtendedMessage, cmd: Command) {
	// await msg.channel.startTyping();
	const types = [
		"boop",
		"cuddle",
		"fursuit",
		"hold",
		"hug",
		"kiss",
		"lick",
		"propose"
	];
	let ln, type, req, short, extra;
	if (msg.args.length < 1) {
		ln = Math.floor(Math.random() * (types.length));
		// 0 (1) - 25: Inkbunny
		type = types[Math.floor(ln / 25)];
	} else {
		type = msg.args[0].toLowerCase();
		if (type === "list") return msg.channel.createMessage(`<@!${msg.author.id}>, Valid Values:\n**${types.join("**\n**")}**.`);
	}
	if (!type) type = "hug";
	req = await Request.imageAPIRequest(false, type, true, true);
	short = await Utility.shortenURL(req.response.image);
	extra = short.new ? `**this is the first time this has been viewed! Image #${short.linkNumber}**\n` : "";
	return msg.channel.createMessage(`${extra}Short URL: <${short.link}>\nRequested By: ${msg.author.username}#${msg.author.discriminator}\nType: ${Strings.ucwords(type)}`, {
		file: await Request.getImageFromURL(req.response.image),
		name: req.response.name
	});
}));
