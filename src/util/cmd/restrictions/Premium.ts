import FurryBot from "../../../main";
import ExtendedMessage from "../../ExtendedMessage";
import Command from "../Command";
import Language from "../../Language";
import config from "../../../config";

export const Label = "premium";
export async function test(client: FurryBot, msg: ExtendedMessage, cmd: Command) {
	if (config.developers.includes(msg.author.id)) return true;
	const g = await msg.gConfig.checkPremium();
	if (cmd.restrictions.includes("premium") && !g.active) {
		const v = await cmd.runOverride("premium", client, msg, cmd);
		if (v === "DEFAULT") await msg.channel.createMessage(`<@!${msg.author.id}>, ${Language.get(msg.gConfig.settings.lang, "other.commandChecks.restrictions.premium.error")}`);
		return false;
	}

	return true;
}
export default test;
