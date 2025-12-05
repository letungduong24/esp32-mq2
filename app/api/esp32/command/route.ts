  import { NextResponse } from 'next/server';
import { getEffectiveControlMode } from '@/app/lib/schedule-service';
import { startScheduleChecker } from '@/app/lib/schedule-checker';
import { getControlState } from '@/app/lib/control-state';

// Khởi động schedule checker khi module load
declare const globalThis: {
  scheduleCheckerStarted?: boolean;
} & typeof global;

if (typeof globalThis.scheduleCheckerStarted === 'undefined') {
  startScheduleChecker();
  globalThis.scheduleCheckerStarted = true;
}

// GET /api/esp32/command - ESP32 lấy lệnh điều khiển
// Tự động áp dụng schedule nếu manual mode là 'auto'
export async function GET() {
  const currentState = getControlState();
  
  // Lấy effective mode (manual > schedule > auto)
  const nhom1Effective = await getEffectiveControlMode(1, currentState.nhom1);
  const nhom2Effective = await getEffectiveControlMode(2, currentState.nhom2);

  return NextResponse.json({
    success: true,
    nhom1: nhom1Effective,
    nhom2: nhom2Effective,
  });
}
