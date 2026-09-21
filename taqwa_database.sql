-- ==========================================================
-- TAQWA ENTERPRISE (তাকওয়া এন্টারপ্রাইজ)
-- E-COMMERCE PRODUCTION DATABASE SCHEMA FOR MYSQL / HOSTINGER
-- Engine: InnoDB | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- ==========================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+06:00"; -- Bangladesh Standard Time

-- --------------------------------------------------------
-- Table structure for `products`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `products` (
  `id` varchar(64) NOT NULL,
  `slug` varchar(191) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `bangla_name` varchar(255) DEFAULT NULL,
  `category` varchar(64) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `original_price` decimal(10,2) DEFAULT NULL,
  `cost_price` decimal(10,2) DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `unit` varchar(32) DEFAULT 'kg',
  `weight` varchar(64) DEFAULT NULL,
  `short_description` text DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `image` varchar(512) NOT NULL,
  `additional_images` json DEFAULT NULL,
  `is_featured` tinyint(1) DEFAULT 0,
  `best_seller` tinyint(1) DEFAULT 0,
  `rating` decimal(3,2) DEFAULT 5.00,
  `reviews_count` int(11) DEFAULT 0,
  `sku` varchar(64) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `users`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(191) NOT NULL,
  `phone` varchar(32) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(32) NOT NULL DEFAULT 'Customer',
  `address` text DEFAULT NULL,
  `district` varchar(64) DEFAULT NULL,
  `avatar` varchar(512) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `orders`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id` varchar(64) NOT NULL,
  `tracking_id` varchar(64) DEFAULT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_email` varchar(191) DEFAULT NULL,
  `customer_phone` varchar(32) NOT NULL,
  `delivery_address` text NOT NULL,
  `district` varchar(64) NOT NULL,
  `courier_point_id` varchar(64) DEFAULT NULL,
  `courier_name` varchar(128) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `delivery_charge` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `coupon_code` varchar(64) DEFAULT NULL,
  `payment_method` varchar(64) NOT NULL DEFAULT 'cod',
  `payment_status` varchar(32) NOT NULL DEFAULT 'unpaid',
  `payment_trx_id` varchar(128) DEFAULT NULL,
  `status` varchar(32) NOT NULL DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `invoice_number` varchar(64) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tracking_id` (`tracking_id`),
  KEY `idx_status` (`status`),
  KEY `idx_phone` (`customer_phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `order_items`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` varchar(64) NOT NULL,
  `product_id` varchar(64) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_image` varchar(512) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int(11) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order` (`order_id`),
  KEY `idx_product` (`product_id`),
  CONSTRAINT `fk_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `courier_points`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `courier_points` (
  `id` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL,
  `bangla_name` varchar(255) DEFAULT NULL,
  `district` varchar(64) NOT NULL,
  `address` text NOT NULL,
  `phone` varchar(64) DEFAULT NULL,
  `courier_service` varchar(64) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_district` (`district`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `expenses`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` varchar(64) NOT NULL,
  `title` varchar(255) NOT NULL,
  `category` varchar(64) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `expense_date` date NOT NULL,
  `notes` text DEFAULT NULL,
  `created_by` varchar(128) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `uploaded_files`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `uploaded_files` (
  `id` varchar(128) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `mime_type` varchar(64) DEFAULT 'image/jpeg',
  `file_size` int(11) DEFAULT 0,
  `disk_path` varchar(512) NOT NULL,
  `public_url` varchar(512) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_filename` (`filename`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Initial Default Admin User (Password: admin123)
-- --------------------------------------------------------
INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password_hash`, `role`, `address`, `district`)
VALUES 
('u-admin', 'Taqwa Master Admin', 'taqwaenterpriseoffice@gmail.com', '01711223344', 'admin123', 'Super Admin', 'Dhaka, Bangladesh', 'Dhaka')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- --------------------------------------------------------
-- Initial Default Courier Hubs
-- --------------------------------------------------------
INSERT INTO `courier_points` (`id`, `name`, `bangla_name`, `district`, `address`, `phone`, `courier_service`, `is_active`)
VALUES
('cp-1', 'Dhaka Central Hub', 'ঢাকা সেন্ট্রাল হাব', 'Dhaka', 'Motijheel Commercial Area, Dhaka', '01711000111', 'Steadfast', 1),
('cp-2', 'Mirpur Branch', 'মিরপুর ব্রাঞ্চ', 'Dhaka', 'Section 10, Mirpur, Dhaka', '01711000222', 'Sundarban', 1),
('cp-3', 'Uttara Express Hub', 'উত্তরা এক্সপ্রেস হাব', 'Dhaka', 'Sector 3, Uttara, Dhaka', '01711000333', 'RedX', 1),
('cp-4', 'Chittagong Agrabad Hub', 'চট্টগ্রাম আগ্রাবাদ হাব', 'Chittagong', 'Agrabad Commercial Area, Chittagong', '01711000444', 'Steadfast', 1),
('cp-5', 'Sylhet Zindabazar Hub', 'সিলেট জিন্দাবাজার হাব', 'Sylhet', 'Zindabazar Point, Sylhet', '01711000555', 'SA Paribahan', 1),
('cp-6', 'Rajshahi Shaheb Bazar Hub', 'রাজশাহী সাহেব বাজার হাব', 'Rajshahi', 'Shaheb Bazar, Rajshahi', '01711000666', 'Sundarban', 1)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
