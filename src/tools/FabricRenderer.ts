/**
 * The Renderer is responsible for receiving Tables and Relationships,
 * and the Processor is responsible for creating the Tables and Relationships
 */

import { fabric } from "fabric";
import { Canvas, Object } from "fabric/fabric-impl";
import { IRenderer } from "../models/IRenderer";
import { Schema } from "./../models/Schema";
import { FabricRelation, IRelationEndpoint } from "./FabricRelation";
import { FabricRow } from "./FabricRow";
import { FabricTable } from "./FabricTable";

export class FabricRenderer implements IRenderer {
  canvas: Canvas | undefined;
  canvasId: string;
  objectsRendered: Object[] = [];
  options = {
    canvas: {
      width: 1000,
      height: 1000,
      backgroundColor: "#fbfbfb",
    },
  };

  constructor(containerId: string, options?: any) {
    this.canvasId = containerId;
    this.options.canvas.width = options?.canvas?.width || this.options.canvas.width;
    this.options.canvas.height = options?.canvas?.height || this.options.canvas.height;
  }

  init() {
    if (this.canvasId && !this.canvas) {
      this.canvas = new fabric.Canvas(this.canvasId, {
        width: this.options.canvas.width,
        height: this.options.canvas.height,
        backgroundColor: this.options.canvas.backgroundColor,
      });
    } else {
      throw new Error("Property canvasId not set. It's required to setup this property to initialize the Canvas.");
    }
  }

  render(schema: Schema): void {
    if (!this.canvas) this.init();

    this.canvas?.clear();

    var uniqueRelations = new Map<string, FabricRelation>();

    // MAX TABLE POSITIONS
    var minTop = 50;
    var minLeft = 0;
    var maxLeft = 1000;
    var maxTop = 1000;

    // CREATE TABLE LIST
    var fabricTables = schema.tables.map((t, i) => {
      // Table
      let table: FabricTable = new FabricTable({
        tableName: t.name,
        tableAlias: t.alias,
        top: 100 + Math.random() * (maxTop - minTop) + minTop,
        left: 100 + Math.random() * (maxLeft - minLeft) + minLeft,
      });

      // Table Title
      table.addHeader({ label: t.name, table });

      // Table Fields
      table.addRows(t.fields.map((field) => ({ label: field.name })));

      return table;
    });

    // CREATE TABLE RELATIONS
    fabricTables.forEach((table) => {
      // Find the table's relations
      let relations = schema.refs.filter((ref) => ref.endpoints.some((e) => [table.tableName, table.tableAlias].includes(e.tableName)));

      // Generate Fabric Relation
      let fabricRelations = relations.map((rel) => {
        // Generate Relation Endpoints
        let endpoints = rel.endpoints.map((endpoint) => {
          let table = findTableByName(fabricTables, endpoint.tableName) as FabricTable;
          let rows = findRowsByNames(table?.rows as FabricRow[], endpoint.fieldNames);

          return {
            relation: endpoint.relation,
            table,
            rows,
          } as IRelationEndpoint;
        });

        // Instantiate Relation
        let relation = new FabricRelation({
          endpoints,
          label: "",
        });

        if (uniqueRelations.has(relation.id)) {
          return uniqueRelations.get(relation.id) as FabricRelation;
        }

        return relation;
      });

      fabricRelations.forEach((r) => {
        if (!uniqueRelations.has(r.id)) uniqueRelations.set(r.id, r);
      });

      table.relations = fabricRelations;
    });

    // ADD TO CANVAS
    // Add tables
    fabricTables.forEach((t) => {
      this.canvas?.add(t);
      t.events.forEach(([name, target]) => this.canvas?.on(name, target as () => {}));
    });

    // Add relations
    uniqueRelations.forEach((r) => {
      this.canvas?.add(r);
      r.events.forEach(([name, target]) => this.canvas?.on(name, target as () => {}));
    });
  }

  _clear(): void {
    this.canvas?.remove(...this.canvas.getObjects().concat());
  }
}

function findTableByName(tables: FabricTable[], name: string) {
  return tables.find((t) => [t.tableName, t.tableAlias].includes(name));
}

function findRowsByNames(rows: FabricRow[], name: string[]) {
  return rows.filter((r) => name.includes(r.label));
}

function toggleToGrid(canvas: fabric.Canvas, enabled = true) {
  const grid = 50;
  const onObjectMoving = (options : fabric.IEvent<Event>) => {
    options.target &&
      options.target.set({
        left: Math.round((options.target.left || 0) / grid) * grid,
        top: Math.round((options.target.top || 0) / grid) * grid,
      });
  }

  if (enabled) {
    // Create grid
    for (var i = 0; i < 600 / grid; i++) {
      canvas.add(new fabric.Line([i * grid, 0, i * grid, 600], { stroke: "#ccc", selectable: false }));
      canvas.add(new fabric.Line([0, i * grid, 600, i * grid], { stroke: "#ccc", selectable: false }));
    }

    canvas.on("object:moving", onObjectMoving);
  }
  else {
    canvas.off("object:moving", onObjectMoving);
  }


}
