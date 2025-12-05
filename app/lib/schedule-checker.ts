import { getEffectiveControlMode } from './schedule-service';
import { getControlState, updateControlState } from './control-state';

// Background service để tự động check schedule và cập nhật control state
// Chạy mỗi phút để check schedule

let scheduleCheckInterval: NodeJS.Timeout | null = null;

export function startScheduleChecker() {
  // Dừng interval cũ nếu có
  if (scheduleCheckInterval) {
    clearInterval(scheduleCheckInterval);
  }

  // Check schedule mỗi phút
  scheduleCheckInterval = setInterval(async () => {
    try {
      await loadControlFunctions();
      const currentState = getControlState();

      // Check và cập nhật cho nhóm 1
      const effectiveMode1 = await getEffectiveControlMode(1, currentState.nhom1);
      if (effectiveMode1 !== currentState.nhom1 && currentState.nhom1 === 'auto') {
        // Chỉ cập nhật nếu manual mode là 'auto' và schedule thay đổi
        updateControlState(1, effectiveMode1);
      }

      // Check và cập nhật cho nhóm 2
      const effectiveMode2 = await getEffectiveControlMode(2, currentState.nhom2);
      if (effectiveMode2 !== currentState.nhom2 && currentState.nhom2 === 'auto') {
        updateControlState(2, effectiveMode2);
      }
    } catch (error) {
      console.error('Error in schedule checker:', error);
    }
  }, 60000); // Mỗi 1 phút
}

export function stopScheduleChecker() {
  if (scheduleCheckInterval) {
    clearInterval(scheduleCheckInterval);
    scheduleCheckInterval = null;
  }
}

