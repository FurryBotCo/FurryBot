import FurryBot from "../main";

class Database {
	static client: FurryBot;
	static setClient(client: FurryBot) { this.client = client; return this; }

}
