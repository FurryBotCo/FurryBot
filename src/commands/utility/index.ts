import LocalFunctions from "../../util/LocalFunctions";
import { BotFunctions, Category } from "core";

const cat = new Category("utility", __filename)
	.setRestrictions([]);

BotFunctions.loadCommands(__dirname, cat, LocalFunctions.getExt());

export default cat;
