import { fabric } from "fabric";
import { IGroupOptions, IRectOptions, ITextOptions, Point } from "fabric/fabric-impl";

export interface ITableOptions extends fabric.IRectOptions {
  tableName: string;
}
export interface IRowOptions extends fabric.IRectOptions {
  label?: string;
  fontSize?: number;
  textColor?: string;
  textAlign?: CanvasTextAlign;
  table?: Table;

  paddingX?: number;
  paddingY?: number;
}
export interface IHeaderOptions extends IRowOptions {}
export interface IRelationEndpoint {
  table: Table;
  rows: Row[];
  relation: string;
  line?: fabric.Path;
}
export interface IRelationOptions extends IGroupOptions {
  label?: string;
  endpoints: IRelationEndpoint[];
}

export class Table extends fabric.Rect {
  type = "Table";
  rows: Row[] = [];
  header?: Header;
  tableName: string;
  parent = new fabric.Group([], {type: "TableGroup"});

  relations: Relation[] = [];

  /**
   * Constructor
   * @param [options] Options object
   */
  constructor(options: ITableOptions) {
    super(options);
    this.tableName = options.tableName;
    this.width = options.width;
    this.fill = "rgba(0,0,0,0)";
    this.stroke = "black";
    this.strokeWidth = 2;

    this.originY = "top";
    this.originX = "center";

    this.group = new fabric.Group()
  }

  addHeader(options: IHeaderOptions) {
    this.header = new Header(options);

    this.recalculateHeight();
    this.recalculateWidth();

    return this.header;
  }

  addRow(options: IRowOptions) {
    // Top = Sum of all Rows' heights
    options.top = this.rows.reduce((prev, curr) => prev + (curr.height || 0), 0);

    let row = new Row(options);

    this.rows.push(row);
    this.recalculateHeight();
    this.recalculateWidth();

    return row;
  }

  addRows(options: IRowOptions[]) {
    options.forEach((o) => this.addRow(o));

    return this.rows;
  }

  /**
   * Recalculates the table height based on the sum between the height of the body and the height of the header.
   */
  recalculateHeight() {
    this.height = this.rows.reduce((prev, curr) => prev + (curr.height || 0), 0) + (this.header?.height || 0);
  }

  /**
   * Recalculates the table width based on the width of the rows and the header.
   */
  recalculateWidth() {
    this.width = Math.max(...this.rows.map((r) => r.width || 0), this.header?.width || 0);

    this.rows.forEach((r) => r.setWidth(this.width || 0));
    this.header?.setWidth(this.width);
  }

  /**
   *
   * @param options
   * @returns
   */
  getGroup(options?: IGroupOptions) {
    if (!this.header) throw new Error("The table Header is undefined.");

    // CREATING THE COMPONENTS
    let table = this;
    let header = this.header;
    let rowGroup = new fabric.Group(this.rows);
    let componentGroup = this.parent;

    this.parent.set("top", options?.top);
    this.parent.set("left", options?.left);

    // ADDING THE COMPONENTS
    componentGroup.addWithUpdate(table);
    componentGroup.addWithUpdate(header);
    componentGroup.addWithUpdate(rowGroup);
    componentGroup.setOptions(options);

    // SETTING THE SIZE OF THE CONTAINER
    componentGroup.width = Math.max(table.width || 0, header.width || 0, rowGroup.width || 0);
    componentGroup.height = Math.max(table.height || 0, header.height || 0, rowGroup.height || 0);

    // POSITIONING THE COMPONENTS
    // Horizontally center components
    table.originX = "center";
    header.originX = "center";
    rowGroup.originX = "center";

    // The table frame should be centralized
    table.originY = "center";

    // Move the header to the top of the container
    header.originX = "top";
    header.top = -(componentGroup?.height || 0) / 2;

    // Move the rows to the top of the container
    rowGroup.originY = "top";
    rowGroup.top = -(componentGroup?.height || 0) / 2;

    // Move the rows to below the header
    rowGroup.top += header.height || 0;

    rowGroup.left = 0;
    table.top = 0;
    table.left = 0;

    this.parent = componentGroup;

    return componentGroup;
  }

  _render(ctx: CanvasRenderingContext2D): void {
    super._render(ctx);

    // this.relations.forEach(r => {
    //   this.canvas?.add(r);
    // })
  }
}

export class Row extends fabric.Group {
  type = "TableRow";
  rowRect?: fabric.Rect;
  text?: fabric.Text;
  table?: Table;

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

export class Header extends Row {
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

export class Relation extends fabric.Path {
  type = "TableRelation";
  label?: string;
  id = "";
  endpoints: IRelationEndpoint[];

