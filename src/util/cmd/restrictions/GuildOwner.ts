import FurryBot from "../../../bot";
import ExtendedMessage from "../../ExtendedMessage";
import Command from "../Command";
import Language from "../../Language";
import config from "../../../config";

export const Label = "guildOwner";
export async function test(client: FurryBot, msg: ExtendedMessage, cmd: Command) {
	if (config.developers.includes(msg.author.id)) return true;
	if (cmd.restrictions.includes("guildOwner") && msg.author.id !== msg.channel.guild.ownerID) {
		const v = await cmd.runOverride("guildOwner", client, msg, cmd);
		if (v === "DEFAULT") await msg.channel.createMessage(`<@!${msg.author.id}>, ${Language.get(msg.gConfig.settings.lang, "other.commandChecks.restrictions.guildOwner.error")}`);
		return false;
	}

	return true;
}
export default test;
