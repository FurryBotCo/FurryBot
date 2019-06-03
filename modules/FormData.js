module.exports = class FormData {
	constructor(formData) {
		this._items = {};
		this.form = "";
		if(typeof formData === "object") for(let k of Object.keys(formData)) this.append(k, formData[k]);
		else if(typeof formData === "string" && formData !== "") {
			let j;
			try {
				j = JSON.parse(formData);
			} catch(e) {

			}

			if(typeof j === "object") for(let k of Object.keys(j)) this.append(k, j[k]);
			else if(formData.indexOf("=") !== -1) {
				let a;
				a = formData.split("&");
				for(let b of a) this.append(b.split("=")[0],b.split("=")[1]);
			}
		}
	}

	append(f, v) {
		this._items[f] = v;
		this.form += `${f}=${v}`;
		return this.form;
	}

	toString() {
		return this.form;
	}

	toJSON() {
		return this._items;
	}
};