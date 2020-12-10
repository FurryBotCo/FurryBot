import pkg from "./package.json";
if (pkg.engineStrict && process.version.replace(/v/, "") !== pkg.engines.node) throw new TypeError(`Invalid node version "${process.version}", version "${pkg.engines.node}" is required.`);
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import SuppressWarnings from "suppress-warnings";
SuppressWarnings([
	(warning, name, ctor) => name === "PromiseRejectionHandledWarning",
	(warning, name, ctor) => warning.toString().indexOf("NODE_TLS_REJECT_UNAUTHORIZED") !== -1
]);
import "source-map-support/register";
import "./src/util/RegisterJSON5";
import "./src/run";