  constructor(options: IRelationOptions) {
    super("M100,100 C200,100 100,200 200,200", { fill: "", stroke: "black", objectCaching: false, selectable: true, evented: false });

    this.label = options.label;
    this.endpoints = options.endpoints;

    this.id = `${this.endpoints[0].table.tableName}_${this.endpoints[0].rows[0].label}_${this.endpoints[1].table.tableName}_${this.endpoints[1].rows[0].label}`;

    this.recalculateCoordinates();
  }

  recalculateCoordinates() {
    let coordinates = this.getPointCoordinates();

    if (!this.path) return;
    
    // @ts-ignore: Unreachable code error
    this.path[0] = [this.path[0][0], ...coordinates[0]];
    // @ts-ignore: Unreachable code error
    this.path[1] = [this.path[1][0], ...coordinates[1]];
    
  }

  getPointCoordinates() : number[][] {
    var table1 = this.endpoints[0].table.parent;
    var table2 = this.endpoints[1].table.parent;

    var lineStart = new fabric.Point(0,0);
    var lineStartControl = new fabric.Point(0,0);
    var lineEndControl = new fabric.Point(0,0);
    var lineEnd = new fabric.Point(0,0);

    // ˥ ˦ ˧ ˨ ˩ ˪ ˫ ˹ ˺ ˻ ˼ ˾ ̄ ̅
    // ┌ ┐ └ ┘├ ┤┬ ┴ ┼ 

    // Table1┐
    //       └Table2
    // Table1───┐
    //          └───Table2
    if ((table1.oCoords?.mr.x || 0) < (table2.oCoords?.ml.x || 0)) {
      lineStart = table1.oCoords?.mr || lineStart;
      lineStartControl = new fabric.Point(table2.oCoords?.ml.x || 0, table1.oCoords?.mr?.y || 0) || lineStartControl;
      lineEndControl = new fabric.Point(table1.oCoords?.mr.x || 0, table2.oCoords?.ml?.y || 0) || lineEndControl;
      lineEnd = table2.oCoords?.ml || lineEnd;
    }

    // Table1┐
    // Table2┘
    // AND
    // Table1─────┐
    //      Table2┘
    // AND
    //       Table1┐
    // Table2──────┘
    if ((table1.oCoords?.mr.x || 0) >= (table2.oCoords?.ml.x || 0)
    && (table1.oCoords?.ml.x || 0) <= (table2.oCoords?.mr.x || 0)) {
      lineStart = table1.oCoords?.mr || lineStart;
      lineStartControl = new fabric.Point(lineStart.x + 100, lineStart.y) || lineStartControl;
      lineEnd = table2.oCoords?.mr || lineEnd;
      lineEndControl = new fabric.Point(lineEnd.x + 100, lineEnd.y) || lineStartControl;
    }

    //       ┌Table1
    // Table2┘
    //          ┌───Table1
    // Table2───┘
    if ((table1.oCoords?.ml.x || 0) > (table2.oCoords?.mr.x || 0)) {
      lineStart = table1.oCoords?.ml || lineStart;
      lineStartControl = new fabric.Point(table2.oCoords?.mr.x || 0, table1.oCoords?.ml?.y || 0) || lineStartControl;
      lineEndControl = new fabric.Point(table1.oCoords?.ml.x || 0, table2.oCoords?.mr?.y || 0) || lineEndControl;
      lineEnd = table2.oCoords?.mr || lineEnd;
    }

    return [[lineStart.x,lineStart.y], [lineStartControl.x, lineStartControl.y, lineEndControl.x, lineEndControl.y, lineEnd.x, lineEnd.y]];
  }

  get events(): [string, (e: fabric.IEvent) => void][] {
    return [
      [
        "object:moving",
        (e) => {
          // Is Target a Table?
          if (e.target?.type !== "TableGroup") return;

          let group = e.target as fabric.Group;
          let table = group.getObjects().find((o: fabric.Object) => o.type === "Table") as Table;
          let relations = table.relations;
          
          // Is this Relations in the Target Table's Relations?
          if (!relations.map(r => r.id).includes(this.id)) return;

          this.recalculateCoordinates();
        },
      ],
    ];
  }

  toString() {
    return super.toString() + ' (type: ' + this.type + ')';
  }
}

/**
 * Assigns undefined properties of an object with given default values.
 * @param options The object to have undefined properties reassigned.
 * @param defaultValues The object containing the default values to be used.
 */
function fillDefaultValues<T>(options: any, defaultValues: any): T {
  var opt = { ...options };

  Object.entries(defaultValues).forEach(([key, value]) => {
    let optKey = key as keyof typeof opt;

    opt[optKey] ||= value;
  });

  return opt;
}
