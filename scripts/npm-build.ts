import build from "./build";
import version from "./version";

version(null);
build(true);
const d = new Date();
console.log(`${(d.getHours() % 12) || 12}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds()} ${d.getHours() >= 12 ? "PM" : "AM"} - Build Finished`);
