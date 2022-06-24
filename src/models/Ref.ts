import { ERElement } from "./Element";
import { Endpoint } from "./Endpoint";
import { Schema } from "./Schema";

export class Ref extends ERElement{
    name!: string;
    endpoints: Endpoint[] = [];
    onDelete: any;
    onUpdate: any;
    schema: Schema = new Schema();
}