import { seedDemoData } from './seedDemo.js';
import { pool } from '../config/db.js';

seedDemoData()
  .then((credentials) => {
    console.log('Done.', credentials);
    return pool.end();
  })
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
