declare module "async-redis" {
	/// <reference types="node" />

	import { EventEmitter } from "events";
	import { Duplex } from "stream";

	export interface RetryStrategyOptions {
		error: NodeJS.ErrnoException;
		total_retry_time: number;
		times_connected: number;
		attempt: number;
	}

	export type RetryStrategy = (options: RetryStrategyOptions) => number | Error;

	export interface ClientOpts {
		host?: string;
		port?: number;
		path?: string;
		url?: string;
		parser?: string;
		string_numbers?: boolean;
		return_buffers?: boolean;
		detect_buffers?: boolean;
		socket_keepalive?: boolean;
		socket_initial_delay?: number;
		no_ready_check?: boolean;
		enable_offline_queue?: boolean;
		retry_max_delay?: number;
		connect_timeout?: number;
		max_attempts?: number;
		retry_unfulfilled_commands?: boolean;
		auth_pass?: string;
		password?: string;
		db?: string | number;
		family?: string;
		rename_commands?: { [command: string]: string } | null;
		tls?: any;
		prefix?: string;
		retry_strategy?: RetryStrategy;
	}

	export type Callback<T> = (err: Error | null, reply: T) => void;

	export interface ServerInfo {
		redis_version: string;
		versions: number[];
	}

	export interface OverloadedCommand<T, U, R> {
		(arg1: T, arg2: T, arg3: T, arg4: T, arg5: T, arg6: T, cb?: Callback<U>): R;
		(arg1: T, arg2: T, arg3: T, arg4: T, arg5: T, cb?: Callback<U>): R;
		(arg1: T, arg2: T, arg3: T, arg4: T, cb?: Callback<U>): R;
		(arg1: T, arg2: T, arg3: T, cb?: Callback<U>): R;
		(arg1: T, arg2: T | T[], cb?: Callback<U>): R;
		(arg1: T | T[], cb?: Callback<U>): R;
		(...args: Array<T | Callback<U>>): R;
	}

	export interface OverloadedKeyCommand<T, U, R> {
		(key: string, arg1: T, arg2: T, arg3: T, arg4: T, arg5: T, arg6: T, cb?: Callback<U>): R;
		(key: string, arg1: T, arg2: T, arg3: T, arg4: T, arg5: T, cb?: Callback<U>): R;
		(key: string, arg1: T, arg2: T, arg3: T, arg4: T, cb?: Callback<U>): R;
		(key: string, arg1: T, arg2: T, arg3: T, cb?: Callback<U>): R;
		(key: string, arg1: T, arg2: T, cb?: Callback<U>): R;
		(key: string, arg1: T | T[], cb?: Callback<U>): R;
		(key: string, ...args: Array<T | Callback<U>>): R;
		(...args: Array<string | T | Callback<U>>): R;
	}

	export interface OverloadedListCommand<T, U, R> {
		(arg1: T, arg2: T, arg3: T, arg4: T, arg5: T, arg6: T, cb?: Callback<U>): R;
		(arg1: T, arg2: T, arg3: T, arg4: T, arg5: T, cb?: Callback<U>): R;
		(arg1: T, arg2: T, arg3: T, arg4: T, cb?: Callback<U>): R;
		(arg1: T, arg2: T, arg3: T, cb?: Callback<U>): R;
		(arg1: T, arg2: T, cb?: Callback<U>): R;
		(arg1: T | T[], cb?: Callback<U>): R;
		(...args: Array<T | Callback<U>>): R;
	}

	export interface OverloadedSetCommand<T, U, R> {
		(key: string, arg1: T, arg2: T, arg3: T, arg4: T, arg5: T, arg6: T, cb?: Callback<U>): R;
		(key: string, arg1: T, arg2: T, arg3: T, arg4: T, arg5: T, cb?: Callback<U>): R;
		(key: string, arg1: T, arg2: T, arg3: T, arg4: T, cb?: Callback<U>): R;
		(key: string, arg1: T, arg2: T, arg3: T, cb?: Callback<U>): R;
		(key: string, arg1: T, arg2: T, cb?: Callback<U>): R;
		(key: string, arg1: T | { [key: string]: T } | T[], cb?: Callback<U>): R;
		(key: string, ...args: Array<T | Callback<U>>): R;
		(args: [string, ...T[]], cb?: Callback<U>): R;
	}

	export interface OverloadedLastCommand<T1, T2, U, R> {
		(arg1: T1, arg2: T1, arg3: T1, arg4: T1, arg5: T1, arg6: T2, cb?: Callback<U>): R;
		(arg1: T1, arg2: T1, arg3: T1, arg4: T1, arg5: T2, cb?: Callback<U>): R;
		(arg1: T1, arg2: T1, arg3: T1, arg4: T2, cb?: Callback<U>): R;
		(arg1: T1, arg2: T1, arg3: T2, cb?: Callback<U>): R;
		(arg1: T1, arg2: T2 | Array<T1 | T2>, cb?: Callback<U>): R;
		(args: Array<T1 | T2>, cb?: Callback<U>): R;
		(...args: Array<T1 | T2 | Callback<U>>): R;
	}

	export interface Commands<R> {
		/**
		 * Listen for all requests received by the server in real time.
		 */
		monitor(cb?: Callback<undefined>): Promise<R>;
		MONITOR(cb?: Callback<undefined>): Promise<R>;

		/**
		 * Get information and statistics about the server.
		 */
		info(cb?: Callback<ServerInfo>): Promise<R>;
		info(section?: string | string[], cb?: Callback<ServerInfo>): Promise<R>;
		INFO(cb?: Callback<ServerInfo>): Promise<R>;
		INFO(section?: string | string[], cb?: Callback<ServerInfo>): Promise<R>;

		/**
		 * Ping the server.
		 */
		ping(callback?: Callback<string>): Promise<R>;
		ping(message: string, callback?: Callback<string>): Promise<R>;
		PING(callback?: Callback<string>): Promise<R>;
		PING(message: string, callback?: Callback<string>): Promise<R>;

		/**
		 * Post a message to a channel.
		 */
		publish(channel: string, value: string, cb?: Callback<number>): Promise<R>;
		PUBLISH(channel: string, value: string, cb?: Callback<number>): Promise<R>;

		/**
		 * Authenticate to the server.
		 */
		auth(password: string, callback?: Callback<string>): Promise<R>;
		AUTH(password: string, callback?: Callback<string>): Promise<R>;

		/**
		 * KILL - Kill the connection of a client.
		 * LIST - Get the list of client connections.
		 * GETNAME - Get the current connection name.
		 * PAUSE - Stop processing commands from clients for some time.
		 * REPLY - Instruct the server whether to reply to commands.
		 * SETNAME - Set the current connection name.
		 */
		client: OverloadedCommand<string, any, Promise<R>>;
		CLIENT: OverloadedCommand<string, any, Promise<R>>;

