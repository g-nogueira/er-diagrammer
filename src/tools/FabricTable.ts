import fabric, { IGroupOptions } from "fabric/fabric-impl";
import { FabricHeader, IHeaderOptions } from "./FabricHeader";
import { FabricRelation } from "./FabricRelation";
import { FabricRow, IRowOptions } from "./FabricRow";

export interface ITableOptions extends fabric.IRectOptions {
  tableName: string;
  tableAlias: string;
}

export class FabricTable extends fabric.Rect {
  type = "Table";
  tableName: string;
  tableAlias: string;
  rows: FabricRow[] = [];
  header?: FabricHeader;
  parent = new fabric.Group([], { type: "TableGroup" });

  relations: FabricRelation[] = [];

  /**
   * Constructor
   * @param [options] Options object
   */
  constructor(options: ITableOptions) {
    super(options);
    this.tableName = options.tableName;
    this.tableAlias = options.tableAlias;

    this.width = options.width;
    this.fill = "rgba(0,0,0,0)";
    this.stroke = "black";
    this.strokeWidth = 2;

    this.originY = "top";
    this.originX = "center";

    this.group = new fabric.Group();
  }

  addHeader(options: IHeaderOptions) {
    this.header = new FabricHeader(options);

    this.recalculateHeight();
    this.recalculateWidth();

    return this.header;
  }

  addRow(options: IRowOptions) {
    // Top = Sum of all Rows' heights
    options.top = this.rows.reduce((prev, curr) => prev + (curr.height || 0), 0);

    let row = new FabricRow(options);

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
