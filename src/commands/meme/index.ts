import LocalFunctions from "../../util/LocalFunctions";
import { BotFunctions, Category } from "core";

const cat = new Category("meme", __filename)
	.setRestrictions([]);

BotFunctions.loadCommands(__dirname, cat, LocalFunctions.getExt());

export default cat;
