import { fabric } from "fabric";
import { IEvent, IRectOptions, ITextOptions } from "fabric/fabric-impl";
import { fillDefaultValues } from "../../tools/FabricGenerator";
import { FabricTable } from "./FabricTable";

export interface IRowOptions extends fabric.IRectOptions {
  label?: string;
  fontSize?: number;
  textColor?: string;
  textAlign?: CanvasTextAlign;
  table?: FabricTable;

  paddingX?: number;
  paddingY?: number;
}

export class FabricRow extends fabric.Group {
  type = "TableRow";
  table?: FabricTable;
  order = 0;
  
  label: string = "";
  fontSize: number = 20;
  textColor: string = "black";
  textAlign: CanvasTextAlign = "start";
  minWidth: number = 200;

  paddingX: number = 5;
  paddingY: number = 2;

  _text: fabric.Text = new fabric.Text("");
  _rowRect: fabric.Rect;

  _defaultOptions: IRectOptions = {
    strokeWidth: 0,
    fill: "#f6f6f6",
    stroke: "black",
    height: 30,
    width: this.minWidth,
    originX: "center",
    originY: "center",
    left: 0,
  };

  _hoverOptions: IRectOptions = {
    strokeWidth: 1,
    fill: "#000",
    stroke: "black",
  };

  _textOptions: ITextOptions = {
    fontSize: this.fontSize,
    fontFamily: "Helvetica",
    fill: this.textColor,
    originX: "left",
    originY: "center",
  };

  /**
   * Constructor
   * @param [options] Options object
   */
  constructor(options: IRowOptions = {}) {
    super([], {evented: true});

    options?.top && (this.top = options.top);
    options?.left && (this.left = options.left);
    options?.fontSize && (this.fontSize = options.fontSize);
    options?.textColor && (this.textColor = options.textColor);
    options?.textAlign && (this.textAlign = options.textAlign);
    options?.paddingX && (this.paddingX = options.paddingX);
    options?.paddingY && (this.paddingY = options.paddingY);
    options?.originX && (this.originX = options.originX);
    options?.originY && (this.originY = options.originY);
    options?.label && (this.label = options.label);

    this.table = options?.table;
    this.originX = "center";
    this.originY = "top";

    delete options?.top;
    delete options?.left;
    delete options?.originX;
    delete options?.originY;

    this._rowRect = new fabric.Rect(fillDefaultValues(options, this._defaultOptions));

    this._rowRect.width = Math.max(options?.table?.width || 0, this.minWidth);
    this._rowRect.width = Math.max(this.label.length * this.fontSize, this._rowRect.width);

    this.width = this._rowRect.width;
    this.height = this._rowRect.height;

    this.add(this._rowRect);
    this.addText(this.label);
  }

  get events(): [string, ((e: IEvent) => void) | ((e: IEvent<MouseEvent>) => void)][] {
    return [
      [
        "mouse:move",
        (e: IEvent<MouseEvent>) => {
          let fill = "";
          if (e.subTargets && e.subTargets.some((e) => e === this)) {
            fill = this._hoverOptions.fill as string;
          }
          else {
            fill = this._defaultOptions.fill as string;
          }

          if (fill !== this._rowRect.fill) {
            console.log(fill);
            this._rowRect.fill = fill;
          }
        },
      ]
    ];
  }

  addText(label: string = "") {
    this._text.setOptions(fillDefaultValues({ text: label, fontSize: this.fontSize, fill: this.textColor }, this._textOptions));

    this.add(this._text);
    this._recalculateTextAlignment();
  }

  setWidth(value: number) {
    this.width = value;
    this._rowRect && (this._rowRect.width = value);
    this._recalculateTextAlignment();
  }

  setHeight(value: number) {
    this.height = value;
    this._rowRect && (this._rowRect.height = value);
  }

  /**
   * Recalculates the text alignment
   * @returns
   */
  _recalculateTextAlignment() {
    if (!this._text) return;

    var x = 0;

    if (this.textAlign === "center") {
      x -= (this._text.width || 0) / 2;
    } else {
      x = -(this._rowRect?.width || 0) / 2 + this.paddingX;
    }

    this._text.left = x;
    this._text.setOptions(fillDefaultValues({ fontSize: this.fontSize, fill: this.textColor }, this._textOptions));
  }

  render(ctx: CanvasRenderingContext2D) {
    super.render(ctx);
  }
}
