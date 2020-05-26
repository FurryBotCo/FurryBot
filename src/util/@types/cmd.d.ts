import Eris from "eris";

declare namespace CommandHandlerTypes {
	export type CategoryRestrictions = "developer" | "contributor" | "helper" | "beta";
	export type CommandRestrictions = "developer" | "contributor" | "helper" | "beta" | "nsfw" | "supportServer" | "donator" | "premiumServer" | "guildOwner";
	export type ErisPermissions = keyof typeof Eris["Constants"]["Permissions"]; // dynamic now :tada:
}
export = CommandHandlerTypes;
