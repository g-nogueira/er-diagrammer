/**
 * The Renderer is responsible for receiving Tables and Relationships,
 * and the Processor is responsible for creating the Tables and Relationships
 */

import { fabric } from "fabric";
import { Canvas, IObjectOptions, Object, Rect } from "fabric/fabric-impl";
import { IRenderer } from "../models/IRenderer";
import { Schema } from "./../models/Schema";

export class FabricRenderer implements IRenderer {
  canvas: Canvas | undefined;
  canvasId: string;
  objectsRendered: Object[] = [];
  options = {
    canvas: {
      width: 1000,
      height: 1000
    },
    table: {
      width: 200,
    },
    row: {
      paddingX: 5,
      paddingY: 2,
      height: 30,
      fill: "white",
      stroke: "black",
      strokeWidth: 2,
      fontSize: 20,
      fillStyle: "#000"
    },
    header: {
      height: 35,
      fill: "#316896",
      stroke: "black",
      strokeWidth: 2,
      fontSize: 20,
      fillStyle: "white"
    }
  };

  constructor(containerId: string, options?: any) {
    this.canvasId = containerId;
    this.options.canvas.width = options?.canvas?.width || this.options.canvas.width;
    this.options.canvas.height = options?.canvas?.height || this.options.canvas.height;
  }

  init() {
    if (this.canvasId && !this.canvas) {
      this.canvas = new fabric.Canvas(this.canvasId, { width: this.options.canvas.width, height: this.options.canvas.height });
    } else {
      throw new Error("Property canvasId not set. It's required to setup this property to initialize the Canvas.");
    }
  }

  render(schema: Schema): void {
    var previousTotalWidth = 0;
    var tables = schema.tables.map((t, i) => {
      let totalTableHeight = t.fields.length * this.options.row.height + this.options.header.height;
      let titleWidth = t.name.length * this.options.row.fontSize;
      let tableWidth = titleWidth > this.options.table.width ? titleWidth :  this.options.table.width;

      // Table
      let table = new this.tableFrame({
        originX: "center",
        originY: "top",
        height: totalTableHeight,
        width: tableWidth
      });

      // Table Title
      let header : Rect = new this.header({
        label: t.name,
        originX: "center",
        originY: "top",
        top: 0,
        width: tableWidth
      });

      // Fields
      let fields : Rect[] = t.fields.map((f, i) => {
        let rowTop = (this.options.row.height * i);

        return new this.row({
          label: f.name,
          originX: "center",
          originY: "top",
          top: rowTop,
          width: tableWidth
        });
      });

      let fieldGroup = new fabric.Group(fields, {
        top: this.options.header.height,
      });

      let tableBodyGroup = new fabric.Group([header, fieldGroup]);

      let componentGroup = new fabric.Group([tableBodyGroup, table], {
        top: 100,
        left: previousTotalWidth + 10,
      });
      
      previousTotalWidth += tableWidth;

      return componentGroup;
    });

    if (!this.canvas) this.init();

    this.canvas?.clear();

    tables.forEach((t) => {
      this.canvas?.add(t);
    });

    this.objectsRendered.push(...tables);
  }

  _clear(): void {
    this.canvas?.remove(...this.canvas.getObjects().concat());
  }

  get tableFrame(): typeof Rect {
    return fabric.util.createClass(fabric.Rect, {
      width: this.options.table.width,
      fill: "rgba(0,0,0,0)",
      stroke: "black",
      strokeWidth: 2,

      initialize(options: IObjectOptions) {
        this.callSuper("initialize", options);
      },
    });
  }

  get row(): any {
    let rowOptions = this.options.row;

    return fabric.util.createClass(fabric.Rect, {
      type: "tableRow",
      width: this.options.table.width,
      height: rowOptions.height,
      fill: rowOptions.fill,
      stroke: rowOptions.stroke,
      strokeWidth: rowOptions.strokeWidth,

      // initialize can be of type function(options) or function(property, options), like for text.
      // no other signatures allowed.
      initialize(options: IObjectOptions & { label: string }) {
        this.callSuper("initialize", options);
        this.set("label", options.label || "");
      },

      toObject: function () {
        return fabric.util.object.extend(this.callSuper("toObject"), {
          label: this.get("label"),
        });
      },

      _render: function (ctx: CanvasRenderingContext2D) {
        this.callSuper("_render", ctx);

        ctx.font = `${rowOptions.fontSize}px Helvetica`;
        ctx.fillStyle = rowOptions.fillStyle;
        ctx.fillText(this.label, -this.width / 2 + rowOptions.paddingX, +this.height / 2 - rowOptions.fontSize / 2);
      },
    });
  }

  get header(): any {
    let headerOptions = this.options.header;

    return fabric.util.createClass(fabric.Rect, {
      type: "tableHeader",
      width: this.options.table.width,
      height: this.options.header.height,
      fill: this.options.header.fill,
      stroke: this.options.header.stroke,
      strokeWidth: this.options.header.strokeWidth,

      // initialize can be of type function(options) or function(property, options), like for text.
      // no other signatures allowed.
      initialize(options: IObjectOptions & { label: string }) {
        this.callSuper("initialize", options);
        this.set("label", options.label || "");
      },

      toObject: function () {
        return fabric.util.object.extend(this.callSuper("toObject"), {
          label: this.get("label"),
        });
      },

      _render: function (ctx: CanvasRenderingContext2D) {
        this.callSuper("_render", ctx);

        ctx.font = `${headerOptions.fontSize}px Helvetica`;
        ctx.fillStyle = headerOptions.fillStyle;
        ctx.textAlign = "center";
        ctx.fillText(this.label, 0, this.height / 2 - headerOptions.fontSize / 2);
      },
    });
  }
}
