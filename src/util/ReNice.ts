import * as os from "os";
// lower = higher priority
os.setPriority(process.pid, os.constants.priority.PRIORITY_HIGH);
