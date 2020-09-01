import Eris from "eris";

declare module "eris" {
	export interface Permission {
		has(permission: ErisPermissions): boolean;
	}
}
