import * as fs from "fs-extra";
import { dirname } from "path";
export default function pid(path: string) {
	const b = dirname(path);
	if (!fs.existsSync(b)) fs.mkdirpSync(b);
	fs.writeFileSync(path, process.pid.toString());
	function handle() {
		try { fs.unlinkSync(path); } catch (e) { }
		process.exit(0);
	}

	process
		.on("exit", handle)
		.on("SIGINT", handle)
		.on("SIGTERM", handle);
}
