class FurryBotDatabase {
	constructor(client) {
		if(!client) throw new Error("missing client");
		this.client = client;
		this.config = this.client.config;
		this.uuid = require("uuid/v4");
		this.r = !this.client.r ? require("rethinkdbdash")(this.config.db.bot) : this.client.r;
		this.logger = new (require(`${this.config.rootDir}/util/LoggerV3.js`))(this.client);
		this.mdb = "furrybot";
	}
	
	async createGuild(gid,disableCheck=false){
		if(!gid) return new Error("missing gid parameter");
		gid = gid.toString();
		if(!this.client.guilds.has(gid) && !disableCheck) {
			this.logger.warn(`[createGuild]: Attempted to add guild that the bot is not in`);
			return new Error("ERR_NOT_FOUND");
		}
		this.logger.info(`[createGuild]: Added database "${gid}", and tables "users", "settings" for guild ${gid}`);
		if((await this.r.dbList()).includes(gid)) return this.getGuild(gid);
		await this.r.dbCreate(gid);
		await this.r.db(gid).tableCreate("settings");
		await this.r.db(gid).tableCreate("users");
		await this.r.db(gid).table("settings").insert(Object.assign({id:1},this.config.defaultGuildSettings));
		return this.getGuild(gid);
	}

	async getGuild(gid) {
		if(!gid) return new Error("missing parameter");
		gid = gid.toString();
		if(!(await this.r.dbList()).includes(gid) || !(await this.r.db(gid).tableList()).includes("settings")) return this.createGuild(gid);
		return this.r.db(gid).table("settings").get(1);
	}

	async deleteGuild(gid) {
		if(!gid) return new Error("missing parameter");
		gid = gid.toString();
		if((await this.r.dbList()).includes(gid)) var a = await this.r.dbDrop(gid);
		if(typeof a.dbs_dropped !== "undefined" && a.dbs_dropped > 0) {
			this.logger.info(`[deleteGuild]: Deleted database "${gid}" for guild "${gid}"`);
			return true;
		} else {
			this.logger.info(`[deleteGuild]: Attempted to delete a non-existent guild database "${gid}"`);
			return false;
		}
	}

	async updateGuild(gid,fields) {
		if(!gid || !fields || fields.length === 0) return new Error("missing parameter");
		gid = gid.toString();
		if(!(await this.r.dbList()).includes(gid) || !(await this.r.db(gid).tableList()).includes("settings")) await this.createGuild(gid);
		if(!fields.settings) {
			await this.r.db(gid).table("settings").get(1).update(fields);
		}
		if(fields.settings !== undefined) {
			await this.r.db(gid).table("settings").get(1).update(fields.settings);
		}
		return this.getGuild(gid);
	}

	async resetGuild(gid) {
		if(!(await this.r.dbList()).includes(gid)) return false;
		await this.r.dbDrop(gid);
		await this.r.dbCreate(gid);
		await this.r.db(gid).tableCreate("settings");
		await this.r.db(gid).tableCreate("users");
		await this.r.db(gid).table("settings").insert(Object.assign({id:1},this.config.defaultGuildSettings));
		return true;
	}
	
	async sweepGuilds(del=false) {
		var j = self.guilds;
		var g = [];
		this.r.dbList().then((a) => {
			a.forEach((b)=>{
				if(b.match(".{17,18}")) g.push(b);
			})
		})
		var g2 = [];
		g.forEach((guild)=>{
			if(!this.client.guilds.includes(guild)) {
				g2.push(guild);
				this.logger.warn(`Found guild "${guild}" in "guilds" table, which the bot is not in`);
				if(del) this.r.db(this.gdb).tableDrop(guild).then((r)=>{
					if(r.deleted !== 1) this.logger.error(`[sweepGuilds]: Failed deleting guild "${guild}"`);
					this.logger.info(`[sweepGuilds]: deleted guild "${guild}"`);
				});
			}
		});

		if(del) {
			this.logger.warn(`Purged ${g2.length} guild${g2.length!==1?"s":""} in "guilds" table that were not in the bot`);
		} else {
			this.logger.warn(`Found ${g2.length} guild${g2.length!==1?"s":""} in "guilds" table that were not in the bot`);
		}
		return g2;
	}

