import connectDB from '../../lib/mongodb';
import ScheduleModel from '../../models/Schedule';

// Lưu trạng thái manual override (in-memory)
// Nếu có manual override, schedule sẽ không chạy
let manualOverride: {
  nhom1: boolean;
  nhom2: boolean;
  overrideUntil?: Date; // Thời gian hết hạn override (optional)
} = {
  nhom1: false,
  nhom2: false,
};

// Set manual override (khi user bật/tắt thủ công)
export function setManualOverride(group: 1 | 2, override: boolean, until?: Date) {
  if (group === 1) {
    manualOverride.nhom1 = override;
    manualOverride.overrideUntil = until;
  } else {
    manualOverride.nhom2 = override;
    manualOverride.overrideUntil = until;
  }
}

// Clear manual override (khi user chuyển về auto)
export function clearManualOverride(group: 1 | 2) {
  if (group === 1) {
    manualOverride.nhom1 = false;
  } else {
    manualOverride.nhom2 = false;
  }
}

// Check xem có manual override không
export function hasManualOverride(group: 1 | 2): boolean {
  if (group === 1) {
    return manualOverride.nhom1;
  }
  return manualOverride.nhom2;
}

// Kiểm tra và trả về action cần thực hiện dựa trên schedule
export async function getScheduledAction(group: 1 | 2): Promise<'on' | 'off' | null> {
  // Nếu có manual override, không chạy schedule
  if (hasManualOverride(group)) {
    return null;
  }

  try {
    await connectDB();
    
    // Lấy schedule đang enabled cho group này
    const schedule = await ScheduleModel.findOne({
      group,
      enabled: true,
    }).lean();

    if (!schedule) {
      return null; // Không có schedule
    }

    const now = new Date();
    const currentDay = now.getDay(); // 0-6
    const currentTime = now.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    }); // Format: "HH:mm"

    // Kiểm tra xem hôm nay có trong daysOfWeek không
    if (!schedule.daysOfWeek.includes(currentDay)) {
      return null; // Không phải ngày trong schedule
    }

    // Tìm time slot đang active
    for (const slot of schedule.timeSlots) {
      if (isTimeInRange(currentTime, slot.startTime, slot.endTime)) {
        return slot.action;
      }
    }

    return null; // Không có time slot active
  } catch (error) {
    console.error('Error checking schedule:', error);
    return null;
  }
}

// Helper function: Kiểm tra thời gian có trong range không
function isTimeInRange(current: string, start: string, end: string): boolean {
  const [currentHour, currentMin] = current.split(':').map(Number);
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);

  const currentMinutes = currentHour * 60 + currentMin;
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  // Xử lý trường hợp qua đêm (ví dụ: 22:00 - 06:00)
  if (endMinutes < startMinutes) {
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

// Get effective control mode (ưu tiên: manual > schedule > auto)
export async function getEffectiveControlMode(
  group: 1 | 2,
  manualMode: 'auto' | 'off' | 'on'
): Promise<'auto' | 'off' | 'on'> {
  // Nếu manual mode không phải 'auto', ưu tiên manual
  if (manualMode !== 'auto') {
    setManualOverride(group, true);
    return manualMode;
  }

  // Nếu manual mode là 'auto', clear override và check schedule
  clearManualOverride(group);
  const scheduledAction = await getScheduledAction(group);

  if (scheduledAction) {
    return scheduledAction;
  }

  // Không có schedule, trả về auto
  return 'auto';
}

