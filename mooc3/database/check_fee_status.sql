-- Check fee status after IPN
SELECT id, status, paymentmethod, notes, paidat FROM fees WHERE id = 67;