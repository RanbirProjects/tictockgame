# Tic-Tac-Toe MERN Stack Game

A full-stack Tic-Tac-Toe game built with the MERN stack (MongoDB, Express.js, React.js, Node.js) featuring user authentication, multiplayer support, and game statistics.

## 🎮 Features

### Core Game Features
- **Classic Tic-Tac-Toe gameplay** with a 3x3 grid
- **Single Player Mode** - Play against yourself
- **Multiplayer Mode** - Play with friends
- **Real-time game state** with automatic turn switching
- **Win detection** for rows, columns, and diagonals
- **Draw detection** when the board is full

### User Features
- **User Registration & Authentication** with JWT tokens
- **User Profiles** with editable information
- **Game Statistics** tracking wins, losses, draws, and win rate
- **Game History** showing all past games
- **Responsive Design** works on desktop and mobile

### Technical Features
- **RESTful API** with Express.js backend
- **MongoDB Database** for persistent data storage
- **JWT Authentication** for secure user sessions
- **Material-UI** for modern, responsive design
- **Context API** for state management
- **Protected Routes** for authenticated users

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tictactoe-mern
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the `server` directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/tictactoe
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   PORT=5000
   NODE_ENV=development
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system, or use MongoDB Atlas.

5. **Run the application**
   
   From the root directory:
   ```bash
   # Start both frontend and backend
   npm start
   
   # Or start them separately:
   npm run server  # Backend only
   npm run client  # Frontend only
   ```

6. **Access the application**
   
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
tictactoe-mern/
├── client/                 # React frontend
│   ├── public/
│   │   ├── components/     # React components
│   │   │   ├── auth/       # Authentication components
│   │   │   └── ...
│   │   ├── contexts/       # React contexts
│   │   └── ...
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── config.env          # Environment variables
│   ├── server.js           # Main server file
│   └── package.json
├── package.json            # Root package.json
└── README.md
```

## 🎯 How to Play

### Single Player Mode
1. Register or login to your account
2. Click "New Game" on the dashboard
3. Select "Single Player"
4. Play against yourself by clicking on empty cells
5. Try to get three in a row to win!

### Multiplayer Mode
1. Create a new multiplayer game
2. Share the game URL with a friend
3. Your friend can join the game
4. Take turns making moves
5. First to get three in a row wins!

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Games
- `POST /api/games` - Create a new game
- `GET /api/games` - Get user's games
- `GET /api/games/:id` - Get specific game
- `PUT /api/games/:id/move` - Make a move
- `PUT /api/games/:id/join` - Join multiplayer game
- `DELETE /api/games/:id` - Delete game

## 🛠️ Technologies Used

### Frontend
- **React.js** - UI library
- **Material-UI** - Component library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Context API** - State management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

## 🎨 Customization

### Styling
The app uses Material-UI theming. You can customize the theme in `client/src/App.js`:

```javascript
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Change primary color
    },
    secondary: {
      main: '#dc004e', // Change secondary color
    },
  },
});
```

### Game Rules
Modify the game logic in `server/models/Game.js` to change win conditions or board size.

## 🚀 Deployment

### Backend Deployment (Heroku)
1. Create a Heroku app
2. Set environment variables in Heroku dashboard
3. Connect to MongoDB Atlas
4. Deploy using Git

### Frontend Deployment (Netlify/Vercel)
1. Build the React app: `npm run build`
2. Deploy the `build` folder to your hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check your connection string in `config.env`

2. **Port Already in Use**
   - Change the port in `config.env`
   - Kill processes using the port

3. **JWT Token Issues**
   - Clear browser localStorage
   - Check JWT_SECRET in environment variables

4. **CORS Errors**
   - Ensure the backend is running on the correct port
   - Check CORS configuration in `server.js`

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**Happy Gaming! 🎮** # tictockgame
