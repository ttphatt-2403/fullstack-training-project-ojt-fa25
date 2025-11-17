-- ==================================================
-- LIBRARY MANAGEMENT SYSTEM - COMPLETE DATABASE SCHEMA
-- File: complete_database.sql
-- Purpose: Create complete database structure with all entities and sample data
-- Tables: Users, Categories, Books, Borrows, Fees
-- ==================================================

-- Drop existing tables if they exist (in correct order due to foreign key constraints)
DROP TABLE IF EXISTS fees CASCADE;
DROP TABLE IF EXISTS borrows CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ==================================================
-- 1. CREATE USERS TABLE
-- ==================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    fullname VARCHAR(100),
    phone VARCHAR(20),
    avatarurl TEXT,
    dateofbirth DATE,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'staff', 'admin')),
    isactive BOOLEAN DEFAULT TRUE,
    createdat TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================================================
-- 2. CREATE CATEGORIES TABLE
-- ==================================================
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    createdat TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================================================
-- 3. CREATE BOOKS TABLE
-- ==================================================
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(100),
    isbn VARCHAR(50),
    publisher VARCHAR(100),
    publisheddate DATE,
    description VARCHAR(1000),
    totalcopies INTEGER DEFAULT 1 CHECK (totalcopies >= 0),
    availablecopies INTEGER DEFAULT 1 CHECK (availablecopies >= 0),
    imageurl TEXT,
    categoryid INTEGER NOT NULL,
    createdat TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_books_category FOREIGN KEY (categoryid) REFERENCES categories(id) ON DELETE RESTRICT,
    
    -- Business logic constraints
    CONSTRAINT chk_books_available_not_exceed_total CHECK (availablecopies <= totalcopies)
);

-- ==================================================
-- 4. CREATE BORROWS TABLE
-- ==================================================
CREATE TABLE borrows (
    id SERIAL PRIMARY KEY,
    userid INTEGER NOT NULL,
    bookid INTEGER NOT NULL,
    borrowdate TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    duedate TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    returndate TIMESTAMP WITHOUT TIME ZONE,
    status VARCHAR(20) DEFAULT 'request' CHECK (status IN ('request', 'borrowed', 'returned', 'overdue', 'rejected')),
    notes VARCHAR(500),
    createdat TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_borrows_user FOREIGN KEY (userid) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_borrows_book FOREIGN KEY (bookid) REFERENCES books(id) ON DELETE RESTRICT,
    
    -- Business logic constraints
    CONSTRAINT chk_borrows_due_after_borrow CHECK (duedate > borrowdate),
    CONSTRAINT chk_borrows_return_after_borrow CHECK (returndate IS NULL OR returndate >= borrowdate)
);

-- ==================================================
-- 5. CREATE FEES TABLE
-- ==================================================
CREATE TABLE fees (
    id SERIAL PRIMARY KEY,
    borrowid INTEGER NOT NULL,
    userid INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    type VARCHAR(50) NOT NULL CHECK (type IN ('borrow_fee', 'late_fee', 'damage_fee', 'lost_fee')),
    status VARCHAR(20) DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'cancelled')),
    paymentmethod VARCHAR(30),
    createdat TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    paidat TIMESTAMP WITHOUT TIME ZONE,
    notes TEXT,
    
    -- Foreign key constraints
    CONSTRAINT fk_fees_borrow FOREIGN KEY (borrowid) REFERENCES borrows(id) ON DELETE RESTRICT,
    CONSTRAINT fk_fees_user FOREIGN KEY (userid) REFERENCES users(id) ON DELETE RESTRICT,
    
    -- Business logic constraints
    CONSTRAINT chk_fees_paid_date CHECK (paidat IS NULL OR paidat >= createdat)
);

-- ==================================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- ==================================================

-- Users indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_isactive ON users(isactive);

-- Categories indexes
CREATE INDEX idx_categories_name ON categories(name);

-- Books indexes
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_books_isbn ON books(isbn);
CREATE INDEX idx_books_categoryid ON books(categoryid);
CREATE INDEX idx_books_availablecopies ON books(availablecopies);

