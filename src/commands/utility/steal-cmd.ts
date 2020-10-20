import Command from "../../util/cmd/Command";
import CommandError from "../../util/cmd/CommandError";
import Request from "../../util/Functions/Request";
import Language from "../../util/Language";

export default new Command(["steal"], __filename)
	.setBotPermissions([
		"manageEmojis"
	])
	.setUserPermissions([
		"manageEmojis"
	])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length < 1) return new CommandError("ERR_INVALID_USAGE", cmd);
		const e = msg.args[0].match(/(?:<a?:(.*):)?([0-9]{15,21})(?:>)?/i);

		const id = e?.[2];
		const name = msg.args.slice(1).join(" ") || e?.[1] || id;

		const img = await Request.getImageFromURL(`https://cdn.discordapp.com/emojis/${id}`, true);

		if (img.statusCode !== 200) return msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.invalid`));

		await msg.channel.guild.createEmoji({
			name,
			image: `data:${img.headers["content-type"]};base64,${Buffer.from(img.body).toString("base64")}`
		}).then(j =>
			msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.success`, [`<${j.animated ? "a" : ""}:${j.name}:${j.id}>`, j.name]))
		).catch(err =>
			msg.reply(Language.get(msg.gConfig.settings.lang, `${cmd.lang}.fail`, [`${err.name}: ${err.message}`]))
		);
	});
