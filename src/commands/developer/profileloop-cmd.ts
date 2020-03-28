import Command from "../../util/CommandHandler/lib/Command";
import ExtendedMessage from "@ExtendedMessage";
import Eris from "eris";
import FurryBot from "../../main";

export default new Command({
	triggers: [
		"profileloop"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 0,
	donatorCooldown: 0,
	description: "Loop through the profile pictures of members in a server.",
	usage: "",
	features: ["devOnly"],
	file: __filename
}, (async function (msg: ExtendedMessage) {
	const sort = {
		good: [],
		bad: []
	};

	const p = msg.channel.guild.members.map(m => m.id);
	let i = 0;
	const l = p.length;

	const e = await msg.channel.createMessage({
		embed: {
			title: "Profile Loop",
			description: "Preparing.."
		}
	});

	await e.addReaction("✅");
	await e.addReaction("❌");

	async function display(id: string) {
		const m = msg.channel.guild.members.get(id);
		i++;

		if (!m.avatar) await e.edit({
			embed: {
				title: `Profile Loop ${i}/${l}`,
				description: `User: **${m.username}#${m.discriminator}** (<@!${m.id}>)\nNo Avatar`
			}
		});
		else await e.edit({
			embed: {
				title: `Profile Loop ${i}/${l}`,
				description: `User: **${m.username}#${m.discriminator}** (<@!${m.id}>)\n[Image Link](${msg.author.dynamicAvatarURL(msg.author.avatar.indexOf("/a_") !== -1 ? "gif" : "png", 1024)})`,
				image: {
					url: m.user.dynamicAvatarURL(m.avatar.indexOf("/a_") !== -1 ? "gif" : "png", 1024)
				}
			}
		});
	}

	async function end(this: FurryBot) {
		this.removeListener("messageReactionAdd", u);
		await e.edit({
			embed: {
				title: "Profile Loop",
				description: `Good: ${sort.good.length}\nBad: ${sort.bad.length}\n\n**Bad List**:\n${sort.bad.map(b => `<@!${b}> (${b})`).join("\n")}`
			}
		});
	}

	async function handleReaction(m: Eris.PossiblyUncachedMessage, emoji: Eris.Emoji, userId: string) {
		if (userId === this.user.id) return;
		await e.removeReaction(emoji.name, userId);
		if (userId !== msg.author.id || !["✅", "❌"].includes(emoji.name)) return;

		switch (emoji.name) {
			case "✅": {
				sort.good.push(p.shift());
				break;
			}

			case "❌": {
				sort.bad.push(p.shift());
				break;
			}
		}

		if (p.length === 0) return end.call(this);
		else return display.call(this, p[0]);
	}

	const u = handleReaction.bind(this);
	this.on("messageReactionAdd", u);

	display(p[0]);
}));
