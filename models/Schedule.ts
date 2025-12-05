import mongoose, { Schema, Document } from 'mongoose';

export interface ISchedule extends Document {
  group: 1 | 2;
  enabled: boolean;
  timeSlots: {
    startTime: string; // Format: "HH:mm" (24h)
    endTime: string; // Format: "HH:mm" (24h)
    action: 'on' | 'off'; // Bật hoặc tắt trong khung giờ này
  }[];
  daysOfWeek: number[]; // 0-6 (0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7)
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleSchema = new Schema<ISchedule>(
  {
    group: {
      type: Number,
      required: true,
      enum: [1, 2],
      index: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    timeSlots: [
      {
        startTime: {
          type: String,
          required: true,
          match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, // HH:mm format
        },
        endTime: {
          type: String,
          required: true,
          match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, // HH:mm format
        },
        action: {
          type: String,
          required: true,
          enum: ['on', 'off'],
        },
      },
    ],
    daysOfWeek: [
      {
        type: Number,
        min: 0,
        max: 6,
      },
    ],
  },
  {
    collection: 'schedules',
    timestamps: true,
  }
);

// Index for faster queries
ScheduleSchema.index({ group: 1, enabled: 1 });

const ScheduleModel =
  mongoose.models.Schedule || mongoose.model<ISchedule>('Schedule', ScheduleSchema);

export default ScheduleModel;