		/**
		 * Set multiple hash fields to multiple values.
		 */
		hmset: OverloadedSetCommand<string | number, "OK", Promise<R>>;
		HMSET: OverloadedSetCommand<string | number, "OK", Promise<R>>;

		/**
		 * Listen for messages published to the given channels.
		 */
		subscribe: OverloadedListCommand<string, string, Promise<R>>;
		SUBSCRIBE: OverloadedListCommand<string, string, Promise<R>>;

		/**
		 * Stop listening for messages posted to the given channels.
		 */
		unsubscribe: OverloadedListCommand<string, string, Promise<R>>;
		UNSUBSCRIBE: OverloadedListCommand<string, string, Promise<R>>;

		/**
		 * Listen for messages published to channels matching the given patterns.
		 */
		psubscribe: OverloadedListCommand<string, string, Promise<R>>;
		PSUBSCRIBE: OverloadedListCommand<string, string, Promise<R>>;

		/**
		 * Stop listening for messages posted to channels matching the given patterns.
		 */
		punsubscribe: OverloadedListCommand<string, string, Promise<R>>;
		PUNSUBSCRIBE: OverloadedListCommand<string, string, Promise<R>>;

		/**
		 * Append a value to a key.
		 */
		append(key: string, value: string, cb?: Callback<number>): Promise<R>;
		APPEND(key: string, value: string, cb?: Callback<number>): Promise<R>;

		/**
		 * Asynchronously rewrite the append-only file.
		 */
		bgrewriteaof(cb?: Callback<"OK">): Promise<R>;
		BGREWRITEAOF(cb?: Callback<"OK">): Promise<R>;

		/**
		 * Asynchronously save the dataset to disk.
		 */
		bgsave(cb?: Callback<string>): Promise<R>;
		BGSAVE(cb?: Callback<string>): Promise<R>;

		/**
		 * Count set bits in a string.
		 */
		bitcount(key: string, cb?: Callback<number>): Promise<R>;
		bitcount(key: string, start: number, end: number, cb?: Callback<number>): Promise<R>;
		BITCOUNT(key: string, cb?: Callback<number>): Promise<R>;
		BITCOUNT(key: string, start: number, end: number, cb?: Callback<number>): Promise<R>;

		/**
		 * Perform arbitrary bitfield integer operations on strings.
		 */
		bitfield: OverloadedKeyCommand<string | number, [number, number], Promise<R>>;
		BITFIELD: OverloadedKeyCommand<string | number, [number, number], Promise<R>>;

		/**
		 * Perform bitwise operations between strings.
		 */
		bitop(operation: string, destkey: string, key1: string, key2: string, key3: string, cb?: Callback<number>): Promise<R>;
		bitop(operation: string, destkey: string, key1: string, key2: string, cb?: Callback<number>): Promise<R>;
		bitop(operation: string, destkey: string, key: string, cb?: Callback<number>): Promise<R>;
		bitop(operation: string, destkey: string, ...args: Array<string | Callback<number>>): Promise<R>;
		BITOP(operation: string, destkey: string, key1: string, key2: string, key3: string, cb?: Callback<number>): Promise<R>;
		BITOP(operation: string, destkey: string, key1: string, key2: string, cb?: Callback<number>): Promise<R>;
		BITOP(operation: string, destkey: string, key: string, cb?: Callback<number>): Promise<R>;
		BITOP(operation: string, destkey: string, ...args: Array<string | Callback<number>>): Promise<R>;

		/**
		 * Find first bit set or clear in a string.
		 */
		bitpos(key: string, bit: number, start: number, end: number, cb?: Callback<number>): Promise<R>;
		bitpos(key: string, bit: number, start: number, cb?: Callback<number>): Promise<R>;
		bitpos(key: string, bit: number, cb?: Callback<number>): Promise<R>;
		BITPOS(key: string, bit: number, start: number, end: number, cb?: Callback<number>): Promise<R>;
		BITPOS(key: string, bit: number, start: number, cb?: Callback<number>): Promise<R>;
		BITPOS(key: string, bit: number, cb?: Callback<number>): Promise<R>;

		/**
		 * Remove and get the first element in a list, or block until one is available.
		 */
		blpop: OverloadedLastCommand<string, number, [string, string], Promise<R>>;
		BLPOP: OverloadedLastCommand<string, number, [string, string], Promise<R>>;

		/**
		 * Remove and get the last element in a list, or block until one is available.
		 */
		brpop: OverloadedLastCommand<string, number, [string, string], Promise<R>>;
		BRPOP: OverloadedLastCommand<string, number, [string, string], Promise<R>>;

		/**
		 * Pop a value from a list, push it to another list and return it; or block until one is available.
		 */
		brpoplpush(source: string, destination: string, timeout: number, cb?: Callback<string | null>): Promise<R>;
		BRPOPLPUSH(source: string, destination: string, timeout: number, cb?: Callback<string | null>): Promise<R>;

		/**
		 * ADDSLOTS - Assign new hash slots to receiving node.
		 * COUNT-FAILURE-REPORTS - Return the number of failure reports active for a given node.
		 * COUNTKEYSINSLOT - Return the number of local keys in the specified hash slot.
		 * DELSLOTS - Set hash slots as unbound in receiving node.
		 * FAILOVER - Forces a slave to perform a manual failover of its master.
		 * FORGET - Remove a node from the nodes table.
		 * GETKEYSINSLOT - Return local key names in the specified hash slot.
		 * INFO - Provides info about Redis Cluster node state.
		 * KEYSLOT - Returns the hash slot of the specified key.
		 * MEET - Force a node cluster to handshake with another node.
		 * NODES - Get cluster config for the node.
		 * REPLICATE - Reconfigure a node as a slave of the specified master node.
		 * RESET - Reset a Redis Cluster node.
		 * SAVECONFIG - Forces the node to save cluster state on disk.
		 * SET-CONFIG-EPOCH - Set the configuration epoch in a new node.
		 * SETSLOT - Bind a hash slot to a specified node.
		 * SLAVES - List slave nodes of the specified master node.
		 * SLOTS - Get array of Cluster slot to node mappings.
		 */
		cluster: OverloadedCommand<string, any, this>;
		CLUSTER: OverloadedCommand<string, any, this>;

		/**
		 * Get array of Redis command details.
		 *
		 * COUNT - Get total number of Redis commands.
		 * GETKEYS - Extract keys given a full Redis command.
		 * INFO - Get array of specific REdis command details.
		 */
		command(cb?: Callback<Array<[string, number, string[], number, number, number]>>): Promise<R>;
		COMMAND(cb?: Callback<Array<[string, number, string[], number, number, number]>>): Promise<R>;

