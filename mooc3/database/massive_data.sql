-- ==================================================
-- LIBRARY MANAGEMENT SYSTEM - MASSIVE DATA SET
-- File: massive_data.sql
-- Purpose: Generate massive amount of sample data for testing
-- Target: 200 Users, 500 Books, 1000 Borrows, 800 Fees
-- ==================================================

-- Optimize for bulk insert (only safe settings)
SET session_replication_role = replica; -- Disable triggers for faster insert
SET synchronous_commit = off; -- Faster commits

-- ==================================================
-- 1. MASSIVE USER GENERATION (200 USERS)
-- ==================================================

DO $$
DECLARE
    i INTEGER;
    username_val VARCHAR(50);
    email_val VARCHAR(100);
    fullname_val VARCHAR(100);
    phone_val VARCHAR(20);
    role_val VARCHAR(20);
    birth_year INTEGER;
    birth_month INTEGER;
    birth_day INTEGER;
    dob_val DATE;
    first_names TEXT[] := ARRAY['Nguyen', 'Le', 'Tran', 'Pham', 'Hoang', 'Vu', 'Dao', 'Do', 'Bui', 'Dang', 'Ngo', 'Duong', 'Ly'];
    middle_names TEXT[] := ARRAY['Van', 'Thi', 'Minh', 'Huu', 'Thanh', 'Duc', 'Quang', 'Anh', 'Thu', 'Lan', 'Mai', 'Hong'];
    last_names TEXT[] := ARRAY['An', 'Binh', 'Cuong', 'Dung', 'Em', 'Giang', 'Hai', 'Khanh', 'Linh', 'Minh', 'Nam', 'Oanh', 'Phong', 'Quang', 'Son', 'Tuan', 'Uyen', 'Viet', 'Xuan', 'Yen'];
    domains TEXT[] := ARRAY['gmail.com', 'yahoo.com', 'hotmail.com', 'fpt.edu.vn', 'student.fpt.edu.vn', 'outlook.com'];
BEGIN
    FOR i IN 1..200 LOOP
        username_val := 'user' || LPAD(i::TEXT, 3, '0');
        email_val := username_val || '@' || domains[1 + (i % array_length(domains, 1))];
        
        fullname_val := first_names[1 + (i % array_length(first_names, 1))] || ' ' ||
                       middle_names[1 + ((i * 7) % array_length(middle_names, 1))] || ' ' ||
                       last_names[1 + ((i * 13) % array_length(last_names, 1))];
        
        phone_val := '09' || LPAD((i + 100000000)::TEXT, 8, '0');
        
        -- Distribute roles: 85% user, 10% staff, 5% admin
        IF i <= 170 THEN
            role_val := 'user';
        ELSIF i <= 190 THEN
            role_val := 'staff';
        ELSE
            role_val := 'admin';
        END IF;
        
        birth_year := 1985 + (i % 25); -- Ages between ~15-40
        birth_month := 1 + (i % 12);
        birth_day := 1 + (i % 28);
        dob_val := DATE(birth_year || '-' || LPAD(birth_month::TEXT, 2, '0') || '-' || LPAD(birth_day::TEXT, 2, '0'));
        
        INSERT INTO users (
            username, email, password, fullname, phone, avatarurl, dateofbirth, role, isactive, createdat, updatedat
        ) VALUES (
            username_val,
            email_val,
            '$2a$11$wT8aS5Z5RKUshwzqrmpEVOHIwea70y2VmRnq/recWHjPZu6oSUH/K', -- bcrypt hash of "password123"
            fullname_val,
            phone_val,
            'https://via.placeholder.com/150',
            dob_val,
            role_val,
            (i % 20) != 0, -- 95% active users
            CURRENT_TIMESTAMP - INTERVAL '1 day' * (i % 365),
            CURRENT_TIMESTAMP - INTERVAL '1 hour' * (i % 24)
        );
        
        -- Progress indicator every 50 users
        IF i % 50 = 0 THEN
            RAISE NOTICE 'Generated % users...', i;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Successfully generated 200 users!';
END $$;

-- ==================================================
-- 2. MASSIVE BOOK GENERATION (500 BOOKS)
-- ==================================================

