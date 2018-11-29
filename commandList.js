const config = require("./config");

class FurryBotCommands {
    constructor() {
    	this.commandList={
    		"fullList": [],
    		"categories": [
    			"moderationCategory",
    			"funCategory",
    			"infoCategory",
    			"miscCategory",
    			"musicCategory",
    			"nsfwCategory",
    			"loggingCategory",
    			"economyCategory",
    			"utilityCategory",
    			"developerCategory"
    		],
    		"moderationCategory": {},
    		"funCategory": {},
    		"infoCategory": {},
    		"miscCategory": {},
    		"musicCategory": {},
    		"nsfwCategory": {},
    		"utilityCategory":{},
    		"loggingCategory": {},
    		"economyCategory": {},
    		"developerCategory": {},
    		"all": {},
    		"alias": {},
    		"nonalias": {},
    		"response": {}
    	};
    	
	}
	
	function registerCommand(name, category, userPermissions=[], botPermissions=[], cooldown, description, usage, ext={}) {
		//
		var nsfw = typeof ext.nsfw !== "undefined" ? ext.nsfw :false;
		var devOnly = typeof ext.devOnly !== "undefined" ? ext.devOnly : false;
		var guildOwnerOnly = typeof ext.guildOwnerOnly !== "undefined" ? ext.guildOwnerOnly : false;
		var betaCommand = typeof ext.betaOnly !== "undefined" ? ext.betaOnly : false;
		if(betaCommand && !config.beta) return;
		var command = {
    		category,
    		userPermissions,
    		botPermissions,
    		cooldown,
    		description,
    		usage,
    		nsfw,
    		devOnly,
    		guildOwnerOnly,
    		alias: false
		};
		
		this.commandList.fullList[name] = command;
		if(this.commandList.categories.includes(`${category}Category`)) {
			this.commandList[`${category}Category`].push(name);
			this.commandList.all.push(name);
			this.commandList.nonalias.push(name);
		} else {
			var err = {
			    success:false,
			    error:{
			        "error_type": "ERR_ADD_COMMAND",
			        "error_description": `Error adding command "${name}" to "${category}" (${category}Category)`
			    }
			};
			return new Error(err);
		}
		return true;
	}
	
	function registerAlias(name, aliasof) {
		//echo print_r($this->commandList['fullList'],true});
		//echo $name;
		//echo $aliasof;
		if(!Object.kjeys(this.commandList.fullList).includes(aliasof)) return;
	    var cmd = this.commandList.fullList[aliasof];
		cmd.usage = cmd.usage.replace(aliasof, $name);
		cmd.alias = true;
		cmd.aliasof = aliasof;
		this.commandList.all.push($name);
	    this.commandList.alias.push($name);
	    this.commandList.fullList[$name] = $cmd;
	} 
	
	public function registerResponse(trigger, description, cooldown, betaResponse) {
		if(!betaResponse && !config.beta) return;
		var rsp = {};
		rsp.description = description;
		rsp.cooldown = cooldown;
		this.commandList.response[$trigger] = rsp;
	}
}

const fb = new FurryBotCommands();


// moderation
// name, category, userPermissions, botPermissions, cooldown (ms), description, usage, nsfw, devOnly, guildOwnerOnly, betaCommand
fb.registerCommand("kick", "moderation", ["KICK_MEMBERS"],["KICK_MEMBERS"],1e3,"Kick members from your server", "kick <@member, user id, or tag> [reason]", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});
fb.registerAlias("k","kick");

fb.registerCommand("ban","moderation",["BAN_MEMBERS"],["BAN_MEMBERS"],1e3,"ban members from your server","ban <@member, user id, or tag> [reason]", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});
fb.registerAlias("b","ban");

fb.registerCommand("hackban","moderation",["BAN_MEMBERS"],["BAN_MEMBERS"],1e3,"ban people not already in your server","hackban <@user, user id, or tag> [reason]", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: true});

fb.registerCommand("unban","moderation",["BAN_MEMBERS"],["BAN_MEMBERS"],1e3,"remove bans for people that have been previously banned in your server","unban <@user, user id, or tag> [reason]", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: true});

fb.registerCommand("prune","moderation",["MANAGE_MESSAGES"],["MANAGE_MESSAGES"],1e3,"Clear messages in a channel","prune <2-100>", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});
fb.registerAlias("purge","prune");

fb.registerCommand("warn","moderation",["MANAGE_GUILD"],[],2.5e3,"Warn a user for something they've done","warn <@user, user id, or username> <reason>", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: true});

fb.registerCommand("warnlog","moderation",["MANAGE_GUILD"],[],2.5e3,"Check the warnings a user has","warnlog <@user, user id, or username> [page]", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: true});

