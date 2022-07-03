import { fabric } from "fabric";
import { IEvent } from "fabric/fabric-impl";
import { FabricHeader, IHeaderOptions } from "./FabricHeader";
import { FabricRelation } from "./FabricRelation";
import { FabricRow, IRowOptions } from "./FabricRow";

export interface ITableOptions extends fabric.IGroupOptions {
  tableName: string;
  tableAlias: string;
}

export class FabricTable extends fabric.Group {
  type = "Table";
  tableName: string;
  tableAlias: string;
  rows: FabricRow[] = [];
  header: FabricHeader = new FabricHeader();
  
  _rowGroup: fabric.Group = new fabric.Group([], {subTargetCheck: true, evented: true});
  relations: FabricRelation[] = [];

  /**
   * Constructor
   * @param [options] Options object
   */
  constructor(options: ITableOptions) {
    super([], options);

    this.add(this._rowGroup);

    options.top && (this.top = options.top);
    options.left && (this.left = options.left);

    this.tableName = options.tableName;
    this.tableAlias = options.tableAlias;

    this.width = options.width;
    this.fill = "rgba(0,0,0,0)";
    this.stroke = "black";
    this.strokeWidth = 2;

    this.originY = "top";
    this.originX = "center";

    this.subTargetCheck = true;

  }

  get events(): [string, ((e: IEvent) => void) | ((e: IEvent<MouseEvent>) => void)][] {
    const rowEvents = this.rows.flatMap(r => r.events);
    const headerEvents = this.header.events;

    return [...rowEvents, ...headerEvents];
  }

  addHeader(options: IHeaderOptions) {
    this.header = new FabricHeader(options);
    this.add(this.header);

    this.recalculateHeight();
    this.recalculateWidth();

    return this.header;
  }

  addRow(options: IRowOptions) {
    // Top = Sum of all Rows' heights
    options.top = this.rows.reduce((prev, curr) => prev + (curr.height || 0), 0);

    let row = new FabricRow(options);
   
    row.table = this;

    this.rows.push(row);
    this._rowGroup.add(row);

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
    let rowGroupHeight = this.rows.reduce((prev, curr) => prev + (curr.height || 0), 0);
    // this._rowGroup.height = rowgroupHeight;
    this.height = rowGroupHeight + (this.header?.height || 0);

    this.recalculeChildrenPositions()
  }

  /**
   * Recalculates the table width based on the width of the rows and the header.
   */
  recalculateWidth() {
    this.width = Math.max(...this.rows.map((r) => r.width || 0), this.header?.width || 0);

    this._rowGroup.width = this.width;
    this.rows.forEach((r) => r.setWidth(this.width || 0));

    this.header?.setWidth(this.width);

    this.recalculeChildrenPositions()
  }

  recalculeChildrenPositions() {
    // Horizontally center components
    this.header && (this.header.originX = "center");
    this._rowGroup.originX = "center";

    // Move the header to the top of the container
    this.header && (this.header.originY = "top");
    this.header && (this.header.top = -(this.height || 0) / 2);

    // Move the rows to the top of the container
    this._rowGroup.originY = "top";
    this._rowGroup.top = -(this.height || 0) / 2;

    // Move the rows to below the header
    this.header && (this._rowGroup.top += this.header.height || 0);

    this._rowGroup.left = 0;
  }

  render(ctx: CanvasRenderingContext2D) {
    if (!this.header) throw new Error("The table Header is undefined.");

    this.recalculateWidth();
    this.recalculateHeight();
    
    super.render(ctx);
  }
}
