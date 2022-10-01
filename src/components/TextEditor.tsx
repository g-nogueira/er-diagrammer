import React, { CSSProperties, useEffect, useState } from "react";
import AceEditor, { IEditorProps } from "react-ace";
import "ace-builds/src-noconflict/mode-yaml";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";
import { AppStorage } from "../storage/storage";
import Storage from "../constants/storage";
import { Resizable } from "re-resizable";
import "./TextEditor.css";

const CodeEditor: React.FC<{}> = (props) => {
  let [DBMLCode, setDBMLCode] = useState<string>("");
  let editorPros: IEditorProps = {};

  useEffect(() => {
    AppStorage.setItem(Storage.DBMLCode, DBMLCode);
  }, [DBMLCode]);

  return (
    <Resizable
      style={aceEditorStyles}
      defaultSize={{
        width: 320,
        height: "100%",
      }}
      handleStyles={{
        right: resizeHandleStyle,
      }}
    >
      <AceEditor mode="yaml" theme="monokai" style={aceEditorStyles} onChange={setDBMLCode} value={DBMLCode} name="UNIQUE_ID_OF_DIV" editorProps={editorPros} />,
    </Resizable>
  );
};

const aceEditorStyles: CSSProperties = {
  minHeight: "100%",
  width: "100%",
  backgroundColor: "#282828",
};

const resizeHandleStyle: CSSProperties = {
  backgroundColor: "#000",
  height: "100%",
  zIndex: 1,
};

export default CodeEditor;
