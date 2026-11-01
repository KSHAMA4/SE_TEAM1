
// Issue #2 - Schema tests (no DB connection needed)
const fs = require('fs');
const path = require('path');

describe('DB Schema - Issue #2', () => {
  const sqlPath = path.join(
    __dirname,
    '../migrations/001_initial_schema.sql'
  );

  test('migration file exists', () => {
    expect(fs.existsSync(sqlPath)).toBe(true);
  });

  test('schema has users table', () => {
    const sql = fs.readFileSync(sqlPath, 'utf8');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS users');
  });

  test('schema has equipment table', () => {
    const sql = fs.readFileSync(sqlPath, 'utf8');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS equipment');
  });

  test('schema has reservations table', () => {
    const sql = fs.readFileSync(sqlPath, 'utf8');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS reservations');
  });

  test('schema uses btree_gist extension', () => {
    const sql = fs.readFileSync(sqlPath, 'utf8');
    expect(sql).toContain('btree_gist');
  });

  test('migrate script exists', () => {
    expect(
      fs.existsSync(path.join(__dirname, '../scripts/migrate.js'))
    ).toBe(true);
  });

  test('seed script exists', () => {
    expect(
      fs.existsSync(path.join(__dirname, '../scripts/seed.js'))
    ).toBe(true);
  });
});
