import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// 导入，初始化 i18n
import "./i18n";

const rootEl = document.getElementById("root");

if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
