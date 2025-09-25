# Lyiv
Smooth latte gem5 interface

## 🎮 Gem5 Statistics Web Application

A modern web-based gem5 simulation analyzer with React frontend and Flask backend. Features dark/light theme toggle, tooltip system for data source information, and responsive design.

## ✨ Features

- 🎯 **Register Spill Analysis**: Detailed analysis of register spills with visualizations
- ⚡ **Performance Metrics**: CPU performance analysis with interactive metric cards
- 💾 **Memory System Analysis**: Memory subsystem performance and statistics
- 📈 **Interactive Tooltips**: Data source information with hover tooltips
- 🎭 **Theme Toggle**: Dark/light theme switching
- 📊 **Real-time Updates**: Live data loading and display updates
- 📱 **Responsive Design**: Works on all screen sizes

## 🚀 Quick Start

### Prerequisites
- Python 3.7+
- Node.js 14+
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone git@github.com:catnys/Lyiv.git
   cd Lyiv
   ```

2. **Backend setup**:
   ```bash
   cd backend
   pip install -r requirements.txt
   python app.py
   ```

3. **Frontend setup** (in a new terminal):
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Open your browser** and go to:
   ```
   http://localhost:3000
   ```

## 📁 File Structure

```
Lyiv/
├── backend/                 # Flask backend
│   ├── app.py              # Main Flask application
│   ├── requirements.txt    # Python dependencies
│   ├── services/           # API services
│   ├── utils/              # Data processing utilities
│   └── models/             # Data models
├── frontend/               # React frontend
│   ├── src/
│   │   ├── App.tsx         # Main React component
│   │   ├── App.css         # Styling
│   │   └── services/       # API services
│   ├── package.json        # Node dependencies
│   └── public/             # Static assets
├── m5out/                  # gem5 output directory
│   ├── stats.txt           # Simulation statistics
│   ├── x86_spill_stats.txt # Register spill data
│   └── config.json         # Simulation configuration
└── README.md               # This file
```

## 🎮 Usage

### Automatic Loading
The web application automatically loads data from the `m5out/` directory.

### Web Interface Features
- 🔄 **Auto-refresh**: Data updates automatically
- 📊 **Interactive Tooltips**: Hover over ℹ️ buttons for data source info
- 🎯 **Theme Toggle**: Switch between dark/light themes
- 📱 **Responsive Design**: Works on all screen sizes
- 📈 **Normal Scroll**: Smooth vertical scrolling between sections

### Data Sources
Each metric shows its data source and calculation method:
- **Total Instructions**: `stats.txt` → `simInsts`
- **Total Ticks**: `stats.txt` → `simTicks`
- **Total Loads**: `stats.txt` → `system.cpu.commitStats0.numLoadInsts`
- **Total Stores**: `stats.txt` → `system.cpu.commitStats0.numStoreInsts`
- **Total Spills**: `x86_spill_stats.txt` → spill count
- **Percentages**: Calculated ratios with formulas

## 🎨 Customization

### Colors and Themes
The web interface supports both light and dark themes:
- **Light Theme**: Clean white background with blue accents
- **Dark Theme**: Dark background with gold accents
- **Tooltips**: Blue borders (light) / Gold borders (dark)

### API Endpoints
- `/api/basic-metrics` - Basic performance metrics
- `/api/debug-stats` - Debug information

## 🔧 Technical Details

### Data Parsing
- **stats.txt**: Parsed for metric extraction
- **x86_spill_stats.txt**: Spill event counting
- **config.json**: Configuration data

### Performance
- Efficient data loading with pandas
- RESTful API with Flask
- React frontend with TypeScript
- Responsive design with CSS Grid
- Real-time updates with React hooks

## 🐛 Troubleshooting

### Common Issues

1. **Backend Port Issues**: If port 5002 is busy, change it in `backend/app.py`
2. **Frontend Port Issues**: If port 3000 is busy, React will suggest an alternative
3. **Data Loading**: Make sure `m5out/` directory exists with required files

### Performance Tips
- Use browser developer tools for debugging
- Check browser console for JavaScript errors
- Refresh page if data seems stale

## 🤝 Contributing

Feel free to enhance the application with:
- New visualization types
- Additional API endpoints
- Improved animations and effects
- Better error handling
- Performance optimizations

## 📄 License

This project is open source and available under the MIT License.

---

**Enjoy analyzing your gem5 simulations with this smooth and modern interface! 🎮✨**
