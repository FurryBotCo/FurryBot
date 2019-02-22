const Discord = require("discord.js");

class UserEntry {
	constructor(user) {
		if(!user) throw new TypeError("missing user");
		if(user instanceof Discord.GuildMember) user = user.user;
		else if (user instanceof Discord.User);
		else throw new TypeError("invalid user, must be one of User or GuildMember.");

		this._config = require("../config");
		this._user = user;
		this._r = require("rethinkdbdash")(this._config.rethink);
	}
}

module.exports = UserEntry;