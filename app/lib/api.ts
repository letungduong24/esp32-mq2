import { SensorData } from '../types/sensor';

// Sử dụng Next.js API routes (relative path)
const API_BASE_URL = '/api/esp32';

export async function getLatestData(): Promise<SensorData> {
  const response = await fetch(`${API_BASE_URL}/latest`, {
    cache: 'no-store',
  });
  const data = await response.json();
  if (data.success && data.data) {
    return data.data;
  }
  throw new Error(data.message || 'Failed to fetch data');
}

export async function getHistory(limit?: number): Promise<SensorData[]> {
  const url = limit 
    ? `${API_BASE_URL}/history?limit=${limit}`
    : `${API_BASE_URL}/history`;
  
  const response = await fetch(url, {
    cache: 'no-store',
  });
  const data = await response.json();
  if (data.success) {
    return data.data || [];
  }
  return [];
}

export async function setRelayControl(group: 1 | 2, mode: 'auto' | 'off' | 'on'): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/control`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ group, mode }),
  });
  const data = await response.json();
  return data.success || false;
}

