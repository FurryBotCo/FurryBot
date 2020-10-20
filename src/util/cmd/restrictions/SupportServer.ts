import FurryBot from "../../../main";
import ExtendedMessage from "../../ExtendedMessage";
import Command from "../Command";
import config from "../../../config";
import Language from "../../Language";

export const Label = "supportServer";
export async function test(client: FurryBot, msg: ExtendedMessage, cmd: Command) {
	if (config.developers.includes(msg.author.id)) return true;
	if (cmd.restrictions.includes("supportServer") && msg.channel.guild.id !== config.client.supportServerId) {
		const v = await cmd.runOverride("supportServer", client, msg, cmd);
		if (v === "DEFAULT") await msg.channel.createMessage(`<@!${msg.author.id}>, ${Language.get(msg.gConfig.settings.lang, "other.commandChecks.restrictions.supportServer.error")}`);
		return false;
	}

	return true;
}
export default test;
