# Real-Time Collaborative Notes

A real-time collaborative note-taking application built with the MERN stack and Socket.io. This application allows multiple users to join specific rooms and collaborate on shared notes in real-time.

## Features

- Create and join collaborative note rooms
- Real-time synchronization of note content across all connected clients
- See who is currently editing the note
- View all online users in a room
- Activity log showing user join/leave events and note updates
- Responsive design for desktop and mobile devices

## Technologies Used

- **Frontend**: React, Socket.io-client, React Router
- **Backend**: Node.js, Express, Socket.io, MongoDB
- **Database**: MongoDB
- **Deployment**: Render (backend), Vercel (frontend)

## Key Real-Time Concepts

1. **WebSockets**: This project uses Socket.io to establish persistent, bidirectional connections between clients and the server, enabling real-time data exchange without the overhead of HTTP polling.

2. **Rooms**: Socket.io's concept of "rooms" is used to group connections, allowing users to collaborate only with others in the same room. When a user joins a room (identified by the `roomId`), they only receive updates from other users in that same room.

3. **Event-Based Communication**: The application uses various events to handle different real-time scenarios:
   - `join_room`: Emitted when a user joins a specific note room
   - `update_note`: Emitted when a user makes changes to the note content
   - `user_joined`: Broadcasted to all room members when a new user joins
   - `user_left`: Broadcasted when a user disconnects or leaves the room
   - `note_updated`: Sent to all users in a room when the note content changes

4. **Debouncing**: To prevent excessive socket events and database writes, user input is debounced so that updates are only sent after a brief pause in typing.

5. **State Synchronization**: The application ensures all users see the same state of the note by:
   - Loading initial content from the database
   - Broadcasting all changes to all connected clients in the same room
   - Saving changes to the database periodically

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB account and database
- npm or yarn

### Local Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/real-time-notes.git
cd real-time-notes
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Set up environment variables for the backend:
Create a `.env` file in the `backend` directory with the following content:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173
```

4. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

5. Create a `.env` file in the `frontend` directory:
```
VITE_API_URL=http://localhost:5000
```

6. Start the development servers:

For the backend:
```bash
cd backend
npm start
```

For the frontend (in a separate terminal):
```bash
cd frontend
npm start
```

7. Open your browser and navigate to `http://localhost:5173`

## Usage

1. On the homepage, enter your name and either:
   - Enter a room ID to join an existing note
   - Generate a random room ID and provide a title to create a new note

2. Once in the note editor:
   - Type to edit the note content
   - See other users' changes in real-time
   - View the list of online users in the sidebar
   - Check the activity log for events
   - Copy the room ID to share with others

3. The note automatically saves as you type, and changes are immediately visible to all connected users in the same room.

## Deployment

The application is configured for deployment to Render (backend) and Vercel (frontend). See the deployment section in the project files for detailed instructions.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.