DO $$
DECLARE
    i INTEGER;
    title_val TEXT;
    author_val TEXT;
    isbn_val VARCHAR(20);
    publisher_val TEXT;
    pub_date_val DATE;
    desc_val TEXT;
    total_copies INTEGER;
    available_copies INTEGER;
    category_id INTEGER;
    
    -- Book title prefixes by category
    tech_titles TEXT[] := ARRAY['Programming in', 'Learning', 'Mastering', 'Advanced', 'Introduction to', 'Complete Guide to', 'Professional', 'Effective', 'Modern', 'Building'];
    tech_subjects TEXT[] := ARRAY['JavaScript', 'Python', 'Java', 'C#', 'React', 'Angular', 'Node.js', 'Machine Learning', 'AI', 'Data Science', 'Blockchain', 'Cloud Computing', 'DevOps', 'Cybersecurity', 'Mobile Development'];
    
    literature_titles TEXT[] := ARRAY['The Story of', 'Tales from', 'Journey to', 'Chronicles of', 'Memories of', 'Letters to', 'Dreams of', 'Life in', 'Love in', 'Secrets of'];
    literature_themes TEXT[] := ARRAY['Ancient Village', 'Modern City', 'Countryside', 'Mountain', 'River Delta', 'Homeland', 'Youth', 'Family', 'Friendship', 'Time'];
    
    authors_vn TEXT[] := ARRAY['Nguyen Nhat Anh', 'Nguyen Minh Chau', 'Le Luu', 'Nguyen Tuan', 'To Hoai', 'Thach Lam', 'Vu Trong Phung', 'Kim Lan', 'Tran Dang Khoa', 'Ma Van Khang'];
    authors_foreign TEXT[] := ARRAY['John Smith', 'Maria Garcia', 'David Johnson', 'Emily Brown', 'Michael Davis', 'Sarah Wilson', 'Robert Miller', 'Lisa Anderson', 'James Taylor', 'Jennifer Martinez'];
    
    publishers TEXT[] := ARRAY['NXB Giao duc', 'NXB Khoa hoc va Ky thuat', 'NXB Van hoc', 'NXB Tre', 'NXB Kim Dong', 'NXB Lao dong', 'NXB The gioi', 'NXB Thong tin va Truyen thong', 'NXB Tong hop TP.HCM', 'NXB Dai hoc Quoc gia'];
BEGIN
    FOR i IN 1..500 LOOP
        category_id := 1 + (i % 10); -- Distribute across 10 categories
        
        -- Generate title based on category
        CASE category_id
            WHEN 1 THEN -- Technology
                title_val := tech_titles[1 + (i % array_length(tech_titles, 1))] || ' ' || 
                           tech_subjects[1 + ((i * 7) % array_length(tech_subjects, 1))];
                author_val := authors_foreign[1 + (i % array_length(authors_foreign, 1))];
            WHEN 2, 3 THEN -- Vietnamese/Foreign Literature  
                title_val := literature_titles[1 + (i % array_length(literature_titles, 1))] || ' ' ||
                           literature_themes[1 + ((i * 11) % array_length(literature_themes, 1))];
                IF category_id = 2 THEN
                    author_val := authors_vn[1 + (i % array_length(authors_vn, 1))];
                ELSE
                    author_val := authors_foreign[1 + (i % array_length(authors_foreign, 1))];
                END IF;
            ELSE -- Other categories
                title_val := 'Book ' || i || ' - ' || literature_themes[1 + (i % array_length(literature_themes, 1))];
                author_val := authors_foreign[1 + (i % array_length(authors_foreign, 1))];
        END CASE;
        
        isbn_val := '978-' || LPAD((1000000000 + i)::TEXT, 10, '0');
        publisher_val := publishers[1 + (i % array_length(publishers, 1))];
        pub_date_val := DATE '2010-01-01' + INTERVAL '1 day' * (i % 3650); -- Random dates 2010-2020
        desc_val := 'Comprehensive guide covering ' || title_val || ' with practical examples and exercises.';
        
        -- Vary book quantities realistically
        IF i % 10 = 0 THEN
            total_copies := 1 + (i % 5); -- Some rare books
        ELSIF i % 5 = 0 THEN  
            total_copies := 15 + (i % 25); -- Popular books
        ELSE
            total_copies := 3 + (i % 12); -- Normal books
        END IF;
        
        available_copies := total_copies - (i % (total_copies + 1)); -- Some books borrowed
        
        INSERT INTO books (
            title, author, isbn, publisher, publisheddate, description, 
            totalcopies, availablecopies, imageurl, categoryid, createdat, updatedat
        ) VALUES (
            title_val,
            author_val,
            isbn_val,
            publisher_val,
            pub_date_val,
            desc_val,
            total_copies,
            available_copies,
            'https://via.placeholder.com/200x300',
            category_id,
            CURRENT_TIMESTAMP - INTERVAL '1 day' * (i % 100),
            CURRENT_TIMESTAMP - INTERVAL '1 hour' * (i % 48)
        );
        
        IF i % 100 = 0 THEN
            RAISE NOTICE 'Generated % books...', i;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Successfully generated 500 books!';
