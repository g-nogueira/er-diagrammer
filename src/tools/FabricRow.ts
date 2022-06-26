import fabric, { IRectOptions, ITextOptions } from "fabric/fabric-impl";
import { fillDefaultValues } from "./FabricGenerator";
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
  rowRect?: fabric.Rect;
  text?: fabric.Text;
  table?: FabricTable;

  label: string = "";
  fontSize: number = 20;
  textColor: string = "black";
  textAlign: CanvasTextAlign = "start";
  minWidth: number = 200;

  paddingX: number = 5;
  paddingY: number = 2;

  _rowRectOptions: IRectOptions = {
    strokeWidth: 2,
    fill: "white",
    stroke: "black",
    height: 30,
    width: this.minWidth,
    originX: "center",
    originY: "center",
    left: 0,
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
  constructor(options?: IRowOptions) {
    super();

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

    this.rowRect = new fabric.Rect(fillDefaultValues(options, this._rowRectOptions));

    this.rowRect.width = Math.max(options?.table?.width || 0, this.minWidth);
    this.rowRect.width = Math.max(this.label.length * this.fontSize, this.rowRect.width);

    this.width = this.rowRect.width;
    this.height = this.rowRect.height;

    this.add(this.rowRect);
    this.addText(this.label);
  }

  addText(label: string = "") {
    var text = new fabric.Text(label, fillDefaultValues({ fontSize: this.fontSize, fill: this.textColor }, this._textOptions));
    this.text = text;

    this.add(text);
    this._recalculateText();
  }

  setWidth(value: number) {
    this.width = value;
    this.rowRect && (this.rowRect.width = value);
    this._recalculateText();
  }

  setHeight(value: number) {
    this.height = value;
    this.rowRect && (this.rowRect.height = value);
  }

  _recalculateText() {
    if (!this.text) return;

    var x = 0;

    if (this.textAlign === "center") {
      x -= (this.text.width || 0) / 2;
    } else {
      x = -(this.rowRect?.width || 0) / 2 + this.paddingX;
    }

    this.text.left = x;
    this.text.setOptions(fillDefaultValues({ fontSize: this.fontSize, fill: this.textColor }, this._textOptions));
  }

  _render(ctx: CanvasRenderingContext2D): void {
    super._render(ctx);

    // if (!this.label || !this.width || !this.height) return;

    // ctx.font = `${this.fontSize}px Helvetica`;
    // ctx.fillStyle = this.fillStyle;
    // ctx.textAlign = this.textAlign;

    // if (this.textAlign === "center") {
    //   ctx.fillText(this.label, 0, this.height / 2 - this.fontSize / 2);
    // } else {
    //   ctx.fillText(this.label, -this.width / 2 + this.paddingX, +this.height / 2 - this.fontSize / 2);
    // }
  }
}
