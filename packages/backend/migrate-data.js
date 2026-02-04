const { Client } = require('pg');

const SOURCE_URL = 'postgresql://neondb_owner:npg_TwPVhD34Msin@ep-muddy-queen-ahh9n4a3-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';
const TARGET_URL = process.env.DATABASE_URL;

async function migrate() {
  const source = new Client({ connectionString: SOURCE_URL });
  const target = new Client({ connectionString: TARGET_URL });

  try {
    await source.connect();
    await target.connect();
    console.log('Connected to both databases');

    // Get tables to migrate (user data only, not seed data)
    const tables = ['User', 'UserProgress', 'UserAchievement', 'Answer', 'PlacementTestResult'];

    for (const table of tables) {
      console.log(`\nMigrating ${table}...`);

      // Check if table exists and has data in source
      const countResult = await source.query(`SELECT COUNT(*) FROM "${table}"`).catch(() => null);
      if (!countResult) {
        console.log(`  Table ${table} not found in source, skipping`);
        continue;
      }

      const count = parseInt(countResult.rows[0].count);
      console.log(`  Found ${count} rows in source`);

      if (count === 0) {
        console.log(`  No data to migrate`);
        continue;
      }

      // Get all data from source
      const data = await source.query(`SELECT * FROM "${table}"`);

      if (data.rows.length === 0) {
        console.log(`  No rows to migrate`);
        continue;
      }

      // Clear existing data in target (if any)
      await target.query(`DELETE FROM "${table}"`).catch(() => {});

      // Get column names
      const columns = Object.keys(data.rows[0]);
      const columnList = columns.map(c => `"${c}"`).join(', ');

      // Insert each row
      let inserted = 0;
      for (const row of data.rows) {
        const values = columns.map((_, i) => `$${i + 1}`).join(', ');
        const params = columns.map(c => row[c]);

        try {
          await target.query(
            `INSERT INTO "${table}" (${columnList}) VALUES (${values}) ON CONFLICT DO NOTHING`,
            params
          );
          inserted++;
        } catch (err) {
          console.log(`  Error inserting row: ${err.message}`);
        }
      }

      console.log(`  Migrated ${inserted} rows`);
    }

    console.log('\nMigration complete!');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await source.end();
    await target.end();
  }
}

migrate();
