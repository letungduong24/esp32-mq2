import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { NextAuthOptions } from 'next-auth';
import connectDB from '@/lib/mongodb';
import ScheduleModel from '@/models/Schedule';

// Auth config
const authOptions: NextAuthOptions = {
  providers: [],
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production',
};

// GET /api/schedule - Lấy tất cả schedules hoặc theo group
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    await connectDB();
    const searchParams = request.nextUrl.searchParams;
    const group = searchParams.get('group');

    let query: any = {};
    if (group) {
      query.group = parseInt(group);
    }

    const schedules = await ScheduleModel.find(query).sort({ group: 1, createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/schedule - Tạo schedule mới
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    await connectDB();
    const body = await request.json();
    const { group, enabled, timeSlots, daysOfWeek } = body;

    // Validate
    if (!group || (group !== 1 && group !== 2)) {
      return NextResponse.json(
        { success: false, message: 'Invalid group' },
        { status: 400 }
      );
    }

    if (!Array.isArray(timeSlots) || timeSlots.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Time slots are required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(daysOfWeek) || daysOfWeek.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Days of week are required' },
        { status: 400 }
      );
    }

    // Xóa schedule cũ của group này (chỉ cho phép 1 schedule per group)
    await ScheduleModel.deleteMany({ group });

    // Tạo schedule mới
    const schedule = await ScheduleModel.create({
      group,
      enabled: enabled !== undefined ? enabled : true,
      timeSlots,
      daysOfWeek,
    });

    return NextResponse.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    console.error('Error creating schedule:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/schedule - Xóa schedule
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    await connectDB();
    const searchParams = request.nextUrl.searchParams;
    const group = searchParams.get('group');

    if (!group) {
      return NextResponse.json(
        { success: false, message: 'Group is required' },
        { status: 400 }
      );
    }

    await ScheduleModel.deleteMany({ group: parseInt(group) });

    return NextResponse.json({
      success: true,
      message: 'Schedule deleted',
    });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

