import Category from "../../util/cmd/Category";
import Internal from "../../util/Functions/Internal";

const cat = new Category("economy", __filename).setRestrictions(["developer", "beta"]);

Internal.loadCommands(__dirname, cat);

export default cat;
