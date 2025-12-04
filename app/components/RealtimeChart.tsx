'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SensorData } from '../types/sensor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RealtimeChartProps {
  data: SensorData | null;
}

interface ChartDataPoint {
  time: string;
  sensor1: number;
  sensor2: number;
}

export default function RealtimeChart({ data }: RealtimeChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const maxDataPoints = 50; // Giữ tối đa 50 điểm dữ liệu

  useEffect(() => {
    if (!data) return;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    const newPoint: ChartDataPoint = {
      time: timeStr,
      sensor1: data.mq2_sensor1,
      sensor2: data.mq2_sensor2,
    };

    setChartData((prev) => {
      const updated = [...prev, newPoint];
      // Giữ chỉ 50 điểm dữ liệu gần nhất
      if (updated.length > maxDataPoints) {
        return updated.slice(-maxDataPoints);
      }
      return updated;
    });
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Biểu Đồ Real-time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ value: 'Giá trị', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="sensor1" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="MQ2 Sensor 1"
              dot={false}
              isAnimationActive={false}
            />
            <Line 
              type="monotone" 
              dataKey="sensor2" 
              stroke="#ef4444" 
              strokeWidth={2}
              name="MQ2 Sensor 2"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

