-- Migration script for UC11: User Management
-- Add columns to support lock/unlock and soft delete functionality

ALTER TABLE users
ADD COLUMN is_locked BOOLEAN DEFAULT FALSE AFTER role,
ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE AFTER is_locked,
ADD COLUMN deleted_at DATETIME DEFAULT NULL AFTER is_deleted;

-- Update existing users to have default values
UPDATE users SET is_locked = FALSE, is_deleted = FALSE WHERE is_locked IS NULL;

-- Add index for better query performance
CREATE INDEX idx_users_deleted ON users(is_deleted);
CREATE INDEX idx_users_locked ON users(is_locked);
