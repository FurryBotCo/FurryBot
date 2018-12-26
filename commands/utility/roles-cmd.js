module.exports = {
	triggers: [
        "roles"
    ],
	userPermissions: [],
	botPermissions: [],
	cooldown: 3e3,
	description: "Get user or server roles",
	usage: "[server/@member/@role/name/id]",
	nsfw: false,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	run: (async(client,message)=>{
        if(message.args.length === 0) {
            var member = message.member;
        } else {
            
        }
    })
};