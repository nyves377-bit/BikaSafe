const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');

try {
  let schema = fs.readFileSync(schemaPath, 'utf8');

  // Replace sqlite provider with postgresql
  schema = schema.replace(
    /provider\s*=\s*"sqlite"/,
    'provider = "postgresql"'
  );

  fs.writeFileSync(schemaPath, schema);
  console.log('Successfully patched schema.prisma to use PostgreSQL for Render deployment.');
} catch (error) {
  console.error('Failed to patch schema.prisma:', error);
  process.exit(1);
}
