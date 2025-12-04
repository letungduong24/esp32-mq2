import mongoose, { Schema, Document } from 'mongoose';

export interface ISensorData extends Document {
  mq2_sensor1: number;
  mq2_sensor2: number;
  den_canhbao_nhom1: string;
  den_canhbao_nhom2: string;
  quat_coi_nhom1: string;
  quat_coi_nhom2: string;
  timestamp: Date;
}

// Type for lean documents (plain objects from .lean())
export interface ISensorDataLean {
  _id: mongoose.Types.ObjectId;
  mq2_sensor1: number;
  mq2_sensor2: number;
  den_canhbao_nhom1: string;
  den_canhbao_nhom2: string;
  quat_coi_nhom1: string;
  quat_coi_nhom2: string;
  timestamp: Date;
  __v?: number;
}

const SensorDataSchema = new Schema<ISensorData>(
  {
    mq2_sensor1: {
      type: Number,
      required: true,
    },
    mq2_sensor2: {
      type: Number,
      required: true,
    },
    den_canhbao_nhom1: {
      type: String,
      required: true,
    },
    den_canhbao_nhom2: {
      type: String,
      required: true,
    },
    quat_coi_nhom1: {
      type: String,
      required: true,
    },
    quat_coi_nhom2: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    collection: 'sensor_data',
    timestamps: false,
  }
);

// Create index on timestamp for faster queries
SensorDataSchema.index({ timestamp: -1 });

const SensorDataModel =
  mongoose.models.SensorData || mongoose.model<ISensorData>('SensorData', SensorDataSchema);

export default SensorDataModel;

