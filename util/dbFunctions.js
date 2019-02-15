class FurryBotDatabase {
	constructor(client) {
		if(!client) throw new Error("missing client");
		this.client = client;
		this.config = this.client.config;
		this.uuid = require("uuid/v4");
		this.analytics = this.client.analytics;
		//this.client.r = !this.client.r ? require("rethinkdbdash")(this.config.db.main) : this.client.r;
		this.logger = this.client.logger;
	}
	
	async createGuild(gid,disableCheck=false){
		if(!gid) return new Error("missing gid parameter");
		gid = gid.toString();
		if(!this.client.guilds.has(gid) && !disableCheck) {
			this.logger.warn(`[createGuild]: Attempted to add guild that the bot is not in`);
			this.analytics.track({
				userId: "DB",
				event: "errors.db.createGuild",
				properties: {
					guildId: gid,
					bot: {
						version: this.config.bot.version,
						beta: this.config.beta,
						alpha: this.config.alpha,
						server: this.client.os.hostname()
					},
					error: "ERR_INVALID_GUILD"
				}
			});
			return new Error("ERR_INVALID_GUILD");
		}
		var a = await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.guilds).get(gid);
		if(a !== null) return this.getGuild(gid);
		this.logger.info(`[createGuild]: Added guild "${gid}"`);
		this.analytics.track({
			userId: "DB",
			event: "db.createGuild",
			properties: {
				guildId: gid,
				bot: {
					version: this.config.bot.version,
					beta: this.config.beta,
					alpha: this.config.alpha,
					server: this.client.os.hostname()
				},
				disableCheck,
				totalEntries: await this.client.r.table("guilds").count()
			}
		});
		await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.guilds).insert(Object.assign({id:gid},this.config.default.guildConfig));
		return this.getGuild(gid);
	}

	async getGuild(gid) {
		if(!gid) return new TypeError("ERR_MISSING_PARAM");
		gid = gid.toString();
		var a = await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.guilds).get(gid);
		if(!a) return this.createGuild(gid);
		this.analytics.track({
			userId: "DB",
			event: "db.getGuild",
			properties: {
				guildId: gid,
				bot: {
					version: this.config.bot.version,
					beta: this.config.beta,
					alpha: this.config.alpha,
					server: this.client.os.hostname()
				},
				totalEntries: await this.client.r.table("guilds").count()
			}
		});
		return a.id === gid ? a : new Error("ERR_INVALID_GUILD_RETURN");
	}

	async deleteGuild(gid) {
		if(!gid) return new TypeError("ERR_MISSING_PARAM");
		gid = gid.toString();
		var a = await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.guilds).get(gid);
		if(!a) {
			this.logger.info(`[deleteGuild]: Attempted to delete a non-existent guild entry "${gid}"`);
			this.analytics.track({
				userId: "DB",
				event: "errors.db.deleteGuild",
				properties: {
					guildId: gid,
					bot: {
						version: this.config.bot.version,
						beta: this.config.beta,
						alpha: this.config.alpha,
						server: this.client.os.hostname()
					},
					error: "ERR_NONEXISTENT_ENTRY",
					totalEntries: await this.client.r.table("guilds").count()
				}
			});
			return false;
		} 
		var b = await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.guilds).get(gid).delete();
		if(typeof b.deleted !== "undefined" && b.deleted > 0) {
			this.logger.info(`[deleteGuild]: Deleted entry for guild "${gid}"`);
			this.analytics.track({
				userId: "DB",
				event: "db.deleteGuild",
				properties: {
					guildId: gid,
					bot: {
						version: this.config.bot.version,
						beta: this.config.beta,
						alpha: this.config.alpha,
						server: this.client.os.hostname()
					},
					totalEntries: await this.client.r.table("guilds").count()
				}
			});
			return true;
		} else {
			this.analytics.track({
				userId: "DB",
				event: "errors.db.deleteGuild",
				properties: {
					guildId: gid,
					bot: {
						version: this.config.bot.version,
						beta: this.config.beta,
						alpha: this.config.alpha,
						server: this.client.os.hostname()
					},
					error: "ERR_UNKNOWN",
					totalEntries: await this.client.r.table("guilds").count()
				}
			});
			return new Error("ERR_DEL_GUILD_UNKNOWN");
		}
	}

	async updateGuild(gid,fields) {
		if(!gid || !fields) return new TypeError("ERR_MISSING_PARAM");
		gid = gid.toString();
		var a = await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.guilds).get(gid);
		if(!a) {
			await this.createGuild(gid);
			var a = await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.guilds).get(gid);
		}
		this.analytics.track({
			userId: "DB",
			event: "db.updateGuild",
			properties: {
				guildId: gid,
				fields,
				bot: {
					version: this.config.bot.version,
					beta: this.config.beta,
					alpha: this.config.alpha,
					server: this.client.os.hostname()
				},
				totalEntries: await this.client.r.table("guilds").count()
			}
		});
		await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.guilds).get(gid).update(fields);
		return this.getGuild(gid);
	}

	async resetGuild(gid,bypassChecks) {
		var a = await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.guilds).get(gid);
		if(!a) return false;
  	await this.deleteGuild(gid);
		await this.createGuild(gid,bypassChecks);
		this.analytics.track({
			userId: "DB",
			event: "db.resetGuild",
			properties: {
				guildId: gid,
				bot: {
					version: this.config.bot.version,
					beta: this.config.beta,
					alpha: this.config.alpha,
					server: this.client.os.hostname()
				},
				bypassChecks
			}
		});
		return true;
	}
	
	async sweepGuilds(del=false) {
		var j = this.client.guilds;
		var g = [];
		this.client.r.db(this.config.db.main.db).table(this.config.db.tables.guilds).then(j=>j.map(g=>g.id)).then((a) => {
			a.forEach((b)=>{
				if(b.match(".{17,18}")) g.push(b);
			})
		})
		var g2 = [];
		g.forEach((guild)=>{
			if(!this.client.guilds.includes(guild)) {
				g2.push(guild);
				this.logger.warn(`Found guild "${guild}" in "guilds" table, which the bot is not in`);
				if(del) this.client.r.db(this.config.db.main.db).table(this.config.db.tables.guilds).get(guild).delete().then((r)=>{
					if(r.deleted !== 1) this.logger.error(`[sweepGuilds]: Failed deleting guild "${guild}"`);
					this.logger.info(`[sweepGuilds]: deleted guild "${guild}"`);
				});
			}
		});

		if(del) {
			this.analytics.track({
				userId: "DB",
				event: "db.sweepGuilds",
				properties: {
					delete: true,
					count: g2.length,
					bot: {
						version: this.config.bot.version,
						beta: this.config.beta,
						alpha: this.config.alpha,
						server: this.client.os.hostname()
					}
				}
			});
			this.logger.warn(`Purged ${g2.length} guild${g2.length!==1?"s":""} in "guilds" table that were not in the bot`);
		} else {
			this.analytics.track({
				userId: "DB",
				event: "db.sweepGuilds",
				properties: {
					delete: false,
					count: g2.length,
					bot: {
						version: this.config.bot.version,
						beta: this.config.beta,
						alpha: this.config.alpha,
						server: this.client.os.hostname()
					}
				}
			});
			this.logger.warn(`Found ${g2.length} guild${g2.length!==1?"s":""} in "guilds" table that were not in the bot`);
		}
		return g2;
	}

	async createUserWarning(uid,gid,blame,reason,bypassChecks=false) {
		if(!uid || !gid || !blame || !reason) return new TypeError("ERR_MISSING_PARAM");
		uid = uid.toString();
		gid = gid.toString();
		if(!bypassChecks) {
			if(!this.client.guilds.has(gid)) {
				this.logger.warn(`[createUserWarning]: Attempted to add warning to a guild that the bot is not in`);
				this.analytics.track({
					userId: "DB",
					event: "errors.db.createUserWarning",
					properties: {
						guildId: gid,
						userId: uid,
						warningId: wid,
						blame,
						reason,
						bot: {
							version: this.config.bot.version,
							beta: this.config.beta,
							alpha: this.config.alpha,
							server: this.client.os.hostname()
						},
						error: "ERR_INVALID_GUILD"
					}
				});
				return new Error("ERR_INVALID_GUILD");
			}
			if(!this.client.guilds.get(gid).members.has(uid)) {
				this.logger.warn(`[createUserWarning]: Attempted to add warning to a member that is not in the guild`);
				this.analytics.track({
					userId: "DB",
					event: "errors.db.createUserWarning",
					properties: {
						guildId: gid,
						userId: uid,
						warningId: wid,
						blame,
						reason,
						bot: {
							version: this.config.bot.version,
							beta: this.config.beta,
							alpha: this.config.alpha,
							server: this.client.os.hostname()
						},
						error: "ERR_INVALID_USER"
					}
				});
				return new Error("ERR_INVALID_USER");
			}
		}
		if(!(await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.guilds).get(gid))) await this.createGuild(gid);
		if(!(await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.users).get(uid))) await this.createUser(uid);
		var wid = (await this.getUserWarnings(uid,gid)).length+1;
		if(isNaN(wid)) wid = 1;
		await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.users).get(uid).update({warnings:this.client.r.row("warnings").append({wid,blame,reason,timestamp:Date.now(),gid})});
		this.analytics.track({
			userId: "DB",
			event: "db.createUserWarning",
			properties: {
				guildId: gid,
				userId: uid,
				warningId: wid,
				blame,
				reason,
				bot: {
					version: this.config.bot.version,
					beta: this.config.beta,
					alpha: this.config.alpha,
					server: this.client.os.hostname()
				}
			}
		});
		return this.getUserWarning(uid,gid,wid);
	}

	async getUserWarnings(uid,gid) {
		if(!uid || !gid) return new TypeError("ERR_MISSING_PARAM");
		uid = uid.toString();
		gid = gid.toString();
		if(!(await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.users).get(uid))) await this.createUser(uid);
		var b = await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.users).get(uid);
		if(!b) {
			await this.createUser(uid);
			var b = await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.users).get(uid);
		}
		this.analytics.track({
			userId: "DB",
			event: "db.getUserWarnings",
			properties: {
				guildId: gid,
				userId: uid,
				bot: {
					version: this.config.bot.version,
					beta: this.config.beta,
					alpha: this.config.alpha,
					server: this.client.os.hostname()
				}
			}
		});
		return b.warnings.sort((s,g)=>s.id < g.id ? -1 : s.id > g.id ? 1 : 0);
	}
	
	async getUserWarning(uid,gid,wid) {
		if(!uid || !gid || !wid) return new TypeError("ERR_MISSING_PARAM");
		uid = uid.toString();
		gid = gid.toString();
		wid = parseInt(wid,10);
		var b = await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.users).get(uid);
		if(!b) {
			await this.createUser(uid);
			var b = await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.users).get(uid);
		}
		this.analytics.track({
			userId: "DB",
			event: "db.getUserWarning",
			properties: {
				guildId: gid,
				userId: uid,
				warningId: wid,
				bot: {
					version: this.config.bot.version,
					beta: this.config.beta,
					alpha: this.config.alpha,
					server: this.client.os.hostname()
				}
			}
		});
		return b.warnings.filter(w=>w.wid===wid&&w.gid===gid)[0]||false;
	}

	async deleteUserWarning(uid,gid,wid) {
		if(!uid || !wid || !gid) return new TypeError("ERR_MISSING_PARAM");
		uid = uid.toString();
		gid = gid.toString();
		wid = parseInt(wid,10);
		if(!(await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.guilds).get(gid))) await this.createGuild(gid);
		if(!(await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.users).get(uid))) await this.createUser(uid);
		this.analytics.track({
			userId: "DB",
			event: "db.deleteUserWarning",
			properties: {
				guildId: gid,
				userId: uid,
				warnId: wid,
				bot: {
					version: this.config.bot.version,
					beta: this.config.beta,
					alpha: this.config.alpha,
					server: this.client.os.hostname()
				}
			}
		});
		return (await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.users).get(uid).update((u)=>{
			return {"warnings": u('warnings').filter((item)=>this.client.r.and(item("wid").eq(wid),item("gid").eq(gid)).not())}
		})).replaced>=1;
	}

	async clearUserWarnings(uid,gid) {
		if(!uid || !gid) return new TypeError("ERR_MISSING_PARAM");
		uid = uid.toString();
		gid = gid.toString();
		if(!(await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.guilds).get(gid))) await this.createGuild(gid);
		if(!(await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.users).get(uid))) await this.createUser(uid);
		var j = await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.users).get(uid).update((row)=>{
			return {
			warnings: row("warnings").filter((item)=>item("gid").ne(gid))
			}
		});
		this.analytics.track({
			userId: "DB",
			event: "db.clearUserWarnings",
			properties: {
				guildId: gid,
				userId: uid,
				count: j.replaced,
				bot: {
					version: this.config.bot.version,
					beta: this.config.beta,
					alpha: this.config.alpha,
					server: this.client.os.hostname()
				}
			}
		});
		return j.replaced >= 1;
	}

	async addDonator(uid,level) {
		if(!uid || !level) return new TypeError("ERR_MISSING_PARAM");
		uid = uid.toString();
		// level:
		// -1 = freemium
		// 0 = none
		// 1 = $2-$3
		// 2 = $5
		// 3 = $10
		if(!(await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.users).get(uid))) await this.createUser(uid);
		this.analytics.track({
			userId: "DB",
			event: "db.addDonator",
			properties: {
				userId: uid,
				level,
				bot: {
					version: this.config.bot.version,
					beta: this.config.beta,
					alpha: this.config.alpha,
					server: this.client.os.hostname()
				}
			}
		});
		return (await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.users).get(uid).update({donator:true,level})).replaced >= 1;
	}

	async updateDonator(uid,level) {
		if(!uid || !level) return new TypeError("ERR_MISSING_PARAM");
		uid = uid.toString();
		// level:
		// -1 = freemium
		// 0 = none
		// 1 = $2-$3
		// 2 = $5
		// 3 = $10
		if(!(await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.users).get(uid))) await this.createUser(uid);
		this.analytics.track({
			userId: "DB",
			event: "db.updateDonator",
			properties: {
				userId: uid,
				level,
				bot: {
					version: this.config.bot.version,
					beta: this.config.beta,
					alpha: this.config.alpha,
					server: this.client.os.hostname()
				}
			}
		});
		return (await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.users).get(uid).update({donator:true,level})).replaced >= 1;
	}

	async removeDonator(uid) {
		if(!uid) return new TypeError("ERR_MISSING_PARAM");
		uid = uid.toString();
		if(!(await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.users).get(uid))) await this.createUser(uid);
		this.analytics.track({
			userId: "DB",
			event: "db.removeDonator",
			properties: {
				userId: uid,
				bot: {
					version: this.config.bot.version,
					beta: this.config.beta,
					alpha: this.config.alpha,
					server: this.client.os.hostname()
				}
			}
		});
		return (await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.users).get(uid).update({donator:false,level:0})).replaced >= 1;
	}

	async isDonator(uid) {
		if(!uid) return new TypeError("ERR_MISSING_PARAM");
		uid = uid.toString();
		var b = await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.users).get(uid);
		this.analytics.track({
			userId: "DB",
			event: "db.isDonator",
			properties: {
				userId: uid,
				result: b !== null ? b.donator : false,
				bot: {
					version: this.config.bot.version,
					beta: this.config.beta,
					alpha: this.config.alpha,
					server: this.client.os.hostname()
				}
			}
		});
		if(!b) {
			await this.createUser(uid);
			return false;
		}
		return b.donator;
	}

	async addBlacklistEntry(id,type = "user",reason = "None Specified") {
		if(!id || !type || !reason) return new TypeError("ERR_MISSING_PARAM");
		if(!["guild","user"].includes(type)) return new Error("ERR_INVALID_TYPE");
		id = id.toString();
		var table = ["guild"].includes(type) ? this.config.db.tables.guilds : this.config.db.tables.users; 
		var c = await this.client.r.db(this.config.db.main.db).table(table).get(id);
		if(!c) await this[`create${this.client.ucwords(type)}`](id);
		this.analytics.track({
			userId: "DB",
			event: "db.addBlacklistEntry",
			properties: {
				id,
				type,
				reason,
				bot: {
					version: this.config.bot.version,
					beta: this.config.beta,
					alpha: this.config.alpha,
					server: this.client.os.hostname()
				}
			}
		});
		return (await this.client.r.db(this.config.db.main.db).table(table).get(id).update({blacklisted:true,blacklistReason:reason})).replaced >= 1;
	}

	async updateBlacklistEntry(id,type = "user",reason = "None Specified") {
		if(!id || !type || !reason) return new TypeError("ERR_MISSING_PARAM");
		if(!["guild","user"].includes(type)) return new Error("ERR_INVALID_TYPE");
		id = id.toString();
		var table = ["guild"].includes(type) ? this.config.db.tables.guilds : this.config.db.tables.users; 
		var c = await this.client.r.db(this.config.db.main.db).table(table).get(id);
		if(!c) await this[`create${this.client.ucwords(type)}`](id);
		this.analytics.track({
			userId: "DB",
			event: "db.updateBlacklistEntry",
			properties: {
				id,
				type,
				reason,
				bot: {
					version: this.config.bot.version,
					beta: this.config.beta,
					alpha: this.config.alpha,
					server: this.client.os.hostname()
				}
			}
		});
		return (await this.client.r.db(this.config.db.main.db).table(table).get(id).update({blacklisted:true,blacklistReason:reason})).replaced >= 1;
	}

	async removeBlacklistEntry(id,type = "user") {
		if(!id || !type) return new TypeError("ERR_MISSING_PARAM");
		if(!["guild","user"].includes(type)) return new Error("ERR_INVALID_TYPE");
		id = id.toString();
		var table = ["guild"].includes(type) ? this.config.db.tables.guilds : this.config.db.tables.users; 
		var c = await this.client.r.db(this.config.db.main.db).table(table).get(id);
		if(!c) await this[`create${this.client.ucwords(type)}`](id);
		this.analytics.track({
			userId: "DB",
			event: "db.removeBlacklistEntry",
			properties: {
				id,
				type,
				bot: {
					version: this.config.bot.version,
					beta: this.config.beta,
					alpha: this.config.alpha,
					server: this.client.os.hostname()
				}
			}
		});
		return (await this.client.r.db(this.config.db.main.db).table(table).get(id.replace(r.row.without("blacklisted","blacklistReason").merge({blacklisted:false})))).replaced >= 1;
	}

	async isBlacklisted(id) {
		if(!id) return new TypeError("ERR_MISSING_PARAM");
		id = id.toString();
		var a = await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.guilds).get(id);
		var b = await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.users).get(id);
		this.analytics.track({
			userId: "DB",
			event: "db.isBlacklisted",
			properties: {
				id,
				result: a !== null ? a.blacklisted ? {blacklisted: true, reason: a.blacklistReason,  type: "guild"} : {blacklisted: false, reason: null, type: "guild"} : b !== null ? b.blacklisted ? {blacklisted: true, reason: b.blacklistReason, type: "user"} : {blacklisted: false, reason: null, type: "user"} : false,
				bot: {
					version: this.config.bot.version,
					beta: this.config.beta,
					alpha: this.config.alpha,
					server: this.client.os.hostname()
				}
			}
		});
		if(a !== null) return a.blacklisted ? {blacklisted: true, reason: a.blacklistReason,  type: "guild"} : {blacklisted: false, reason: null, type: "guild"};
		else if(b !== null) return b.blacklisted ? {blacklisted: true, reason: b.blacklistReason, type: "user"} : {blacklisted: false, reason: null, type: "user"};
		else return false;
	}

	async getStats(type) {
		var types = ["f","fcount","commands","general","dailyjoins"];
		if(![undefined,null,""].includes(type)) {
			if(!types.includes(type.toLowerCase())) return new Error("ERR_INVALID_TYPE");
			this.analytics.track({
				userId: "DB",
				event: "db.getStats",
				properties: {
					type,
					bot: {
						version: this.config.bot.version,
						beta: this.config.beta,
						alpha: this.config.alpha,
						server: this.client.os.hostname()
					}
				}
			});
			switch(type.toLowerCase()) {
				case "fcount":
				case "f":
					return (await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.stats).get("fCount")).count;
					break;

				case "commands":
					return this.client.r.db(this.config.db.main.db).table(this.config.db.tables.stats).get("commands");
					break;

				case "general":
					return this.client.r.db(this.config.db.main.db).table(this.config.db.tables.stats).get("general");
					break;

				case "dailyjoins":
					return await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.daily).then(res=>res.map(day=>({[day.id]:day.count}))).reduce((a,b)=>{a[Object.keys(b)[0]] = Object.values(b)[0];return a},{});
					break;
					
				case "messagecount":
					return (await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.stats).get("messageCount")).count;
					break;
			}
		} else {
			this.analytics.track({
				userId: "DB",
				event: "db.getStats",
				properties: {
					type: "all",
					bot: {
						version: this.config.bot.version,
						beta: this.config.beta,
						alpha: this.config.alpha,
						server: this.client.os.hostname()
					}
				}
			});
			return {
				fCount: (await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.stats).get("fCount")).count,
				commands: await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.stats).get("commands"),
				general: await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.stats).get("general"),
				dailyjoins: (await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.daily)).map(day=>({[day.id]:day.count})),
				messageCount: (await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.stats).get("messageCount")).count
			};
		}
	}

	async incrementCommandStats(command,amount=1) {
		if(!command) return new TypeError("ERR_MISSING_PARAM");
		var a = await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.stats).get("commands");
		if(!a) var a = await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.stats).insert({id:"commands"});
		this.analytics.track({
			userId: "DB",
			event: "db.incrementCommandStats",
			properties: {
				command,
				amount: !a[command] ? amount : +a[command]+amount,
				bot: {
					version: this.config.bot.version,
					beta: this.config.beta,
					alpha: this.config.alpha,
					server: this.client.os.hostname()
				}
			}
		});
		if(!a[command]) {
			await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.stats).get("commands").update({[command]:amount});
			return amount;
		} else {
			await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.stats).get("commands").update({[command]:+a[command]+amount});
			return +a[command]+amount;
		}
	}

	async updateDailyCount(negative = false, amount = 1) {
		var d = new Date();
        var date = `${d.getMonth().toString().length > 1 ? d.getMonth()+1 : `0${d.getMonth()+1}`}-${d.getDate().toString().length > 1 ? d.getDate() : `0${d.getDate()}`}-${d.getFullYear()}`;
            
		var j = await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.daily).get(date);
		if(!j) var j = await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.daily).insert({id:date,count:0}).then(s=>this.client.r.db(this.config.db.main.db).table("dailyjoins").get(date));
		var res = negative ? await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.daily).get(date).update({count:+j.count-amount}) : await this.client.r.db(this.config.db.main.db).table("dailyjoins").get(date).update({count:+j.count+amount});
		this.analytics.track({
			userId: "DB",
			event: "db.updateDailyCounts",
			properties: {
				amount: negative ? `-${amount}` : `+${amount}`,
				date,
				bot: {
					version: this.config.bot.version,
					beta: this.config.beta,
					alpha: this.config.alpha,
					server: this.client.os.hostname()
				}
			}
		});
		return (await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.daily).get(date)).count;
	}

	async createUser(uid,bypassChecks=false) {
		if(!uid) return new TypeError("ERR_MISSING_PARAM");
		uid = uid.toString();
		if(!bypassChecks) {
			var u = true/*this.client.users.has(uid)*//*||this.client.users.fetch(uid).then(u=>true).catch(u=>false)*/;
			if(!u) {
				this.logger.info(`[createUser]: Attempted to create an entry for a user that was not found "${uid}"`);
				this.analytics.track({
					userId: "DB",
					event: "errors.db.createUser",
					properties: {
						userId: uid,
						bot: {
							version: this.config.bot.version,
							beta: this.config.beta,
							alpha: this.config.alpha,
							server: this.client.os.hostname()
						},
						error: "ERR_INVALID_USER"
					}
				});
				return new Error("ERR_INVALID_USER");
			}
		}
		this.analytics.track({
			userId: "DB",
			event: "db.createUser",
			properties: {
				userId: uid,
				bot: {
					version: this.config.bot.version,
					beta: this.config.beta,
					alpha: this.config.alpha,
					server: this.client.os.hostname()
				}
			}
		});
		if((await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.users).get(uid)) !== null) return this.getUser(uid,gid);
		await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.users).insert(Object.assign({id:uid},this.config.default.userConfig));
		this.logger.info(`[createUser]: Added user "${uid}" with default configuration`);
		return this.getUser(uid);
	}

	async getUser(uid) {
		if(!uid) return new TypeError("ERR_MISSING_PARAM");
		uid = uid.toString();
		this.analytics.track({
			userId: "DB",
			event: "db.getUser",
			properties: {
				userId: uid,
				bot: {
					version: this.config.bot.version,
					beta: this.config.beta,
					alpha: this.config.alpha,
					server: this.client.os.hostname()
				}
			}
		});
		if(!(await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.users).get(uid)) !== null) return this.createUser(uid);
		return this.client.r.db(this.config.db.main.db).table(this.config.db.tables.users).get(uid);
	}

	async deleteUser(uid) {
		if(!uid) return new TypeError("ERR_MISSING_PARAM");
		uid = uid.toString();
		if(!(await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.users).get(uid)) !== null) return false;
		return (await this.client.r.db(this.config.db.main.db).table("users").get(uid).delete()).deleted>=1;
	}

	async updateUser(uid,fields) {
		if(!uid || !fields) return new TypeError("ERR_MISSING_PARAM");
		uid = uid.toString();
		if((await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.users).get(uid)) !== null) await this.createUser(uid);
		await this.client.r.db(this.config.db.main.db).table(this.config.db.tables.users).get(uid).update(fields);
		this.analytics.track({
			userId: "DB",
			event: "db.updateUser",
			properties: {
				userId: uid,
				fields,
				bot: {
					version: this.config.bot.version,
					beta: this.config.beta,
					alpha: this.config.alpha,
					server: this.client.os.hostname()
				}
			}
		});
		return this.getUser(uid);
	}
}

module.exports = FurryBotDatabase;
