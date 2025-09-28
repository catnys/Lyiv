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
├── 📂 backend/                    # Flask Backend Server
│   ├── 📄 simple_app.py          # Main Flask application
│   ├── 📄 requirements.txt       # Python dependencies
│   ├── 📂 services/              # API service modules
│   │   └── 📄 simple_api.py      # REST API endpoints
│   ├── 📂 utils/                 # Data processing utilities
│   │   └── 📄 simple_reader.py   # Gem5 data parser
│   └── 📂 models/                # Data models and schemas
├── 📂 frontend/                   # React Frontend Application
│   ├── 📂 src/
│   │   ├── 📄 App.tsx            # Main React component
│   │   ├── 📄 App.css            # Application styles
│   │   └── 📂 services/          # API client services
│   │       └── 📄 api.ts         # HTTP client configuration
│   ├── 📄 package.json           # Node.js dependencies
│   └── 📂 public/                # Static assets
├── 📂 m5out/                      # Gem5 Simulation Output
│   ├── 📄 stats.txt              # Simulation statistics
│   ├── 📄 x86_spill_stats.txt    # Register spill data
│   └── 📄 config.json            # Simulation configuration
├── 📂 images/                     # Project assets and images
│   └── 📄 4419422.png            # Coffee latte pixel art
├── 📄 README.md                   # Project documentation
└── 📄 LICENSE                     # MIT License
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

| Metric | Source | Description |
|--------|--------|-------------|
| **Total Instructions** | `stats.txt` → `simInsts` | Total executed instructions |
| **Total Ticks** | `stats.txt` → `simTicks` | Simulation time in ticks |
| **Total Loads** | `stats.txt` → `system.cpu.commitStats0.numLoadInsts` | Memory load operations |
| **Total Stores** | `stats.txt` → `system.cpu.commitStats0.numStoreInsts` | Memory store operations |
| **Total Spills** | `x86_spill_stats.txt` | Register spill events |
| **Percentages** | Calculated ratios | Performance efficiency metrics |

## 🎨 Customization

### Theme Configuration
The application supports both light and dark themes with customizable color schemes:

- **Light Theme**: Clean white background with blue accents
- **Dark Theme**: Dark background with gold accents  
- **Tooltips**: Contextual styling with theme-appropriate colors
- **Glassmorphism Effects**: Modern frosted glass UI elements

### API Endpoints
The backend provides a comprehensive REST API:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/basic-metrics` | GET | Core performance metrics |
| `/api/instruction-types` | GET | Instruction type breakdown |
| `/api/memory-system` | GET | Memory subsystem statistics |
| `/api/efficiency-metrics` | GET | Performance efficiency data |
| `/api/cache-metrics` | GET | Cache performance analysis |
| `/api/spill-analysis` | GET | Register spill analysis |
| `/api/status` | GET | System status and health |

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

### Performance Optimizations
- **Efficient Data Loading**: Pandas for fast data processing
- **Caching**: In-memory data caching for improved response times
- **Lazy Loading**: On-demand data fetching for large datasets
- **Responsive Design**: CSS Grid and Flexbox for optimal layouts

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

### Performance Optimization Tips
- **Browser Developer Tools**: Use for debugging and performance analysis
- **Network Tab**: Monitor API requests and response times
- **Console Logs**: Check for JavaScript errors and warnings
- **Data Refresh**: Reload page if data appears stale

### Getting Help
- **Check Logs**: Review backend console output for error messages
- **API Testing**: Use `curl` or Postman to test API endpoints directly
- **Browser Console**: Inspect frontend errors and network requests

## 🤝 Contributing

We welcome contributions to improve Lyiv! Here are some areas where you can help:

### 🚀 Feature Development
- **New Visualization Types**: Add more chart types and data representations
- **Additional API Endpoints**: Extend backend functionality
- **UI/UX Improvements**: Enhance user interface and experience
- **Performance Optimizations**: Improve data processing and rendering speed
- **Heatmap Enhancements**: Add more thermal visualization features
- **Advanced Analytics**: Implement machine learning-based performance predictions

### 🐛 Bug Fixes & Improvements
- **Error Handling**: Better error messages and recovery mechanisms
- **Code Quality**: Refactoring and code organization improvements
- **Documentation**: Improve code comments and documentation
- **Testing**: Add unit tests and integration tests

### 📋 How to Contribute
1. **Fork the repository** and create a feature branch
2. **Make your changes** with clear commit messages
3. **Test thoroughly** to ensure functionality
4. **Submit a pull request** with a detailed description

### 🎯 Development Guidelines
- Follow existing code style and conventions
- Add appropriate error handling and logging
- Update documentation for new features
- Ensure cross-browser compatibility

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Gem5 Simulator**: For providing the simulation framework
- **React Community**: For the excellent frontend ecosystem
- **Flask Team**: For the lightweight Python web framework
- **Contributors**: Thanks to all who have contributed to this project

## 📝 Recent Updates

### Version 2.1.0 (Latest)
- ✅ **Removed Memory Access Heatmap** - Simplified interface by removing redundant memory visualization
- ✅ **Enhanced Register Usage Heatmap** - Improved thermal visualization for register access patterns
- ✅ **Fixed JSX Syntax Errors** - Resolved compilation issues and improved code structure
- ✅ **Updated Documentation** - Enhanced README with latest features and improvements
- ✅ **Code Optimization** - Streamlined component structure and improved performance

### Previous Versions
- **v2.0.0**: Added thermal heatmap visualizations and dynamic instruction analysis
- **v1.5.0**: Implemented register spill analysis and memory system statistics
- **v1.0.0**: Initial release with basic gem5 simulation analysis features

## 🚀 Next Steps (Development Notes) for me :)

### 📊 SQL Database Integration for Instruction-Level Analysis

**Goal**: Create a comprehensive SQL database to store all gem5 instruction-level data for dynamic analysis.

#### 🗄️ Proposed Database Schema

```sql
-- Main instructions table
CREATE TABLE instructions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    instruction_id BIGINT NOT NULL,
    is_spill BOOLEAN DEFAULT FALSE,
    instruction_type VARCHAR(50),
    instruction_name VARCHAR(100),
    store_pc BIGINT,
    load_pc BIGINT,
    execution_cycle BIGINT,
    commit_cycle BIGINT,
    fetch_cycle BIGINT,
    decode_cycle BIGINT,
    issue_cycle BIGINT,
    writeback_cycle BIGINT,
    cpu_id INT DEFAULT 0,
    thread_id INT DEFAULT 0,
    sequence_number BIGINT,
    opcode VARCHAR(20),
    num_dest_regs INT,
    num_src_regs INT,
    memory_address BIGINT,
    memory_size INT,
    is_memory_op BOOLEAN DEFAULT FALSE,
    is_branch BOOLEAN DEFAULT FALSE,
    is_control BOOLEAN DEFAULT FALSE,
    branch_target BIGINT,
    branch_taken BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Register usage tracking
