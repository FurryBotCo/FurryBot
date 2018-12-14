class FurryBotDatabase {
	constructor(client) {
		if(!client) throw new Error("missing client");
		this.client = client;
		this.config = this.client.config;
		this.uuid = require("uuid/v4");
		this.r = !this.client.r ? require("rethinkdbdash")(this.config.db.bot) : this.client.r;
		this.logger = new (require(`${this.config.rootDir}/util/LoggerV3.js`))(this.client);
    this.dbConfig = {
        dbs: {
			main: "furrybot",
			other: "discord_bot"
        },
        tables: {
            guilds: "guilds",
            users: "users"
        }
    }
	}
	
	async createGuild(gid,disableCheck=false){
		if(!gid) return new Error("missing gid parameter");
		gid = gid.toString();
		if(!this.client.guilds.has(gid) && !disableCheck) {
			this.logger.warn(`[createGuild]: Attempted to add guild that the bot is not in`);
			return new Error("ERR_INVALID_GUILD");
		}
		if((await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.guilds).then(j=>j.map(g=>g.id))).includes(gid)) return this.getGuild(gid);
		this.logger.info(`[createGuild]: Added guild "${gid}"`);
		await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.guilds).insert(Object.assign({id:gid},this.config.defaultGuildSettings));
		return this.getGuild(gid);
	}

	async getGuild(gid) {
		if(!gid) return new Error("ERR_MISSING_PARAM");
		gid = gid.toString();
		if(!(await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.guilds).then(j=>j.map(g=>g.id))).includes(gid)) return this.createGuild(gid);
		return this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.guilds).get(gid);
	}

	async deleteGuild(gid) {
		if(!gid) return new Error("ERR_MISSING_PARAM");
		gid = gid.toString();
		if((await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.guilds).then(j=>j.map(g=>g.id))).includes(gid)) var a = await this.r.dbDrop(gid);
		if(typeof a.deleted !== "undefined" && a.deleted > 0) {
			this.logger.info(`[deleteGuild]: Deleted entry for guild "${gid}"`);
			return true;
		} else {
			this.logger.info(`[deleteGuild]: Attempted to delete a non-existent guild entry "${gid}"`);
			return false;
		}
	}

	async updateGuild(gid,fields) {
		if(!gid || !fields) return new Error("ERR_MISSING_PARAM");
		gid = gid.toString();
		if((await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.guilds).then(j=>j.map(g=>g.id))).includes(gid)) await this.createGuild(gid);
			await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.guilds).get(gid).update(fields);
		return this.getGuild(gid);
	}

	async resetGuild(gid,bypassChecks) {
		if(!(await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.guilds).then(j=>j.map(g=>g.id))).includes(gid)) return false;
    	await this.deleteGuild(gid,bypassChecks);
		await this.createGuild(gid,bypassChecks);
		return true;
	}
	
	async sweepGuilds(del=false) {
		var j = this.client.guilds;
		var g = [];
		this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.guilds).then(j=>j.map(g=>g.id)).then((a) => {
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
		if(!uid || !gid || !blame || !reason) return new Error("ERR_MISSING_PARAM");
		uid = uid.toString();
		gid = gid.toString();
		if(!bypassChecks) {
			if(!this.client.guilds.has(gid)) {
				this.logger.warn(`[createUserWarning]: Attempted to add warning to a guild that the bot is not in`);
				return new Error("ERR_INVALID_GUILD");
			}
			if(!this.client.guilds.get(gid).members.has(uid)) {
				this.logger.warn(`[createUserWarning]: Attempted to add warning to a member that is not in the guild`);
				return new Error("ERR_INVALID_USER");
			}
		}
		if(!(await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.guilds).then(j=>j.map(g=>g.id))).includes(gid)) await this.createGuild(gid);
		if(!(await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.users).get(uid))) await this.createUser(uid,gid);
		var wid = (await this.getUserWarnings(uid,gid)).length+1;
		if(isNaN(wid)) wid = 1;
		await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.users).get(uid).update({warnings:this.r.row("warnings").append({wid,blame,reason,timestamp:Date.now(),gid})});
		return this.getUserWarning(uid,gid,wid);
	}

	async getUserWarnings(uid,gid) {
		if(!uid || !gid) return new Error("ERR_MISSING_PARAM");
		uid = uid.toString();
		gid = gid.toString();
		if(!(await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.guilds).then(j=>j.map(g=>g.id))).includes(gid)) await this.createGuild(gid);
		if(!(await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.users).get(uid))) await this.createUser(uid);
		return this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.users).get(uid)("warnings").orderBy("id");
	}
	
	async getUserWarning(uid,gid,wid) {
		if(!uid || !gid || !wid) return new Error("ERR_MISSING_PARAM");
		uid = uid.toString();
		gid = gid.toString();
		wid = parseInt(wid,10);
		if((await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.guilds).then(j=>j.map(g=>g.id))).includes(gid)) await this.createGuild(gid);
		if(!(await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.users).get(uid))) await this.createUser(uid,gid);
		var j = await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.users).get(uid)("warnings").filter({wid});
		if(j.length === 0) return new Error("ERR_NOT_FOUND");
		return j[0];
	}

	async deleteUserWarning(uid,gid,wid) {
		if(!uid || !wid || !gid) return new Error("ERR_MISSING_PARAM");
		uid = uid.toString();
		gid = gid.toString();
		wid = parseInt(wid,10);
		if((await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.guilds).then(j=>j.map(g=>g.id))).includes(gid)) await this.createGuild(gid);
		if(!(await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.users).get(uid))) await this.createUser(uid,gid);
		var j = await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.users).get(uid).update((u)=>{
			return {"warnings": u('warnings').filter((item)=>item('wid').ne(wid))}
		});
		return Boolean(j.replaced);
	}

	async clearUserWarnings(uid,gid) {
		if(!uid || !gid) return new Error("ERR_MISSING_PARAM");
		uid = uid.toString();
		gid = gid.toString();
		if(!(await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.guilds).then(j=>j.map(g=>g.id))).includes(gid)) await this.createGuild(gid);
		if(!(await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.users).get(uid))) await this.createUser(uid,gid);
		var j = await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.users).get(uid).update({warnings:[]});
		return j.replaced >= 1;
	}

	async addDonator(uid,level) {
		if(!uid || !level) return new Error("ERR_MISSING_PARAM");
		uid = uid.toString();
		// level:
		// -1 = freemium
		// 0 = none
		// 1 = $2-$3
		// 2 = $5
		// 3 = $10
		if(!(await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.users).then(j=>j.map(u=>u.id))).includes(uid)) await this.createUser(uid);
		return (await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.users).get(uid).update({donator:true,level})).replaced >= 1;
	}

	async updateDonator(uid,level) {
		if(!uid || !level) return new Error("ERR_MISSING_PARAM");
		uid = uid.toString();
		// level:
		// -1 = freemium
		// 0 = none
		// 1 = $2-$3
		// 2 = $5
		// 3 = $10
		if(!(await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.users).then(j=>j.map(u=>u.id))).includes(uid)) await this.createUser(uid);
		return (await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.users).get(uid).update({donator:true,level})).replaced >= 1;
	}

	async removeDonor(uid) {
		if(!uid) return new Error("ERR_MISSING_PARAM");
		uid = uid.toString();
		if(!(await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.users).then(j=>j.map(u=>u.id))).includes(uid)) return false;
		return (await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.users).get(uid).update({donator:false,level:0})).replaced >= 1;
	}

	async isDonor(uid) {
		if(!uid) return new Error("ERR_MISSING_PARAM");
		uid = uid.toString();
		if(!(await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.users).then(j=>j.map(u=>u.id))).includes(uid)) {
			await this.createUser(uid);
			return false;
		}
		return (await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tabless.users).get(uid)).donator;
	}

	async addBlacklistEntry(id,type = "user",reason = "None Specified") {
		if(!id || !type || !reason) return new Error("ERR_MISSING_PARAM");
		id = id.toString();
		var j = await this.r.db(this.dbConfig.dbs.main).table("blacklist").insert({id:uid,reason,type:"user"});
		var table = ["server","guild"].includes(type) ? this.dbConfig.tables.guilds : this.dbConfig.tables.users; 
		if(!(await this.r.db(this.dbConfig.dbs.main).table().then(j=>j.map(u=>u.id))).includes(id)) await this.createUser(id);
		return (await this.r.db(this.dbConfig.dbs.main).table(table).get(id).update({blacklisted:true,blacklistReason:reason})).replaced >= 1;
	}

	async updateBlacklistEntry(id,type = "user",reason = "None Specified") {
		if(!id || !type || !reason) return new Error("ERR_MISSING_PARAM");
		id = id.toString();
		var table = ["server","guild"].includes(type) ? this.dbConfig.tables.guilds : this.dbConfig.tables.users; 
		if(!(await this.r.db(this.dbConfig.dbs.main).table(table).then(j=>j.map(a=>a.id))).includes(id)) await this.createUser(id);
		return (await this.r.db(this.dbConfig.dbs.main).table(table).get(id).update({blacklisted:true,blacklistReason:reason})).replaced >= 1;
	}

	async removeBlacklistEntry(id,type = "user") {
		if(!id || !type) return new Error("ERR_MISSING_PARAM");
		id = id.toString();
		var table = ["server","guild"].includes(type) ? this.dbConfig.tables.guilds : this.dbConfig.tables.users; 
		if(!(await this.r.db(this.dbConfig.dbs.main).table(table).then(j=>j.map(a=>a.id))).includes(id) || (await this.r.db(this.dbConfig.dbs.main).table(table)).blacklisted === false) return false;
		return (await this.r.db(this.dbConfig.dbs.main).table(table).get(id.replace(r.row.without("blacklisted","blacklistReason").merge({blacklisted:false})))).replaced >= 1;
	}

	async isBlacklisted(id) {
		if(!id) return new Error("ERR_MISSING_PARAM");
		id = id.toString();
		if((await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.users).then(j=>j.map(a=>a.id))).includes(id)) {
			var j = await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.users);
			return j.blacklisted ? {blacklisted: true, reason: j.reason,type: "user"} : {blacklisted: false,reason: null,type: "user"};
		} else if((await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.guilds).then(j=>j.map(a=>a.id))).includes(id)) {
			var j = await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.guilds);
			return j.blacklisted ? {blacklisted: true, reason: j.reason,type: "guild"} : {blacklisted: false,reason: null,type: "guild"};
		} else {
			return false;
		}
	}

	async getStats(type) {
		var types = ["f","fcount","commands","general","dailyjoins"];
		if(![undefined,null,""].includes(type)) {
			if(!types.includes(type.toLowerCase())) return new Error("ER_INVALID_TYPE");
			switch(type.toLowerCase()) {
				case "fcount":
				case "f":
					return (await this.r.db(this.dbConfig.dbs.main).table("stats").get("fCount")).count;
					break;

				case "commands":
					return this.r.db(this.dbConfig.dbs.main).table("stats").get("commands");
					break;

				case "general":
					return this.r.db(this.dbConfig.dbs.main).table("stats").get("general");
					break;

				case "dailyjoins":
					return (await this.r.db(this.dbConfig.dbs.main).table("dailyjoins")).map(day=>({[day.id]:day.count}));
					break
			}
		} else {
			var fCount = (await this.r.db(this.dbConfig.dbs.main).table("stats").get("fCount")).count,
			commands = await this.r.db(this.dbConfig.dbs.main).table("stats").get("commands"),
			general = await this.r.db(this.dbConfig.dbs.main).table("stats").get("general"),
			dailyjoins = (await this.r.db(this.dbConfig.dbs.main).table("dailyjoins")).map(day=>({[day.id]:day.count}));
			return {fCount,commands,general,dailyjoins};
		}
	}

	async incrementCommandStats(command,amount=1) {
		if(!command) return new Error("ERR_MISSING_PARAM");
		var a = await this.r.db(this.dbConfig.dbs.main).table("stats").get("commands");
		if(!a) var a = await this.r.db(this.dbConfig.dbs.main).table("stats").insert({id:"commands"});
		if(!a[command]) {
			await this.r.db(this.dbConfig.dbs.main).table("stats").get("commands").update({[command]:amount});
			return amount;
		} else {
			await this.r.db(this.dbConfig.dbs.main).table("stats").get("commands").update({[command]:+a[command]+amount});
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

	async createUser(uid,bypassChecks=false) {
		if(!uid) return new Error("ERR_MISSING_PARAM");
		uid = uid.toString();
		if(!bypassChecks) {
			var u = this.client.users.fetch(uid,true).then(u=>true).catch(u=>false);
			if(!u) {
				this.logger.info(`[createUser]: Attempted to create an entry for a user that was not found "${uid}"`);
				return new Error("ERR_INVALID_USER");
			}
		}
		if((await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.users).then(j=>j.map(a=>a.id))).includes(uid)) return this.getUser(uid);
		await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.users).insert(Object.assign({id:uid},this.config.userDefaultConfig));
		this.logger.info(`[createUser]: Added user "${uid}" with default configuration`);
		return this.getUser(uid);
	}

	async getUser(uid) {
		if(!uid) return new Error("ERR_MISSING_PARAM");
		uid = uid.toString();
		if(!(await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.users).then(j=>j.map(a=>a.id))).includes(uid)) return this.createUser(uid);
		return await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.users).get(uid);
	}

	async deleteUser(uid) {
		if(!uid) return new Error("ERR_MISSING_PARAM");
		uid = uid.toString();
		if(!(await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tables.users).then(j=>j.map(a=>a.id))).includes(uid)) return false;
		return (await this.r.db(this.dbConfig.dbs.main).table("users").get(uid).delete()).deleted>=1;
	}

	async updateUser(uid,fields) {
		if(!uid || !fields) return new Error("ERR_MISSING_PARAM");
		uid = uid.toString();
		await this.r.db(this.dbConfig.dbs.main).table(this.dbConfig.tabless.users).get(uid).update(fields);
		return this.getUser(uid);
	}
}

module.exports = FurryBotDatabase;
