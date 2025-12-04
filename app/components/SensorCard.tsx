'use client';

import { SensorData } from '../types/sensor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SensorCardProps {
  title: string;
  sensorData: SensorData;
  sensorKey: 'mq2_sensor1' | 'mq2_sensor2';
  groupNumber: 1 | 2;
}

export default function SensorCard({ title, sensorData, sensorKey, groupNumber }: SensorCardProps) {
  const value = sensorData[sensorKey];
  const ledStatus = groupNumber === 1 ? sensorData.den_canhbao_nhom1 : sensorData.den_canhbao_nhom2;
  const quatCoiStatus = groupNumber === 1 ? sensorData.quat_coi_nhom1 : sensorData.quat_coi_nhom2;
  
  // Xác định trạng thái dựa trên giá trị
  const getStatus = (val: number) => {
    if (val < 1000) return { text: 'SAFE', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    if (val < 2500) return { text: 'WARNING', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    return { text: 'DANGER', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
  };

  // Màu đèn cảnh báo
  const getLedColor = (status: string) => {
    if (status === 'GREEN') return { color: 'text-green-600', bg: 'bg-green-100', dot: 'bg-green-500' };
    if (status === 'YELLOW') return { color: 'text-yellow-600', bg: 'bg-yellow-100', dot: 'bg-yellow-500' };
    if (status === 'RED') return { color: 'text-red-600', bg: 'bg-red-100', dot: 'bg-red-500' };
    return { color: 'text-gray-600', bg: 'bg-gray-100', dot: 'bg-gray-500' };
  };

  const status = getStatus(value);
  const ledColor = getLedColor(ledStatus);

  return (
    <Card className={`border-2 ${status.border} ${status.bg} transition-all hover:shadow-xl`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{title}</CardTitle>
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${status.color} ${status.bg}`}>
            {status.text}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">Sensor Value</p>
            <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className={`rounded-lg ${ledColor.bg} p-3`}>
              <p className="text-xs text-gray-600 mb-1">Đèn Cảnh Báo</p>
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${ledColor.dot} ${ledStatus === 'RED' ? 'animate-pulse' : ''}`}></div>
                <p className={`text-sm font-semibold ${ledColor.color}`}>
                  {ledStatus}
                </p>
              </div>
            </div>
            <div className="rounded-lg bg-white/50 p-3">
              <p className="text-xs text-gray-600 mb-1">Quạt & Còi</p>
              <p className={`text-sm font-semibold ${quatCoiStatus === 'ON' ? 'text-blue-600' : 'text-gray-400'}`}>
                {quatCoiStatus}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

