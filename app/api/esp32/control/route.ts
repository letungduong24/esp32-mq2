import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { NextAuthOptions } from 'next-auth';
import { updateControlState, getControlState } from '@/app/lib/control-state';
import { setManualOverride, clearManualOverride } from '@/app/lib/schedule-service';

// Auth config
const authOptions: NextAuthOptions = {
  providers: [],
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production',
};

// POST /api/esp32/control - Điều khiển relay (yêu cầu authentication)
export async function POST(request: NextRequest) {
  // Kiểm tra authentication
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized. Please login first.' },
      { status: 401 }
    );
  }

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

    // Cập nhật manual override
    if (mode === 'auto') {
      clearManualOverride(group);
    } else {
      // Bật/tắt thủ công → set override để schedule không chạy
      setManualOverride(group, true);
    }

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
