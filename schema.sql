-- ======================================================
-- TAQWA ENTERPRISE - MYSQL DATABASE SCHEMA & INITIAL DATA
-- Run this SQL in Hostinger phpMyAdmin (SQL Tab / Import Tab)
-- ======================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------
-- 1. Table structure for `products`
-- ------------------------------------------------------
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(64) PRIMARY KEY,
  `slug` VARCHAR(191) UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `bangla_name` VARCHAR(255),
  `category` VARCHAR(64) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `original_price` DECIMAL(10, 2) DEFAULT NULL,
  `cost_price` DECIMAL(10, 2) DEFAULT NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `unit` VARCHAR(32) DEFAULT 'kg',
  `weight` VARCHAR(64) DEFAULT NULL,
  `short_description` TEXT DEFAULT NULL,
  `description` LONGTEXT DEFAULT NULL,
  `image` VARCHAR(512) NOT NULL,
  `additional_images` JSON DEFAULT NULL,
  `is_featured` BOOLEAN DEFAULT FALSE,
  `best_seller` BOOLEAN DEFAULT FALSE,
  `rating` DECIMAL(3, 2) DEFAULT 5.00,
  `reviews_count` INT DEFAULT 0,
  `sku` VARCHAR(64) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (`category`),
  INDEX idx_slug (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------
-- 2. Table structure for `users`
-- ------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `phone` VARCHAR(32) DEFAULT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(32) NOT NULL DEFAULT 'Customer',
  `address` TEXT DEFAULT NULL,
  `district` VARCHAR(64) DEFAULT NULL,
  `avatar` VARCHAR(512) DEFAULT NULL,
  `loyalty_points` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (`email`),
  INDEX idx_role (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------
-- 3. Table structure for `orders`
-- ------------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(64) PRIMARY KEY,
  `tracking_id` VARCHAR(64) UNIQUE,
  `customer_name` VARCHAR(255) NOT NULL,
  `customer_email` VARCHAR(191) DEFAULT NULL,
  `customer_phone` VARCHAR(32) NOT NULL,
  `delivery_address` TEXT NOT NULL,
  `district` VARCHAR(64) NOT NULL,
  `courier_point_id` VARCHAR(64) DEFAULT NULL,
  `courier_name` VARCHAR(128) DEFAULT NULL,
  `total_amount` DECIMAL(10, 2) NOT NULL,
  `delivery_charge` DECIMAL(10, 2) NOT NULL DEFAULT 0,
  `discount_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
  `coupon_code` VARCHAR(64) DEFAULT NULL,
  `payment_method` VARCHAR(64) NOT NULL DEFAULT 'cod',
  `payment_status` VARCHAR(32) NOT NULL DEFAULT 'unpaid',
  `payment_trx_id` VARCHAR(128) DEFAULT NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'pending',
  `notes` TEXT DEFAULT NULL,
  `invoice_number` VARCHAR(64) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tracking (`tracking_id`),
  INDEX idx_status (`status`),
  INDEX idx_phone (`customer_phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------
-- 4. Table structure for `order_items`
-- ------------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(64) NOT NULL,
  `product_id` VARCHAR(64) NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `product_image` VARCHAR(512) DEFAULT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `quantity` INT NOT NULL,
  `total_price` DECIMAL(10, 2) NOT NULL,
  INDEX idx_order (`order_id`),
  INDEX idx_product (`product_id`),
  CONSTRAINT fk_order FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------
-- 5. Table structure for `courier_points`
-- ------------------------------------------------------
CREATE TABLE IF NOT EXISTS `courier_points` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `bangla_name` VARCHAR(255) DEFAULT NULL,
  `district` VARCHAR(64) NOT NULL,
  `address` TEXT NOT NULL,
  `phone` VARCHAR(64) DEFAULT NULL,
  `courier_service` VARCHAR(64) NOT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_district (`district`),
  INDEX idx_service (`courier_service`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------
-- 6. Table structure for `expenses`
-- ------------------------------------------------------
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` VARCHAR(64) PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(64) NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `expense_date` DATE NOT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_by` VARCHAR(128) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------
-- 7. Table structure for `uploaded_files`
-- ------------------------------------------------------
CREATE TABLE IF NOT EXISTS `uploaded_files` (
  `id` VARCHAR(128) PRIMARY KEY,
  `filename` VARCHAR(255) NOT NULL,
  `mime_type` VARCHAR(64) DEFAULT 'image/jpeg',
  `file_size` INT DEFAULT 0,
  `disk_path` VARCHAR(512) NOT NULL,
  `public_url` VARCHAR(512) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_filename (`filename`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------
-- Initial Admin User Seed
-- ------------------------------------------------------
INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password_hash`, `role`, `address`, `district`)
VALUES ('usr_admin_1', 'Super Admin', 'admin@taqwa.com', '01700000000', 'admin123', 'SuperAdmin', 'Dhaka, Bangladesh', 'Dhaka')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

SET FOREIGN_KEY_CHECKS = 1;
