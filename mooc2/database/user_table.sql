-- ==================================================
-- LIBRARY MANAGEMENT SYSTEM - SAMPLE DATA
-- File: sample_data.sql
-- Purpose: Insert sample data for all tables
-- Tables: Users, Categories, Books, Borrows
-- ==================================================

-- ==================================================
-- 1. INSERT USERS (with BCrypt hashed passwords)
-- ==================================================
INSERT INTO users (
  username, email, password, fullname, phone, avatarurl, dateofbirth, role, isactive, createdat, updatedat
)
VALUES
('admin01', 'admin@library.com', '$2a$11$wT8aS5Z5RKUshwzqrmpEVOHIwea70y2VmRnq/recWHjPZu6oSUH/K', 'Nguyen Van Admin', '0901234567', 'https://via.placeholder.com/150', '1990-01-15', 'admin', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('librarian01', 'librarian@library.com', '$2a$11$wT8aS5Z5RKUshwzqrmpEVOHIwea70y2VmRnq/recWHjPZu6oSUH/K', 'Le Thi Thu Thuy', '0912345678', 'https://via.placeholder.com/150', '1985-07-20', 'admin', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user01', 'user01@gmail.com', '$2a$11$wT8aS5Z5RKUshwzqrmpEVOHIwea70y2VmRnq/recWHjPZu6oSUH/K', 'Tran Van Binh', '0923456789', 'https://via.placeholder.com/150', '2000-03-10', 'user', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user02', 'user02@gmail.com', '$2a$11$wT8aS5Z5RKUshwzqrmpEVOHIwea70y2VmRnq/recWHjPZu6oSUH/K', 'Pham Thi Chi', '0934567890', 'https://via.placeholder.com/150', '1998-12-05', 'user', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user03', 'user03@gmail.com', '$2a$11$wT8aS5Z5RKUshwzqrmpEVOHIwea70y2VmRnq/recWHjPZu6oSUH/K', 'Hoang Van Duc', '0945678901', 'https://via.placeholder.com/150', '2001-08-15', 'user', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user04', 'user04@gmail.com', '$2a$11$wT8aS5Z5RKUshwzqrmpEVOHIwea70y2VmRnq/recWHjPZu6oSUH/K', 'Vu Thi Ha', '0956789012', 'https://via.placeholder.com/150', '1999-11-25', 'user', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user05', 'user05@gmail.com', '$2a$11$wT8aS5Z5RKUshwzqrmpEVOHIwea70y2VmRnq/recWHjPZu6oSUH/K', 'Dao Van Khanh', '0967890123', 'https://via.placeholder.com/150', '2002-04-18', 'user', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================================================
-- 2. INSERT CATEGORIES (Book Categories)
-- ==================================================
INSERT INTO categories (
  name, description, createdat, updatedat
)
VALUES
('Công nghệ thông tin', 'Sách về lập trình, phát triển phần mềm, AI, Machine Learning', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Văn học Việt Nam', 'Tác phẩm văn học của các tác giả Việt Nam qua các thời kỳ', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Văn học nước ngoài', 'Tiểu thuyết, thơ ca từ các nước trên thế giới', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Khoa học tự nhiên', 'Sách về vật lý, hóa học, sinh học, toán học', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Kinh tế - Quản trị', 'Sách về kinh doanh, quản lý, marketing, tài chính', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Lịch sử - Địa lý', 'Sách về lịch sử thế giới, lịch sử Việt Nam, địa lý', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Tâm lý - Kỹ năng sống', 'Phát triển bản thân, kỹ năng giao tiếp, tâm lý học', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Thiếu nhi', 'Sách dành cho trẻ em, truyện tranh, sách giáo khoa', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================================================
-- 3. INSERT BOOKS (with realistic Vietnamese books)
-- ==================================================
INSERT INTO books (
  title, author, isbn, publisher, publisheddate, description, totalcopies, availablecopies, imageurl, categoryid, createdat, updatedat
)
VALUES
-- Công nghệ thông tin
('Clean Code: Cẩm nang viết code sạch', 'Robert C. Martin', '978-0132350884', 'NXB Thông tin và Truyền thông', '2021-01-15', 'Hướng dẫn viết code sạch, dễ đọc và dễ bảo trì', 5, 3, 'https://via.placeholder.com/200x300', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Design Patterns: Gang of Four', 'Erich Gamma', '978-0201633610', 'NXB Lao động', '2020-08-20', 'Các mẫu thiết kế phần mềm cơ bản', 3, 2, 'https://via.placeholder.com/200x300', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Lập trình Python từ cơ bản đến nâng cao', 'Nguyễn Văn A', '978-6041234567', 'NXB Đại học Quốc gia', '2022-03-10', 'Học Python từ A-Z với các ví dụ thực tế', 8, 5, 'https://via.placeholder.com/200x300', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Artificial Intelligence: A Modern Approach', 'Stuart Russell', '978-0134610993', 'NXB Giáo dục', '2021-12-05', 'Giáo trình AI toàn diện và hiện đại', 4, 2, 'https://via.placeholder.com/200x300', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Văn học Việt Nam
('Số đỏ', 'Vũ Trọng Phụng', '978-6041111111', 'NXB Văn học', '2020-01-01', 'Tiểu thuyết phê phán xã hội thời thuộc địa', 10, 7, 'https://via.placeholder.com/200x300', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Chí Phèo', 'Nam Cao', '978-6041111112', 'NXB Văn học', '2019-05-15', 'Truyện ngắn kinh điển của văn học Việt Nam', 12, 8, 'https://via.placeholder.com/200x300', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Tắt đèn', 'Ngô Tất Tố', '978-6041111113', 'NXB Văn học', '2020-11-20', 'Tiểu thuyết về đời sống nông thôn Việt Nam', 6, 4, 'https://via.placeholder.com/200x300', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Dế Mèn phiêu lưu ký', 'Tô Hoài', '978-6041111114', 'NXB Kim Đồng', '2021-06-01', 'Truyện thiếu nhi kinh điển Việt Nam', 15, 12, 'https://via.placeholder.com/200x300', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Văn học nước ngoài
('1984', 'George Orwell', '978-0451524935', 'NXB Văn học', '2020-02-14', 'Tiểu thuyết khoa học viễn tưởng phản địa đàng', 8, 5, 'https://via.placeholder.com/200x300', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('To Kill a Mockingbird', 'Harper Lee', '978-0060935467', 'NXB Văn học', '2019-07-04', 'Tiểu thuyết về phân biệt chủng tộc', 6, 3, 'https://via.placeholder.com/200x300', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('The Great Gatsby', 'F. Scott Fitzgerald', '978-0743273565', 'NXB Thế giới', '2021-09-15', 'Kiệt tác văn học Mỹ thế kỷ 20', 7, 4, 'https://via.placeholder.com/200x300', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Harry Potter và Hòn đá Phù thủy', 'J.K. Rowling', '978-6041222222', 'NXB Trẻ', '2020-12-25', 'Tiểu thuyết fantasy nổi tiếng thế giới', 20, 15, 'https://via.placeholder.com/200x300', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Khoa học tự nhiên
('Vật lý đại cương', 'Halliday & Resnick', '978-1118230725', 'NXB Khoa học và Kỹ thuật', '2021-01-10', 'Giáo trình vật lý cơ bản cho sinh viên', 10, 6, 'https://via.placeholder.com/200x300', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Hóa học hữu cơ', 'Morrison & Boyd', '978-0136436690', 'NXB Giáo dục', '2020-08-30', 'Sách giáo khoa hóa học hữu cơ', 8, 5, 'https://via.placeholder.com/200x300', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Sinh học phân tử', 'Watson & Crick', '978-0321832109', 'NXB Khoa học Tự nhiên', '2021-04-18', 'Nghiên cứu về cấu trúc DNA và RNA', 5, 3, 'https://via.placeholder.com/200x300', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Kinh tế - Quản trị
('Nghệ thuật bán hàng', 'Brian Tracy', '978-6041333333', 'NXB Lao động', '2020-05-20', 'Kỹ năng bán hàng chuyên nghiệp', 12, 8, 'https://via.placeholder.com/200x300', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Quản trị học hiện đại', 'Stephen Robbins', '978-0134527604', 'NXB Kinh tế', '2021-03-12', 'Giáo trình quản trị doanh nghiệp', 6, 4, 'https://via.placeholder.com/200x300', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Marketing 4.0', 'Philip Kotler', '978-1119341208', 'NXB Thế giới', '2020-10-08', 'Marketing trong thời đại số', 9, 6, 'https://via.placeholder.com/200x300', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Tâm lý - Kỹ năng sống
('Đắc nhân tâm', 'Dale Carnegie', '978-6041444444', 'NXB Tổng hợp TP.HCM', '2019-01-01', 'Nghệ thuật giao tiếp và ứng xử', 25, 18, 'https://via.placeholder.com/200x300', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Tư duy nhanh và chậm', 'Daniel Kahneman', '978-0374533557', 'NXB Thế giới', '2020-06-15', 'Tâm lý học và quyết định', 8, 5, 'https://via.placeholder.com/200x300', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Atomic Habits', 'James Clear', '978-0735211292', 'NXB Thế giới', '2021-11-30', 'Xây dựng thói quen tích cực', 15, 10, 'https://via.placeholder.com/200x300', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Thiếu nhi
('Doraemon - Tập 1', 'Fujiko F. Fujio', '978-6041555555', 'NXB Kim Đồng', '2020-07-01', 'Truyện tranh thiếu nhi nổi tiếng', 30, 25, 'https://via.placeholder.com/200x300', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Thần đồng đất Việt', 'Nguyễn Nhật Ánh', '978-6041555556', 'NXB Trẻ', '2021-02-28', 'Truyện thiếu nhi về trí tuệ Việt Nam', 18, 14, 'https://via.placeholder.com/200x300', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================================================
-- 4. INSERT BORROWS (Sample borrow records)
-- ==================================================
INSERT INTO borrows (
  userid, bookid, borrowdate, duedate, returndate, status, notes, createdat, updatedat
)
VALUES
-- Đang mượn (borrowed)
(3, 1, '2024-10-01 09:00:00', '2024-10-15 23:59:59', NULL, 'borrowed', 'Mượn để học Clean Code', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 5, '2024-10-02 14:30:00', '2024-10-16 23:59:59', NULL, 'borrowed', 'Đọc văn học Việt Nam', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 12, '2024-10-03 10:15:00', '2024-10-17 23:59:59', NULL, 'borrowed', 'Harry Potter rất hay!', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 18, '2024-09-28 16:20:00', '2024-10-12 23:59:59', NULL, 'borrowed', 'Học marketing online', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 19, '2024-09-30 11:45:00', '2024-10-14 23:59:59', NULL, 'borrowed', 'Sách rất bổ ích', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Quá hạn (overdue - borrowed but past due date)
(4, 2, '2024-09-15 09:30:00', '2024-09-29 23:59:59', NULL, 'borrowed', 'Học Design Pattern', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 9, '2024-09-20 13:15:00', '2024-10-04 23:59:59', NULL, 'borrowed', '1984 - sách kinh điển', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Đã trả (returned)
(3, 6, '2024-09-10 08:00:00', '2024-09-24 23:59:59', '2024-09-22 16:30:00', 'returned', 'Đã đọc xong Chí Phèo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 13, '2024-09-05 14:20:00', '2024-09-19 23:59:59', '2024-09-18 10:15:00', 'returned', 'Vật lý rất khó hiểu', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 19, '2024-08-25 11:30:00', '2024-09-08 23:59:59', '2024-09-07 15:45:00', 'returned', 'Đắc nhân tâm - sách tuyệt vời', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 20, '2024-08-30 09:45:00', '2024-09-13 23:59:59', '2024-09-12 14:20:00', 'returned', 'Tư duy nhanh và chậm', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 22, '2024-09-01 16:00:00', '2024-09-15 23:59:59', '2024-09-14 11:30:00', 'returned', 'Doraemon cho con đọc', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Mượn gần đây
(4, 21, '2024-10-01 08:30:00', '2024-10-15 23:59:59', NULL, 'borrowed', 'Atomic Habits để phát triển bản thân', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 11, '2024-10-02 15:45:00', '2024-10-16 23:59:59', NULL, 'borrowed', 'The Great Gatsby', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 23, '2024-10-03 12:20:00', '2024-10-17 23:59:59', NULL, 'borrowed', 'Thần đồng đất Việt', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================================================
-- 5. VERIFICATION QUERIES
-- ==================================================
-- Uncomment below to verify data insertion

-- SELECT 'USERS COUNT:' as info, COUNT(*) as total FROM users;
-- SELECT 'CATEGORIES COUNT:' as info, COUNT(*) as total FROM categories;
-- SELECT 'BOOKS COUNT:' as info, COUNT(*) as total FROM books;
-- SELECT 'BORROWS COUNT:' as info, COUNT(*) as total FROM borrows;

-- SELECT 'BOOKS BY CATEGORY:' as info;
-- SELECT c.name as category, COUNT(b.id) as book_count 
-- FROM categories c 
-- LEFT JOIN books b ON c.id = b.categoryid 
-- GROUP BY c.id, c.name 
-- ORDER BY book_count DESC;

-- SELECT 'BORROW STATUS:' as info;
-- SELECT status, COUNT(*) as count FROM borrows GROUP BY status;

COMMIT;