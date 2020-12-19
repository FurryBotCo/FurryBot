import Command from "../../util/cmd/Command";

export default new Command(["autoyiff"], __filename)
	.setBotPermissions([
		"embedLinks",
		"attachFiles"
	])
	.setUserPermissions([
		"manageGuild"
	])
	.setRestrictions([
		"donator"
	])
	.setCooldown(3e3, true)
	.setExecutor(async function (msg, cmd) {

	});
