module.exports = {
	triggers: ["discord"],
	userPermissions: [],
	botPermissions: [
		"EMBED_LINKS"
	],
	cooldown: 2e3,
	description: "Get a link to our Discord support server",
	usage: "",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: ()=>{}
};

module.exports = (async (self,local) => {
	
	var data = {
		title: "Discord",
		description: `[Join Our Discord Server!](${self.config.bot.supportInvite})`,
		thumbnail: {
			url: "https://cdn.discordapp.com/embed/avatars/0.png"
		}
	};
	Object.assign(data,local.embed_defaults());
	var embed = new self.Discord.MessageEmbed(data);
	local.channel.send(embed);
});