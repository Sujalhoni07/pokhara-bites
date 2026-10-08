const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const password = process.argv[2];

if (!password) {
  console.log('Usage: node scripts/setAdminPassword.js "your-password"');
  process.exit(1);
}

const envPath = path.join(__dirname, "..", ".env");
const hash = bcrypt.hashSync(password, 10);
const newLine = `ADMIN_PASSWORD_HASH='${hash}'`;

let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";

if (/^ADMIN_PASSWORD_HASH=.*$/m.test(content)) {
  // replace every old ADMIN_PASSWORD_HASH line
  // (a function is used because the hash contains "$" signs)
  content = content.replace(/^ADMIN_PASSWORD_HASH=.*$/gm, () => newLine);
} else {
  content += (content.endsWith("\n") ? "" : "\n") + newLine + "\n";
}

fs.writeFileSync(envPath, content);

console.log("✔ Admin password saved in .env");
console.log("  Now restart the server.");