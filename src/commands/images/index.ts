import Category from "../../util/cmd/Category";
import Internal from "../../util/Functions/Internal";

const cat = new Category("images", __filename);

Internal.loadCommands(__dirname, cat);

export default cat;
