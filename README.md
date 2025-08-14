# KetoOS - macOS Leopard Style Web OS

A fully functional OS-style web application that faithfully replicates the look, feel, and interaction style of macOS Leopard/Snow Leopard era (2008 aesthetic). Built entirely with HTML, CSS, and JavaScript, KetoOS provides a nostalgic yet functional browser-based desktop environment.

![KetoOS Screenshot](https://via.placeholder.com/800x500/4a90e2/ffffff?text=KetoOS+Desktop)

## 🌟 Features

### Core OS Functionality
- **Boot Screen**: Authentic macOS-style startup animation with progress bar
- **Desktop Environment**: Full-screen desktop with customizable background
- **Menu Bar**: Functional menu bar with Apple menu, app menus, and system status
- **Dock**: Interactive dock with hover effects, app launching, and visual feedback
- **Window Management**: Draggable, resizable windows with proper controls
- **Context Menus**: Right-click context menus throughout the interface

### Applications
- **Finder**: File browser with sidebar navigation and toolbar
- **Safari**: Web browser with URL bar and navigation controls
- **Calculator**: Fully functional calculator with macOS-style interface
- **Terminal**: Command-line interface with simulated commands
- **Mail**: Email application (placeholder)
- **Photos**: Photo management (placeholder)
- **Music**: Music player (placeholder)
- **Trash**: System trash with empty functionality

### Interactive Elements
- **Desktop Icons**: Clickable desktop icons for launching apps
- **Window Controls**: Close, minimize, and maximize buttons
- **Keyboard Shortcuts**: Cmd+Q, Cmd+W, Cmd+M, Cmd+Tab support
- **Sound Effects**: Audio feedback for window operations
- **Animations**: Smooth transitions and macOS-style animations

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

#### Development Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ketoos.git
   cd ketoos
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Copy the local environment template
   cp env.local .env.local
   # Edit .env.local with your local settings
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser to `http://localhost:3000`

#### Production Build
1. Build the project:
   ```bash
   npm run build
   ```

2. Preview the production build:
   ```bash
   npm run preview
   ```

#### Simple Setup (No Build Tools)
If you prefer to run without build tools:
1. Clone or download the repository
2. Open `index.html` in your web browser
3. Enjoy the KetoOS experience!

### File Structure
```
KetoOS/
├── index.html              # Main HTML file
├── styles/                 # CSS stylesheets
│   ├── main.css           # Main styles
│   ├── windows.css        # Window-specific styles
│   ├── dock.css           # Dock styles
│   ├── menubar.css        # Menu bar styles
│   ├── context-menu.css   # Context menu styles
│   └── boot.css           # Boot screen styles
├── js/                    # JavaScript modules
│   ├── os.js             # Main OS controller
│   ├── windows.js        # Window management
│   ├── dock.js           # Dock functionality
│   ├── menubar.js        # Menu bar management
│   ├── apps.js           # Application logic
│   ├── context-menu.js   # Context menu system
│   └── boot.js           # Boot screen management
└── README.md             # This file
```

## 🎮 How to Use

### Basic Navigation
- **Click desktop icons** to launch applications
- **Click dock items** to open or focus applications
- **Drag windows** by their title bars
- **Resize windows** using the edges and corners
- **Right-click** anywhere for context menus

### Window Controls
- **Red button**: Close window
- **Yellow button**: Minimize window
- **Green button**: Maximize/restore window
- **Double-click title bar**: Maximize window

### Keyboard Shortcuts
- **Cmd+Q**: Quit all applications
- **Cmd+W**: Close active window
- **Cmd+M**: Minimize active window
- **Cmd+Tab**: Cycle through windows

### Menu Bar
- **Apple menu (🍎)**: System preferences and shutdown options
- **App menus**: Application-specific options
- **System status**: Wi-Fi, battery, and clock information

## 🎨 Design Features

### macOS Leopard Aesthetic
- **Aqua-style UI**: Glossy, rounded window frames
- **Brushed metal backgrounds**: Authentic 2008-era styling
- **Blue selection highlights**: Classic macOS color scheme
- **Lucida Grande typography**: Period-accurate font choices
- **Proper spacing and layout**: Faithful to original design

### Visual Effects
- **Backdrop blur**: Modern glass-morphism effects
- **Smooth animations**: Cubic-bezier easing curves
- **Hover effects**: Interactive feedback
- **Shadow effects**: Depth and layering
- **Gradient backgrounds**: Subtle visual richness

## 🔧 Technical Details

### Architecture
- **Modular JavaScript**: Clean, maintainable code structure
- **Event-driven design**: Responsive user interactions
- **Template-based windows**: Reusable window components
- **State management**: Centralized OS state control

### Performance
- **Optimized animations**: Hardware-accelerated CSS transforms
- **Efficient event handling**: Minimal DOM manipulation
- **Memory management**: Proper cleanup of event listeners
- **Responsive design**: Works across different screen sizes

### Browser Compatibility
- **Modern browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **ES6+ features**: Arrow functions, classes, template literals
- **CSS Grid/Flexbox**: Modern layout techniques
- **Backdrop-filter**: Glass-morphism effects (with fallbacks)

## 🎯 Customization

### Adding New Applications
1. Add app configuration to `os.js` in the `registerApps()` method
2. Create app template in `index.html`
3. Add app-specific logic in `apps.js`
4. Update dock items in `index.html`

### Styling Modifications
- **Colors**: Modify CSS custom properties in `main.css`
- **Animations**: Adjust timing functions in CSS files
- **Layout**: Update grid and flexbox properties
- **Themes**: Add new theme classes and color schemes

### Extending Functionality
- **New window types**: Extend the `Window` class
- **Additional apps**: Create new app classes in `apps.js`
- **System features**: Add new OS-level functionality in `os.js`
- **Keyboard shortcuts**: Extend the keyboard handler

## 🐛 Known Issues

- **Audio context**: Sound effects require user interaction first
- **Mobile support**: Limited touch interaction support
- **File system**: No actual file system integration
- **Network**: Safari app doesn't load real websites

## 🔮 Future Enhancements

### Planned Features
- **File system integration**: Real file operations
- **Network capabilities**: Actual web browsing
- **User accounts**: Multi-user support
- **Settings panel**: System preferences
- **App store**: Application management
- **Notifications**: System notification center

### Technical Improvements
- **Service workers**: Offline functionality
- **WebAssembly**: Performance optimizations
- **WebGL**: Advanced graphics effects
- **PWA support**: Installable web app

## 🚀 Deployment

### Vercel Deployment
1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add all variables from `env.production.template`
3. **Deploy automatically** on git push

### Manual Deployment
1. Build the project:
   ```bash
   npm run build
   ```
2. Upload the `dist/` folder to your web server
3. Configure your server to serve `index.html` for all routes

### Environment Variables
The application uses environment variables for configuration:

#### Local Development
- Copy `env.local` to `.env.local`
- Modify values as needed for local development
- `.env.local` is automatically ignored by git

#### Production (Vercel)
Set these environment variables in your Vercel project:
- `VITE_APP_NAME`: Application name
- `VITE_APP_ENVIRONMENT`: Set to "production"
- `VITE_ENABLE_SOUND_EFFECTS`: Enable/disable sound effects
- `VITE_ENABLE_BOOT_ANIMATION`: Enable/disable boot animation
- `VITE_DEBUG_MODE`: Set to "false" for production
- `VITE_LOG_LEVEL`: Set to "error" for production

### Configuration Management
The application includes a centralized configuration system:
- **Feature flags**: Enable/disable specific features
- **Performance settings**: Control animation speeds and durations
- **UI preferences**: Customize default behaviors
- **Development tools**: Debug mode and logging levels

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Apple Inc.**: Original macOS Leopard design and inspiration
- **Web standards**: Modern web technologies that make this possible
- **Open source community**: Tools and libraries that enabled this project

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style
- Use consistent indentation (2 spaces)
- Follow JavaScript ES6+ conventions
- Maintain CSS organization
- Add comments for complex logic
- Keep functions small and focused

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check the browser console for errors
- Ensure you're using a modern browser
- Try refreshing the page

---

**KetoOS** - Bringing the nostalgia of macOS Leopard to the modern web! 🍎✨
