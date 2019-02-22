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
		let a;
		gid = gid.toString();
		if(!this.client.guilds.has(gid) && !disableCheck) {
			this.logger.warn("[createGuild]: Attempted to add guild that the bot is not in");
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
		a = await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.guilds).findOne({id: gid});
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
				totalEntries: await this.client.mdb.collection("guilds").stats().then(res => res.count)
			}
		});
		await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.guilds).insertOne(Object.assign({id:gid},this.config.default.guildConfig));
		return this.getGuild(gid);
	}

	async getGuild(gid) {
		if(!gid) return new TypeError("ERR_MISSING_PARAM");
		gid = gid.toString();
		let a = await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.guilds).findOne({id: gid});
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
				totalEntries: await this.client.mdb.collection("guilds").stats().then(res => res.count)
			}
		});
		return a.id === gid ? a : new Error("ERR_INVALID_GUILD_RETURN");
	}

	async deleteGuild(gid) {
		if(!gid) return new TypeError("ERR_MISSING_PARAM");
		gid = gid.toString();
		let a, b;
		a = await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.guilds).findOne({id: gid});
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
					totalEntries: await this.client.mdb.collection("guilds").stats().then(res => res.count)
				}
			});
			return false;
		} 
		b = await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.guilds).deleteOne({id: gid});
		if(typeof b.deletedCount !== "undefined" && b.deletedCount > 0) {
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
					totalEntries: await this.client.mdb.collection("guilds").stats().then(res => res.count)
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
					totalEntries: await this.client.mdb.collection("guilds").stats().then(res => res.count)
				}
			});
			return new Error("ERR_DEL_GUILD_UNKNOWN");
		}
	}

	async updateGuild(gid,fields) {
		if(!gid || !fields) return new TypeError("ERR_MISSING_PARAM");
		gid = gid.toString();
		let a;
		a = await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.guilds).findOne({id: gid});
		if(!a) {
			await this.createGuild(gid);
			a = await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.guilds).findOne({id: gid});
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
				totalEntries: await this.client.mdb.collection("guilds").stats().then(res => res.count)
			}
		});
		await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.guilds).findOneAndUpdate({id: gid},{$set: fields});
		return this.getGuild(gid);
	}

	async resetGuild(gid,bypassChecks) {
		gid = gid.toString();
		let a = await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.guilds).findOne({id: gid});
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
		let g = [],
			g2 = [];
		this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.guilds).then(j => j.map(g => g.id)).then((a) => {
			a.forEach((b) => {
				if(b.match(".{17,18}")) g.push(b);
			});
		});
		g.forEach((guild) => {
			if(!this.client.guilds.includes(guild)) {
				g2.push(guild);
				this.logger.warn(`Found guild "${guild}" in "guilds" table, which the bot is not in`);
				if(del) this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.guilds).deleteOne({id: guild}).then((r) => {
					if(r.deletedCount !== 1) this.logger.error(`[sweepGuilds]: Failed deleting guild "${guild}"`);
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
		uid = uid.toString(),
		gid = gid.toString();
		let wid;
		if(!bypassChecks) {
			if(!this.client.guilds.has(gid)) {
				this.logger.warn("[createUserWarning]: Attempted to add warning to a guild that the bot is not in");
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
				this.logger.warn("[createUserWarning]: Attempted to add warning to a member that is not in the guild");
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
		if(!(await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.guilds).findOne({id: gid}))) await this.createGuild(gid);
		if(!(await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.users).findOne({id: uid}))) await this.createUser(uid);
		wid = (await this.getUserWarnings(uid,gid)).length+1;
		if(isNaN(wid)) wid = 1;
		await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.users).findOneAndUpdate({id: uid},{$push: {warnings: {wid,blame,reason,timestamp:Date.now(),gid}}});
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
		uid = uid.toString(),
		gid = gid.toString();
		let b;
		if(!(await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.users).findOne({id: uid}))) await this.createUser(uid);
		b = await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.users).findOne({id: uid});
		if(!b) {
			await this.createUser(uid);
			b = await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.users).findOne({id: uid});
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
		return b.warnings.sort((s,g) => s.id < g.id ? -1 : s.id > g.id ? 1 : 0);
	}
	
	async getUserWarning(uid,gid,wid) {
		if(!uid || !gid || !wid) return new TypeError("ERR_MISSING_PARAM");
		uid = uid.toString(),
		gid = gid.toString(),
		wid = parseInt(wid,10);
		let b;
		b = await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.users).findOne({id: uid});
		if(!b) {
			await this.createUser(uid);
			b = await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.users).find({id: uid});
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
		return b.warnings.filter(w => w.wid === wid && w.gid === gid)[0]||false;
	}

	async deleteUserWarning(uid,gid,wid) {
		if(!uid || !wid || !gid) return new TypeError("ERR_MISSING_PARAM");
		uid = uid.toString(),
		gid = gid.toString(),
		wid = parseInt(wid,10);
		if(!(await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.guilds).findOne({id: gid}))) await this.createGuild(gid);
		if(!(await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.users).findOne({id: uid}))) await this.createUser(uid);
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
		return this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.users).findOneAndUpdate({id: uid},{$pull: {warnings: {wid,gid}}}).then(res => res.ok);
	}

	async clearUserWarnings(uid,gid) {
		if(!uid || !gid) return new TypeError("ERR_MISSING_PARAM");
		uid = uid.toString(),
		gid = gid.toString();
		if(!(await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.guilds).findOne({id: gid}))) await this.createGuild(gid);
		if(!(await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.users).findOne({id: uid}))) await this.createUser(uid);
		this.analytics.track({
			userId: "DB",
			event: "db.clearUserWarnings",
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
		return this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.users).findOneAndUpdate({id: uid},{$pull: {warnings: {gid}}}).then(res => res.ok);
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
		if(!(await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.users).findOne({id: uid}))) await this.createUser(uid);
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
		return this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.users).findOneAndUpdate({id: uid},{$set: {donator:true,level}}).then(res => res.ok);
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
		if(!(await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.users).findOne({id: uid}))) await this.createUser(uid);
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
		return this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.users).findOneAndUpdate({id: uid},{$set: {donator:true,level}}).then(res => res.ok);
	}

	async removeDonator(uid) {
		if(!uid) return new TypeError("ERR_MISSING_PARAM");
		uid = uid.toString();
		if(!(await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.users).findOne({id: uid}))) await this.createUser(uid);
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
		return this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.users).findOneAndUpdate({id: uid},{$set: {donator:false,level:0}}).then(res => res.ok);
	}

	async isDonator(uid) {
		if(!uid) return new TypeError("ERR_MISSING_PARAM");
		uid = uid.toString();
		let b = await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.users).findOne({id: uid});
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
		var table = ["guild"].includes(type) ? this.config.db.collections.guilds : this.config.db.collections.users,
			c = await this.client.mongo.db(this.config.db.main.db).collection(table).findOne({id});
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
		return this.client.mongo.db(this.config.db.main.db).collection(table).findOneAndUpdate({id},{$set: {blacklisted:true,blacklistReason:reason}}).then(res => res.ok);
	}

	async updateBlacklistEntry(id,type = "user",reason = "None Specified") {
		if(!id || !type || !reason) return new TypeError("ERR_MISSING_PARAM");
		if(!["guild","user"].includes(type)) return new Error("ERR_INVALID_TYPE");
		id = id.toString();
		let table = ["guild"].includes(type) ? this.config.db.collections.guilds : this.config.db.collections.users,
			c = await this.client.mongo.db(this.config.db.main.db).collection(table).findOne({id});
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
		return this.client.mongo.db(this.config.db.main.db).collection(table).findOneAndUpdate({id},{$set: {blacklisted:true,blacklistReason:reason}}).then(res => res.ok);
	}

	async removeBlacklistEntry(id,type = "user") {
		if(!id || !type) return new TypeError("ERR_MISSING_PARAM");
		if(!["guild","user"].includes(type)) return new Error("ERR_INVALID_TYPE");
		id = id.toString();
		let table = ["guild"].includes(type) ? this.config.db.collections.guilds : this.config.db.collections.users,
			c = await this.client.mongo.db(this.config.db.main.db).collection(table).findOne({id});
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
		return this.client.mongo.db(this.config.db.main.db).collection(table).findOneAndUpdate({id},{$set: {blacklisted: false},$unset: {blacklistReason: ""}}).then(res => res.ok);
	}

	async isBlacklisted(id) {
		if(!id) return new TypeError("ERR_MISSING_PARAM");
		id = id.toString();
		let a = await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.guilds).findOne({id}),
			b = await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.users).findOne({id});
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
				return this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.stats).findOne({id: "fCount"}).then(res => res.count);
				break; // eslint-disable-line no-unreachable

			case "commands":
				return this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.stats).findOne({id: "commands"});
				break; // eslint-disable-line no-unreachable

			case "general":
				return this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.stats).findOne({id: "general"});
				break; // eslint-disable-line no-unreachable

			case "dailyjoins":
				return await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.daily).then(res => res.map(day => ({[day.id]:day.count}))).reduce((a,b) => {a[Object.keys(b)[0]] = Object.values(b)[0];return a;},{});
				break; // eslint-disable-line no-unreachable
					
			case "messagecount":
				return this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.stats).findOne({id: "messageCount"}).then(res => res.count);
				break; // eslint-disable-line no-unreachable
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
				fCount: await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.stats).findOne({id: "fCount"}).then(res => res.count),
				commands: await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.stats).findOne({id: "commands"}),
				general: await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.stats).findOne({id: "general"}),
				dailyjoins: await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.daily).map(day => ({[day.id]:day.count})),
				messageCount: await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.stats).findOne({id: "messageCount"}).then(res => res.count)
			};
		}
	}

	async incrementCommandStats(command,amount=1) {
		if(!command) return new TypeError("ERR_MISSING_PARAM");
		let a = await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.stats).findOne({id: "commands"});
		if(!a) a = await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.stats).insertOne({id:"commands"});
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
			await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.stats).findOneAndUpdate({id: "commands"},{$set:{ [command]:amount}});
			return amount;
		} else {
			await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.stats).findOneAndUpdate({id: "commands"},{$set: {[command]:+a[command]+amount}});
			return +a[command]+amount;
		}
	}

	async updateDailyCount(negative = false, amount = 1) {
		let d = new Date(),
			date = `${d.getMonth().toString().length > 1 ? d.getMonth()+1 : `0${d.getMonth()+1}`}-${d.getDate().toString().length > 1 ? d.getDate() : `0${d.getDate()}`}-${d.getFullYear()}`,
			j = await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.daily).findOne({id: date});
		if(!j) j = await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.daily).insertOne({id:date,count:0}).then(s => this.client.mongo.db(this.config.db.main.db).collection("dailyjoins").findOne({id: date}));
		negative ? await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.daily).findOneAndUpdate({id: date},{$set: {count: +j.count-amount}}) : await this.client.mongo.db(this.config.db.main.db).collection("dailyjoins").findOneAndUpdate({id: date},{$set:{count:+j.count+amount}});
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
		return this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.daily).findOne({id: date}).then(res => res.count);
	}

	async createUser(uid, bypassChecks = false) {
		if(!uid) return new TypeError("ERR_MISSING_PARAM");
		uid = uid.toString();
		if(!bypassChecks) {
			let u = true/*this.client.users.has(uid)*//*||this.client.users.fetch(uid).then(u => true).catch(u => false)*/;
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
		if((await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.users).findOne({id: uid})) !== null) return this.getUser(uid);
		await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.users).insertOne(Object.assign({id:uid},this.config.default.userConfig));
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
		if(!(await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.users).findOne({id: uid}))) return this.createUser(uid);
		return this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.users).findOne({id: uid});
	}

	async deleteUser(uid) {
		if(!uid) return new TypeError("ERR_MISSING_PARAM");
		uid = uid.toString();
		if(!(await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.users).findOne({id: uid}))) return false;
		return this.client.mongo.db(this.config.db.main.db).collection("users").deleteOne({id: uid}).then(res => res.deletedCount >= 1);
	}

	async updateUser(uid,fields) {
		if(!uid || !fields) return new TypeError("ERR_MISSING_PARAM");
		uid = uid.toString();
		if((await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.users).findOne({id: uid})) !== null) await this.createUser(uid);
		await this.client.mongo.db(this.config.db.main.db).collection(this.config.db.collections.users).findOneAndUpdate({id: uid},{$set: fields});
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
