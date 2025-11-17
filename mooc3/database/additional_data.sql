-- ==================================================
-- LIBRARY MANAGEMENT SYSTEM - ADDITIONAL DATA
-- File: additional_data.sql
-- Purpose: Add more sample data to expand the database
-- ==================================================

-- ==================================================
-- 1. ADDITIONAL USERS (15 more users)
-- ==================================================
INSERT INTO users (
    username, email, password, fullname, phone, avatarurl, dateofbirth, role, isactive, createdat, updatedat
) VALUES
-- More Staff
('staff03', 'staff03@library.com', '$2a$11$wT8aS5Z5RKUshwzqrmpEVOHIwea70y2VmRnq/recWHjPZu6oSUH/K', 'Nguyen Thi Lan', '0975123456', 'https://via.placeholder.com/150', '1992-06-10', 'staff', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('staff04', 'staff04@library.com', '$2a$11$wT8aS5Z5RKUshwzqrmpEVOHIwea70y2VmRnq/recWHjPZu6oSUH/K', 'Le Van Duc', '0986234567', 'https://via.placeholder.com/150', '1987-09-22', 'staff', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- More Regular Users
('user06', 'user06@gmail.com', '$2a$11$wT8aS5Z5RKUshwzqrmpEVOHIwea70y2VmRnq/recWHjPZu6oSUH/K', 'Tran Thi Mai', '0978345678', 'https://via.placeholder.com/150', '1995-03-15', 'user', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user07', 'user07@gmail.com', '$2a$11$wT8aS5Z5RKUshwzqrmpEVOHIwea70y2VmRnq/recWHjPZu6oSUH/K', 'Pham Van Long', '0989456789', 'https://via.placeholder.com/150', '1997-12-08', 'user', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user08', 'user08@gmail.com', '$2a$11$wT8aS5Z5RKUshwzqrmpEVOHIwea70y2VmRnq/recWHjPZu6oSUH/K', 'Hoang Thi Linh', '0990567890', 'https://via.placeholder.com/150', '1996-07-20', 'user', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user09', 'user09@gmail.com', '$2a$11$wT8aS5Z5RKUshwzqrmpEVOHIwea70y2VmRnq/recWHjPZu6oSUH/K', 'Vu Van Nam', '0991678901', 'https://via.placeholder.com/150', '1994-11-30', 'user', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user10', 'user10@gmail.com', '$2a$11$wT8aS5Z5RKUshwzqrmpEVOHIwea70y2VmRnq/recWHjPZu6oSUH/K', 'Dao Thi Huong', '0992789012', 'https://via.placeholder.com/150', '1993-05-14', 'user', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user11', 'user11@gmail.com', '$2a$11$wT8aS5Z5RKUshwzqrmpEVOHIwea70y2VmRnq/recWHjPZu6oSUH/K', 'Nguyen Van Quan', '0993890123', 'https://via.placeholder.com/150', '1998-01-25', 'user', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user12', 'user12@gmail.com', '$2a$11$wT8aS5Z5RKUshwzqrmpEVOHIwea70y2VmRnq/recWHjPZu6oSUH/K', 'Le Thi Yen', '0994901234', 'https://via.placeholder.com/150', '1999-08-12', 'user', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user13', 'user13@gmail.com', '$2a$11$wT8aS5Z5RKUshwzqrmpEVOHIwea70y2VmRnq/recWHjPZu6oSUH/K', 'Tran Van Hieu', '0995012345', 'https://via.placeholder.com/150', '2000-02-18', 'user', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user14', 'user14@gmail.com', '$2a$11$wT8aS5Z5RKUshwzqrmpEVOHIwea70y2VmRnq/recWHjPZu6oSUH/K', 'Pham Thi Nga', '0996123456', 'https://via.placeholder.com/150', '1991-10-03', 'user', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user15', 'user15@gmail.com', '$2a$11$wT8aS5Z5RKUshwzqrmpEVOHIwea70y2VmRnq/recWHjPZu6oSUH/K', 'Hoang Van Tung', '0997234567', 'https://via.placeholder.com/150', '1996-04-17', 'user', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Student Users
('student01', 'student01@fpt.edu.vn', '$2a$11$wT8aS5Z5RKUshwzqrmpEVOHIwea70y2VmRnq/recWHjPZu6oSUH/K', 'Nguyen Minh Huy', '0998345678', 'https://via.placeholder.com/150', '2003-06-12', 'user', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('student02', 'student02@fpt.edu.vn', '$2a$11$wT8aS5Z5RKUshwzqrmpEVOHIwea70y2VmRnq/recWHjPZu6oSUH/K', 'Le Thi Thao', '0999456789', 'https://via.placeholder.com/150', '2002-09-08', 'user', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('student03', 'student03@fpt.edu.vn', '$2a$11$wT8aS5Z5RKUshwzqrmpEVOHIwea70y2VmRnq/recWHjPZu6oSUH/K', 'Tran Van Duc', '0900567890', 'https://via.placeholder.com/150', '2003-03-22', 'user', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================================================
-- 2. ADDITIONAL BOOKS (30 more books)
-- ==================================================
INSERT INTO books (
    title, author, isbn, publisher, publisheddate, description, totalcopies, availablecopies, imageurl, categoryid, createdat, updatedat
) VALUES
-- More IT Books (Category 1)
('JavaScript: The Good Parts', 'Douglas Crockford', '978-0596517748', 'NXB Thông tin và Truyền thông', '2020-05-15', 'JavaScript best practices and patterns', 6, 6, 'https://via.placeholder.com/200x300', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('React.js Fundamentals', 'Alex Banks', '978-1491954621', 'NXB Lao động', '2021-08-10', 'Complete guide to React.js development', 8, 8, 'https://via.placeholder.com/200x300', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Node.js Design Patterns', 'Mario Casciaro', '978-1783287314', 'NXB Giáo dục', '2020-12-20', 'Advanced Node.js development patterns', 4, 4, 'https://via.placeholder.com/200x300', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Database Systems Concepts', 'Abraham Silberschatz', '978-0073523323', 'NXB Đại học Quốc gia', '2021-01-25', 'Comprehensive database systems textbook', 5, 5, 'https://via.placeholder.com/200x300', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Machine Learning Yearning', 'Andrew Ng', '978-0134045863', 'NXB Khoa học và Kỹ thuật', '2022-02-14', 'Practical machine learning strategies', 7, 7, 'https://via.placeholder.com/200x300', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- More Vietnamese Literature (Category 2)
('Lão Hạc', 'Nam Cao', '978-6041777777', 'NXB Văn học', '2020-03-15', 'Truyện ngắn nổi tiếng của Nam Cao', 8, 8, 'https://via.placeholder.com/200x300', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Việc làng', 'Ngô Tất Tố', '978-6041777778', 'NXB Văn học', '2019-11-20', 'Tiểu thuyết về cuộc sống nông thôn', 6, 6, 'https://via.placeholder.com/200x300', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Tuyển tập truyện ngắn Nguyễn Huy Thiệp', 'Nguyễn Huy Thiệp', '978-6041777779', 'NXB Văn học', '2021-05-10', 'Những tác phẩm xuất sắc của Nguyễn Huy Thiệp', 10, 10, 'https://via.placeholder.com/200x300', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Những đứa con trong gia đình', 'Nguyễn Thi', '978-6041777780', 'NXB Phụ nữ', '2020-08-30', 'Tiểu thuyết về gia đình Việt Nam', 5, 5, 'https://via.placeholder.com/200x300', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- More Foreign Literature (Category 3)
('The Catcher in the Rye', 'J.D. Salinger', '978-0316769174', 'NXB Văn học', '2020-06-15', 'Tiểu thuyết kinh điển về tuổi trẻ', 9, 9, 'https://via.placeholder.com/200x300', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Pride and Prejudice', 'Jane Austen', '978-0141439518', 'NXB Thế giới', '2021-03-20', 'Kiệt tác văn học Anh', 7, 7, 'https://via.placeholder.com/200x300', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('One Hundred Years of Solitude', 'Gabriel García Márquez', '978-0060883287', 'NXB Văn học', '2020-09-12', 'Tiểu thuyết ma thuật hiện thực', 6, 6, 'https://via.placeholder.com/200x300', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('The Lord of the Rings', 'J.R.R. Tolkien', '978-0544003415', 'NXB Trẻ', '2021-12-01', 'Bộ ba nhẫn quyền huyền thoại', 12, 12, 'https://via.placeholder.com/200x300', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Nineteen Eighty-Four (Hardcover)', 'George Orwell', '978-0451524935', 'NXB Văn học', '2020-04-20', 'Phiên bản bìa cứng của 1984', 4, 4, 'https://via.placeholder.com/200x300', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- More Science Books (Category 4)
('Calculus: Early Transcendentals', 'James Stewart', '978-1285741550', 'NXB Giáo dục', '2021-01-15', 'Comprehensive calculus textbook', 8, 8, 'https://via.placeholder.com/200x300', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Organic Chemistry', 'Paula Yurkanis Bruice', '978-0134042282', 'NXB Khoa học và Kỹ thuật', '2020-08-25', 'Advanced organic chemistry textbook', 6, 6, 'https://via.placeholder.com/200x300', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Campbell Biology', 'Jane B. Reece', '978-0134093413', 'NXB Khoa học Tự nhiên', '2021-03-10', 'Comprehensive biology textbook', 10, 10, 'https://via.placeholder.com/200x300', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('University Physics', 'Hugh D. Young', '978-0133969290', 'NXB Giáo dục', '2020-11-30', 'Complete university physics course', 7, 7, 'https://via.placeholder.com/200x300', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- More Business Books (Category 5)
('Good to Great', 'Jim Collins', '978-0066620992', 'NXB Kinh tế', '2020-07-20', 'Why some companies make the leap and others dont', 8, 8, 'https://via.placeholder.com/200x300', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('The Lean Startup', 'Eric Ries', '978-0307887894', 'NXB Lao động', '2021-02-15', 'How todays entrepreneurs use continuous innovation', 9, 9, 'https://via.placeholder.com/200x300', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Thinking, Fast and Slow', 'Daniel Kahneman', '978-0374533557', 'NXB Thế giới', '2020-09-05', 'Behavioral economics masterpiece', 6, 6, 'https://via.placeholder.com/200x300', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- History Books (Category 6)
('Lịch sử Việt Nam', 'Phan Huy Lê', '978-6041888888', 'NXB Giáo dục', '2020-01-10', 'Lịch sử Việt Nam từ thời nguyên thủy đến hiện đại', 12, 12, 'https://via.placeholder.com/200x300', 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Địa lý Việt Nam', 'Trần Đức Thạnh', '978-6041888889', 'NXB Giáo dục', '2021-06-20', 'Địa lý tự nhiên và kinh tế xã hội Việt Nam', 8, 8, 'https://via.placeholder.com/200x300', 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Thế chiến thứ hai', 'Winston Churchill', '978-6041888890', 'NXB Thế giới', '2020-10-15', 'Hồi ký về Thế chiến thứ hai', 5, 5, 'https://via.placeholder.com/200x300', 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- More Self-help Books (Category 7)
('7 Habits of Highly Effective People', 'Stephen Covey', '978-1982137274', 'NXB Tổng hợp TP.HCM', '2020-05-25', 'Powerful lessons in personal change', 15, 15, 'https://via.placeholder.com/200x300', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('How to Win Friends and Influence People', 'Dale Carnegie', '978-0671027032', 'NXB Thế giới', '2019-12-10', 'Timeless advice on human relations', 20, 20, 'https://via.placeholder.com/200x300', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('The Power of Now', 'Eckhart Tolle', '978-1577314806', 'NXB Tôn giáo', '2021-04-30', 'A guide to spiritual enlightenment', 8, 8, 'https://via.placeholder.com/200x300', 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- More Children Books (Category 8)
('Conan thám tử lừng danh - Tập 1', 'Gosho Aoyama', '978-6041999999', 'NXB Kim Đồng', '2020-07-15', 'Truyện thám tử nổi tiếng', 25, 25, 'https://via.placeholder.com/200x300', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Thần đồng đất Việt - Tập 2', 'Nguyễn Nhật Ánh', '978-6041999998', 'NXB Trẻ', '2021-03-20', 'Tiếp theo câu chuyện thần đồng', 15, 15, 'https://via.placeholder.com/200x300', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Truyện cổ tích Việt Nam', 'Nhiều tác giả', '978-6041999997', 'NXB Kim Đồng', '2020-12-25', 'Tuyển tập truyện cổ tích hay nhất', 20, 20, 'https://via.placeholder.com/200x300', 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Comics (Category 9)  
('One Piece - Tập 1', 'Eiichiro Oda', '978-6042000001', 'NXB Kim Đồng', '2021-01-10', 'Manga nổi tiếng về hải tặc', 30, 30, 'https://via.placeholder.com/200x300', 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Naruto - Tập 1', 'Masashi Kishimoto', '978-6042000002', 'NXB Kim Đồng', '2020-11-15', 'Manga ninja huyền thoại', 35, 35, 'https://via.placeholder.com/200x300', 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Dragon Ball - Tập 1', 'Akira Toriyama', '978-6042000003', 'NXB Kim Đồng', '2020-06-20', 'Manga kinh điển về 7 viên ngọc rồng', 40, 40, 'https://via.placeholder.com/200x300', 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================================================
-- 3. ADDITIONAL BORROW RECORDS (25 more records)
-- ==================================================
INSERT INTO borrows (userid, bookid, borrowdate, duedate, returndate, status, notes, createdat, updatedat) VALUES
-- Recent Requests
(9, 24, '2024-11-11 08:30:00', '2024-11-25 23:59:59', NULL, 'request', 'Cần học JavaScript cho dự án web', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(10, 25, '2024-11-11 09:15:00', '2024-11-25 23:59:59', NULL, 'request', 'Muốn học React.js', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(11, 26, '2024-11-11 10:00:00', '2024-11-25 23:59:59', NULL, 'request', 'Cần Node.js cho backend', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(12, 30, '2024-11-10 16:30:00', '2024-11-24 23:59:59', NULL, 'request', 'Đọc văn học Việt Nam', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(13, 32, '2024-11-10 14:20:00', '2024-11-24 23:59:59', NULL, 'request', 'Thích đọc Jane Austen', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Currently Borrowed
(14, 27, '2024-11-05 09:00:00', '2024-11-19 23:59:59', NULL, 'borrowed', 'Học database cho thi cuối kỳ', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(15, 28, '2024-11-06 14:30:00', '2024-11-20 23:59:59', NULL, 'borrowed', 'Machine Learning research', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(16, 35, '2024-11-07 10:15:00', '2024-11-21 23:59:59', NULL, 'borrowed', 'Đọc Lord of the Rings', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(17, 37, '2024-11-08 11:00:00', '2024-11-22 23:59:59', NULL, 'borrowed', 'Học toán cao cấp', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(18, 39, '2024-11-09 15:45:00', '2024-11-23 23:59:59', NULL, 'borrowed', 'Đọc Campbell Biology', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Overdue Books
(19, 31, '2024-10-20 09:30:00', '2024-11-03 23:59:59', NULL, 'borrowed', 'Lão Hạc - văn học Việt Nam', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(20, 33, '2024-10-25 14:15:00', '2024-11-08 23:59:59', NULL, 'borrowed', 'Gabriel García Márquez', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(21, 41, '2024-10-28 16:20:00', '2024-11-11 23:59:59', NULL, 'borrowed', 'Good to Great - business', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Recently Returned
(9, 45, '2024-10-15 08:00:00', '2024-10-29 23:59:59', '2024-10-28 16:30:00', 'returned', 'Đắc nhân tâm phiên bản mới', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(10, 46, '2024-10-18 14:20:00', '2024-11-01 23:59:59', '2024-10-30 10:15:00', 'returned', 'The Power of Now', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(11, 47, '2024-10-20 11:30:00', '2024-11-03 23:59:59', '2024-11-01 15:45:00', 'returned', 'Conan tập 1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(12, 48, '2024-10-22 09:45:00', '2024-11-05 23:59:59', '2024-11-03 09:20:00', 'returned', 'Thần đồng đất Việt tập 2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(13, 49, '2024-10-25 16:00:00', '2024-11-08 23:59:59', '2024-11-06 14:30:00', 'returned', 'Truyện cổ tích Việt Nam', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Rejected Requests
(14, 50, '2024-11-09 13:00:00', '2024-11-23 23:59:59', NULL, 'rejected', 'User đã mượn quá nhiều sách', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(15, 51, '2024-11-08 15:30:00', '2024-11-22 23:59:59', NULL, 'rejected', 'Sách đang bảo trì', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- More Historical Records
(16, 29, '2024-09-15 10:00:00', '2024-09-29 23:59:59', '2024-09-28 11:20:00', 'returned', 'Tuyển tập Nguyễn Huy Thiệp', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(17, 34, '2024-09-20 14:30:00', '2024-10-04 23:59:59', '2024-10-03 16:45:00', 'returned', 'The Catcher in the Rye', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(18, 36, '2024-09-25 09:15:00', '2024-10-09 23:59:59', '2024-10-08 10:30:00', 'returned', 'Organic Chemistry', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(19, 40, '2024-09-28 15:20:00', '2024-10-12 23:59:59', '2024-10-11 14:15:00', 'returned', 'University Physics', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(20, 42, '2024-10-01 11:45:00', '2024-10-15 23:59:59', '2024-10-14 13:25:00', 'returned', 'The Lean Startup', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(21, 44, '2024-10-05 08:30:00', '2024-10-19 23:59:59', '2024-10-18 16:50:00', 'returned', 'Lịch sử Việt Nam', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==================================================
-- 4. ADDITIONAL FEES (15 more fee records)
-- ==================================================
INSERT INTO fees (borrowid, userid, amount, type, status, paymentmethod, createdat, paidat, notes) VALUES
-- Borrow fees for current loans
(18, 14, 20000.00, 'borrow_fee', 'paid', 'cash', '2024-11-05 09:00:00', '2024-11-05 09:15:00', 'Phí mượn Database Systems'),
(19, 15, 20000.00, 'borrow_fee', 'unpaid', NULL, '2024-11-06 14:30:00', NULL, 'Phí mượn Machine Learning'),
(20, 16, 20000.00, 'borrow_fee', 'paid', 'card', '2024-11-07 10:15:00', '2024-11-07 10:30:00', 'Phí mượn Lord of the Rings'),
(21, 17, 20000.00, 'borrow_fee', 'unpaid', NULL, '2024-11-08 11:00:00', NULL, 'Phí mượn Calculus'),
(22, 18, 20000.00, 'borrow_fee', 'paid', 'cash', '2024-11-09 15:45:00', '2024-11-09 16:00:00', 'Phí mượn Campbell Biology'),

-- Late fees for overdue books  
(23, 19, 65000.00, 'late_fee', 'unpaid', NULL, '2024-11-04 00:01:00', NULL, 'Phí trả muộn Lão Hạc - 13 ngày x 5000'),
(24, 20, 30000.00, 'late_fee', 'unpaid', NULL, '2024-11-09 00:01:00', NULL, 'Phí trả muộn One Hundred Years - 6 ngày x 5000'),
(25, 21, 5000.00, 'late_fee', 'unpaid', NULL, '2024-11-12 00:01:00', NULL, 'Phí trả muộn Good to Great - 1 ngày x 5000'),

-- Paid fees from returned books
(26, 9, 20000.00, 'borrow_fee', 'paid', 'cash', '2024-10-15 08:00:00', '2024-10-28 16:30:00', 'Phí mượn 7 Habits - đã thanh toán'),
(27, 10, 20000.00, 'borrow_fee', 'paid', 'card', '2024-10-18 14:20:00', '2024-10-30 10:15:00', 'Phí mượn The Power of Now'),
(28, 11, 20000.00, 'borrow_fee', 'paid', 'cash', '2024-10-20 11:30:00', '2024-11-01 15:45:00', 'Phí mượn Conan'),
(29, 12, 20000.00, 'borrow_fee', 'paid', 'cash', '2024-10-22 09:45:00', '2024-11-03 09:20:00', 'Phí mượn Thần đồng đất Việt'),
(30, 13, 20000.00, 'borrow_fee', 'paid', 'card', '2024-10-25 16:00:00', '2024-11-06 14:30:00', 'Phí mượn Truyện cổ tích'),

-- More historical paid fees
(31, 16, 20000.00, 'borrow_fee', 'paid', 'cash', '2024-09-15 10:00:00', '2024-09-28 11:20:00', 'Phí mượn Tuyển tập Nguyễn Huy Thiệp'),
(32, 17, 20000.00, 'borrow_fee', 'paid', 'cash', '2024-09-20 14:30:00', '2024-10-03 16:45:00', 'Phí mượn The Catcher in the Rye'),
(33, 18, 20000.00, 'borrow_fee', 'paid', 'card', '2024-09-25 09:15:00', '2024-10-08 10:30:00', 'Phí mượn Organic Chemistry');

-- ==================================================
-- 5. UPDATE BOOK AVAILABILITY BASED ON CURRENT BORROWS
-- ==================================================
-- Decrease available copies for currently borrowed books
UPDATE books SET availablecopies = availablecopies - 1 WHERE id = 27; -- Database Systems
UPDATE books SET availablecopies = availablecopies - 1 WHERE id = 28; -- Machine Learning
UPDATE books SET availablecopies = availablecopies - 1 WHERE id = 35; -- Lord of the Rings  
UPDATE books SET availablecopies = availablecopies - 1 WHERE id = 37; -- Calculus
UPDATE books SET availablecopies = availablecopies - 1 WHERE id = 39; -- Campbell Biology
UPDATE books SET availablecopies = availablecopies - 1 WHERE id = 31; -- Lão Hạc (overdue)
UPDATE books SET availablecopies = availablecopies - 1 WHERE id = 33; -- One Hundred Years (overdue)
UPDATE books SET availablecopies = availablecopies - 1 WHERE id = 41; -- Good to Great (overdue)

-- ==================================================
-- 6. VERIFICATION QUERIES FOR ADDITIONAL DATA
-- ==================================================
DO $$
DECLARE
    total_users INTEGER;
    total_books INTEGER; 
    total_borrows INTEGER;
    total_fees INTEGER;
    active_borrows INTEGER;
    overdue_borrows INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_users FROM users;
    SELECT COUNT(*) INTO total_books FROM books;
    SELECT COUNT(*) INTO total_borrows FROM borrows;
    SELECT COUNT(*) INTO total_fees FROM fees;
    
    SELECT COUNT(*) INTO active_borrows FROM borrows WHERE status IN ('request', 'borrowed');
    SELECT COUNT(*) INTO overdue_borrows FROM borrows 
    WHERE status = 'borrowed' AND duedate < CURRENT_DATE;
    
    RAISE NOTICE '=== UPDATED DATABASE STATISTICS ===';
    RAISE NOTICE 'Total Users: %', total_users;
    RAISE NOTICE 'Total Books: %', total_books; 
    RAISE NOTICE 'Total Borrows: %', total_borrows;
    RAISE NOTICE 'Total Fees: %', total_fees;
    RAISE NOTICE 'Active Borrows: %', active_borrows;
    RAISE NOTICE 'Overdue Borrows: %', overdue_borrows;
END $$;

-- Show detailed statistics
SELECT '=== DETAILED STATISTICS ===' as info;

SELECT 'Users by Role' as category, role, COUNT(*) as count 
FROM users GROUP BY role ORDER BY count DESC;

SELECT 'Books by Category' as category, c.name, COUNT(b.id) as count
FROM categories c 
LEFT JOIN books b ON c.id = b.categoryid 
GROUP BY c.id, c.name 
ORDER BY count DESC;

SELECT 'Borrows by Status' as category, status, COUNT(*) as count
FROM borrows GROUP BY status ORDER BY count DESC;

SELECT 'Fees by Type' as category, type, COUNT(*) as count, SUM(amount) as total_amount
FROM fees GROUP BY type ORDER BY total_amount DESC;

SELECT 'Revenue Summary' as category, 
       SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid_amount,
       SUM(CASE WHEN status = 'unpaid' THEN amount ELSE 0 END) as unpaid_amount,
       SUM(amount) as total_amount
FROM fees;

COMMIT;