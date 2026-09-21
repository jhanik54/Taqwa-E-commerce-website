import { createRequire } from "module";
import path from "path";
import fs from "fs";

// Create CommonJS require function within ES module scope
const require = createRequire(import.meta.url);

const compiledServerPath = path.join(process.cwd(), "build", "server.cjs");

if (!fs.existsSync(compiledServerPath)) {
  console.error(`[FATAL ERROR] Compiled server file not found at: ${compiledServerPath}`);
  console.error("Please run 'npm run build' before starting the server.");
  process.exit(1);
}

// Execute the compiled CommonJS server bundle
require(compiledServerPath);
