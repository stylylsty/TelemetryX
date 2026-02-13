import random
import time

class MockCar:
    def __init__(self):
        self.speed = 0
        self.rpm = 0
        self.battery_temp = 25 # 初始温度 25度
        self.voltage = 350     # 初始电压 350V
        self.fan_on = False    # <--- 新增：风扇状态 (默认为关)

    def update_physics(self):
        """
        模拟物理变化
        """
        # 1. 模拟速度波动
        self.speed += random.randint(-2, 5)
        self.speed = max(0, min(120, self.speed))
        
        # 2. 模拟转速
        self.rpm = self.speed * 30 + random.randint(-50, 50)
        
        # 3. 模拟温度变化 (关键逻辑！)
        if self.fan_on:
            # 如果风扇开了，温度快速下降
            self.battery_temp -= 0.5
        else:
            # 如果风扇没开，温度自然上升
            self.battery_temp += random.uniform(0.1, 0.3)
        
        # 限制温度范围 (20度 - 100度)
        self.battery_temp = max(20, min(100, self.battery_temp))
        
        # 4. 模拟电压消耗
        self.voltage -= random.uniform(0, 0.05)

    def generate_can_frame(self):
        """
        生成 CAN 报文
        """
        self.update_physics()
        
        # --- 报文 1: 电机状态 (ID: 0x101) ---
        speed_bytes = int(self.speed).to_bytes(2, 'big')
        rpm_bytes = int(self.rpm).to_bytes(2, 'big')
        data_101 = speed_bytes + rpm_bytes + b'\x00\x00\x00\x00'
        
        # --- 报文 2: 电池状态 (ID: 0x201) ---
        # 温度偏移量 +40
        temp_val = int(self.battery_temp + 40) 
        temp_byte = temp_val.to_bytes(1, 'big')
        volt_bytes = int(self.voltage).to_bytes(2, 'big')
        
        # 最后一个字节用来放 "风扇状态" (00=关, 01=开)
        # 这在真实的 DBC 中很常见，用一个 bit 或 byte 表示开关
        fan_byte = b'\x01' if self.fan_on else b'\x00'
        
        data_201 = temp_byte + volt_bytes + b'\x00\x00\x00\x00' + fan_byte
        
        if random.random() > 0.5:
            return {"id": 0x101, "data": data_101.hex()}
        else:
            return {"id": 0x201, "data": data_201.hex()}

if __name__ == "__main__":
    car = MockCar()
    while True:
        print(car.generate_can_frame())
        time.sleep(1)