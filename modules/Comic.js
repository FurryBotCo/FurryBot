module.exports = class Comic {
	constructor(data) {
		this.id = parseInt(data.id,10);
		this.name = data.name || "No Name";
		this.comment = data.comment || null;
		this.permalink = data.permalink || "";
		this.status = data.status === "public" ? 0 : 1;
		this.uppercats = ![undefined,null,""].includes(data.uppercats) ? data.uppercats.split(",") || [] : [];
		this.global_rank = parseFloat(data.global_rank) || 0;
		this.id_uppercat = parseInt(data.id_uppercat,10) || 0;
		this.images = parseInt(data.nb_images,10) || 0;
		this.total_images = parseInt(data.total_nb_images,10) || 0;
		this.representative_picture_id = parseInt(data.representative_picture_id,10) || 0;
		this.date_last = ![undefined,null,""].includes(data.date_last) ? new Date(data.date_last) : null;
		this.max_date_list = ![undefined,null,""].includes(data.max_date_list) ? new Date(data.max_date_list) : null;
		this.categories = parseInt(data.categories,10) || 0;
		this.url = data.url || "";
		this.page_url = data.page_url || "https://yiff.supply";
		this.rating = 0;
	}

	toString() {
		return this.id;
	}
};