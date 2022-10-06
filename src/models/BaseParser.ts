import { IProcessor, ProcessorOptions } from "./IProcessor";
import { IRenderer } from "./IRenderer";
import { Schema } from "./Schema";

export class BaseProcessor implements IProcessor {
    public renderer: IRenderer;
    
    constructor(options: ProcessorOptions) {
        this.renderer = options.renderer;
    }
    
    _render(object: Schema): void {
        this.renderer.render(object);
    }
}