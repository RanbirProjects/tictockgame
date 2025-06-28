# 🎮 Enhanced Tic-Tac-Toe Game

A feature-rich Tic-Tac-Toe game built with React, Material-UI, and Node.js. Play against AI or another player with multiple board sizes, scoring, and advanced features.

## ✨ Features

### 🎯 Game Modes
- **Player vs Player (PvP)**: Classic two-player mode
- **Player vs AI**: Challenge intelligent computer opponents

### 🤖 AI Difficulty Levels
- **Easy**: Random moves for beginners
- **Medium**: 50% smart moves, 50% random
- **Hard**: Intelligent AI that tries to win and block your moves

### 📏 Multiple Board Sizes
- **3x3**: Classic Tic-Tac-Toe
- **4x4**: Larger board for more complex gameplay
- **5x5**: Advanced board for experienced players

### 📊 Statistics & Tracking
- Real-time score tracking for X, O, and draws
- Game timer showing current game duration
- Persistent score history across games
- Game history with detailed information

### 🎨 Visual Enhancements
- **Dark/Light Mode**: Toggle between themes
- **Winning Line Highlight**: Green highlight for winning combination
- **Last Move Indicator**: Yellow highlight for the most recent move
- **Smooth Animations**: Hover effects and move animations
- **Responsive Design**: Works on all screen sizes

### 🔊 Sound Effects
- Move sounds when placing pieces
- Victory sounds when winning
- Draw sounds for tied games
- Toggle sound on/off

### ⚙️ Settings Panel
- Game mode selection
- AI difficulty adjustment
- Board size selection
- Animation toggle
- Sound toggle

## 🚀 Live Demo

Play the game online: [Tic-Tac-Toe Game](https://your-vercel-deployment-url.com)

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern React with hooks
- **Material-UI**: Beautiful UI components
- **React Router**: Navigation and routing
- **Axios**: HTTP client for API calls

### Backend
- **Node.js**: Server runtime
- **Express.js**: Web framework
- **MongoDB**: Database (with in-memory fallback)
- **JWT**: Authentication
- **Mongoose**: MongoDB ODM

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/RanbirProjects/tictockgame.git
   cd tictockgame
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   
   # Install server dependencies
   cd ../server
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Create environment file for server
   cd server
   cp config.env.example config.env
   ```
   
   Edit `server/config.env`:
   ```env
   PORT=5001
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. **Run the application**
   ```bash
   # From root directory
   npm start
   ```
   
   This will start both the backend server (port 5001) and frontend (port 3000).

## 🎮 How to Play

1. **Choose Game Mode**: Select between PvP or AI mode in settings
2. **Select Board Size**: Choose 3x3, 4x4, or 5x5 board
3. **Adjust AI Difficulty**: If playing against AI, choose easy, medium, or hard
4. **Make Moves**: Click on empty cells to place your X or O
5. **Win**: Get 3, 4, or 5 in a row (depending on board size) to win
6. **Track Progress**: View your scores and game history

## 🔧 Development

### Project Structure
```
tictockgame/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   └── App.js         # Main app component
│   └── package.json
├── server/                # Node.js backend
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── server.js         # Server entry point
├── package.json          # Root package.json
└── README.md
```

### Available Scripts

```bash
# Root directory
npm start          # Start both client and server
npm run client     # Start only frontend
npm run server     # Start only backend

# Client directory
npm start          # Start React development server
npm build          # Build for production
npm test           # Run tests

# Server directory
npm start          # Start Express server
npm run dev        # Start with nodemon
```

## 🌐 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set build command: `cd client && npm install && npm run build`
3. Set output directory: `client/build`
4. Deploy!

### Environment Variables for Production
- `REACT_APP_API_URL`: Your backend API URL
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT secret key

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Material-UI for the beautiful components
- React team for the amazing framework
- The Tic-Tac-Toe community for inspiration

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact the maintainer.

---

**Enjoy playing! 🎉**
