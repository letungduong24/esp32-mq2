# Hướng Dẫn Chạy Ứng Dụng với Docker

Hệ thống ESP32 Sensor Monitoring có thể chạy hoàn toàn trong Docker, bao gồm PostgreSQL và Next.js.

## Yêu Cầu

- Docker >= 20.10
- Docker Compose >= 2.0

## Cấu Hình

### 1. Tạo file `.env` (nếu chưa có)

Tạo file `.env` trong thư mục `web/` với nội dung:

```env
# PostgreSQL Configuration
POSTGRES_USER=esp32_user
POSTGRES_PASSWORD=esp32_password
POSTGRES_DB=esp32_db
POSTGRES_PORT=5432

# Database URL (sẽ được tự động tạo từ các biến trên)
# Khi chạy trong Docker, sẽ dùng hostname 'postgres' thay vì 'localhost'
DATABASE_URL="postgresql://esp32_user:esp32_password@postgres:5432/esp32_db?schema=public"

# Telegram (Optional - thêm nếu muốn dùng thông báo Telegram)
TELEGRAM_BOT_TOKEN="your_bot_token_here"
TELEGRAM_CHAT_ID="your_chat_id_here"
```

**Lưu ý**: 
- Các giá trị mặc định sẽ được dùng nếu không set trong `.env` (ví dụ: `POSTGRES_USER` mặc định là `esp32_user`)
- Khi chạy trong Docker, `DATABASE_URL` sẽ tự động được set để dùng hostname `postgres` (tên service trong docker-compose)
- Bạn có thể thay đổi user, password, database name và port trong file `.env`

### 2. Chạy với Docker Compose

Từ thư mục `web/`, chạy lệnh:

```bash
# Build và khởi động tất cả services
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng services
docker-compose down

# Dừng và xóa volumes (xóa dữ liệu database)
docker-compose down -v
```

### 3. Chạy Prisma Migrations

Sau khi PostgreSQL đã khởi động, chạy migrations:

```bash
# Vào trong container Next.js
docker-compose exec nextjs sh

# Trong container, chạy:
npx prisma migrate deploy
# hoặc
npx prisma migrate dev
```

Hoặc chạy từ bên ngoài (nếu đã cài Prisma CLI):

```bash
# Từ thư mục web/
DATABASE_URL="postgresql://esp32_user:esp32_password@localhost:5432/esp32_db?schema=public" npx prisma migrate deploy
```

## Truy Cập Ứng Dụng

- **Web App**: http://localhost:3000
- **PostgreSQL**: localhost:5432
  - User: `esp32_user`
  - Password: `esp32_password`
  - Database: `esp32_db`

## Cấu Hình ESP32

Trong file `esp32_code.ino`, cập nhật server URL:

```cpp
const char* serverUrl = "http://YOUR_SERVER_IP:3000/api/esp32/data";
const char* commandUrl = "http://YOUR_SERVER_IP:3000/api/esp32/command";
```

Thay `YOUR_SERVER_IP` bằng:
- IP máy chạy Docker (nếu ESP32 và server cùng mạng LAN)
- Hoặc domain name nếu deploy lên cloud

## Các Lệnh Hữu Ích

```bash
# Xem logs của tất cả services
docker-compose logs -f

# Xem logs của một service cụ thể
docker-compose logs -f nextjs
docker-compose logs -f postgres

# Restart một service
docker-compose restart nextjs

# Rebuild và restart
docker-compose up -d --build

# Xem trạng thái services
docker-compose ps

# Vào shell của container
docker-compose exec nextjs sh
docker-compose exec postgres psql -U esp32_user -d esp32_db
```

## Troubleshooting

### Lỗi kết nối database

- Đảm bảo PostgreSQL đã khởi động: `docker-compose ps`
- Kiểm tra DATABASE_URL trong `.env` dùng hostname `postgres` (không phải `localhost`)

### Lỗi Prisma

- Chạy `npx prisma generate` trong container
- Kiểm tra migrations đã chạy chưa

### Port đã được sử dụng

- Đổi port trong `docker-compose.yml`:
  ```yaml
  ports:
    - "3001:3000"  # Thay vì 3000:3000
  ```

## Production

Để deploy lên production:

1. Cập nhật `DATABASE_URL` trong `.env` hoặc environment variables
2. Cập nhật `serverUrl` trong ESP32 code
3. Sử dụng reverse proxy (nginx) nếu cần
4. Cấu hình SSL/TLS cho HTTPS
5. Backup database định kỳ

