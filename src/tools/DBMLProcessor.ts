import { Parser } from '@dbml/core';
import { BaseProcessor } from '../models/BaseProcessor';
import { Schema } from './../models/Schema';

export class DBMLProcessor extends BaseProcessor {
    _instanceId = new Date().getTime();

    render(DBMLCode : string): void {

        try {
            
            var result = Parser.parse(DBMLCode, "dbml");
            
            if (!result?.schemas.length) return;
            
            var schema = new Schema();
            schema = result.schemas[0];
            
            super._render(schema);
        } catch (error) {
            this.renderer._clear();
        }
    }

    // constructor(renderer : IRenderer) {
    //     this._renderer = renderer
    // }

    // render(DBML: string): void {
    //     this._renderer.render(DBML);
    // }
}

