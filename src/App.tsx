import React, { useState } from "react";
import "./App.css";
import CodeEditor from "./components/TextEditor";
import ERModel from "./components/ERModel";
import { AppStorage } from "./storage/storage";

function App() {
  let [DBMLCode, setDBMLCode] = useState<string>("");

  React.useEffect(() => {
    AppStorage.observable.subscribe((event) => {
      if (event.key !== "DBMLCode") return;

      setDBMLCode(event.newValue as string);
    });
  }, []);

  return (
    <div className="App grid-container">
      <div id="codeEditor">
        <CodeEditor></CodeEditor>
      </div>
      <div id="canvas">
        <ERModel DBML={DBMLCode}></ERModel>
      </div>
    </div>
  );
}

export default App;
