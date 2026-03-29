<img width="2560" height="1440" alt="cooling off" src="https://github.com/user-attachments/assets/bee4c220-a0e3-4e99-b430-b8442aa54b80" /># 🚗 EV-Diag: Real-time Vehicle Diagnostic System

A full-stack vehicle telemetry and active diagnostic dashboard simulating **Tesla Service Mode**.
Designed to visualize CAN Bus data and perform active tests (e.g., Thermal Control) via WebSocket.

<img width="2560" height="1440" alt="cooling off" src="https://github.com/user-attachments/assets/ca405bfd-8082-4852-a133-bacf4f781a77" />
<img width="2560" height="1440" alt="cooling on" src="https://github.com/user-attachments/assets/832437d0-264f-41a2-ad55-caeba0816c6c" />


## 🚀 Key Features
* **Real-time Telemetry:** Visualizes Speed, RPM, Battery Voltage, and Temperature with <50ms latency using **WebSockets**.
* **CAN Bus Simulation:** Python backend generates mock CAN frames (Hex) and decodes them using **Bitwise Operations** (mimicking DBC parsing).
* **Active Control:** Bi-directional communication allowing users to toggle the **Cooling Fan** and observe immediate physical feedback (Temp drop).
* **Automated Diagnostics:** Front-end logic to monitor thresholds and trigger alerts (e.g., Battery Overheat).

## 🛠️ Tech Stack
* **Frontend:** React.js, Vite, Recharts, Tailwind CSS (Custom)
* **Backend:** Python, FastAPI, Asyncio
* **Protocol:** WebSocket, JSON, Simulated CAN

## ⚡ How to Run
1.  **Clone the repo:**
    ```bash
    git clone [https://github.com/stylylsty/ev-diag.git](https://github.com/stylylsty/ev-diag.git)
    ```
2.  **Start Backend (Python):**
    ```bash
    cd ev-diag
    pip install fastapi uvicorn websockets
    uvicorn server:app --reload
    ```
3.  **Start Frontend (React):**
    ```bash
    cd dashboard
    npm install
    npm run dev
    ```