	async createUserWarning(uid,gid,blame,reason,bypassChecks=false) {
		if(!uid || !gid || !blame || !reason) return new Error("missing parameter");
		uid = uid.toString();
		gid = gid.toString();
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
		if(!(await this.r.dbList()).includes(gid) || !(await this.r.db(gid).tableList()).includes("users")) await this.createGuild(gid);
		if(!(await this.r.db(gid).table("users").get(uid))) await this.createUser(uid,gid);
		var wid = (await this.getUserWarnings(uid,gid)).length+1;
		if(isNaN(wid)) wid = 1;
		await this.r.db(gid).table("users").get(uid).update({warnings:this.r.row("warnings").append({wid,blame,reason,timestamp:Date.now()})});
		return this.getUserWarning(uid,gid,wid);
	}

	async getUserWarnings(uid,gid) {
		if(!uid || !gid) return new Error("missing parameter");
		uid = uid.toString();
		gid = gid.toString();
		if(!(await this.r.dbList()).includes(gid) || !(await this.r.db(gid).tableList()).includes("users")) await this.createGuild(gid);
		if(!(await this.r.db(gid).table("users").get(uid))) await this.createUser(uid,gid);
		return this.r.db(gid).table("users").get(uid)("warnings").orderBy("id");
	}
	
	async getUserWarning(uid,gid,wid) {
		if(!uid || !gid || !wid) return new Error("missing parameter");
		uid = uid.toString();
		gid = gid.toString();
		wid = parseInt(wid,10);
		if(!(await this.r.dbList()).includes(gid) || !(await this.r.db(gid).tableList()).includes("users")) await this.createGuild(gid);
		if(!(await this.r.db(gid).table("users").get(uid))) await this.createUser(uid,gid);
		var j = await this.r.db(gid).table("users").get(uid)("warnings").filter({wid});
		if(j.length === 0) return new Error("ERR_NOT_FOUND");
		return j[0];
	}

	async deleteUserWarning(uid,gid,wid) {
		if(!uid || !wid || !gid) return new Error("missing parameter");
		uid = uid.toString();
		gid = gid.toString();
		wid = parseInt(wid,10);
		if(!(await this.r.dbList()).includes(gid) || !(await this.r.db(gid).tableList()).includes("users")) await this.createGuild(gid);
		if(!(await this.r.db(gid).table("users").get(uid))) await this.createUser(uid,gid);
		var j = await this.r.db(gid).table("users").get(uid).update((u)=>{
			return {"warnings": u('warnings').filter((item)=>item('wid').ne(wid))}
		});
		return Boolean(j.replaced);
	}

	async clearUserWarnings(uid,gid) {
		if(!uid || !gid) return new Error("missing parameter");
		uid = uid.toString();
		gid = gid.toString();
		if(!(await this.r.dbList()).includes(gid) || !(await this.r.db(gid).tableList()).includes("users")) await this.createGuild(gid);
		if(!(await this.r.db(gid).table("users").get(uid))) await this.createUser(uid,gid);
		var j = await this.r.db(gid).table("users").get(uid).update({warnings:[]});
		return j.replaced >= 1;
	}

	async addDonator(uid,level) {
		if(!uid || !level) return new Error("missing parameter");
		uid = uid.toString();
		// level:
		// -1 = freemium
		// 1 = $2-$3
		// 2 = $5
		// 3 = $10
		return this.r.db(this.mdb).table("donors").insert({id:uid,level});
	}

