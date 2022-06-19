import { ERElement } from "./Element";
import { Schema } from "./Schema";

export interface IRenderer {
  /**
   * Renders and object to the UI.
   * @param object An object to be rendered to the UI.
   */
  render(object: Schema): void;

  _clear(): void;
}
