# Lyiv ☕
> **Smooth Latte Gem5 Interface** - A Modern Simulation Analysis Platform

<div align="center">
  <img src="images/stuff/coffyyy.png" alt="Pixel Art Coffee Latte" width="200" height="200">
  
  [![Python](https://img.shields.io/badge/Python-3.7+-blue.svg)](https://python.org)
  [![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org)
  [![Flask](https://img.shields.io/badge/Flask-2.0+-green.svg)](https://flask.palletsprojects.com)
  [![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-3178C6.svg)](https://typescriptlang.org)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
</div>

## 🎯 Overview

**Lyiv** is a sophisticated web-based gem5 simulation analyzer that transforms complex simulation data into beautiful, interactive visualizations. Built with modern web technologies, it provides researchers and developers with an intuitive interface to analyze CPU performance, memory systems, and register spill patterns.

### ✨ Key Features

- 🎯 **Advanced Register Spill Analysis** - Deep insights into register allocation patterns
- ⚡ **Real-time Performance Metrics** - Live CPU and memory performance monitoring  
- 💾 **Comprehensive Memory Analysis** - Memory subsystem performance and statistics
- 📈 **Interactive Data Visualizations** - Dynamic charts and graphs with hover tooltips
- 🎭 **Modern UI/UX** - Dark/light theme with glassmorphism effects
- 📊 **Live Data Updates** - Real-time data loading and display synchronization
- 📱 **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- 🔍 **Detailed Tooltips** - Contextual information for every data point
- 🔥 **Thermal Heatmap Visualizations** - Register usage intensity analysis
- ⚡ **Dynamic vs Static Instruction Analysis** - Comprehensive instruction breakdown

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.7+** - Backend runtime environment
- **Node.js 14+** - Frontend development environment  
- **npm** or **yarn** - Package manager for frontend dependencies
- **Git** - Version control system

### 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Lyiv.git
   cd Lyiv
   ```

2. **Set up the backend environment**
   ```bash
   # Create and activate virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install Python dependencies
   cd backend
   pip install -r requirements.txt
   ```

3. **Set up the frontend environment**
   ```bash
   # Install Node.js dependencies
   cd frontend
   npm install
   ```

### 🎮 Running the Application

**Step 1: Start the Backend Server**
```bash
# From the project root directory
source venv/bin/activate  # Activate virtual environment
cd backend
python simple_app.py
```

You should see the following output:
```
🎮 Starting Simple Gem5 Analyzer...
✅ All data loaded successfully
🚀 Starting Simple Flask server...
📊 Backend API: http://localhost:5050
🎨 Frontend: http://localhost:8080
```

**Step 2: Start the Frontend Development Server**
```bash
# In a new terminal window
cd frontend
npm start
```

**Step 3: Access the Application**
- **Frontend Interface**: [http://localhost:8080](http://localhost:8080)
- **Backend API**: [http://localhost:5050](http://localhost:5050)

> **Note**: Ensure the `m5out/` directory contains your gem5 simulation data files (`stats.txt`, `x86_spill_stats.txt`, etc.)

## 📁 Project Structure

```
Lyiv/
├── backend/                # Flask backend server
│   ├── requirements.txt    # Python dependencies
│   ├── simple_app.py       # Main Flask application
│   ├── spill_visualization_generator.py # Spill chart generator
│   ├── models/             # Data models
│   ├── services/           # API service modules
│   │   ├── simple_api.py   # REST API endpoints
│   └── utils/              # Data processing utilities
│       ├── api_helpers.py  # API helper functions
│       ├── simple_reader.py # Gem5 spill log parser
├── frontend/               # React frontend application
│   ├── package.json        # Node.js dependencies
│   ├── tsconfig.json       # TypeScript config
│   ├── public/             # Static assets (images, index.html)
│   └── src/                # Source code
│       ├── App.tsx         # Main React component
│       ├── services/       # API client services
│           └── api.ts      # HTTP client configuration
├── m5out/                  # Gem5 simulation output
│   ├── stats.txt           # Simulation statistics
│   ├── x86_spill_stats.txt # Register spill data
│   ├── config.json         # Simulation configuration
│   └── fs/                 # System info (cpuinfo, stat)
├── images/                 # Project images and graphs
│   ├── graphs/             # Chart images
│   └── stuff/              # Misc images (coffyyy.png)
├── run_lyiv.sh             # Automated startup script
├── README.md               # Project documentation
└── LICENSE                 # MIT License
```

## 🎮 Usage Guide

### Automatic Data Loading
The application automatically loads and processes data from the `m5out/` directory when the backend starts.

### Web Interface Features

#### 🔄 Real-time Data Updates
- Automatic data refresh and synchronization
- Live performance metrics monitoring
- Dynamic chart updates

#### 📊 Interactive Visualizations
- **Hover Tooltips**: Detailed information for every data point
- **Zoom & Pan**: Interactive charts with navigation controls
- **Theme Toggle**: Switch between dark and light modes
- **Responsive Design**: Optimized for all screen sizes

#### 🎯 Data Analysis Tools
- **Register Spill Analysis**: Comprehensive spill pattern visualization
- **Performance Metrics**: CPU utilization and efficiency analysis
- **Memory System Stats**: Cache performance and memory bandwidth
- **Instruction Mix**: Detailed instruction type breakdown
- **Register Usage Heatmap**: Thermal visualization of register access patterns
- **Dynamic vs Static Analysis**: Comprehensive instruction type comparison

### Data Sources

Each metric displays its data source and calculation method:

| Metric                      | Source & API Endpoint                | Description                                      |
|-----------------------------|--------------------------------------|--------------------------------------------------|
| **Total Instructions**      | `stats.txt` → `/api/basic-metrics`   | Total executed instructions                      |
| **Simulation Ticks**        | `stats.txt` → `/api/basic-metrics`   | Simulation time in ticks                         |
| **Total Loads**             | `stats.txt` → `/api/basic-metrics`   | Memory load operations                           |
| **Total Stores**            | `stats.txt` → `/api/basic-metrics`   | Memory store operations                          |
| **Register Spills**         | `x86_spill_stats.txt` → `/api/spill-analysis` | Register spill events (full streaming analysis)   |
| **Unique Memory Addresses** | `x86_spill_stats.txt` → `/api/spill-analysis` | Unique addresses involved in spills              |
| **Unique Store PCs**        | `x86_spill_stats.txt` → `/api/spill-analysis` | Unique store program counters                    |
| **Unique Load PCs**         | `x86_spill_stats.txt` → `/api/spill-analysis` | Unique load program counters                     |
| **Spill Duration Stats**    | `x86_spill_stats.txt` → `/api/spill-analysis` | Min, max, avg spill durations                    |
| **Sampled Chart Data**      | `x86_spill_stats.txt` → `/api/spill-analysis` | Reservoir sample for visualizations (10,000 max) |
| **Cache Metrics**           | `stats.txt` → `/api/cache-metrics`   | L1/L2/L3 cache hit/miss rates                    |
| **Instruction Mix**         | `stats.txt` → `/api/instruction-types` | Breakdown of instruction types                   |
| **Efficiency Ratios**       | Calculated from `stats.txt`           | IPC, CPI, and other performance ratios           |

## 🎨 Customization

### Theme Configuration
The application supports both light and dark themes with customizable color schemes:

- **Light Theme**: Clean white background with blue accents
- **Dark Theme**: Dark background with gold accents  
- **Tooltips**: Contextual styling with theme-appropriate colors
- **Glassmorphism Effects**: Modern frosted glass UI elements

### API Endpoints

The backend provides a comprehensive REST API:

| Endpoint                  | Method | Description                                                                                   |
|---------------------------|--------|-----------------------------------------------------------------------------------------------|
| `/api/basic-metrics`      | GET    | Core performance metrics from `stats.txt`                                                      |
| `/api/instruction-types`  | GET    | Instruction type breakdown from `stats.txt`                                                    |
| `/api/memory-system`      | GET    | Memory subsystem statistics from `stats.txt`                                                   |
| `/api/efficiency-metrics` | GET    | Performance efficiency data (IPC, CPI, ratios) from `stats.txt`                                |
| `/api/cache-metrics`      | GET    | Cache performance analysis (L1/L2/L3 hit/miss rates) from `stats.txt`                         |
| `/api/spill-analysis`     | GET    | Register spill analysis: full stats + sampled chart data from `x86_spill_stats.txt`            |
| `/api/spills/search`      | GET    | Streaming search over spill log (supports text, regex, wildcards, pagination)                  |
| `/api/spills/count`       | GET    | Fast count of spills matching a filter (streaming, memory-safe)                                |
| `/api/spills/sample`      | GET    | Reservoir sample of spill events for visualization (10,000 max)                                |
| `/api/spills/range`       | GET    | Range queries over spill log (by offset, line, or time)                                        |
| `/api/status`             | GET    | System status and health check                                                                |

### Configuration Options
- **Port Configuration**: Modify ports in `backend/simple_app.py` and `frontend/package.json`
- **CORS Settings**: Update allowed origins in backend configuration
- **Data Paths**: Configure gem5 output directory paths
- **Update Intervals**: Adjust data refresh rates

## 🔧 Technical Architecture

### Backend Technology Stack
- **Flask**: Lightweight Python web framework
- **Pandas**: High-performance data manipulation
- **Flask-CORS**: Cross-origin resource sharing
- **Python 3.7+**: Modern Python features and performance

### Frontend Technology Stack
- **React 18+**: Modern component-based UI library
- **TypeScript**: Type-safe JavaScript development
- **Material-UI**: Professional component library
- **Recharts**: Interactive data visualization
- **Axios**: HTTP client for API communication

### Data Processing Pipeline
1. **Data Ingestion**: Parse gem5 output files (`stats.txt`, `x86_spill_stats.txt`)
2. **Data Transformation**: Convert raw data into structured metrics
3. **API Layer**: RESTful endpoints for data access
4. **Frontend Rendering**: Interactive visualizations and dashboards


### API Usage for Large Datasets


- `/api/spill-analysis` — Returns full statistics (always accurate) and a sampled dataset for charts (auto-sampling for large files)
- `/api/spills/search` — Streaming, paginated search with support for text, regex, wildcards, offset, and limit
- `/api/spills/count` — Fast, memory-safe counting of spills matching any filter (streaming, no memory overhead)
- `/api/spills/sample` — Returns a random reservoir sample of spill events (up to 10,000) for visualization
- `/api/spills/range` — Range queries by offset, line, or time (streaming, efficient for large files)

### Configuration

You can tune performance and sampling behavior in `backend/utils/simple_reader.py`:

```python
SAMPLE_SIZE = 10000      # Number of events to sample for chart visualizations (used only for large datasets)
max_events = 50000       # If total events ≤ max_events, load all events for analysis and charts (no sampling)
LARGE_THRESHOLD = 100000 # If total events > LARGE_THRESHOLD, switch to sampling mode for charts
```
Recommended values:
- For very large datasets, reduce `SAMPLE_SIZE` for faster chart rendering
- Increase `max_events` if you have more memory and want full analysis for larger files
- Adjust `LARGE_THRESHOLD` to control when sampling is triggered

### Testing

Run the included test script:

```bash
python test_optimization.py
```


### Documentation

All optimization details, usage guides, and test scripts are now included in this README.

## 🐛 Troubleshooting

### Common Issues & Solutions

#### Port Configuration Problems
```bash
# Check if ports are in use
lsof -i :5050  # Backend port
lsof -i :8080  # Frontend port

# Kill processes using ports
lsof -ti:5050 | xargs kill -9
lsof -ti:8080 | xargs kill -9
```

#### Data Loading Issues
- **Missing Data Files**: Ensure `m5out/` directory contains required files
- **Permission Errors**: Check file permissions for data files
- **Path Issues**: Verify relative paths in configuration

#### Development Environment
- **Virtual Environment**: Always activate Python virtual environment
- **Node Modules**: Run `npm install` after cloning repository
- **Dependencies**: Update packages with `pip install -r requirements.txt`

### API Endpoints Still Functional

All streaming endpoints remain fully functional:
- `/api/spills/search` - Paginated search with streaming
- `/api/spills/count` - Fast count with optional limit
- `/api/spill-analysis` - Now uses optimized sampling

### Configuration

You can adjust sampling parameters in `simple_reader.py`:

🛑 Please note that the following parameters are set only for visual graphics and do not affect the accuracy of the core statistics, which are always computed from the full dataset. 🛑

```python
# Line ~1175: Adjust sample size
SAMPLE_SIZE = 10000  # Default: 10k events for analysis

# Line ~50: Adjust max events for small datasets
max_events: int = 50000  # Default: 50k max for full load

# Line ~1120: Adjust large dataset threshold
if total_spills > 100000:  # Default: 100k threshold
```

### Usage Example

```python
# Backend automatically handles optimization
reader = SimpleGem5Reader(m5out_path)
analysis = reader.get_spill_analysis_data()

# Response includes metadata
print(f"Total spills: {analysis['spill_count']:,}")
print(f"Sampled: {analysis['sampled']}")
print(f"Processing time: {analysis['performance']['processing_time_seconds']}s")
```


---

## 🛠️ Automated Project Startup

You can use the provided shell script `run_lyiv.sh` to automate the setup and running of Lyiv:

### Usage

```bash
chmod +x run_lyiv.sh
./run_lyiv.sh
```

**What this script does:**
1. Copies the `m5out` directory from your gem5 results into the Lyiv project.
2. Activates the Python virtual environment.
3. Runs the test script (`test_optimization.py`) to verify analysis.
4. Asks if you want to proceed:
   - If you answer `y` or `Y`, it starts both backend and frontend servers automatically.
   - If you answer `n` or `N`, it terminates the process.
   - For any other input, it asks again until you answer `y` or `n`.

**Example output:**
```
✅ m5out successfully copied to Lyiv/m5out.
✅ Virtual environment activated.
Running test_optimization.py...
Do you want to proceed and run backend & frontend? (y/n):
```

This script streamlines the workflow for quickly setting up and running Lyiv with your latest gem5 simulation data.



## Getting Help
- **Check Logs**: Review backend console output for error messages
- **API Testing**: Use `curl` or Postman to test API endpoints directly
- **Browser Console**: Inspect frontend errors and network requests


## 🎯 Development Guidelines
- Follow existing code style and conventions
- Add appropriate error handling and logging
- Update documentation for new features
- Ensure cross-browser compatibility

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.


## 📋 How to Contribute

We welcome contributions to improve Lyiv! Here are some areas where you can help:

1. **Bug Fixes**: Identify and fix bugs in the codebase
2. **New Features**: Propose and implement new features
3. **Documentation**: Improve documentation for better clarity
4. **Testing**: Add unit tests to ensure code reliability

---

<div align="center">
  <strong>Enjoy analyzing your gem5 simulations with this smooth and modern interface! ☕🎮✨</strong>
  
  <br><br>
  
  <em>Made with ☕ and ❤️ for the computer architecture research lab (CAST)</em>
</div>