		/**
		 * Get array of Redis command details.
		 *
		 * COUNT - Get array of Redis command details.
		 * GETKEYS - Extract keys given a full Redis command.
		 * INFO - Get array of specific Redis command details.
		 * GET - Get the value of a configuration parameter.
		 * REWRITE - Rewrite the configuration file with the in memory configuration.
		 * SET - Set a configuration parameter to the given value.
		 * RESETSTAT - Reset the stats returned by INFO.
		 */
		config: OverloadedCommand<string, boolean, Promise<R>>;
		CONFIG: OverloadedCommand<string, boolean, Promise<R>>;

		/**
		 * Return the number of keys in the selected database.
		 */
		dbsize(cb?: Callback<number>): Promise<R>;
		DBSIZE(cb?: Callback<number>): Promise<R>;

		/**
		 * OBJECT - Get debugging information about a key.
		 * SEGFAULT - Make the server crash.
		 */
		debug: OverloadedCommand<string, boolean, Promise<R>>;
		DEBUG: OverloadedCommand<string, boolean, Promise<R>>;

		/**
		 * Decrement the integer value of a key by one.
		 */
		decr(key: string, cb?: Callback<number>): Promise<R>;
		DECR(key: string, cb?: Callback<number>): Promise<R>;

		/**
		 * Decrement the integer value of a key by the given number.
		 */
		decrby(key: string, decrement: number, cb?: Callback<number>): Promise<R>;
		DECRBY(key: string, decrement: number, cb?: Callback<number>): Promise<R>;

		/**
		 * Delete a key.
		 */
		del: OverloadedCommand<string, number, Promise<R>>;
		DEL: OverloadedCommand<string, number, Promise<R>>;

		/**
		 * Discard all commands issued after MULTI.
		 */
		discard(cb?: Callback<"OK">): Promise<R>;
		DISCARD(cb?: Callback<"OK">): Promise<R>;

		/**
		 * Return a serialized version of the value stored at the specified key.
		 */
		dump(key: string, cb?: Callback<string>): Promise<R>;
		DUMP(key: string, cb?: Callback<string>): Promise<R>;

		/**
		 * Echo the given string.
		 */
		echo<T extends string>(message: T, cb?: Callback<T>): Promise<R>;
		ECHO<T extends string>(message: T, cb?: Callback<T>): Promise<R>;

		/**
		 * Execute a Lua script server side.
		 */
		eval: OverloadedCommand<string | number, any, Promise<R>>;
		EVAL: OverloadedCommand<string | number, any, Promise<R>>;

		/**
		 * Execute a Lue script server side.
		 */
		evalsha: OverloadedCommand<string | number, any, Promise<R>>;
		EVALSHA: OverloadedCommand<string | number, any, Promise<R>>;

		/**
		 * Determine if a key exists.
		 */
		exists: OverloadedCommand<string, number, Promise<R>>;
		EXISTS: OverloadedCommand<string, number, Promise<R>>;

		/**
		 * Set a key"s time to live in seconds.
		 */
		expire(key: string, seconds: number, cb?: Callback<number>): Promise<R>;
		EXPIRE(key: string, seconds: number, cb?: Callback<number>): Promise<R>;

		/**
		 * Set the expiration for a key as a UNIX timestamp.
		 */
		expireat(key: string, timestamp: number, cb?: Callback<number>): Promise<R>;
		EXPIREAT(key: string, timestamp: number, cb?: Callback<number>): Promise<R>;

		/**
		 * Remove all keys from all databases.
		 */
		flushall(cb?: Callback<string>): Promise<R>;
		flushall(async: "ASYNC", cb?: Callback<string>): Promise<R>;
		FLUSHALL(cb?: Callback<string>): Promise<R>;
		FLUSHALL(async: "ASYNC", cb?: Callback<string>): Promise<R>;

		/**
		 * Remove all keys from the current database.
		 */
		flushdb(cb?: Callback<"OK">): Promise<R>;
		flushdb(async: "ASYNC", cb?: Callback<string>): Promise<R>;
		FLUSHDB(cb?: Callback<"OK">): Promise<R>;
		FLUSHDB(async: "ASYNC", cb?: Callback<string>): Promise<R>;

		/**
		 * Add one or more geospatial items in the geospatial index represented using a sorted set.
		 */
		geoadd: OverloadedKeyCommand<string | number, number, Promise<R>>;
		GEOADD: OverloadedKeyCommand<string | number, number, Promise<R>>;

		/**
		 * Returns members of a geospatial index as standard geohash strings.
		 */
		geohash: OverloadedKeyCommand<string, string, Promise<R>>;
		GEOHASH: OverloadedKeyCommand<string, string, Promise<R>>;

		/**
		 * Returns longitude and latitude of members of a geospatial index.
		 */
		geopos: OverloadedKeyCommand<string, Array<[number, number]>, Promise<R>>;
		GEOPOS: OverloadedKeyCommand<string, Array<[number, number]>, Promise<R>>;

		/**
		 * Returns the distance between two members of a geospatial index.
		 */
		geodist: OverloadedKeyCommand<string, string, Promise<R>>;
		GEODIST: OverloadedKeyCommand<string, string, Promise<R>>;

		/**
		 * Query a sorted set representing a geospatial index to fetch members matching a given maximum distance from a point.
		 */
		georadius: OverloadedKeyCommand<string | number, Array<string | [string, string | [string, string]]>, Promise<R>>;
		GEORADIUS: OverloadedKeyCommand<string | number, Array<string | [string, string | [string, string]]>, Promise<R>>;

		/**
		 * Query a sorted set representing a geospatial index to fetch members matching a given maximum distance from a member.
		 */
		georadiusbymember: OverloadedKeyCommand<string | number, Array<string | [string, string | [string, string]]>, Promise<R>>;
		GEORADIUSBYMEMBER: OverloadedKeyCommand<string | number, Array<string | [string, string | [string, string]]>, Promise<R>>;

		/**
		 * Get the value of a key.
		 */
		get(key: string, cb?: Callback<string>): Promise<R>;
		GET(key: string, cb?: Callback<string>): Promise<R>;

		/**
		 * Returns the bit value at offset in the string value stored at key.
		 */
		getbit(key: string, offset: number, cb?: Callback<number>): Promise<R>;
		GETBIT(key: string, offset: number, cb?: Callback<number>): Promise<R>;

		/**
		 * Get a substring of the string stored at a key.
		 */
		getrange(key: string, start: number, end: number, cb?: Callback<string>): Promise<R>;
		GETRANGE(key: string, start: number, end: number, cb?: Callback<string>): Promise<R>;

		/**
		 * Set the string value of a key and return its old value.
		 */
		getset(key: string, value: string, cb?: Callback<string>): Promise<R>;
		GETSET(key: string, value: string, cb?: Callback<string>): Promise<R>;

