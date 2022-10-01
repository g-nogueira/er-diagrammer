import { fabric } from "fabric";
import { IEvent, IGroupOptions } from "fabric/fabric-impl";
import { fillDefaultValues } from "./FabricGenerator";
import { FabricRow } from "./FabricRow";
import { FabricTable } from "./FabricTable";

export interface IRelationEndpoint {
  table: FabricTable;
  rows: FabricRow[];
  relation: string;
  line?: fabric.Path;
}
export interface IRelationOptions extends IGroupOptions {
  label?: string;
  endpoints: IRelationEndpoint[];
}

export class FabricRelation extends fabric.Path {
  type = "TableRelation";
  label?: string;
  id = "";
  endpoints: IRelationEndpoint[];
  isHovered = false;

  hoverEffect = {
    isHovered: true,
    tolerance: 5,
    strokeWidth: 3,
    stroke: "#619bcc",
  };

  _pathOptions: IRelationOptions = {
    fill: "",
    stroke: "black",
    strokeWidth: 2,
    objectCaching: false,
    selectable: true,
    evented: true,
    strokeLineJoin: "round",
    endpoints: [],
  };

  _internalOptions = this._pathOptions;

  constructor(options: IRelationOptions) {
    super("M100,100 H120 V200 H100", { fill: "", stroke: "black", strokeWidth: 2, objectCaching: false, selectable: false, strokeLineJoin: "round" });

    options = fillDefaultValues<IRelationOptions>(options, this._pathOptions);
    this._internalOptions = options;

    this.fill = options.fill;
    this.stroke = options.stroke;
    this.strokeWidth = options.strokeWidth;
    this.objectCaching = options.objectCaching;
    this.selectable = options.selectable;
    this.evented = options.evented;
    this.strokeLineJoin = options.strokeLineJoin;
    this.endpoints = options.endpoints;

    this.label = options.label;

    this.id = `${this.endpoints[0].table.tableName}_${this.endpoints[0].rows[0].label}_${this.endpoints[1].table.tableName}_${this.endpoints[1].rows[0].label}`;

    this._recalculateCoordinates();
  }

  get events(): [string, ((e: IEvent) => void) | ((e: IEvent<MouseEvent>) => void)][] {
    return [
      [
        // When a table moves, recalculates the relationship coordinates
        "object:moving",
        (e: IEvent) => {
          // Is Target a Table?
          if (e.target?.type !== "Table") return;

          let table = e.target as FabricTable;
          let relations = table.relations;

          // Is this Relations in the Target Table's Relations?
          if (!relations.map((r) => r.id).includes(this.id)) return;

          this._recalculateCoordinates();
        },
      ],
      [
        // Applies hover effects
        "mouse:move",
        ({ e }: IEvent<MouseEvent>) => {
          let isHovering = this._isPointOnLine(this.canvas?.getPointer(e) as fabric.Point);

          if (isHovering === this.isHovered) return;

          if (isHovering) {
            this.setHoverEffect();
          } else {
            this.removeHoverEffect();
          }

          this.canvas?.requestRenderAll();
        },
      ],
    ];
  }

  /**
   * Applies the hover styles.
   */
  setHoverEffect() {
    this.isHovered =  true;
    this.strokeWidth = this.hoverEffect.strokeWidth;
    this.stroke = this.hoverEffect.stroke;

    this.bringToFront();
  }

  /**
   * Removes the hover styles.
   */
  removeHoverEffect() {
    this.isHovered = false;
    this.strokeWidth = this._internalOptions.strokeWidth;
    this.stroke = this._internalOptions.stroke;
  }

