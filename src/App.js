import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import DropZone from "./components/dropzone/dropzone";
import TextArea from './components/textArea/textArea';


function App() {
  return (
    <div>
      <h1 className='title'>Primer Mutation</h1>
      <div className='content'>
        <TextArea />
      </div>
      <div className="content">
        <DropZone />
      </div>
    </div >
  );
}

export default App;
