import Eris from "eris";
import Language from "./Language";
import GuildConfig from "../modules/config/GuildConfig";

export default class EmbedBuilder {
	private data: Eris.EmbedOptions;
	private lang: string;
	constructor(lang: string, d?: Eris.EmbedOptions | EmbedBuilder)
	// tslint:disable-next-line: unified-signatures
	constructor(gConfig: GuildConfig, d?: Eris.EmbedOptions | EmbedBuilder)
	constructor(langOrGConfig: string | GuildConfig, d?: Eris.EmbedOptions | EmbedBuilder) {
		this.lang = langOrGConfig instanceof GuildConfig ? langOrGConfig.settings.lang : langOrGConfig;
		if (!d) this.data = {};
		else this.data = d instanceof EmbedBuilder ? d.toJSON() : d;
	}

	getEmbedData() { return { ...this.data }; }
	loadEmbedData(data: Eris.EmbedOptions | EmbedBuilder) {
		this.data = new EmbedBuilder(this.lang, { ...this.data, ...(data instanceof EmbedBuilder ? data.toJSON() : data) }).toJSON();
		return this;
	}

	getTitle() { return String(this.data.title); }
	setTitle(str: string) {
		this.data.title = Language.get(this.lang).parseString(str);
		return this;
	}

	getDescription() { return String(this.data.description); }
	setDescription(desc: string) {
		this.data.description = Language.get(this.lang).parseString(desc);
		return this;
	}

	getUrl() { return String(this.data.url); }
	setUrl(url: string) {
		this.data.url = url;
		return this;
	}

	getColor() { return Number(this.data.color); }
	setColor(color: number) {
		this.data.color = color;
		return this;
	}

	getTimestamp() { return String(this.data.timestamp); }
	setTimestamp(t: "now" | Date | string | number) {
		if (t === "now") t = new Date().toISOString();
		if (typeof t === "number") t = new Date(t).toISOString();
		if (t instanceof Date) t = t.toISOString();
		this.data.timestamp = t;
		return this;
	}

	getFooter() { return { ...this.data.footer }; }
	setFooter(text: string, icon?: string) {
		this.data.footer = {
			text: Language.get(this.lang).parseString(text)
		};
		if (!!icon) this.data.footer.icon_url = icon;
		return this;
	}

	getThumbnail() { return { ...this.data.thumbnail }; }
	setThumbnail(url: string) {
		this.data.thumbnail = {
			url
		};
		return this;
	}

	getImage() { return { ...this.data.image }; }
	setImage(url: string) {
		this.data.image = {
			url
		};
		return this;
	}

	getAuthor() { return { ...this.data.author }; }
	setAuthor(name: string, icon?: string, url?: string) {
		this.data.author = {
			name: Language.get(this.lang).parseString(name)
		};
		if (!!icon) this.data.author.icon_url = icon;
		if (!!url) this.data.author.url = url;
		return this;
	}

	getField(i: number) { return { ...this.data.fields[i] }; }
	addField(name: string, value: string, inline = false) {
		if (!this.data.fields) this.data.fields = [];
		this.data.fields.push({
			name: Language.get(this.lang).parseString(name),
			value: Language.get(this.lang).parseString(value),
			inline
		});
		return this;
	}

	toJSON() { return { ...this.data }; }
}
