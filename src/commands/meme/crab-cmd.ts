import Command from "../../util/cmd/Command";
import DankMemerAPI from "../../util/req/DankMemerAPI";
import CommandError from "../../util/cmd/CommandError";
import Internal from "../../util/Functions/Internal";

export default new Command(["crab"], __filename)
	.setBotPermissions([
		"attachFiles",
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length === 0) return new CommandError("ERR_INVALID_USAGE", cmd);
		await msg.channel.startTyping();
		const { ext, file } = await DankMemerAPI.crab(Internal.extraArgParsing(msg));
		await msg.channel.stopTyping();
		return msg.channel.createMessage({}, {
			name: `${cmd.triggers[0]}.${ext}`,
			file
		});
	});
