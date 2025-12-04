import { NextRequest, NextResponse } from 'next/server';
import { updateControlState, getControlState } from '../command/route';

// POST /api/esp32/control - Điều khiển relay
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { group, mode } = body;

    if (!group || !mode) {
      return NextResponse.json(
        { success: false, message: 'Missing group or mode' },
        { status: 400 }
      );
    }

    if ((group !== 1 && group !== 2) || !['auto', 'off', 'on'].includes(mode)) {
      return NextResponse.json(
        { success: false, message: 'Invalid group or mode' },
        { status: 400 }
      );
    }

    // Cập nhật trạng thái
    updateControlState(group, mode);

    return NextResponse.json({
      success: true,
      message: `Group ${group} set to ${mode}`,
      state: getControlState(),
    });
  } catch (error) {
    console.error('Error setting control:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/esp32/control - Lấy trạng thái điều khiển
export async function GET() {
  return NextResponse.json({
    success: true,
    state: getControlState(),
  });
}
