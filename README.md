# 🎮 Gem5 Simulation Analyzer - Web Edition 🎮

A modern web-based gem5 simulation analyzer with Flask backend and interactive JavaScript frontend. Features cute animations, real-time data visualization, and comprehensive analysis tools.

## ✨ Features

- 🎯 **Register Spill Analysis**: Detailed analysis of register spills with visualizations
- ⚡ **Performance Metrics**: CPU performance analysis with cute metric cards
- 💾 **Memory System Analysis**: Memory subsystem performance and statistics
- 📈 **Interactive Visualizations**: Multiple chart types for different analyses
- 🎭 **Cute Animations**: Lively UI with colorful animations and emojis
- 📊 **Real-time Updates**: Live data loading and display updates

## 🚀 Quick Start

### Prerequisites
- Python 3.7+
- tkinter (usually included with Python)
- Required packages (see requirements.txt)

### Installation

1. **Clone or download the files**
2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the web application**:
   ```bash
   python app.py
   ```

4. **Open your browser** and go to:
   ```
   http://localhost:5001
   ```

## 📁 File Structure

```
Lyiv/
├── app.py                 # Flask backend application
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── templates/            # HTML templates
│   └── index.html        # Main web interface
├── static/               # Static web assets
│   ├── css/
│   │   └── style.css     # Cute CSS styles
│   └── js/
│       └── app.js        # Interactive JavaScript
└── m5out/                # gem5 output directory
    ├── stats.txt         # Simulation statistics
    ├── x86_spill_stats.txt # Register spill data
    ├── config.json       # Simulation configuration
    └── count_stats.txt   # Additional statistics
```

## 🎮 Usage

### Automatic Loading
The web application automatically loads data from the `m5out/` directory if it exists.

### Web Interface Features
- 🔄 **Auto-refresh**: Data updates every 30 seconds
- 📊 **Interactive Charts**: Click and hover for details
- 🎯 **Real-time Updates**: Live data visualization
- 📱 **Responsive Design**: Works on all screen sizes

### Web Interface Sections

#### 📊 Overview Section
- Key performance metrics in cute animated cards
- Register spill summary statistics
- Real-time performance indicators

#### ⚡ Performance Metrics Table
- Detailed CPU performance metrics
- Instruction execution statistics
- Interactive data tables

#### 🎯 Spill Analysis
- Register spill event details
- Spill timeline and patterns
- Memory address analysis

#### 📈 Interactive Charts
- **📊 Instruction Mix**: Doughnut chart of instruction types
- **⏱️ Spill Timeline**: Scatter plot of spill events over time
- **🔥 Spill Heatmap**: Bar chart of address-based spill analysis

## 🎨 Customization

### Colors and Themes
The web interface uses a modern dark theme with vibrant accent colors:
- Background: `#1a1a2e` (Dark blue gradient)
- Cards: `#2c2c54` (Medium blue)
- Accent: `#ff6b6b` (Coral red)
- Success: `#4ecdc4` (Turquoise)
- Interactive: `#45b7d1` (Sky blue)

### Adding New Visualizations
Extend the JavaScript `Gem5Analyzer` class to add new chart types and API endpoints.

### API Endpoints
- `/api/overview` - Key metrics
- `/api/performance` - Performance data
- `/api/spills` - Spill events
- `/api/instruction-mix` - Instruction distribution
- `/api/spill-timeline` - Timeline data
- `/api/spill-heatmap` - Heatmap data
- `/api/reload` - Reload data
- `/api/status` - System status

## 🔧 Technical Details

### Data Parsing
- **stats.txt**: Parsed line by line for metric extraction
- **x86_spill_stats.txt**: CSV format with spill event data
- **config.json**: JSON configuration data

### Performance
- Efficient data loading with pandas
- RESTful API with Flask
- Interactive charts with Chart.js
- Responsive design with Bootstrap
- Real-time updates with JavaScript

## 🐛 Troubleshooting

### Common Issues

1. **Import Errors**: Make sure all dependencies are installed
   ```bash
   pip install flask flask-cors pandas numpy
   ```

2. **Port Issues**: If port 5001 is busy, change it in app.py
   ```python
   app.run(debug=True, host='0.0.0.0', port=5002)
   ```

3. **Browser Issues**: Make sure JavaScript is enabled

### Performance Tips
- Limit spill data display for better performance
- Use browser developer tools for debugging
- Check browser console for JavaScript errors
- Refresh page if data seems stale

## 🎯 Register Spill Analysis

The web application provides comprehensive analysis of register spills:

### Spill Detection Format
```
SPILL,store_pc,load_pc,memory_address,store_tick,load_tick,tick_diff,store_inst_count,load_inst_count
```

### Key Metrics
- **Total Spills**: Number of detected spill events
- **Average Tick Difference**: Mean time between store and load
- **Memory Address Patterns**: Common spill locations
- **Instruction Timing**: Spill correlation with instruction count

## 🎭 Web Features

- Pulsing metric cards with color transitions
- Emoji-rich interface for better user experience
- Smooth animations for data updates
- Colorful charts with vibrant palettes
- Interactive hover effects
- Real-time data refresh
- Responsive mobile design

## 📊 Sample Analysis

The web application automatically analyzes your gem5 simulation results and provides:

1. **Performance Summary**: IPC, CPI, instruction counts
2. **Memory Analysis**: Load/store patterns, cache behavior
3. **Spill Patterns**: Register spill frequency and timing
4. **Visual Insights**: Charts and graphs for pattern recognition

## 🤝 Contributing

Feel free to enhance the web application with:
- New visualization types with Chart.js
- Additional API endpoints
- Improved animations and effects
- Better error handling
- Performance optimizations
- Mobile app integration

## 📄 License

This project is open source and available under the MIT License.

---

**Enjoy analyzing your gem5 simulations with this cute and modern web interface! 🎮✨**
