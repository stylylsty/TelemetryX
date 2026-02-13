import asyncio
import json
import time
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from mock_car import MockCar

app = FastAPI()
car = MockCar()

print("🚗 Tesla Diagnostic Server is running...")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("✅ Client connected (前端已连接)")
    
    try:
        while True:
            # --- 1. 尝试接收前端指令 (非阻塞模式) ---
            # 我们给接收操作设置 0.05秒 的超时。
            # 如果 0.05秒内前端没说话，就跳过，继续发数据。
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=0.05)
                if data == "TOGGLE_FAN":
                    car.fan_on = not car.fan_on
                    print(f"🔧 指令收到: 风扇切换为 {'ON' if car.fan_on else 'OFF'}")
            except asyncio.TimeoutError:
                pass # 没人说话，继续干活
            
            # --- 2. 生成并解析数据 ---
            raw_frame = car.generate_can_frame()
            decoded_data = {}
            
            hex_str = raw_frame['data']
            bytes_data = bytes.fromhex(hex_str)
            
            if raw_frame['id'] == 0x101: # Motor
                speed = (bytes_data[0] << 8) | bytes_data[1]
                rpm = (bytes_data[2] << 8) | bytes_data[3]
                decoded_data = {
                    "type": "motor",
                    "speed": speed,
                    "rpm": rpm
                }
                
            elif raw_frame['id'] == 0x201: # Battery
                temp = bytes_data[0] - 40
                voltage = (bytes_data[1] << 8) | bytes_data[2]
                
                # 解析我们在 mock_car 里加的最后一个字节 (风扇状态)
                # 倒数第1个字节 (index 7)
                fan_status_byte = bytes_data[7] 
                is_fan_on = True if fan_status_byte == 1 else False
                
                decoded_data = {
                    "type": "battery",
                    "temp": round(temp, 1),
                    "voltage": voltage,
                    "fanStatus": is_fan_on  # <--- 告诉前端现在的真实状态
                }

            # --- 3. 发送数据给前端 ---
            if decoded_data:
                await websocket.send_text(json.dumps(decoded_data))
            
            # 稍微睡一会，避免发太快
            await asyncio.sleep(0.05)
            
    except WebSocketDisconnect:
        print("❌ Client disconnected")
    except Exception as e:
        print(f"❌ Error: {e}")