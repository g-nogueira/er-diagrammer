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
      fillStyle: "#000",
    },
    header: {
      height: 35,
      fill: "#316896",
      stroke: "black",
      strokeWidth: 2,
      fontSize: 20,
      fillStyle: "white",
    },
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
    // CREATE TABLE LIST
    var tables = schema.tables.map((t, i) => {
      // Table
      let table: FabricTable = new FabricTable({ tableName: t.name, tableAlias: t.alias });

      // Table Title
      table.addHeader({ label: t.name, table });

      // Table Fields
      table.addRows(t.fields.map((field, i) => ({ label: field.name, table })));

      return table;
    });

    // MAX TABLE POSITIONS
    let maxTop = 1000;
    let minTop = 50;
    let maxLeft = 1000;
    let minLeft = 0;

    // SET TABLE POSITIONS
    var fabricTables = tables.map((t, i) => {
      let fabricTable = t.getGroup({
        top: 100 + Math.random() * (maxTop - minTop) + minTop,
        // left: previousTotalWidth + 10,
        left: Math.random() * (maxLeft - minLeft) + minLeft,
      });

      return fabricTable;
    });

    var allRelations = new Map<string, FabricRelation>();
    // CREATE TABLE RELATIONS
    tables.forEach(table => {
      // Find the table's relations
      let relations = schema.refs.filter((ref) => ref.endpoints.some((e) => e.tableName === table.tableName));

      // Generate Fabric Relation
      let fabricRelations = relations.map(rel => {
        // Generate Relation Endpoints
        let endpoints = rel.endpoints.map(endpoint => {
          let table = findTableByName(tables, endpoint.tableName) as FabricTable;
          let rows = findRowsByNames(table?.rows as FabricRow[], endpoint.fieldNames);
          let fabricEndpoint : IRelationEndpoint = {
            relation: endpoint.relation,
            table,
            rows
          };

          return fabricEndpoint;
        });

        // Instantiate Relation
        let relation = new FabricRelation({
          endpoints,
          label: ""
        });

        if (allRelations.has(relation.id)) {
          return allRelations.get(relation.id) as FabricRelation;
        }

        return relation;
      });

      fabricRelations.forEach(r => {
        if (!allRelations.has(r.id)) allRelations.set(r.id, r);
      });

      table.relations = fabricRelations;
    });

    if (!this.canvas) this.init();

    this.canvas?.clear();

    // ADD TO CANVAS
    // Add tables
    fabricTables.forEach((t) => {
      this.canvas?.add(t);
    });

    // Add relations
    allRelations.forEach((r) => {
      this.canvas?.add(r);
      r.events.forEach(([name, target]) => this.canvas?.on(name, target));
    });

    // this.objectsRendered.push(...fabricTables, ...fabricRelations);

  }

  _clear(): void {
    this.canvas?.remove(...this.canvas.getObjects().concat());
  }
}

function findTableByName(tables : FabricTable[], name : string) {
  return tables.find((t) => t.tableName === name);
}

function findRowsByNames(rows : FabricRow[], name : string[]) {
  return rows.filter((r) => name.includes(r.label));
}
