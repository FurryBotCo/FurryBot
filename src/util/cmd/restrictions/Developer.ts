import FurryBot from "../../../main";
import ExtendedMessage from "../../ExtendedMessage";
import Command from "../Command";
import Language from "../../Language";
import config from "../../../config";

export const Label = "developer";
export async function test(client: FurryBot, msg: ExtendedMessage, cmd: Command) {
	if (cmd.restrictions.includes("developer") && !config.developers.includes(msg.author.id)) {
		const v = await cmd.runOverride("developer", client, msg, cmd);
		if (v === "DEFAULT") await msg.channel.createMessage(`<@!${msg.author.id}>, ${Language.get(msg.gConfig.settings.lang, "other.commandChecks.restrictions.developer.error")}`);
		return false;
	}

	return true;
}
export default test;
