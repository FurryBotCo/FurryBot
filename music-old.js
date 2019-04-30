class FurryBot {
	constructor() {

	}

	/* eslint-disable no-unreachable */

	/**
	 * get song from lavalink
	 * @async
	 * @deprecated not working with Eris
	 * @param {String} str - identifier
	 * @returns {Object}
	 * @throws {Error}
	 */
	async getSong (str) {
		throw new Error("not usable"); 
		const res = await this.request(`http://${this.config.restnode.host}:${this.config.restnode.port}/loadtracks`,{
			qs: {
				identifier: str
			},
			headers: {
				Authorization: this.config.restnode.password
			}
		}).catch(err => {
			this.logger.error(err);
			return null;
		});
		if (!res) throw new Error("There was an error, try again");
		if (res.body.length === 0) throw new Error("No tracks found");
		return JSON.parse(res.body);
	}

	/**
	 * search for a song using lavalink
	 * @async
	 * @deprecated not working with Eris
	 * @param {String} strSearch - search query
	 * @param {String} [platform="youtube"] - search platform
	 * @returns {Promise<Object>}
	 * @throws {Error}
	 */
	async songSearch (strSearch,platform = "youtube") {
		throw new Error("not usable");
		return new Promise(async(resolve,reject) => {
			if(!strSearch) reject(new Error("Missing parameters"));
			switch(platform) {
			case "youtube":
				var res = await this.request(`http://${this.config.lavalink.host}:${this.config.lavalink.port}/loadtracks?identifier=ytsearch:${strSearch}`,{
					method: "GET",
					headers: {
						Authorization: this.config.lavalink.secret
					}
				});
				resolve(JSON.parse(res.body));
				break;
				
			default:
				reject(new Error("Invalid platform"));
			}
		});
	}

	/**
	 * make the bot join a voice channel
	 * @deprecated not working with Eris
	 * @param {Eris.Channel}
	 * @throws {Error}
	 */
	async joinChannel(channel) {
		throw new Error("not usable");
		if(this.voiceConnections.filter(g => g.channel.guild.id === channel.guild.id).size < 1) {
			return channel.join().catch((err) => {
				return err;
			}).then(async(ch) => {
				return ch;
			});
		} else {
			return this.voiceConnections.filter(g => g.channel.guild.id === channel.guild.id).first();
		}
	}

	//client.voiceConnections.filter(g => g.channel.guild.id===message.guild.id).first().dispatcher.streamTime

	/**
	 * play a song in a voice channel
	 * @async
	 * @deprecated not working with Eris
	 * @param {Eris.Channel} channel - channel to play in
	 * @param {String} song - song to play
	 * @param {String} [platform="youtube"] - platform
	 * @throws {Error}
	 */
	async playSong (channel, song, platform = "youtube") {
		throw new Error("not usable");
		if(!channel || !(channel instanceof this.Discord.VoiceChannel)) return new Error("Missing/invalid channel");
		if(!song) return new Error("Missing song");
	
		let queue, user, data, embed, a, chn, ch, player;
		ch = await this.joinChannel(channel);
		switch(platform) {
		case "youtube":
			//try {
			player = ch.play(this.ytdl(song.uri, { quality: "highestaudio" }));
			await this.mdb.collection("guilds").findOneAndUpdate({id: channel.guild.id},{
				$set: {
					"music.playing": true
				}
			});
			player.once("finish",async() => {
				this.logger.log("finished");
				queue = await this.mdb.collection("guilds").findOne({id: channel.guild.id}).then(res => res.music.queue);
				queue.shift();
				if(queue.length >= 1) {
					this.playSong(channel,queue[0]);
					await this.mdb.collection("guilds").findOneAndUpdate({id: channel.guild.id},{
						$set: {
							"music.queue": queue,
							"music.playing": true
						}
					});
					user = this.users.has(queue[0].addedBy) ? this.users.get(queue[0].addedBy) : await this.users.fetch(queue[0].addedBy);
					data = {
						title: "Now Playing",
						description: `**${queue[0].title}** by *${queue[0].author}* is now playing in ${channel.name}`,
						color: 2424780,
						timestamp: new Date().toISOString(),
						footer: {
							icon_url: user.displayAvatarURL(),
							text: `Added by ${user.username}#${user.discriminator}`
						}
					};
					embed = new this.Discord.MessageEmbed(data);
					a = await this.mdb.collection("guilds").findOne({id: channel.guild.id});
					if(a.music.textChannel !== null) {
						chn = this.channels.get(a.music.textChannel);
						if(!chn || !(chn instanceof this.Discord.TextChannel)) chn = null;
					}
					if(chn !== null && chn instanceof this.Discord.TextChannel) {
						chn.send(embed);
					}
				} else {
					await this.mdb.collection("guilds").findOneAndUpdate({id: channel.guild.id},{
						$set: {
							"music.playing": false
						}
					});
					data = {
						"title": "Queue Empty",
						"description": `The queue for ${channel.name} is now empty.`,
						"color": 2424780,
						"timestamp": new Date().toISOString()
					};
					embed = new this.Discord.MessageEmbed(data);
					a = await this.mdb.collection("guilds").findOne({id: channel.guild.id});
					if(a.music.textChannel !== null) {
						chn = this.channels.get(a.music.textChannel);
						if(!chn || !(chn instanceof this.Discord.TextChannel)) chn = null;
					}
					if(chn !== null && chn instanceof this.Discord.TextChannel) {
						chn.send(embed);
					}
					await this.mdb.collection("guilds").findOneAndUpdate({id: channel.guild.id},{
						$set: {
							"music.queue": []
						}
					});
					channel.leave();
				}
			});
			return player;
			/*}catch(err){
					this.logger.error(err);
					channel.leave();
					//ch.disconnect();
					return err;
				}*/
			break; // eslint-disable-line no-unreachable

		default:
			return new Error("invalid platform");
		}
	}

	/**
	 * menu to chose a song
	 * @async
	 * @deprecated not working with Eris
	 * @param {Number} pageNumber - song menu page number
	 * @param {Number} pageCount - page count
	 * @param {Object[]} songs - list of songs
	 * @param {Eris.Message} msg - message that triggered the menu
	 * @param {Eris.Message} ma - multiple songs message
	 * @param {Eris.Message} mb - other message
	 * @throws {Error}
	 */
	async songMenu (pageNumber,pageCount,songs,msg,ma,mb) {
		throw new Error("not usable");
		return new Promise(async(resolve,reject) => {
			if(!pageNumber || !pageCount || !songs || !msg) reject(new Error("missing parameters."));
			let mid, res, resultCount, s, song;
			if(typeof ma !== "undefined" && typeof mb !== "undefined") {
				ma.edit(`Multiple songs found, please specify the number you would like to play\n\n${songs.list[pageNumber-1].join("\n")}\n\nPage ${pageNumber}/${pageCount}\nTotal: **${songs.tracks.length}**`);
			} else {
				mid = await msg.channel.send(`Multiple songs found, please specify the number you would like to play\n\n${songs.list[pageNumber-1].join("\n")}\n\nPage ${pageNumber}/${pageCount}\nTotal: **${songs.tracks.length}**`);
				ma = mid;
				mb = msg;
			}
			ma.channel.awaitMessages(m => m.author.id === mb.author.id,{max:1,time: 1e4,errors:["time"]}).then(async(m) => {
				res = songs.list[pageNumber];
				resultCount = songs.list.length;
				s = m.first().content.split(" ");
				if(s[0] === "cancel") throw new Error("CANCEL");
				if(s[0] === "page") {
					if(pageNumber === s[1]) {
						m.first().reply("You are already on that page.");
						resolve(this.songMenu(pageNumber,pageCount,songs,msg,ma,mb));
					}
					if(pageCount - s[1] < 0) {
						m.first().reply("Invalid page!");
						resolve(this.songMenu(pageNumber,pageCount,songs,m,ma,mb));
					}  else {
						resolve(this.songMenu(s[1],pageCount,songs,m,ma,mb));
					}
				} else {
					if(resultCount.length < s[0]) {
						m.first().reply("Invalid Selection!");
						resolve(this.songMenu(pageNumber,pageCount,songs,m,ma,mb));
					} else {
						song = songs.tracks[pageNumber * 10 - Math.abs(s[0]-10) - 1];
						resolve({song,msg:ma});
					}
				}
			}).catch(resolve);
		});
	}

	/* eslint-enable no-unreachable */
}