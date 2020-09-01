import FurryBot from "../../../bot";
import ExtendedMessage from "../../ExtendedMessage";
import Command from "../Command";
import Language from "../../Language";
import config from "../../../config";

export const Label = "nsfw";
export async function test(client: FurryBot, msg: ExtendedMessage, cmd: Command) {
	if (config.developers.includes(msg.author.id)) return true;

	if (cmd.restrictions.includes("nsfw") && !msg.channel.nsfw) {
		const v = await cmd.runOverride("nsfw", client, msg, cmd);
		if (v === "DEFAULT") await msg.channel.createMessage(`<@!${msg.author.id}>, ${Language.get(msg.gConfig.settings.lang, "other.commandChecks.restrictions.nsfw.error")}`);
		return false;
	}

	return true;
}
export default test;
