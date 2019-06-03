const {
	config,
	phin,
	fs,
	stringSimilarity,
	functions,
	Comic
} = require("../../../modules/CommandRequire");

async function getCategory(id = "") {
	return phin({
		method: "GET",
		url: `https://theyiffgallery.com/ws.php?format=json&method=pwg.categories.getList&cat_id=${id}`,
		parse: "json"
	}).then(res => {
		if(res.body.stat !== "ok") throw new Error(JSON.stringify(res.body));
		return res.body.result.categories;
	});

}

async function getCategories(...ids) {
	return Promise.all(ids.map(i => getCategory(i))).then(res => res.reduce((a,b) => a.concat(b)));
}

module.exports = {
	triggers: [
		"search",
		"s"
	],
	userPermissions: [],
	botPermissions: [
		"embedLinks", // 16834
		"attachFiles" // 32768
	],
	cooldown: 3e3,
	description: "Search comics from the yiff gallery",
	usage: "<gay/straight/lesbian/herm> <search>",
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
		else return this.sendCommandEmbed(message,message.command);

		/*
		let l, m, embed, search, s, res, j;

		const categoryIds = require("../../../conf/categoryIds").theyiffgallery;

		if(message.args.length < 2) return new Error("ERR_INVALID_USAGE");

		if(!Object.keys(categoryIds).includes(message.args[0].toLowerCase())) return message.reply(`Invalid category "${message.args[0].toLowerCase()}"\nValid Categories: **${Object.keys(categoryIds).join("**, **")}**.`);

		const cat = categoryIds[message.args[0].toLowerCase()];


		search = [...message.args];
		search.shift();
		search = search.join(" ");


		if(fs.existsSync(`${config.rootDir}/tmp/comicCache-cat${cat instanceof Array ? cat.join("-") : cat}.json`)) l = require(`${config.rootDir}/tmp/comicCache-cat${cat instanceof Array ? cat.join("-") : cat}.json`);
		else {
			m = await message.channel.createMessage(`Please wait, fetching latest comic data... ${config.emojis.loading}\n(this may take several minutes)`);
			l = false;
		}

		// 6 hours
		if(new Date(l.fetchDate).getTime() + 2.16e+7 < Date.now()) l = false;
		
		if(!l) {
			await getCategories(...cat).then(async(c) => {
				this.logger.debug(`Refetching ${message.args[0].toLowerCase()} comic json`);
				for(let cm of c) {
					//if(cm.permalink === null) cm.permalink = "";
					if(cm.nb_images === 0 && cm.total_nb_images !== 0) {
						const a = await getCategory(cm.id);
						c.push(...a);
						c = c.filter(cc => cc.id !== cm.id);
					}
			
					if(cm.nb_images === 0 && cm.total_nb_images === 0) c = c.filter(cc => cc.id !== cm.id);
				}
			
				//c = c.filter(cc => cc.permalink.toLowerCase().indexOf("album") === -1);
				let fetchDate = new Date().toISOString();
				require("fs").writeFileSync(`${config.rootDir}/tmp/comicCache-cat${cat instanceof Array ? cat.join("-") : cat}.json`,JSON.stringify({ fetchDate, results: c }));
				l = { fetchDate , results: c };
			});
		}
	
		if(m) await m.delete();

		if(l.results.length === 0) return message.reply(`No comics were found in the **${message.args[0].toLowerCase()}** category.`);
		j = l.results.map(r => new Comic(r));

		const c = j.map(r => r.name.replace(/-/g," ").toLowerCase());

		s = stringSimilarity.findBestMatch(search,c).ratings.filter(r => r.rating > .5);
		res = [];
		s.forEach((v) => {
			if(res.map(t => t.target).includes(v.target)) return;
			else res.push(v);
		});
		res = res.sort((a,b) => a.rating < b.rating ? 1 : b.rating < a.rating ? -1 : 0);
		
		if(res.length === 0) return message.reply(`No results for "${search}" were found in the **${message.args[0].toLowerCase()}** category.`);
		res = res.map(r => {
			let k = j.find(rr => rr.name.replace(/-/g," ").toLowerCase() === r.target.toLowerCase());
			k.rating = r.rating;
			return k;
		});
		
		embed = {
			title: `Results for ${search}`,
			description: `To chose a comic, run \`${message.prefix}comic view tyg {id}\` (without the braces)\n\n\
			Name - ID\n\
			${res.map(r => `**${functions.ucwords(r.name.replace(/-/g," "))}** - \`${r.id}\``).join("\n")}`
		};

		Object.assign(embed,message.embed_defaults());
		return message.channel.createMessage({ embed });
		*/
	})
};