END $$;

-- ==================================================
-- 3. MASSIVE BORROW GENERATION (1000 BORROWS)
-- ==================================================

DO $$
DECLARE
    i INTEGER;
    user_id INTEGER;
    book_id INTEGER;
    borrow_date TIMESTAMP;
    due_date TIMESTAMP;
    return_date TIMESTAMP;
    status_val VARCHAR(20);
    notes_val TEXT;
    random_days INTEGER;
    
    statuses TEXT[] := ARRAY['request', 'borrowed', 'returned', 'rejected'];
    status_weights INTEGER[] := ARRAY[10, 25, 55, 10]; -- 10% request, 25% borrowed, 55% returned, 10% rejected
    note_templates TEXT[] := ARRAY[
        'Regular borrow request',
        'Needed for research project', 
        'Required for coursework',
        'Personal interest reading',
        'Group study material',
        'Assignment reference',
        'Thesis research',
        'Professional development',
        'Hobby reading',
        'Exam preparation'
    ];
BEGIN
    FOR i IN 1..1000 LOOP
        -- Select random user (from our 200+ users)
        user_id := 1 + (i % 200);
        
        -- Select random book (from our 500+ books) 
        book_id := 1 + ((i * 7) % 500);
        
        -- Generate random borrow date in last 6 months
        random_days := i % 180;
        borrow_date := CURRENT_TIMESTAMP - INTERVAL '1 day' * random_days - INTERVAL '1 hour' * (i % 24);
        due_date := borrow_date + INTERVAL '14 days';
        
        -- Determine status based on weights
        IF i % 100 < 10 THEN
            status_val := 'request';
            return_date := NULL;
        ELSIF i % 100 < 35 THEN  
            status_val := 'borrowed';
            return_date := NULL;
            -- Some borrowed books are overdue
            IF random_days > 14 THEN
                -- This book is overdue
            END IF;
        ELSIF i % 100 < 90 THEN
            status_val := 'returned';
            -- Return date varies - some on time, some late
            IF (i % 3) = 0 THEN
                return_date := due_date + INTERVAL '1 day' * ((i % 10) + 1); -- Late return
            ELSE
                return_date := due_date - INTERVAL '1 day' * ((i % 3) + 1); -- Early/on-time return
            END IF;
        ELSE
            status_val := 'rejected';
            return_date := NULL;
        END IF;
        
        notes_val := note_templates[1 + (i % array_length(note_templates, 1))];
        
        INSERT INTO borrows (
            userid, bookid, borrowdate, duedate, returndate, status, notes, createdat, updatedat
        ) VALUES (
            user_id,
            book_id,
            borrow_date,
            due_date,
            return_date,
            status_val,
            notes_val,
            borrow_date,
            COALESCE(return_date, CURRENT_TIMESTAMP)
        );
        
        IF i % 200 = 0 THEN
            RAISE NOTICE 'Generated % borrow records...', i;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Successfully generated 1000 borrow records!';
END $$;

-- ==================================================
-- 4. MASSIVE FEE GENERATION (800 FEES)
-- ==================================================

DO $$
DECLARE
    i INTEGER;
    borrow_record RECORD;
    fee_amount DECIMAL(10,2);
    fee_type VARCHAR(20);
    fee_status VARCHAR(20);
    payment_method VARCHAR(20);
    payment_date TIMESTAMP;
    late_days INTEGER;
    
    payment_methods TEXT[] := ARRAY['cash', 'card', 'bank_transfer', 'momo', 'zalopay'];
