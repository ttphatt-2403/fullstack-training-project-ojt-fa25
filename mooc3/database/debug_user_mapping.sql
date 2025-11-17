-- Kiểm tra UserIds trong borrows có tồn tại trong users không
SELECT 
    b.userid as borrow_userid,
    u.id as user_id,
    u.username,
    u.fullname
FROM borrows b 
LEFT JOIN users u ON b.userid = u.id
WHERE b.status = 'returned'
AND b.id IN (2399, 2219, 2400, 2401, 2402)
ORDER BY b.id;

-- Kiểm tra range UserIds trong both tables
SELECT 'BORROWS' as source, MIN(userid) as min_id, MAX(userid) as max_id FROM borrows
UNION ALL
SELECT 'USERS' as source, MIN(id) as min_id, MAX(id) as max_id FROM users;

-- Kiểm tra một vài users cụ thể
SELECT id, username, fullname FROM users WHERE id IN (161, 162, 163, 164, 165) ORDER BY id;