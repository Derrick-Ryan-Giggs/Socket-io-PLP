import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Home = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load existing notes
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/notes`);
        setNotes(res.data);
      } catch (err) {
        console.error('Error fetching notes:', err);
      }
    };

    fetchNotes();
  }, []);

  // Generate random room ID
  const generateRoomId = () => {
    const randomId = Math.random().toString(36).substring(2, 10);
    setRoomId(randomId);
  };

  // Join existing room
  const joinRoom = () => {
    if (!username) {
      setError('Please enter a username');
      return;
    }
    
    if (!roomId) {
      setError('Please enter a room ID');
      return;
    }

    // Store username in localStorage
    localStorage.setItem('username', username);
    
    // Navigate to the room
    navigate(`/room/${roomId}`);
  };

  // Create new note/room
  const createNewNote = async () => {
    if (!username) {
      setError('Please enter a username');
      return;
    }
    
    if (!title) {
      setError('Please enter a title for your note');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Generate room ID if not provided
      const newRoomId = roomId || Math.random().toString(36).substring(2, 10);
      
      // Create note in database
      await axios.post(`${API_URL}/api/notes`, {
        title,
        roomId: newRoomId,
        username,
        content: ''
      });

      // Store username in localStorage
      localStorage.setItem('username', username);
      
      // Navigate to the new room
      navigate(`/room/${newRoomId}`);
    } catch (err) {
      console.error('Error creating note:', err);
      setError(err.response?.data?.message || 'Error creating note. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-8">
      <div className="bg-gray-50 rounded-lg p-8 shadow-md">
        <h2 className="text-2xl font-bold mb-6">Join or Create a Note</h2>
        
        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-md mb-6">
            {error}
          </div>
        )}
        
        <div className="mb-6">
          <label htmlFor="username" className="block font-medium mb-2">
            Your Name:
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name"
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="roomId" className="block font-medium mb-2">
            Room ID:
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              id="roomId"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter room ID to join"
              className="flex-1 p-3 border border-gray-300 rounded-md"
            />
            <button 
              onClick={generateRoomId} 
              className="bg-gray-600 text-white px-4 py-3 rounded-md hover:bg-gray-700 transition"
            >
              Generate
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="title" className="block font-medium mb-2">
            Note Title (for new notes):
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title for new note"
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <button 
            onClick={joinRoom} 
            className="bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 transition flex-1"
          >
            Join Existing Room
          </button>
          <button 
            onClick={createNewNote} 
            className="bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 transition flex-1 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create New Note'}
          </button>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-8 shadow-md">
        <h2 className="text-2xl font-bold mb-6">Recent Notes</h2>
        {notes.length === 0 ? (
          <p className="text-gray-600">No notes available. Create your first note!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map(note => (
              <div key={note._id} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                <h3 className="font-bold text-lg mb-2">{note.title}</h3>
                <p className="text-sm text-gray-600 mb-1">Created by: {note.createdBy}</p>
                <p className="text-sm text-gray-600 mb-4">
                  Last edited: {new Date(note.updatedAt).toLocaleString()}
                </p>
                <button 
                  onClick={() => {
                    setRoomId(note.roomId);
                    if (!username) {
                      setError('Please enter a username first');
                    } else {
                      localStorage.setItem('username', username);
                      navigate(`/room/${note.roomId}`);
                    }
                  }}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  Join
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;