BEGIN
    -- Generate fees for borrow records
    FOR borrow_record IN (
        SELECT id, userid, borrowdate, duedate, returndate, status 
        FROM borrows 
        WHERE id <= 800
        ORDER BY id
    ) LOOP
        
        -- Always create borrow fee
        INSERT INTO fees (
            borrowid, userid, amount, type, status, paymentmethod, createdat, paidat, notes
        ) VALUES (
            borrow_record.id,
            borrow_record.userid,
            20000.00,
            'borrow_fee',
            CASE 
                WHEN borrow_record.status = 'returned' THEN 'paid'
                WHEN borrow_record.status = 'borrowed' AND (i % 3) = 0 THEN 'paid'
                ELSE 'unpaid'
            END,
            CASE 
                WHEN borrow_record.status IN ('returned') OR ((borrow_record.status = 'borrowed') AND (i % 3) = 0) THEN 
                    payment_methods[1 + (i % array_length(payment_methods, 1))]
                ELSE NULL
            END,
            borrow_record.borrowdate,
            CASE 
                WHEN borrow_record.status = 'returned' THEN borrow_record.returndate
                WHEN borrow_record.status = 'borrowed' AND (i % 3) = 0 THEN borrow_record.borrowdate + INTERVAL '1 hour'
                ELSE NULL
            END,
            'Borrow fee for book ID ' || (borrow_record.id % 500 + 1)
        );
        
        -- Generate late fee if applicable
        IF borrow_record.status = 'returned' AND borrow_record.returndate > borrow_record.duedate THEN
            late_days := EXTRACT(DAY FROM borrow_record.returndate - borrow_record.duedate);
            fee_amount := late_days * 5000.00;
            
            INSERT INTO fees (
                borrowid, userid, amount, type, status, paymentmethod, createdat, paidat, notes
            ) VALUES (
                borrow_record.id,
                borrow_record.userid,
                fee_amount,
                'late_fee',
                CASE WHEN (i % 4) = 0 THEN 'paid' ELSE 'unpaid' END,
                CASE WHEN (i % 4) = 0 THEN payment_methods[1 + (i % array_length(payment_methods, 1))] ELSE NULL END,
                borrow_record.returndate,
                CASE WHEN (i % 4) = 0 THEN borrow_record.returndate + INTERVAL '1 day' ELSE NULL END,
                'Late fee - ' || late_days || ' days overdue'
            );
        ELSIF borrow_record.status = 'borrowed' AND borrow_record.duedate < CURRENT_TIMESTAMP THEN
            -- Current overdue books
            late_days := EXTRACT(DAY FROM CURRENT_TIMESTAMP - borrow_record.duedate);
            fee_amount := late_days * 5000.00;
            
            INSERT INTO fees (
                borrowid, userid, amount, type, status, paymentmethod, createdat, paidat, notes
            ) VALUES (
                borrow_record.id,
                borrow_record.userid,
                fee_amount,
                'late_fee',
                'unpaid',
                NULL,
                borrow_record.duedate + INTERVAL '1 day',
                NULL,
                'Current overdue - ' || late_days || ' days'
            );
        END IF;
        
        i := i + 1;
        
        IF i % 200 = 0 THEN
            RAISE NOTICE 'Generated fees for % borrow records...', i;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Successfully generated fees for 800 borrow records!';
END $$;

-- ==================================================
-- 5. UPDATE BOOK AVAILABILITY BASED ON BORROWS
-- ==================================================

-- Update available copies based on current borrows
UPDATE books 
SET availablecopies = GREATEST(0, totalcopies - (
    SELECT COALESCE(COUNT(*), 0)
    FROM borrows b 
    WHERE b.bookid = books.id 
    AND b.status IN ('request', 'borrowed')
))
WHERE id <= 556; -- Updated to cover all books (original + additional + massive)

-- ==================================================
-- 6. CREATE PERFORMANCE INDEXES FOR MASSIVE DATA
-- ==================================================

-- Additional indexes for better performance with massive data
CREATE INDEX IF NOT EXISTS idx_users_email_active ON users(email, isactive) WHERE isactive = true;
CREATE INDEX IF NOT EXISTS idx_users_role_active ON users(role, isactive) WHERE isactive = true;
CREATE INDEX IF NOT EXISTS idx_books_category_available ON books(categoryid, availablecopies) WHERE availablecopies > 0;
CREATE INDEX IF NOT EXISTS idx_books_author_title ON books(author, title);
CREATE INDEX IF NOT EXISTS idx_borrows_user_status_date ON borrows(userid, status, borrowdate);
CREATE INDEX IF NOT EXISTS idx_borrows_book_status_date ON borrows(bookid, status, borrowdate);
CREATE INDEX IF NOT EXISTS idx_borrows_due_date_status ON borrows(duedate, status) WHERE status = 'borrowed';
CREATE INDEX IF NOT EXISTS idx_fees_user_status ON fees(userid, status);
CREATE INDEX IF NOT EXISTS idx_fees_borrow_type ON fees(borrowid, type);
CREATE INDEX IF NOT EXISTS idx_fees_amount_status ON fees(amount, status) WHERE status = 'unpaid';

-- ==================================================
-- 7. MASSIVE DATA VERIFICATION & STATISTICS
-- ==================================================

DO $$
DECLARE
    total_users INTEGER;
    total_books INTEGER;
    total_borrows INTEGER;
    total_fees INTEGER;
    active_users INTEGER;
    available_books INTEGER;
    active_borrows INTEGER;
    overdue_borrows INTEGER;
    total_revenue DECIMAL(15,2);
    unpaid_amount DECIMAL(15,2);
    avg_books_per_category DECIMAL(10,2);
    most_active_user_id INTEGER;
    most_borrowed_book_id INTEGER;
