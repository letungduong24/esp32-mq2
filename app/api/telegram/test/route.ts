import { NextResponse } from 'next/server';
import { sendTelegramNotification } from '@/app/lib/telegram-service';

/**
 * GET /api/telegram/test - Test gửi thông báo Telegram
 */
export async function GET() {
  try {
    const testMessage = `🧪 <b>Test thông báo Telegram</b>\n\nĐây là tin nhắn test từ hệ thống ESP32 Sensor Monitoring.\n\nThời gian: ${new Date().toLocaleString('vi-VN')}`;
    
    const success = await sendTelegramNotification(testMessage);
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Telegram notification sent successfully',
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to send Telegram notification. Check configuration.',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error testing Telegram:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

