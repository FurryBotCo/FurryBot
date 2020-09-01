import FurryBot from "../../../bot";
import ExtendedMessage from "../../ExtendedMessage";
import Command from "../Command";
import config from "../../../config";
import Language from "../../Language";

export const Label = "beta";
export async function test(client: FurryBot, msg: ExtendedMessage, cmd: Command) {
	if (config.developers.includes(msg.author.id)) return true;
	if (cmd.restrictions.includes("beta") && !config.beta) {
		const v = await cmd.runOverride("beta", client, msg, cmd);
		if (v === "DEFAULT") await msg.channel.createMessage(`<@!${msg.author.id}>, ${Language.get(msg.gConfig.settings.lang, "other.commandChecks.restrictions.beta.error")}`);
		return false;
	}

	return true;
}
export default test;
