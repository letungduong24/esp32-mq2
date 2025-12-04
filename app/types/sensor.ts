export interface SensorData {
  mq2_sensor1: number;
  mq2_sensor2: number;
  // Đèn cảnh báo nhóm 1: "GREEN", "YELLOW", "RED"
  den_canhbao_nhom1: string;
  // Đèn cảnh báo nhóm 2: "GREEN", "YELLOW", "RED"
  den_canhbao_nhom2: string;
  // Quạt & Còi nhóm 1 (điều khiển chung bởi relay 1)
  quat_coi_nhom1: string; // "ON" hoặc "OFF"
  // Quạt & Còi nhóm 2 (điều khiển chung bởi relay 2)
  quat_coi_nhom2: string; // "ON" hoặc "OFF"
  timestamp?: string;
}

export interface SensorResponse {
  success: boolean;
  data?: SensorData;
  message?: string;
}

export interface HistoryResponse {
  success: boolean;
  count: number;
  data: SensorData[];
}

