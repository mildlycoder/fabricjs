// App.js
import React from 'react';
import Editor from './Editor';
import './App.css';
import dummy from './dummy.json'
import JsonReader from './JsonReader';
import EditorMP from './EditorMultiPage';
function App() {
  const template = dummy
  return (
    <div className="App">
      <main>
        <Editor/>
        <JsonReader />
        <EditorMP />
      </main>
    </div>
  );
}

export default App;
