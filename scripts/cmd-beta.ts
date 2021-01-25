import { ApplicationCommandOptionType } from "../src/util/DiscordCommands/Constants";
import CommandHelper from "../src/util/DiscordCommands/main";
import Language from "../src/util/Language";
import config from "../src/config";
import beta from "../src/config/client/beta.json";
import production from "../src/config/client/production.json";

const c = beta;
const h = new CommandHelper(c.token, c.id);

const guildId = "760631859385335838";

process.nextTick(async () => {
	/* remove for beta */

	const guild = await h.fetchGuildCommands(guildId);

	if (guild.length !== 0) {
		for (const cmd of guild) {
			await h.deleteGuildCommand(guildId, cmd.id);
			console.log(`Removed guild command ${cmd.name}`);
		}
		console.log(`Removed ${guild.length} guild commands`);
	}
	else console.log("No guild commands to remove.");

	/* start custom */

	// await h.createGuildCommand(guildId, "register", Language.get(config.devLanguage, "commands.custom.register.description", [], false, true, true), []);

	await h.createGuildCommand(guildId, "apikey", Language.get(config.devLanguage, "commands.custom.apikey.description", [], false, true, true), [
		{
			type: ApplicationCommandOptionType.SUB_COMMAND,
			name: "create",
			description: "Create an api key.",
			options: [
				{
					type: ApplicationCommandOptionType.STRING,
					name: "name",
					description: "An application name for the api key you're creating.",
					required: true
				},
				{
					type: ApplicationCommandOptionType.STRING,
					name: "contact",
					description: "A method of contact for you. A website, email, twitter, etc.",
					required: true
				}
			]
		},
		{
			type: ApplicationCommandOptionType.SUB_COMMAND,
			name: "list",
			description: "List your api keys.",
			options: []
		},
		{
			type: ApplicationCommandOptionType.SUB_COMMAND,
			name: "delete",
			description: "Delete an api key.",
			options: [
				{
					type: ApplicationCommandOptionType.STRING,
					name: "key",
					description: "The key you want to delete. Use the list subcommand to see your active keys.",
					required: true
				}
			]
		},
		{
			type: ApplicationCommandOptionType.SUB_COMMAND,
			name: "edit",
			description: "Edit the information associated with your api key.",
			options: [
				{
					type: ApplicationCommandOptionType.STRING,
					name: "name",
					description: "An application name for the api key you're creating.",
					required: false
				},
				{
					type: ApplicationCommandOptionType.STRING,
					name: "contact",
					description: "A method of contact for you. A website, email, twitter, etc.",
					required: false
				}
			]
		},
		{
			type: ApplicationCommandOptionType.SUB_COMMAND,
			name: "usage",
			description: "Get your api usage per key.",
			options: []
		}
	]);

	/* end custom */

	/* count */

	await h.fetchGlobalCommands().then(c => console.log("We have", c.length, "global commands."));
	await h.fetchGuildCommands(guildId).then(c => console.log("We have", c.length, "guild commands."));
});
