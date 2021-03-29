import LocalFunctions from "../../util/LocalFunctions";
import { BotFunctions, Category } from "core";

const cat = new Category("fun", __filename);

BotFunctions.loadCommands(__dirname, cat, LocalFunctions.getExt());

export default cat;