		/**
		 * Delete on or more hash fields.
		 */
		hdel: OverloadedKeyCommand<string, number, Promise<R>>;
		HDEL: OverloadedKeyCommand<string, number, Promise<R>>;

		/**
		 * Determine if a hash field exists.
		 */
		hexists(key: string, field: string, cb?: Callback<number>): Promise<R>;
		HEXISTS(key: string, field: string, cb?: Callback<number>): Promise<R>;

		/**
		 * Get the value of a hash field.
		 */
		hget(key: string, field: string, cb?: Callback<string>): Promise<R>;
		HGET(key: string, field: string, cb?: Callback<string>): Promise<R>;

		/**
		 * Get all fields and values in a hash.
		 */
		hgetall(key: string, cb?: Callback<{ [key: string]: string }>): Promise<R>;
		HGETALL(key: string, cb?: Callback<{ [key: string]: string }>): Promise<R>;

		/**
		 * Increment the integer value of a hash field by the given number.
		 */
		hincrby(key: string, field: string, increment: number, cb?: Callback<number>): Promise<R>;
		HINCRBY(key: string, field: string, increment: number, cb?: Callback<number>): Promise<R>;

		/**
		 * Increment the float value of a hash field by the given amount.
		 */
		hincrbyfloat(key: string, field: string, increment: number, cb?: Callback<string>): Promise<R>;
		HINCRBYFLOAT(key: string, field: string, increment: number, cb?: Callback<string>): Promise<R>;

		/**
		 * Get all the fields of a hash.
		 */
		hkeys(key: string, cb?: Callback<string[]>): Promise<R>;
		HKEYS(key: string, cb?: Callback<string[]>): Promise<R>;

		/**
		 * Get the number of fields in a hash.
		 */
		hlen(key: string, cb?: Callback<number>): Promise<R>;
		HLEN(key: string, cb?: Callback<number>): Promise<R>;

		/**
		 * Get the values of all the given hash fields.
		 */
		hmget: OverloadedKeyCommand<string, string[], Promise<R>>;
		HMGET: OverloadedKeyCommand<string, string[], Promise<R>>;

		/**
		 * Set the string value of a hash field.
		 */
		hset(key: string, field: string, value: string, cb?: Callback<number>): Promise<R>;
		HSET(key: string, field: string, value: string, cb?: Callback<number>): Promise<R>;

		/**
		 * Set the value of a hash field, only if the field does not exist.
		 */
		hsetnx(key: string, field: string, value: string, cb?: Callback<number>): Promise<R>;
		HSETNX(key: string, field: string, value: string, cb?: Callback<number>): Promise<R>;

		/**
		 * Get the length of the value of a hash field.
		 */
		hstrlen(key: string, field: string, cb?: Callback<number>): Promise<R>;
		HSTRLEN(key: string, field: string, cb?: Callback<number>): Promise<R>;

		/**
		 * Get all the values of a hash.
		 */
		hvals(key: string, cb?: Callback<string[]>): Promise<R>;
		HVALS(key: string, cb?: Callback<string[]>): Promise<R>;

		/**
		 * Increment the integer value of a key by one.
		 */
		incr(key: string, cb?: Callback<number>): R;
		INCR(key: string, cb?: Callback<number>): R;

		/**
		 * Increment the integer value of a key by the given amount.
		 */
		incrby(key: string, increment: number, cb?: Callback<number>): Promise<R>;
		INCRBY(key: string, increment: number, cb?: Callback<number>): Promise<R>;

		/**
		 * Increment the float value of a key by the given amount.
		 */
		incrbyfloat(key: string, increment: number, cb?: Callback<string>): Promise<R>;
		INCRBYFLOAT(key: string, increment: number, cb?: Callback<string>): Promise<R>;

		/**
		 * Find all keys matching the given pattern.
		 */
		keys(pattern: string, cb?: Callback<string[]>): Promise<R>;
		KEYS(pattern: string, cb?: Callback<string[]>): Promise<R>;

		/**
		 * Get the UNIX time stamp of the last successful save to disk.
		 */
		lastsave(cb?: Callback<number>): Promise<R>;
		LASTSAVE(cb?: Callback<number>): Promise<R>;

		/**
		 * Get an element from a list by its index.
		 */
		lindex(key: string, index: number, cb?: Callback<string>): Promise<R>;
		LINDEX(key: string, index: number, cb?: Callback<string>): Promise<R>;

		/**
		 * Insert an element before or after another element in a list.
		 */
		linsert(key: string, dir: "BEFORE" | "AFTER", pivot: string, value: string, cb?: Callback<string>): Promise<R>;
		LINSERT(key: string, dir: "BEFORE" | "AFTER", pivot: string, value: string, cb?: Callback<string>): Promise<R>;

		/**
		 * Get the length of a list.
		 */
		llen(key: string, cb?: Callback<number>): Promise<R>;
		LLEN(key: string, cb?: Callback<number>): Promise<R>;

		/**
		 * Remove and get the first element in a list.
		 */
		lpop(key: string, cb?: Callback<string>): Promise<R>;
		LPOP(key: string, cb?: Callback<string>): Promise<R>;

		/**
		 * Prepend one or multiple values to a list.
		 */
		lpush: OverloadedKeyCommand<string, number, Promise<R>>;
		LPUSH: OverloadedKeyCommand<string, number, Promise<R>>;

		/**
		 * Prepend a value to a list, only if the list exists.
		 */
		lpushx(key: string, value: string, cb?: Callback<number>): Promise<R>;
		LPUSHX(key: string, value: string, cb?: Callback<number>): Promise<R>;

		/**
		 * Get a range of elements from a list.
		 */
		lrange(key: string, start: number, stop: number, cb?: Callback<string[]>): Promise<R>;
		LRANGE(key: string, start: number, stop: number, cb?: Callback<string[]>): Promise<R>;

		/**
		 * Remove elements from a list.
		 */
		lrem(key: string, count: number, value: string, cb?: Callback<number>): Promise<R>;
		LREM(key: string, count: number, value: string, cb?: Callback<number>): Promise<R>;

		/**
		 * Set the value of an element in a list by its index.
		 */
		lset(key: string, index: number, value: string, cb?: Callback<"OK">): Promise<R>;
		LSET(key: string, index: number, value: string, cb?: Callback<"OK">): Promise<R>;

		/**
		 * Trim a list to the specified range.
		 */
		ltrim(key: string, start: number, stop: number, cb?: Callback<"OK">): Promise<R>;
		LTRIM(key: string, start: number, stop: number, cb?: Callback<"OK">): Promise<R>;

		/**
		 * Get the values of all given keys.
		 */
		mget: OverloadedCommand<string, string[], Promise<R>>;
		MGET: OverloadedCommand<string, string[], Promise<R>>;

		/**
		 * Atomically tranfer a key from a Redis instance to another one.
		 */
		migrate: OverloadedCommand<string, boolean, Promise<R>>;
		MIGRATE: OverloadedCommand<string, boolean, Promise<R>>;

