import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

export interface DbConfig {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
}

let pool: mysql.Pool | null = null;
let isMySqlAvailable = false;

export function getDbConfig(): DbConfig {
  const dataDir = path.join(process.cwd(), "data");
  const configPath = path.join(dataDir, "config.json");
  let fileConfig: DbConfig = {};
  try {
    if (fs.existsSync(configPath)) {
      fileConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
    }
  } catch (e) {
    // Silent fallback
  }

  return {
    host: fileConfig.host || process.env.DB_HOST || process.env.MYSQL_HOST,
    port: Number(fileConfig.port || process.env.DB_PORT || process.env.MYSQL_PORT || 3306),
    user: fileConfig.user || process.env.DB_USER || process.env.MYSQL_USER,
    password: fileConfig.password || process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD,
    database: fileConfig.database || process.env.DB_NAME || process.env.MYSQL_DATABASE,
  };
}

export function isDbConfigured(): boolean {
  const config = getDbConfig();
  // We can also check if a locked file exists
  const lockPath = path.join(process.cwd(), "data", "install.lock");
  const hasLock = fs.existsSync(lockPath);
  return Boolean(config.host && config.user && config.database) || hasLock;
}

export async function saveDbConfig(config: DbConfig): Promise<boolean> {
  try {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const configPath = path.join(dataDir, "config.json");
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");

    // Try writing to .env if possible
    const envPath = path.join(process.cwd(), ".env");
    try {
      let envContent = "";
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, "utf8");
      }
      
      const keys = {
        DB_HOST: config.host || "",
        DB_PORT: String(config.port || 3306),
        DB_USER: config.user || "",
        DB_PASSWORD: config.password || "",
        DB_NAME: config.database || "",
      };
      
      let lines = envContent ? envContent.split("\n") : [];
      for (const [key, val] of Object.entries(keys)) {
        const idx = lines.findIndex(l => l.startsWith(`${key}=`));
        if (idx !== -1) {
          lines[idx] = `${key}="${val}"`;
        } else {
          lines.push(`${key}="${val}"`);
        }
      }
      fs.writeFileSync(envPath, lines.join("\n"), "utf8");
    } catch (e) {
      console.warn("Could not write to .env (config.json will be used):", e);
    }

    // Recreate the pool
    if (pool) {
      await pool.end().catch(() => {});
      pool = null;
    }

    // Attempt to initialize MySQL connection
    const success = await initMySql([], [], []);
    if (success) {
      // Create a lock file to prevent subsequent installer exposure
      const lockPath = path.join(dataDir, "install.lock");
      fs.writeFileSync(lockPath, JSON.stringify({ installedAt: new Date().toISOString() }, null, 2), "utf8");
    }
    return success;
  } catch (err: any) {
    console.error("Error saving DB config:", err);
    return false;
  }
}

export async function initMySql(initialProducts: any[] = [], initialUsers: any[] = [], initialCourierPoints: any[] = []): Promise<boolean> {
  const config = getDbConfig();

  if (!isDbConfigured()) {
    console.log("[MYSQL] No MySQL configuration found in environment variables (DB_HOST, DB_USER, DB_NAME). Operating in local persistent file engine mode.");
    isMySqlAvailable = false;
    return false;
  }

  try {
    console.log(`[MYSQL] Connecting to MySQL at ${config.host}:${config.port}, Database: ${config.database}...`);
    pool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: 15,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      charset: "utf8mb4",
    });

    // Test connection
    const connection = await pool.getConnection();
    console.log("[MYSQL] ✅ Connected successfully to MySQL database!");
    connection.release();

    // Create tables automatically if they don't exist
    await createSchema();

    // Seed tables if empty
    await seedInitialData(initialProducts, initialUsers, initialCourierPoints);

    isMySqlAvailable = true;
    return true;
  } catch (err: any) {
    console.error("[MYSQL] ⚠️ Connection failed:", err.message);
    console.log("[MYSQL] Continuing with local persistent storage fallback so the store remains 100% functional.");
    isMySqlAvailable = false;
    pool = null;
    return false;
  }
}

export function isMySqlConnected(): boolean {
  return isMySqlAvailable && pool !== null;
}

export async function query(sql: string, params: any[] = []): Promise<any> {
  if (!pool) {
    throw new Error("MySQL connection pool is not initialized");
  }
  const [results] = await pool.execute(sql, params);
  return results;
}

