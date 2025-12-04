import { NextRequest } from 'next/server';
import { sensorService } from '@/app/lib/sensor-service';

// GET /api/esp32/stream - SSE endpoint cho realtime updates
export async function GET(request: NextRequest) {
  // Tạo SSE stream
  const stream = new ReadableStream({
    start(controller) {
      const clientId = Math.random().toString(36).substring(7);
      
      // Gửi dữ liệu ban đầu nếu có
      const latestData = sensorService.getLatestData();
      if (latestData) {
        const initialMessage = `data: ${JSON.stringify({ success: true, data: latestData })}\n\n`;
        controller.enqueue(new TextEncoder().encode(initialMessage));
      }

      // Thêm client vào danh sách
      sensorService.addSSEClient({
        id: clientId,
        controller,
      });

      // Gửi keepalive mỗi 30 giây
      const keepAliveInterval = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(': keepalive\n\n'));
        } catch (error) {
          clearInterval(keepAliveInterval);
          sensorService.removeSSEClient(clientId);
        }
      }, 30000);

      // Cleanup khi client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(keepAliveInterval);
        sensorService.removeSSEClient(clientId);
        try {
          controller.close();
        } catch (error) {
          // Ignore
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