		/**
		 * Move a key to another database.
		 */
		move(key: string, db: string | number): Promise<R>;
		MOVE(key: string, db: string | number): Promise<R>;

		/**
		 * Set multiple keys to multiple values.
		 */
		mset: OverloadedCommand<string, boolean, Promise<R>>;
		MSET: OverloadedCommand<string, boolean, Promise<R>>;

		/**
		 * Set multiple keys to multiple values, only if none of the keys exist.
		 */
		msetnx: OverloadedCommand<string, boolean, Promise<R>>;
		MSETNX: OverloadedCommand<string, boolean, Promise<R>>;

		/**
		 * Inspect the internals of Redis objects.
		 */
		object: OverloadedCommand<string, any, Promise<R>>;
		OBJECT: OverloadedCommand<string, any, Promise<R>>;

		/**
		 * Remove the expiration from a key.
		 */
		persist(key: string, cb?: Callback<number>): Promise<R>;
		PERSIST(key: string, cb?: Callback<number>): Promise<R>;

		/**
		 * Remove a key"s time to live in milliseconds.
		 */
		pexpire(key: string, milliseconds: number, cb?: Callback<number>): Promise<R>;
		PEXPIRE(key: string, milliseconds: number, cb?: Callback<number>): Promise<R>;

		/**
		 * Set the expiration for a key as a UNIX timestamp specified in milliseconds.
		 */
		pexpireat(key: string, millisecondsTimestamp: number, cb?: Callback<number>): Promise<R>;
		PEXPIREAT(key: string, millisecondsTimestamp: number, cb?: Callback<number>): Promise<R>;

		/**
		 * Adds the specified elements to the specified HyperLogLog.
		 */
		pfadd: OverloadedKeyCommand<string, number, Promise<R>>;
		PFADD: OverloadedKeyCommand<string, number, Promise<R>>;

		/**
		 * Return the approximated cardinality of the set(s) observed by the HyperLogLog at key(s).
		 */
		pfcount: OverloadedCommand<string, number, Promise<R>>;
		PFCOUNT: OverloadedCommand<string, number, Promise<R>>;

		/**
		 * Merge N different HyperLogLogs into a single one.
		 */
		pfmerge: OverloadedCommand<string, boolean, Promise<R>>;
		PFMERGE: OverloadedCommand<string, boolean, Promise<R>>;

		/**
		 * Set the value and expiration in milliseconds of a key.
		 */
		psetex(key: string, milliseconds: number, value: string, cb?: Callback<"OK">): Promise<R>;
		PSETEX(key: string, milliseconds: number, value: string, cb?: Callback<"OK">): Promise<R>;

		/**
		 * Inspect the state of the Pub/Sub subsytem.
		 */
		pubsub: OverloadedCommand<string, number, Promise<R>>;
		PUBSUB: OverloadedCommand<string, number, Promise<R>>;

		/**
		 * Get the time to live for a key in milliseconds.
		 */
		pttl(key: string, cb?: Callback<number>): Promise<R>;
		PTTL(key: string, cb?: Callback<number>): Promise<R>;

		/**
		 * Close the connection.
		 */
		quit(cb?: Callback<"OK">): Promise<R>;
		QUIT(cb?: Callback<"OK">): Promise<R>;

		/**
		 * Return a random key from the keyspace.
		 */
		randomkey(cb?: Callback<string>): Promise<R>;
		RANDOMKEY(cb?: Callback<string>): Promise<R>;

		/**
		 * Enables read queries for a connection to a cluster slave node.
		 */
		readonly(cb?: Callback<string>): Promise<R>;
		READONLY(cb?: Callback<string>): Promise<R>;

		/**
		 * Disables read queries for a connection to cluster slave node.
		 */
		readwrite(cb?: Callback<string>): Promise<R>;
		READWRITE(cb?: Callback<string>): Promise<R>;

		/**
		 * Rename a key.
		 */
		rename(key: string, newkey: string, cb?: Callback<"OK">): Promise<R>;
		RENAME(key: string, newkey: string, cb?: Callback<"OK">): Promise<R>;

		/**
		 * Rename a key, only if the new key does not exist.
		 */
		renamenx(key: string, newkey: string, cb?: Callback<number>): Promise<R>;
		RENAMENX(key: string, newkey: string, cb?: Callback<number>): Promise<R>;

		/**
		 * Create a key using the provided serialized value, previously obtained using DUMP.
		 */
		restore(key: string, ttl: number, serializedValue: string, cb?: Callback<"OK">): Promise<R>;
		RESTORE(key: string, ttl: number, serializedValue: string, cb?: Callback<"OK">): Promise<R>;

		/**
		 * Return the role of the instance in the context of replication.
		 */
		role(cb?: Callback<[string, number, Array<[string, string, string]>]>): Promise<R>;
		ROLE(cb?: Callback<[string, number, Array<[string, string, string]>]>): Promise<R>;

		/**
		 * Remove and get the last element in a list.
		 */
		rpop(key: string, cb?: Callback<string>): Promise<R>;
		RPOP(key: string, cb?: Callback<string>): Promise<R>;

		/**
		 * Remove the last element in a list, prepend it to another list and return it.
		 */
		rpoplpush(source: string, destination: string, cb?: Callback<string>): Promise<R>;
		RPOPLPUSH(source: string, destination: string, cb?: Callback<string>): Promise<R>;

		/**
		 * Append one or multiple values to a list.
		 */
		rpush: OverloadedKeyCommand<string, number, Promise<R>>;
		RPUSH: OverloadedKeyCommand<string, number, Promise<R>>;

		/**
		 * Append a value to a list, only if the list exists.
		 */
		rpushx(key: string, value: string, cb?: Callback<number>): Promise<R>;
		RPUSHX(key: string, value: string, cb?: Callback<number>): Promise<R>;

		/**
		 * Append one or multiple members to a set.
		 */
		sadd: OverloadedKeyCommand<string, number, Promise<R>>;
		SADD: OverloadedKeyCommand<string, number, Promise<R>>;

		/**
		 * Synchronously save the dataset to disk.
		 */
		save(cb?: Callback<string>): Promise<R>;
		SAVE(cb?: Callback<string>): Promise<R>;

		/**
		 * Get the number of members in a set.
		 */
		scard(key: string, cb?: Callback<number>): Promise<R>;
		SCARD(key: string, cb?: Callback<number>): Promise<R>;

		/**
		 * DEBUG - Set the debug mode for executed scripts.
		 * EXISTS - Check existence of scripts in the script cache.
		 * FLUSH - Remove all scripts from the script cache.
		 * KILL - Kill the script currently in execution.
		 * LOAD - Load the specified Lua script into the script cache.
		 */
		script: OverloadedCommand<string, any, Promise<R>>;
		SCRIPT: OverloadedCommand<string, any, Promise<R>>;

