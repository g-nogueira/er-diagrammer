import { ERElement } from "./Element";
import { Field } from "./Field";

export class Endpoint extends ERElement {
    relation: any;
    schemaName!: string;
    tableName!: string;
    fieldNames!: string[];
    fields!: Field[];
}