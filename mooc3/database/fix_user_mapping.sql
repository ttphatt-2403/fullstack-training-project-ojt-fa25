-- Fix UserIDs trong borrow records để khớp với existing users
-- Lấy danh sách UserIDs thật từ users table
WITH valid_user_ids AS (
    SELECT id FROM users ORDER BY id
),
-- Map từng borrow record với user ngẫu nhiên có thật
borrow_user_mapping AS (
    SELECT 
        b.id as borrow_id,
        b.userid as old_userid,
        -- Chọn user ngẫu nhiên từ list valid users
        (SELECT id FROM valid_user_ids OFFSET (RANDOM() * (SELECT COUNT(*) FROM valid_user_ids))::INTEGER LIMIT 1) as new_userid
    FROM borrows b
)
-- Cập nhật borrow records
UPDATE borrows 
SET userid = bum.new_userid
FROM borrow_user_mapping bum
WHERE borrows.id = bum.borrow_id;

-- Kiểm tra sau khi update
SELECT 
    'AFTER_UPDATE' as status,
    COUNT(*) as total_borrows,
    COUNT(DISTINCT b.userid) as distinct_userids,
    COUNT(u.id) as matched_users
FROM borrows b
LEFT JOIN users u ON b.userid = u.id;