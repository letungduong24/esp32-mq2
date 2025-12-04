import { NextResponse } from 'next/server';

// Lưu trạng thái điều khiển (in-memory, có thể thay bằng database sau)
let controlState = {
  nhom1: 'auto' as 'auto' | 'off' | 'on',
  nhom2: 'auto' as 'auto' | 'off' | 'on',
};

// GET /api/esp32/command - ESP32 lấy lệnh điều khiển
export async function GET() {
  return NextResponse.json({
    success: true,
    nhom1: controlState.nhom1,
    nhom2: controlState.nhom2,
  });
}

// Export function để cập nhật từ control route
export function updateControlState(group: 1 | 2, mode: 'auto' | 'off' | 'on') {
  if (group === 1) {
    controlState.nhom1 = mode;
  } else {
    controlState.nhom2 = mode;
  }
}

// Export function để lấy state
export function getControlState() {
  return { ...controlState };
}