fb.registerCommand("fetchwarn","moderation",["MANAGE_GUILD"],[],2.5e3,"Fetch a warning for a user","fetchwarn <@user, user id, or username> <id>", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: true});
fb.registerAlias("fetchwarning","fetchwarn");
fb.registerAlias("getwarning","fetchwarn");

fb.registerCommand("clearwarnings","moderation",["MANAGE_GUILD"],[],2.5e3,"Clear warnings for a user","clearwarnings <@user, user id, or username>", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: true});
fb.registerAlias("warnclear","clearwarn");

fb.registerCommand("delwarn","moderation",["MANAGE_GUILD"],[],2.5e3,"Delete a warning for a user","delwarn <@user, user id, or username> <id>", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: true});
fb.registerAlias("rmwarn","delwarn");

fb.registerCommand("setmuterole","moderation",["MANAGE_GUILD")][],2.5e3,"Stop the role used to mute people","setmuterole <@role, role id, or role name>", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: true});

fb.registerCommand("mute","moderation",["MANAGE_GUILD"],[],2.5e3,"Stop a user from chatting","mute <@user, user id, or username> <reason>", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: true});

fb.registerCommand("unmute","moderation",["MANAGE_GUILD"],[],2.5e3,"Undo a mute","unmute <@user, user id, or username>", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: true});

fb.registerCommand("setmodlog","moderation",["MANAGE_GUILD"],[],2.5e3,"Stop the location for modlogs to go","modlog", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: true});

fb.registerCommand("modlog","moderation",["MANAGE_GUILD"],[],2.5e3,"Get modlogs for a specific user","modlog <@user, user id, or username> [page]", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: true});

// fun
// name, category, userPermissions, botPermissions, cooldown (ms), description, usage, nsfw, devOnly, guildOwnerOnly, betaCommand
fb.registerCommand("roll","fun",[],[],.5e3,"Roll the dice!","roll", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});

fb.registerCommand("hug","fun",[],[],1e3,"Hug someone!","hug <@user or string>", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});

fb.registerCommand("snuggle","fun",[],[],1e3,"snuggle","snuggle <@user or string>", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});
fb.registerAlias("snug","snuggle");

fb.registerCommand("cuddle","fun",[],[],1e3,"cuddle","cuddle <@user or string>", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});

fb.registerCommand("boop","fun",[],[],1e3,"Boop someones snoot!","boop <@user or string>", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});

fb.registerCommand("lick","fun",[],[],1e3,"Lick someone.. owo","lick <@user or string>", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});

fb.registerCommand("dictionary","fun",[],[],1e3,"Throw the dictionary at someone. Knowledge!","dictionary <@user or string>", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});
fb.registerAlias("throw_dict","dictionary");

fb.registerCommand("flop","fun",[],[],1e3,"Flop onto someone! OwO","flop <@user or string>", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});

fb.registerCommand("pat","fun",[],[],1e3,"Pat someone uwu","pat <@user or string>", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});

fb.registerCommand("pet","fun",[],[],1e3,"Pet someone ^w^","pet <@user or string>", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});

fb.registerCommand("glomp","fun",[],[],1e3,"Pounce onto someone and tell them you love them!","<@user or string>", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});

fb.registerCommand("nuzzle","fun",[],[],1e3,"Nuzzle someone!","nuzzle <@user or string>", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});

fb.registerCommand("furpile","fun",[],[],1e3,"Start a furpile on someone or join in!","furpile <@user or string>", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});

fb.registerCommand("nap","fun",[],[],1e3,"Flop onto smeone.. then take a nap?","nap <@user or string>", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});

fb.registerCommand("kiss","fun",[],[],1e3,"Kiss someone o.o","kiss <@user or string>", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});

fb.registerCommand("bap","fun",[],[],1e3,"Bap someone! Ouch!","bap <@user or string>", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});

fb.registerCommand("russianroulette","fun",[],[],.5e3,"Play russian roulette","russianroulette", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});
fb.registerAlias("rr","russianroulette");

fb.registerCommand("dadjoke","fun",[],[],7e3,"Get a dadjoke!","dadjoke", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: true});
fb.registerAlias("joke","dadjoke");

fb.registerCommand("deer_steak","fun",{"ATTACH_FILES"),[],2e3,"Request some deer steak!","deer_steak", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});

fb.registerCommand("fox","fun",[],{"ATTACH_FILES"),2e3,"Get a picture of a fox!","fox", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});

fb.registerCommand("dog","fun",[],{"ATTACH_FILES"),2e3,"Get a picture of a dog!","dog", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});

