import Command from "../../../util/cmd/Command";
import CommandError from "../../../util/cmd/CommandError";
import Language from "../../../util/Language";
import config from "../../../config";
import Test from "../../../util/Test";

export default new Command(["test"], __filename)
	.setBotPermissions([])
	.setUserPermissions([])
	.setRestrictions(["developer"])
	.setCooldown(0, true)
	.setExecutor(async function (msg, cmd) {
		if (msg.args.length === 0) return new CommandError("ERR_INVALID_USAGE", cmd);
		const testHandler = new Test();
		Object.keys(config.tests).map(test => testHandler.registerTest<any>(test, config.tests[test]));

		const t = testHandler.getTest(msg.args[0]);
		if (!t) return msg.channel.createMessage(`<@!${msg.author.id}>, ${Language.get(config.devLanguage, `${cmd.lang}.invalid`)}`);
		else t.execute(this, msg, cmd);
	});