	async updateDonator(uid,level) {
		if(!uid || !level) return new Error("missing parameter");
		uid = uid.toString();
		// level:
		// -1 = freemium
		// 1 = $2-$3
		// 2 = $5
		// 3 = $10
		var a = await this.r.db(this.mdb).table("donors").get(uid).update({level});
		if(a.skipped) return this.addDonator(uid,level);
		return true;
	}

	async removeDonor(uid) {
		if(!uid) return new Error("missing parameter");
		uid = uid.toString();
		await this.r.db(this.mdb).table("donors").get(uid).delete();
		return true;
	}

	async isDonor(uid) {
		if(!uid) return new Error("missing parameter");
		uid = uid.toString();
		var a = await this.r.db(this.mdb).table("donors").get(uid);
		if(!a) return false;
		return true;
	}

	async addBlacklistedUser(uid,reason) {
		if(!uid || !reason) return new Error("missing parameter");
		uid = uid.toString();
		var j = await this.r.db(this.mdb).table("blacklist").insert({id:uid,reason,type:"user"});
		return Boolean(j.inserted);
	}

	async updateBlacklistedUser(uid,reason) {
		if(!uid || !reason) return new Error("missing parameter");
		uid = uid.toString();
		var a = await this.r.db(this.mdb).table("blacklist").get(uid).update({reason});
		if(!a.replaced) return this.addBlacklistedUser(uid,reason);
		return true;
	}

	async removeBlacklistedUser(uid) {
		if(!uid) return new Error("missing parameter");
		uid = uid.toString();
		await this.r.db(this.mdb).table("donors").get(uid).delete();
		return true;
	}

	async addBlacklistedGuild(gid,reason) {
		if(!gid || !reason) return new Error("missing parameter");
		gid = gid.toString();
		await this.r.db(this.mdb).table("blacklist").insert({id:gid,reason,type:"guild"});
		return true;
	}

	async updateBlacklistedGuild(gid,reason) {
		if(!gid || !reason) return new Error("missing parameter");
		gid = gid.toString();
		var a = await this.r.db(this.mdb).table("blacklist").get(uid).update({reason});
		if(a.skipped) return this.addBlacklistedGuild(gid,reason);
		return true;
	}

	async removeBlacklistedGuild(gid) {
		if(!gid) return new Error("missing parameter");
		gid = gid.toString();
		await this.r.db(this.mdb).table("blacklist").get(gid).delete();
		return true;
	}

	async isBlacklisted(id) {
		if(!id) return new Error("missing parameter");
		id = id.toString();
		var a = await this.r.db(this.mdb).table("blacklist").get(id);
		if(!a) return false;
		return true;
	}

	async getStats(type) {
		var types = ["f","fcount","commands","general","dailyjoins"];
		if(![undefined,null,""].includes(type)) {
			if(!types.includes(type.toLowerCase())) return new Error("invalid type");
			switch(type.toLowerCase()) {
				case "fcount":
				case "f":
					return (await this.r.db(this.mdb).table("stats").get("fCount")).count;
					break;

				case "commands":
					return this.r.db(this.mdb).table("stats").get("commands");
					break;

				case "general":
					return this.r.db(this.mdb).table("stats").get("general");
					break;

				case "dailyjoins":
					return (await this.r.db(this.mdb).table("dailyjoins")).map(day=>({[day.id]:day.count}));
					break
			}
		} else {
			var fCount = (await this.r.db(this.mdb).table("stats").get("fCount")).count,
			commands = await this.r.db(this.mdb).table("stats").get("commands"),
			general = await this.r.db(this.mdb).table("stats").get("general"),
			dailyjoins = (await this.r.db(this.mdb).table("dailyjoins")).map(day=>({[day.id]:day.count}));
			return {fCount,commands,general,dailyjoins};
		}
	}