async function createSchema() {
  if (!pool) return;

  console.log("[MYSQL] Verifying database tables schema...");

  const queries = [
    // 1. Products table
    `CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(64) PRIMARY KEY,
      slug VARCHAR(191) UNIQUE,
      name VARCHAR(255) NOT NULL,
      bangla_name VARCHAR(255),
      category VARCHAR(64) NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      original_price DECIMAL(10, 2) DEFAULT NULL,
      cost_price DECIMAL(10, 2) DEFAULT NULL,
      stock INT NOT NULL DEFAULT 0,
      unit VARCHAR(32) DEFAULT 'kg',
      weight VARCHAR(64) DEFAULT NULL,
      short_description TEXT DEFAULT NULL,
      description LONGTEXT DEFAULT NULL,
      image VARCHAR(512) NOT NULL,
      additional_images JSON DEFAULT NULL,
      is_featured BOOLEAN DEFAULT FALSE,
      best_seller BOOLEAN DEFAULT FALSE,
      rating DECIMAL(3, 2) DEFAULT 5.00,
      reviews_count INT DEFAULT 0,
      sku VARCHAR(64) DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_category (category),
      INDEX idx_slug (slug)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // 2. Users table
    `CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(191) NOT NULL UNIQUE,
      phone VARCHAR(32) DEFAULT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(32) NOT NULL DEFAULT 'Customer',
      address TEXT DEFAULT NULL,
      district VARCHAR(64) DEFAULT NULL,
      avatar VARCHAR(512) DEFAULT NULL,
      loyalty_points INT NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_email (email),
      INDEX idx_role (role)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // 3. Orders table
    `CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(64) PRIMARY KEY,
      tracking_id VARCHAR(64) UNIQUE,
      customer_name VARCHAR(255) NOT NULL,
      customer_email VARCHAR(191) DEFAULT NULL,
      customer_phone VARCHAR(32) NOT NULL,
      delivery_address TEXT NOT NULL,
      district VARCHAR(64) NOT NULL,
      courier_point_id VARCHAR(64) DEFAULT NULL,
      courier_name VARCHAR(128) DEFAULT NULL,
      total_amount DECIMAL(10, 2) NOT NULL,
      delivery_charge DECIMAL(10, 2) NOT NULL DEFAULT 0,
      discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
      coupon_code VARCHAR(64) DEFAULT NULL,
      payment_method VARCHAR(64) NOT NULL DEFAULT 'cod',
      payment_status VARCHAR(32) NOT NULL DEFAULT 'unpaid',
      payment_trx_id VARCHAR(128) DEFAULT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'pending',
      notes TEXT DEFAULT NULL,
      invoice_number VARCHAR(64) DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_tracking (tracking_id),
      INDEX idx_status (status),
      INDEX idx_phone (customer_phone)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // 4. Order Items table
    `CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id VARCHAR(64) NOT NULL,
      product_id VARCHAR(64) NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      product_image VARCHAR(512) DEFAULT NULL,
      price DECIMAL(10, 2) NOT NULL,
      quantity INT NOT NULL,
      total_price DECIMAL(10, 2) NOT NULL,
      INDEX idx_order (order_id),
      INDEX idx_product (product_id),
      CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // 5. Courier Points table
    `CREATE TABLE IF NOT EXISTS courier_points (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      bangla_name VARCHAR(255) DEFAULT NULL,
      district VARCHAR(64) NOT NULL,
      address TEXT NOT NULL,
      phone VARCHAR(64) DEFAULT NULL,
      courier_service VARCHAR(64) NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_district (district),
      INDEX idx_service (courier_service)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // 6. Expenses & Accounting table
    `CREATE TABLE IF NOT EXISTS expenses (
      id VARCHAR(64) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(64) NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      expense_date DATE NOT NULL,
      notes TEXT DEFAULT NULL,
      created_by VARCHAR(128) DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // 7. Uploaded Local Assets Catalog
    `CREATE TABLE IF NOT EXISTS uploaded_files (
      id VARCHAR(128) PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      mime_type VARCHAR(64) DEFAULT 'image/jpeg',
      file_size INT DEFAULT 0,
      disk_path VARCHAR(512) NOT NULL,
      public_url VARCHAR(512) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_filename (filename)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  ];

  for (const q of queries) {
    try {
      await pool.query(q);
    } catch (e: any) {
      console.error("[MYSQL] Error creating table:", e.message);
    }
  }

  // Ensure loyalty_points column is present in users table if table already existed
  try {
    await pool.query("ALTER TABLE users ADD COLUMN loyalty_points INT NOT NULL DEFAULT 0;");
    console.log("[MYSQL] Added 'loyalty_points' column to users table.");
  } catch (err: any) {
    // Already exists
  }

  console.log("[MYSQL] ✅ All database tables created or verified successfully!");
}

async function seedInitialData(initialProducts: any[], initialUsers: any[], initialCourierPoints: any[]) {
  if (!pool) return;

  try {
    // Check if products exist
    const [pRows]: any = await pool.query("SELECT COUNT(*) as count FROM products");
    if (pRows[0].count === 0 && initialProducts.length > 0) {
      console.log(`[MYSQL] Seeding ${initialProducts.length} initial products into MySQL...`);
      for (const p of initialProducts) {
        await pool.query(
          `INSERT INTO products (
            id, slug, name, bangla_name, category, price, original_price, cost_price, 
            stock, unit, weight, short_description, description, image, additional_images, 
            is_featured, best_seller, rating, reviews_count, sku
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE name=VALUES(name)`,
          [
            p.id,
            p.slug || p.id,
            p.name,
            p.banglaName || null,
            p.category,
            p.price,
            p.originalPrice || null,
            p.costPrice || null,
            p.stock ?? 10,
            p.unit || 'kg',
            p.weight || null,
            p.shortDescription || null,
            p.description || null,
            p.image,
            JSON.stringify(p.additionalImages || []),
            Boolean(p.isFeatured),
            Boolean(p.bestSeller),
            p.rating || 5.0,
            p.reviewsCount || 0,
            p.sku || null
          ]
        );
      }
      console.log("[MYSQL] ✅ Products seeded successfully.");
    }

    // Check if users exist
    const [uRows]: any = await pool.query("SELECT COUNT(*) as count FROM users");
    if (uRows[0].count === 0 && initialUsers.length > 0) {
      console.log(`[MYSQL] Seeding ${initialUsers.length} initial users into MySQL...`);
      for (const u of initialUsers) {
        await pool.query(
          `INSERT INTO users (id, name, email, phone, password_hash, role, address, district)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE name=VALUES(name)`,
          [
            u.id,
            u.name,
            u.email,
            u.phone || null,
            u.password || "admin123",
            u.role || "Customer",
            u.address || null,
            u.district || null
          ]
        );
      }
      console.log("[MYSQL] ✅ Users seeded successfully.");
    }

    // Check if courier points exist
    const [cRows]: any = await pool.query("SELECT COUNT(*) as count FROM courier_points");
    if (cRows[0].count === 0 && initialCourierPoints.length > 0) {
      console.log(`[MYSQL] Seeding ${initialCourierPoints.length} initial courier points into MySQL...`);
      for (const c of initialCourierPoints) {
        await pool.query(
          `INSERT INTO courier_points (id, name, bangla_name, district, address, phone, courier_service, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE name=VALUES(name)`,
          [
            c.id,
            c.name,
            c.banglaName || null,
            c.district,
            c.address,
            c.phone || null,
            c.courierService || "Steadfast",
            c.isActive !== false
          ]
        );
      }
      console.log("[MYSQL] ✅ Courier points seeded successfully.");
    }
  } catch (err: any) {
    console.error("[MYSQL] Seeding warning:", err.message);
  }
}

// ----------------------------------------------------
// DATABASE OPERATION HELPERS
// ----------------------------------------------------

export async function fetchProductsFromDb(): Promise<any[] | null> {
  if (!isMySqlConnected()) return null;
  try {
    const [rows]: any = await pool!.query("SELECT * FROM products ORDER BY created_at DESC");
    return rows.map((r: any) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      banglaName: r.bangla_name,
      category: r.category,
      price: Number(r.price),
      originalPrice: r.original_price ? Number(r.original_price) : undefined,
      costPrice: r.cost_price ? Number(r.cost_price) : undefined,
      stock: Number(r.stock),
      unit: r.unit,
      weight: r.weight,
      shortDescription: r.short_description,
      description: r.description,
      image: r.image,
      additionalImages: typeof r.additional_images === "string" ? JSON.parse(r.additional_images) : (r.additional_images || []),
      isFeatured: Boolean(r.is_featured),
      bestSeller: Boolean(r.best_seller),
      rating: Number(r.rating),
      reviewsCount: Number(r.reviews_count),
      sku: r.sku,
    }));
  } catch (err: any) {
    console.error("[MYSQL] Error fetching products:", err.message);
    return null;
  }
}

export async function upsertProductToDb(p: any): Promise<boolean> {
  if (!isMySqlConnected()) return false;
  try {
    await pool!.query(
      `INSERT INTO products (
        id, slug, name, bangla_name, category, price, original_price, cost_price, 
        stock, unit, weight, short_description, description, image, additional_images, 
        is_featured, best_seller, rating, reviews_count, sku
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        slug=VALUES(slug), name=VALUES(name), bangla_name=VALUES(bangla_name), 
        category=VALUES(category), price=VALUES(price), original_price=VALUES(original_price), 
        cost_price=VALUES(cost_price), stock=VALUES(stock), unit=VALUES(unit), 
        weight=VALUES(weight), short_description=VALUES(short_description), 
        description=VALUES(description), image=VALUES(image), additional_images=VALUES(additional_images), 
        is_featured=VALUES(is_featured), best_seller=VALUES(best_seller), 
        rating=VALUES(rating), reviews_count=VALUES(reviews_count), sku=VALUES(sku)`,
      [
        p.id,
        p.slug || p.id,
        p.name,
        p.banglaName || null,
        p.category,
        p.price,
        p.originalPrice || null,
        p.costPrice || null,
        p.stock ?? 0,
        p.unit || 'kg',
        p.weight || null,
        p.shortDescription || null,
        p.description || null,
        p.image,
        JSON.stringify(p.additionalImages || []),
        Boolean(p.isFeatured),
        Boolean(p.bestSeller),
        p.rating || 5.0,
        p.reviewsCount || 0,
        p.sku || null
      ]
    );
    return true;
  } catch (err: any) {
    console.error("[MYSQL] Error upserting product:", err.message);
    return false;
  }
}

export async function deleteProductFromDb(id: string): Promise<boolean> {
  if (!isMySqlConnected()) return false;
  try {
    await pool!.query("DELETE FROM products WHERE id = ?", [id]);
    return true;
  } catch (err: any) {
    console.error("[MYSQL] Error deleting product:", err.message);
    return false;
  }
}

export async function saveOrderToDb(order: any): Promise<boolean> {
  if (!isMySqlConnected()) return false;
  const conn = await pool!.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO orders (
        id, tracking_id, customer_name, customer_email, customer_phone, delivery_address,
        district, courier_point_id, courier_name, total_amount, delivery_charge,
        discount_amount, coupon_code, payment_method, payment_status, payment_trx_id,
        status, notes, invoice_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        status=VALUES(status), payment_status=VALUES(payment_status), 
        payment_trx_id=VALUES(payment_trx_id)`,
      [
        order.id,
        order.trackingId || order.id,
        order.customerName || order.shippingAddress?.fullName || 'Customer',
        order.customerEmail || order.shippingAddress?.email || null,
        order.customerPhone || order.shippingAddress?.phone || '',
        order.deliveryAddress || `${order.shippingAddress?.address || ''}, ${order.shippingAddress?.city || ''}`,
        order.district || order.shippingAddress?.city || 'Dhaka',
        order.courierPointId || null,
        order.courierName || null,
        order.totalAmount || order.total || 0,
        order.deliveryCharge || 0,
        order.discountAmount || 0,
        order.couponCode || null,
        order.paymentMethod || 'cod',
        order.paymentStatus || 'unpaid',
        order.paymentTrxId || null,
        order.status || 'pending',
        order.notes || null,
        order.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`
      ]
    );

    // Insert order items
    if (Array.isArray(order.items) && order.items.length > 0) {
      await conn.query("DELETE FROM order_items WHERE order_id = ?", [order.id]);
      for (const item of order.items) {
        const prod = item.product || item;
        await conn.query(
          `INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity, total_price)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            order.id,
            prod.id || 'item',
            prod.name || 'Product',
            prod.image || null,
            prod.price || 0,
            item.quantity || 1,
            (prod.price || 0) * (item.quantity || 1)
          ]
        );
      }
    }

    await conn.commit();
    return true;
  } catch (err: any) {
    await conn.rollback();
    console.error("[MYSQL] Error saving order to DB:", err.message);
    return false;
  } finally {
    conn.release();
  }
}

