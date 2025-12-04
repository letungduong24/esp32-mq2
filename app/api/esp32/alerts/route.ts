import { NextRequest, NextResponse } from 'next/server';
import { sensorService } from '@/app/lib/sensor-service';

// GET /api/esp32/alerts - Lấy lịch sử cảnh báo từ database
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const alerts = await sensorService.getAlertHistory(limit);

    return NextResponse.json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

