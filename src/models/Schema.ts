import { ERElement } from "./Element";
import { Enum } from "./Enum";
import { Ref } from "./Ref";
import { Table } from "./Table";

export class Schema extends ERElement{
    name!: string;
    alias!: string;
    note!: string;
    tables!: Table[];
    refs!: Ref[];
    enums!: Enum[];

    // fromJSON(jsonObj: Schema) {
    //     this.name = jsonObj.name;
    //     this.alias = jsonObj.alias;
    //     this.note = jsonObj.note;
    //     this.tables = jsonObj.tables.map(t => {
    //         let table = new Table()

    //         table.name = t.name;
    //         table.alias = t.alias;
    //         table.note = t.note;
    //         table.fields = t.fields;
    //         table.schema = t.schema;
    //         table.headerColor = t.headerColor;

    //         return table;
    //     });
    //     this.refs = jsonObj.refs;
    //     this.enums = jsonObj.enums;
    // }
    
}