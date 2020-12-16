import Command from "../../util/cmd/Command";

export default new Command(["apikey"], __filename)
	.setBotPermissions([
		"embedLinks"
	])
	.setUserPermissions([
		"administrator"
	])
	.setRestrictions([
		"developer",
		"beta"
	])
	.setCooldown(8.64e+7, true)
	.setExecutor(async function (msg, cmd) {
		return msg.reply("This has not been implemented yet.");
	});
