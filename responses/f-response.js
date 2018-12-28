module.exports = {
	triggers: [
        "f",
        "rip"
	],
	userPermissions: [],
	botPermissions: [],
	cooldown: 2e3,
	run: (async (client,message) => {
        var f = await client.r.table("stats").get("fCount");
        client.r.table("stats").get("fCount").update({count:parseInt(f.count)+1});
        return message.channel.send(`<@!${message.author.id}> has paid respects.\n\nRespects paid total: ${parseInt(f.count)+1}\n\n(You can toggle this off with \`${message.gConfig.prefix}togglefresponse\`)`);
	})
};