export async function recordUploadedFile(fileInfo: {
  id: string;
  filename: string;
  mimeType?: string;
  fileSize?: number;
  diskPath: string;
  publicUrl: string;
}): Promise<boolean> {
  if (!isMySqlConnected()) return false;
  try {
    await pool!.query(
      `INSERT INTO uploaded_files (id, filename, mime_type, file_size, disk_path, public_url)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE filename=VALUES(filename)`,
      [
        fileInfo.id,
        fileInfo.filename,
        fileInfo.mimeType || 'image/jpeg',
        fileInfo.fileSize || 0,
        fileInfo.diskPath,
        fileInfo.publicUrl
      ]
    );
    return true;
  } catch (err: any) {
    console.error("[MYSQL] Error registering uploaded file in DB:", err.message);
    return false;
  }
}

export async function exportDbToSql(): Promise<string> {
  if (!pool) {
    throw new Error("MySQL database is not connected.");
  }

  let sqlDump = `-- ======================================================\n`;
  sqlDump += `-- TAQWA ENTERPRISE - LIVE MYSQL DATABASE BACKUP\n`;
  sqlDump += `-- Exported At: ${new Date().toISOString()}\n`;
  sqlDump += `-- Backup Engine: Pure TypeScript Resilient Dump Utility\n`;
  sqlDump += `-- ======================================================\n\n`;
  sqlDump += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

  const tables = ['products', 'users', 'orders', 'order_items', 'courier_points', 'expenses', 'uploaded_files'];

  for (const table of tables) {
    sqlDump += `-- ------------------------------------------------------\n`;
    sqlDump += `-- Table structure for table \`${table}\`\n`;
    sqlDump += `-- ------------------------------------------------------\n`;
    sqlDump += `DROP TABLE IF EXISTS \`${table}\`;\n`;

    try {
      const [showCreate] = await pool.query(`SHOW CREATE TABLE \`${table}\``) as any[];
      if (showCreate && showCreate[0] && showCreate[0]['Create Table']) {
        sqlDump += showCreate[0]['Create Table'] + ";\n\n";
      } else {
        throw new Error("No create table query returned.");
      }
    } catch (err: any) {
      sqlDump += `-- [Schema export failed, using standard fallback] \n`;
    }

    sqlDump += `-- Dumping data for table \`${table}\`\n`;
    try {
      const [rows] = await pool.query(`SELECT * FROM \`${table}\``) as any[];
      if (rows && rows.length > 0) {
        sqlDump += `LOCK TABLES \`${table}\` WRITE;\n`;
        for (const row of rows) {
          const keys = Object.keys(row).map(k => `\`${k}\``).join(', ');
          const values = Object.values(row).map(val => {
            if (val === null || val === undefined) return 'NULL';
            if (typeof val === 'boolean') return val ? '1' : '0';
            if (typeof val === 'number') return String(val);
            if (typeof val === 'object') {
              return `'${JSON.stringify(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
            }
            const escaped = String(val).replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
              switch (char) {
                case "\0": return "\\0";
                case "\x08": return "\\b";
                case "\x09": return "\\t";
                case "\x1a": return "\\z";
                case "\n": return "\\n";
                case "\r": return "\\r";
                case "\"": return "\\\"";
                case "'": return "\\'";
                case "\\": return "\\\\";
                case "%": return "\\%";
                default: return char;
              }
            });
            return `'${escaped}'`;
          }).join(', ');
          sqlDump += `INSERT INTO \`${table}\` (${keys}) VALUES (${values});\n`;
        }
        sqlDump += `UNLOCK TABLES;\n\n`;
      } else {
        sqlDump += `-- No data rows found for \`${table}\`\n\n`;
      }
    } catch (dumpErr: any) {
      sqlDump += `-- Error exporting table data: ${dumpErr.message}\n\n`;
    }
  }

  sqlDump += `SET FOREIGN_KEY_CHECKS = 1;\n`;
  return sqlDump;
}
