/**
 * The Renderer is responsible for receiving Tables and Relationships,
 * and the Processor is responsible for creating the Tables and Relationships
 */


import { fabric } from "fabric";
import { Canvas, Object } from "fabric/fabric-impl";
import { IRenderer } from "../../models/IRenderer";
import { Schema } from "../../models/Schema";
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
    keybindings: {
      pan: 2,
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
        fireMiddleClick: true,
      });

      this._toggleDragMode(true);
      this._toggleZoom();

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

  _toggleDragMode(dragMode: boolean) {
    // Solution from https://codepen.io/sabatino/pen/EwJYeO

    const STATE_IDLE = "idle";
    const STATE_PANNING = "panning";
    const that = this;

    // Remember the previous X and Y coordinates for delta calculations
    let lastClientX: number;
    let lastClientY: number;
    // Keep track of the state
    let state = STATE_IDLE;
    // We're entering dragmode
    if (dragMode && this.canvas) {
      // Discard any active object
      this.canvas.discardActiveObject();
      // Set the cursor to 'move'
      this.canvas.defaultCursor = "move";
      // Loop over all objects and disable events / selectable. We remember its value in a temp variable stored on each object
      this.canvas.forEachObject(function (object) {
        // @ts-ignore: Unreachable code error
        object.prevEvented = object.evented;
        // @ts-ignore: Unreachable code error
        object.prevSelectable = object.selectable;
        object.evented = false;
        object.selectable = false;
      });
      // Remove selection ability on the canvas
      this.canvas.selection = false;
      // When MouseUp fires, we set the state to idle
      this.canvas.on("mouse:up", function (e) {
        if (e.button !== that.options.keybindings.pan) return;
        state = STATE_IDLE;
      });
      // When MouseDown fires, we set the state to panning
      this.canvas.on("mouse:down", (e) => {
        if (e.button !== that.options.keybindings.pan) return;

        state = STATE_PANNING;
        lastClientX = e.e.clientX;
        lastClientY = e.e.clientY;
      });
      // When the mouse moves, and we're panning (mouse down), we continue
      this.canvas.on("mouse:move", (e) => {
        if (state === STATE_PANNING && e && e.e) {
          // let delta = new fabric.Point(e.e.movementX, e.e.movementY); // No Safari support for movementX and movementY
          // For cross-browser compatibility, I had to manually keep track of the delta

          // Calculate deltas
          let deltaX = 0;
          let deltaY = 0;
          if (lastClientX) {
            deltaX = e.e.clientX - lastClientX;
          }
          if (lastClientY) {
            deltaY = e.e.clientY - lastClientY;
          }
          // Update the last X and Y values
          lastClientX = e.e.clientX;
          lastClientY = e.e.clientY;

          let delta = new fabric.Point(deltaX, deltaY);
          this.canvas?.relativePan(delta);
          // @ts-ignore: Unreachable code error
          // this.canvas?.trigger("moved");
        }
      });
    } else {
      if (!this.canvas) return;

      // When we exit dragmode, we restore the previous values on all objects
      this.canvas.forEachObject(function (object) {
        // @ts-ignore: Unreachable code error
        object.evented = object.prevEvented !== undefined ? object.prevEvented : object.evented;
        // @ts-ignore: Unreachable code error
        object.selectable = object.prevSelectable !== undefined ? object.prevSelectable : object.selectable;
      });
      // Reset the cursor
      this.canvas.defaultCursor = "default";
      // Remove the event listeners
      this.canvas.off("mouse:up");
      this.canvas.off("mouse:down");
      this.canvas.off("mouse:move");
      // Restore selection ability on the canvas
      this.canvas.selection = true;
    }
  }

  _toggleZoom() {
    // Solution from http://fabricjs.com/fabric-intro-part-5
    const that = this;

    if (!that.canvas) return;

    that.canvas.on("mouse:wheel", function (this: any, opt) {
      if (!that.canvas) return;

      var delta = opt.e.deltaY;
      var zoom = that.canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      that.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
      var vpt = this.viewportTransform;
      if (zoom < 400 / 1000) {
        vpt[4] = 200 - (1000 * zoom) / 2;
        vpt[5] = 200 - (1000 * zoom) / 2;
      } else {
        if (vpt[4] >= 0) {
          vpt[4] = 0;
        } else if (vpt[4] < that.canvas.getWidth() - 1000 * zoom) {
          vpt[4] = that.canvas.getWidth() - 1000 * zoom;
        }
        if (vpt[5] >= 0) {
          vpt[5] = 0;
        } else if (vpt[5] < that.canvas.getHeight() - 1000 * zoom) {
          vpt[5] = that.canvas.getHeight() - 1000 * zoom;
        }
      }
    });
  }
}

function findTableByName(tables: FabricTable[], name: string) {
  return tables.find((t) => [t.tableName, t.tableAlias].includes(name));
}

function findRowsByNames(rows: FabricRow[], name: string[]) {
  return rows.filter((r) => name.includes(r.label));
}

// function toggleToGrid(canvas: fabric.Canvas, enabled = true) {
//   const grid = 50;
//   const onObjectMoving = (options: fabric.IEvent<Event>) => {
//     options.target &&
//       options.target.set({
//         left: Math.round((options.target.left || 0) / grid) * grid,
//         top: Math.round((options.target.top || 0) / grid) * grid,
//       });
//   };

//   if (enabled) {
//     // Create grid
//     for (var i = 0; i < 600 / grid; i++) {
//       canvas.add(new fabric.Line([i * grid, 0, i * grid, 600], { stroke: "#ccc", selectable: false }));
//       canvas.add(new fabric.Line([0, i * grid, 600, i * grid], { stroke: "#ccc", selectable: false }));
//     }

//     canvas.on("object:moving", onObjectMoving);
//   } else {
//     canvas.off("object:moving", onObjectMoving);
//   }
// }
