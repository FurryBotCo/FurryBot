module.exports = {
	/**
	 * Get a user from message args
	 * @async
	 * @param {Number} [argPosition=0] arg position to look at
	 * @param {Boolean} [unparsed=false] used parsed or unparsed args
	 * @param {Boolean} [join=false] join together all args before running
	 * @param {Number} [mentionPosition=0] which mention to look for
	 * @returns {(User|Boolean)} user that was found, or false if none were found
	 */
	async getUserFromArgs(argPosition = 0,unparsed = false,join = false,mentionPosition = 0) {
		if(!(this instanceof this.client.Discord.Message)) throw new TypeError("invalid message");
		let argObject, args;
		argObject = unparsed ? "unparsedArgs" : "args"; 
		if(!this[argObject]) throw new TypeError(`${argObject} property not found on message`);
		if(join) {
			args = [this[argObject].join(" ")];
			argPosition = 0;
		} else {
			args = this[argObject];
		}
		
		// user mention
		if(this.mentions.users.size >= mentionPosition+1) return this.mentions.users.first(mentionPosition+1)[mentionPosition];
		
		// user ID
		if(!isNaN(args[argPosition]) && !(args.length === argPosition || !args || this.mentions.users.size >= mentionPosition+1)) return this.client.users.fetch(args[argPosition]);
		
		// username
		if(isNaN(args[argPosition]) && args[argPosition].indexOf("#") === -1 && !(args.length === argPosition || !args || this.mentions.users.size >= mentionPosition+1)) return this.client.users.find(t => t.username.toLowerCase()===args[argPosition].toLowerCase());
		
		// user tag
		if(isNaN(args[argPosition]) && args[argPosition].indexOf("#") !== -1 && !(this.mentions.users.size >= mentionPosition+1)) return this.client.users.find(t => t.tag.toLowerCase()===args[argPosition].toLowerCase());

		// nothing found
		return false;
	},
	/**
	 * Get a member from message args
	 * @async
	 * @param {Number} [argPosition=0] arg position to look at
	 * @param {Boolean} [unparsed=false] used parsed or unparsed args
	 * @param {Boolean} [join=false] join together all args before running
	 * @param {Number} [mentionPosition=0] which mention to look for
	 * @returns {(GuildMember|Boolean)} guild member that was found, or false if none were found
	 */
	async getMemberFromArgs(argPosition = 0,unparsed = false,join = false,mentionPosition = 0){
		if(!(this instanceof this.client.Discord.Message)) throw new TypeError("invalid message");
		let argObject, args;
		argObject = unparsed ? "unparsedArgs" : "args"; 
		if(!this[argObject]) throw new TypeError(`${argObject} property not found on message`);
		if(join) {
			args = [this[argObject].join(" ")];
			argPosition = 0;
		} else {
			args = this[argObject];
		}
		if(!this.guild || !(this.guild instanceof this.client.Discord.Guild)) throw new TypeError("invalid or missing guild on this");
		
		// member mention
		if(this.mentions.members.size >= mentionPosition+1) return this.mentions.members.first(mentionPosition+1)[mentionPosition];
		
		// user ID
		if(!isNaN(args[argPosition]) && !(args.length === argPosition || !args || this.mentions.members.size >= mentionPosition+1)) return this.guild.members.get(args[argPosition]);
		
		// username
		if(isNaN(args[argPosition]) && args[argPosition].indexOf("#") === -1 && !(args.length === argPosition || !args || this.mentions.members.size >= mentionPosition+1)) return this.guild.members.find(m => m.user.username.toLowerCase()===args[argPosition].toLowerCase());
		
		// user tag
		if(isNaN(args[argPosition]) && args[argPosition].indexOf("#") !== -1 && !(this.mentions.members.size >= mentionPosition+1)) return this.guild.members.find(m => m.user.tag.toLowerCase()===args[argPosition].toLowerCase());

		// nothing found
		return false;
	},
	/**
	 * Get a channel from message args
	 * @async
	 * @param {Number} [argPosition=0] arg position to look at
	 * @param {Boolean} [unparsed=false] used parsed or unparsed args
	 * @param {Boolean} [join=false] join together all args before running
	 * @param {Number} [mentionPosition=0] which mention to look for
	 * @returns {(Channel|Boolean)} channel that was found, or false if none were found
	 */
	async getChannelFromArgs(argPosition = 0,unparsed = false,join = false,mentionPosition = 0){
		if(!(this instanceof this.client.Discord.Message)) throw new TypeError("invalid message");
		let argObject, args;
		argObject = unparsed ? "unparsedArgs" : "args"; 
		if(!this[argObject]) throw new TypeError(`${argObject} property not found on message`);
		if(join) {
			args = [this[argObject].join(" ")];
			argPosition = 0;
		} else {
			args = this[argObject];
		}
		if(!this.guild || !(this.guild instanceof this.client.Discord.Guild)) throw new TypeError("invalid or missing guild on this");
		
		// channel mention
		if(this.mentions.channels.first()) return this.mentions.channels.first(mentionPosition+1)[mentionPosition];
		
		// channel ID
		if(!isNaN(args[argPosition]) && !(args.length === argPosition || !args || this.mentions.channels.first())) return this.guild.channels.get(args[argPosition]);
		
		// channel name
		if(isNaN(args[argPosition]) && !(args.length === argPosition || !args || this.mentions.channels.first())) return this.guild.channels.find(c => c.name.toLowerCase()===args[argPosition].toLowerCase());

		// nothing found
		return false;
	},
	/**
	 * Get a role from message args
	 * @async
	 * @param {Number} [argPosition=0] arg position to look at
	 * @param {Boolean} [unparsed=false] used parsed or unparsed args
	 * @param {Boolean} [join=false] join together all args before running
	 * @param {Number} [mentionPosition=0] which mention to look for
	 * @returns {(Role|Boolean)} role that was found, or false if none were found
	 */
	async getRoleFromArgs(argPosition = 0,unparsed = false,join = false,mentionPosition = 0){
		if(!(this instanceof this.client.Discord.Message)) throw new TypeError("invalid message");
		let argObject, args;
		argObject = unparsed ? "unparsedArgs" : "args"; 
		if(!this[argObject]) throw new TypeError(`${argObject} property not found on message`);
		if(join) {
			args = [this[argObject].join(" ")];
			argPosition = 0;
		} else {
			args = this[argObject];
		}
		if(!this.guild || !(this.guild instanceof this.client.Discord.Guild)) throw new TypeError("invalid or missing guild on this");

		// role mention
		if(this.mentions.roles.size >= mentionPosition+1) return this.mentions.roles.first(mentionPosition+1)[mentionPosition];
		
		// role ID
		if(!isNaN(args[argPosition]) && !(args.length === argPosition || !args || this.mentions.roles.size >= mentionPosition+1)) return this.guild.roles.get(args[argPosition]);
		
		// role name
		if(isNaN(args[argPosition]) && !(args.length === argPosition || !args || this.mentions.roles.size >= mentionPosition+1)) return this.guild.roles.find(r => r.name.toLowerCase()===args[argPosition].toLowerCase());

		// nothing found
		return false;
	},
	/**
	 * Get a server from message args
	 * @async
	 * @param {Number} [argPosition=0] arg position to look at
	 * @param {Boolean} [unparsed=false] used parsed or unparsed args
	 * @param {Boolean} [join=false] join together all args before running
	 * @returns {(Guild|Boolean)} guild that was found, or false if none were found
	 */
	async getServerFromArgs(argPosition = 0,unparsed = false,join = false){
		if(!(this instanceof this.client.Discord.Message)) throw new TypeError("invalid message");
		let argObject, args;
		argObject = unparsed ? "unparsedArgs" : "args"; 
		if(!this[argObject]) throw new TypeError(`${argObject} property not found on message`);
		if(join) {
			args = [this[argObject].join(" ")];
			argPosition = 0;
		} else {
			args = this[argObject];
		}
		// server id
		if(!isNaN(args[argPosition]) && !(args.length === argPosition || !args)) return this.client.guilds.get(args[argPosition]);

		// server name
		if(isNaN(args[argPosition]) && !(args.length === argPosition || !args)) return this.client.guilds.find(g => g.name.toLowerCase()===args[argPosition].toLowerCase());

		// nothing found
		return false;
	},
	/**
	 * Configure user
	 * @async
	 * @param {(User|GuildMember)} [user=null] the user to configure 
	 * @returns {Object} configured user properties
	 */
	async configureUser(user = null) {
		let member = ![undefined,null,""].includes(user) ? user instanceof this.client.Discord.User ? this.guild.members.get(user.id) : user instanceof this.client.Discord.GuildMember ? user : !isNaN(user) ? this.guild.members.get(user) : false : this.member;
		if(!(member instanceof this.client.Discord.GuildMember)) throw new Error("invalid member");
		return {
			isDeveloper: this.client.config.developers.includes(member.id),
			isServerModerator: member.permissions.has("MANAGE_GUILD"),
			isServerAdministrator: member.permissions.has("ADMINISTRATOR")
		};
	},
	/**
	 * send an error embed to a channel
	 * @async
	 * @param {String} [type=""] the type of embed to send
	 * @param {Boolean} [custom=false] use a custom error embed
	 * @param {String} [title=""] title for custom error embed
	 * @param {String} [description=""] description for custom error embed
	 * @param {Array} [fields=[]] fields for custom error embed
	 * @returns {Message} message that was sent to channel
	 */
	async errorEmbed(type = "", custom = false, title = "", description = "", fields = []) {
		if(!custom) {
			switch(type.toUpperCase()) {
			case "INVALID_USER":
				title = "User Not Found",
				description = "The specified user was not found, please provide one of the following:\nFULL user ID, FULL username, FULL user tag",
				fields = [];
				break;
				
			case "INVALID_ROLE":
				title = "Role Not Found",
				description = "The specified role was not found, please provide one of the following:\nFULL role ID, FULL role name (capitals do matter), or role mention",
				fields = [];
				break;

			case "INVALID_CHANNEL":
				title = "Channel Not Found",
				description = "The specified channel was not found, please provide one of the following:\nFULL channel ID, FULL channel name, or channel mention",
				fields = [];
				break;
				
			default:
				title = "Default Title",
				description = "Default Description",
				fields = [];
			}
		}
		return this.channel.send(new this.client.Discord.MessageEmbed(Object.assign({
			title,
			description,
			fields
		},this.embed_defaults()))).then(() => {
			if(this.channel.typing) this.channel.stopTyping();
		}).catch((e) => {
			if(this.channel.typing) this.channel.stopTyping();
			throw e;
		});
	}
};