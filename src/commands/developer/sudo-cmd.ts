import Command from "../../modules/CommandHandler/Command";
import phin from "phin";
import { Colors } from "../../util/Constants";
import Eris from "eris";
import db from "../../modules/Database";
import ExtendedMessage from "../../modules/ExtendedMessage";
import { RestrictionError } from "../../config/extra/other/commandRestrictions";
import config from "../../config";

export default new Command({
	triggers: [
		"sudo"
	],
	permissions: {
		user: [],
		bot: [
			"embedLinks"
		]
	},
	cooldown: 0,
	donatorCooldown: 0,
	restrictions: [
		"contributor"
	],
	file: __filename
}, (async function (msg, uConfig, gConfig, cmd) {
	if (msg.args.length < 2) return new Error("ERR_INVALID_USAGE");
	const bypass = msg.dashedArgs.unparsed.value.includes("bypass");
	const user = await msg.getUserFromArgs();
	if (!user) return msg.errorEmbed("INVALID_USER");
	const u = await db.getUser(user.id);
	const t = msg.args[1].toLowerCase();
	const c = this.cmd.getCommand(t);
	if (!c) return msg.reply("invalid command.");
	const a = msg.args.slice(2);
	const m = new ExtendedMessage<Eris.GuildTextableChannel>(
		new Eris.Message({
			id: null,
			type: 0,
			timestamp: Date.now(),
			channel_id: msg.channel.id,
			guild_id: msg.channel.guild.id,
			flags: 0,
			author: user,
			member: null,
			mentions: [],
			role_mentions: [],
			content: `${gConfig.settings.prefix}${t} ${a.join(" ")}`
		}, this),
		this);

	if (!bypass && !config.developers.includes(msg.author.id)) {
		try {
			const k = m;
			k.channel.createMessage = async () => new Promise((a, b) => a) as any;
			k.reply = async () => new Promise((a, b) => a) as any;
			await Promise.all(this.cmd.restrictions.filter(r => cmd.restrictions.includes(r.name as any)).map(async (r) => r.check(k, this, c.cmd, u, gConfig)));
		}
		catch (e) {
			if (e instanceof RestrictionError) {
				return msg.channel.createMessage({
					embed: {
						title: "User Did Not Pass A Restriction",
						author: {
							name: `${user.username}#${user.discriminator}`,
							icon_url: user.avatarURL
						},
						description: `The user **${user.username}#${user.discriminator}** did not pass a restriction (restriction: **${e.restriction}**), err: **${e.err}**\nThis can be bypassed (if you are a developer), by adding the \`--bypass\` flag to the command.`,
						timestamp: new Date().toISOString(),
						color: Colors.red
					}
				});
			}
			else throw e;
		}
	}

	await c.cmd.run.call(this, m, u, gConfig, c.cmd);
}));
