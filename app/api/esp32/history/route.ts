import { NextRequest, NextResponse } from 'next/server';
import { sensorService } from '@/app/lib/sensor-service';

// GET /api/esp32/history - Lấy lịch sử dữ liệu
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const history = sensorService.getHistory(limit);

    return NextResponse.json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

