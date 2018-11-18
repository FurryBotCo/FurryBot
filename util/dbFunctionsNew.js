const config = require("../config");
const Discord = require("discord.js");

class FurryBotDatabase {
	constructor(client) {
		if(!client) throw new Error("missing client");
		this.client = client;
		this.config = config;
		this.uuid = require("uuid/v4");
		this.r = !this.client.r ? require("rethinkdbdash")(this.config.db) : this.client.r;
		this.logger = new (require(`${this.config.rootDir}/util/LoggerV3.js`))(this.client);
	}
	
	async createGuild(gid,disableCheck=false){
		return new Promise(async(resolve,reject)=>{
			if(!gid) reject(new Error("missing gid parameter"));
			if(!this.client.guilds.has(gid) && !disableCheck) {
				this.logger.warn(`[createGuild]: Attempted to add guild that the bot is not in`);
				reject(new Error("ERR_NOT_FOUND"));
			}
			this.logger.info(`[createGuild]: Added guild "${gid}" with default configuration`);
			var gConfig = {id: gid};
			var eConfig = {id: gid};
			Object.assign(gConfig,this.config.guildDefaultConfig);
			Object.assign(eConfig,this.config.economyDefaultConfig);
			await this.r.table("guilds").insert(gConfig);
			await this.r.table("economy").insert(eConfig);
			resolve(this.getGuild(gid));
		});
	}

	async getGuild(gid) {
		return new Promise(async(resolve,reject)=>{
			if(!gid) reject(new Error("missing parameter"));
			var a = await this.r.table("guilds").get(gid);
			var b = await this.r.table("economy").get(gid);
			if(!a || !b) resolve(this.createGuild(gid));
			resolve({guild:a,economy:b});
		});
	}

	async deleteGuild(gid) {
		return new Promise(async(resolve,reject)=>{
			if(!gid) reject(new Error("missing parameter"));
			var a = await this.r.table("guilds").get(gid);
			var b = await this.r.table("economy").get(gid);
			if(a !== null) await this.r.table("guilds").get(gid).delete();
			if(b !== null) await this.r.table("economy").get(gid).delete();
			this.logger.info(`[deleteGuild]: Deleted guild "${gid}".`);
			resolve({guild:a!==null,economy:b!==null});
		});
	}

	async updateGuild(gid,fields) {
		return new Promise(async(resolve,reject)=>{
			if(!gid || !fields || fields.length === 0) reject(new Error("missing parameter"));
			if(!fields.guild && !fields.economy) reject(new Error("invalid fields"));
			var a = await this.r.table("guilds").get(gid);
			var b = await this.r.table("economy").get(gid);
			if(!a || !b) await this.createGuild(gid);
			if(fields.guild !== undefined) {
				await this.r.table("guilds").get(gid).update(fields.guild);
			}
			if(fields.economy !== undefined) {
				await this.r.table("economy").get(gid).update(fields.economy);
			}
			resolve(this.getGuild(gid));
		});
	}

