/**
 * The Renderer is responsible for receiving Tables and Relationships,
 * and the Processor is responsible for creating the Tables and Relationships
 */

import { table } from "console";
import { fabric } from "fabric";
import { Canvas, IObjectOptions, Object, Rect } from "fabric/fabric-impl";
import { IRenderer } from "../models/IRenderer";
import { Schema } from "./../models/Schema";
import { Header, IRelationEndpoint, Row, Table } from "./FabricGenerator";
import { Relation } from './FabricGenerator';

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
    var previousTotalWidth = 0;
    
    // CREATE TABLE LIST
    var tables = schema.tables.map((t, i) => {
      
      // Table
      let table : Table = new Table({name: t.name});

      // Table Title
      table.addHeader({ label: t.name, table });

      // Fields
      table.addRows(t.fields.map((field, i) => ({label: field.name,table})));

      return table;
    });
    
    let maxTop = 1000;
    let minTop = 50;
    let maxLeft = 1000;
    let minLeft = 0;

    // SET TABLE POSITIONS
    var fabricTables = tables.map((t, i) => {
      let fabricTable = t.getGroup({
        top: 100 + Math.random() * (maxTop - minTop) + minTop,
        // left: previousTotalWidth + 10,
        left:  Math.random() * (maxLeft - minLeft) + minLeft,
      });

      previousTotalWidth += (t.width || 0);

      return fabricTable;
    });

    // CREATE TABLE RELATIONS
    var fabricRelations = schema.refs.map((ref, i) => {

      let endpoints = ref.endpoints.map((ep, i) => {
        
        // Find the endpoint table by the name
        let table = tables.find(t => t.name === ep.tableName);

        if (!table) throw new Error(`Table ${ep.tableName} not found...`);

        // Find the endpoint row by the label
        let rows = table.rows.filter(r => ep.fieldNames.includes(r.label));

        if (!rows.length) throw new Error(`Rows with names ${ep.fieldNames.join(", ")} not found...`);

        // Create Relation
        let fabricEndpoint: IRelationEndpoint = {
          table : table as Table,
          relation: ep.relation,
          rows
        };

        return fabricEndpoint;
      });

      return new Relation({endpoints});

    });

    if (!this.canvas) this.init();

    this.canvas?.clear();

    // ADD TO CANVAS
    // Add tables
    fabricTables.forEach((t) => {
      this.canvas?.add(t);
    });

    // Add relations
    fabricRelations.forEach((r) => {
      this.canvas?.add(r);
    });

    this.objectsRendered.push(...fabricTables, ...fabricRelations);

    Relation.events.forEach(([name, target]) => this.canvas?.on(name, target));
  }

  _clear(): void {
    this.canvas?.remove(...this.canvas.getObjects().concat());
  }
}
