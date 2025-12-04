import { NextResponse } from 'next/server';
import { sensorService } from '@/app/lib/sensor-service';

// POST /api/esp32/clear - Xóa lịch sử
export async function POST() {
  try {
    await sensorService.clearHistory();
    
    return NextResponse.json({
      success: true,
      message: 'History cleared successfully',
    });
  } catch (error) {
    console.error('Error clearing history:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