	async sweepGuilds(del=false) {
		return new Promise(async(resolve,reject)=>{
			if(![undefined,null].includes(this.client.shard)) {
				var j = await self.shard.fetchClientValues("guilds");
				var guilds = [];
				j.forEach((gj)=>gj.forEach((g)=>guilds.push(g.id)));
			}
			var g = {
				guild: await this.r.table("guilds"),
				economy: await this.r.table("economy")
			},
			g2 = {
				guild: [],
				economy: []
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
			g.economy.forEach((economy)=>{
				if(!guilds.includes(economy.id)) {
					g2.economy.push(economy.id);
					this.logger.warn(`Found guild "${economy.id}" in "economy" table, which the bot is not in`);
					if(del) this.r.table("economy").get(economy.id).delete().then((r)=>{
						if(r.deleted !== 1) this.logger.error(`[sweepGuilds]: Failed deleting guild "${economy.id}"`);
						this.logger.info(`[sweepGuilds]: deleted guild "${economy.id}"`);
					});
				}
			});
			if(del) {
				this.logger.warn(`Purged ${g2.guild.length} guild${g2.guild.length!==1?"s":""} in "guilds" table that were not in the bot`);
				this.logger.warn(`Purged ${g2.economy.length} guild${g2.economy.length!==1?"s":""} in "economy" table that were not in the bot`);
			} else {
				this.logger.warn(`Found ${g2.guild.length} guild${g2.guild.length!==1?"s":""} in "guilds" table that were not in the bot`);
				this.logger.warn(`Found ${g2.economy.length} guild${g2.economy.length!==1?"s":""} in "economy" table that were not in the bot`);
			}
			resolve(g2);
		});
	}

	async createUserWarning(uid,gid,reason,bypassChecks=false) {
		return new Promise(async(resolve,reject)=>{
			if(!uid || !gid || !reason) reject(new Error("missing parameter"));
			if(!bypassChecks) {
				if(!this.client.guilds.has(gid)) {
					this.logger.warn(`[createUserWarning]: Attempted to add warning to a guild that the bot is not in`);
					reject(new Error("ERR_NOT_FOUND"));
				}
				if(!this.client.guilds.get(gid).members.has(uid)) {
					this.logger.warn(`[createUserWarning]: Attempted to add warning to a member that is not in the guild`);
					reject(new Error("ERR_NOT_FOUND"));
				}
			}
			var id = this.uuid();
			await this.r.table("warnings").insert({id,gid,uid,reason,time:Date.now()});
			resolve(this.r.table("warnings").get(id));
		})
	}

	async getUserWarning(wid) {
		return new Promise(async(resolve,reject)=>{
			if(!wid) reject(new Error("missing parameter"));
			var j = await this.r.table("warnings").get(wid);
			if(!j) reject(new Error("ERR_NOT_FOUND"));
			resolve(j);
		})
	}

	async deleteUserWarning(wid) {
		return new Promise(async(resolve,reject)=>{
			if(!wid) reject(new Error("missing parameter"));
			var j = await this.r.table("warnings").get(wid);
			if(!j) reject(new Error("ERR_NOT_FOUND"));
			var a = await j.delete();
			return Boolean(a.deleted);
		})
	}

	async clearUserWarnings(uid,gid=null) {
		return new Promise(async(resolve,reject)=>{
			if(!uid) reject(new Error("missing parameter"));
			var filter = gid !== null ? {uid,gid} : {uid};
			var j = await this.r.table("warnings").filter(filter);
			if(j.length === 0) reject(new Error("ERR_NOT_FOUND"));
			var a = await this.r.table("warnings").filter(filter).delete();
			resolve(a.deleted);
		})
	}

	async addDonator(uid,level) {
		return new Promise(async(resolve,reject)=>{
			if(!uid || !level) reject(new Error("missing parameter"));
			// level:
			// -1 = freemium
			// 1 = $2-$3
			// 2 = $5
			// 3 = $10
			resolve(this.r.table("donors").insert({id:uid,level}));
		})
	}

	async updateDonator(uid,level) {
		return new Promise(async(resolve,reject)=>{
			if(!uid || !level) reject(new Error("missing parameter"));
			// level:
			// -1 = freemium
			// 1 = $2-$3
			// 2 = $5
			// 3 = $10
			var a = await this.r.table("donors").get(uid).update({level});
			if(a.skipped) resolve(this.addDonator(uid,level));
			resolve(true);
		})
	}

	async removeDonor(uid) {
		return new Promise(async(resolve,reject)=>{
			if(!uid) reject(new Error("missing parameter"));
			await this.r.table("donors").get(uid).delete();
			resolve(true);
		})
	}

	async isDonor(uid) {
		return new Promise(async(resolve,reject)=>{
			if(!uid) reject(new Error("missing parameter"));
			var a = await this.r.table("donors").get(uid);
			if(!a) resolve(false);
			resolve(true);
		})
	}

	async addBlacklistedUser(uid,reason) {
		return new Promise(async(resolve,reject)=>{
			if(!uid || !reason) reject(new Error("missing parameter"));
			await this.r.table("blacklist").insert({id:uid,reason,type:"user"});
			resolve(true);
		})
	}

	async updateBlacklistedUser(uid,reason) {
		return new Promise(async(resolve,reject)=>{
			if(!uid || !reason) reject(new Error("missing parameter"));
			var a = await this.r.table("blacklist").get(uid).update({reason});
			if(a.skipped) resolve(this.addBlacklistedUser(uid,reason));
			resolve(true);
		})
	}

	async removeBlacklistedUser(uid) {
		return new Promise(async(resolve,reject)=>{
			if(!uid) reject(new Error("missing parameter"));
			await this.r.table("donors").get(uid).delete();
			resolve(true);
		})
	}

	async addBlacklistedGuild(gid,reason) {
		return new Promise(async(resolve,reject)=>{
			if(!gid || !reason) reject(new Error("missing parameter"));
			await this.r.table("blacklist").insert({id:gid,reason,type:"guild"});
			resolve(true);
		})
	}

	async updateBlacklistedGuild(gid,reason) {
		return new Promise(async(resolve,reject)=>{
			if(!gid || !reason) reject(new Error("missing parameter"));
			var a = await this.r.table("blacklist").get(uid).update({reason});
			if(a.skipped) resolve(this.addBlacklistedGuild(gid,reason));
			resolve(true);
		})
	}

	async removeBlacklistedGuild(gid) {
		return new Promise(async(resolve,reject)=>{
			if(!gid) reject(new Error("missing parameter"));
			await this.r.table("donors").get(gid).delete();
			resolve(true);
		})
	}

	async isBlacklisted(id) {
		return new Promise(async(resolve,reject)=>{
			if(!id) reject(new Error("missing parameter"));
			var a = await this.r.table("blacklist").get(id);
			if(!a) resolve(false);
			resolve(true);
		})
	}



	async getStats(type) {
		return new Promise(async(resolve,reject)=>{
			var types = ["fcount","commands","general","shards"];
			if(type !== "" && !types.includes(type.toLowerCase())) reject(new Error("invalid type"));
			var fCount = (await this.r.table("stats").get("fCount")).count;
			var commands = await this.r.table("stats").get("commands");
			var shardsUnsorted = (await this.r.table("stats").get("general")).shards;
			var general = await this.r.table("stats").get("general").without("shards");
			var shards = {};
			for(let key of Object.keys(shardsUnsorted[0])) shards[key]=0;
			shardsUnsorted.forEach((shard)=>{for(let key in shard) shards[key]+=shard[key]});
			shards.shardCount = shardsUnsorted.length;
			resolve({fCount,commands,general,shards});
		})
	}

	async updateCommandStats(command) {
		return new Promise((resolve,reject)=>{
			if(!command) reject(new Error("missing paramter"));
			
		})
	}
}

// gid: 329498711338123268
// uid: 242843345402069002

const client = new Discord.Client({disableEveryone:true});
client.login(config.bot.token);
client.on("ready",async()=>{
	var a = new FurryBotDatabase(client);
	var b = await a.getStats();
});

