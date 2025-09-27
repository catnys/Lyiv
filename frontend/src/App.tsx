import React, { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import './App.css';

interface BasicMetrics {
  total_instructions: number;
  total_ticks: number;
  total_loads: number;
  total_stores: number;
  total_cycles: number;
  cpi: number;
  ipc: number;
  int_reg_reads: number;
  int_reg_writes: number;
  fp_reg_reads: number;
  fp_reg_writes: number;
  total_memory_refs: number;
  load_percentage: number;
  store_percentage: number;
  memory_ref_percentage: number;
  sim_seconds: number;
  host_seconds: number;
  host_tick_rate: number;
  host_inst_rate: number;
  simulation_speedup: number;
  sim_insts: number;
  sim_ops: number;
  committed_ops: number;
  committed_insts_not_nop: number;
  committed_ops_not_nop: number;
  fp_insts: number;
  int_insts: number;
  vec_insts: number;
  binary_info: {
    executable: string;
    architecture: string;
    isa: string;
    cpu_type: string;
    cpu_name: string;
  };
}


interface InstructionTypeData {
  count: number;
    percentage: number;
}

interface InstructionTypes {
  instruction_types: { [key: string]: InstructionTypeData };
  total_instructions: number;
  architecture: string;
}

interface MemorySystemStats {
  [key: string]: number;
}

interface EfficiencyMetrics {
  cpu_utilization: number;
  instructions_per_second: number;
  mips: number;
  memory_intensity: number;
  read_write_ratio: number;
  dtlb_hit_rate: number;
  dtlb_miss_rate: number;
  register_intensity: number;
  fetch_efficiency: number;
  avg_read_queue_length: number;
  avg_write_queue_length: number;
  memory_bandwidth_mbps: number;
}

interface CacheMetrics {
  dtlb_hit_rate: number;
  dtlb_miss_rate: number;
  dtlb_total_accesses: number;
  dtlb_total_misses: number;
  itlb_hit_rate: number;
  itlb_miss_rate: number;
  itlb_total_accesses: number;
  itlb_total_misses: number;
  memory_read_row_hits: number;
  memory_write_row_hits: number;
  memory_read_row_hit_rate: number;
  memory_write_row_hit_rate: number;
  memory_page_hit_rate: number;
  memory_read_row_miss_rate: number;
  memory_write_row_miss_rate: number;
  memory_page_miss_rate: number;
  snoop_hit_single: number;
  snoop_hit_multi: number;
  snoop_miss: number;
  snoop_hit_rate: number;
  snoop_miss_rate: number;
  cache_performance: {
    overall_score: number;
    issues: string[];
    recommendations: string[];
  };
}

interface DataSource {
  file: string;
  line?: string;
  formula?: string;
  description: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

function App() {
  const [metrics, setMetrics] = useState<BasicMetrics | null>(null);
  const [instructionTypes, setInstructionTypes] = useState<InstructionTypes | null>(null);
  const [memorySystemStats, setMemorySystemStats] = useState<MemorySystemStats | null>(null);
  const [efficiencyMetrics, setEfficiencyMetrics] = useState<EfficiencyMetrics | null>(null);
  const [cacheMetrics, setCacheMetrics] = useState<CacheMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch data from backend
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        
        // Fetch basic metrics
        const metricsResponse = await fetch('http://localhost:5002/api/basic-metrics');
        if (!metricsResponse.ok) {
          throw new Error(`HTTP error! status: ${metricsResponse.status}`);
        }
        const metricsResult: ApiResponse<BasicMetrics> = await metricsResponse.json();
        
        if (metricsResult.success) {
          setMetrics(metricsResult.data);
        } else {
          setError('Failed to fetch metrics');
        }
        
        
        // Fetch instruction types
        const instructionTypesResponse = await fetch('http://localhost:5002/api/instruction-types');
        if (!instructionTypesResponse.ok) {
          throw new Error(`HTTP error! status: ${instructionTypesResponse.status}`);
        }
        const instructionTypesResult: ApiResponse<InstructionTypes> = await instructionTypesResponse.json();
        
        if (instructionTypesResult.success) {
          setInstructionTypes(instructionTypesResult.data);
        } else {
          setError('Failed to fetch instruction types');
        }
        
        // Fetch memory system stats
        const memorySystemResponse = await fetch('http://localhost:5002/api/memory-system');
        if (!memorySystemResponse.ok) {
          throw new Error(`HTTP error! status: ${memorySystemResponse.status}`);
        }
        const memorySystemResult: ApiResponse<MemorySystemStats> = await memorySystemResponse.json();
        
        if (memorySystemResult.success) {
          setMemorySystemStats(memorySystemResult.data);
        } else {
          setError('Failed to fetch memory system stats');
        }
        
        // Fetch efficiency metrics
        const efficiencyResponse = await fetch('http://localhost:5002/api/efficiency-metrics');
        if (!efficiencyResponse.ok) {
          throw new Error(`HTTP error! status: ${efficiencyResponse.status}`);
        }
        const efficiencyResult: ApiResponse<EfficiencyMetrics> = await efficiencyResponse.json();
        
        if (efficiencyResult.success) {
          setEfficiencyMetrics(efficiencyResult.data);
        } else {
          setError('Failed to fetch efficiency metrics');
        }
        
        // Fetch cache metrics
        const cacheResponse = await fetch('http://localhost:5002/api/cache-metrics');
        if (!cacheResponse.ok) {
          throw new Error(`HTTP error! status: ${cacheResponse.status}`);
        }
        const cacheResult: ApiResponse<CacheMetrics> = await cacheResponse.json();
        
        if (cacheResult.success) {
          setCacheMetrics(cacheResult.data);
        } else {
          setError('Failed to fetch cache metrics');
        }
        
      } catch (err) {
        setError('Failed to fetch data from backend');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  // Removed scroll handler - using normal scroll now

  const formatNumber = (num: number): string => {
    if (num >= 1e9) {
      return (num / 1e9).toFixed(1) + 'B';
    } else if (num >= 1e6) {
      return (num / 1e6).toFixed(1) + 'M';
    } else if (num >= 1e3) {
      return (num / 1e3).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Confetti component
  const ConfettiEffect = () => {
    const confettiPieces = Array.from({ length: 100 }, (_, i) => (
      <div
        key={i}
        className="confetti"
        style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 4}s`,
          animationDuration: `${3 + Math.random() * 2}s`,
          backgroundColor: ['#3b82f6', '#6366f1', '#60a5fa', '#93c5fd', '#fbbf24', '#f59e0b'][Math.floor(Math.random() * 6)]
        }}
      />
    ));

    return <div className="confetti-container">{confettiPieces}</div>;
  };

  const toggleTheme = () => {
    setIsDarkTheme(prev => !prev);
  };

  if (loading) {
    return (
      <div className={`loading ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
        <button className="theme-toggle" onClick={toggleTheme}>
          {isDarkTheme ? '☀️' : '🌙'}
        </button>
        <h2>Loading Gem5 Data...</h2>
        <p>Please wait while we read the m5out files...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`error ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
        <button className="theme-toggle" onClick={toggleTheme}>
          {isDarkTheme ? '☀️' : '🌙'}
        </button>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className={`error ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
        <button className="theme-toggle" onClick={toggleTheme}>
          {isDarkTheme ? '☀️' : '🌙'}
        </button>
        <h2>No Data</h2>
        <p>No metrics data available</p>
      </div>
    );
  }

  return (
    <div className={`App ${isDarkTheme ? 'dark-theme' : 'light-theme'}`} ref={containerRef}>
      <button className="theme-toggle" onClick={toggleTheme}>
        {isDarkTheme ? '☀️' : '🌙'}
      </button>
      
      <div className="main-content">
        {/* First Section - Basic Simulation Data */}
        <div className="content-section">
      <header className="App-header">
            <h1>📊 Basic Simulation Data</h1>
            <p>Core simulation metrics from stats.txt</p>
      </header>
      
      <main className="container">
        {/* Binary Information */}
        {metrics.binary_info && (
          <div className="binary-info-section">
            <h2>🔧 Binary & Architecture Information</h2>
            <div className="binary-info-grid">
              <div className="binary-info-card">
                <div className="binary-info-header">
                  <span className="binary-info-icon">📁</span>
                  <h3>Executable</h3>
                </div>
                <div className="binary-info-value">
                  {metrics.binary_info.executable}
                </div>
              </div>
              
              <div className="binary-info-card">
                <div className="binary-info-header">
                  <span className="binary-info-icon">🏗️</span>
                  <h3>Architecture</h3>
                </div>
                <div className="binary-info-value">
                  {metrics.binary_info.architecture}
                </div>
              </div>
              
              <div className="binary-info-card">
                <div className="binary-info-header">
                  <span className="binary-info-icon">⚙️</span>
                  <h3>ISA</h3>
                </div>
                <div className="binary-info-value">
                  {metrics.binary_info.isa}
                </div>
              </div>
              
              <div className="binary-info-card">
                <div className="binary-info-header">
                  <span className="binary-info-icon">🖥️</span>
                  <h3>CPU Type</h3>
                </div>
                <div className="binary-info-value">
                  {metrics.binary_info.cpu_type}
                </div>
              </div>
              
              <div className="binary-info-card">
                <div className="binary-info-header">
                  <span className="binary-info-icon">🏷️</span>
                  <h3>CPU Name</h3>
                </div>
                <div className="binary-info-value">
                  {metrics.binary_info.cpu_name}
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="metrics-grid">
          <div className="metric-card instruction-card">
                <div className="metric-header">
                  <span className="metric-emoji">📊</span>
            <h3>Total Instructions</h3>
                </div>
            <div className="metric-value">
                  {formatNumber(metrics.total_instructions)}
                </div>
                <div className="metric-full">
              {metrics.total_instructions.toLocaleString()}
            </div>
          </div>
          
          <div className="metric-card tick-card">
                <div className="metric-header">
                  <span className="metric-emoji">⏱️</span>
            <h3>Total Ticks</h3>
                </div>
            <div className="metric-value">
                  {formatNumber(metrics.total_ticks)}
                </div>
                <div className="metric-full">
              {metrics.total_ticks.toLocaleString()}
            </div>
          </div>
          
              <div className="metric-card cycle-card">
                <div className="metric-header">
                  <span className="metric-emoji">🔄</span>
                  <h3>Total Cycles</h3>
                </div>
                <div className="metric-value">
                  {formatNumber(metrics.total_cycles)}
                </div>
                <div className="metric-full">
                  {metrics.total_cycles.toLocaleString()}
                </div>
              </div>
              
              <div className="metric-card cpi-card">
                <div className="metric-header">
                  <span className="metric-emoji">📈</span>
                  <h3>CPI</h3>
                </div>
                <div className="metric-value">
                  {metrics.cpi.toFixed(2)}
                </div>
                <div className="metric-full">
                  Cycles per Instruction
                </div>
              </div>
              
              <div className="metric-card ipc-card">
                <div className="metric-header">
                  <span className="metric-emoji">⚡</span>
                  <h3>IPC</h3>
                </div>
                <div className="metric-value">
                  {metrics.ipc.toFixed(6)}
                </div>
                <div className="metric-full">
                  Instructions per Cycle
                </div>
              </div>
              
              <div className="metric-card sim-time-card">
                <div className="metric-header">
                  <span className="metric-emoji">⏰</span>
                  <h3>Simulation Time</h3>
                </div>
                <div className="metric-value">
                  {metrics.sim_seconds.toFixed(6)}s
                </div>
                <div className="metric-full">
                  Simulated Seconds
                </div>
              </div>
              
              <div className="metric-card host-time-card">
                <div className="metric-header">
                  <span className="metric-emoji">🕐</span>
                  <h3>Host Time</h3>
                </div>
                <div className="metric-value">
                  {metrics.host_seconds.toFixed(6)}s
                </div>
                <div className="metric-full">
                  Real Time Elapsed
                </div>
              </div>
              
              <div className="metric-card speedup-card">
                <div className="metric-header">
                  <span className="metric-emoji">🚀</span>
                  <h3>Simulation Speedup</h3>
                </div>
                <div className="metric-value">
                  {metrics.simulation_speedup}x
                </div>
                <div className="metric-full">
                  Host Time / Sim Time
                </div>
              </div>
              
              <div className="metric-card tick-rate-card">
                <div className="metric-header">
                  <span className="metric-emoji">🎯</span>
                  <h3>Host Tick Rate</h3>
                </div>
                <div className="metric-value">
                  {formatNumber(metrics.host_tick_rate)}
                </div>
                <div className="metric-full">
                  Ticks per Second
                </div>
              </div>
              
              <div className="metric-card inst-rate-card">
                <div className="metric-header">
                  <span className="metric-emoji">💨</span>
                  <h3>Host Inst Rate</h3>
                </div>
                <div className="metric-value">
                  {formatNumber(metrics.host_inst_rate)}
                </div>
                <div className="metric-full">
                  Instructions per Second
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Spacing between sections */}
        <div className="section-spacer">         </div>

         {/* Second Section - Memory Access Analysis */}
         <div className="content-section">
           <header className="App-header">
             <h1>💾 Memory Access Analysis</h1>
             <p>Memory access patterns and statistics</p>
           </header>
           
           <main className="container">
             <div className="metrics-grid">
          <div className="metric-card load-card">
                <div className="metric-header">
            <h3>Total Loads</h3>
                </div>
            <div className="metric-value">
                  {formatNumber(metrics.total_loads)}
                </div>
                <div className="metric-full">
              {metrics.total_loads.toLocaleString()}
            </div>
          </div>
          
          <div className="metric-card store-card">
                <div className="metric-header">
            <h3>Total Stores</h3>
                </div>
            <div className="metric-value">
                  {formatNumber(metrics.total_stores)}
                </div>
                <div className="metric-full">
              {metrics.total_stores.toLocaleString()}
            </div>
          </div>
          
          <div className="metric-card memory-ref-card">
                <div className="metric-header">
                   <h3>Memory References</h3>
                </div>
            <div className="metric-value">
                   {formatNumber(metrics.total_memory_refs)}
                </div>
                <div className="metric-full">
                   {metrics.total_memory_refs.toLocaleString()}
            </div>
          </div>
          
          <div className="metric-card load-percent-card">
                <div className="metric-header">
                   <h3>Load Percentage</h3>
                </div>
            <div className="metric-value">
                   {metrics.load_percentage.toFixed(2)}%
                </div>
                <div className="metric-full">
                   of total instructions
            </div>
          </div>
          
          <div className="metric-card store-percent-card">
                <div className="metric-header">
                   <h3>Store Percentage</h3>
                </div>
            <div className="metric-value">
                   {metrics.store_percentage.toFixed(2)}%
                </div>
                <div className="metric-full">
                   of total instructions
            </div>
          </div>
          
          <div className="metric-card memory-percent-card">
                <div className="metric-header">
                   <h3>Memory Ref Percentage</h3>
                </div>
            <div className="metric-value">
                   {metrics.memory_ref_percentage.toFixed(2)}%
                </div>
                <div className="metric-full">
                   of total instructions
            </div>
              </div>
            </div>

             <div className="chart-container">
               <h2>📊 Memory Access Distribution</h2>
               <div className="chart-wrapper">
                 <ResponsiveContainer width="100%" height={400}>
                   <PieChart>
                     <Pie
                       data={[
                         {
                           name: 'Load Instructions',
                           value: metrics.total_loads,
                           percentage: metrics.load_percentage,
                           color: '#3b82f6'
                         },
                         {
                           name: 'Store Instructions', 
                           value: metrics.total_stores,
                           percentage: metrics.store_percentage,
                           color: '#ef4444'
                         },
                         {
                           name: 'Non-Memory Instructions',
                           value: metrics.total_instructions - metrics.total_memory_refs,
                           percentage: 100 - metrics.memory_ref_percentage,
                           color: '#10b981'
                         }
                       ]}
                       cx="50%"
                       cy="50%"
                       labelLine={false}
                       label={({ name, percentage }: any) => `${name}: ${percentage.toFixed(1)}%`}
                       outerRadius={120}
                       fill="#8884d8"
                       dataKey="value"
                     >
                       {[
                         { name: 'Load Instructions', color: '#3b82f6' },
                         { name: 'Store Instructions', color: '#ef4444' },
                         { name: 'Non-Memory Instructions', color: '#10b981' }
                       ].map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                     </Pie>
                     <Tooltip 
                       formatter={(value: number, name: string, props: any) => [
                         `${formatNumber(value)} (${props.payload.percentage.toFixed(2)}%)`,
                         name
                       ]}
                     />
                     <Legend />
                   </PieChart>
                 </ResponsiveContainer>
               </div>
        </div>

             <div className="summary">
               <h3>Memory Access Summary</h3>
               <div className="memory-stats-grid">
                 <div className="memory-stat-card">
                   <div className="memory-stat-header">
                     <div className="memory-stat-color" style={{backgroundColor: '#3b82f6'}}></div>
                     <h4>Load Instructions</h4>
                   </div>
                   <div className="memory-stat-value">
                     {formatNumber(metrics.total_loads)}
                   </div>
                   <div className="memory-stat-percentage">
                     {metrics.load_percentage.toFixed(2)}%
                   </div>
                 </div>
                 
                 <div className="memory-stat-card">
                   <div className="memory-stat-header">
                     <div className="memory-stat-color" style={{backgroundColor: '#ef4444'}}></div>
                     <h4>Store Instructions</h4>
                   </div>
                   <div className="memory-stat-value">
                     {formatNumber(metrics.total_stores)}
                   </div>
                   <div className="memory-stat-percentage">
                     {metrics.store_percentage.toFixed(2)}%
                   </div>
                 </div>
                 
                 <div className="memory-stat-card">
                   <div className="memory-stat-header">
                     <div className="memory-stat-color" style={{backgroundColor: '#10b981'}}></div>
                     <h4>Non-Memory Instructions</h4>
                   </div>
                   <div className="memory-stat-value">
                     {formatNumber(metrics.total_instructions - metrics.total_memory_refs)}
                   </div>
                   <div className="memory-stat-percentage">
                     {(100 - metrics.memory_ref_percentage).toFixed(2)}%
                   </div>
                 </div>
               </div>
               
               <div className="memory-total-info">
                 <p>
                   <strong>Total Instructions:</strong> {metrics.total_instructions.toLocaleString()}<br/>
                   <strong>Memory References:</strong> {metrics.total_memory_refs.toLocaleString()} ({metrics.memory_ref_percentage.toFixed(2)}%)
                 </p>
               </div>
             </div>
             
             {/* Memory System Efficiency Metrics */}
             {efficiencyMetrics && (
               <div className="chart-container">
                 <h2>🧠 Memory System Efficiency</h2>
                 <div className="memory-efficiency-grid">
                   <div className="efficiency-metric-card">
                     <div className="efficiency-metric-header">
                       <h4>Memory Intensity</h4>
                       <div className="efficiency-indicator" style={{
                         backgroundColor: efficiencyMetrics.memory_intensity > 30 ? '#ef4444' : efficiencyMetrics.memory_intensity > 20 ? '#f59e0b' : '#10b981'
                       }}></div>
                     </div>
                     <div className="efficiency-metric-value">
                       {efficiencyMetrics.memory_intensity}%
                     </div>
                     <div className="efficiency-metric-desc">
                       Memory operations per instruction
                     </div>
                   </div>
                   
                   <div className="efficiency-metric-card">
                     <div className="efficiency-metric-header">
                       <h4>Read/Write Ratio</h4>
                       <div className="efficiency-indicator" style={{
                         backgroundColor: efficiencyMetrics.read_write_ratio > 10 ? '#10b981' : efficiencyMetrics.read_write_ratio > 5 ? '#f59e0b' : '#ef4444'
                       }}></div>
                     </div>
                     <div className="efficiency-metric-value">
                       {efficiencyMetrics.read_write_ratio}:1
                     </div>
                     <div className="efficiency-metric-desc">
                       Read operations per write
                     </div>
                   </div>
                   
                   <div className="efficiency-metric-card">
                     <div className="efficiency-metric-header">
                       <h4>Memory Bandwidth</h4>
                       <div className="efficiency-indicator" style={{
                         backgroundColor: efficiencyMetrics.memory_bandwidth_mbps > 50 ? '#10b981' : efficiencyMetrics.memory_bandwidth_mbps > 20 ? '#f59e0b' : '#ef4444'
                       }}></div>
                     </div>
                     <div className="efficiency-metric-value">
                       {efficiencyMetrics.memory_bandwidth_mbps} MB/s
                     </div>
                     <div className="efficiency-metric-desc">
                       Memory throughput
                     </div>
                   </div>
                   
                   <div className="efficiency-metric-card">
                     <div className="efficiency-metric-header">
                       <h4>Write Queue Length</h4>
                       <div className="efficiency-indicator" style={{
                         backgroundColor: efficiencyMetrics.avg_write_queue_length > 20 ? '#ef4444' : efficiencyMetrics.avg_write_queue_length > 10 ? '#f59e0b' : '#10b981'
                       }}></div>
                     </div>
                     <div className="efficiency-metric-value">
                       {efficiencyMetrics.avg_write_queue_length}
                     </div>
                     <div className="efficiency-metric-desc">
                       Average write queue size
                     </div>
                   </div>
                 </div>
                 
                 {/* Memory System Heatmap */}
                 <div className="memory-heatmap-container">
                   <h3>🔥 Memory System Heatmap</h3>
                   <div className="memory-heatmap">
                     <div className="heatmap-row">
                       <div className="heatmap-cell heatmap-header">Metric</div>
                       <div className="heatmap-cell heatmap-header">Value</div>
                       <div className="heatmap-cell heatmap-header">Status</div>
                       <div className="heatmap-cell heatmap-header">Heat</div>
                     </div>
                     
                     <div className="heatmap-row">
                       <div className="heatmap-cell">Memory Intensity</div>
                       <div className="heatmap-cell">{efficiencyMetrics.memory_intensity}%</div>
                       <div className="heatmap-cell">
                         {efficiencyMetrics.memory_intensity > 30 ? 'High' : efficiencyMetrics.memory_intensity > 20 ? 'Medium' : 'Low'}
                       </div>
                       <div className="heatmap-cell">
                         <div className="heatmap-bar" style={{
                           width: `${Math.min(efficiencyMetrics.memory_intensity * 2, 100)}%`,
                           backgroundColor: efficiencyMetrics.memory_intensity > 30 ? '#ef4444' : efficiencyMetrics.memory_intensity > 20 ? '#f59e0b' : '#10b981'
                         }}></div>
                       </div>
                     </div>
                     
                     <div className="heatmap-row">
                       <div className="heatmap-cell">Read/Write Ratio</div>
                       <div className="heatmap-cell">{efficiencyMetrics.read_write_ratio}:1</div>
                       <div className="heatmap-cell">
                         {efficiencyMetrics.read_write_ratio > 10 ? 'Read-Heavy' : efficiencyMetrics.read_write_ratio > 5 ? 'Balanced' : 'Write-Heavy'}
                       </div>
                       <div className="heatmap-cell">
                         <div className="heatmap-bar" style={{
                           width: `${Math.min(efficiencyMetrics.read_write_ratio * 5, 100)}%`,
                           backgroundColor: efficiencyMetrics.read_write_ratio > 10 ? '#10b981' : efficiencyMetrics.read_write_ratio > 5 ? '#f59e0b' : '#ef4444'
                         }}></div>
                       </div>
                     </div>
                     
                     <div className="heatmap-row">
                       <div className="heatmap-cell">Memory Bandwidth</div>
                       <div className="heatmap-cell">{efficiencyMetrics.memory_bandwidth_mbps} MB/s</div>
                       <div className="heatmap-cell">
                         {efficiencyMetrics.memory_bandwidth_mbps > 50 ? 'High' : efficiencyMetrics.memory_bandwidth_mbps > 20 ? 'Medium' : 'Low'}
                       </div>
                       <div className="heatmap-cell">
                         <div className="heatmap-bar" style={{
                           width: `${Math.min(efficiencyMetrics.memory_bandwidth_mbps * 2, 100)}%`,
                           backgroundColor: efficiencyMetrics.memory_bandwidth_mbps > 50 ? '#10b981' : efficiencyMetrics.memory_bandwidth_mbps > 20 ? '#f59e0b' : '#ef4444'
                         }}></div>
                       </div>
                     </div>
                     
                     <div className="heatmap-row">
                       <div className="heatmap-cell">Write Queue</div>
                       <div className="heatmap-cell">{efficiencyMetrics.avg_write_queue_length}</div>
                       <div className="heatmap-cell">
                         {efficiencyMetrics.avg_write_queue_length > 20 ? 'Congested' : efficiencyMetrics.avg_write_queue_length > 10 ? 'Moderate' : 'Clear'}
                       </div>
                       <div className="heatmap-cell">
                         <div className="heatmap-bar" style={{
                           width: `${Math.min(efficiencyMetrics.avg_write_queue_length * 3, 100)}%`,
                           backgroundColor: efficiencyMetrics.avg_write_queue_length > 20 ? '#ef4444' : efficiencyMetrics.avg_write_queue_length > 10 ? '#f59e0b' : '#10b981'
                         }}></div>
                       </div>
                     </div>
                     
                     <div className="heatmap-row">
                       <div className="heatmap-cell">Read Queue</div>
                       <div className="heatmap-cell">{efficiencyMetrics.avg_read_queue_length}</div>
                       <div className="heatmap-cell">
                         {efficiencyMetrics.avg_read_queue_length > 5 ? 'Congested' : efficiencyMetrics.avg_read_queue_length > 2 ? 'Moderate' : 'Clear'}
                       </div>
                       <div className="heatmap-cell">
                         <div className="heatmap-bar" style={{
                           width: `${Math.min(efficiencyMetrics.avg_read_queue_length * 20, 100)}%`,
                           backgroundColor: efficiencyMetrics.avg_read_queue_length > 5 ? '#ef4444' : efficiencyMetrics.avg_read_queue_length > 2 ? '#f59e0b' : '#10b981'
                         }}></div>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
             )}
             
             {/* Cache Hit/Miss Analysis */}
             {cacheMetrics && (
               <div className="chart-container">
                 <h2>🎯 Cache Hit/Miss Analysis</h2>
                 <div className="cache-overview-grid">
                   <div className="cache-overview-card">
                     <div className="cache-overview-header">
                       <span className="cache-overview-icon">🎯</span>
                       <h3>Overall Cache Score</h3>
                     </div>
                     <div className="cache-overview-value">
                       {cacheMetrics.cache_performance.overall_score}/100
                     </div>
                     <div className="cache-overview-bar">
                       <div 
                         className="cache-overview-fill"
                         style={{width: `${cacheMetrics.cache_performance.overall_score}%`}}
                       ></div>
                     </div>
                   </div>
                   
                   <div className="cache-overview-card">
                     <div className="cache-overview-header">
                       <span className="cache-overview-icon">📋</span>
                       <h3>TLB Hit Rate</h3>
                     </div>
                     <div className="cache-overview-value">
                       DTLB: {cacheMetrics.dtlb_hit_rate}%
                     </div>
                     <div className="cache-overview-value">
                       ITLB: {cacheMetrics.itlb_hit_rate}%
                     </div>
                   </div>
                   
                   <div className="cache-overview-card">
                     <div className="cache-overview-header">
                       <span className="cache-overview-icon">💾</span>
                       <h3>Memory Row Buffer</h3>
                     </div>
                     <div className="cache-overview-value">
                       Page Hit: {cacheMetrics.memory_page_hit_rate}%
                     </div>
                     <div className="cache-overview-value">
                       Read Hit: {cacheMetrics.memory_read_row_hit_rate}%
                     </div>
                   </div>
                   
                   <div className="cache-overview-card">
                     <div className="cache-overview-header">
                       <span className="cache-overview-icon">🔍</span>
                       <h3>Snoop Filter</h3>
                     </div>
                     <div className="cache-overview-value">
                       Hit Rate: {cacheMetrics.snoop_hit_rate}%
                     </div>
                     <div className="cache-overview-value">
                       Total: {formatNumber(cacheMetrics.snoop_hit_single + cacheMetrics.snoop_hit_multi + cacheMetrics.snoop_miss)}
                     </div>
                   </div>
                 </div>
                 
                 {/* Cache Performance Issues */}
                 {cacheMetrics.cache_performance.issues.length > 0 && (
                   <div className="cache-performance-alert">
                     <div className="cache-alert-header">
                       <span className="cache-alert-icon">⚠️</span>
                       <h4>Cache Performance Issues</h4>
                     </div>
                     <div className="cache-alert-list">
                       {cacheMetrics.cache_performance.issues.map((issue, index) => (
                         <div key={index} className="cache-alert-item">
                           {issue}
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
                 
                 {/* Cache Recommendations */}
                 {cacheMetrics.cache_performance.recommendations.length > 0 && (
                   <div className="cache-recommendations-alert">
                     <div className="cache-alert-header">
                       <span className="cache-alert-icon">💡</span>
                       <h4>Optimization Recommendations</h4>
                     </div>
                     <div className="cache-alert-list">
                       {cacheMetrics.cache_performance.recommendations.map((recommendation, index) => (
                         <div key={index} className="cache-alert-item">
                           {recommendation}
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
               </div>
             )}
           </main>
         </div>

         {/* Third Section - Register Usage Analysis */}
         <div className="content-section">
           <header className="App-header">
             <h1>🔧 Register Usage Analysis</h1>
             <p>Register access patterns and utilization</p>
           </header>
           
           <main className="container">
             <div className="metrics-grid">
               <div className="metric-card int-reg-read-card">
                 <div className="metric-header">
                   <h3>Integer Reg Reads</h3>
                 </div>
                 <div className="metric-value">
                   {formatNumber(metrics.int_reg_reads)}
                 </div>
                 <div className="metric-full">
                   {metrics.int_reg_reads.toLocaleString()}
                 </div>
               </div>
               
               <div className="metric-card int-reg-write-card">
                 <div className="metric-header">
                   <h3>Integer Reg Writes</h3>
                 </div>
                 <div className="metric-value">
                   {formatNumber(metrics.int_reg_writes)}
                 </div>
                 <div className="metric-full">
                   {metrics.int_reg_writes.toLocaleString()}
                 </div>
               </div>
               
               <div className="metric-card float-reg-read-card">
                 <div className="metric-header">
                   <h3>Float Reg Reads</h3>
                 </div>
                 <div className="metric-value">
                   {formatNumber(metrics.fp_reg_reads)}
                 </div>
                 <div className="metric-full">
                   {metrics.fp_reg_reads.toLocaleString()}
                 </div>
               </div>
               
               <div className="metric-card float-reg-write-card">
                 <div className="metric-header">
                   <h3>Float Reg Writes</h3>
                 </div>
                 <div className="metric-value">
                   {formatNumber(metrics.fp_reg_writes)}
                 </div>
                 <div className="metric-full">
                   {metrics.fp_reg_writes.toLocaleString()}
                 </div>
               </div>
               
               <div className="metric-card total-reg-read-card">
                 <div className="metric-header">
                   <h3>Total Reg Reads</h3>
                 </div>
                 <div className="metric-value">
                   {formatNumber(metrics.int_reg_reads + metrics.fp_reg_reads)}
                 </div>
                 <div className="metric-full">
                   {(metrics.int_reg_reads + metrics.fp_reg_reads).toLocaleString()}
                 </div>
               </div>
               
               <div className="metric-card total-reg-write-card">
                 <div className="metric-header">
                   <h3>Total Reg Writes</h3>
                 </div>
                 <div className="metric-value">
                   {formatNumber(metrics.int_reg_writes + metrics.fp_reg_writes)}
                 </div>
                 <div className="metric-full">
                   {(metrics.int_reg_writes + metrics.fp_reg_writes).toLocaleString()}
                 </div>
               </div>
             </div>
             
             {/* Register Usage Visualization */}
             <div className="chart-container">
               <h2>📊 Register Usage Distribution</h2>
               <div className="chart-wrapper">
                 <ResponsiveContainer width="100%" height={400}>
                   <BarChart
                     data={[
                       {
                         name: 'Integer Reads',
                         value: metrics.int_reg_reads,
                         color: '#3b82f6',
                         percentage: ((metrics.int_reg_reads / (metrics.int_reg_reads + metrics.fp_reg_reads + metrics.int_reg_writes + metrics.fp_reg_writes)) * 100)
                       },
                       {
                         name: 'Integer Writes',
                         value: metrics.int_reg_writes,
                         color: '#1d4ed8',
                         percentage: ((metrics.int_reg_writes / (metrics.int_reg_reads + metrics.fp_reg_reads + metrics.int_reg_writes + metrics.fp_reg_writes)) * 100)
                       },
                       {
                         name: 'Float Reads',
                         value: metrics.fp_reg_reads,
                         color: '#f59e0b',
                         percentage: ((metrics.fp_reg_reads / (metrics.int_reg_reads + metrics.fp_reg_reads + metrics.int_reg_writes + metrics.fp_reg_writes)) * 100)
                       },
                       {
                         name: 'Float Writes',
                         value: metrics.fp_reg_writes,
                         color: '#d97706',
                         percentage: ((metrics.fp_reg_writes / (metrics.int_reg_reads + metrics.fp_reg_reads + metrics.int_reg_writes + metrics.fp_reg_writes)) * 100)
                       }
                     ]}
                     margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                   >
                     <CartesianGrid strokeDasharray="3 3" stroke={isDarkTheme ? '#374151' : '#e5e7eb'} />
                     <XAxis 
                       dataKey="name" 
                       tick={{ fill: isDarkTheme ? '#f9fafb' : '#374151', fontSize: 12 }}
                       stroke={isDarkTheme ? '#6b7280' : '#9ca3af'}
                     />
                     <YAxis 
                       tick={{ fill: isDarkTheme ? '#f9fafb' : '#374151', fontSize: 12 }}
                       stroke={isDarkTheme ? '#6b7280' : '#9ca3af'}
                     />
                     <Tooltip 
                       contentStyle={{
                         backgroundColor: isDarkTheme ? '#1f2937' : '#ffffff',
                         border: isDarkTheme ? '1px solid #374151' : '1px solid #e5e7eb',
                         borderRadius: '8px',
                         color: isDarkTheme ? '#f9fafb' : '#374151'
                       }}
                       formatter={(value: number, name: string, props: any) => [
                         `${formatNumber(value)} (${props.payload.percentage.toFixed(1)}%)`,
                         name
                       ]}
                     />
                     <Bar 
                       dataKey="value" 
                       radius={[4, 4, 0, 0]}
                       fill="#8884d8"
                     >
                       {[
                         { name: 'Integer Reads', color: '#3b82f6' },
                         { name: 'Integer Writes', color: '#1d4ed8' },
                         { name: 'Float Reads', color: '#f59e0b' },
                         { name: 'Float Writes', color: '#d97706' }
                       ].map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                     </Bar>
                   </BarChart>
                 </ResponsiveContainer>
               </div>
             </div>
             
             <div className="summary">
               <h3>Register Usage Summary</h3>
               <div className="register-stats-grid">
                 <div className="register-stat-card">
                   <div className="register-stat-header">
                     <div className="register-stat-color" style={{backgroundColor: '#3b82f6'}}></div>
                     <h4>Integer Reads</h4>
                   </div>
                   <div className="register-stat-value">
                     {formatNumber(metrics.int_reg_reads)}
                   </div>
                   <div className="register-stat-percentage">
                     {((metrics.int_reg_reads / (metrics.int_reg_reads + metrics.fp_reg_reads + metrics.int_reg_writes + metrics.fp_reg_writes)) * 100).toFixed(1)}%
                   </div>
                 </div>
                 
                 <div className="register-stat-card">
                   <div className="register-stat-header">
                     <div className="register-stat-color" style={{backgroundColor: '#1d4ed8'}}></div>
                     <h4>Integer Writes</h4>
                   </div>
                   <div className="register-stat-value">
                     {formatNumber(metrics.int_reg_writes)}
                   </div>
                   <div className="register-stat-percentage">
                     {((metrics.int_reg_writes / (metrics.int_reg_reads + metrics.fp_reg_reads + metrics.int_reg_writes + metrics.fp_reg_writes)) * 100).toFixed(1)}%
                   </div>
                 </div>
                 
                 <div className="register-stat-card">
                   <div className="register-stat-header">
                     <div className="register-stat-color" style={{backgroundColor: '#f59e0b'}}></div>
                     <h4>Float Reads</h4>
                   </div>
                   <div className="register-stat-value">
                     {formatNumber(metrics.fp_reg_reads)}
                   </div>
                   <div className="register-stat-percentage">
                     {((metrics.fp_reg_reads / (metrics.int_reg_reads + metrics.fp_reg_reads + metrics.int_reg_writes + metrics.fp_reg_writes)) * 100).toFixed(1)}%
                   </div>
                 </div>
                 
                 <div className="register-stat-card">
                   <div className="register-stat-header">
                     <div className="register-stat-color" style={{backgroundColor: '#d97706'}}></div>
                     <h4>Float Writes</h4>
                   </div>
                   <div className="register-stat-value">
                     {formatNumber(metrics.fp_reg_writes)}
                   </div>
                   <div className="register-stat-percentage">
                     {((metrics.fp_reg_writes / (metrics.int_reg_reads + metrics.fp_reg_reads + metrics.int_reg_writes + metrics.fp_reg_writes)) * 100).toFixed(1)}%
                   </div>
                 </div>
               </div>
               
               <div className="register-total-info">
                 <p>
                   <strong>Total Register Operations:</strong> {(metrics.int_reg_reads + metrics.fp_reg_reads + metrics.int_reg_writes + metrics.fp_reg_writes).toLocaleString()}<br/>
                   <strong>Integer Operations:</strong> {(metrics.int_reg_reads + metrics.int_reg_writes).toLocaleString()} ({((metrics.int_reg_reads + metrics.int_reg_writes) / (metrics.int_reg_reads + metrics.fp_reg_reads + metrics.int_reg_writes + metrics.fp_reg_writes) * 100).toFixed(1)}%)<br/>
                   <strong>Float Operations:</strong> {(metrics.fp_reg_reads + metrics.fp_reg_writes).toLocaleString()} ({((metrics.fp_reg_reads + metrics.fp_reg_writes) / (metrics.int_reg_reads + metrics.fp_reg_reads + metrics.int_reg_writes + metrics.fp_reg_writes) * 100).toFixed(1)}%)
                 </p>
               </div>
             </div>
             
             {/* Instruction Breakdown */}
             <div className="instruction-breakdown-section">
               <h3>Instruction Breakdown</h3>
               <div className="instruction-breakdown-grid">
                 <div className="instruction-breakdown-card">
                   <div className="instruction-breakdown-header">
                     <span className="instruction-breakdown-icon">📊</span>
                     <h4>Simulated Instructions</h4>
                   </div>
                   <div className="instruction-breakdown-value">
                     {formatNumber(metrics.sim_insts)}
                   </div>
                   <div className="instruction-breakdown-detail">
                     Total instructions simulated
                   </div>
                 </div>
                 
                 <div className="instruction-breakdown-card">
                   <div className="instruction-breakdown-header">
                     <span className="instruction-breakdown-icon">⚙️</span>
                     <h4>Simulated Operations</h4>
                   </div>
                   <div className="instruction-breakdown-value">
                     {formatNumber(metrics.sim_ops)}
                   </div>
                   <div className="instruction-breakdown-detail">
                     Including micro-ops
                   </div>
                 </div>
                 
                 <div className="instruction-breakdown-card">
                   <div className="instruction-breakdown-header">
                     <span className="instruction-breakdown-icon">✅</span>
                     <h4>Committed Operations</h4>
                   </div>
                   <div className="instruction-breakdown-value">
                     {formatNumber(metrics.committed_ops)}
                   </div>
                   <div className="instruction-breakdown-detail">
                     Successfully committed
                   </div>
                 </div>
                 
                 <div className="instruction-breakdown-card">
                   <div className="instruction-breakdown-header">
                     <span className="instruction-breakdown-icon">🔢</span>
                     <h4>Integer Instructions</h4>
                   </div>
                   <div className="instruction-breakdown-value">
                     {formatNumber(metrics.int_insts)}
                   </div>
                   <div className="instruction-breakdown-detail">
                     {((metrics.int_insts / metrics.total_instructions) * 100).toFixed(1)}% of total
                   </div>
                 </div>
                 
                 <div className="instruction-breakdown-card">
                   <div className="instruction-breakdown-header">
                     <span className="instruction-breakdown-icon">🔢</span>
                     <h4>Float Instructions</h4>
                   </div>
                   <div className="instruction-breakdown-value">
                     {formatNumber(metrics.fp_insts)}
                   </div>
                   <div className="instruction-breakdown-detail">
                     {((metrics.fp_insts / metrics.total_instructions) * 100).toFixed(1)}% of total
                   </div>
                 </div>
                 
                 <div className="instruction-breakdown-card">
                   <div className="instruction-breakdown-header">
                     <span className="instruction-breakdown-icon">🔢</span>
                     <h4>Vector Instructions</h4>
                   </div>
                   <div className="instruction-breakdown-value">
                     {formatNumber(metrics.vec_insts)}
                   </div>
                   <div className="instruction-breakdown-detail">
                     {((metrics.vec_insts / metrics.total_instructions) * 100).toFixed(1)}% of total
                   </div>
                 </div>
               </div>
             </div>
           </main>
         </div>

         {/* Spacing between sections */}
         <div className="section-spacer"></div>

         {/* Fourth Section - Instruction Type Analysis */}
         <div className="content-section">
           <header className="App-header">
             <h1>⚙️ Instruction Type Analysis</h1>
             <p>Distribution of different instruction types</p>
           </header>
          
          <main className="container">
             {instructionTypes && (
               <div className="analysis-section">
                 <div className="architecture-info">
                   <h2>🏗️ Architecture: {instructionTypes.architecture}</h2>
                   <p>Total Instructions: {formatNumber(instructionTypes.total_instructions)}</p>
                 </div>
                 
                 <div className="chart-container">
                   <h2>📊 Instruction Type Distribution</h2>
                   <div className="chart-wrapper">
                     <ResponsiveContainer width="100%" height={400}>
                       <PieChart>
                         <Pie
                           data={Object.entries(instructionTypes.instruction_types)
                             .sort(([,a], [,b]) => b.count - a.count)
                             .slice(0, 8)
                             .map(([type, data]) => ({
                               name: type,
                               value: data.count,
                               percentage: data.percentage
                             }))}
                           cx="50%"
                           cy="50%"
                           labelLine={false}
                           label={({ name, percentage }) => `${name}: ${percentage}%`}
                           outerRadius={120}
                           fill="#8884d8"
                           dataKey="value"
                         >
                           {Object.entries(instructionTypes.instruction_types)
                             .sort(([,a], [,b]) => b.count - a.count)
                             .slice(0, 8)
                             .map((_, index) => (
                               <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                             ))}
                         </Pie>
                         <Tooltip 
                           formatter={(value: number, name: string, props: any) => [
                             `${formatNumber(value)} (${props.payload.percentage}%)`,
                             name
                           ]}
                         />
                         <Legend />
                       </PieChart>
                     </ResponsiveContainer>
                 </div>
               </div>
               
                 <div className="instruction-types-grid">
                   {Object.entries(instructionTypes.instruction_types)
                     .sort(([,a], [,b]) => b.count - a.count)
                     .slice(0, 12)
                     .map(([type, data]) => (
                       <div key={type} className="instruction-type-card">
                         <div className="instruction-type-header">
                           <h3>{type}</h3>
                         </div>
                         <div className="instruction-type-value">
                           {formatNumber(data.count)}
                         </div>
                         <div className="instruction-type-full">
                           {data.count.toLocaleString()}
                         </div>
                         <div className="instruction-type-percentage">
                           {data.percentage}%
                         </div>
                         <div className="instruction-type-bar">
                           <div 
                             className="instruction-type-bar-fill" 
                             style={{ width: `${Math.min(data.percentage, 100)}%` }}
                           ></div>
                         </div>
                       </div>
                    ))}
                  </div>
                 
                 <div className="summary">
                   <h3>Instruction Type Summary</h3>
                   <p>
                     Top instruction types by count:<br/>
                     {Object.entries(instructionTypes.instruction_types)
                       .sort(([,a], [,b]) => b.count - a.count)
                       .slice(0, 5)
                       .map(([type, data], index) => (
                         <span key={type}>
                           {index + 1}. {type}: {formatNumber(data.count)} ({data.percentage}%)<br/>
                         </span>
                       ))}
                   </p>
                 </div>
                           </div>
             )}
           </main>
         </div>

         {/* Fifth Section - Performance Metrics */}
         <div className="content-section">
           <header className="App-header">
             <h1>📈 Performance Metrics</h1>
             <p>Key performance indicators and efficiency metrics</p>
           </header>
           
           <main className="container">
             <div className="metrics-grid">
               <div className="metric-card performance-card">
                 <div className="metric-header">
                   <h3>CPI (Cycles per Instruction)</h3>
                 </div>
                 <div className="metric-value performance-value">
                   {metrics.cpi.toFixed(2)}
                             </div>
                 <div className="metric-full">
                   Lower is better
                               </div>
                 <div className="performance-indicator">
                   <div className="performance-bar">
                     <div 
                       className="performance-bar-fill" 
                       style={{ 
                         width: `${Math.min((metrics.cpi / 200) * 100, 100)}%`,
                         backgroundColor: metrics.cpi > 100 ? '#ef4444' : metrics.cpi > 50 ? '#f59e0b' : '#10b981'
                       }}
                             ></div>
                               </div>
                               </div>
               </div>
               
               <div className="metric-card performance-card">
                 <div className="metric-header">
                   <h3>IPC (Instructions per Cycle)</h3>
                 </div>
                 <div className="metric-value performance-value">
                   {metrics.ipc.toFixed(6)}
                             </div>
                 <div className="metric-full">
                   Higher is better
                           </div>
                 <div className="performance-indicator">
                   <div className="performance-bar">
                     <div 
                       className="performance-bar-fill" 
                       style={{ 
                         width: `${Math.min((metrics.ipc / 0.01) * 100, 100)}%`,
                         backgroundColor: metrics.ipc > 0.005 ? '#10b981' : metrics.ipc > 0.001 ? '#f59e0b' : '#ef4444'
                       }}
                             ></div>
                           </div>
                         </div>
                </div>

               <div className="metric-card performance-card">
                 <div className="metric-header">
                   <h3>Memory Efficiency</h3>
                 </div>
                 <div className="metric-value performance-value">
                   {((metrics.total_loads + metrics.total_stores) / metrics.total_instructions * 100).toFixed(2)}%
                 </div>
                 <div className="metric-full">
                   Memory operations ratio
                 </div>
                 <div className="performance-indicator">
                   <div className="performance-bar">
                     <div 
                       className="performance-bar-fill" 
                              style={{ 
                         width: `${((metrics.total_loads + metrics.total_stores) / metrics.total_instructions * 100)}%`,
                         backgroundColor: '#3b82f6'
                              }}
                            ></div>
                          </div>
                   </div>
                </div>

               <div className="metric-card performance-card">
                 <div className="metric-header">
                   <h3>Register Efficiency</h3>
                 </div>
                 <div className="metric-value performance-value">
                   {((metrics.int_reg_reads + metrics.fp_reg_reads) / metrics.total_instructions * 100).toFixed(2)}%
                 </div>
                 <div className="metric-full">
                   Register operations ratio
                 </div>
                 <div className="performance-indicator">
                   <div className="performance-bar">
                     <div 
                       className="performance-bar-fill" 
                              style={{ 
                         width: `${Math.min(((metrics.int_reg_reads + metrics.fp_reg_reads) / metrics.total_instructions * 100), 100)}%`,
                         backgroundColor: '#8b5cf6'
                              }}
                            ></div>
                          </div>
                        </div>
               </div>
             </div>
             
             {/* Creative Performance Visualization */}
             <div className="performance-visualization">
               <h3>🚀 Performance Analysis Dashboard</h3>
               
               {/* Dual Performance Analysis */}
               <div className="dual-performance-container">
                 {/* Performance Metrics Radar */}
                 <div className="performance-radar-container">
                   <h4>📊 Performance Metrics</h4>
                   <div className="radar-chart">
                     <div className="radar-center">
                       <div className="radar-center-icon">⚡</div>
                       <div className="radar-center-text">Performance</div>
                     </div>
                     
                     {/* Performance Metrics Axes */}
                     <div className="radar-axes">
                       <div className="radar-axis" style={{transform: 'rotate(0deg)'}}>
                         <div className="axis-label">🚀 IPC</div>
                         <div className="axis-value" style={{
                           '--efficiency': `${Math.min(100, (metrics.ipc / 0.01) * 100)}%`,
                           '--color': '#10b981'
                         } as React.CSSProperties}>
                           <div className="efficiency-bar"></div>
                           <div className="efficiency-text">{metrics.ipc.toFixed(4)}</div>
                         </div>
                       </div>
                       
                       <div className="radar-axis" style={{transform: 'rotate(90deg)'}}>
                         <div className="axis-label">⚡ CPI</div>
                         <div className="axis-value" style={{
                           '--efficiency': `${Math.max(0, 100 - (metrics.cpi / 200) * 100)}%`,
                           '--color': '#3b82f6'
                         } as React.CSSProperties}>
                           <div className="efficiency-bar"></div>
                           <div className="efficiency-text">{metrics.cpi.toFixed(1)}</div>
                         </div>
                       </div>
                       
                       <div className="radar-axis" style={{transform: 'rotate(180deg)'}}>
                         <div className="axis-label">💾 Memory</div>
                         <div className="axis-value" style={{
                           '--efficiency': `${Math.min(100, ((metrics.total_loads + metrics.total_stores) / metrics.total_instructions * 100))}%`,
                           '--color': '#f59e0b'
                         } as React.CSSProperties}>
                           <div className="efficiency-bar"></div>
                           <div className="efficiency-text">{((metrics.total_loads + metrics.total_stores) / metrics.total_instructions * 100).toFixed(1)}%</div>
                         </div>
                       </div>
                       
                       <div className="radar-axis" style={{transform: 'rotate(270deg)'}}>
                         <div className="axis-label">🔢 Registers</div>
                         <div className="axis-value" style={{
                           '--efficiency': `${Math.min(100, ((metrics.int_reg_reads + metrics.fp_reg_reads) / metrics.total_instructions * 100))}%`,
                           '--color': '#ef4444'
                         } as React.CSSProperties}>
                           <div className="efficiency-bar"></div>
                           <div className="efficiency-text">{((metrics.int_reg_reads + metrics.fp_reg_reads) / metrics.total_instructions * 100).toFixed(1)}%</div>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
                 
                 {/* Trade-off Analysis Radar */}
                 <div className="tradeoff-radar-container">
                   <h4>⚖️ Trade-off Analysis</h4>
                   <div className="radar-chart">
                     <div className="radar-center">
                       <div className="radar-center-icon">⚖️</div>
                       <div className="radar-center-text">Trade-offs</div>
                     </div>
                     
                     {/* Trade-off Axes */}
                     <div className="radar-axes">
                       <div className="radar-axis" style={{transform: 'rotate(0deg)'}}>
                         <div className="axis-label">🚀 vs 🔋</div>
                         <div className="axis-value" style={{
                           '--efficiency': `${metrics.ipc > 0.005 ? 80 : 20}%`,
                           '--color': '#10b981'
                         } as React.CSSProperties}>
                           <div className="efficiency-bar"></div>
                           <div className="efficiency-text">{metrics.ipc > 0.005 ? 'High Perf' : 'Low Power'}</div>
                         </div>
                       </div>
                       
                       <div className="radar-axis" style={{transform: 'rotate(90deg)'}}>
                         <div className="axis-label">💾 vs ⚡</div>
                         <div className="axis-value" style={{
                           '--efficiency': `${((metrics.total_loads + metrics.total_stores) / metrics.total_instructions) > 0.3 ? 80 : 20}%`,
                           '--color': '#3b82f6'
                         } as React.CSSProperties}>
                           <div className="efficiency-bar"></div>
                           <div className="efficiency-text">{((metrics.total_loads + metrics.total_stores) / metrics.total_instructions) > 0.3 ? 'Memory' : 'Compute'}</div>
                         </div>
                       </div>
                       
                       <div className="radar-axis" style={{transform: 'rotate(180deg)'}}>
                         <div className="axis-label">🔢 vs 💾</div>
                         <div className="axis-value" style={{
                           '--efficiency': `${((metrics.int_reg_reads + metrics.fp_reg_reads) / metrics.total_instructions) > 2 ? 80 : 20}%`,
                           '--color': '#f59e0b'
                         } as React.CSSProperties}>
                           <div className="efficiency-bar"></div>
                           <div className="efficiency-text">{((metrics.int_reg_reads + metrics.fp_reg_reads) / metrics.total_instructions) > 2 ? 'Register' : 'Cache'}</div>
                         </div>
                       </div>
                       
                       <div className="radar-axis" style={{transform: 'rotate(270deg)'}}>
                         <div className="axis-label">⚡ vs 🔋</div>
                         <div className="axis-value" style={{
                           '--efficiency': `${metrics.cpi < 100 ? 80 : 20}%`,
                           '--color': '#ef4444'
                         } as React.CSSProperties}>
                           <div className="efficiency-bar"></div>
                           <div className="efficiency-text">{metrics.cpi < 100 ? 'Efficient' : 'Power'}</div>
                         </div>
                       </div>
                     </div>
                     
                     {/* Trade-off Indicators */}
                     <div className="tradeoff-indicators">
                       <div className="tradeoff-indicator" style={{top: '15%', left: '15%'}}>
                         <div className="tradeoff-icon">⚡</div>
                         <div className="tradeoff-label">High Perf</div>
                         <div className="tradeoff-cost">High Power</div>
                       </div>
                       <div className="tradeoff-indicator" style={{top: '15%', right: '15%'}}>
                         <div className="tradeoff-icon">🔋</div>
                         <div className="tradeoff-label">Low Power</div>
                         <div className="tradeoff-cost">Low Perf</div>
                       </div>
                       <div className="tradeoff-indicator" style={{bottom: '15%', left: '15%'}}>
                         <div className="tradeoff-icon">💾</div>
                         <div className="tradeoff-label">Memory</div>
                         <div className="tradeoff-cost">Cache Miss</div>
                       </div>
                       <div className="tradeoff-indicator" style={{bottom: '15%', right: '15%'}}>
                         <div className="tradeoff-icon">🔢</div>
                         <div className="tradeoff-label">Register</div>
                         <div className="tradeoff-cost">Spill Risk</div>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
               
               {/* Detailed Trade-off Analysis */}
               <div className="tradeoff-analysis">
                 <h5>📈 Detailed Trade-off Analysis</h5>
                 <div className="tradeoff-grid">
                   <div className="tradeoff-card">
                     <div className="tradeoff-header">
                       <span className="tradeoff-emoji">⚡</span>
                       <span className="tradeoff-title">Performance vs Power</span>
                     </div>
                     <div className="tradeoff-content">
                       <div className="tradeoff-metric">
                         <span className="metric-label">Current IPC:</span>
                         <span className="metric-value">{metrics.ipc.toFixed(4)}</span>
                       </div>
                       <div className="tradeoff-metric">
                         <span className="metric-label">Power Efficiency:</span>
                         <span className="metric-value">{((1/metrics.cpi) * 100).toFixed(1)}%</span>
                       </div>
                       <div className="tradeoff-status">
                         {metrics.ipc > 0.005 ? '🚀 High Performance' : '🔋 Power Optimized'}
                       </div>
                     </div>
                   </div>
                   
                   <div className="tradeoff-card">
                     <div className="tradeoff-header">
                       <span className="tradeoff-emoji">💾</span>
                       <span className="tradeoff-title">Memory vs Speed</span>
                     </div>
                     <div className="tradeoff-content">
                       <div className="tradeoff-metric">
                         <span className="metric-label">Memory Intensity:</span>
                         <span className="metric-value">{((metrics.total_loads + metrics.total_stores) / metrics.total_instructions * 100).toFixed(1)}%</span>
                       </div>
                       <div className="tradeoff-metric">
                         <span className="metric-label">Cache Pressure:</span>
                         <span className="metric-value">{metrics.total_memory_refs > 0 ? 'High' : 'Low'}</span>
                       </div>
                       <div className="tradeoff-status">
                         {(metrics.total_loads + metrics.total_stores) / metrics.total_instructions > 0.3 ? '💾 Memory Bound' : '⚡ Compute Bound'}
                       </div>
                     </div>
                   </div>
                   
                   <div className="tradeoff-card">
                     <div className="tradeoff-header">
                       <span className="tradeoff-emoji">🔢</span>
                       <span className="tradeoff-title">Register vs Cache</span>
                     </div>
                     <div className="tradeoff-content">
                       <div className="tradeoff-metric">
                         <span className="metric-label">Register Pressure:</span>
                         <span className="metric-value">{((metrics.int_reg_reads + metrics.fp_reg_reads) / metrics.total_instructions * 100).toFixed(1)}%</span>
                       </div>
                       <div className="tradeoff-metric">
                         <span className="metric-label">Spill Risk:</span>
                         <span className="metric-value">{((metrics.int_reg_reads + metrics.fp_reg_reads) / metrics.total_instructions) > 2 ? 'High' : 'Low'}</span>
                       </div>
                       <div className="tradeoff-status">
                         {((metrics.int_reg_reads + metrics.fp_reg_reads) / metrics.total_instructions) > 2 ? '⚠️ Spill Risk' : '✅ Register Efficient'}
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
               
               {/* Performance Gauges */}
               <div className="performance-gauges">
                 <h4>🎯 Performance Gauges</h4>
                 <div className="gauges-grid">
                   <div className="gauge-container">
                     <div className="gauge-label">CPI Performance</div>
                     <div className="gauge">
                       <div className="gauge-background"></div>
                       <div 
                         className="gauge-fill cpi-gauge"
                         style={{
                           '--percentage': `${Math.min(100, (metrics.cpi / 200) * 100)}%`,
                           '--color': metrics.cpi > 100 ? '#ef4444' : metrics.cpi > 50 ? '#f59e0b' : '#10b981'
                         } as React.CSSProperties}
                       ></div>
                       <div className="gauge-center">
                         <div className="gauge-value">{metrics.cpi.toFixed(1)}</div>
                         <div className="gauge-unit">cycles/inst</div>
                       </div>
                     </div>
                     <div className="gauge-status">
                       {metrics.cpi > 100 ? '🔴 Critical' : metrics.cpi > 50 ? '🟡 Warning' : '🟢 Good'}
                     </div>
                   </div>
                   
                   <div className="gauge-container">
                     <div className="gauge-label">IPC Performance</div>
                     <div className="gauge">
                       <div className="gauge-background"></div>
                       <div 
                         className="gauge-fill ipc-gauge"
                         style={{
                           '--percentage': `${Math.min(100, (metrics.ipc / 0.01) * 100)}%`,
                           '--color': metrics.ipc > 0.005 ? '#10b981' : metrics.ipc > 0.001 ? '#f59e0b' : '#ef4444'
                         } as React.CSSProperties}
                       ></div>
                       <div className="gauge-center">
                         <div className="gauge-value">{metrics.ipc.toFixed(4)}</div>
                         <div className="gauge-unit">inst/cycle</div>
                       </div>
                     </div>
                     <div className="gauge-status">
                       {metrics.ipc > 0.005 ? '🟢 Excellent' : metrics.ipc > 0.001 ? '🟡 Moderate' : '🔴 Poor'}
                     </div>
                   </div>
                   
                   <div className="gauge-container">
                     <div className="gauge-label">Memory Intensity</div>
                     <div className="gauge">
                       <div className="gauge-background"></div>
                       <div 
                         className="gauge-fill memory-gauge"
                         style={{
                           '--percentage': `${((metrics.total_loads + metrics.total_stores) / metrics.total_instructions * 100)}%`,
                           '--color': '#3b82f6'
                         } as React.CSSProperties}
                       ></div>
                       <div className="gauge-center">
                         <div className="gauge-value">{((metrics.total_loads + metrics.total_stores) / metrics.total_instructions * 100).toFixed(1)}%</div>
                         <div className="gauge-unit">memory ops</div>
                       </div>
                     </div>
                     <div className="gauge-status">
                       Memory Bound
                     </div>
                   </div>
                   
                   <div className="gauge-container">
                     <div className="gauge-label">Register Intensity</div>
                     <div className="gauge">
                       <div className="gauge-background"></div>
                       <div 
                         className="gauge-fill register-gauge"
                         style={{
                           '--percentage': `${Math.min(100, ((metrics.int_reg_reads + metrics.fp_reg_reads) / metrics.total_instructions * 100))}%`,
                           '--color': '#8b5cf6'
                         } as React.CSSProperties}
                       ></div>
                       <div className="gauge-center">
                         <div className="gauge-value">{((metrics.int_reg_reads + metrics.fp_reg_reads) / metrics.total_instructions * 100).toFixed(1)}%</div>
                         <div className="gauge-unit">register ops</div>
                       </div>
                     </div>
                     <div className="gauge-status">
                       Register Bound
                     </div>
                   </div>
                 </div>
               </div>
               
               {/* Performance Summary Cards */}
               <div className="performance-summary-cards">
                 <div className="summary-card performance-card">
                   <div className="card-header">
                     <div className="card-icon">⚡</div>
                     <h5>Overall Performance</h5>
                   </div>
                   <div className="card-content">
                     <div className="performance-score">
                       <div className="score-circle">
                         <div className="score-value">{Math.max(0, Math.min(100, 100 - (metrics.cpi / 200) * 100)).toFixed(0)}</div>
                         <div className="score-label">Score</div>
                       </div>
                     </div>
                     <div className="performance-details">
                       <p><strong>Status:</strong> {metrics.cpi > 100 ? 'Critical Performance' : metrics.cpi > 50 ? 'Moderate Performance' : 'Good Performance'}</p>
                       <p><strong>Bottleneck:</strong> {metrics.cpi > 100 ? 'High CPI indicates pipeline stalls' : 'Memory or register pressure'}</p>
                     </div>
                   </div>
                 </div>
                 
                 <div className="summary-card efficiency-card">
                   <div className="card-header">
                     <div className="card-icon">🎯</div>
                     <h5>Efficiency Analysis</h5>
                   </div>
                   <div className="card-content">
                     <div className="efficiency-metrics">
                       <div className="efficiency-item">
                         <span className="efficiency-label">Memory:</span>
                         <span className="efficiency-value">{((metrics.total_loads + metrics.total_stores) / metrics.total_instructions * 100).toFixed(1)}%</span>
                       </div>
                       <div className="efficiency-item">
                         <span className="efficiency-label">Register:</span>
                         <span className="efficiency-value">{((metrics.int_reg_reads + metrics.fp_reg_reads) / metrics.total_instructions * 100).toFixed(1)}%</span>
                       </div>
                       <div className="efficiency-item">
                         <span className="efficiency-label">Compute:</span>
                         <span className="efficiency-value">{(100 - ((metrics.total_loads + metrics.total_stores) / metrics.total_instructions * 100)).toFixed(1)}%</span>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </main>
         </div>

         {/* Spacing between sections */}
         <div className="section-spacer"></div>

         {/* Sixth Section - Memory System Analysis */}
         <div className="content-section">
           <header className="App-header">
             <h1>🧠 Memory System Analysis</h1>
             <p>Memory controller and TLB statistics</p>
           </header>
          
          <main className="container">
             {memorySystemStats && (
               <div className="analysis-section">
                 <h2>📊 Memory Controller Statistics</h2>
                 <div className="memory-system-grid">
                   <div className="memory-system-card">
                     <h3>Memory Requests</h3>
                     <div className="memory-stat">
                       <span className="memory-label">Read Requests:</span>
                       <span className="memory-value">
                         {formatNumber(memorySystemStats['system.mem_ctrls.readReqs'] || 0)}
                       </span>
                  </div>
                     <div className="memory-stat">
                       <span className="memory-label">Write Requests:</span>
                       <span className="memory-value">
                         {formatNumber(memorySystemStats['system.mem_ctrls.writeReqs'] || 0)}
                       </span>
                           </div>
                     <div className="memory-stat">
                       <span className="memory-label">Total Requests:</span>
                       <span className="memory-value">
                         {formatNumber((memorySystemStats['system.mem_ctrls.readReqs'] || 0) + (memorySystemStats['system.mem_ctrls.writeReqs'] || 0))}
                       </span>
                             </div>
                               </div>
                   
                   <div className="memory-system-card">
                     <h3>Memory Bursts</h3>
                     <div className="memory-stat">
                       <span className="memory-label">Read Bursts:</span>
                       <span className="memory-value">
                         {formatNumber(memorySystemStats['system.mem_ctrls.readBursts'] || 0)}
                       </span>
                               </div>
                     <div className="memory-stat">
                       <span className="memory-label">Write Bursts:</span>
                       <span className="memory-value">
                         {formatNumber(memorySystemStats['system.mem_ctrls.writeBursts'] || 0)}
                       </span>
                               </div>
                     <div className="memory-stat">
                       <span className="memory-label">Total Bursts:</span>
                       <span className="memory-value">
                         {formatNumber((memorySystemStats['system.mem_ctrls.readBursts'] || 0) + (memorySystemStats['system.mem_ctrls.writeBursts'] || 0))}
                       </span>
                               </div>
                               </div>
                   
                   <div className="memory-system-card">
                     <h3>Queue Lengths</h3>
                     <div className="memory-stat">
                       <span className="memory-label">Avg Read Queue:</span>
                       <span className="memory-value">
                         {(memorySystemStats['system.mem_ctrls.avgRdQLen'] || 0).toFixed(2)}
                       </span>
                             </div>
                     <div className="memory-stat">
                       <span className="memory-label">Avg Write Queue:</span>
                       <span className="memory-value">
                         {(memorySystemStats['system.mem_ctrls.avgWrQLen'] || 0).toFixed(2)}
                       </span>
                           </div>
                   </div>
                </div>

                 <h2>🔍 TLB (Translation Lookaside Buffer) Statistics</h2>
                 <div className="memory-system-grid">
                   <div className="memory-system-card">
                     <h3>Data TLB (DTB)</h3>
                     <div className="memory-stat">
                       <span className="memory-label">Read Accesses:</span>
                       <span className="memory-value">
                         {formatNumber(memorySystemStats['system.cpu.mmu.dtb.rdAccesses'] || 0)}
                       </span>
                          </div>
                     <div className="memory-stat">
                       <span className="memory-label">Write Accesses:</span>
                       <span className="memory-value">
                         {formatNumber(memorySystemStats['system.cpu.mmu.dtb.wrAccesses'] || 0)}
                       </span>
                        </div>
                     <div className="memory-stat">
                       <span className="memory-label">Read Misses:</span>
                       <span className="memory-value">
                         {formatNumber(memorySystemStats['system.cpu.mmu.dtb.rdMisses'] || 0)}
                       </span>
                    </div>
                     <div className="memory-stat">
                       <span className="memory-label">Write Misses:</span>
                       <span className="memory-value">
                         {formatNumber(memorySystemStats['system.cpu.mmu.dtb.wrMisses'] || 0)}
                       </span>
                  </div>
                </div>

                   <div className="memory-system-card">
                     <h3>Instruction TLB (ITB)</h3>
                     <div className="memory-stat">
                       <span className="memory-label">Read Accesses:</span>
                       <span className="memory-value">
                         {formatNumber(memorySystemStats['system.cpu.mmu.itb.rdAccesses'] || 0)}
                       </span>
                     </div>
                     <div className="memory-stat">
                       <span className="memory-label">Write Accesses:</span>
                       <span className="memory-value">
                         {formatNumber(memorySystemStats['system.cpu.mmu.itb.wrAccesses'] || 0)}
                       </span>
                     </div>
                     <div className="memory-stat">
                       <span className="memory-label">Read Misses:</span>
                       <span className="memory-value">
                         {formatNumber(memorySystemStats['system.cpu.mmu.itb.rdMisses'] || 0)}
                       </span>
                       </div>
                     <div className="memory-stat">
                       <span className="memory-label">Write Misses:</span>
                       <span className="memory-value">
                         {formatNumber(memorySystemStats['system.cpu.mmu.itb.wrMisses'] || 0)}
                       </span>
                     </div>
                   </div>
                 </div>
                 
                 <div className="summary">
                   <h3>Memory System Summary</h3>
                   <p>
                     Memory System Performance:<br/>
                     Total memory requests: {formatNumber((memorySystemStats['system.mem_ctrls.readReqs'] || 0) + (memorySystemStats['system.mem_ctrls.writeReqs'] || 0))}<br/>
                     Total TLB accesses: {formatNumber((memorySystemStats['system.cpu.mmu.dtb.rdAccesses'] || 0) + (memorySystemStats['system.cpu.mmu.dtb.wrAccesses'] || 0) + (memorySystemStats['system.cpu.mmu.itb.rdAccesses'] || 0) + (memorySystemStats['system.cpu.mmu.itb.wrAccesses'] || 0))}<br/>
                     Total TLB misses: {formatNumber((memorySystemStats['system.cpu.mmu.dtb.rdMisses'] || 0) + (memorySystemStats['system.cpu.mmu.dtb.wrMisses'] || 0) + (memorySystemStats['system.cpu.mmu.itb.rdMisses'] || 0) + (memorySystemStats['system.cpu.mmu.itb.wrMisses'] || 0))}
                   </p>
                 </div>
               </div>
             )}
           </main>
         </div>

         {/* Spacing between sections */}
         <div className="section-spacer"></div>

         {/* Seventh Section - Memory Heatmap Analysis */}
         <div className="content-section">
           <header className="App-header">
             <h1>🔥 Memory Heatmap Analysis</h1>
             <p>Thermal visualization of memory usage patterns and register hotspots</p>
           </header>
           
           <main className="container">
             <div className="analysis-section">
               {/* Memory Access Heatmap */}
               <div className="heatmap-section">
                 <h2>🌡️ Memory Access Heatmap</h2>
                 <div className="heatmap-container">
                   <div className="heatmap-grid">
                     {memorySystemStats && (() => {
                       const maxValue = Math.max(
                         memorySystemStats['system.mem_ctrls.readReqs'] || 0,
                         memorySystemStats['system.mem_ctrls.writeReqs'] || 0,
                         memorySystemStats['system.cpu.mmu.dtb.rdAccesses'] || 0,
                         memorySystemStats['system.cpu.mmu.dtb.wrAccesses'] || 0
                       );
                       
                       const memoryRegions = [
                         { name: 'Memory Read Reqs', value: memorySystemStats['system.mem_ctrls.readReqs'] || 0, type: 'memory' },
                         { name: 'Memory Write Reqs', value: memorySystemStats['system.mem_ctrls.writeReqs'] || 0, type: 'memory' },
                         { name: 'Memory Read Bursts', value: memorySystemStats['system.mem_ctrls.readBursts'] || 0, type: 'memory' },
                         { name: 'Memory Write Bursts', value: memorySystemStats['system.mem_ctrls.writeBursts'] || 0, type: 'memory' },
                         { name: 'DTLB Read Access', value: memorySystemStats['system.cpu.mmu.dtb.rdAccesses'] || 0, type: 'tlb' },
                         { name: 'DTLB Write Access', value: memorySystemStats['system.cpu.mmu.dtb.wrAccesses'] || 0, type: 'tlb' },
                         { name: 'ITLB Read Access', value: memorySystemStats['system.cpu.mmu.itb.rdAccesses'] || 0, type: 'tlb' },
                         { name: 'ITLB Write Access', value: memorySystemStats['system.cpu.mmu.itb.wrAccesses'] || 0, type: 'tlb' }
                       ];
                       
                       return memoryRegions.map((region, index) => {
                         const intensity = maxValue > 0 ? (region.value / maxValue) * 100 : 0;
                         const temperature = Math.min(intensity, 100);
                         
                         // Thermal color mapping (cold to hot)
                         let color;
                         if (temperature < 20) {
                           color = '#1e3a8a'; // Deep blue (cold)
                         } else if (temperature < 40) {
                           color = '#3b82f6'; // Blue
                         } else if (temperature < 60) {
                           color = '#10b981'; // Green
                         } else if (temperature < 80) {
                           color = '#f59e0b'; // Orange
                         } else {
                           color = '#ef4444'; // Red (hot)
                         }
                         
                         return (
                           <div 
                             key={index}
                             className="heatmap-cell"
                             style={{
                               backgroundColor: color,
                               opacity: 0.8 + (temperature / 100) * 0.2,
                               boxShadow: `0 0 ${temperature / 10}px ${color}`,
                               animationDelay: `${index * 0.1}s`
                             }}
                             title={`${region.name}: ${formatNumber(region.value)} (${temperature.toFixed(1)}% intensity)`}
                           >
                             <div className="heatmap-label">{region.name}</div>
                             <div className="heatmap-value">{formatNumber(region.value)}</div>
                             <div className="heatmap-temperature">{temperature.toFixed(1)}°</div>
                           </div>
                         );
                       });
                     })()}
                   </div>
                 </div>
                 
                 {/* Register Usage Heatmap */}
                 <h2>🔥 Register Usage Heatmap</h2>
                 <div className="heatmap-container">
                   <div className="register-heatmap-grid">
                     {metrics && (() => {
                       const maxRegValue = Math.max(
                         metrics.int_reg_reads,
                         metrics.int_reg_writes,
                         metrics.fp_reg_reads,
                         metrics.fp_reg_writes
                       );
                       
                       const registerTypes = [
                         { name: 'Int Reads', value: metrics.int_reg_reads, type: 'integer' },
                         { name: 'Int Writes', value: metrics.int_reg_writes, type: 'integer' },
                         { name: 'Float Reads', value: metrics.fp_reg_reads, type: 'float' },
                         { name: 'Float Writes', value: metrics.fp_reg_writes, type: 'float' }
                       ];
                       
                       return registerTypes.map((reg, index) => {
                         const intensity = maxRegValue > 0 ? (reg.value / maxRegValue) * 100 : 0;
                         const temperature = Math.min(intensity, 100);
                         
                         // Different color scheme for registers
                         let color;
                         if (temperature < 25) {
                           color = '#1e40af'; // Deep blue
                         } else if (temperature < 50) {
                           color = '#2563eb'; // Blue
                         } else if (temperature < 75) {
                           color = '#7c3aed'; // Purple
                         } else {
                           color = '#dc2626'; // Red
                         }
                         
                         return (
                           <div 
                             key={index}
                             className="register-heatmap-cell"
                             style={{
                               backgroundColor: color,
                               opacity: 0.7 + (temperature / 100) * 0.3,
                               boxShadow: `0 0 ${temperature / 8}px ${color}, inset 0 0 ${temperature / 15}px rgba(255,255,255,0.3)`,
                               animationDelay: `${index * 0.15}s`
                             }}
                             title={`${reg.name}: ${formatNumber(reg.value)} operations (${temperature.toFixed(1)}% intensity)`}
                           >
                             <div className="register-heatmap-icon">
                               {reg.type === 'integer' ? '🔢' : '🔢'}
                             </div>
                             <div className="register-heatmap-label">{reg.name}</div>
                             <div className="register-heatmap-value">{formatNumber(reg.value)}</div>
                             <div className="register-heatmap-intensity">{temperature.toFixed(1)}%</div>
                           </div>
                         );
                       });
                     })()}
                   </div>
                 </div>
                 
                 {/* Thermal Legend */}
                 <div className="thermal-legend">
                   <h3>🌡️ Thermal Intensity Scale</h3>
                   <div className="legend-scale">
                     <div className="legend-item">
                       <div className="legend-color" style={{backgroundColor: '#1e3a8a'}}></div>
                       <span>Cold (0-20%)</span>
                     </div>
                     <div className="legend-item">
                       <div className="legend-color" style={{backgroundColor: '#3b82f6'}}></div>
                       <span>Cool (20-40%)</span>
                     </div>
                     <div className="legend-item">
                       <div className="legend-color" style={{backgroundColor: '#10b981'}}></div>
                       <span>Warm (40-60%)</span>
                     </div>
                     <div className="legend-item">
                       <div className="legend-color" style={{backgroundColor: '#f59e0b'}}></div>
                       <span>Hot (60-80%)</span>
                     </div>
                     <div className="legend-item">
                       <div className="legend-color" style={{backgroundColor: '#ef4444'}}></div>
                       <span>Very Hot (80-100%)</span>
                     </div>
                   </div>
                 </div>
                 
                 {/* Heatmap Summary */}
                 <div className="heatmap-summary">
                   <h3>🔥 Heatmap Analysis Summary</h3>
                   <div className="summary-grid">
                     <div className="summary-card">
                       <h4>🌡️ Hottest Memory Region</h4>
                       <p>
                         {memorySystemStats && (() => {
                           const regions = [
                             { name: 'Memory Read Requests', value: memorySystemStats['system.mem_ctrls.readReqs'] || 0 },
                             { name: 'Memory Write Requests', value: memorySystemStats['system.mem_ctrls.writeReqs'] || 0 },
                             { name: 'DTLB Read Access', value: memorySystemStats['system.cpu.mmu.dtb.rdAccesses'] || 0 },
                             { name: 'DTLB Write Access', value: memorySystemStats['system.cpu.mmu.dtb.wrAccesses'] || 0 }
                           ];
                           const hottest = regions.reduce((max, region) => region.value > max.value ? region : max);
                           return `${hottest.name}: ${formatNumber(hottest.value)}`;
                         })()}
                       </p>
                     </div>
                     
                     <div className="summary-card">
                       <h4>🔥 Hottest Register Type</h4>
                       <p>
                         {metrics && (() => {
                           const registers = [
                             { name: 'Integer Reads', value: metrics.int_reg_reads },
                             { name: 'Integer Writes', value: metrics.int_reg_writes },
                             { name: 'Float Reads', value: metrics.fp_reg_reads },
                             { name: 'Float Writes', value: metrics.fp_reg_writes }
                           ];
                           const hottest = registers.reduce((max, reg) => reg.value > max.value ? reg : max);
                           return `${hottest.name}: ${formatNumber(hottest.value)}`;
                         })()}
                       </p>
                     </div>
                     
                     <div className="summary-card">
                       <h4>📊 Thermal Distribution</h4>
                       <p>
                         Memory regions show varying thermal patterns based on access frequency. 
                         Hotter regions indicate higher usage and potential bottlenecks.
                       </p>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </main>
         </div>

        {/* Spacing between sections */}
        <div className="section-spacer"></div>

        {/* Eighth Section - Dynamic vs Static Instruction Analysis */}
        <div className="content-section">
          <header className="App-header">
            <h1>⚡ Dynamic vs Static Instruction Analysis</h1>
            <p>Comprehensive instruction analysis with thermal visualization</p>
          </header>
          
          <main className="container">
            <div className="analysis-section">
              {/* Dynamic Analysis Heatmap */}
              <div className="heatmap-section">
                <h2>🔄 Dynamic Instruction Analysis</h2>
                <p className="data-source-info">
                  <strong>Data Source:</strong> stats.txt → Simülasyon sırasında gerçek zamanlı toplanan veriler<br/>
                  <strong>Metrics:</strong> simInsts, simOps, commitStats0, CPI, IPC
                </p>
                
                <div className="heatmap-container">
                  <div className="dynamic-heatmap-grid">
                    {metrics && (() => {
                      const dynamicMetrics = [
                        { name: 'Total Instructions', value: metrics.total_instructions, type: 'instruction', color: '#3b82f6' },
                        { name: 'Total Cycles', value: metrics.total_cycles, type: 'cycle', color: '#1d4ed8' },
                        { name: 'CPI (Cycles/Inst)', value: Math.round(metrics.cpi), type: 'performance', color: '#ef4444' },
                        { name: 'IPC (Inst/Cycle)', value: Math.round(metrics.ipc * 1000000), type: 'performance', color: '#10b981' },
                        { name: 'Memory References', value: metrics.total_memory_refs, type: 'memory', color: '#f59e0b' },
                        { name: 'Load Instructions', value: metrics.total_loads, type: 'memory', color: '#8b5cf6' },
                        { name: 'Store Instructions', value: metrics.total_stores, type: 'memory', color: '#ec4899' },
                        { name: 'Register Operations', value: metrics.int_reg_reads + metrics.fp_reg_reads + metrics.int_reg_writes + metrics.fp_reg_writes, type: 'register', color: '#06b6d4' }
                      ];
                      
                      const maxValue = Math.max(...dynamicMetrics.map(m => m.value));
                      
                      return dynamicMetrics.map((metric, index) => {
                        const intensity = maxValue > 0 ? (metric.value / maxValue) * 100 : 0;
                        const temperature = Math.min(intensity, 100);
                        
                        // Dynamic-specific color mapping
                        let color = metric.color;
                        if (temperature < 20) {
                          color = '#1e3a8a'; // Deep blue
                        } else if (temperature < 40) {
                          color = '#3b82f6'; // Blue
                        } else if (temperature < 60) {
                          color = '#10b981'; // Green
                        } else if (temperature < 80) {
                          color = '#f59e0b'; // Orange
                        } else {
                          color = '#ef4444'; // Red
                        }
                        
                        return (
                          <div 
                            key={index}
                            className="dynamic-heatmap-cell"
                            style={{
                              backgroundColor: color,
                              opacity: 0.8 + (temperature / 100) * 0.2,
                              boxShadow: `0 0 ${temperature / 8}px ${color}`,
                              animationDelay: `${index * 0.1}s`
                            }}
                            title={`${metric.name}: ${formatNumber(metric.value)} (${temperature.toFixed(1)}% intensity)`}
                          >
                            <div className="dynamic-heatmap-icon">
                              {metric.type === 'instruction' ? '📊' : 
                               metric.type === 'cycle' ? '🔄' : 
                               metric.type === 'performance' ? '⚡' : 
                               metric.type === 'memory' ? '💾' : 
                               metric.type === 'register' ? '🔢' : '📈'}
                            </div>
                            <div className="dynamic-heatmap-label">{metric.name}</div>
                            <div className="dynamic-heatmap-value">{formatNumber(metric.value)}</div>
                            <div className="dynamic-heatmap-temperature">{temperature.toFixed(1)}°</div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
              
              {/* Static Analysis Heatmap */}
              <div className="heatmap-section">
                <h2>📋 Static Instruction Analysis</h2>
                <p className="data-source-info">
                  <strong>Data Source:</strong> stats.txt → committedInstType::* (78 farklı instruction type)<br/>
                  <strong>Metrics:</strong> Instruction mix, type distribution, architectural patterns
                </p>
                
                <div className="heatmap-container">
                  <div className="static-heatmap-grid">
                    {instructionTypes && (() => {
                      const staticMetrics = Object.entries(instructionTypes.instruction_types)
                        .sort(([,a], [,b]) => b.count - a.count)
                        .slice(0, 12) // Top 12 instruction types
                        .map(([type, data], index) => {
                          const intensity = instructionTypes.total_instructions > 0 ? (data.count / instructionTypes.total_instructions) * 100 : 0;
                          const temperature = Math.min(intensity * 10, 100); // Scale for better visualization
                          
                          // Static-specific color mapping
                          let color;
                          if (temperature < 10) {
                            color = '#1e40af'; // Deep blue
                          } else if (temperature < 30) {
                            color = '#2563eb'; // Blue
                          } else if (temperature < 50) {
                            color = '#7c3aed'; // Purple
                          } else if (temperature < 70) {
                            color = '#dc2626'; // Red
                          } else {
                            color = '#ea580c'; // Orange-red
                          }
                          
                          return (
                            <div 
                              key={index}
                              className="static-heatmap-cell"
                              style={{
                                backgroundColor: color,
                                opacity: 0.7 + (temperature / 100) * 0.3,
                                boxShadow: `0 0 ${temperature / 6}px ${color}, inset 0 0 ${temperature / 12}px rgba(255,255,255,0.2)`,
                                animationDelay: `${index * 0.08}s`
                              }}
                              title={`${type}: ${formatNumber(data.count)} instructions (${data.percentage}%)`}
                            >
                              <div className="static-heatmap-icon">
                                {type.includes('Int') ? '🔢' : 
                                 type.includes('Float') ? '🔢' : 
                                 type.includes('Mem') ? '💾' : 
                                 type.includes('Simd') ? '⚡' : '📋'}
                              </div>
                              <div className="static-heatmap-label">{type}</div>
                              <div className="static-heatmap-value">{formatNumber(data.count)}</div>
                              <div className="static-heatmap-percentage">{data.percentage}%</div>
                              <div className="static-heatmap-intensity">{temperature.toFixed(1)}°</div>
                            </div>
                          );
                        });
                      
                      return staticMetrics;
                    })()}
                  </div>
                </div>
              </div>
              
              {/* Analysis Comparison */}
              <div className="analysis-comparison">
                <h3>🔍 Dynamic vs Static Analysis Comparison</h3>
                <div className="comparison-grid">
                  <div className="comparison-card dynamic-card">
                    <div className="comparison-header">
                      <h4>🔄 Dynamic Analysis</h4>
                      <div className="comparison-icon">⚡</div>
                    </div>
                    <div className="comparison-content">
                      <p><strong>Purpose:</strong> Runtime performance analysis</p>
                      <p><strong>Data:</strong> Simülasyon sırasında toplanan gerçek metrikler</p>
                      <p><strong>Key Insights:</strong></p>
                      <ul>
                        <li>CPI: {metrics?.cpi.toFixed(2)} (çok yüksek!)</li>
                        <li>IPC: {metrics?.ipc.toFixed(6)} (çok düşük!)</li>
                        <li>Memory Intensity: {metrics ? ((metrics.total_loads + metrics.total_stores) / metrics.total_instructions * 100).toFixed(1) : 0}%</li>
                        <li>Register Intensity: {metrics ? ((metrics.int_reg_reads + metrics.fp_reg_reads) / metrics.total_instructions * 100).toFixed(1) : 0}%</li>
                 </ul>
                   </div>
                 </div>
                  
                  <div className="comparison-card static-card">
                    <div className="comparison-header">
                      <h4>📋 Static Analysis</h4>
                      <div className="comparison-icon">📊</div>
                    </div>
                    <div className="comparison-content">
                      <p><strong>Purpose:</strong> Code structure and instruction mix analysis</p>
                      <p><strong>Data:</strong> Instruction type distribution (78 types)</p>
                      <p><strong>Key Insights:</strong></p>
                      <ul>
                        <li>Architecture: {instructionTypes?.architecture}</li>
                        <li>Total Instructions: {instructionTypes ? formatNumber(instructionTypes.total_instructions) : 0}</li>
                        <li>Integer Operations: {instructionTypes?.instruction_types.IntAlu?.percentage || 0}%</li>
                        <li>Float Operations: {instructionTypes?.instruction_types.FloatAdd?.percentage || 0}%</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Data Sources Legend */}
              <div className="data-sources-legend">
                <h3>📚 Data Sources & Methodology</h3>
                <div className="sources-grid">
                  <div className="source-card">
                    <h4>🔄 Dynamic Data Sources</h4>
                    <ul>
                      <li><strong>stats.txt:</strong> simInsts, simOps, commitStats0</li>
                      <li><strong>Performance:</strong> CPI, IPC, cycles</li>
                      <li><strong>Memory:</strong> Loads, stores, references</li>
                      <li><strong>Registers:</strong> Read/write operations</li>
                    </ul>
                  </div>
                  
                  <div className="source-card">
                    <h4>📋 Static Data Sources</h4>
                    <ul>
                      <li><strong>stats.txt:</strong> committedInstType::* (78 types)</li>
                      <li><strong>Architecture:</strong> ARM instruction set</li>
                      <li><strong>Instruction Mix:</strong> Type distribution</li>
                      <li><strong>Code Analysis:</strong> Structural patterns</li>
                    </ul>
                  </div>
                  
                  <div className="source-card">
                    <h4>🌡️ Heatmap Methodology</h4>
                    <ul>
                      <li><strong>Dynamic:</strong> Usage intensity based on counts</li>
                      <li><strong>Static:</strong> Percentage-based thermal mapping</li>
                      <li><strong>Colors:</strong> Cold (blue) → Hot (red)</li>
                      <li><strong>Animation:</strong> Pulsing thermal effects</li>
                    </ul>
                  </div>
                </div>
               </div>
             </div>
           </main>
         </div>

        {/* Spacing between sections */}
        <div className="section-spacer"></div>

      </div>
      
      {/* Scroll indicators removed - using normal scroll now */}

    </div>
  );
}

export default App;