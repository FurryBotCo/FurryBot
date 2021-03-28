import config from "../config";
import { Language as Lang } from "core";
const Languages = [
	"en"
] as const;
export type VALID_LANGUAGES = typeof Languages[number];
//                                                          removes readonly so who cares
const Language = new Lang<VALID_LANGUAGES>(config.dir.lang, Languages.map(v => v));
export default Language;
