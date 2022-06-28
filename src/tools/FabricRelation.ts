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
      super("M100,100 C200,100 100,200 200,200", { fill: "", stroke: "black", strokeWidth: 2, objectCaching: false, selectable: true, evented: false });
  
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
      var table1 = this.endpoints[0].table;
      var table2 = this.endpoints[1].table;
  
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
            if (e.target?.type !== "Table") return;
  
            let table = e.target as FabricTable;
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