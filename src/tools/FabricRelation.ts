import { fabric } from "fabric";
import { IGroupOptions } from "fabric/fabric-impl";
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

  constructor(options: IRelationOptions) {
    super("M100,100 H120 V200 H100", { fill: "", stroke: "black", strokeWidth: 2, objectCaching: false, selectable: true, evented: false, strokeLineJoin: "round" });

    this.label = options.label;
    this.endpoints = options.endpoints;

    this.id = `${this.endpoints[0].table.tableName}_${this.endpoints[0].rows[0].label}_${this.endpoints[1].table.tableName}_${this.endpoints[1].rows[0].label}`;

    this.recalculateCoordinates();
  }

  // recalculateCoordinates() {
  //   let coordinates = this.getPointCoordinates();

  //   if (!this.path) return;

  //   // @ts-ignore: Unreachable code error
  //   this.path[0] = [this.path[0][0], ...coordinates[0]];
  //   // @ts-ignore: Unreachable code error
  //   this.path[1] = [this.path[1][0], ...coordinates[1]];
  // }

  recalculateCoordinates() {
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

  get events(): [string, (e: fabric.IEvent) => void][] {
    return [
      [
        "object:moving",
        (e) => {
          // Is Target a Table?
          if (e.target?.type !== "Table") return;

          let table = e.target as FabricTable;
          let relations = table.relations;

          // Is this Relations in the Target Table's Relations?
          if (!relations.map((r) => r.id).includes(this.id)) return;

          this.recalculateCoordinates();
        },
      ],
    ];
  }

  _halfWayBetween(value1 : number, value2 : number) {
    return value1 + (value2 - value1) / 2;
  }

  toString() {
    return super.toString() + " (type: " + this.type + ")";
  }
}
