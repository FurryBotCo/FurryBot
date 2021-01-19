import CommandHelper from "../src/util/DiscordCommands/main";
import beta from "../src/config/client/beta.json";
import production from "../src/config/client/production.json";

const c = production;
const h = new CommandHelper(c.token, c.id);

const guildId = "760631859385335838";

process.nextTick(async () => {
	const global = await h.fetchGlobalCommands();
	const guild = await h.fetchGuildCommands(guildId);


	if (global.length !== 0) {
		for (const cmd of global) {
			await h.deleteGlobalCommand(cmd.id);
			console.log(`Removed global command ${cmd.name}`);
		}
		console.log(`Removed ${global.length} global commands`);
	} else console.log("No global commands to remove.");

	if (guild.length !== 0) {
		for (const cmd of guild) {
			await h.deleteGuildCommand(guildId, cmd.id);
			console.log(`Removed guild command ${cmd.name}`);
		}
		console.log(`Removed ${guild.length} guild commands`);
	}
	else console.log("No guild commands to remove.");
});
