import * as Eris from "eris";
import EmbedBuilder from "../EmbedBuilder";

declare module "Eris" {

	interface ChangableMap<K, V extends J, J> extends Map<K, V> {
		remove<T extends J = V>(obj: T | { id: string }): T;
		get<T extends J = V>(key: K): T | undefined;
		forEach<T extends J = V>(callbackfn: (value: T, key: K, map: Map<K, T>) => void): void;
		values<T extends J = V>(): IterableIterator<T>;
		entries<T extends J = V>(): IterableIterator<[K, T]>;
	}

	export interface Collection<T extends { id: string | number }> extends Map<string | number, T> {
		baseObject: new (...args: any[]) => T;
		limit?: number;
		constructor(baseObject: new (...args: any[]) => T, limit?: number);
		add<V = T>(obj: V, extra?: any, replace?: boolean): V;
		find<V = T>(func: (i: V) => boolean): V | undefined;
		random<V = T>(): V;
		filter<V = T>(func: (i: V) => boolean): V[];
		map<R, V = T>(func: (i: V) => R): R[];
		reduce<U, V = T>(func: (accumulator: U, val: V) => U, initialValue?: U): U;
		every<V = T>(func: (i: V) => boolean): boolean;
		some<V = T>(func: (i: V) => boolean): boolean;
		update<V = T>(obj: V, extra?: any, replace?: boolean): V;
		remove<V = T>(obj: V | { id: string }): V;
		get<V = T>(key: string | number): V | undefined;
		forEach<V = T>(callbackfn: (value: V, key: string | number, map: Map<string | number, V>) => void): void;
		values<V = T>(): IterableIterator<V>;
		entries<V = T>(): IterableIterator<[string | number, V]>;
	}

	export interface Client {
		getRESTChannel<T = AnyChannel>(channelID: string): Promise<T>;
	}

	type ExtraMessageContent = string | Eris.AdvancedMessageContent | Eris.AdvancedMessageContent & { embed: EmbedBuilder; };

	export interface TextChannel extends Eris.GuildChannel {
		createMessage(content: ExtraMessageContent, file?: Eris.MessageFile): Promise<Eris.Message<TextChannel>>;
		editMessage(messageID: string, content: Eris.ExtraMessageContent): Promise<Eris.Message<TextChannel>>;
	}

	export interface Textable {
		createMessage(content: ExtraMessageContent, file?: Eris.MessageFile): Promise<Eris.Message<Eris.TextableChannel>>;
		editMessage(messageID: string, content: Eris.ExtraMessageContent): Promise<Eris.Message<Eris.TextableChannel>>;
	}
}
