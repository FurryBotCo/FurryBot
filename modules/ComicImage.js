const Comic = require("./Comic"),
	phin = require("phin"),
	deasync = require("deasync");

async function getCategory(id = "") {
	return phin({
		method: "GET",
		url: `https://yiff.supply/ws.php?format=json&method=pwg.categories.getList&cat_id=${id}`,
		parse: "json"
	}).then(res => {
		// testing only: write body to tmp/tmp-[id].txt
		//require("fs").writeFileSync(`${process.cwd()}/tmp/tmp-${id}.txt`,JSON.stringify(res.body));
		if(res.body.stat !== "ok") return { id };
		return res.body.result.categories;
	});
}

module.exports = class ComicImage {
	constructor(data) {
		this.id = parseInt(data.id,10);
		this.width = parseInt(data.width,10) || 0;
		this.height = parseInt(data.height,10) || 0;
		this.hit = parseInt(data.hit,10) || 0;
		this.file = data.file || "unknown.png";
		this.comment = data.comment;
		this.date_creation = ![undefined,null,""].includes(data.date_creation) ? new Date(data.date_creation) : null;
		this.data_available = ![undefined,null,""].includes(data.data_available) ? new Date(data.data_available) : new Date();
		this.page_url = data.page_url || "https://yiff.supply";
		this.element_url = data.element_url || "https://yiff.supply";
		this.derivatives = data.derivatives;
		//this.categories = ![undefined,null,""].includes(data.categories) ? data.categories.map(d => new Comic(deasync(getCategory)(d.id))) : [];
		this.categories = ![undefined,null,""].includes(data.categories) ? data.categories.map(d => new Comic(d)) : [];
	}
};