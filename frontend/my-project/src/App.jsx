import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import NoteEditor from '../src/components/NoteEditor.jsx';
import Home from '../src/components/Home.jsx'
import { SocketProvider } from '../src/context/socketContext.jsx';
function App() {
  return (
    <SocketProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <header className="bg-gray-800 text-white p-4 text-center">
            <h1 className="text-2xl font-bold">Real-Time Collaborative Notes</h1>
          </header>
          <main className="flex-1 py-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/room/:roomId" element={<NoteEditor />} />
            </Routes>
          </main>
          <footer className="bg-gray-100 p-4 text-center text-sm text-gray-600 mt-auto">
            <p>Real-Time Notes App © {new Date().getFullYear()}</p>
          </footer>
        </div>
      </Router>
    </SocketProvider>
  );
}

export default App;