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
    <div className="App" style={{ height: "100%", display: "flex" }}>
      <CodeEditor></CodeEditor>
      <ERModel DBML={DBMLCode}></ERModel>
    </div>
  );
}

export default App;
