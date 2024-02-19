// App.js
import React from 'react';
import Editor from './Editor';
import './App.css';
import dummy from './dummy.json'
function App() {
  const template = dummy
  return (
    <div className="App">
      <main>
        <Editor templateData={template}/>
      </main>
    </div>
  );
}

export default App;