		/**
		 * Subtract multiple sets.
		 */
		sdiff: OverloadedCommand<string, string[], Promise<R>>;
		SDIFF: OverloadedCommand<string, string[], Promise<R>>;

		/**
		 * Subtract multiple sets and store the resulting set in a key.
		 */
		sdiffstore: OverloadedKeyCommand<string, number, Promise<R>>;
		SDIFFSTORE: OverloadedKeyCommand<string, number, Promise<R>>;

		/**
		 * Change the selected database for the current connection.
		 */
		select(index: number | string, cb?: Callback<string>): Promise<R>;
		SELECT(index: number | string, cb?: Callback<string>): Promise<R>;

		/**
		 * Set the string value of a key.
		 */
		set(key: string, value: string, cb?: Callback<"OK">): Promise<R>;
		set(key: string, value: string, flag: string, cb?: Callback<"OK">): Promise<R>;
		set(key: string, value: string, mode: string, duration: number, cb?: Callback<"OK" | undefined>): Promise<R>;
		set(key: string, value: string, mode: string, duration: number, flag: string, cb?: Callback<"OK" | undefined>): Promise<R>;
		SET(key: string, value: string, cb?: Callback<"OK">): Promise<R>;
		SET(key: string, value: string, flag: string, cb?: Callback<"OK">): Promise<R>;
		SET(key: string, value: string, mode: string, duration: number, cb?: Callback<"OK" | undefined>): Promise<R>;
		SET(key: string, value: string, mode: string, duration: number, flag: string, cb?: Callback<"OK" | undefined>): Promise<R>;

		/**
		 * Sets or clears the bit at offset in the string value stored at key.
		 */
		setbit(key: string, offset: number, value: string, cb?: Callback<number>): Promise<R>;
		SETBIT(key: string, offset: number, value: string, cb?: Callback<number>): Promise<R>;

		/**
		 * Set the value and expiration of a key.
		 */
		setex(key: string, seconds: number, value: string, cb?: Callback<string>): Promise<R>;
		SETEX(key: string, seconds: number, value: string, cb?: Callback<string>): Promise<R>;

		/**
		 * Set the value of a key, only if the key does not exist.
		 */
		setnx(key: string, value: string, cb?: Callback<number>): Promise<R>;
		SETNX(key: string, value: string, cb?: Callback<number>): Promise<R>;

		/**
		 * Overwrite part of a string at key starting at the specified offset.
		 */
		setrange(key: string, offset: number, value: string, cb?: Callback<number>): Promise<R>;
		SETRANGE(key: string, offset: number, value: string, cb?: Callback<number>): Promise<R>;

		/**
		 * Synchronously save the dataset to disk and then shut down the server.
		 */
		shutdown: OverloadedCommand<string, string, Promise<R>>;
		SHUTDOWN: OverloadedCommand<string, string, Promise<R>>;

		/**
		 * Intersect multiple sets.
		 */
		sinter: OverloadedKeyCommand<string, string[], Promise<R>>;
		SINTER: OverloadedKeyCommand<string, string[], Promise<R>>;

		/**
		 * Intersect multiple sets and store the resulting set in a key.
		 */
		sinterstore: OverloadedCommand<string, number, Promise<R>>;
		SINTERSTORE: OverloadedCommand<string, number, Promise<R>>;

		/**
		 * Determine if a given value is a member of a set.
		 */
		sismember(key: string, member: string, cb?: Callback<number>): Promise<R>;
		SISMEMBER(key: string, member: string, cb?: Callback<number>): Promise<R>;

		/**
		 * Make the server a slave of another instance, or promote it as master.
		 */
		slaveof(host: string, port: string | number, cb?: Callback<string>): Promise<R>;
		SLAVEOF(host: string, port: string | number, cb?: Callback<string>): Promise<R>;

		/**
		 * Manages the Redis slow queries log.
		 */
		slowlog: OverloadedCommand<string, Array<[number, number, number, string[]]>, Promise<R>>;
		SLOWLOG: OverloadedCommand<string, Array<[number, number, number, string[]]>, Promise<R>>;

		/**
		 * Get all the members in a set.
		 */
		smembers(key: string, cb?: Callback<string[]>): Promise<R>;
		SMEMBERS(key: string, cb?: Callback<string[]>): Promise<R>;

		/**
		 * Move a member from one set to another.
		 */
		smove(source: string, destination: string, member: string, cb?: Callback<number>): Promise<R>;
		SMOVE(source: string, destination: string, member: string, cb?: Callback<number>): Promise<R>;

		/**
		 * Sort the elements in a list, set or sorted set.
		 */
		sort: OverloadedCommand<string, string[], Promise<R>>;
		SORT: OverloadedCommand<string, string[], Promise<R>>;

		/**
		 * Remove and return one or multiple random members from a set.
		 */
		spop(key: string, cb?: Callback<string>): Promise<R>;
		spop(key: string, count: number, cb?: Callback<string[]>): Promise<R>;
		SPOP(key: string, cb?: Callback<string>): Promise<R>;
		SPOP(key: string, count: number, cb?: Callback<string[]>): Promise<R>;

		/**
		 * Get one or multiple random members from a set.
		 */
		srandmember(key: string, cb?: Callback<string>): Promise<R>;
		srandmember(key: string, count: number, cb?: Callback<string[]>): Promise<R>;
		SRANDMEMBER(key: string, cb?: Callback<string>): Promise<R>;
		SRANDMEMBER(key: string, count: number, cb?: Callback<string[]>): Promise<R>;

		/**
		 * Remove one or more members from a set.
		 */
		srem: OverloadedKeyCommand<string, number, Promise<R>>;
		SREM: OverloadedKeyCommand<string, number, Promise<R>>;

		/**
		 * Get the length of the value stored in a key.
		 */
		strlen(key: string, cb?: Callback<number>): Promise<R>;
		STRLEN(key: string, cb?: Callback<number>): Promise<R>;

		/**
		 * Add multiple sets.
		 */
		sunion: OverloadedCommand<string, string[], Promise<R>>;
		SUNION: OverloadedCommand<string, string[], Promise<R>>;

		/**
		 * Add multiple sets and store the resulting set in a key.
		 */
		sunionstore: OverloadedCommand<string, number, Promise<R>>;
		SUNIONSTORE: OverloadedCommand<string, number, Promise<R>>;

		/**
		 * Internal command used for replication.
		 */
		sync(cb?: Callback<undefined>): Promise<R>;
		SYNC(cb?: Callback<undefined>): Promise<R>;

		/**
		 * Return the current server time.
		 */
		time(cb?: Callback<[string, string]>): Promise<R>;
		TIME(cb?: Callback<[string, string]>): Promise<R>;