fb.registerCommand("cat","fun",[],{"ATTACH_FILES"),2e3,"Get a picture of a cat!","cat", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});

fb.registerCommand("birb","fun",[],{"ATTACH_FILES"),2e3,"Get a picture of a birb!","birb", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});
fb.registerAlias("bird","birb");

fb.registerCommand("bunny","fun",[],{"ATTACH_FILES"),2e3,"Get a picture of a bunny!","bunny", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});

fb.registerCommand("fur","fun",[],{"ATTACH_FILES","EMBED_LINKS"),2e3,"Get a random fur image! Use `fur list` to get a list of supported websites!","fur [website/list]", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: true});

fb.registerCommand("fursuit","fun",[],{"ATTACH_FILES","EMBED_LINKS"),2e3,"Get a random fursuit image! ","fursuit", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: true});

fb.registerCommand("ship","fun",[],{"ATTACH_FILES"),2e3,"Ship some people! ","ship <@user1> [user2]", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: true});


// info
// name, category, userPermissions, botPermissions, cooldown (ms), description, usage, nsfw, devOnly, guildOwnerOnly, betaCommand
fb.registerCommand("discord","info",[],[],1e3,"Get a link to our Discord support server!","discord", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});

fb.registerCommand("invite","info",[],[],1e3,"Get some invite links for the bot.","invite", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});

fb.registerCommand("ping","info",[],[],.5e3,"Returns the bot's ping.","ping", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});

fb.registerCommand("info","info",[],[],1e3,"Get some info about the bot","info", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});

fb.registerCommand("sinfo","info",[],[],1e3,"Returns some info about the current server.","sinfo", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});
fb.registerAlias("server","sinfo");
fb.registerAlias("s","sinfo");

fb.registerCommand("perms","info",[],[],1e3,"Check bot permissions","perms", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});
fb.registerAlias("listperms","perms");
fb.registerAlias("checkperms","perms");
fb.registerAlias("listpermissions","perms");

fb.registerCommand("uinfo","info",[],[],.5e3,"Get some info on a member in this server!","uinfo <@user, user id, or username>", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});
fb.registerAlias("user","uinfo");
fb.registerAlias("u","uinfo");

fb.registerCommand("seenon","info",[],[],1e3,"Returns the servers we've seen some user on.","seenon <@user, user id, or username>", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: true});
fb.registerAlias("seen","seenon");

//fb.registerCommand("profile","info",[],[],1e3,"Get your or someone elses profile","profile [@user or id]", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: true});


// misc
// name, category, userPermissions, botPermissions, cooldown (ms), description, usage, nsfw, devOnly, guildOwnerOnly, betaCommand
fb.registerCommand("commands","misc",[],[],2e3,"Bot command list","commands", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});
fb.registerAlias("cmds","commands");

fb.registerCommand("test","misc",[],[],0,"Testing command","test", {nsfw: false,devOnly: true,guildOwnerOnly: false,betaOnly: false});

fb.registerCommand("stoptyping","misc",{"MANAGE_MESSAGES"),[],1e3,"Use this if the bot won't stop typing in a channel","stoptyping", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: true});

fb.registerCommand("help","misc",[],[],.5e3,"Help command","help [command or category]", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});
fb.registerAlias("h","help");

fb.registerCommand("delcmds","misc",{"MANAGE_MESSAGES"),{"MANAGE_MESSAGES"),0,"Enable command deletion","delcmds", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});

fb.registerCommand("suggest","misc",[],[],18e5,"Suggest a feature for the bot","suggest <suggestion>", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});

// music
// name, category, userPermissions, botPermissions, cooldown (ms), description, usage, nsfw, devOnly, guildOwnerOnly, betaCommand
/*
fb.registerCommand("play","music",[],[],0,"Play some music (dev only)","play <provider> <search/link>", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: true});

fb.registerCommand("stop","music",[],[],0,"Stop music playback","stop", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: true});

fb.registerCommand("queue","music",[],[],0,"List the current queue","queue [page]", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: true});
fb.registerAlias("q","queue");

fb.registerCommand("pause","music",[],[],0,"Pause the current playback","pause", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: true});

fb.registerCommand("resume","music",[],[],0,"Resume the current playback","resume", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: true});

fb.registerCommand("nowplaying","music",[],[],0,"Get the current playing song","nowplaying", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: true});
fb.registerAlias("np","nowplaying");

fb.registerCommand("join","music",[],[],0,"Make the bot join your current channel","join", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: true});

fb.registerCommand("leave","music",[],[],0,"Make the bot leave the current voice channel","leave", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: true});
*/

