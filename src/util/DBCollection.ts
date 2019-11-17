import Collection from "./Collection";
import { mongo } from "../modules/Database";
import deasync from "deasync";
import short from "short-uuid";
import { Collection as MDBCol } from "mongodb";
const uuid = (len = 7) => short().generate().slice(0, len).toLowerCase();

export default class DBCollection<V> extends Collection<V> {
	db: string;
	col: string;
	field: string;
	id: string;
	constructor(db: string, col: string, field: string, id: string) {
		super();
		this.db = db;
		this.col = col;
		this.field = field;
		this.id = id;

		// const d = deasync(this.mdb.findOne).call(this.mdb, { id });
		// if (!d) throw new Error("db entry not found");
		// if (d.modlog && d.modlog.length > 0) this.addFromArray(...d.modlog);
	}

	get mdb(): MDBCol<any> {
		return; // mongo.db(this.db).collection(this.col);
	}

	set(id: string, prop: V) {
		/*deasync(this.mdb.findOneAndUpdate).call(this.mdb, {
			id: this.id
		}, {
			$push: {
				[this.field]: {
					id, ...prop
				}
			}
		});*/
		super.set(id, prop);
		return this;
	}

	async add(data: V) {
		const id = uuid();
		this.set(id, data);
		return {
			id,
			...data
		};
	}

	delete(id: string) {
		if (!this.has(id)) return false;
		/*deasync(this.mdb.findOneAndUpdate).call(this.mdb, {
			id: this.id
		}, {
			$pull: {
				[this.field]: { id }
			}
		});*/
		super.delete(id);
		return true;
	}
}