CREATE TABLE register_usage (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    instruction_id BIGINT,
    register_name VARCHAR(20),
    register_type ENUM('integer', 'float', 'vector', 'control'),
    operation_type ENUM('read', 'write', 'spill', 'restore'),
    register_value BIGINT,
    spill_address BIGINT,
    FOREIGN KEY (instruction_id) REFERENCES instructions(id)
);

-- Memory access tracking
CREATE TABLE memory_access (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    instruction_id BIGINT,
    access_type ENUM('load', 'store', 'prefetch'),
    memory_address BIGINT,
    memory_size INT,
    cache_level ENUM('L1', 'L2', 'L3', 'main_memory'),
    hit_miss ENUM('hit', 'miss'),
    latency_cycles INT,
    FOREIGN KEY (instruction_id) REFERENCES instructions(id)
);

-- Performance metrics per instruction
CREATE TABLE instruction_metrics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    instruction_id BIGINT,
    cpi DECIMAL(10,4),
    ipc DECIMAL(10,4),
    stall_cycles INT,
    dependency_cycles INT,
    cache_miss_penalty INT,
    branch_misprediction_penalty INT,
    FOREIGN KEY (instruction_id) REFERENCES instructions(id)
);

-- Indexes for performance
CREATE INDEX idx_instruction_id ON instructions(instruction_id);
CREATE INDEX idx_is_spill ON instructions(is_spill);
CREATE INDEX idx_instruction_type ON instructions(instruction_type);
CREATE INDEX idx_execution_cycle ON instructions(execution_cycle);
CREATE INDEX idx_memory_address ON instructions(memory_address);
CREATE INDEX idx_register_usage_instruction ON register_usage(instruction_id);
CREATE INDEX idx_memory_access_instruction ON memory_access(instruction_id);
```

#### 🔧 Implementation Plan

1. **Data Parser Enhancement**
   - Extend `simple_reader.py` to parse instruction-level data
   - Add SQLite/PostgreSQL integration
   - Create data insertion pipeline

2. **Backend API Extensions**
   - Add endpoints for instruction-level queries
   - Implement complex analytics queries
   - Add real-time data streaming

3. **Frontend Analytics Dashboard**
   - Instruction timeline visualization
   - Register usage heatmaps
   - Memory access pattern analysis
   - Performance bottleneck identification

4. **Advanced Analytics Features**
   - Machine learning-based performance prediction
   - Anomaly detection in instruction patterns
   - Comparative analysis between different runs
   - Interactive query builder

#### 📈 Expected Benefits

- **Granular Analysis**: Instruction-by-instruction performance tracking
- **Pattern Recognition**: Identify recurring performance issues
- **Optimization Insights**: Data-driven optimization recommendations
- **Scalability**: Handle large simulation datasets efficiently
- **Flexibility**: Custom queries for specific research questions

#### 🎯 Key Metrics to Track

- Instruction execution patterns
- Register spill frequency and patterns
- Memory access locality
- Branch prediction accuracy
- Cache performance per instruction
- Pipeline stall analysis
- Dependency chain visualization

---

<div align="center">
  <strong>Enjoy analyzing your gem5 simulations with this smooth and modern interface! ☕🎮✨</strong>
  
  <br><br>
  
  <em>Made with ☕ and ❤️ for the computer architecture research lab (CAST)</em>
</div>
