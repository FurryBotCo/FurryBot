import * as os from "os";
// lower = higher priority
const PRIORITY = -7;
os.setPriority(process.pid, PRIORITY);
