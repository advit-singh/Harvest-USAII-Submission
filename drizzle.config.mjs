/** @type {import('drizzle-kit').Config} */
export default {
  schema: ['./src/db/schema.ts'],
  out: './src/db/migrations',
  driver: 'pg',
};
