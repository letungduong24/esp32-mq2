-- CreateTable
CREATE TABLE "sensor_data" (
    "id" SERIAL NOT NULL,
    "mq2_sensor1" INTEGER NOT NULL,
    "mq2_sensor2" INTEGER NOT NULL,
    "den_canhbao_nhom1" TEXT NOT NULL,
    "den_canhbao_nhom2" TEXT NOT NULL,
    "quat_coi_nhom1" TEXT NOT NULL,
    "quat_coi_nhom2" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sensor_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sensor_data_timestamp_idx" ON "sensor_data"("timestamp");
