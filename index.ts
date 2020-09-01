process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import SuppressWarnings from "suppress-warnings";
SuppressWarnings([
	(warning, name, ctor) => name === "PromiseRejectionHandledWarning",
	(warning, name, ctor) => warning.toString().indexOf("NODE_TLS_REJECT_UNAUTHORIZED") !== -1
]);
import "./src/util/RegisterJSON5";
import "./src/run";
