import { createRequire } from "module";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";

// Create CommonJS require function within ES module scope
const require = createRequire(import.meta.url);

const compiledServerPath = path.join(process.cwd(), "build", "server.cjs");

if (!fs.existsSync(compiledServerPath)) {
  console.log("[INFO] Compiled server file not found. Triggering automated build step...");
  try {
    execSync("npm run build", { stdio: "inherit" });
    console.log("[SUCCESS] Automated build completed successfully.");
  } catch (err) {
    console.error("[FATAL ERROR] Automated build failed:", err);
    process.exit(1);
  }
}

if (!fs.existsSync(compiledServerPath)) {
  console.error(`[FATAL ERROR] Compiled server file still not found at: ${compiledServerPath}`);
  process.exit(1);
}

// Execute the compiled CommonJS server bundle
require(compiledServerPath);

