import React, { useState } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import ReactHtmlParser from "react-html-parser";
import ManualPage from "./pages/manual/manualPage";
import UploadPage from "./pages/upload/uploadPage";
import ResultPage from "./pages/results/resultsPage";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  const [results, setResults] = useState("[]");
  const [error, setError] = useState("[]");
  return (
    <Router basename="/METHODS/corona/gamma/primer/build">
      <Link to="/" style={{ textDecoration: "none" }}>
        <h1 className="title">Primer Checker</h1>
      </Link>

      <Switch>
        <Route exact={true} path="/">
          <UploadPage setResults={setResults} setError={setError} />
        </Route>
        <Route exact={true} path="/manualUpload">
          <ManualPage setResults={setResults} />
        </Route>
        <Route exact={true} path="/results/:display">
          <ResultPage results={results} />
        </Route>
        <Route path="/results">
          <ResultPage results={results} />
        </Route>
        <Route path="/error" exact={true}>
          <div>{error}</div>
        </Route>
        <Route path="/">
          <div>404: Page not found</div>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
