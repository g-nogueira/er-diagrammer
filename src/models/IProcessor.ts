import { IRenderer } from "./IRenderer";
import { ERElement } from "./Element";
import { Schema } from "./Schema";

export type ProcessorOptions = {
  renderer: IRenderer;
};

export interface IProcessor {
  renderer: IRenderer;

  /**
   * Calls the IRenderer to render some object.
   * @param object An object to be rendered to the UI.
   */
  _render(object: Schema): void;

}
