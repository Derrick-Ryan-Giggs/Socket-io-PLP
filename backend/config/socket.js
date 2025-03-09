const socketHandler = (io) => {
    // Store active users by room
    const roomUsers = {};
    
    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);
      
      // Join a room
      socket.on('join_room', ({ roomId, username }) => {
        socket.join(roomId);
        
        // Initialize room if it doesn't exist
        if (!roomUsers[roomId]) {
          roomUsers[roomId] = [];
        }
        
        // Add user to room
        roomUsers[roomId].push({ id: socket.id, username });
        
        // Broadcast to others in the room
        io.to(roomId).emit('user_joined', { 
          message: `${username} joined the room`,
          users: roomUsers[roomId]
        });
        
        console.log(`${username} joined room: ${roomId}`);
      });
      
      // Handle note updates
      socket.on('update_note', (data) => {
        // Broadcast to everyone in the room except sender
        socket.to(data.roomId).emit('note_updated', {
          content: data.content,
          lastEditedBy: data.username,
          timestamp: new Date()
        });
      });
      
      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        
        // Find and remove user from all rooms
        Object.keys(roomUsers).forEach(roomId => {
          const userIndex = roomUsers[roomId].findIndex(user => user.id === socket.id);
          
          if (userIndex !== -1) {
            const username = roomUsers[roomId][userIndex].username;
            roomUsers[roomId].splice(userIndex, 1);
            
            // Broadcast user left
            io.to(roomId).emit('user_left', {
              message: `${username} left the room`,
              users: roomUsers[roomId]
            });
            
            // Clean up empty rooms
            if (roomUsers[roomId].length === 0) {
              delete roomUsers[roomId];
            }
          }
        });
      });
    });
  };
  
  module.exports = socketHandler;