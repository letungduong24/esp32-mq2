/**
 * Telegram Bot Service
 * Gửi thông báo cảnh báo qua Telegram Bot API
 */

interface TelegramConfig {
  botToken: string;
  chatId: string;
}

let telegramConfig: TelegramConfig | null = null;

// Khởi tạo cấu hình từ environment variables
export function initTelegramConfig() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (botToken && chatId) {
    telegramConfig = {
      botToken,
      chatId,
    };
    console.log('Telegram service initialized');
  } else {
    console.warn('Telegram config not found. Telegram notifications disabled.');
  }
}

// Gửi thông báo qua Telegram
export async function sendTelegramNotification(
  message: string
): Promise<boolean> {
  if (!telegramConfig) {
    console.warn('Telegram not configured');
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${telegramConfig.botToken}/sendMessage`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: telegramConfig.chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API error:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return false;
  }
}

// Format thông báo cảnh báo
export function formatAlertMessage(
  sensorData: {
    mq2_sensor1: number;
    mq2_sensor2: number;
    den_canhbao_nhom1: string;
    den_canhbao_nhom2: string;
    quat_coi_nhom1: string;
    quat_coi_nhom2: string;
    timestamp?: string;
  }
): string {
  // Format thời gian với timezone Việt Nam (UTC+7)
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);
  };

  const time = sensorData.timestamp
    ? formatTime(new Date(sensorData.timestamp))
    : formatTime(new Date());

  const getAlertEmoji = (status: string) => {
    if (status === 'RED') return '🔴';
    if (status === 'YELLOW') return '🟡';
    return '🟢';
  };

  const getAlertText = (status: string) => {
    if (status === 'RED') return 'NGUY HIỂM';
    if (status === 'YELLOW') return 'CẢNH BÁO';
    return 'AN TOÀN';
  };

  const isRed = sensorData.den_canhbao_nhom1 === 'RED' || sensorData.den_canhbao_nhom2 === 'RED';
  const isYellow = sensorData.den_canhbao_nhom1 === 'YELLOW' || sensorData.den_canhbao_nhom2 === 'YELLOW';

  let message = '';
  
  if (isRed) {
    message = '🚨 <b>CẢNH BÁO NGUY HIỂM!</b>\n\n';
  } else if (isYellow) {
    message = '⚠️ <b>CẢNH BÁO</b>\n\n';
  } else {
    message = 'ℹ️ <b>Thông tin cảm biến</b>\n\n';
  }

  message += `📅 <b>Thời gian:</b> ${time}\n\n`;
  message += `📊 <b>Nhóm 1 - Sensor 1:</b>\n`;
  message += `   Giá trị: ${sensorData.mq2_sensor1.toLocaleString()}\n`;
  message += `   Trạng thái: ${getAlertEmoji(sensorData.den_canhbao_nhom1)} ${getAlertText(sensorData.den_canhbao_nhom1)}\n`;
  message += `   Quạt & Còi: ${sensorData.quat_coi_nhom1}\n\n`;
  
  message += `📊 <b>Nhóm 2 - Sensor 2:</b>\n`;
  message += `   Giá trị: ${sensorData.mq2_sensor2.toLocaleString()}\n`;
  message += `   Trạng thái: ${getAlertEmoji(sensorData.den_canhbao_nhom2)} ${getAlertText(sensorData.den_canhbao_nhom2)}\n`;
  message += `   Quạt & Còi: ${sensorData.quat_coi_nhom2}\n`;

  return message;
}

// Kiểm tra xem có cần gửi thông báo không (chỉ gửi khi có cảnh báo mới)
let lastAlertState: {
  nhom1: string;
  nhom2: string;
} | null = null;

export function shouldSendNotification(
  den_canhbao_nhom1: string,
  den_canhbao_nhom2: string
): boolean {
  const currentState = { nhom1: den_canhbao_nhom1, nhom2: den_canhbao_nhom2 };
  
  // Gửi nếu:
  // 1. Chưa có state trước đó
  // 2. Có cảnh báo (YELLOW hoặc RED) và state thay đổi
  // 3. Chuyển từ cảnh báo về an toàn (để thông báo đã an toàn)
  
  if (!lastAlertState) {
    lastAlertState = currentState;
    // Chỉ gửi nếu có cảnh báo
    return (
      den_canhbao_nhom1 === 'YELLOW' ||
      den_canhbao_nhom1 === 'RED' ||
      den_canhbao_nhom2 === 'YELLOW' ||
      den_canhbao_nhom2 === 'RED'
    );
  }

  // Kiểm tra nếu có thay đổi trạng thái
  const stateChanged =
    lastAlertState.nhom1 !== currentState.nhom1 ||
    lastAlertState.nhom2 !== currentState.nhom2;

  if (stateChanged) {
    lastAlertState = currentState;
    return true;
  }

  return false;
}

