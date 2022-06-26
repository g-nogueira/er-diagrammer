import { fillDefaultValues } from "./FabricGenerator";
import { IRowOptions, FabricRow } from "./FabricRow";

export interface IHeaderOptions extends IRowOptions {}

export class FabricHeader extends FabricRow {
    type = "TableHeader";
    _headerOptions: IHeaderOptions = {
      textColor: "white",
      fill: "#316896",
      textAlign: "center",
      height: 35,
    };
  
    /**
     * Constructor
     * @param [options] Options object
     */
    constructor(options?: IHeaderOptions) {
      super(options);
  
      options = fillDefaultValues<IHeaderOptions>(options, this._headerOptions);
  
      if (this.rowRect) {
        options.fill && (this.rowRect.fill = options.fill);
      }
  
      if (this.text) {
        options.textColor && (this.textColor = options.textColor);
        options.textAlign && (this.textAlign = options.textAlign);
        this._recalculateText();
      }
  
      options.height && this.setHeight(options?.height);
  
      this.table && (this.table.header = this);
    }
  }
  