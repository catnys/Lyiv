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

interface ScatterPlotData {
  x: number;
  y: number;
  group: string;
  color: string;
  size: number;
  details: Record<string, any>;
}

interface ScatterPlot {
  title: string;
  x_label: string;
  y_label: string;
  description: string;
  data: ScatterPlotData[];
}

interface ScatterPlots {
  memory_performance: ScatterPlot;
  cache_performance: ScatterPlot;
  instruction_performance: ScatterPlot;
}

interface SpillEvent {
  store_pc: string;
  load_pc: string;
  memory_address: string;
  store_tick: number;
  load_tick: number;
  tick_diff: number;
  store_inst_count: number;
  load_inst_count: number;
  line_number: number;
}

interface SpillAnalysis {
  spill_count: number;
  architecture: string;
  spill_file: string;
  statistics: {
    total_spills: number;
    avg_spill_duration: number;
    unique_memory_addresses: number;
    unique_store_pcs: number;
    unique_load_pcs: number;
    max_spill_duration: number;
    min_spill_duration: number;
  };
  charts: {
    spill_duration_distribution: {
      title: string;
      description: string;
      buckets: Array<{
        range: string;
        count: number;
        percentage: number;
        start: number;
        end: number;
      }>;
      total_spills: number;
      avg_duration: number;
      min_duration: number;
      max_duration: number;
    };
    memory_address_distribution: {
      title: string;
      description: string;
      data: Array<{
        range: string;
        count: number;
        percentage: number;
        start: number;
        end: number;
      }>;
      unique_addresses: number;
      total_spills: number;
    };
    instruction_distance_analysis: {
      title: string;
      description: string;
      buckets: Array<{
        range: string;
        count: number;
        percentage: number;
        start: number;
        end: number;
      }>;
      avg_distance: number;
      min_distance: number;
      max_distance: number;
    };
    pc_pattern_analysis: {
      title: string;
      description: string;
      patterns: {
        top_store_pcs: Array<{pc: string; count: number}>;
        top_load_pcs: Array<{pc: string; count: number}>;
      };
      total_unique_pcs: number;
    };
            timeline_analysis: {
              title: string;
              description: string;
              data: Array<{
                time_window: string;
                count: number;
                start_time: number;
                end_time: number;
              }>;
              total_time_span: number;
            };
            scatter_plot_data: {
              title: string;
              description: string;
              data: Array<{
                id: string;
                duration: number;
                memory_address: number;
                pc: string;
                load_pc?: string;
                store_pc?: string;
                impact_level: 'critical' | 'high-impact' | 'medium-impact' | 'low-impact' | 'normal';
              }>;
              total_points: number;
            };
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
  const [spillAnalysis, setSpillAnalysis] = useState<SpillAnalysis | null>(null);
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
        const metricsResponse = await fetch('http://localhost:5050/api/basic-metrics');
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
        const instructionTypesResponse = await fetch('http://localhost:5050/api/instruction-types');
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
        const memorySystemResponse = await fetch('http://localhost:5050/api/memory-system');
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
        const efficiencyResponse = await fetch('http://localhost:5050/api/efficiency-metrics');
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
        const cacheResponse = await fetch('http://localhost:5050/api/cache-metrics');
        if (!cacheResponse.ok) {
          throw new Error(`HTTP error! status: ${cacheResponse.status}`);
        }
        const cacheResult: ApiResponse<CacheMetrics> = await cacheResponse.json();
        
        if (cacheResult.success) {
          setCacheMetrics(cacheResult.data);
        } else {
          setError('Failed to fetch cache metrics');
        }
        
        // Fetch spill analysis data
        const spillResponse = await fetch('http://localhost:5050/api/spill-analysis');
        if (!spillResponse.ok) {
          throw new Error(`HTTP error! status: ${spillResponse.status}`);
        }
        const spillResult: ApiResponse<SpillAnalysis> = await spillResponse.json();
        
        if (spillResult.success) {
          setSpillAnalysis(spillResult.data);
        } else {
          setError('Failed to fetch spill analysis data');
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

  // Scatter Plot Component
  const ScatterPlot: React.FC<{ plot: ScatterPlot; isDarkTheme: boolean }> = ({ plot, isDarkTheme }) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [tooltip, setTooltip] = useState<{ show: boolean; x: number; y: number; content: any }>({
      show: false,
      x: 0,
      y: 0,
      content: null
    });

    useEffect(() => {
      if (!canvasRef.current || !plot.data.length) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width - 40; // padding
      const height = rect.height - 40; // padding

      // Calculate scales
      const xValues = plot.data.map(d => d.x);
      const yValues = plot.data.map(d => d.y);
      const xMin = Math.min(...xValues);
      const xMax = Math.max(...xValues);
      const yMin = Math.min(...yValues);
      const yMax = Math.max(...yValues);

      const xScale = (x: number) => 20 + ((x - xMin) / (xMax - xMin)) * (width - 40);
      const yScale = (y: number) => 20 + ((yMax - y) / (yMax - yMin)) * (height - 40);

      // Clear canvas
      canvas.innerHTML = '';

      // Create grid lines
      const gridContainer = document.createElement('div');
      gridContainer.className = 'scatter-plot-grid-lines';
      
      // Horizontal grid lines
      for (let i = 0; i <= 5; i++) {
        const line = document.createElement('div');
        line.className = 'scatter-plot-grid-line horizontal';
        line.style.top = `${20 + (i * (height - 40) / 5)}px`;
        gridContainer.appendChild(line);
      }

      // Vertical grid lines
      for (let i = 0; i <= 5; i++) {
        const line = document.createElement('div');
        line.className = 'scatter-plot-grid-line vertical';
        line.style.left = `${20 + (i * (width - 40) / 5)}px`;
        gridContainer.appendChild(line);
      }

      canvas.appendChild(gridContainer);

      // Create points
      plot.data.forEach((point, index) => {
        const pointElement = document.createElement('div');
        pointElement.className = 'scatter-plot-point';
        pointElement.style.left = `${xScale(point.x)}px`;
        pointElement.style.top = `${yScale(point.y)}px`;
        pointElement.style.width = `${point.size}px`;
        pointElement.style.height = `${point.size}px`;
        pointElement.style.backgroundColor = point.color;
        pointElement.style.animationDelay = `${index * 0.1}s`;

        pointElement.addEventListener('mouseenter', (e) => {
          setTooltip({
            show: true,
            x: e.clientX,
            y: e.clientY,
            content: point
          });
        });

        pointElement.addEventListener('mouseleave', () => {
          setTooltip(prev => ({ ...prev, show: false }));
        });

        canvas.appendChild(pointElement);
      });

    }, [plot.data]);

    useEffect(() => {
      if (tooltip.show && tooltipRef.current) {
        tooltipRef.current.style.left = `${tooltip.x + 10}px`;
        tooltipRef.current.style.top = `${tooltip.y - 10}px`;
      }
    }, [tooltip]);

    return (
      <div className="scatter-plot-container">
        <div className="scatter-plot-header">
          <div>
            <h4 className="scatter-plot-title">{plot.title}</h4>
            <p className="scatter-plot-description">{plot.description}</p>
          </div>
        </div>
        
        <div className="scatter-plot-canvas" ref={canvasRef}>
          <div className="scatter-plot-x-axis">{plot.x_label}</div>
          <div className="scatter-plot-y-axis">{plot.y_label}</div>
        </div>

        <div className="scatter-plot-legend">
          {plot.data.map((point, index) => (
            <div key={index} className="scatter-plot-legend-item">
              <div 
                className="scatter-plot-legend-color" 
                style={{ backgroundColor: point.color }}
              />
              <span>{point.group}</span>
            </div>
          ))}
        </div>

        <div 
          ref={tooltipRef}
          className={`scatter-plot-tooltip ${tooltip.show ? 'show' : ''}`}
        >
          {tooltip.content && (
            <>
              <h4>{tooltip.content.group}</h4>
              <p><strong>X:</strong> {tooltip.content.x.toFixed(2)}</p>
              <p><strong>Y:</strong> {tooltip.content.y.toFixed(2)}</p>
              {Object.entries(tooltip.content.details).map(([key, value]) => (
                <p key={key}><strong>{key}:</strong> {String(value)}</p>
              ))}
            </>
          )}
        </div>
      </div>
    );
  };

  // Histogram Chart Component
  const HistogramChart: React.FC<{
    title: string;
    description: string;
    buckets: Array<{
      range: string;
      count: number;
      percentage: number;
      start: number;
      end: number;
    }>;
    isDarkTheme: boolean;
  }> = ({ title, description, buckets, isDarkTheme }) => {
    const maxCount = Math.max(...buckets.map(b => b.count));
    
    return (
      <div className="chart-container">
        <div className="chart-header">
          <div>
            <h4 className="chart-title">{title}</h4>
            <p className="chart-description">{description}</p>
          </div>
        </div>
        
        <div className="histogram-chart">
          {buckets.map((bucket, index) => (
            <div key={index} className="histogram-bar">
              <div className="histogram-label">{bucket.range}</div>
              <div className="histogram-bar-container">
                <div 
                  className="histogram-bar-fill"
                  style={{ width: `${(bucket.count / maxCount) * 100}%` }}
                />
              </div>
              <div className="histogram-value">{bucket.count}</div>
              <div className="histogram-percentage">{bucket.percentage.toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // PC Pattern Chart Component
  const PCPatternChart: React.FC<{
    title: string;
    description: string;
    patterns: {
      top_store_pcs: Array<{pc: string; count: number}>;
      top_load_pcs: Array<{pc: string; count: number}>;
    };
    isDarkTheme: boolean;
  }> = ({ title, description, patterns, isDarkTheme }) => {
    const pcPatternData = patterns;
    const [expandedItems, setExpandedItems] = useState<{[key: string]: boolean}>({});

    const getMedalIcon = (index: number) => {
      if (index === 0) return '🥇';
      if (index === 1) return '🥈';
      if (index === 2) return '🥉';
      return `${index + 1}.`;
    };

    const getMedalClass = (index: number) => {
      if (index === 0) return 'gold-medal';
      if (index === 1) return 'silver-medal';
      if (index === 2) return 'bronze-medal';
      return 'regular-rank';
    };

    const toggleExpanded = (key: string) => {
      setExpandedItems(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    };

    const getSpillDetails = (pc: string, count: number, type: 'store' | 'load') => {
      // First 5 spill events from x86_spill_stats.txt
      const spillEvents = [
        { store_pc: '7ffff801f266', load_pc: '7ffff801f323', memory_address: '7ffff8037c10', store_tick: '16364000', load_tick: '19869000', tick_diff: '3505000', store_inst_count: '380', load_inst_count: '459' },
        { store_pc: '7ffff801f266', load_pc: '7ffff801f346', memory_address: '7ffff8037cb8', store_tick: '15522000', load_tick: '20498000', tick_diff: '4976000', store_inst_count: '367', load_inst_count: '475' },
        { store_pc: '7ffff801f266', load_pc: '7ffff801f40d', memory_address: '7ffff8037c18', store_tick: '17498000', load_tick: '22721000', tick_diff: '5223000', store_inst_count: '406', load_inst_count: '528' },
        { store_pc: '7ffff801f266', load_pc: '7ffff801f43d', memory_address: '7ffff8037c60', store_tick: '14262000', load_tick: '23891000', tick_diff: '9629000', store_inst_count: '335', load_inst_count: '549' },
        { store_pc: '7ffff801f332', load_pc: '7ffff801f477', memory_address: '7ffff8036f50', store_tick: '20134000', load_tick: '24919000', tick_diff: '4785000', store_inst_count: '467', load_inst_count: '576' }
      ];
      
      const impact = count > 1000 ? 'Critical' : count > 500 ? 'High' : count > 100 ? 'Medium' : 'Low';
      const frequency = count > 500 ? 'Very Frequent' : count > 100 ? 'Frequent' : count > 50 ? 'Occasional' : 'Rare';
      
      return {
        impact,
        frequency,
        spillEvents,
        type: type === 'store' ? 'Memory Write' : 'Memory Read',
        efficiency: count > 1000 ? 'Poor' : count > 500 ? 'Fair' : count > 100 ? 'Good' : 'Excellent'
      };
    };

    return (
      <div className="chart-container">
        <div className="chart-header">
          <div style={{ textAlign: 'center' }}>
            <h4 className="chart-title">🏆 {title}</h4>
            <p className="chart-description">{description}</p>
          </div>
        </div>
        
        <div className="pc-pattern-chart">
          <div className="pc-pattern-section">
            <div className="pc-pattern-title">Top Store PCs</div>
            {patterns.top_store_pcs.slice(0, 5).map((item, index) => {
              const key = `store-${index}`;
              const isExpanded = expandedItems[key];
              const details = getSpillDetails(item.pc, item.count, 'store');
              
              return (
                <div key={index}>
                  <div 
                    className={`pc-pattern-item ${getMedalClass(index)} ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => toggleExpanded(key)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="pc-pattern-rank">
                      <span className="medal-icon">{getMedalIcon(index)}</span>
                    </div>
                    <div className="pc-pattern-pc">{item.pc}</div>
                    <div className="pc-pattern-count">{item.count}</div>
                    <div className="expand-icon">{isExpanded ? '▲' : '▼'}</div>
                  </div>
                  {isExpanded && (
                    <div className="pc-pattern-details">
                      {details.spillEvents && (
                        <div className="spill-events-list">
                          <div className="detail-label" style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>First 5 Spill Events:</div>
                          {details.spillEvents.map((event: any, index: number) => (
                            <div key={index} className="spill-event-item" style={{ marginBottom: '0.5rem', padding: '0.5rem', background: 'var(--bg)', borderRadius: '4px', fontSize: '0.8rem' }}>
                              <div><strong>Event {index + 1}:</strong></div>
                              <div>Store PC: {event.store_pc} | Load PC: {event.load_pc}</div>
                              <div>Memory: {event.memory_address}</div>
                              <div>Ticks: {event.store_tick} → {event.load_tick} (diff: {event.tick_diff})</div>
                              <div>Inst Count: {event.store_inst_count} → {event.load_inst_count}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="detail-row">
                        <span className="detail-label">Operation Type:</span>
                        <span className="detail-value">{details.type}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="pc-pattern-section">
            <div className="pc-pattern-title">Top Load PCs</div>
            {patterns.top_load_pcs.slice(0, 5).map((item, index) => {
              const key = `load-${index}`;
              const isExpanded = expandedItems[key];
              const details = getSpillDetails(item.pc, item.count, 'load');
              
              return (
                <div key={index}>
                  <div 
                    className={`pc-pattern-item ${getMedalClass(index)} ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => toggleExpanded(key)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="pc-pattern-rank">
                      <span className="medal-icon">{getMedalIcon(index)}</span>
                    </div>
                    <div className="pc-pattern-pc">{item.pc}</div>
                    <div className="pc-pattern-count">{item.count}</div>
                    <div className="expand-icon">{isExpanded ? '▲' : '▼'}</div>
                  </div>
                  {isExpanded && (
                    <div className="pc-pattern-details">
                      {details.spillEvents && (
                        <div className="spill-events-list">
                          <div className="detail-label" style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>First 5 Spill Events:</div>
                          {details.spillEvents.map((event: any, index: number) => (
                            <div key={index} className="spill-event-item" style={{ marginBottom: '0.5rem', padding: '0.5rem', background: 'var(--bg)', borderRadius: '4px', fontSize: '0.8rem' }}>
                              <div><strong>Event {index + 1}:</strong></div>
                              <div>Store PC: {event.store_pc} | Load PC: {event.load_pc}</div>
                              <div>Memory: {event.memory_address}</div>
                              <div>Ticks: {event.store_tick} → {event.load_tick} (diff: {event.tick_diff})</div>
                              <div>Inst Count: {event.store_inst_count} → {event.load_inst_count}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="detail-row">
                        <span className="detail-label">Operation Type:</span>
                        <span className="detail-value">{details.type}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

// Timeline Chart Component
const TimelineChart: React.FC<{
  title: string;
  description: string;
  data: Array<{
    time_window: string;
    count: number;
    start_time: number;
    end_time: number;
  }>;
  isDarkTheme: boolean;
}> = ({ title, description, data, isDarkTheme }) => {
  const maxCount = Math.max(...data.map(d => d.count));
  
  return (
    <div className="chart-container">
      <div className="chart-header">
        <div>
          <h4 className="chart-title">{title}</h4>
          <p className="chart-description">{description}</p>
        </div>
      </div>
      
      <div className="timeline-chart">
        {data.map((item, index) => (
          <div key={index} className="timeline-item">
            <div className="timeline-time">{item.time_window}</div>
            <div className="timeline-bar-container">
              <div 
                className="timeline-bar-fill"
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </div>
            <div className="timeline-count">{item.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Modern Performance Radar Chart Component
const PerformanceRadarChart: React.FC<{
  title: string;
  description: string;
  data: {
    spill_count: number;
    avg_duration: number;
    unique_addresses: number;
    performance_impact: number;
    efficiency_score: number;
  };
  isDarkTheme: boolean;
}> = ({ title, description, data, isDarkTheme }) => {
  return (
    <div className="chart-container">
      <div className="chart-header">
        <div>
          <h4 className="chart-title">{title}</h4>
          <p className="chart-description">{description}</p>
        </div>
      </div>
      
      <div className="performance-radar-container">
        <div className="performance-radar">
          <div className="performance-radar-center">
            <div className="performance-radar-center-icon">⚡</div>
            <div className="performance-radar-center-text">Performance</div>
          </div>
        </div>
      </div>
      
      <div className="performance-metrics-grid">
        <div className="performance-metric-card">
          <div className="performance-metric-icon">🔥</div>
          <div className="performance-metric-title">Spill Count</div>
          <div className="performance-metric-value">{formatNumber(data.spill_count)}</div>
          <div className="performance-metric-description">Total spill events detected</div>
        </div>
        
        <div className="performance-metric-card">
          <div className="performance-metric-icon">⏱️</div>
          <div className="performance-metric-title">Avg Duration</div>
          <div className="performance-metric-value">{data.avg_duration.toFixed(0)}</div>
          <div className="performance-metric-description">Average spill duration (ticks)</div>
        </div>
        
        <div className="performance-metric-card">
          <div className="performance-metric-icon">📍</div>
          <div className="performance-metric-title">Unique Addresses</div>
          <div className="performance-metric-value">{formatNumber(data.unique_addresses)}</div>
          <div className="performance-metric-description">Distinct memory locations</div>
        </div>
        
        <div className="performance-metric-card">
          <div className="performance-metric-icon">📊</div>
          <div className="performance-metric-title">Performance Impact</div>
          <div className="performance-metric-value">{data.performance_impact.toFixed(1)}%</div>
          <div className="performance-metric-description">Performance degradation</div>
        </div>
        
        <div className="performance-metric-card">
          <div className="performance-metric-icon">🎯</div>
          <div className="performance-metric-title">Efficiency Score</div>
          <div className="performance-metric-value">{data.efficiency_score.toFixed(1)}</div>
          <div className="performance-metric-description">Overall efficiency rating</div>
        </div>
      </div>
    </div>
  );
};

// Modern Donut Chart Component
const ModernDonutChart: React.FC<{
  title: string;
  description: string;
  data: { spill: number; normal: number; total: number };
  isDarkTheme: boolean;
}> = ({ title, description, data, isDarkTheme }) => {
  const spillAngle = (data.spill / data.total) * 360;
  const spillPercentage = ((data.spill / data.total) * 100).toFixed(1);
  const normalPercentage = ((data.normal / data.total) * 100).toFixed(1);

  return (
    <div className="chart-container">
      <div className="chart-header">
        <div>
          <h4 className="chart-title">{title}</h4>
          <p className="chart-description">{description}</p>
        </div>
      </div>
      
      <div className="donut-chart-container">
        <div 
          className="donut-chart"
          style={{ '--spill-angle': `${spillAngle}deg` } as React.CSSProperties}
        >
          <div className="donut-chart-center">
            <div className="donut-chart-center-value">{spillPercentage}%</div>
            <div className="donut-chart-center-label">Spill Impact</div>
          </div>
        </div>
        
        <div className="donut-chart-legend">
          <div className="donut-chart-legend-item">
            <div className="donut-chart-legend-color spill" />
            <div>
              <div>Spill Events</div>
              <div className="donut-chart-legend-value">{formatNumber(data.spill)}</div>
            </div>
          </div>
          <div className="donut-chart-legend-item">
            <div className="donut-chart-legend-color normal" />
            <div>
              <div>Normal Events</div>
              <div className="donut-chart-legend-value">{formatNumber(data.normal)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Heatmap Chart Component
const HeatmapChart: React.FC<{
  title: string;
  description: string;
  data: Array<{
    range: string;
    count: number;
    percentage: number;
    start: number;
    end: number;
  }>;
  isDarkTheme: boolean;
}> = ({ title, description, data, isDarkTheme }) => {
  const maxCount = Math.max(...data.map(d => d.count));
  
  // Create a 10x10 grid for heatmap visualization
  const gridData = Array.from({ length: 100 }, (_, index) => {
    const dataIndex = Math.floor((index / 100) * data.length);
    const item = data[dataIndex] || { count: 0, range: 'N/A' };
    const intensity = item.count / maxCount;
    
    return {
      intensity,
      count: item.count,
      range: item.range,
      index
    };
  });

  const getHeatmapColor = (intensity: number) => {
    if (intensity === 0) return '#374151';
    if (intensity < 0.2) return '#3b82f6';
    if (intensity < 0.4) return '#10b981';
    if (intensity < 0.6) return '#f59e0b';
    if (intensity < 0.8) return '#ef4444';
    return '#8b5cf6';
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <div>
          <h4 className="chart-title">{title}</h4>
          <p className="chart-description">{description}</p>
        </div>
      </div>
      
      <div className="heatmap-grid">
        {gridData.map((cell) => (
          <div
            key={cell.index}
            className="heatmap-cell"
            style={{ 
              backgroundColor: getHeatmapColor(cell.intensity),
              opacity: cell.intensity > 0 ? 0.8 : 0.3
            }}
          >
            <div className="heatmap-cell-tooltip">
              {cell.range}: {cell.count} spills
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        Heatmap showing spill distribution intensity across different ranges
      </div>
    </div>
  );
};

// Spill Event Timeline Component
const SpillEventTimeline: React.FC<{
  title: string;
  description: string;
  data: Array<{
    id: string;
    duration: number;
    memory_address: number;
    pc: string;
    load_pc?: string;
    store_pc?: string;
    impact_level: 'critical' | 'high-impact' | 'medium-impact' | 'low-impact' | 'normal';
  }>;
  isDarkTheme: boolean;
}> = ({ title, description, data, isDarkTheme }) => {
  const [hoveredPoint, setHoveredPoint] = React.useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = React.useState({ x: 0, y: 0 });

  // Sort data by time and create timeline
  const sortedData = [...data].sort((a, b) => a.duration - b.duration);
  const minTime = 0; // Always start from 0
  const maxTime = 1000; // Always end at 1000
  const timeRange = maxTime - minTime;

  // Scale data to canvas coordinates (420px width, 420px height after padding)
  const scaleX = (value: number) => {
    return ((value - minTime) / timeRange) * 420;
  };

  const scaleY = (value: number) => {
    return 420 - ((value / data.length) * 420); // Invert Y for timeline
  };

  // Group spills by time intervals for line chart
  const timeIntervals = 20;
  const timeStep = 1000 / timeIntervals;
  const spillCounts = Array.from({ length: timeIntervals }, (_, i) => {
    const startTime = i * timeStep;
    const endTime = (i + 1) * timeStep;
    return data.filter(d => d.duration >= startTime && d.duration < endTime).length;
  });
  const maxSpills = Math.max(...spillCounts);

  const handlePointHover = (index: number, event: React.MouseEvent) => {
    setHoveredPoint(index);
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });
  };

  const handlePointLeave = () => {
    setHoveredPoint(null);
  };

  // Generate grid lines for timeline
  const gridLines = [];
  for (let i = 0; i <= 10; i++) {
    const x = (i / 10) * 420;
    const y = (i / 10) * 420;
    
    gridLines.push(
      <div
        key={`v-${i}`}
        className="scatter-plot-grid-line vertical"
        style={{ left: `${x}px` }}
      />
    );
    gridLines.push(
      <div
        key={`h-${i}`}
        className="scatter-plot-grid-line horizontal"
        style={{ top: `${y}px` }}
      />
    );
  }

  // Generate axis ticks for timeline
  const xTicks = [];
  const yTicks = [];
  
  // X-axis: 10 ticks for time
  for (let i = 0; i <= 10; i++) {
    const xValue = minTime + (i / 10) * timeRange;
    
    xTicks.push(
      <div key={i} className="scatter-plot-axis-tick">
        {Math.round(xValue).toLocaleString()}
      </div>
    );
  }
  
  // Y-axis: 10 ticks for spill count
  for (let i = 0; i <= 10; i++) {
    const yValue = Math.round((i / 10) * maxSpills);
    const y = (i / 10) * 420;
    
    yTicks.push(
      <div 
        key={i} 
        className="scatter-plot-axis-tick"
        style={{ 
          top: `${y}px`
        }}
      >
        {yValue}
      </div>
    );
  }

  return (
    <div className="chart-container">
      <div className="chart-header">
        <div>
          <h4 className="chart-title">{title}</h4>
          <p className="chart-description">{description}</p>
        </div>
      </div>
      
      <div className="scatter-plot-modern">
        <div className="scatter-plot-canvas">
          {/* Grid */}
          <div className="scatter-plot-grid">
            {gridLines}
          </div>
          
          {/* Y-axis */}
          <div className="scatter-plot-y-axis">
            <div className="scatter-plot-axis-label" style={{ transform: 'rotate(-90deg)' }}>
              Spill Count
            </div>
            {yTicks}
          </div>
          
          {/* Line Chart */}
          <div className="scatter-plot-points">
            <svg width="420" height="420" style={{ position: 'absolute', top: 0, left: 0 }}>
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                points={spillCounts.map((count, i) => 
                  `${scaleX(i * timeStep + timeStep/2)},${420 - ((count / maxSpills) * 420)}`
                ).join(' ')}
              />
              {spillCounts.map((count, i) => (
                <circle
                  key={i}
                  cx={scaleX(i * timeStep + timeStep/2)}
                  cy={420 - ((count / maxSpills) * 420)}
                  r="4"
                  fill="#3b82f6"
                  onMouseEnter={(e) => handlePointHover(i, e)}
                  onMouseLeave={handlePointLeave}
                />
              ))}
            </svg>
          </div>
          
          {/* X-axis */}
          <div className="scatter-plot-axes">
            <div className="scatter-plot-axis-label">Time (normalized)</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              {xTicks}
            </div>
          </div>
          
          {/* Tooltip */}
          {hoveredPoint !== null && (
            <div
              className={`scatter-plot-tooltip show`}
              style={{
                left: `${tooltipPosition.x + 10}px`,
                top: `${tooltipPosition.y - 10}px`
              }}
            >
              <div className="scatter-plot-tooltip-title">
                Time Interval {hoveredPoint + 1}
              </div>
              <div className="scatter-plot-tooltip-content">
                <div className="scatter-plot-tooltip-row">
                  <span className="scatter-plot-tooltip-label">Time:</span>
                  <span className="scatter-plot-tooltip-value">{((hoveredPoint * timeStep) + (timeStep/2)).toFixed(0)} - {(((hoveredPoint + 1) * timeStep) + (timeStep/2)).toFixed(0)}</span>
                </div>
                <div className="scatter-plot-tooltip-row">
                  <span className="scatter-plot-tooltip-label">Spill Count:</span>
                  <span className="scatter-plot-tooltip-value">{spillCounts[hoveredPoint]}</span>
                </div>
                <div className="scatter-plot-tooltip-row">
                  <span className="scatter-plot-tooltip-label">Max Spills:</span>
                  <span className="scatter-plot-tooltip-value">{maxSpills}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

// Spill Events Search Section Component
const SpillEventsSearchSection: React.FC<{
  title: string;
  description: string;
  data: Array<{
    id: string;
    duration: number;
    memory_address: number;
    pc: string;
    load_pc?: string;
    store_pc?: string;
    impact_level: 'critical' | 'high-impact' | 'medium-impact' | 'low-impact' | 'normal';
  }>;
  isDarkTheme: boolean;
}> = ({ title, description, data, isDarkTheme }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchField, setSearchField] = React.useState<'all' | 'id' | 'pc' | 'load_pc' | 'store_pc' | 'memory_address' | 'duration'>('all');

  const filteredData = data.filter(item => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Wildcard search - if search term contains *, use it as wildcard
    if (searchTerm.includes('*')) {
      const pattern = searchTerm.replace(/\*/g, '.*').toLowerCase();
      
      if (searchField === 'all') {
        return new RegExp(pattern).test(item.id.toLowerCase()) || 
               new RegExp(pattern).test(item.pc.toLowerCase()) || 
               new RegExp(pattern).test(item.load_pc?.toLowerCase() || '') || 
               new RegExp(pattern).test(item.store_pc?.toLowerCase() || '') ||
               new RegExp(pattern).test(item.memory_address.toString().toLowerCase()) || 
               new RegExp(pattern).test(item.duration.toString().toLowerCase());
      } else if (searchField === 'id') {
        return new RegExp(pattern).test(item.id.toLowerCase());
      } else if (searchField === 'pc') {
        return new RegExp(pattern).test(item.pc.toLowerCase());
      } else if (searchField === 'load_pc') {
        return new RegExp(pattern).test(item.load_pc?.toLowerCase() || '');
      } else if (searchField === 'store_pc') {
        return new RegExp(pattern).test(item.store_pc?.toLowerCase() || '');
      } else if (searchField === 'memory_address') {
        return new RegExp(pattern).test(item.memory_address.toString().toLowerCase());
      } else if (searchField === 'duration') {
        return new RegExp(pattern).test(item.duration.toString().toLowerCase());
      }
    }
    
    // Normal search
    if (searchField === 'all') {
      return item.id.toLowerCase().includes(searchLower) || 
             item.pc.toLowerCase().includes(searchLower) || 
             item.load_pc?.toLowerCase().includes(searchLower) || 
             item.store_pc?.toLowerCase().includes(searchLower) ||
             item.memory_address.toString().toLowerCase().includes(searchLower) || 
             item.duration.toString().toLowerCase().includes(searchLower);
    } else if (searchField === 'id') {
      return item.id.toLowerCase().includes(searchLower);
    } else if (searchField === 'pc') {
      return item.pc.toLowerCase().includes(searchLower);
    } else if (searchField === 'load_pc') {
      return item.load_pc?.toLowerCase().includes(searchLower) || false;
    } else if (searchField === 'store_pc') {
      return item.store_pc?.toLowerCase().includes(searchLower) || false;
    } else if (searchField === 'memory_address') {
      return item.memory_address.toString().toLowerCase().includes(searchLower);
    } else if (searchField === 'duration') {
      return item.duration.toString().toLowerCase().includes(searchLower);
    }
    
    return true;
  });

  return (
    <div className="spill-search-section">
      <div className="spill-search-header">
        <div className="spill-search-title">
          <h4>🔍 {title}</h4>
          <p>{description}</p>
        </div>
        <div className="spill-search-stats">
          <span className="search-stats">
            {filteredData.length} of {data.length} events
          </span>
        </div>
      </div>
      
      <div className="spill-search-controls">
        <div className="search-controls-row">
          <div className="search-field-group">
            <label htmlFor="search-field">Search in:</label>
            <select 
              id="search-field"
              value={searchField} 
              onChange={(e) => setSearchField(e.target.value as any)}
              className="spill-field-select"
            >
              <option value="all">All Fields</option>
              <option value="id">ID Only</option>
              <option value="pc">PC Only</option>
              <option value="load_pc">Load PC Only</option>
              <option value="store_pc">Store PC Only</option>
              <option value="memory_address">Memory Address Only</option>
              <option value="duration">Time Only</option>
            </select>
          </div>
          
          <div className="search-input-group">
            <label htmlFor="search-input">Search term:</label>
            <input
              id="search-input"
              type="text"
              placeholder={`Search ${searchField === 'all' ? 'all fields' : searchField} (use * for wildcard)`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="spill-search-input"
            />
          </div>
          
          <div className="search-actions">
            <button 
              onClick={() => {
                setSearchTerm('');
                setSearchField('all');
              }}
              className="clear-search-btn"
              title="Clear search"
            >
              🗑️ Clear
            </button>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="toggle-results-btn"
            >
              {isExpanded ? '▼ Hide Results' : '▶ Show Results'}
            </button>
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="spill-search-results">
          <div className="results-header">
            <h5>Search Results ({filteredData.length} events)</h5>
            {searchTerm && (
              <div className="search-info">
                <span className="search-term">Searching for: "{searchTerm}"</span>
                <span className="search-field">in: {searchField === 'all' ? 'All Fields' : searchField}</span>
              </div>
            )}
          </div>
          
          <div className="spill-events-grid">
            {filteredData.map((event, index) => (
              <div key={index} className="spill-event-item">
                <div className="spill-event-header">
                  <span className="spill-event-index">#{event.id}</span>
                </div>
                <div className="spill-event-details">
                  <div className="spill-event-detail">
                    <span className="detail-label">Time:</span>
                    <span className="detail-value">{event.duration.toFixed(3)}</span>
                  </div>
                  <div className="spill-event-detail">
                    <span className="detail-label">PC:</span>
                    <span className="detail-value">{event.pc}</span>
                  </div>
                  <div className="spill-event-detail">
                    <span className="detail-label">Load PC:</span>
                    <span className="detail-value">{event.load_pc || 'N/A'}</span>
                  </div>
                  <div className="spill-event-detail">
                    <span className="detail-label">Store PC:</span>
                    <span className="detail-value">{event.store_pc || 'N/A'}</span>
                  </div>
                  <div className="spill-event-detail">
                    <span className="detail-label">Memory:</span>
                    <span className="detail-value">{event.memory_address}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Spill Events List Component
const SpillEventsList: React.FC<{
  data: Array<{
    id: string;
    duration: number;
    memory_address: number;
    pc: string;
    load_pc?: string;
    store_pc?: string;
    impact_level: 'critical' | 'high-impact' | 'medium-impact' | 'low-impact' | 'normal';
  }>;
  isDarkTheme: boolean;
}> = ({ data, isDarkTheme }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchField, setSearchField] = React.useState<'all' | 'id' | 'pc' | 'load_pc' | 'store_pc' | 'memory_address' | 'duration'>('all');

  const filteredData = data.filter(item => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Wildcard search - if search term contains *, use it as wildcard
    if (searchTerm.includes('*')) {
      const pattern = searchTerm.replace(/\*/g, '.*').toLowerCase();
      
      if (searchField === 'all') {
        return new RegExp(pattern).test(item.id.toLowerCase()) || 
               new RegExp(pattern).test(item.pc.toLowerCase()) || 
               new RegExp(pattern).test(item.load_pc?.toLowerCase() || '') || 
               new RegExp(pattern).test(item.store_pc?.toLowerCase() || '') ||
               new RegExp(pattern).test(item.memory_address.toString().toLowerCase()) || 
               new RegExp(pattern).test(item.duration.toString().toLowerCase());
      } else if (searchField === 'id') {
        return new RegExp(pattern).test(item.id.toLowerCase());
      } else if (searchField === 'pc') {
        return new RegExp(pattern).test(item.pc.toLowerCase());
      } else if (searchField === 'load_pc') {
        return new RegExp(pattern).test(item.load_pc?.toLowerCase() || '');
      } else if (searchField === 'store_pc') {
        return new RegExp(pattern).test(item.store_pc?.toLowerCase() || '');
      } else if (searchField === 'memory_address') {
        return new RegExp(pattern).test(item.memory_address.toString().toLowerCase());
      } else if (searchField === 'duration') {
        return new RegExp(pattern).test(item.duration.toString().toLowerCase());
      }
    }
    
    // Normal search
    if (searchField === 'all') {
      return item.id.toLowerCase().includes(searchLower) || 
             item.pc.toLowerCase().includes(searchLower) || 
             item.load_pc?.toLowerCase().includes(searchLower) || 
             item.store_pc?.toLowerCase().includes(searchLower) ||
             item.memory_address.toString().toLowerCase().includes(searchLower) || 
             item.duration.toString().toLowerCase().includes(searchLower);
    } else if (searchField === 'id') {
      return item.id.toLowerCase().includes(searchLower);
    } else if (searchField === 'pc') {
      return item.pc.toLowerCase().includes(searchLower);
    } else if (searchField === 'load_pc') {
      return item.load_pc?.toLowerCase().includes(searchLower) || false;
    } else if (searchField === 'store_pc') {
      return item.store_pc?.toLowerCase().includes(searchLower) || false;
    } else if (searchField === 'memory_address') {
      return item.memory_address.toString().toLowerCase().includes(searchLower);
    } else if (searchField === 'duration') {
      return item.duration.toString().toLowerCase().includes(searchLower);
    }
    
    return true;
  });

  return (
    <div className="spill-events-list-container">
      <div className="spill-events-header">
        <h4>Spill Events List ({filteredData.length} of {data.length} total)</h4>
        <div className="spill-events-controls">
          <select 
            value={searchField} 
            onChange={(e) => setSearchField(e.target.value as any)}
            className="spill-field-select"
          >
            <option value="all">All Fields</option>
            <option value="id">ID Only</option>
            <option value="pc">PC Only</option>
            <option value="load_pc">Load PC Only</option>
            <option value="store_pc">Store PC Only</option>
            <option value="memory_address">Memory Address Only</option>
            <option value="duration">Time Only</option>
          </select>
          <input
            type="text"
            placeholder={`Search ${searchField === 'all' ? 'all fields' : searchField} (use * for wildcard)`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="spill-search-input"
          />
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="spill-toggle-btn"
          >
            {isExpanded ? '▼ Hide' : '▶ Show'} Events
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="spill-events-content">
          <div className="spill-events-grid">
            {filteredData.map((event, index) => (
              <div key={index} className="spill-event-item">
                <div className="spill-event-header">
                  <span className="spill-event-index">#{event.id}</span>
                </div>
                <div className="spill-event-details">
                  <div className="spill-event-detail">
                    <span className="detail-label">Time:</span>
                    <span className="detail-value">{event.duration.toFixed(3)}</span>
                  </div>
                  <div className="spill-event-detail">
                    <span className="detail-label">PC:</span>
                    <span className="detail-value">{event.pc}</span>
                  </div>
                  <div className="spill-event-detail">
                    <span className="detail-label">Load PC:</span>
                    <span className="detail-value">{event.load_pc || 'N/A'}</span>
                  </div>
                  <div className="spill-event-detail">
                    <span className="detail-label">Store PC:</span>
                    <span className="detail-value">{event.store_pc || 'N/A'}</span>
                  </div>
                  <div className="spill-event-detail">
                    <span className="detail-label">Memory:</span>
                    <span className="detail-value">{event.memory_address}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
  const SpillPieChart: React.FC<{ 
    title: string; 
    description: string; 
    data: { spill: number; normal: number; total: number }; 
    isDarkTheme: boolean 
  }> = ({ title, description, data, isDarkTheme }) => {
    const spillAngle = (data.spill / data.total) * 360;
    const spillPercentage = ((data.spill / data.total) * 100).toFixed(1);
    const normalPercentage = ((data.normal / data.total) * 100).toFixed(1);

    return (
      <div className="chart-container">
        <div className="chart-header">
          <div>
            <h4 className="chart-title">{title}</h4>
            <p className="chart-description">{description}</p>
          </div>
        </div>
        
        <div className="pie-chart-container">
          <div className="pie-chart">
            <div 
              className="pie-segment spill" 
              style={{ '--spill-angle': `${spillAngle}deg` } as React.CSSProperties}
            />
            <div 
              className="pie-segment normal" 
              style={{ '--spill-angle': `${spillAngle}deg` } as React.CSSProperties}
            />
          </div>
          
          <div className="pie-legend">
            <div className="pie-legend-item">
              <div className="pie-legend-color spill" />
              <div>
                <div>Spill</div>
                <div className="pie-value">{formatNumber(data.spill)}</div>
                <div>{spillPercentage}%</div>
              </div>
            </div>
            <div className="pie-legend-item">
              <div className="pie-legend-color normal" />
              <div>
                <div>Normal</div>
                <div className="pie-value">{formatNumber(data.normal)}</div>
                <div>{normalPercentage}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Spill Bar Chart Component
  const SpillBarChart: React.FC<{ 
    title: string; 
    description: string; 
    data: { spill: number; normal: number; total: number }; 
    isDarkTheme: boolean 
  }> = ({ title, description, data, isDarkTheme }) => {
    const spillPercentage = ((data.spill / data.total) * 100).toFixed(1);
    const normalPercentage = ((data.normal / data.total) * 100).toFixed(1);
    const maxValue = Math.max(data.spill, data.normal);
    
    const spillHeight = (data.spill / maxValue) * 100;
    const normalHeight = (data.normal / maxValue) * 100;

    return (
      <div className="chart-container">
        <div className="chart-header">
          <div>
            <h4 className="chart-title">{title}</h4>
            <p className="chart-description">{description}</p>
          </div>
        </div>
        
        <div className="bar-chart-container">
          <div className="bar-chart">
            <div className="bar-item">
              <div 
                className="bar spill" 
                style={{ height: `${spillHeight}%` }}
              />
              <div className="bar-label">Spill CPI</div>
              <div className="bar-value">{data.spill.toFixed(2)}</div>
              <div className="bar-percentage">{spillPercentage}%</div>
            </div>
            <div className="bar-item">
              <div 
                className="bar normal" 
                style={{ height: `${normalHeight}%` }}
              />
              <div className="bar-label">Normal CPI</div>
              <div className="bar-value">{data.normal.toFixed(2)}</div>
              <div className="bar-percentage">{normalPercentage}%</div>
            </div>
          </div>
        </div>
      </div>
    );
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

         {/* Spill Analysis Section */}
         {spillAnalysis && spillAnalysis.spill_count > 0 && (
           <div className="content-section">
             <header className="App-header">
               <h1>💧 Register Spill Analysis</h1>
               <p>Detailed analysis of register spill patterns and memory usage</p>
               <div className="architecture-info">
                 <span className="architecture-badge">
                   🏗️ {spillAnalysis.architecture} Architecture
                 </span>
                 <span className="file-info">
                   📄 {spillAnalysis.spill_file}
                 </span>
               </div>
             </header>
             
             <main className="container">
               {/* Spill Statistics */}
               <div className="metrics-grid">
                 <div className="metric-card cpi-card">
                   <div className="metric-header">
                     <h3>Total Spills</h3>
                   </div>
                   <div className="metric-value">
                     {formatNumber(spillAnalysis.statistics.total_spills)}
                   </div>
                   <div className="metric-full">
                     {spillAnalysis.statistics.total_spills.toLocaleString()}
                   </div>
                 </div>
                 
                 <div className="metric-card host-time-card">
                   <div className="metric-header">
                     <h3>Avg Duration</h3>
                   </div>
                   <div className="metric-value">
                     {formatNumber(spillAnalysis.statistics.avg_spill_duration)}
                   </div>
                   <div className="metric-full">
                     {spillAnalysis.statistics.avg_spill_duration.toFixed(0)} ticks
                   </div>
                 </div>
                 
                 <div className="metric-card sim-time-card">
                   <div className="metric-header">
                     <h3>Unique Addresses</h3>
                   </div>
                   <div className="metric-value">
                     {formatNumber(spillAnalysis.statistics.unique_memory_addresses)}
                   </div>
                   <div className="metric-full">
                     {spillAnalysis.statistics.unique_memory_addresses.toLocaleString()}
                   </div>
                 </div>
                 
                 <div className="metric-card tick-rate-card">
                   <div className="metric-header">
                     <h3>Max Duration</h3>
                   </div>
                   <div className="metric-value">
                     {formatNumber(spillAnalysis.statistics.max_spill_duration)}
                   </div>
                   <div className="metric-full">
                     {spillAnalysis.statistics.max_spill_duration.toLocaleString()} ticks
                   </div>
                 </div>
               </div>
               
        {/* Modern Performance-Style Spill Analysis */}
        {spillAnalysis.charts && (
          <div className="chart-section">
            <h3>⚡ Performance Impact Analysis</h3>
            
            
            {/* Modern Donut Chart */}
            <ModernDonutChart
              title="Spill Impact Distribution"
              description="Visual representation of spill vs normal operations"
              data={{
                spill: spillAnalysis.statistics.total_spills,
                normal: 50000, // Estimated normal operations
                total: spillAnalysis.statistics.total_spills + 50000
              }}
              isDarkTheme={isDarkTheme}
            />
            
            
            {/* PC Pattern Analysis */}
            <div style={{ position: 'relative' }}>
              <ConfettiEffect />
              <PCPatternChart
                title="Hotspot Analysis"
                description="Most frequent spill locations (Program Counters)"
                patterns={spillAnalysis.charts.pc_pattern_analysis.patterns}
                isDarkTheme={isDarkTheme}
              />
            </div>
            
            {/* Spill Visualization Graphs */}
            <div className="spill-visualization-section">
              <h3>📊 Spill Visualization Graphs</h3>
              <div className="graphs-grid">
                <div className="graph-item">
                  <h4>📈 Timeline Analysis</h4>
                  <img src="/images/graphs/timeline_scatter_plot.png" alt="Timeline Scatter Plot" />
                </div>
                <div className="graph-item">
                  <h4>💾 Memory Address Analysis</h4>
                  <img src="/images/graphs/memory_address_scatter_plot.png" alt="Memory Address Scatter Plot" />
                </div>
                <div className="graph-item">
                  <h4>🔥 Store PC Analysis</h4>
                  <img src="/images/graphs/store_pc_scatter_plot.png" alt="Store PC Scatter Plot" />
                </div>
                <div className="graph-item">
                  <h4>🔥 Spill Heatmap</h4>
                  <img src="/images/graphs/spill_heatmap.png" alt="Spill Heatmap" />
                </div>
                <div className="graph-item">
                  <h4>🕸️ Network Connections</h4>
                  <img src="/images/graphs/spill_network_plot.png" alt="Spill Network Plot" />
                </div>
              </div>
            </div>
            
            {/* Spill Events Search & Filter Section */}
            {spillAnalysis.charts.scatter_plot_data && (
              <SpillEventsSearchSection
                title="Spill Events Search & Filter"
                description="Search and filter spill events with advanced options"
                data={spillAnalysis.charts.scatter_plot_data.data}
                isDarkTheme={isDarkTheme}
              />
            )}
          </div>
        )}
              
            </main>
           </div>
         )}

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
             {metrics && (
               <>
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
                   {(((metrics?.total_loads || 0) + (metrics?.total_stores || 0)) / (metrics?.total_instructions || 1) * 100).toFixed(2)}%
                 </div>
                 <div className="metric-full">
                   Memory operations ratio
                 </div>
                 <div className="performance-indicator">
                   <div className="performance-bar">
                     <div 
                       className="performance-bar-fill" 
                              style={{ 
                         width: `${(((metrics?.total_loads || 0) + (metrics?.total_stores || 0)) / (metrics?.total_instructions || 1) * 100)}%`,
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
                         width: `${Math.min((((metrics?.int_reg_reads || 0) + (metrics?.fp_reg_reads || 0)) / (metrics?.total_instructions || 1) * 100), 100)}%`,
                         backgroundColor: '#8b5cf6'
                              }}
                            ></div>
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
                       <span className="metric-value">{(metrics?.ipc || 0).toFixed(4)}</span>
                     </div>
                     <div className="tradeoff-metric">
                       <span className="metric-label">Power Efficiency:</span>
                       <span className="metric-value">{((1/(metrics?.cpi || 1)) * 100).toFixed(1)}%</span>
                     </div>
                     <div className="tradeoff-status">
                       {(metrics?.ipc || 0) > 0.005 ? '🚀 High Performance' : '🔋 Power Optimized'}
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
                         <span className="metric-value">{(((metrics?.total_loads || 0) + (metrics?.total_stores || 0)) / (metrics?.total_instructions || 1) * 100).toFixed(1)}%</span>
                       </div>
                       <div className="tradeoff-metric">
                         <span className="metric-label">Cache Pressure:</span>
                         <span className="metric-value">{(metrics?.total_memory_refs || 0) > 0 ? 'High' : 'Low'}</span>
                       </div>
                       <div className="tradeoff-status">
                         {(((metrics?.total_loads || 0) + (metrics?.total_stores || 0)) / (metrics?.total_instructions || 1)) > 0.3 ? '💾 Memory Bound' : '⚡ Compute Bound'}
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
                           '--percentage': `${Math.min(100, ((metrics?.ipc || 0) / 0.01) * 100)}%`,
                           '--color': (metrics?.ipc || 0) > 0.005 ? '#10b981' : (metrics?.ipc || 0) > 0.001 ? '#f59e0b' : '#ef4444'
                         } as React.CSSProperties}
                       ></div>
                       <div className="gauge-center">
                         <div className="gauge-value">{(metrics?.ipc || 0).toFixed(4)}</div>
                         <div className="gauge-unit">inst/cycle</div>
                       </div>
                     </div>
                     <div className="gauge-status">
                       {(metrics?.ipc || 0) > 0.005 ? '🟢 Excellent' : (metrics?.ipc || 0) > 0.001 ? '🟡 Moderate' : '🔴 Poor'}
                     </div>
                   </div>
                   
                   <div className="gauge-container">
                     <div className="gauge-label">Memory Intensity</div>
                     <div className="gauge">
                       <div className="gauge-background"></div>
                       <div 
                         className="gauge-fill memory-gauge"
                         style={{
                           '--percentage': `${(((metrics?.total_loads || 0) + (metrics?.total_stores || 0)) / (metrics?.total_instructions || 1) * 100)}%`,
                           '--color': '#3b82f6'
                         } as React.CSSProperties}
                       ></div>
                       <div className="gauge-center">
                         <div className="gauge-value">{(((metrics?.total_loads || 0) + (metrics?.total_stores || 0)) / (metrics?.total_instructions || 1) * 100).toFixed(1)}%</div>
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
                           '--percentage': `${Math.min(100, (((metrics?.int_reg_reads || 0) + (metrics?.fp_reg_reads || 0)) / (metrics?.total_instructions || 1) * 100))}%`,
                           '--color': '#8b5cf6'
                         } as React.CSSProperties}
                       ></div>
                       <div className="gauge-center">
                         <div className="gauge-value">{(((metrics?.int_reg_reads || 0) + (metrics?.fp_reg_reads || 0)) / (metrics?.total_instructions || 1) * 100).toFixed(1)}%</div>
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
                         <div className="score-value">{Math.max(0, Math.min(100, 100 - ((metrics?.cpi || 0) / 200) * 100)).toFixed(0)}</div>
                         <div className="score-label">Score</div>
                       </div>
                     </div>
                     <div className="performance-details">
                       <p><strong>Status:</strong> {(metrics?.cpi || 0) > 100 ? 'Critical Performance' : (metrics?.cpi || 0) > 50 ? 'Moderate Performance' : 'Good Performance'}</p>
                       <p><strong>Bottleneck:</strong> {(metrics?.cpi || 0) > 100 ? 'High CPI indicates pipeline stalls' : 'Memory or register pressure'}</p>
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
                         <span className="efficiency-value">{(((metrics?.total_loads || 0) + (metrics?.total_stores || 0)) / (metrics?.total_instructions || 1) * 100).toFixed(1)}%</span>
                       </div>
                       <div className="efficiency-item">
                         <span className="efficiency-label">Register:</span>
                         <span className="efficiency-value">{(((metrics?.int_reg_reads || 0) + (metrics?.fp_reg_reads || 0)) / (metrics?.total_instructions || 1) * 100).toFixed(1)}%</span>
                       </div>
                       <div className="efficiency-item">
                         <span className="efficiency-label">Compute:</span>
                         <span className="efficiency-value">{(100 - (((metrics?.total_loads || 0) + (metrics?.total_stores || 0)) / (metrics?.total_instructions || 1) * 100)).toFixed(1)}%</span>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
               </>
             )}
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
                         {formatNumber(memorySystemStats?.['system.mem_ctrls.readReqs'] || 0)}
                       </span>
                  </div>
                     <div className="memory-stat">
                       <span className="memory-label">Write Requests:</span>
                       <span className="memory-value">
                         {formatNumber(memorySystemStats?.['system.mem_ctrls.writeReqs'] || 0)}
                       </span>
                           </div>
                     <div className="memory-stat">
                       <span className="memory-label">Total Requests:</span>
                       <span className="memory-value">
                         {formatNumber((memorySystemStats?.['system.mem_ctrls.readReqs'] || 0) + (memorySystemStats?.['system.mem_ctrls.writeReqs'] || 0))}
                       </span>
                             </div>
                               </div>
                   
                   <div className="memory-system-card">
                     <h3>Memory Bursts</h3>
                     <div className="memory-stat">
                       <span className="memory-label">Read Bursts:</span>
                       <span className="memory-value">
                         {formatNumber(memorySystemStats?.['system.mem_ctrls.readBursts'] || 0)}
                       </span>
                               </div>
                     <div className="memory-stat">
                       <span className="memory-label">Write Bursts:</span>
                       <span className="memory-value">
                         {formatNumber(memorySystemStats?.['system.mem_ctrls.writeBursts'] || 0)}
                       </span>
                               </div>
                     <div className="memory-stat">
                       <span className="memory-label">Total Bursts:</span>
                       <span className="memory-value">
                         {formatNumber((memorySystemStats?.['system.mem_ctrls.readBursts'] || 0) + (memorySystemStats?.['system.mem_ctrls.writeBursts'] || 0))}
                       </span>
                               </div>
                               </div>
                   
                   <div className="memory-system-card">
                     <h3>Queue Lengths</h3>
                     <div className="memory-stat">
                       <span className="memory-label">Avg Read Queue:</span>
                       <span className="memory-value">
                         {(memorySystemStats?.['system.mem_ctrls.avgRdQLen'] || 0).toFixed(2)}
                       </span>
                             </div>
                     <div className="memory-stat">
                       <span className="memory-label">Avg Write Queue:</span>
                       <span className="memory-value">
                         {(memorySystemStats?.['system.mem_ctrls.avgWrQLen'] || 0).toFixed(2)}
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
                         {formatNumber(memorySystemStats?.['system.cpu.mmu.dtb.rdAccesses'] || 0)}
                       </span>
                          </div>
                     <div className="memory-stat">
                       <span className="memory-label">Write Accesses:</span>
                       <span className="memory-value">
                         {formatNumber(memorySystemStats?.['system.cpu.mmu.dtb.wrAccesses'] || 0)}
                       </span>
                        </div>
                     <div className="memory-stat">
                       <span className="memory-label">Read Misses:</span>
                       <span className="memory-value">
                         {formatNumber(memorySystemStats?.['system.cpu.mmu.dtb.rdMisses'] || 0)}
                       </span>
                    </div>
                     <div className="memory-stat">
                       <span className="memory-label">Write Misses:</span>
                       <span className="memory-value">
                         {formatNumber(memorySystemStats?.['system.cpu.mmu.dtb.wrMisses'] || 0)}
                       </span>
                  </div>
                </div>

                   <div className="memory-system-card">
                     <h3>Instruction TLB (ITB)</h3>
                     <div className="memory-stat">
                       <span className="memory-label">Read Accesses:</span>
                       <span className="memory-value">
                         {formatNumber(memorySystemStats?.['system.cpu.mmu.itb.rdAccesses'] || 0)}
                       </span>
                     </div>
                     <div className="memory-stat">
                       <span className="memory-label">Write Accesses:</span>
                       <span className="memory-value">
                         {formatNumber(memorySystemStats?.['system.cpu.mmu.itb.wrAccesses'] || 0)}
                       </span>
                     </div>
                     <div className="memory-stat">
                       <span className="memory-label">Read Misses:</span>
                       <span className="memory-value">
                         {formatNumber(memorySystemStats?.['system.cpu.mmu.itb.rdMisses'] || 0)}
                       </span>
                       </div>
                     <div className="memory-stat">
                       <span className="memory-label">Write Misses:</span>
                       <span className="memory-value">
                         {formatNumber(memorySystemStats?.['system.cpu.mmu.itb.wrMisses'] || 0)}
                       </span>
                     </div>
                   </div>
                 </div>
                 
                 <div className="summary">
                   <h3>Memory System Summary</h3>
                   <p>
                     Memory System Performance:<br/>
                     Total memory requests: {formatNumber((memorySystemStats?.['system.mem_ctrls.readReqs'] || 0) + (memorySystemStats?.['system.mem_ctrls.writeReqs'] || 0))}<br/>
                     Total TLB accesses: {formatNumber((memorySystemStats?.['system.cpu.mmu.dtb.rdAccesses'] || 0) + (memorySystemStats?.['system.cpu.mmu.dtb.wrAccesses'] || 0) + (memorySystemStats?.['system.cpu.mmu.itb.rdAccesses'] || 0) + (memorySystemStats?.['system.cpu.mmu.itb.wrAccesses'] || 0))}<br/>
                     Total TLB misses: {formatNumber((memorySystemStats?.['system.cpu.mmu.dtb.rdMisses'] || 0) + (memorySystemStats?.['system.cpu.mmu.dtb.wrMisses'] || 0) + (memorySystemStats?.['system.cpu.mmu.itb.rdMisses'] || 0) + (memorySystemStats?.['system.cpu.mmu.itb.wrMisses'] || 0))}
                   </p>
                 </div>
               </div>
             )}
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
                          { name: 'Total Instructions', value: metrics?.total_instructions || 0, type: 'instruction', color: '#3b82f6' },
                          { name: 'Total Cycles', value: metrics?.total_cycles || 0, type: 'cycle', color: '#1d4ed8' },
                          { name: 'CPI (Cycles/Inst)', value: Math.round(metrics?.cpi || 0), type: 'performance', color: '#ef4444' },
                          { name: 'IPC (Inst/Cycle)', value: Math.round((metrics?.ipc || 0) * 1000000), type: 'performance', color: '#10b981' },
                          { name: 'Memory References', value: metrics?.total_memory_refs || 0, type: 'memory', color: '#f59e0b' },
                          { name: 'Load Instructions', value: metrics?.total_loads || 0, type: 'memory', color: '#8b5cf6' },
                          { name: 'Store Instructions', value: metrics?.total_stores || 0, type: 'memory', color: '#ec4899' },
                          { name: 'Register Operations', value: (metrics?.int_reg_reads || 0) + (metrics?.fp_reg_reads || 0) + (metrics?.int_reg_writes || 0) + (metrics?.fp_reg_writes || 0), type: 'register', color: '#06b6d4' }
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
                      const staticMetrics = Object.entries(instructionTypes?.instruction_types || {})
                        .sort(([,a], [,b]) => b.count - a.count)
                        .slice(0, 12) // Top 12 instruction types
                        .map(([type, data], index) => {
                          const intensity = (instructionTypes?.total_instructions || 0) > 0 ? (data.count / (instructionTypes?.total_instructions || 1)) * 100 : 0;
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
                        <li>Memory Intensity: {metrics ? (((metrics?.total_loads || 0) + (metrics?.total_stores || 0)) / (metrics?.total_instructions || 1) * 100).toFixed(1) : 0}%</li>
                        <li>Register Intensity: {metrics ? (((metrics?.int_reg_reads || 0) + (metrics?.fp_reg_reads || 0)) / (metrics?.total_instructions || 1) * 100).toFixed(1) : 0}%</li>
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
                        <li>Total Instructions: {instructionTypes ? formatNumber(instructionTypes?.total_instructions || 0) : 0}</li>
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