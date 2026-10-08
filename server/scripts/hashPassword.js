const bcrypt = require("bcryptjs");

const password = process.argv[2];

if (!password) {
  console.log('Usage: npm run hash -- "your-password"');
  process.exit(1);
}

bcrypt.hash(password, 10).then((hash) => {
  console.log("\nPassword hash (copy this into .env):\n");
  console.log(hash + "\n");
});