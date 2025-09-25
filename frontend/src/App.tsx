import React, { useState, useEffect, useRef } from 'react';
import './App.css';

interface BasicMetrics {
  total_instructions: number;
  total_ticks: number;
  total_loads: number;
  total_stores: number;
  total_spills: number;
  spill_percentage: number;
  load_percentage: number;
  store_percentage: number;
}

interface RegisterAnalysis {
  total_registers: number;
  total_spills: number;
  top_10_registers: Array<{
    register: string;
    spill_count: number;
    percentage: number;
    memory_address: string;
    details: {
      avg_tick_diff: number;
      unique_store_pcs: number;
      unique_load_pcs: number;
      first_spill_tick: number;
      last_spill_tick: number;
      spill_duration: number;
      avg_store_inst_count: number;
      avg_load_inst_count: number;
    };
  }>;
  all_registers: Array<{
    register: string;
    spill_count: number;
    percentage: number;
    memory_address: string;
    details: {
      avg_tick_diff: number;
      unique_store_pcs: number;
      unique_load_pcs: number;
      first_spill_tick: number;
      last_spill_tick: number;
      spill_duration: number;
      avg_store_inst_count: number;
      avg_load_inst_count: number;
    };
  }>;
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
  const [registerAnalysis, setRegisterAnalysis] = useState<RegisterAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Data source information
  const dataSources: Record<string, DataSource> = {
    total_instructions: {
      file: "stats.txt",
      line: "system.cpu.numInsts",
      description: "Total number of instructions executed by the CPU"
    },
    total_ticks: {
      file: "stats.txt", 
      line: "system.cpu.numCycles",
      description: "Total CPU cycles (ticks) executed"
    },
    total_loads: {
      file: "stats.txt",
      line: "system.cpu.commitStats0.numLoadInsts",
      description: "Total load instructions executed"
    },
    total_stores: {
      file: "stats.txt",
      line: "system.cpu.commitStats0.numStoreInsts", 
      description: "Total store instructions executed"
    },
    total_spills: {
      file: "x86_spill_stats.txt",
      line: "Total spills",
      description: "Total register spills detected"
    },
    load_percentage: {
      file: "Calculated",
      formula: "(total_loads / total_instructions) × 100",
      description: "Percentage of load instructions relative to total instructions"
    },
    store_percentage: {
      file: "Calculated", 
      formula: "(total_stores / total_instructions) × 100",
      description: "Percentage of store instructions relative to total instructions"
    },
    spill_percentage: {
      file: "Calculated",
      formula: "(total_spills / total_instructions) × 100", 
      description: "Percentage of register spills relative to total instructions"
    }
  };

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
        
        // Fetch register analysis
        const analysisResponse = await fetch('http://localhost:5002/api/register-analysis');
        if (!analysisResponse.ok) {
          throw new Error(`HTTP error! status: ${analysisResponse.status}`);
        }
        const analysisResult: ApiResponse<RegisterAnalysis> = await analysisResponse.json();
        