		/**
		 * Get the time to live for a key.
		 */
		ttl(key: string, cb?: Callback<number>): Promise<R>;
		TTL(key: string, cb?: Callback<number>): Promise<R>;

		/**
		 * Determine the type stored at key.
		 */
		type(key: string, cb?: Callback<string>): Promise<R>;
		TYPE(key: string, cb?: Callback<string>): Promise<R>;

		/**
		 * Forget about all watched keys.
		 */
		unwatch(cb?: Callback<"OK">): Promise<R>;
		UNWATCH(cb?: Callback<"OK">): Promise<R>;

		/**
		 * Wait for the synchronous replication of all the write commands sent in the context of the current connection.
		 */
		wait(numslaves: number, timeout: number, cb?: Callback<number>): Promise<R>;
		WAIT(numslaves: number, timeout: number, cb?: Callback<number>): Promise<R>;

		/**
		 * Watch the given keys to determine execution of the MULTI/EXEC block.
		 */
		watch: OverloadedCommand<string, "OK", Promise<R>>;
		WATCH: OverloadedCommand<string, "OK", Promise<R>>;

		/**
		 * Add one or more members to a sorted set, or update its score if it already exists.
		 */
		zadd: OverloadedKeyCommand<string | number, number, Promise<R>>;
		ZADD: OverloadedKeyCommand<string | number, number, Promise<R>>;

		/**
		 * Get the number of members in a sorted set.
		 */
		zcard(key: string, cb?: Callback<number>): Promise<R>;
		ZCARD(key: string, cb?: Callback<number>): Promise<R>;

		/**
		 * Count the members in a sorted set with scores between the given values.
		 */
		zcount(key: string, min: number | string, max: number | string, cb?: Callback<number>): Promise<R>;
		ZCOUNT(key: string, min: number | string, max: number | string, cb?: Callback<number>): Promise<R>;

		/**
		 * Increment the score of a member in a sorted set.
		 */
		zincrby(key: string, increment: number, member: string, cb?: Callback<string>): Promise<R>;
		ZINCRBY(key: string, increment: number, member: string, cb?: Callback<string>): Promise<R>;

		/**
		 * Intersect multiple sorted sets and store the resulting sorted set in a new key.
		 */
		zinterstore: OverloadedCommand<string | number, number, Promise<R>>;
		ZINTERSTORE: OverloadedCommand<string | number, number, Promise<R>>;

		/**
		 * Count the number of members in a sorted set between a given lexicographic range.
		 */
		zlexcount(key: string, min: string, max: string, cb?: Callback<number>): Promise<R>;
		ZLEXCOUNT(key: string, min: string, max: string, cb?: Callback<number>): Promise<R>;

		/**
		 * Return a range of members in a sorted set, by index.
		 */
		zrange(key: string, start: number, stop: number, cb?: Callback<string[]>): Promise<R>;
		zrange(key: string, start: number, stop: number, withscores: string, cb?: Callback<string[]>): Promise<R>;
		ZRANGE(key: string, start: number, stop: number, cb?: Callback<string[]>): Promise<R>;
		ZRANGE(key: string, start: number, stop: number, withscores: string, cb?: Callback<string[]>): Promise<R>;

		/**
		 * Return a range of members in a sorted set, by lexicographical range.
		 */
		zrangebylex(key: string, min: string, max: string, cb?: Callback<string[]>): Promise<R>;
		zrangebylex(key: string, min: string, max: string, limit: string, offset: number, count: number, cb?: Callback<string[]>): Promise<R>;
		ZRANGEBYLEX(key: string, min: string, max: string, cb?: Callback<string[]>): Promise<R>;
		ZRANGEBYLEX(key: string, min: string, max: string, limit: string, offset: number, count: number, cb?: Callback<string[]>): Promise<R>;

		/**
		 * Return a range of members in a sorted set, by lexicographical range, ordered from higher to lower strings.
		 */
		zrevrangebylex(key: string, min: string, max: string, cb?: Callback<string[]>): Promise<R>;
		zrevrangebylex(key: string, min: string, max: string, limit: string, offset: number, count: number, cb?: Callback<string[]>): Promise<R>;
		ZREVRANGEBYLEX(key: string, min: string, max: string, cb?: Callback<string[]>): Promise<R>;
		ZREVRANGEBYLEX(key: string, min: string, max: string, limit: string, offset: number, count: number, cb?: Callback<string[]>): Promise<R>;

		/**
		 * Return a range of members in a sorted set, by score.
		 */
		zrangebyscore(key: string, min: number | string, max: number | string, cb?: Callback<string[]>): Promise<R>;
		zrangebyscore(key: string, min: number | string, max: number | string, withscores: string, cb?: Callback<string[]>): Promise<R>;
		zrangebyscore(key: string, min: number | string, max: number | string, limit: string, offset: number, count: number, cb?: Callback<string[]>): Promise<R>;
		zrangebyscore(key: string, min: number | string, max: number | string, withscores: string, limit: string, offset: number, count: number, cb?: Callback<string[]>): Promise<R>;
		ZRANGEBYSCORE(key: string, min: number | string, max: number | string, cb?: Callback<string[]>): Promise<R>;
		ZRANGEBYSCORE(key: string, min: number | string, max: number | string, withscores: string, cb?: Callback<string[]>): Promise<R>;
		ZRANGEBYSCORE(key: string, min: number | string, max: number | string, limit: string, offset: number, count: number, cb?: Callback<string[]>): Promise<R>;
		ZRANGEBYSCORE(key: string, min: number | string, max: number | string, withscores: string, limit: string, offset: number, count: number, cb?: Callback<string[]>): Promise<R>;

		/**
		 * Determine the index of a member in a sorted set.
		 */
		zrank(key: string, member: string, cb?: Callback<number | null>): Promise<R>;
		ZRANK(key: string, member: string, cb?: Callback<number | null>): Promise<R>;

		/**
		 * Remove one or more members from a sorted set.
		 */
		zrem: OverloadedKeyCommand<string, number, Promise<R>>;
		ZREM: OverloadedKeyCommand<string, number, Promise<R>>;

		/**
		 * Remove all members in a sorted set between the given lexicographical range.
		 */
		zremrangebylex(key: string, min: string, max: string, cb?: Callback<number>): Promise<R>;
		ZREMRANGEBYLEX(key: string, min: string, max: string, cb?: Callback<number>): Promise<R>;

		/**
		 * Remove all members in a sorted set within the given indexes.
		 */
		zremrangebyrank(key: string, start: number, stop: number, cb?: Callback<number>): Promise<R>;
		ZREMRANGEBYRANK(key: string, start: number, stop: number, cb?: Callback<number>): Promise<R>;

