import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider as RTKProvider } from "react-redux";
import { store } from "./stores";
// import { PersistGate } from "redux-persist/integration/react";

createRoot(document.getElementById("root")).render(
  <RTKProvider store={store}>
    {/* <PersistGate loading={<div>Loading...</div>} persistor={persistor}> */}
      <App />
    {/* </PersistGate> */}
  </RTKProvider>,
);
