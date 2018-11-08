const Discord = require("discord.js");
const config = require("./config");
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhr = new XMLHttpRequest();

xhr.addEventListener("readystatechange", function () {
	if (this.readyState === 4) {
		var t=JSON.parse(this.responseText);
		if(t.error) return console.error(`Error loading commands: ${t.error}`);
		var commandList = t.return;
		var commandTimeout = new Set();
		var commandCategories = {
			moderation: commandList.moderationCategory,
			fun: commandList.funCategory,
			info: commandList.infoCategory,
			misc: commandList.miscCategory,
			nsfw: commandList.nsfwCategory,
			utility: commandList.utilityCategory,
			economy: commandList.economyCategory,
			logging: commandList.loggingCategory,
			uncategorized: commandList.uncategorizedCategory,
			utility: commandList.utilityCategory
		};
		console.debug(`Command list loaded.`);
		for(var key in commandList.fullList) {
			commandTimeout[key]=new Set();
		}
		commandTimeout.f=new Set();
		commandTimeout.whatismyprefix=new Set();
		console.debug(`Command timeouts setup`);
	}
});

xhr.open("GET", "https://api.furrybot.me/commands/", false);
xhr.setRequestHeader("Authorization", `Key ${config.apiKey}`);
xhr.send();
		
class FurryBot extends Discord.Client {
	constructor(options) {
		var opt = options||{};
		super(opt);
		require("./utility/logger");
		this.handlers = require("./handlers");
		this.config = config;
		this.XMLHttpRequest = XMLHttpRequest;
		this.commandList = commandList;
		this.commandCategories = commandCategories;
		this.commandTimeout = commandTimeout;
		console.log(this.commandList);
		this.on('ready', () => this.handlers.events.ready(this));
	}
	
	async ready() {
		console.log("ready");
	}
}

const client = new FurryBot();

client.login(config.bot.token);