// eslint-disable-next-line @typescript-eslint/triple-slash-reference, spaced-comment
/// <reference path="./@types/global.d.ts" />
import "source-map-support/register";
import config from "../config";
import { Redis } from "../db";
import { MonkeyPatch  } from "core";
import Logger from "logger";
import { JSON5Helper, setValue } from "utilities";
import * as fs from "fs-extra";
import Language from "language";
setValue("userAgent", config.web.userAgent)("redis", Redis!)("pastebin.userKey", config.apis.pastebin.userKey)("pastebin.devKey", config.apis.pastebin.devKey);
JSON5Helper.enable();
MonkeyPatch.init();
Language.setDir(config.dir.lang);
Logger
	.setSaveToFile((str) => {
		const d = new Date();
		const date = `${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate()}-${d.getFullYear()}`;

		if (!fs.existsSync(config.dir.logs.client)) fs.mkdirpSync(config.dir.logs.client);
		fs.appendFileSync(`${config.dir.logs.client}/${date}.log`, str);
	})
	.setReplacer((str) => str.replace(new RegExp(config.client.token, "g"), "[TOKEN]"));
// .initOverrides();
export default null;