		/**
		 * Remove all members in a sorted set within the given indexes.
		 */
		zremrangebyscore(key: string, min: string | number, max: string | number, cb?: Callback<number>): Promise<R>;
		ZREMRANGEBYSCORE(key: string, min: string | number, max: string | number, cb?: Callback<number>): Promise<R>;

		/**
		 * Return a range of members in a sorted set, by index, with scores ordered from high to low.
		 */
		zrevrange(key: string, start: number, stop: number, cb?: Callback<string[]>): Promise<R>;
		zrevrange(key: string, start: number, stop: number, withscores: string, cb?: Callback<string[]>): Promise<R>;
		ZREVRANGE(key: string, start: number, stop: number, cb?: Callback<string[]>): Promise<R>;
		ZREVRANGE(key: string, start: number, stop: number, withscores: string, cb?: Callback<string[]>): Promise<R>;

		/**
		 * Return a range of members in a sorted set, by score, with scores ordered from high to low.
		 */
		zrevrangebyscore(key: string, min: number | string, max: number | string, cb?: Callback<string[]>): Promise<R>;
		zrevrangebyscore(key: string, min: number | string, max: number | string, withscores: string, cb?: Callback<string[]>): Promise<R>;
		zrevrangebyscore(key: string, min: number | string, max: number | string, limit: string, offset: number, count: number, cb?: Callback<string[]>): Promise<R>;
		zrevrangebyscore(key: string, min: number | string, max: number | string, withscores: string, limit: string, offset: number, count: number, cb?: Callback<string[]>): Promise<R>;
		ZREVRANGEBYSCORE(key: string, min: number | string, max: number | string, cb?: Callback<string[]>): Promise<R>;
		ZREVRANGEBYSCORE(key: string, min: number | string, max: number | string, withscores: string, cb?: Callback<string[]>): Promise<R>;
		ZREVRANGEBYSCORE(key: string, min: number | string, max: number | string, limit: string, offset: number, count: number, cb?: Callback<string[]>): Promise<R>;
		ZREVRANGEBYSCORE(key: string, min: number | string, max: number | string, withscores: string, limit: string, offset: number, count: number, cb?: Callback<string[]>): Promise<R>;

		/**
		 * Determine the index of a member in a sorted set, with scores ordered from high to low.
		 */
		zrevrank(key: string, member: string, cb?: Callback<number | null>): Promise<R>;
		ZREVRANK(key: string, member: string, cb?: Callback<number | null>): Promise<R>;

		/**
		 * Get the score associated with the given member in a sorted set.
		 */
		zscore(key: string, member: string, cb?: Callback<string>): Promise<R>;
		ZSCORE(key: string, member: string, cb?: Callback<string>): Promise<R>;

		/**
		 * Add multiple sorted sets and store the resulting sorted set in a new key.
		 */
		zunionstore: OverloadedCommand<string | number, number, Promise<R>>;
		ZUNIONSTORE: OverloadedCommand<string | number, number, Promise<R>>;

		/**
		 * Incrementally iterate the keys space.
		 */
		scan: OverloadedCommand<string, [string, string[]], Promise<R>>;
		SCAN: OverloadedCommand<string, [string, string[]], Promise<R>>;

		/**
		 * Incrementally iterate Set elements.
		 */
		sscan: OverloadedKeyCommand<string, [string, string[]], Promise<R>>;
		SSCAN: OverloadedKeyCommand<string, [string, string[]], Promise<R>>;

		/**
		 * Incrementally iterate hash fields and associated values.
		 */
		hscan: OverloadedKeyCommand<string, [string, string[]], Promise<R>>;
		HSCAN: OverloadedKeyCommand<string, [string, string[]], Promise<R>>;

		/**
		 * Incrementally iterate sorted sets elements and associated scores.
		 */
		zscan: OverloadedKeyCommand<string, [string, string[]], Promise<R>>;
		ZSCAN: OverloadedKeyCommand<string, [string, string[]], Promise<R>>;
	}

	export const RedisClient: new (options: ClientOpts) => RedisClient;

	export interface RedisClient extends Commands<boolean>, EventEmitter {
		connected: boolean;
		command_queue_length: number;
		offline_queue_length: number;
		retry_delay: number;
		retry_backoff: number;
		command_queue: any[];
		offline_queue: any[];
		connection_id: number;
		server_info: ServerInfo;
		stream: Duplex;

		on(event: "message" | "message_buffer", listener: (channel: string, message: string) => void): this;
		on(event: "pmessage" | "pmessage_buffer", listener: (pattern: string, channel: string, message: string) => void): this;
		on(event: "subscribe" | "unsubscribe", listener: (channel: string, count: number) => void): this;
		on(event: "psubscribe" | "punsubscribe", listener: (pattern: string, count: number) => void): this;
		on(event: string, listener: (...args: any[]) => void): this;

		/**
		 * Client methods.
		 */

		end(flush?: boolean): void;
		unref(): void;

		cork(): void;
		uncork(): void;

		duplicate(options?: ClientOpts, cb?: Callback<RedisClient>): RedisClient;

		sendCommand(command: string, cb?: Callback<any>): boolean;
		sendCommand(command: string, args?: any[], cb?: Callback<any>): boolean;
		send_command(command: string, cb?: Callback<any>): boolean;
		send_command(command: string, args?: any[], cb?: Callback<any>): boolean;

		addCommand(command: string): void;
		add_command(command: string): void;

		/**
		 * Mark the start of a transaction block.
		 */
		multi(args?: Array<Array<string | number | Callback<any>>>): Multi;
		MULTI(args?: Array<Array<string | number | Callback<any>>>): Multi;

		batch(args?: Array<Array<string | number | Callback<any>>>): Multi;
		BATCH(args?: Array<Array<string | number | Callback<any>>>): Multi;
	}

	export const Multi: new () => Multi;

	export interface Multi extends Commands<Multi> {
		exec(cb?: Callback<any[]>): boolean;
		EXEC(cb?: Callback<any[]>): boolean;

		exec_atomic(cb?: Callback<any[]>): boolean;
		EXEC_ATOMIC(cb?: Callback<any[]>): boolean;
	}

	export let debug_mode: boolean;

	export function createClient(port: number, host?: string, options?: ClientOpts): RedisClient;
	export function createClient(unix_socket: string, options?: ClientOpts): RedisClient;
	export function createClient(redis_url: string, options?: ClientOpts): RedisClient;
	export function createClient(options?: ClientOpts): RedisClient;

	export function print(err: Error | null, reply: any): void;

	export class RedisError extends Error {
		name: string;
	}
	export class ReplyError extends RedisError {
		command: string;
		args?: unknown[];
		code: string;
	}
	export class AbortError extends RedisError {
		command: string;
		args?: unknown[];
		code?: string;
	}
	export class ParserError extends RedisError {
		offset: number;
		buffer: Buffer;
	}
	export class AggregateError extends AbortError { }

}