BEGIN
    -- Basic counts
    SELECT COUNT(*) INTO total_users FROM users;
    SELECT COUNT(*) INTO total_books FROM books;
    SELECT COUNT(*) INTO total_borrows FROM borrows;
    SELECT COUNT(*) INTO total_fees FROM fees;
    
    -- Active counts
    SELECT COUNT(*) INTO active_users FROM users WHERE isactive = true;
    SELECT SUM(availablecopies) INTO available_books FROM books;
    SELECT COUNT(*) INTO active_borrows FROM borrows WHERE status IN ('request', 'borrowed');
    SELECT COUNT(*) INTO overdue_borrows FROM borrows WHERE status = 'borrowed' AND duedate < CURRENT_DATE;
    
    -- Financial data
    SELECT SUM(amount) INTO total_revenue FROM fees WHERE status = 'paid';
    SELECT SUM(amount) INTO unpaid_amount FROM fees WHERE status = 'unpaid';
    
    -- Analytics
    SELECT AVG(book_count) INTO avg_books_per_category 
    FROM (SELECT COUNT(*) as book_count FROM books GROUP BY categoryid) cat_counts;
    
    SELECT userid INTO most_active_user_id 
    FROM borrows GROUP BY userid ORDER BY COUNT(*) DESC LIMIT 1;
    
    SELECT bookid INTO most_borrowed_book_id 
    FROM borrows GROUP BY bookid ORDER BY COUNT(*) DESC LIMIT 1;
    
    RAISE NOTICE '===============================================';
    RAISE NOTICE '       MASSIVE DATA GENERATION COMPLETE       ';
    RAISE NOTICE '===============================================';
    RAISE NOTICE 'Total Users: % (% active)', total_users, active_users;
    RAISE NOTICE 'Total Books: % (% available copies)', total_books, available_books;
    RAISE NOTICE 'Total Borrows: % (% currently active)', total_borrows, active_borrows;
    RAISE NOTICE 'Overdue Borrows: %', overdue_borrows;
    RAISE NOTICE 'Total Fees: %', total_fees;
    RAISE NOTICE 'Revenue Collected: % VND', total_revenue;
    RAISE NOTICE 'Unpaid Amount: % VND', unpaid_amount;
    RAISE NOTICE 'Avg Books per Category: %', avg_books_per_category;
    RAISE NOTICE 'Most Active User ID: %', most_active_user_id;
    RAISE NOTICE 'Most Borrowed Book ID: %', most_borrowed_book_id;
    RAISE NOTICE '===============================================';
END $$;

-- Detailed statistics by category
SELECT '=== BOOKS BY CATEGORY ===' as info;
SELECT c.name as category, COUNT(b.id) as total_books, SUM(b.totalcopies) as total_copies, SUM(b.availablecopies) as available_copies
FROM categories c 
LEFT JOIN books b ON c.id = b.categoryid 
GROUP BY c.id, c.name 
ORDER BY total_books DESC;

SELECT '=== USERS BY ROLE ===' as info;
SELECT role, COUNT(*) as total, SUM(CASE WHEN isactive THEN 1 ELSE 0 END) as active
FROM users GROUP BY role ORDER BY total DESC;

SELECT '=== BORROWS BY STATUS ===' as info;
SELECT status, COUNT(*) as count, 
       ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM borrows), 2) as percentage
FROM borrows GROUP BY status ORDER BY count DESC;

SELECT '=== FEES SUMMARY ===' as info;
SELECT type, status, COUNT(*) as count, SUM(amount) as total_amount
FROM fees GROUP BY type, status ORDER BY type, status;

SELECT '=== TOP 10 MOST BORROWED BOOKS ===' as info;
SELECT b.title, b.author, COUNT(br.id) as borrow_count
FROM books b
JOIN borrows br ON b.id = br.bookid
GROUP BY b.id, b.title, b.author
ORDER BY borrow_count DESC
LIMIT 10;

SELECT '=== TOP 10 MOST ACTIVE USERS ===' as info;
SELECT u.username, u.fullname, COUNT(br.id) as borrow_count
FROM users u
JOIN borrows br ON u.id = br.userid
GROUP BY u.id, u.username, u.fullname
ORDER BY borrow_count DESC
LIMIT 10;

-- Reset PostgreSQL settings
SET session_replication_role = DEFAULT;
SET synchronous_commit = on;

-- Final completion message
DO $$
BEGIN
    RAISE NOTICE 'Massive data generation completed successfully!';
    RAISE NOTICE 'Database now contains production-level data volume for testing.';
END $$;

COMMIT;