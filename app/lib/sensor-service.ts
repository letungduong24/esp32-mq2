import { SensorData } from '../types/sensor';
import prisma from '../../lib/prisma';
import {
  sendTelegramNotification,
  formatAlertMessage,
  shouldSendNotification,
} from './telegram-service';

// In-memory storage cho dữ liệu bình thường
let sensorDataHistory: SensorData[] = [];
let latestData: SensorData | null = null;
const MAX_HISTORY = 1000;

// SSE clients để broadcast realtime
type SSEClient = {
  id: string;
  controller: ReadableStreamDefaultController;
};

const sseClients: SSEClient[] = [];

// Kiểm tra có cảnh báo không
function hasAlert(data: Omit<SensorData, 'timestamp'>): boolean {
  return (
    data.den_canhbao_nhom1 === 'YELLOW' ||
    data.den_canhbao_nhom1 === 'RED' ||
    data.den_canhbao_nhom2 === 'YELLOW' ||
    data.den_canhbao_nhom2 === 'RED'
  );
}

export const sensorService = {
  // Lưu dữ liệu mới từ ESP32
  async saveSensorData(data: Omit<SensorData, 'timestamp'>): Promise<SensorData> {
    const sensorData: SensorData = {
      ...data,
      timestamp: new Date().toISOString(),
    };

    // Chỉ lưu vào database nếu có cảnh báo (yellow hoặc red)
    if (hasAlert(data)) {
      try {
        await prisma.sensorData.create({
          data: {
            mq2_sensor1: data.mq2_sensor1,
            mq2_sensor2: data.mq2_sensor2,
            den_canhbao_nhom1: data.den_canhbao_nhom1,
            den_canhbao_nhom2: data.den_canhbao_nhom2,
            quat_coi_nhom1: data.quat_coi_nhom1,
            quat_coi_nhom2: data.quat_coi_nhom2,
            timestamp: new Date(),
          },
        });
      } catch (error) {
        console.error('Error saving alert to database:', error);
      }
    }

    // Gửi thông báo Telegram nếu có cảnh báo mới
    if (shouldSendNotification(data.den_canhbao_nhom1, data.den_canhbao_nhom2)) {
      const message = formatAlertMessage(sensorData);
      sendTelegramNotification(message).catch((error) => {
        console.error('Error sending Telegram notification:', error);
      });
    }

    // Luôn lưu vào in-memory cho realtime
    latestData = sensorData;
    sensorDataHistory.push(sensorData);

    // Giới hạn số lượng bản ghi in-memory
    if (sensorDataHistory.length > MAX_HISTORY) {
      sensorDataHistory.shift();
    }

    // Broadcast đến tất cả SSE clients
    broadcastToClients(sensorData);

    return sensorData;
  },

  // Thêm SSE client
  addSSEClient(client: SSEClient): void {
    sseClients.push(client);
  },

  // Xóa SSE client
  removeSSEClient(clientId: string): void {
    const index = sseClients.findIndex((c) => c.id === clientId);
    if (index > -1) {
      sseClients.splice(index, 1);
    }
  },

  // Lấy dữ liệu mới nhất (từ in-memory)
  getLatestData(): SensorData | null {
    return latestData;
  },

  // Lấy lịch sử dữ liệu (từ in-memory)
  getHistory(limit?: number): SensorData[] {
    if (limit) {
      return sensorDataHistory.slice(-limit).reverse();
    }
    return [...sensorDataHistory].reverse();
  },

  // Lấy lịch sử cảnh báo từ database (chỉ RED và YELLOW)
  async getAlertHistory(limit?: number): Promise<SensorData[]> {
    try {
      const records = await prisma.sensorData.findMany({
        where: {
          OR: [
            { den_canhbao_nhom1: { in: ['RED', 'YELLOW'] } },
            { den_canhbao_nhom2: { in: ['RED', 'YELLOW'] } },
          ],
        },
        take: limit,
        orderBy: { timestamp: 'desc' },
      });

      return records.map((record: { mq2_sensor1: number; mq2_sensor2: number; den_canhbao_nhom1: string; den_canhbao_nhom2: string; quat_coi_nhom1: string; quat_coi_nhom2: string; timestamp: Date }) => ({
        mq2_sensor1: record.mq2_sensor1,
        mq2_sensor2: record.mq2_sensor2,
        den_canhbao_nhom1: record.den_canhbao_nhom1,
        den_canhbao_nhom2: record.den_canhbao_nhom2,
        quat_coi_nhom1: record.quat_coi_nhom1,
        quat_coi_nhom2: record.quat_coi_nhom2,
        timestamp: record.timestamp.toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching alert history:', error);
      return [];
    }
  },

  // Lấy dữ liệu theo khoảng thời gian (từ in-memory)
  getDataByTimeRange(startTime: Date, endTime: Date): SensorData[] {
    return sensorDataHistory.filter(
      (data: SensorData) => {
        const dataTime = new Date(data.timestamp || 0);
        return dataTime >= startTime && dataTime <= endTime;
      }
    );
  },

  // Xóa lịch sử (cả in-memory và database)
  async clearHistory(): Promise<void> {
    sensorDataHistory = [];
    latestData = null;
    try {
      await prisma.sensorData.deleteMany({});
    } catch (error) {
      console.error('Error clearing database history:', error);
    }
  },
};

// Broadcast dữ liệu đến tất cả SSE clients
function broadcastToClients(data: SensorData): void {
  const message = `data: ${JSON.stringify({ success: true, data })}\n\n`;
  
  sseClients.forEach((client) => {
    try {
      client.controller.enqueue(new TextEncoder().encode(message));
    } catch (error) {
      // Client đã disconnect, xóa khỏi danh sách
      sensorService.removeSSEClient(client.id);
    }
  });
}
