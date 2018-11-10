module.exports = ((self)=>{
	if(!self) return new Error("missing self");
	return {
		createGuild: (async(gid)=>{
			if(typeof self === "undefined") {
				self.log(`[dbFunctions.js:createGuild] Could not validate guild existnce`);
				return new Error("ERR_CANNOT_VALIDATE");
			}
			if(!self.guilds.has(gid)) {
				self.log(`[dbFunctions.js:createGuild] Attempted to add guild to database that was not in bot, ${gid}`);
				return new Error("ERR_NOT_FOUND");
			}
			self.log(`Added guild ${gid} with default configuration.`);
			var gConf = {id: gid};
			Object.assign(gConf, self.config.guildDefaultConfig);
			await self.r.table("guilds").insert(gConf);
			return self.db.getGuild(gid);
		}),
		deleteGuild: (async(gid)=>{
			var guild = await self.r.table("guilds").get(gid);
			if(!guild) {
				self.log(`[dbFunctions.js:deleteGuild] Attempted to delete aguild from the database that was not present, ${gid}`);
				return new Error("ERR_NOT_FOUND");
			}
			self.log(`Deleted guild ${gid}`);
			return self.r.table("guilds").get(gid).delete();
		}),
		getGuild: (async(gid)=>{
			var guild = await self.r.table("guilds").get(gid);
			if(!guild) return self.db.createGuild(gid);
			
			return guild;
		}),
		updateGuild: (async(gid, fields)=>{
			return self.r.table("guilds").get(gid).update(fields);
		}),
		addWarning: (async(gid,uid,reason)=>{
			if(typeof self === "undefined") {
				self.log(`[dbFunctions.js:createGuild] Could not validate guild existence`);
				return new Error("ERR_CANNOT_VALIDATE");
			}
			if(!self.guilds.has(guid)) {
				self.log(`[dbFunctions.js:addWarning] Attempted to add warning to database for a guild that the bot is not in, ${gid}`);
				return new Error("GUILD_NOT_FOUND");
			}
			return self.r.table("warnings").insert({gid,uid,reason});
		}),
		deleteWarning: (async(gid,wid)=>{
			if(typeof self === "undefined") {
				self.log(`[dbFunctions.js:createGuild] Could not validate guild existence`);
				return new Error("ERR_CANNOT_VALIDATE");
			}
			if(!self.guilds.has(gid)) {
				self.log(`[dbFunctions.js:addWarning] Attempted to delete a warning for a guild that the bot is not in, ${gid}`);
				return new Error("ERR_NOT_FOUND");
			}
			var warn = await self.r.table("warnings").get(wid);

			if(!warn) {
				self.log(`[dbFunctions.js:deleteWarning] Attempted to delete a warning that does not exist.`);
				return new Error("ERR_NOT_FOUND");
			}

			if(warn.guildid !== gid) {
				self.log(`[dbFunctions.js:deleteWarning] Attempted to delete a warning for a different guild. ${gid}/${warn.guildid}`);
				return new Error("ERR_UNAUTHORIZED");
			}

			return self.r.table("warnings").get(wid).delete();
		}),
		purgeUserWarnings: (async(gid,uid)=>{
			if(typeof self === "undefined") {
				self.log(`[dbFunctions.js:createGuild] Could not validate guild existence`);
				return new Error("ERR_CANNOT_VALIDATE");
			}
			if(!self.guilds.has(gid)) {
				self.log(`[dbFunctions.js:addWarning] Attempted to delete a warning for a guild that the bot is not in, ${gid}`);
				return new Error("ERR_NOT_FOUND");
			}

			if(self.r.table("warnings").filter({gid,uid}).count().eq(0)) return 0;
			var tmp = await self.r.table("warnings").filter({gid,uid}).forEach((warning) => {
				return self.r.table("warnings").get(warning("id")).delete();
			});
			return tmp.deleted;
		}),
		addBlock: (async(uid,reason = "None provided")=>{
			return self.r.table("blocked").insert({id:uid,reason});
		}),
		isBlocked: (async(id)=>{
			return Boolean(await self.r.table("blocked").get(id));
		}),
		addDonor: (async(uid,amount)=>{
			return self.r.table("donors").insert({id:uid,amount},{conflict:"update"});
		}),
		removeDonor: (async(uid)=>{
			var donor = self.r.table("donors").get(uid);

			if(!donor) {
				self.log(`[dbFunctions.js:removeDonor] Attempted to delete a donor does not exist.`);
				return new Error("ERR_NOT_FOUND");
			}

			return self.r.table("donors").get(uid).delete();
		}),
		isDonor: (async(uid)=>{
			var res = await self.r.table("donors").get(uid);
			return res ? res.amount : false;
		}),
		getStats: (async(type="general")=>{
			switch(type.toLowerCase()) {
				case "general":
					var rs = await self.r.table("stats").get("generalStats")
					var res = {
						channelCount: 0,
						commandCount: 0,
						guildCount: 0,
						messageCount: 0,
						shardCount: 0,
						userCount: 0
					};
					rs.shards.forEach((rr)=>{
						res.channelCount+=rself.r.channelCount;
						res.commandCount+=rself.r.commandCount;
						res.guildCount+=rself.r.guildCount;
						res.messageCount+=rself.r.messageCount;
						res.userCount+=rself.r.userCount;
						if(res.shardId === 0) {
							rself.r.shardCount = res.shardCount;
						}
					});
					return res;
					break;
				
				case "command":
					var res = await self.r.table("stats").get("commandStats")
					return res.total;
					break;

				case "missingpermissions":
				case "missingperms":
					return await self.r.table("stats").get("missingPermissions");
					break;

				case "fcount":
				case "f":
					var res = await self.r.table("stats").get("fCount");
					return res.count;
					break;

				default:
					return new Error("ERR_INVALID_TYPE");
			}
		}),
		getFCount: (async()=>{
			return self.db.getStats("f");
		}),
		increaseFCount: (async(i=1)=>{
			var res = self.db.getStats("f");
			if(i !== 1) {
				var rs = res+=i;
			} else {
				var rs = res++;
			}
			return await self.r.table("stats").get("fCount").update({count: rs});
		}),
		createUser: (async(uid)=>{
			self.log(`Created user ${uid} with default settings.`);
			var uConf = {id: uid};
			Object.assign(uConf, self.config.userDefaultConfig);
			await self.r.table("users").insert(uConf);
			return self.db.getUser(uid);
		}),
		deleteUser: (async(uid)=>{
			var user = await self.r.table("users").get(uid);
			if(!user) {
				self.log(`[dbFunctions.js:deleteUser] Attempted to delete a user from the database that was not present, ${uid}`);
				return new Error("ERR_NOT_FOUND");
			}
			self.log(`Deleted user ${uid}`);
			return self.r.table("users").get(uid).delete();
		}),
		getUser: (async(uid)=>{
			var user = await self.r.table("users").get(uid);
			if(!user) return self.db.createUser(uid);
			
			return user;
		}),
		updateUser: (async(uid, fields)=>{
			return self.r.table("users").get(uid).update(fields);
		})
	};
});