const {
	config,
	phin,
	fs,
	functions,
	ComicImage,
	Comic
} = require("../../../../modules/CommandRequire");


async function getCategory(id = "") {
	return phin({
		method: "GET",
		url: `https://yiff.supply/ws.php?format=json&method=pwg.categories.getList&cat_id=${id}`,
		parse: "json"
	}).then(res => {
		if(res.body.stat !== "ok") throw new Error(JSON.stringify(res.body));
		return res.body.result.categories;
	});
}

async function getCategories(...ids) {
	return Promise.all(ids.map(i => getCategory(i))).then(res => res.reduce((a,b) => a.concat(b)));
}

async function getImages(id = "") {
	return phin({
		method: "GET",
		url: `https://yiff.supply/ws.php?format=json&method=pwg.categories.getImages&cat_id=${id}`,
		parse: "json"
	}).then(res => {
		if(res.body.stat !== "ok") throw new Error(JSON.stringify(res.body));
		return res.body.result.images;
	});
}

module.exports = {
	triggers: [
		"theyiffsupply",
		"tys"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks", // 16834
		"attachFiles" // 32768
	],
	cooldown: 3e3,
	description: "View comics from the yiff supply",
	usage: "<id> <start page>",
	hasSubCommands: functions.hasSubCmds(__dirname,__filename), 
	subCommands: functions.subCmds(__dirname,__filename),
	nsfw: true,
	devOnly: false,
	betaOnly: false,
	guildOwnerOnly: false,
	path: __filename,
	run: (async function(message) {
		const sub = await functions.processSub(module.exports,message,this);
		if(sub !== "NOSUB") return sub;
		const time = 5e3;

		let l, m, embed, stopTimeout, c;

		if(message.args.length === 0) return new Error("ERR_INVALID_USAGE");
		const id = parseInt(message.args[0],10);

		if(!fs.existsSync(`${config.rootDir}/tmp/comicCache-cat${id instanceof Array ? id.join("-") : id}.json`)) {
			[c] = await getCategory(id);
		
			if(!c) return message.reply(`Invalid comic id **${id}**, you can search for comics by using \`${message.prefix}comic search <term>\``);

			if(fs.existsSync(`${config.rootDir}/tmp/comicCache-cat${id instanceof Array ? id.join("-") : id}.json`)) l = require(`${config.rootDir}/tmp/comicCache-cat${id}.json`);
			else l = false;

			// 6 hours
			if(new Date(l.fetchDate).getTime() + 2.16e+7 < Date.now() || !l.results || !l.results.img || !l.results.comic) l = false;

			if(!l) {
				m = await message.channel.createMessage(`Please wait, fetching latest comic data... ${config.emojis.loading}\n(this may take several minutes)`);
				const a = await getImages(id);
				let img = a.map(i => new ComicImage(i)),
					fetchDate = new Date().toISOString();
				require("fs").writeFileSync(`${config.rootDir}/tmp/comicCache-cat${id instanceof Array ? id.join("-") : id}.json`,JSON.stringify({
					fetchDate,
					results: {
						img,
						comic: await getCategory(id).then(res => new Comic(res[0]))
					}
				}));
				l = {
					fetchDate,
					results: {
						img,
						comic: await getCategory(id).then(res => new Comic(res[0]))
					}
				};
			}
		} else {
			l = require(`${config.rootDir}/tmp/comicCache-cat${id instanceof Array ? id.join("-") : id}.json`);

			// 6 hours
			if(new Date(l.fetchDate).getTime() + 2.16e+7 < Date.now() || !l.results || !l.results.img || !l.results.comic) l = false;

			if(!l) {

				m = await message.channel.createMessage(`Please wait, fetching latest comic data... ${config.emojis.loading}\n(this may take several minutes)`);
				
				const a = await getImages(id);
				let img = a.map(i => new ComicImage(i)),
					fetchDate = new Date().toISOString();
				require("fs").writeFileSync(`${config.rootDir}/tmp/comicCache-cat${id instanceof Array ? id.join("-") : id}.json`,JSON.stringify({
					fetchDate,
					results: {
						img,
						comic: await getCategory(id).then(res => new Comic(res[0]))
					}
				}));
				l = {
					fetchDate,
					results: {
						img,
						comic: await getCategory(id).then(res => new Comic(res[0]))
					}
				};
			}

			c = l.results;
		}

		if(m) await m.delete();

		let currentPage = 1;
		if(message.args.length > 1) {
			let j = parseInt(message.args[1],10);
			if(isNaN(j) || j > l.results.length || j < 1) await message.channel.createMessage(`"${j}" is an invalid page number, starting on page one. (total: ${l.results.img.length})`);
			else currentPage = j;
		}

		const e = [
			"⏮",
			"◀",
			"⏹",
			"▶",
			"⏭"
		];

		/**
		 * I've added a queue system to this command as it is very likely requets will fail when making them in bulk,
		 * failed requests can be easily stuffed back into the queue and reprocessed later.
		 */

		let queue = [];

		queue.push(...e.map(j => ({
			type: "add",
			user: "@me",
			emoji: j
		})));

		const queueInterval = setInterval(async() => {
			if(queue.length !== 0) {
				const r = queue.shift();
				try {
					switch(r.type.toLowerCase()) {
					case "add":
						await em.addReaction(r.emoji,r.user).catch(() => queue.push(r));
						break;
	
					case "remove":
						await em.removeReaction(r.emoji,r.user).catch(() => queue.push(r));
						break;
	
					case "removeall":
						await em.removeReactions().catch(() => queue.push(r));
						break;

					case "edit":
						await em.edit({ embed: r.embed }).catch(() => queue.push(r));
						break;
					}
				} catch(e) {
					queue.push(r);
				}
			}
		},.5e3);

		embed = {
			title: `Comic Viewer - **${functions.ucwords(l.results.comic.name.replace(/-/g," "))}** (ID: ${id})`,
			image: {
				url: l.results.img[currentPage-1].derivatives.xxlarge.url
			}
		};

		Object.assign(embed,message.embed_defaults());
		const em = await message.channel.createMessage({ embed });
		
		async function setPage(p) {
			clearTimeout(stopTimeout);
			stopTimeout = setTimeout(() => setPage("EXIT"),time);

			if(p === "EXIT") {
				clearTimeout(stopTimeout);
				queue.push({
					type: "removeAll",
					emoji: null,
					user: null
				});
				if(currentPage !== 1) await setPage(1);
				message._client.removeListener("messageReactionAdd",reactionF);
				if(queueInterval) {
					let count = 0;
					const cI = setInterval(() => {
						if(queue.length === 0 || ++count >= 20) {
							clearInterval(queueInterval);
							clearInterval(cI);
						}
					},.5e3);
				}
				return;
			} else currentPage = p;
			if(currentPage === 0) currentPage = l.results.img.length;
			else if(currentPage === l.results.img.length + 1) currentPage = 1;

			embed.image.url = l.results.img[currentPage-1].derivatives.xxlarge.url;
			embed.color = functions.randomColor();
			queue.push({
				type: "edit",
				embed
			});
		}

		const reactionF = (async(msg,emoji,user) => {
			if(msg.id !== em.id || user !== message.author.id || !e.includes(emoji.name)) {
				if(user !== this.bot.user.id && e.includes(emoji.name)) return queue.push({
					type: "remove",
					emoji: emoji.id !== null ? `${emoji.name}:${emoji.id}` : emoji.name,
					user
				});
				else return;
			}
			switch(emoji.name) {
			case "⏮":
				await setPage(1);
				break;
				
			case "◀":
				await setPage(currentPage-1);
				break;

			case "⏹":
				await setPage(1);
				await setPage("EXIT");
				break;

			case "▶":
				await setPage(currentPage+1);
				break;

			case "⏭":
				await setPage(l.results.img.length);
				break;

			default:
				return;
			}

			return queue.push({
				type: "remove",
				emoji: emoji.name,
				user
			});
		});

		message._client.on("messageReactionAdd",reactionF);

		stopTimeout = setTimeout(() => setPage("EXIT"),time);
	})
};