-- Borrows indexes
CREATE INDEX idx_borrows_userid ON borrows(userid);
CREATE INDEX idx_borrows_bookid ON borrows(bookid);
CREATE INDEX idx_borrows_status ON borrows(status);
CREATE INDEX idx_borrows_borrowdate ON borrows(borrowdate);
CREATE INDEX idx_borrows_duedate ON borrows(duedate);
CREATE INDEX idx_borrows_returndate ON borrows(returndate);

-- Fees indexes
CREATE INDEX idx_fees_borrowid ON fees(borrowid);
CREATE INDEX idx_fees_userid ON fees(userid);
CREATE INDEX idx_fees_type ON fees(type);
CREATE INDEX idx_fees_status ON fees(status);

-- Composite indexes for common queries
CREATE INDEX idx_borrows_user_status ON borrows(userid, status);
CREATE INDEX idx_borrows_book_status ON borrows(bookid, status);
CREATE INDEX idx_fees_user_status ON fees(userid, status);

-- ==================================================
-- 7. CREATE UPDATE TIMESTAMP TRIGGER
-- ==================================================
CREATE OR REPLACE FUNCTION update_updatedat_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedat = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updatedat
CREATE TRIGGER update_users_updatedat BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updatedat_column();
CREATE TRIGGER update_categories_updatedat BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updatedat_column();
CREATE TRIGGER update_books_updatedat BEFORE UPDATE ON books FOR EACH ROW EXECUTE FUNCTION update_updatedat_column();
CREATE TRIGGER update_borrows_updatedat BEFORE UPDATE ON borrows FOR EACH ROW EXECUTE FUNCTION update_updatedat_column();

