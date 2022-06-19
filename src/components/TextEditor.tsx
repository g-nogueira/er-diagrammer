import React, { useEffect, useState } from "react";
import AceEditor, { IEditorProps } from "react-ace";
import "ace-builds/src-noconflict/mode-yaml";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";
import { AppStorage } from "../storage/storage";
import Storage from "../constants/storage";

const CodeEditor: React.FC<{}> = (props) => {
  let [DBMLCode, setDBMLCode] = useState<string>("");
  let editorPros: IEditorProps = {};

  useEffect(() => {
    AppStorage.setItem(Storage.DBMLCode, DBMLCode);
  }, [DBMLCode]);

  return (
    <div style={{ height: "100%", width: 300, backgroundColor: "#282828" }}>
      <AceEditor mode="yaml" theme="monokai" style={{ minHeight: "100%", width: 300 }} onChange={setDBMLCode} value={DBMLCode} name="UNIQUE_ID_OF_DIV" editorProps={editorPros} />,
    </div>
  );
};

export default CodeEditor;
