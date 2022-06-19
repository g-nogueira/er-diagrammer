import { ERElement } from "./Element";
import { Endpoint } from "./Endpoint";
import { Table } from "./Table";

export class Field extends ERElement {
    name!: string;
    type: any;
    unique!: boolean;
    pk!: boolean;
    // dbState: DbState;
    not_null!: boolean;
    note!: string;
    dbdefault: any;
    increment!: boolean;
    table!: Table;
    endpoints!: Endpoint[];
}