	async incrementCommandStats(command,amount=1) {
		if(!command) return new Error("missing paramter");
		var a = await this.r.db(this.mdb).table("stats").get("commands");
		if(!a) var a = await this.r.db(this.mdb).table("stats").insert({id:"commands"});
		if(!a[command]) {
			await this.r.db(this.mdb).table("stats").get("commands").update({[command]:amount});
			return amount;
		} else {
			await this.r.db(this.mdb).table("stats").get("commands").update({[command]:+a[command]+amount});
			return +a[command]+amount;
		}
	}

	async updateDailyCount(negative = false, amount = 1) {
		var d = new Date();
        var date = `${d.getMonth().toString().length > 1 ? d.getMonth()+1 : `0${d.getMonth()+1}`}-${d.getDate().toString().length > 1 ? d.getDate() : `0${d.getDate()}`}-${d.getFullYear()}`;
            
		var j = await this.r.table("dailyjoins").getAll(date);
		if(j.length < 1) var j = await this.r.table("dailyjoins").insert({id:date,count:0}).then(s=>this.r.table("dailyjoins").get(date));
		if(j[0]) j = j[0];
		var res = negative ? await this.r.table("dailyjoins").update({count:+j.count-amount}) : await this.r.table("dailyjoins").update({count:+j.count+amount});
		return (await this.r.table("dailyjoins").get(date)).count;
	}

	async createUser(uid,gid,bypassChecks=false) {
		if(!uid) return new Error("missing paramter");
		uid = uid.toString();
		gid = gid.toString();
		if(!this.client.guilds.has(gid) && !bypassChecks) {
			this.logger.warn("[createUser]: Attempted to create a user for a guild that the bot is not in.");
			return new Error("invalid guild");
		}
		if(!this.client.guilds.get(gid).members.has(uid) && !bypassChecks) {
			this.logger.warn("[createUser]: Attempted to create a user for a guild that the user is not in.");
			return new Error("invalid user");
		}
		if(!(await this.r.dbList()).includes(gid) || !(await this.r.db(gid).tableList()).includes("users")) await this.createGuild(gid);
		await this.r.db(gid).table("users").insert(Object.assign({id:uid},this.config.userDefaultConfig));
		this.logger.info(`[createUser]: Added user "${uid}" to users table in guild "${gid}" with default configuration`);
		return this.getUser(uid,gid);
	}

	async getUser(uid,gid) {
		if(!uid) return new Error("missing paramter");
		uid = uid.toString();
		gid = gid.toString();
		if(!(await this.r.dbList()).includes(gid) || !(await this.r.db(gid).tableList()).includes("users")) await this.createGuild(gid);
		if(!(await this.r.db(gid).table("users").get(uid))) return this.createUser(uid,gid);
		return this.r.db(gid).table("users").get(uid);

	}

	async deleteUser(uid,gid) {
		if(!uid) return new Error("missing paramter");
		uid = uid.toString();
		gid = gid.toString();
		if(!(await this.r.dbList()).includes(gid) || !(await this.r.db(gid).tableList()).includes("users")) await this.createGuild(gid);
		if(!(await this.r.db(gid).table("users").get(uid))) return false;
		return Boolean((await this.r.db(gid).table("users").get(uid).delete()).deleted);
	}

	async updateUser(uid,gid,fields) {
		if(!uid || !gid || !fields || fields.length === 0) return new Error("missing parameter");
		uid = uid.toString();
		gid = gid.toString();
		if(!(await this.r.dbList()).includes(gid) || !(await this.r.db(gid).tableList()).includes("users")) await this.createGuild(gid);
		if(!(await this.r.db(gid).table("users").get(uid))) await this.createUser(uid,gid);
		if(!fields.user) {
			await this.r.db(gid).table("users").get(uid).update(fields);
			return this.getUser(uid,gid,bypassChecks);
		}  else {
			if(fields.user !== undefined) await this.r.db(gid).table("users").get(uid).update(fields.user);
		}
		return this.getUser(uid,gid);
	}
}

module.exports = FurryBotDatabase;