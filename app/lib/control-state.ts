// Quản lý control state (in-memory)
// Tách riêng để có thể import vào nhiều route handlers

let controlState = {
  nhom1: 'auto' as 'auto' | 'off' | 'on',
  nhom2: 'auto' as 'auto' | 'off' | 'on',
};

// Cập nhật control state
export function updateControlState(group: 1 | 2, mode: 'auto' | 'off' | 'on') {
  if (group === 1) {
    controlState.nhom1 = mode;
  } else {
    controlState.nhom2 = mode;
  }
}

// Lấy control state hiện tại
export function getControlState() {
  return { ...controlState };
}

// Set control state (cho schedule checker)
export function setControlState(state: { nhom1: 'auto' | 'off' | 'on'; nhom2: 'auto' | 'off' | 'on' }) {
  controlState = { ...state };
}

