import React, { useState } from "react";

// import Form from 'react-bootstrap/Form'
// import Row from 'react-bootstrap/Row';
// import Button from 'react-bootstrap/Button';
// import Container from 'react-bootstrap/Container';
// import Collapse from 'react-bootstrap/Collapse';

// import DropZone from "./components/dropzone/dropzone";
// import TextArea from './components/textArea/textArea';
// import FileDisplay from './components/fileDisplay/fileDisplay';
// import primerCheckService from './services/primerCheck';
import UploadPage from "./pages/upload/uploadPage";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import ResultPage from "./pages/results/resultsPage";

function App() {
  const [results, setResults] = useState({});
  return (
    <Router>
      <Link to="/" style={{ textDecoration: "none" }}>
        <h1 className="title">Primer Mutation</h1>
      </Link>

      <Switch>
        <Route exact={true} path="/">
          <UploadPage setResults={setResults} />
        </Route>
        <Route exact={true} path="/results/:display">
          <ResultPage results={results} />
        </Route>
        <Route path="/results">
          <ResultPage results={results} />
        </Route>
        <Route path="/">
          <div>404: Page not found</div>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