// nsfw
// name, category, userPermissions, botPermissions, cooldown (ms), description, usage, nsfw, devOnly, guildOwnerOnly, betaCommand
fb.registerCommand("yiff","nsfw",[],[],3e3,"Get some yiff!","yiff [type]", {nsfw: true,devOnly: false,guildOwnerOnly: false,betaOnly: false});

fb.registerCommand("bulge","nsfw",[],[],3e3,"*notices bulge* OwO","bulge", {nsfw: true,devOnly: false,guildOwnerOnly: false,betaOnly: false});

fb.registerCommand("e621","nsfw",[],[],3e3,"Get some content from E621!","e621 [tags]", {nsfw: true,devOnly: false,guildOwnerOnly: false,betaOnly: false});

fb.registerCommand("content","nsfw",[],[],5e3,"Get the content count for the yiff types","content", {nsfw: true,devOnly: false,guildOwnerOnly: false,betaOnly: false});


// utility
// name, category, userPermissions, botPermissions, cooldown (ms), description, usage, nsfw, devOnly, guildOwnerOnly, betaCommand
fb.registerCommand("prefix","utility",{"MANAGE_GUILD"),[],3e3,"Change the bots prefix in this guild","prefix <string less than 30 characters>", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});

fb.registerCommand("togglensfw","utility",{"MANAGE_GUILD"),[],3e3,"Toggle NSFW commands","togglensfw", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});

fb.registerCommand("resetguildsettings","utility",[],[],36e5,"Reset guild settings (guild owner only)","resetsettings", {nsfw: false,devOnly: false,guildOwnerOnly: true,betaOnly: true});

fb.registerCommand("modules","utility",[],[],1e3,"List module statuses in the current server","modules", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});

fb.registerCommand("togglefresponse","utility",{"MANAGE_GUILD"),[],3e3,"Toggle the \"F\" response","togglefresponse", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});


// logging
// name, category, userPermissions, botPermissions, cooldown (ms), description, usage, nsfw, devOnly, guildOwnerOnly, betaCommand
fb.registerCommand("log","logging",{"MANAGE_GUILD"),[],.5e3,"Enable or disable logging of an event","log <ltype or all>", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});

fb.registerCommand("logevents","logging",{"MANAGE_GUILD"),[],.5e3,"List loggable events","logevents", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: false});

// developer
// name, category, userPermissions, botPermissions, cooldown (ms), description, usage, nsfw, devOnly, guildOwnerOnly, betaCommand
fb.registerCommand("setname","developer",[],[],0,"Change the bots username (dev only)","setname <username>", {nsfw: false,devOnly: true,guildOwnerOnly: false,betaOnly: false});

fb.registerCommand("seticon","developer",[],[],0,"Change the bots icon (dev only)","seticon <icon url>", {nsfw: false,devOnly: true,guildOwnerOnly: false,betaOnly: false});

fb.registerCommand("restart","developer",[],[],0,"Restart the bot (dev only)","restart", {nsfw: false,devOnly: true,guildOwnerOnly: false,betaOnly: false});

fb.registerCommand("leaveserver","developer",[],[],0,"Make the bot leave a server (dev only)","leaveserver [server id>]", {nsfw: false,devOnly: true,guildOwnerOnly: false,betaOnly: false});

fb.registerCommand("reload","developer",[],[],0,"Reload parts of the bot (dev only)","reload [command/module/commandmodule/all]", {nsfw: false,devOnly: true,guildOwnerOnly: false,betaOnly: false});

fb.registerCommand("eval","developer",[],[],0,"Evaluate code (dev only)","eval <code>", {nsfw: false,devOnly: true,guildOwnerOnly: false,betaOnly: false});
fb.registerAlias("ev","eval");

fb.registerCommand("shell","developer",[],[],0,"Execute shell code (dev only)","shell <code>", {nsfw: false,devOnly: true,guildOwnerOnly: false,betaOnly: false});
fb.registerAlias("sh","shell");

fb.registerCommand("sudo","developer",[],[],0,"Run a message as another user","sudo <user> <command> [args]", {nsfw: false,devOnly: true,guildOwnerOnly: false,betaOnly: false});



// economy
// name, category, userPermissions, botPermissions, cooldown (ms), description, usage, nsfw, devOnly, guildOwnerOnly, betaCommand

//fb.registerCommand("bal","economy",[],[],5e3,"Get your curent balance","bal [user]", {nsfw: false,devOnly: false,guildOwnerOnly: false,betaOnly: true});


// autoresponse
// trigger, description, cooldown, betaResponse
fb.registerResponse("whatismyprefix","Get current server prefix", 0.5e3,false);

fb.registerResponse("f","Pay respects", 3e3,false);

module.exports = fb.commandList;