import { ERElement } from "./Element";
import { Field } from "./Field";
import { Schema } from "./Schema";

export class Table extends ERElement {
    name!: string;
    alias!: string;
    note!: string;
    fields!: Field[];
    // indexes: Index[];
    schema!: Schema;
    headerColor!: string;
}