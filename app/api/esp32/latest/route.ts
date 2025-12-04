import { NextResponse } from 'next/server';
import { sensorService } from '@/app/lib/sensor-service';

// GET /api/esp32/latest - Lấy dữ liệu mới nhất
export async function GET() {
  try {
    const data = sensorService.getLatestData();
    
    if (!data) {
      return NextResponse.json({
        success: false,
        message: 'No data available',
      });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching latest data:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