  /**
   * Recalculates the relationship coordinates given its table endpoints.
   */
  _recalculateCoordinates() {
    var table1 = this.endpoints[0].table;
    var table2 = this.endpoints[1].table;

    // M100,100 H120 V200 H100
    // 0: (3) ['M', 100, 100]
    // 1: (3) ['L', 120, 100]
    // 2: (3) ['L', 120, 200]
    // 3: (3) ['L', 100, 200]

    var lineStart = new fabric.Point(0, 0);
    var linePoint1 = new fabric.Point(0, 0);
    var linePoint2 = new fabric.Point(0, 0);
    var lineEnd = new fabric.Point(0, 0);

    // ˥ ˦ ˧ ˨ ˩ ˪ ˫ ˹ ˺ ˻ ˼ ˾ ̄ ̅
    // ┌ ┐ └ ┘├ ┤┬ ┴ ┼

    // Table1┐
    //       └Table2
    // Table1───┐
    //          └───Table2
    if ((table1.oCoords?.mr.x || 0) < (table2.oCoords?.ml.x || 0)) {
      lineStart = table1.oCoords?.mr || lineStart;
      lineEnd = table2.oCoords?.ml || lineEnd;

      linePoint1 = new fabric.Point(this._halfWayBetween(lineStart.x, lineEnd.x), lineStart.y);
      linePoint2 = new fabric.Point(this._halfWayBetween(lineStart.x, lineEnd.x), lineEnd.y);
    }

    // Table1┐
    // Table2┘
    // AND
    // Table1─────┐
    //      Table2┘
    // AND
    //       Table1┐
    // Table2──────┘
    if ((table1.oCoords?.mr.x || 0) >= (table2.oCoords?.ml.x || 0) && (table1.oCoords?.ml.x || 0) <= (table2.oCoords?.mr.x || 0)) {
      lineStart = table1.oCoords?.mr || lineStart;
      lineEnd = table2.oCoords?.mr || lineEnd;

      linePoint1 = new fabric.Point(Math.max(lineStart.x, lineEnd.x) + 20, lineStart.y);
      linePoint2 = new fabric.Point(Math.max(lineStart.x, lineEnd.x) + 20, lineEnd.y);
    }

    //       ┌Table1
    // Table2┘
    //          ┌───Table1
    // Table2───┘
    if ((table1.oCoords?.ml.x || 0) > (table2.oCoords?.mr.x || 0)) {
      lineStart = table1.oCoords?.ml || lineStart;
      lineEnd = table2.oCoords?.mr || lineEnd;

      linePoint1 = new fabric.Point(this._halfWayBetween(lineStart.x, lineEnd.x), lineStart.y);
      linePoint2 = new fabric.Point(this._halfWayBetween(lineStart.x, lineEnd.x), lineEnd.y);
    }

    // @ts-ignore: Unreachable code error
    this.path[0] = ["M", lineStart.x, lineStart.y];
    // @ts-ignore: Unreachable code error
    this.path[1] = ["L", linePoint1.x, linePoint1.y];
    // @ts-ignore: Unreachable code error
    this.path[2] = ["L", linePoint2.x, linePoint2.y];
    // @ts-ignore: Unreachable code error
    this.path[3] = ["L", lineEnd.x, lineEnd.y];
  }

  /**
   * Retrieves the half point between two points.
   * @param value1
   * @param value2
   * @returns
   */
  _halfWayBetween(value1: number, value2: number) {
    return value1 + (value2 - value1) / 2;
  }

  /**
   * True, if the given point is located inside the relationship line.
   * @param mousePoint
   * @param slack The distance between the lines that we should still consider as hovering.
   * @returns
   */
  _isPointOnLine(mousePoint: fabric.Point) {
    var isHovering = false;

    // Group the points into groups of two points
    var groups = this._getLines();

    // For each group, validate if the mouse if between them
    groups.forEach((points) => {
      if (isHovering) return;

      let lineStartX = Math.min(points[0][0], points[1][0]) - this.hoverEffect.tolerance;
      let lineEndX = Math.max(points[0][0], points[1][0]) + this.hoverEffect.tolerance;
      let lineStartY = Math.min(points[0][1], points[1][1]) - this.hoverEffect.tolerance;
      let lineEndY = Math.max(points[0][1], points[1][1]) + this.hoverEffect.tolerance;

      if (mousePoint.x >= lineStartX && mousePoint.x <= lineEndX && mousePoint.y >= lineStartY && mousePoint.y <= lineEndY) {
        isHovering = true;
      }
    });

    return isHovering;
  }

  /**
   * Returns each line section that composes the whole relationship line.
   * @returns
   */
  _getLines(): number[][][] {
    const res: number[][][] = [];
    const arr = this._getPoints();

    arr.forEach((el, i) => {
      // If we are in the last element, don't do anything
      if (i === arr.length - 1) return;

      let chunk = arr.slice(i, i + 2);

      res.push(chunk);
    });

    return res;
  }

  /**
   * Returns all of the points used to generate the whole relationship line.
   * @returns
   */
  _getPoints(): number[][] {
    // @ts-ignore: Unreachable code error
    return this.path?.map((pathCommand) => pathCommand.slice(1));
  }

  toString() {
    return super.toString() + " (type: " + this.type + ")";
  }

}
