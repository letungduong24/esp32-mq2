import { NextResponse } from 'next/server';
import { initTelegramConfig } from '@/app/lib/telegram-service';

/**
 * GET /api/telegram/init - Khởi tạo cấu hình Telegram
 * Gọi khi server start để load config từ env
 */
export async function GET() {
  try {
    initTelegramConfig();
    return NextResponse.json({
      success: true,
      message: 'Telegram config initialized',
    });
  } catch (error) {
    console.error('Error initializing Telegram:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

