# CipherStudio - Browser-Based React IDE

A powerful, browser-based React development environment that allows you to write, run, and preview React applications directly in your browser. Perfect for learning React, prototyping, and quick development sessions.

## 🚀 Features

### Core Features
- **File Management**: Create, delete, rename, and organize project files with an intuitive file tree
- **Code Editor**: Monaco Editor with syntax highlighting for TypeScript, JavaScript, JSX, and CSS
- **Live Preview**: Real-time preview with two modes:
  - **Sandpack**: Full npm runtime with network access
  - **Local**: Offline React compiler with instant updates
- **Project Persistence**: Save and load projects using localStorage or backend API
- **Import/Export Support**: Full ES6 module support with automatic resolution

### Advanced Features
- **Hover Actions**: Rename and delete files with hover controls
- **Auto-save**: Optional automatic saving of your work
- **Backend Integration**: Optional MongoDB backend for project persistence
- **Responsive Design**: Works on desktop and tablet screens
- **Dark Theme**: Modern, eye-friendly interface

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Monaco Editor** for code editing
- **Sandpack** for live preview
- **Zustand** for state management
- **Tailwind CSS** for styling

### Backend
- **Node.js** with Express
- **MongoDB** for data persistence
- **JWT** for authentication
- **AWS S3** for file storage (optional)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CipherStudio
   ```

2. **Install dependencies**
   ```bash
   # Install client dependencies
   cd client
   npm install
   
   # Install server dependencies
   cd ../server
   npm install
   ```

3. **Environment Setup**
   
   Create `server/.env`:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=4000
   ```

   Create `client/.env`:
   ```env
   VITE_API_BASE=http://localhost:4000
   VITE_JWT=your_jwt_token
   ```

4. **Start the development servers**
   ```bash
   # Terminal 1 - Start backend
   cd server
   npm run dev
   
   # Terminal 2 - Start frontend
   cd client
   npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:5174
   - Backend API: http://localhost:4000

## 📖 Usage

### Getting Started
1. **Open the IDE** in your browser
2. **Create files** using the file tree or "Add" button
3. **Write React code** in the editor
4. **Preview your app** in real-time
5. **Save your project** using the top bar controls

### File Management
- **Create files**: Click "Add" button in file tree
- **Rename files**: Hover over file → Click ✏️ → Type new name
- **Delete files**: Hover over file → Click 🗑️ → Confirm deletion
- **Open files**: Click on any file in the tree

### Preview Modes
- **Local Preview**: Offline, instant updates, no network required
- **Sandpack Preview**: Full npm runtime, requires network connection

### Project Management
- **Save to localStorage**: Automatic or manual saving
- **Load from localStorage**: Restore previous projects
- **Backend sync**: Optional cloud persistence

## 🏗️ Project Structure

```
CipherStudio/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── store/         # Zustand state management
│   │   ├── lib/           # Utility functions
│   │   └── App.tsx        # Main app component
│   ├── public/            # Static assets
│   └── package.json
├── server/                # Express backend
│   ├── index.js           # Server entry point
│   ├── .env               # Environment variables
│   └── package.json
└── README.md
```

## 🔧 Configuration

### Backend Configuration
The server can run with or without MongoDB:
- **With MongoDB**: Full persistence and user management
- **Without MongoDB**: In-memory storage for development

### Frontend Configuration
- **API Base URL**: Set `VITE_API_BASE` in client/.env
- **JWT Token**: Set `VITE_JWT` for authenticated requests

## 🎯 Example Projects

### Shopping Cart App
The default project includes a complete React shopping cart with:
- Product listing
- Add to cart functionality
- Cart state management
- Component composition

### Creating Your Own Projects
1. Start with `App.js` as your main component
2. Create additional components as needed
3. Use `import` statements to connect components
4. Preview updates in real-time

## 🚀 Deployment

### Frontend Deployment
```bash
cd client
npm run build
# Deploy dist/ folder to your hosting service
```

### Backend Deployment
```bash
cd server
npm start
# Deploy to your server with environment variables
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Monaco Editor** for the code editing experience
- **Sandpack** for the live preview capabilities
- **React** for the component-based architecture
- **Vite** for the fast development experience

## 🐛 Troubleshooting

### Common Issues

**Preview not loading?**
- Check if Preview mode is set to "Local"
- Ensure your React components have proper exports
- Check browser console for errors

**Import errors?**
- Make sure file paths are correct
- Use relative imports like `./Component`
- Check that imported files exist

**Backend connection issues?**
- Verify MongoDB connection string
- Check if server is running on correct port
- Ensure environment variables are set

### Getting Help
- Check the browser console for error messages
- Verify all dependencies are installed
- Ensure Node.js version is 18+

## 🔮 Future Features

- [ ] User authentication and accounts
- [ ] Project sharing and collaboration
- [ ] Git integration
- [ ] Package management
- [ ] Theme customization
- [ ] Mobile support
- [ ] Plugin system

---

**Happy Coding! 🎉**

Built with ❤️ for the React community.
