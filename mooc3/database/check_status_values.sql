-- Kiểm tra các giá trị status hiện có trong bảng borrows
SELECT 
    status,
    COUNT(*) as count
FROM borrows 
GROUP BY status 
ORDER BY count DESC;

-- Xem 10 records đầu tiên để hiểu cấu trúc
SELECT 
    id,
    status,
    borrowdate,
    returndate,
    userid,
    bookid
FROM borrows 
LIMIT 10;

-- Kiểm tra các status cụ thể
SELECT COUNT(*) as pending_count FROM borrows WHERE status = 'Pending';
SELECT COUNT(*) as active_count FROM borrows WHERE status = 'Active'; 
SELECT COUNT(*) as overdue_count FROM borrows WHERE status = 'Overdue';
SELECT COUNT(*) as returned_count FROM borrows WHERE status = 'Returned';

-- Kiểm tra với chữ thường
SELECT COUNT(*) as pending_lower FROM borrows WHERE status = 'pending';
SELECT COUNT(*) as active_lower FROM borrows WHERE status = 'active';
SELECT COUNT(*) as overdue_lower FROM borrows WHERE status = 'overdue';
SELECT COUNT(*) as returned_lower FROM borrows WHERE status = 'returned';