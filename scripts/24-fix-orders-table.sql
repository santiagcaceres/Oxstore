-- Adding missing order_status column to orders table
-- Add order_status column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_status VARCHAR(50) DEFAULT 'pending';

-- Update existing records to have a default order_status based on current status
UPDATE orders 
SET order_status = CASE 
    WHEN status = 'completed' THEN 'completed'
    WHEN status = 'cancelled' THEN 'cancelled'
    WHEN status = 'processing' THEN 'processing'
    ELSE 'pending'
END
WHERE order_status IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status);
