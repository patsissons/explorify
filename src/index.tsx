import * as React from "react";
import * as ReactDOM from "react-dom";
import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/styles.css";

import { App } from "./components";
import registerServiceWorker from "./registerServiceWorker";

import "./index.css";

ReactDOM.render(
  <AppProvider>
    <App />
  </AppProvider>,
  document.getElementById("root") as HTMLElement
);
registerServiceWorker();
