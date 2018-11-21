class FurryBotDatabase {
	constructor(client) {
		if(!client) throw new Error("missing client");
		this.client = client;
		this.config = this.client.config;
		this.uuid = require("uuid/v4");
		this.r = !this.client.r ? require("rethinkdbdash")(this.config.db) : this.client.r;
		this.logger = new (require(`${this.config.rootDir}/util/LoggerV3.js`))(this.client);
	}
	
	async createGuild(gid,disableCheck=false){
		if(!gid) return new Error("missing gid parameter");
		gid = gid.toString();
		if(!this.client.guilds.has(gid) && !disableCheck) {
			this.logger.warn(`[createGuild]: Attempted to add guild that the bot is not in`);
			return new Error("ERR_NOT_FOUND");
		}
		this.logger.info(`[createGuild]: Added guild "${gid}" with default configuration`);
		var gConfig = {id: gid};
		var eConfig = {id: gid};
		Object.assign(gConfig,this.config.guildDefaultConfig);
		//Object.assign(eConfig,this.config.economyDefaultConfig);
		await this.r.table("guilds").insert(gConfig);
		//await this.r.table("economy").insert(eConfig);
		return this.getGuild(gid);
	}

	async getGuild(gid) {
		if(!gid) return new Error("missing parameter");
		var a = await this.r.table("guilds").get(gid);
		//var b = await this.r.table("economy").get(gid);
		if(!a/* || !b*/) return this.createGuild(gid);
		//a.economy = b;
		return a;
	}

	async deleteGuild(gid) {
		if(!gid) return new Error("missing parameter");
		var a = await this.r.table("guilds").get(gid);
		//var b = await this.r.table("economy").get(gid);
		if(a !== null) await this.r.table("guilds").get(gid).delete();
		//if(b !== null) await this.r.table("economy").get(gid).delete();
		this.logger.info(`[deleteGuild]: Deleted guild "${gid}"`);
		return {guild:a!==null/*,economy:b!==null*/};
	}

	async updateGuild(gid,fields) {
		if(!gid || !fields || fields.length === 0) return new Error("missing parameter");
		//if(!fields.guild && !fields.economy) return new Error("invalid fields");
		var a = await this.r.table("guilds").get(gid);
		//var b = await this.r.table("economy").get(gid);
		if(!a/* || !b*/) await this.createGuild(gid);
		if(!fields.guild && !fields.economy) {
			await this.r.table("guilds").get(gid).update(fields);
		}
		if(fields.guild !== undefined) {
			await this.r.table("guilds").get(gid).update(fields.guild);
		}
		/*if(fields.economy !== undefined) {
			await this.r.table("economy").get(gid).update(fields.economy);
		}*/
		return this.getGuild(gid);
	}

	async sweepGuilds(del=false) {
		var j = self.guilds;
		var guilds = [];
		j.forEach((gj)=>gj.forEach((g)=>guilds.push(g.id)));
		var g = {
			guild: await this.r.table("guilds"),
			//economy: await this.r.table("economy")
		},
		g2 = {
			guild: [],
			//economy: []
		};
		/*
		fb!eval (async()=>{return (await self.shard.fetchClientValues("guilds"))[0].map(g=>g.id).includes(self.guild.id);})()
		*/
		g.guild.forEach((guild)=>{
			if(!guilds.includes(guild.id)) {
				g2.guild.push(guild.id);
				this.logger.warn(`Found guild "${guild.id}" in "guilds" table, which the bot is not in`);
				if(del) this.r.table("guilds").get(guild.id).delete().then((r)=>{
					if(r.deleted !== 1) this.logger.error(`[sweepGuilds]: Failed deleting guild "${guild.id}"`);
					this.logger.info(`[sweepGuilds]: deleted guild "${guild.id}"`);
				});
			}
		});
		/*g.economy.forEach((economy)=>{
			if(!guilds.includes(economy.id)) {
				g2.economy.push(economy.id);
				this.logger.warn(`Found guild "${economy.id}" in "economy" table, which the bot is not in`);
				if(del) this.r.table("economy").get(economy.id).delete().then((r)=>{
					if(r.deleted !== 1) this.logger.error(`[sweepGuilds]: Failed deleting guild "${economy.id}"`);
					this.logger.info(`[sweepGuilds]: deleted guild "${economy.id}"`);
				});
			}
		});*/
		if(del) {
			this.logger.warn(`Purged ${g2.guild.length} guild${g2.guild.length!==1?"s":""} in "guilds" table that were not in the bot`);
			//this.logger.warn(`Purged ${g2.economy.length} guild${g2.economy.length!==1?"s":""} in "economy" table that were not in the bot`);
		} else {
			this.logger.warn(`Found ${g2.guild.length} guild${g2.guild.length!==1?"s":""} in "guilds" table that were not in the bot`);
			//this.logger.warn(`Found ${g2.economy.length} guild${g2.economy.length!==1?"s":""} in "economy" table that were not in the bot`);
		}
		return g2;
	}

	async createUserWarning(uid,gid,blame,reason,bypassChecks=false) {
		if(!uid || !gid || !blame || !reason) return new Error("missing parameter");
		if(!bypassChecks) {
			if(!this.client.guilds.has(gid)) {
				this.logger.warn(`[createUserWarning]: Attempted to add warning to a guild that the bot is not in`);
				return new Error("ERR_NOT_FOUND");
			}
			if(!this.client.guilds.get(gid).members.has(uid)) {
				this.logger.warn(`[createUserWarning]: Attempted to add warning to a member that is not in the guild`);
				return new Error("ERR_NOT_FOUND");
			}
		}
		//var id = await this.client.random();
		var id = (await this.r.table("warnings").count())+1;
		await this.r.table("warnings").insert({id,uid,gid,blame,reason,timestamp:Date.now()});
		return this.r.table("warnings").get(id);
	}

	async getUserWarnings(uid,gid) {
		if(!uid || !gid) return new Error("missing parameter");
		return this.r.table("warnings").filter({uid,gid}).orderBy("id");
	}
	
	async getUserWarning(wid) {
		if(!wid) return new Error("missing parameter");
		var j = await this.r.table("warnings").get(wid);
		if(!j) return new Error("ERR_NOT_FOUND");
		return j;
	}

	async deleteUserWarning(wid) {
		if(!wid) return new Error("missing parameter");
		var j = await this.r.table("warnings").get(wid);
		if(!j) return new Error("ERR_NOT_FOUND");
		var a = await j.delete();
		return Boolean(a.deleted);
	}

	async clearUserWarnings(uid,gid=null) {
		if(!uid) return new Error("missing parameter");
		var filter = gid !== null ? {uid,gid} : {uid};
		var j = await this.r.table("warnings").filter(filter);
		if(j.length === 0) return new Error("ERR_NOT_FOUND");
		var a = await this.r.table("warnings").filter(filter).delete();
		return Boolean(a.deleted);
	}

	async addDonator(uid,level) {
		if(!uid || !level) return new Error("missing parameter");
		// level:
		// -1 = freemium
		// 1 = $2-$3
		// 2 = $5
		// 3 = $10
		return this.r.table("donors").insert({id:uid,level});
	}

	async updateDonator(uid,level) {
		if(!uid || !level) return new Error("missing parameter");
		// level:
		// -1 = freemium
		// 1 = $2-$3
		// 2 = $5
		// 3 = $10
		var a = await this.r.table("donors").get(uid).update({level});
		if(a.skipped) return this.addDonator(uid,level);
		return true;
	}

	async removeDonor(uid) {
		if(!uid) return new Error("missing parameter");
		await this.r.table("donors").get(uid).delete();
		return true;
	}

	async isDonor(uid) {
		if(!uid) return new Error("missing parameter");
		var a = await this.r.table("donors").get(uid);
		if(!a) return false;
		return true;
	}

	async addBlacklistedUser(uid,reason) {
		if(!uid || !reason) return new Error("missing parameter");
		await this.r.table("blacklist").insert({id:uid,reason,type:"user"});
		return true;
	}

	async updateBlacklistedUser(uid,reason) {
		if(!uid || !reason) return new Error("missing parameter");
		var a = await this.r.table("blacklist").get(uid).update({reason});
		if(a.skipped) return this.addBlacklistedUser(uid,reason);
		return true;
	}

	async removeBlacklistedUser(uid) {
		if(!uid) return new Error("missing parameter");
		await this.r.table("donors").get(uid).delete();
		return true;
	}

	async addBlacklistedGuild(gid,reason) {
		if(!gid || !reason) return new Error("missing parameter");
		await this.r.table("blacklist").insert({id:gid,reason,type:"guild"});
		return true;
	}

	async updateBlacklistedGuild(gid,reason) {
		if(!gid || !reason) return new Error("missing parameter");
		var a = await this.r.table("blacklist").get(uid).update({reason});
		if(a.skipped) return this.addBlacklistedGuild(gid,reason);
		return true;
	}

	async removeBlacklistedGuild(gid) {
		if(!gid) return new Error("missing parameter");
		await this.r.table("donors").get(gid).delete();
		return true;
	}

	async isBlacklisted(id) {
		if(!id) return new Error("missing parameter");
		var a = await this.r.table("blacklist").get(id);
		if(!a) return false;
		return true;
	}



	async getStats(type) {
		var types = ["f","fcount","commands","general"];
		if(![undefined,null,""].includes(type)) {
			if(!types.includes(type.toLowerCase())) return new Error("invalid type");
			switch(type.toLowerCase()) {
				case "fcount":
				case "f":
					return (await this.r.table("stats").get("fCount")).count;
					break;

				case "commands":
					return this.r.table("stats").get("commands");
					break;

				case "general":
					return this.r.table("stats").get("general");
					break;
			}
		} else {
			var fCount = (await this.r.table("stats").get("fCount")).count;
			var commands = await this.r.table("stats").get("commands");
			var general = await this.r.table("stats").get("general");
			return {fCount,commands,general};
		}
	}

	async incrementCommandStats(command,amount=1) {
		if(!command) return new Error("missing paramter");
		var a = await this.r.table("stats").get("commands");
		if(!a) var a = await this.r.table("stats").insert({id:"commands"});
		if(!a[command]) {
			await this.r.table("stats").get("commands").update({[command]:amount});
			return amount;
		} else {
			await this.r.table("stats").get("commands").update({[command]:+a[command]+amount});
			return +a[command]+amount;
		}
	}

	async createUser(uid,gid,bypassChecks=false) {
		if(!uid) return new Error("missing paramter");
		uid = uid.toString();
		if(![undefined,null,""].includes(gid)) {
			if(!this.client.guilds.has(gid) && !bypassChecks) {
				this.logger.warn(`[createUser]: Attempted to create a user for a guild that the bot is not in.`);
				return new Error("invalid guild");
				return;
			}
			if(!this.client.guilds.get(gid).members.has(uid) && !bypassChecks) {
				this.logger.warn(`[createUser]: Attempted to create a user for a guild that the user is not in.`);
				return new Error("invalid user");
				return;
			}
			if(!(await this.r.table("guilds").get(gid))) await this.createGuild(gid);
			await this.r.table("users").insert(Object.assign({id:uid},this.config.userDefaultConfig));
			//await this.updateGuild(gid,{economy:{users:{[uid]:this.config.economyUserDefaultConfig}}});
			//this.logger.log(`Added user "${uid}" to economy and users tables with default configuration, gid: ${gid}`);
			this.logger.log(`Added user "${uid}" to users tables with default configuration`);
			return Object.assign(await this.r.table("users").get(uid),/*(await this.r.table("economy").get(gid)).users[uid]*/{});
		} else {
			await this.r.table("users").insert(Object.assign({id:uid},this.config.userDefaultConfig));
			return this.r.table("users").get(uid);
		}
	}

	async getUser(uid,gid,bypassChecks) {
		if(!uid) return new Error("missing paramter");
		uid = uid.toString();
		if(![undefined,null,""].includes(gid)) {
			//if(!(await this.r.table("guilds").get(gid)) || !(await this.r.table("economy").get(gid))) await this.createGuild(gid,bypassChecks);
			var user = await this.r.table("users").get(uid);
			if(!user) var user = await this.createUser(uid,gid,bypassChecks);
			/*var economy = await this.r.table("economy").get(gid);
			if(!economy) var economy = (await this.createGuild(gid,bypassChecks)).economy; 
			if(!economy.users[uid]) {
				await this.createUser(uid,gid,bypassChecks);
				var economy = (await this.createGuild(gid,bypassChecks)).economy; 
			}*/
			delete user.id;
			return Object.assign(user,/*economy.users[uid]*/{});
		} else {
			var user = await this.r.table("users").get(uid);
			if(!user) var user = await this.createUser(uid,gid,bypassChecks);
			return user;
		}
	}

	async deleteUser(uid,gid) {
		if(!uid) return new Error("missing paramter");
		uid = uid.toString();
		if(![undefined,null,""].includes(gid)) {
			//if(!(await this.r.table("guilds").get(gid)) || !(await this.r.table("economy").get(gid))) return new Error("guild not found");
			var user = await this.r.table("users").get(uid).delete();
			//var economy = await this.r.table("economy").get(gid).replace(this.r.row.without({users:{[uid]:true}}));
			return {user:user.deleted===1/*,economy:economy.replaced===1*/};
		} else {
			var user = await this.r.table("users").get(uid).delete();
			return {user:user.deleted===1};
		}
	}

	async updateUser(uid,gid,fields,bypassChecks) {
		if(!uid || !fields || fields.length === 0) return new Error("missing parameter");
		if(!fields.user && !fields.economy) {
			await this.r.table("users").get(uid).update(fields.user);
			return this.getUser(uid,null,bypassChecks);
		} else {
			if(![undefined,null,""].includes(gid)) {
				if(!this.client.guilds.has(gid) && !bypassChecks) {
					this.logger.warn(`[createUser]: Attempted to create a user for a guild that the bot is not in.`);
					return new Error("invalid guild");
					return;
				}
				if(!this.client.guilds.get(gid).members.has(uid) && !bypassChecks) {
					this.logger.warn(`[createUser]: Attempted to create a user for a guild that the user is not in.`);
					return new Error("invalid user");
					return;
				}
				var a = await this.r.table("users").get(uid);
				//var b = await this.r.table("economy").get(gid);
				if(!a/* || !b*/) await this.createUser(uid,gid,bypassChecks);
				if(fields.user !== undefined) await this.r.table("users").get(uid).update(fields.user);
				//if(fields.economy !== undefined) await this.r.table("economy").get(gid).update({users:{[uid]:fields.economy}});
				return this.getUser(uid,gid,bypassChecks);
			} else {
				var a = await this.r.table("users").get(uid);
				if(!a) await this.createUser(uid,gid,bypassChecks);
				if(fields.user !== undefined) await this.r.table("users").get(uid).update(fields.user);
				return this.getUser(uid,null,bypassChecks);
			}
		}
	}
}

module.exports = FurryBotDatabase;