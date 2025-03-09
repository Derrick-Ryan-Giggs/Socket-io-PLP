import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/socketContext.jsx';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';


const NoteEditor = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { socket, connected } = useSocket();
  const [note, setNote] = useState({ title: '', content: '' });
  const [content, setContent] = useState('');
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  const [typing, setTyping] = useState(false);
  const [username, setUsername] = useState('');
  const typingTimeoutRef = useRef(null);
  const contentRef = useRef(null);

  // Get username from localStorage
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (!storedUsername) {
      // Redirect to home if no username
      navigate('/');
    } else {
      setUsername(storedUsername);
    }
  }, [navigate]);

  // Fetch note data
  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/notes/${roomId}`);
        setNote(res.data);
        setContent(res.data.content);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching note:', err);
        setError('Note not found. It may have been deleted or the room ID is incorrect.');
        setLoading(false);
      }
    };

    if (roomId) {
      fetchNote();
    }
  }, [roomId]);

  // Socket connection effect
  useEffect(() => {
    if (!socket || !connected || !username) return;

    // Join room
    socket.emit('join_room', { roomId, username });

    // Listen for events
    socket.on('user_joined', (data) => {
      setUsers(data.users);
      addMessage(data.message);
    });

    socket.on('user_left', (data) => {
      setUsers(data.users);
      addMessage(data.message);
    });

    socket.on('note_updated', (data) => {
      setContent(data.content);
      addMessage(`Note updated by ${data.lastEditedBy}`);
      
      // If the contentRef has a current value, update it
      if (contentRef.current) {
        contentRef.current.value = data.content;
      }
    });

    return () => {
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('note_updated');
    };
  }, [socket, connected, roomId, username]);

  const addMessage = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setMessages(prev => [...prev, { text: message, time: timestamp }]);
  };

  // Handle content change with debounce
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    setTyping(true);

    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set a new timeout to update after 500ms of no typing
    typingTimeoutRef.current = setTimeout(() => {
      updateNote(newContent);
      setTyping(false);
    }, 500);

    // Emit typing event to other users
    socket.emit('update_note', {
      roomId,
      username,
      content: newContent
    });
  };

  // Save note to database
  const updateNote = async (newContent) => {
    try {
      const res = await axios.patch(`${API_URL}/api/notes/${roomId}`, {
        content: newContent,
        username
      });
      
      setLastSaved(new Date());
      return res.data;
    } catch (err) {
      console.error('Error updating note:', err);
      setError('Failed to save note. Please try again.');
    }
  };

  // Copy room ID to clipboard
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId)
      .then(() => {
        addMessage('Room ID copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy room ID:', err);
      });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading note...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 px-4">
        <p className="text-red-600 bg-red-100 p-4 rounded-md mb-4 text-center">
          {error}
        </p>
        <button 
          onClick={() => navigate('/')} 
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 flex flex-col h-[calc(100vh-160px)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
        <h2 className="text-2xl font-bold">{note.title}</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Room ID: {roomId}</span>
          <button 
            onClick={copyRoomId} 
            className="bg-gray-600 text-white px-2 py-1 text-xs rounded-md hover:bg-gray-700 transition"
          >
            Copy
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 space-y-4 md:space-y-0 md:space-x-4 min-h-0">
        <div className="flex-grow flex flex-col">
          <textarea
            ref={contentRef}
            value={content}
            onChange={handleContentChange}
            placeholder="Start typing your note here..."
            className="flex-1 p-4 border border-gray-300 rounded-md resize-none font-sans text-base leading-relaxed min-h-[200px]"
          />
          <div className="flex justify-end py-2 text-xs text-gray-600">
            {typing ? (
              <span className="text-blue-600">Syncing changes...</span>
            ) : (
              lastSaved && (
                <span className="text-green-600">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )
            )}
          </div>
        </div>

        <div className="md:w-64 space-y-4 flex-shrink-0">
          <div className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200">
            <h3 className="font-bold text-lg mb-2">Online Users ({users.length})</h3>
            <ul className="divide-y divide-gray-200">
              {users.map(user => (
                <li key={user.id} className="py-2">
                  {user.username} {user.username === username && '(You)'}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200">
            <h3 className="font-bold text-lg mb-2">Activity Log</h3>
            <div className="h-48 overflow-y-auto border border-gray-200 rounded-md p-2 bg-white">
              {messages.map((msg, index) => (
                <div key={index} className="mb-2 text-sm">
                  <span className="text-gray-500 text-xs mr-2">{msg.time}</span>
                  <span>{msg.text}</span>
                </div>
              ))}
              {messages.length === 0 && (
                <p className="text-gray-500 text-sm">No activity yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <button 
          onClick={() => navigate('/')} 
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default NoteEditor;