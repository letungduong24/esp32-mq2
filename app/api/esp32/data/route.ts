import { NextRequest, NextResponse } from 'next/server';
import { sensorService } from '@/app/lib/sensor-service';
import { SensorData } from '@/app/types/sensor';
import { initTelegramConfig } from '@/app/lib/telegram-service';

// Khởi tạo Telegram config khi module load
initTelegramConfig();

// POST /api/esp32/data - Nhận dữ liệu từ ESP32
export async function POST(request: NextRequest) {
  try {
    const body: Omit<SensorData, 'timestamp'> = await request.json();

    // Validate data
    if (
      typeof body.mq2_sensor1 !== 'number' ||
      typeof body.mq2_sensor2 !== 'number' ||
      !body.den_canhbao_nhom1 ||
      !body.den_canhbao_nhom2 ||
      !body.quat_coi_nhom1 ||
      !body.quat_coi_nhom2
    ) {
      return NextResponse.json(
        { success: false, message: 'Invalid data format' },
        { status: 400 }
      );
    }

    const savedData = await sensorService.saveSensorData(body);

    return NextResponse.json({
      success: true,
      message: 'Data received successfully',
      timestamp: savedData.timestamp,
    });
  } catch (error) {
    console.error('Error saving sensor data:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

