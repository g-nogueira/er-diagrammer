import React, { CSSProperties, useEffect, useState } from "react";
import { DBMLProcessor } from "../extensions/parsers/DBMLParser";
import { FabricRenderer } from "../extensions/renderers/FabricRenderer";

const ERModel: React.FC<{ DBML: string }> = ({ DBML }) => {
  const [canvasId] = useState(new Date().getTime().toString());
  const [processor, setProcessor] = useState<DBMLProcessor>();

  useEffect(() => {
    processor?.render(DBML);
  }, [DBML, processor]);

  useEffect(() => {
    let canvasOptions = {
      canvas: {
        width: document.getElementById("canvasContainer")?.clientWidth,
        height: document.getElementById("canvasContainer")?.clientHeight,
      },
    };

    setProcessor(new DBMLProcessor({ renderer: new FabricRenderer(canvasId, canvasOptions) }));
  }, [canvasId]);

  return (
    <div id="canvasContainer" style={containerStyle}>
      <canvas id={canvasId}></canvas>
    </div>
  );
};

const containerStyle: CSSProperties = {
  width: "100%",
  height: "100%",
};

export default ERModel;
