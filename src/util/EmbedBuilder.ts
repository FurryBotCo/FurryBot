import Eris from "eris";
import Language, { Languages } from "./Language";

export default class EmbedBuilder {
	private lang: Languages;
	private json: Eris.EmbedOptions;
	constructor(lang: Languages, json?: Eris.EmbedOptions) {
		this.lang = lang;
		this.json = json ?? {};
	}

	getTitle() {
		return this.json.title;
	}

	setTitle(title: string) {
		this.json.title = Language.parseString(this.lang, title);
		return this;
	}

	removeTitle() {
		delete this.json.title;
		return this;
	}

	getDescription() {
		return this.json.description;
	}

	setDescription(description: string) {
		this.json.description = Language.parseString(this.lang, description);
		return this;
	}

	removeDescription() {
		delete this.json.description;
		return this;
	}

	getURL() {
		return this.json.url;
	}

	setURL(url: string) {
		this.json.url = url;
		return this;
	}

	removeURL() {
		delete this.json.url;
		return this;
	}

	getColor() {
		return this.json.color;
	}

	setColor(color: number | string) {
		this.json.color = typeof color === "string" ? parseInt(color.toString().replace(/#/g, ""), 16) : color;
		return this;
	}

	removeColor() {
		delete this.json.color;
		return this;
	}

	getTimestamp() {
		return this.json.timestamp;
	}

	setTimestamp(timestamp: number | Date | string) {
		this.json.timestamp = timestamp instanceof Date ? timestamp : new Date(timestamp);
		return this;
	}

	removeTimestamp() {
		delete this.json.timestamp;
		return this;
	}

	getFooter() {
		return this.json.footer;
	}

	setFooter(text: string, iconURL?: string) {
		this.json.footer = {
			text: Language.parseString(this.lang, text)
		};
		if (iconURL) this.json.footer.icon_url = iconURL;
		return this;
	}

	removeFooter() {
		delete this.json.footer;
		return this;
	}

	getThumbnail() {
		return this.json.thumbnail;
	}

	setThumbnail(url: string) {
		this.json.thumbnail = {
			url
		};
		return this;
	}

	removeThumbnail() {
		delete this.json.thumbnail;
		return this;
	}

	getImage() {
		return this.json.image;
	}

	setImage(url: string) {
		this.json.image = {
			url
		};
		return this;
	}

	removeImage() {
		delete this.json.image;
		return this;
	}

	getAuthor() {
		return this.json.author;
	}

	setAuthor(name: string, iconURL?: string, url?: string) {
		this.json.author = {
			name: Language.parseString(this.lang, name)
		};
		if (iconURL) this.json.author.icon_url = iconURL;
		if (url) this.json.author.url = url;
		return this;
	}

	removeAuthor() {
		delete this.json.author;
		return this;
	}

	addField(name: string, value: string, inline?: boolean) {
		inline = !!inline;
		if (!(this.json.fields instanceof Array)) this.json.fields = [];
		this.json.fields.push({
			name: Language.parseString(this.lang, name),
			value: Language.parseString(this.lang, value),
			inline
		});
		return this;
	}

	addEmptyField(inline?: boolean) {
		return this.addField("\u200b", "\u200b", inline);
	}


	addFields(...args: Eris.EmbedField[]) {
		args.map(a => this.addField(a.name, a.value, a.inline));
		return this;
	}

	getFields() {
		return [...(this.json.fields ?? [])];
	}

	setFields(fields: Eris.EmbedField[]) {
		this.json.fields = fields;
	}

	toJSON(): Eris.EmbedOptions {
		return Object(this.json); // to prevent external editing of internal properties
	}

	get [Symbol.toStringTag]() {
		return "EmbedBuilder";
	}
}
