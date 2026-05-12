const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');

try {
  let schema = fs.readFileSync(schemaPath, 'utf8');

  // Switch Prisma provider from sqlite → postgresql for Render deployment
  schema = schema.replace(
    /provider\s*=\s*"sqlite"/,
    'provider = "postgresql"'
  );

  fs.writeFileSync(schemaPath, schema);
  console.log('✅ schema.prisma patched: sqlite → postgresql');
  console.log('Ready for Render PostgreSQL deployment.');
} catch (error) {
  console.error('❌ Failed to patch schema.prisma:', error);
  process.exit(1);
}
