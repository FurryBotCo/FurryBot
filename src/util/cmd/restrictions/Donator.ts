import FurryBot from "../../../main";
import ExtendedMessage from "../../ExtendedMessage";
import Command from "../Command";
import Language from "../../Language";
import config from "../../../config";

export const Label = "donator";
export async function test(client: FurryBot, msg: ExtendedMessage, cmd: Command) {
	if (config.developers.includes(msg.author.id)) return true;
	const d = await msg.uConfig.checkPremium(true);
	if (cmd.restrictions.includes("donator") && !d.active) {
		const v = await cmd.runOverride("donator", client, msg, cmd);
		if (v === "DEFAULT") await msg.channel.createMessage(`<@!${msg.author.id}>, ${Language.get(msg.gConfig.settings.lang, "other.commandChecks.restrictions.donator.error")}`);
		return false;
	}

	return true;
}
export default test;
