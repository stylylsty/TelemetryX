import { useState, useEffect, useRef } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Activity, Battery, AlertTriangle, Gauge, Fan } from 'lucide-react' // 引入 Fan 图标
import './App.css'

function App() {
  const [motorData, setMotorData] = useState({ speed: 0, rpm: 0 })
  const [batteryData, setBatteryData] = useState({ temp: 25, voltage: 350 })
  const [fanStatus, setFanStatus] = useState(false) // 新增：风扇状态
  const [tempHistory, setTempHistory] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [alertMsg, setAlertMsg] = useState(null)
  
  // 使用 useRef 来保持 websocket 连接对象，方便在按钮点击时调用
  const wsRef = useRef(null)

  useEffect(() => {
    const ws = new WebSocket('ws://127.0.0.1:8000/ws')
    wsRef.current = ws

    ws.onopen = () => {
      setIsConnected(true)
      console.log('✅ Connected')
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === 'motor') {
        setMotorData({ speed: data.speed, rpm: data.rpm })
      } 
      else if (data.type === 'battery') {
        setBatteryData({ temp: data.temp, voltage: data.voltage })
        
        // 更新风扇状态 (后端告诉我们要不要亮灯)
        if (data.fanStatus !== undefined) {
          setFanStatus(data.fanStatus)
        }
        
        // 报警逻辑
        if (data.temp > 50) {
          setAlertMsg(`CRITICAL: Battery Overheat ${data.temp}°C`)
        } else {
          setAlertMsg(null)
        }

        // 图表数据
        setTempHistory(prev => {
          const newHistory = [...prev, { time: new Date().toLocaleTimeString(), temp: data.temp }]
          return newHistory.slice(-30) 
        })
      }
    }

    ws.onclose = () => setIsConnected(false)
    return () => ws.close()
  }, [])

  // 发送指令的函数
  const toggleFan = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send("TOGGLE_FAN")
    } else {
      alert("System Offline")
    }
  }

  return (
    <div className="dashboard-container">
      <header className="header">
        <h1>Tesla Service Mode <span className="tag">Active Test</span></h1>
        <div className={`status-badge ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '🟢 CAN Bus Online' : '🔴 CAN Bus Offline'}
        </div>
      </header>

      {alertMsg && (
        <div className="alert-banner">
          <AlertTriangle size={24} />
          <span>{alertMsg}</span>
        </div>
      )}

      <div className="grid-layout">
        
        {/* Powertrain */}
        <div className="card">
          <div className="card-header"><Gauge className="icon"/> Powertrain</div>
          <div className="metric-huge">{motorData.speed} <span className="unit">km/h</span></div>
          <div className="metric-sub">RPM: {motorData.rpm}</div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{width: `${(motorData.speed / 120) * 100}%`}}></div>
          </div>
        </div>

        {/* Battery & Thermal Control (修改了这里) */}
        <div className="card">
          <div className="card-header"><Battery className="icon"/> HV Battery</div>
          <div className="row">
            <div>
              <div className="label">Voltage</div>
              <div className="value">{batteryData.voltage} V</div>
            </div>
            <div>
              <div className="label">Temp</div>
              <div className={`value ${batteryData.temp > 45 ? 'text-red' : ''}`}>
                {batteryData.temp}°C
              </div>
            </div>
          </div>
          
          {/* 新增：控制按钮区域 */}
          <div className="control-panel">
            <button 
              className={`control-btn ${fanStatus ? 'btn-active' : ''}`}
              onClick={toggleFan}
            >
              <Fan className={`icon-spin ${fanStatus ? 'spinning' : ''}`} />
              {fanStatus ? 'COOLING: ON' : 'COOLING: OFF'}
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="card wide-card">
          <div className="card-header"><Activity className="icon"/> Thermal Analysis</div>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <LineChart data={tempHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" hide />
                <YAxis domain={[20, 80]} stroke="#888" />
                <Tooltip contentStyle={{backgroundColor: '#333', border: 'none'}}/>
                <Line type="monotone" dataKey="temp" stroke="#ff4d4d" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  )
}

export default App