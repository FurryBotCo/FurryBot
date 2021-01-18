import Command from "../../util/cmd/Command";
import Internal from "../../util/Functions/Internal";

export default new Command(["rip"], __filename)
	.setBotPermissions([
		"attachFiles",
		"embedLinks"
	])
	.setUserPermissions([])
	.setRestrictions([])
	.setCooldown(3e3, true)
	.setHasSlashVariant(false)
	.setExecutor(async function (msg, cmd) {
		return Internal.handleMemeCommand("image", msg, cmd);
	});