        if (analysisResult.success) {
          setRegisterAnalysis(analysisResult.data);
        } else {
          setError('Failed to fetch register analysis');
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
        {/* First Section - Basic Metrics */}
        <div className="content-section">
      <header className="App-header">
            <h1>📊 Gem5 Statistics</h1>
            <p>Basic metrics from m5out files</p>
      </header>
      
      <main className="container">
        <div className="metrics-grid">
          <div className="metric-card">
                <div className="metric-header">
            <h3>Total Instructions</h3>
                  <button 
                    className="info-button"
                    onMouseEnter={() => setShowTooltip('total_instructions')}
                    onMouseLeave={() => setShowTooltip(null)}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowTooltip('total_instructions');
                    }}
                  >
                    ℹ️
                  </button>
                </div>
            <div className="metric-value">
                  {formatNumber(metrics.total_instructions)}
                </div>
                <div className="metric-full">
              {metrics.total_instructions.toLocaleString()}
            </div>
          </div>
          
          <div className="metric-card">
                <div className="metric-header">
            <h3>Total Ticks</h3>
                  <button 
                    className="info-button"
                    onMouseEnter={() => setShowTooltip('total_ticks')}
                    onMouseLeave={() => setShowTooltip(null)}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowTooltip('total_ticks');
                    }}
                  >
                    ℹ️
                  </button>
                </div>
            <div className="metric-value">
                  {formatNumber(metrics.total_ticks)}
                </div>
                <div className="metric-full">
              {metrics.total_ticks.toLocaleString()}
            </div>
          </div>
          
          <div className="metric-card">
                <div className="metric-header">
            <h3>Total Loads</h3>
                  <button 
                    className="info-button"
                    onMouseEnter={() => setShowTooltip('total_loads')}
                    onMouseLeave={() => setShowTooltip(null)}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowTooltip('total_loads');
                    }}
                  >
                    ℹ️
                  </button>
                </div>
            <div className="metric-value">
                  {formatNumber(metrics.total_loads)}
                </div>
                <div className="metric-full">
              {metrics.total_loads.toLocaleString()}
            </div>
          </div>
          
          <div className="metric-card">
                <div className="metric-header">
            <h3>Total Stores</h3>
                  <button 
                    className="info-button"
                    onMouseEnter={() => setShowTooltip('total_stores')}
                    onMouseLeave={() => setShowTooltip(null)}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowTooltip('total_stores');
                    }}
                  >
                    ℹ️
                  </button>
                </div>
            <div className="metric-value">
                  {formatNumber(metrics.total_stores)}
                </div>
                <div className="metric-full">
              {metrics.total_stores.toLocaleString()}
            </div>
          </div>
          
          <div className="metric-card">
                <div className="metric-header">
            <h3>Total Spills</h3>
                  <button 
                    className="info-button"
                    onMouseEnter={() => setShowTooltip('total_spills')}
                    onMouseLeave={() => setShowTooltip(null)}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowTooltip('total_spills');
                    }}
                  >
                    ℹ️
                  </button>
                </div>
            <div className="metric-value">
                  {formatNumber(metrics.total_spills)}
                </div>
                <div className="metric-full">
              {metrics.total_spills.toLocaleString()}
            </div>
              </div>
            </div>
          </main>
        </div>

        {/* Spacing between sections */}
        <div className="section-spacer">         </div>

         {/* Second Section - Performance Ratios */}
         <div className="content-section">
           <header className="App-header">
             <h1>📈 Performance Ratios</h1>
             <p>Instruction distribution and spill analysis</p>
           </header>
           
           <main className="container">
             <div className="ratios-grid">
               <div className="ratio-card">
                 <div className="metric-header">
                   <h3>Load Instructions</h3>
                   <button 
                     className="info-button"
                     onMouseEnter={() => setShowTooltip('load_percentage')}
                     onMouseLeave={() => setShowTooltip(null)}
                     onClick={(e) => {
                       e.preventDefault();
                       e.stopPropagation();
                       setShowTooltip('load_percentage');
                     }}
                   >
                     ℹ️
                   </button>
                 </div>
                 <div className="ratio-value">{metrics.load_percentage.toFixed(2)}%</div>
                 <div className="metric-full">of total instructions</div>
               </div>
               
               <div className="ratio-card">
                 <div className="metric-header">
                   <h3>Store Instructions</h3>
                   <button 
                     className="info-button"
                     onMouseEnter={() => setShowTooltip('store_percentage')}
                     onMouseLeave={() => setShowTooltip(null)}
                     onClick={(e) => {
                       e.preventDefault();
                       e.stopPropagation();
                       setShowTooltip('store_percentage');
                     }}
                   >
                     ℹ️
                   </button>
                 </div>
                 <div className="ratio-value">{metrics.store_percentage.toFixed(2)}%</div>
                 <div className="metric-full">of total instructions</div>
               </div>
               
               <div className="ratio-card">
                 <div className="metric-header">
                   <h3>Register Spills</h3>
                   <button 
                     className="info-button"
                     onMouseEnter={() => setShowTooltip('spill_percentage')}
                     onMouseLeave={() => setShowTooltip(null)}
                     onClick={(e) => {
                       e.preventDefault();
                       e.stopPropagation();
                       setShowTooltip('spill_percentage');
                     }}
                   >
                     ℹ️
                   </button>
                 </div>
                 <div className="ratio-value">{metrics.spill_percentage.toFixed(2)}%</div>
                 <div className="metric-full">of total instructions</div>
               </div>
             </div>
             
             <div className="summary">
               <h3>Summary</h3>
               <p>
                 Out of {metrics.total_instructions.toLocaleString()} total instructions:<br/>
                 {metrics.load_percentage.toFixed(2)}% are load instructions<br/>
                 {metrics.store_percentage.toFixed(2)}% are store instructions<br/>
                 {metrics.spill_percentage.toFixed(2)}% caused register spills
               </p>
             </div>
           </main>
         </div>

         {/* Third Section - Deep Register Analysis */}
         <div className="content-section">
           <header className="App-header">
             <h1>🔍 Deep Register Analysis</h1>
             <p>Top spill registers and distribution analysis</p>
           </header>
          
          <main className="container">
            {registerAnalysis && (
              <>
                {/* Top 10 Registers */}
                <div className="analysis-section confetti-section">
                  <h2>🏆 Top 10 Spill Registers</h2>
                  {/* Test confetti - simple version */}
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
                    {Array.from({ length: 15 }, (_, i) => (
                      <div
                        key={i}
                        style={{
                          position: 'absolute',
                          width: '10px',
                          height: '10px',
                          backgroundColor: ['#3b82f6', '#6366f1', '#fbbf24'][i % 3],
                          left: `${(i * 7) % 100}%`,
                          animation: `confetti-fall ${2 + (i % 3)}s linear infinite`,
                          animationDelay: `${i * 0.2}s`,
                          borderRadius: '2px'
                        }}
                      />
                    ))}
                  </div>
                   <div className="registers-list">
                     {registerAnalysis.top_10_registers.map((reg, index) => {
                       // Determine medal class for top 3
                       let medalClass = '';
                       let rankClass = '';
                       let medalEmoji = '';
                       
                       if (index === 0) {
                         medalClass = 'medal-gold';
                         rankClass = 'medal-gold';
                         medalEmoji = '🏆';
                       } else if (index === 1) {
                         medalClass = 'medal-silver';
                         rankClass = 'medal-silver';
                         medalEmoji = '🥈';
                       } else if (index === 2) {
                         medalClass = 'medal-bronze';
                         rankClass = 'medal-bronze';
                         medalEmoji = '🥉';
                       }
                       
                       return (
                         <div key={reg.register} className={`register-item ${medalClass}`}>
                           <div className={`register-rank ${rankClass}`}>
                             {medalEmoji} #{index + 1}
                           </div>
                           <div className="register-info">
                             <div className="register-name">{reg.register}</div>
                             <div className="register-stats">
                               <span className="spill-count">{formatNumber(reg.spill_count)} spills</span>
                               <span className="spill-percentage">{reg.percentage}%</span>
                             </div>
                             <div className="register-details">
                               <div className="detail-row">
                                 <span className="detail-label">Memory Address:</span>
                                 <span className="detail-value">{reg.memory_address}</span>
                               </div>
                               <div className="detail-row">
                                 <span className="detail-label">Avg Tick Diff:</span>
                                 <span className="detail-value">{formatNumber(reg.details.avg_tick_diff)}</span>
                               </div>
                               <div className="detail-row">
                                 <span className="detail-label">Unique Store PCs:</span>
                                 <span className="detail-value">{reg.details.unique_store_pcs}</span>
                               </div>
                               <div className="detail-row">
                                 <span className="detail-label">Unique Load PCs:</span>
                                 <span className="detail-value">{reg.details.unique_load_pcs}</span>
                               </div>
                               <div className="detail-row">
                                 <span className="detail-label">Spill Duration:</span>
                                 <span className="detail-value">{formatNumber(reg.details.spill_duration)} ticks</span>
                               </div>
                             </div>
                           </div>
                           <div className="register-bar">
                             <div 
                               className="register-bar-fill" 
                               style={{ width: `${reg.percentage}%` }}
                             ></div>
                           </div>
                         </div>
                       );
                     })}
                   </div>
                </div>

                {/* Distribution Chart */}
                <div className="analysis-section">
                  <h2>📊 Spill Distribution Chart</h2>
                  <div className="chart-container">
                    <div className="chart-bars">
                      {registerAnalysis.top_10_registers.map((reg, index) => (
                        <div key={reg.register} className="chart-bar">
                          <div className="bar-container">
                            <div 
                              className="bar-fill" 
                              style={{ 
                                height: `${(reg.spill_count / registerAnalysis.top_10_registers[0].spill_count) * 100}%` 
                              }}
                            ></div>
                          </div>
                          <div className="bar-label">{reg.register}</div>
                          <div className="bar-value">{formatNumber(reg.spill_count)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                 {/* Summary Stats */}
                 <div className="analysis-summary">
                   <h2>📈 Analysis Summary</h2>
                   <div className="summary-stats">
                     <div className="summary-stat">
                       <div className="stat-value">{registerAnalysis.total_registers}</div>
                       <div className="stat-label">Total Registers</div>
                     </div>
                     <div className="summary-stat">
                       <div className="stat-value">{formatNumber(registerAnalysis.total_spills)}</div>
                       <div className="stat-label">Total Spills</div>
                     </div>
                     <div className="summary-stat">
                       <div className="stat-value">
                         {registerAnalysis.top_10_registers.length > 0 
                           ? registerAnalysis.top_10_registers[0].register 
                           : 'N/A'
                         }
                       </div>
                       <div className="stat-label">Most Spilled Register</div>
                     </div>
                   </div>
                 </div>
               </>
             )}
           </main>
         </div>

         {/* Fourth Section - Dot Distribution Analysis */}
         <div className="content-section">
           <header className="App-header">
             <h1>🔵 Dot Distribution Analysis</h1>
             <p>Spill pattern visualization and distribution analysis</p>
           </header>
           
           <main className="container">
             <div className="analysis-section">
               <h2>🚧 Coming Soon</h2>
               <div className="coming-soon-card">
                 <div className="coming-soon-icon">🔵</div>
                 <h3>Dot Distribution Analysis</h3>
                 <p>This section will show:</p>
                 <ul>
                   <li>📊 Spill pattern visualization</li>
                   <li>🔍 Memory address distribution</li>
                   <li>📈 Temporal spill analysis</li>
                   <li>🎯 Hotspot identification</li>
                 </ul>
                 <div className="progress-indicator">
                   <div className="progress-bar">
                     <div className="progress-fill" style={{ width: '25%' }}></div>
                   </div>
                   <span>25% Complete</span>
                 </div>
               </div>
             </div>
           </main>
         </div>

        {/* Spacing between sections */}
        <div className="section-spacer"></div>

      </div>
      
      {/* Scroll indicators removed - using normal scroll now */}

      {/* Tooltip */}
      {showTooltip && (
        <div className="tooltip">
          <div className="tooltip-content">
            <h4>{dataSources[showTooltip].file}</h4>
            {dataSources[showTooltip].line && (
              <p><strong>Source:</strong> {dataSources[showTooltip].line}</p>
            )}
            {dataSources[showTooltip].formula && (
              <p><strong>Formula:</strong> {dataSources[showTooltip].formula}</p>
            )}
            <p><strong>Description:</strong> {dataSources[showTooltip].description}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;