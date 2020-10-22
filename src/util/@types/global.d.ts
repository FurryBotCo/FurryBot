/// <reference path="./blacklist.d.ts" />
/// <reference path="./socials.d.ts" />
/// <reference path="./db.d.ts" />

import Eris from "eris";

declare global {
	type ArrayOneOrMore<T> = T[] & {
		0: T;
	};
	type DeepPartial<T> = {
		[P in keyof T]?: DeepPartial<T[P]>;
	};
	type FilterFlags<Base, Condition> = {
		[Key in keyof Base]: Base[Key] extends Condition ? Key : never;
	};
	type AllowedNames<Base, Condition> = FilterFlags<Base, Condition>[keyof Base];
	type BetterFilter<Base, Condition> = Pick<Base, keyof Omit<Base, AllowedNames<Base, Condition>>>;
	// eslint-disable-next-line @typescript-eslint/ban-types
	type WithoutFunctions<T> = BetterFilter<T, Function>;
	type Writeable<T> = { -readonly [P in keyof T]: T[P] };


	type ConfigDataTypes<T, O extends (string | number) = ""> = Omit<WithoutFunctions<{ [K in keyof T]: T[K]; }>, O>;
	type ConfigEditTypes<T, O extends (string | number) = ""> = DeepPartial<ConfigDataTypes<T, O>>;

	type ErisPermissions = (keyof typeof Eris.Constants.Permissions);

	type CommandRestrictions = "beta" | "developer" | "donator" | "guildOwner" | "nsfw" | "premium" | "supportServer";
	type CategoryRestrictions = "beta" | "developer";
	type ThenReturnType<T extends (...args: any[]) => any> = ReturnType<T> extends Promise<infer U> ? U : never;
}