-- ==================================================
-- 8. INSERT SAMPLE USERS (with BCrypt hashed passwords)
-- ==================================================
INSERT INTO users (
    username, email, password, fullname, phone, avatarurl, dateofbirth, role, isactive, createdat, updatedat
) VALUES
('admin01', 'admin@library.com', '$2a$11$wT8aS5Z5RKUshwzqrmpEVOHIwea70y2VmRnq/recWHjPZu6oSUH/K', 'Nguyen Van Admin', '0901234567', 'https://via.placeholder.com/150', '1990-01-15', 'admin', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('staff01', 'staff@library.com', '$2a$11$wT8aS5Z5RKUshwzqrmpEVOHIwea70y2VmRnq/recWHjPZu6oSUH/K', 'Le Thi Thu Thuy', '0912345678', 'https://via.placeholder.com/150', '1985-07-20', 'staff', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('staff02', 'staff02@library.com', '$2a$11$wT8aS5Z5RKUshwzqrmpEVOHIwea70y2VmRnq/recWHjPZu6oSUH/K', 'Phan Van Minh', '0913456789', 'https://via.placeholder.com/150', '1988-03-25', 'staff', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user01', 'user01@gmail.com', '$2a$11$wT8aS5Z5RKUshwzqrmpEVOHIwea70y2VmRnq/recWHjPZu6oSUH/K', 'Tran Van Binh', '0923456789', 'https://via.placeholder.com/150', '2000-03-10', 'user', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user02', 'user02@gmail.com', '$2a$11$wT8aS5Z5RKUshwzqrmpEVOHIwea70y2VmRnq/recWHjPZu6oSUH/K', 'Pham Thi Chi', '0934567890', 'https://via.placeholder.com/150', '1998-12-05', 'user', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user03', 'user03@gmail.com', '$2a$11$wT8aS5Z5RKUshwzqrmpEVOHIwea70y2VmRnq/recWHjPZu6oSUH/K', 'Hoang Van Duc', '0945678901', 'https://via.placeholder.com/150', '2001-08-15', 'user', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user04', 'user04@gmail.com', '$2a$11$wT8aS5Z5RKUshwzqrmpEVOHIwea70y2VmRnq/recWHjPZu6oSUH/K', 'Vu Thi Ha', '0956789012', 'https://via.placeholder.com/150', '1999-11-25', 'user', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user05', 'user05@gmail.com', '$2a$11$wT8aS5Z5RKUshwzqrmpEVOHIwea70y2VmRnq/recWHjPZu6oSUH/K', 'Dao Van Khanh', '0967890123', 'https://via.placeholder.com/150', '2002-04-18', 'user', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================================================
-- 9. INSERT CATEGORIES (Book Categories)
-- ==================================================
INSERT INTO categories (name, description, createdat, updatedat) VALUES
('Công nghệ thông tin', 'Sách về lập trình, phát triển phần mềm, AI, Machine Learning', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Văn học Việt Nam', 'Tác phẩm văn học của các tác giả Việt Nam qua các thời kỳ', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Văn học nước ngoài', 'Tiểu thuyết, thơ ca từ các nước trên thế giới', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Khoa học tự nhiên', 'Sách về vật lý, hóa học, sinh học, toán học', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Kinh tế - Quản trị', 'Sách về kinh doanh, quản lý, marketing, tài chính', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Lịch sử - Địa lý', 'Sách về lịch sử thế giới, lịch sử Việt Nam, địa lý', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Tâm lý - Kỹ năng sống', 'Phát triển bản thân, kỹ năng giao tiếp, tâm lý học', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Thiếu nhi', 'Sách dành cho trẻ em, truyện tranh, sách giáo khoa', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Truyện tranh', 'Manga, comic, graphic novel', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Hoạt hình', 'Sách về hoạt hình, animation', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================================================
-- 10. INSERT BOOKS (with realistic Vietnamese books)
-- ==================================================
INSERT INTO books (
    title, author, isbn, publisher, publisheddate, description, totalcopies, availablecopies, imageurl, categoryid, createdat, updatedat
) VALUES
-- Công nghệ thông tin
('Clean Code: Cẩm nang viết code sạch', 'Robert C. Martin', '978-0132350884', 'NXB Thông tin và Truyền thông', '2021-01-15', 'Hướng dẫn viết code sạch, dễ đọc và dễ bảo trì', 5, 5, 'https://via.placeholder.com/200x300', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Design Patterns: Gang of Four', 'Erich Gamma', '978-0201633610', 'NXB Lao động', '2020-08-20', 'Các mẫu thiết kế phần mềm cơ bản', 3, 3, 'https://via.placeholder.com/200x300', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Lập trình Python từ cơ bản đến nâng cao', 'Nguyễn Văn A', '978-6041234567', 'NXB Đại học Quốc gia', '2022-03-10', 'Học Python từ A-Z với các ví dụ thực tế', 8, 8, 'https://via.placeholder.com/200x300', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Artificial Intelligence: A Modern Approach', 'Stuart Russell', '978-0134610993', 'NXB Giáo dục', '2021-12-05', 'Giáo trình AI toàn diện và hiện đại', 4, 4, 'https://via.placeholder.com/200x300', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Văn học Việt Nam
('Số đỏ', 'Vũ Trọng Phụng', '978-6041111111', 'NXB Văn học', '2020-01-01', 'Tiểu thuyết phê phán xã hội thời thuộc địa', 10, 10, 'https://via.placeholder.com/200x300', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Chí Phèo', 'Nam Cao', '978-6041111112', 'NXB Văn học', '2019-05-15', 'Truyện ngắn kinh điển của văn học Việt Nam', 12, 12, 'https://via.placeholder.com/200x300', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Tắt đèn', 'Ngô Tất Tố', '978-6041111113', 'NXB Văn học', '2020-11-20', 'Tiểu thuyết về đời sống nông thôn Việt Nam', 6, 6, 'https://via.placeholder.com/200x300', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Dế Mèn phiêu lưu ký', 'Tô Hoài', '978-6041111114', 'NXB Kim Đồng', '2021-06-01', 'Truyện thiếu nhi kinh điển Việt Nam', 15, 15, 'https://via.placeholder.com/200x300', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Văn học nước ngoài
('1984', 'George Orwell', '978-0451524935', 'NXB Văn học', '2020-02-14', 'Tiểu thuyết khoa học viễn tưởng phản địa đàng', 8, 8, 'https://via.placeholder.com/200x300', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('To Kill a Mockingbird', 'Harper Lee', '978-0060935467', 'NXB Văn học', '2019-07-04', 'Tiểu thuyết về phân biệt chủng tộc', 6, 6, 'https://via.placeholder.com/200x300', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('The Great Gatsby', 'F. Scott Fitzgerald', '978-0743273565', 'NXB Thế giới', '2021-09-15', 'Kiệt tác văn học Mỹ thế kỷ 20', 7, 7, 'https://via.placeholder.com/200x300', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Harry Potter và Hòn đá Phù thủy', 'J.K. Rowling', '978-6041222222', 'NXB Trẻ', '2020-12-25', 'Tiểu thuyết fantasy nổi tiếng thế giới', 20, 20, 'https://via.placeholder.com/200x300', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Khoa học tự nhiên
('Vật lý đại cương', 'Halliday & Resnick', '978-1118230725', 'NXB Khoa học và Kỹ thuật', '2021-01-10', 'Giáo trình vật lý cơ bản cho sinh viên', 10, 10, 'https://via.placeholder.com/200x300', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Hóa học hữu cơ', 'Morrison & Boyd', '978-0136436690', 'NXB Giáo dục', '2020-08-30', 'Sách giáo khoa hóa học hữu cơ', 8, 8, 'https://via.placeholder.com/200x300', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Sinh học phân tử', 'Watson & Crick', '978-0321832109', 'NXB Khoa học Tự nhiên', '2021-04-18', 'Nghiên cứu về cấu trúc DNA và RNA', 5, 5, 'https://via.placeholder.com/200x300', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Kinh tế - Quản trị
('Nghệ thuật bán hàng', 'Brian Tracy', '978-6041333333', 'NXB Lao động', '2020-05-20', 'Kỹ năng bán hàng chuyên nghiệp', 12, 12, 'https://via.placeholder.com/200x300', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Quản trị học hiện đại', 'Stephen Robbins', '978-0134527604', 'NXB Kinh tế', '2021-03-12', 'Giáo trình quản trị doanh nghiệp', 6, 6, 'https://via.placeholder.com/200x300', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Marketing 4.0', 'Philip Kotler', '978-1119341208', 'NXB Thế giới', '2020-10-08', 'Marketing trong thời đại số', 9, 9, 'https://via.placeholder.com/200x300', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Tâm lý - Kỹ năng sống
('Đắc nhân tâm', 'Dale Carnegie', '978-6041444444', 'NXB Tổng hợp TP.HCM', '2019-01-01', 'Nghệ thuật giao tiếp và ứng xử', 25, 25, 'https://via.placeholder.com/200x300', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Tư duy nhanh và chậm', 'Daniel Kahneman', '978-0374533557', 'NXB Thế giới', '2020-06-15', 'Tâm lý học và quyết định', 8, 8, 'https://via.placeholder.com/200x300', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Atomic Habits', 'James Clear', '978-0735211292', 'NXB Thế giới', '2021-11-30', 'Xây dựng thói quen tích cực', 15, 15, 'https://via.placeholder.com/200x300', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Thiếu nhi
('Doraemon - Tập 1', 'Fujiko F. Fujio', '978-6041555555', 'NXB Kim Đồng', '2020-07-01', 'Truyện tranh thiếu nhi nổi tiếng', 30, 30, 'https://via.placeholder.com/200x300', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Thần đồng đất Việt', 'Nguyễn Nhật Ánh', '978-6041555556', 'NXB Trẻ', '2021-02-28', 'Truyện thiếu nhi về trí tuệ Việt Nam', 18, 18, 'https://via.placeholder.com/200x300', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================================================
-- 11. INSERT SAMPLE BORROWS (with various statuses)
-- ==================================================
INSERT INTO borrows (userid, bookid, borrowdate, duedate, returndate, status, notes, createdat, updatedat) VALUES
-- Request status (chờ duyệt)
(4, 1, '2024-11-10 09:00:00', '2024-11-24 23:59:59', NULL, 'request', 'Cần học Clean Code cho dự án', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 9, '2024-11-10 14:30:00', '2024-11-24 23:59:59', NULL, 'request', 'Muốn đọc 1984', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 19, '2024-11-09 10:15:00', '2024-11-23 23:59:59', NULL, 'request', 'Cần Đắc nhân tâm để học giao tiếp', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Borrowed status (đã duyệt, đang mượn)
(4, 12, '2024-11-01 09:00:00', '2024-11-15 23:59:59', NULL, 'borrowed', 'Harry Potter rất hay!', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 18, '2024-11-02 14:30:00', '2024-11-16 23:59:59', NULL, 'borrowed', 'Học marketing online', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 21, '2024-11-03 10:15:00', '2024-11-17 23:59:59', NULL, 'borrowed', 'Atomic Habits để phát triển bản thân', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Overdue status (quá hạn)
(4, 2, '2024-10-15 09:30:00', '2024-10-29 23:59:59', NULL, 'borrowed', 'Học Design Pattern - đã quá hạn', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 13, '2024-10-20 13:15:00', '2024-11-03 23:59:59', NULL, 'borrowed', 'Vật lý đại cương - quá hạn', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Returned status (đã trả)
(4, 6, '2024-10-10 08:00:00', '2024-10-24 23:59:59', '2024-10-22 16:30:00', 'returned', 'Đã đọc xong Chí Phèo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 20, '2024-10-05 14:20:00', '2024-10-19 23:59:59', '2024-10-18 10:15:00', 'returned', 'Tư duy nhanh và chậm - hay', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 22, '2024-10-01 16:00:00', '2024-10-15 23:59:59', '2024-10-14 11:30:00', 'returned', 'Doraemon cho con đọc', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Rejected status (đã từ chối)
(7, 3, '2024-11-08 12:00:00', '2024-11-22 23:59:59', NULL, 'rejected', 'User không đủ điều kiện mượn sách này', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================================================
-- 12. INSERT SAMPLE FEES
-- ==================================================
INSERT INTO fees (borrowid, userid, amount, type, status, paymentmethod, createdat, paidat, notes) VALUES
-- Borrow fees (phí mượn sách)
(4, 4, 20000.00, 'borrow_fee', 'unpaid', NULL, CURRENT_TIMESTAMP, NULL, 'Phí mượn sách Harry Potter'),
(5, 5, 20000.00, 'borrow_fee', 'paid', 'cash', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Phí mượn sách Marketing - đã thanh toán'),
(6, 6, 20000.00, 'borrow_fee', 'unpaid', NULL, CURRENT_TIMESTAMP, NULL, 'Phí mượn sách Atomic Habits'),

-- Late fees (phí trả muộn)
(7, 4, 50000.00, 'late_fee', 'unpaid', NULL, CURRENT_TIMESTAMP, NULL, 'Phí trả muộn Design Pattern - 10 ngày x 5000'),
(8, 5, 40000.00, 'late_fee', 'unpaid', NULL, CURRENT_TIMESTAMP, NULL, 'Phí trả muộn Vật lý đại cương - 8 ngày x 5000'),

-- Paid fees (phí đã thanh toán)
(9, 4, 20000.00, 'borrow_fee', 'paid', 'cash', '2024-10-10 08:00:00', '2024-10-22 16:30:00', 'Phí mượn Chí Phèo - đã thanh toán khi trả'),
(10, 5, 20000.00, 'borrow_fee', 'paid', 'cash', '2024-10-05 14:20:00', '2024-10-18 10:15:00', 'Phí mượn Tư duy nhanh và chậm'),
(11, 6, 20000.00, 'borrow_fee', 'paid', 'cash', '2024-10-01 16:00:00', '2024-10-14 11:30:00', 'Phí mượn Doraemon');

-- ==================================================
-- 13. CREATE VIEWS FOR COMMON QUERIES
-- ==================================================

-- View: Active borrows with user and book details
CREATE VIEW vw_active_borrows AS
SELECT 
    b.id as borrow_id,
    u.id as user_id,
    u.username,
    u.fullname,
    u.email,
    bk.id as book_id,
    bk.title,
    bk.author,
    bk.isbn,
    c.name as category_name,
    b.borrowdate,
    b.duedate,
    b.status,
    b.notes,
    CASE 
        WHEN b.duedate < CURRENT_DATE AND b.status = 'borrowed' THEN 'overdue'
        ELSE b.status 
    END as actual_status,
    CASE 
        WHEN b.duedate < CURRENT_DATE AND b.status = 'borrowed' 
        THEN CURRENT_DATE - b.duedate::date 
        ELSE 0 
    END as days_overdue
FROM borrows b
JOIN users u ON b.userid = u.id
JOIN books bk ON b.bookid = bk.id
JOIN categories c ON bk.categoryid = c.id
WHERE b.status IN ('request', 'borrowed');

-- View: Fee summary by user
CREATE VIEW vw_user_fees AS
SELECT 
    u.id as user_id,
    u.username,
    u.fullname,
    COUNT(f.id) as total_fees,
    SUM(CASE WHEN f.status = 'unpaid' THEN f.amount ELSE 0 END) as unpaid_amount,
    SUM(CASE WHEN f.status = 'paid' THEN f.amount ELSE 0 END) as paid_amount,
    SUM(f.amount) as total_amount
FROM users u
LEFT JOIN fees f ON u.id = f.userid
GROUP BY u.id, u.username, u.fullname;

-- View: Book availability status
CREATE VIEW vw_book_availability AS
SELECT 
    b.id,
    b.title,
    b.author,
    c.name as category_name,
    b.totalcopies,
    b.availablecopies,
    COUNT(br.id) FILTER (WHERE br.status = 'borrowed') as currently_borrowed,
    COUNT(br.id) FILTER (WHERE br.status = 'request') as pending_requests,
    CASE 
        WHEN b.availablecopies > 0 THEN 'available'
        WHEN COUNT(br.id) FILTER (WHERE br.status = 'request') > 0 THEN 'has_waitlist'
        ELSE 'not_available'
    END as availability_status
FROM books b
JOIN categories c ON b.categoryid = c.id
LEFT JOIN borrows br ON b.id = br.bookid AND br.status IN ('borrowed', 'request')
GROUP BY b.id, b.title, b.author, c.name, b.totalcopies, b.availablecopies;

-- ==================================================
-- 14. VERIFICATION QUERIES
-- ==================================================
DO $$
DECLARE
    user_count INTEGER;
    category_count INTEGER;
    book_count INTEGER;
    borrow_count INTEGER;
    fee_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO category_count FROM categories;
    SELECT COUNT(*) INTO book_count FROM books;
    SELECT COUNT(*) INTO borrow_count FROM borrows;
    SELECT COUNT(*) INTO fee_count FROM fees;
    
    RAISE NOTICE 'Database creation completed successfully!';
    RAISE NOTICE 'Users: %, Categories: %, Books: %, Borrows: %, Fees: %', 
                 user_count, category_count, book_count, borrow_count, fee_count;
END $$;

-- Show summary statistics
SELECT 'SUMMARY STATISTICS' as info;
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Categories', COUNT(*) FROM categories
UNION ALL
SELECT 'Books', COUNT(*) FROM books
UNION ALL
SELECT 'Borrows', COUNT(*) FROM borrows
UNION ALL
SELECT 'Fees', COUNT(*) FROM fees;

-- Show borrow status distribution
SELECT 'BORROW STATUS DISTRIBUTION' as info;
SELECT status, COUNT(*) as count FROM borrows GROUP BY status ORDER BY count DESC;

-- Show books by category
SELECT 'BOOKS BY CATEGORY' as info;
SELECT c.name as category, COUNT(b.id) as book_count 
FROM categories c 
LEFT JOIN books b ON c.id = b.categoryid 
GROUP BY c.id, c.name 
ORDER BY book_count DESC;

COMMIT;