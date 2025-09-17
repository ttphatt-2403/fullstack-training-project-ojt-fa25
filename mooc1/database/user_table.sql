DROP TABLE IF EXISTS Users;

CREATE TABLE Users (
  Id SERIAL PRIMARY KEY,                        -- Khóa chính, tự tăng
  Username VARCHAR(50) UNIQUE NOT NULL,         -- Tên đăng nhập (duy nhất)
  Email VARCHAR(100) UNIQUE NOT NULL,           -- Email (duy nhất)
  Password VARCHAR(255) NOT NULL,               -- Mật khẩu (hash, không plaintext)
  FullName VARCHAR(100),                        -- Họ tên đầy đủ
  Phone VARCHAR(20),                            -- Số điện thoại
  AvatarUrl TEXT,                               -- Đường dẫn ảnh đại diện (file path hoặc URL)
  DateOfBirth DATE,                             -- Ngày sinh
  Role VARCHAR(20) DEFAULT 'user',              -- Vai trò: user, admin...
  IsActive BOOLEAN DEFAULT TRUE,                -- Tài khoản đang hoạt động?
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,-- Ngày tạo
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Ngày cập nhật
);
INSERT INTO Users (
  Username, Email, Password, FullName, Phone, AvatarUrl, DateOfBirth, Role, IsActive, CreatedAt, UpdatedAt
)
VALUES
('an01', 'an@example.com', '123456', 'Nguyen Van An', '0901234567', 'https://via.placeholder.com/150', '1999-01-15', 'admin', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('khanh02', 'khanh@example.com', '123456', 'Le Khanh', '0956789012', 'https://via.placeholder.com/150', '1997-07-18', 'admin', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('binh03', 'binh@example.com', '123456', 'Tran Van Binh', '0912345678', 'https://via.placeholder.com/150', '2000-05-20', 'user', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chi04', 'chi@example.com', '123456', 'Le Thi Chi', '0923456789', 'https://via.placeholder.com/150', '2001-09-10', 'user', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ha05', 'ha@example.com', '123456', 'Do Thi Ha', '0945678901', 'https://via.placeholder.com/150', '2002-03-22', 'user', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('lam06', 'lam@example.com', '123456', 'Nguyen Hoang Lam', '0967890123', 'https://via.placeholder.com/150', '2003-11-11', 'user', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

SELECT * FROM Users;