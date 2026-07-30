import { pool } from '../config/db.js';
import { hashPassword } from '../utils/jwt.js';
import { seedDefaultCategories } from '../utils/seedCategories.js';

const DEMO_EMAIL = 'demo@financeapp.com';
const DEMO_PASSWORD = 'Demo1234';
const DEMO_NAME = 'Hamza Khan';
const MONTHS_OF_HISTORY = 6;

// Deterministic PRNG so reseeding produces the same believable dataset.
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export async function seedDemoData() {
  const client = await pool.connect();
  const rand = mulberry32(20260709);

  // PKR amounts: whole rupees, rounded to sensible increments.
  const between = (min, max, step = 10) =>
    Math.round((min + rand() * (max - min)) / step) * step;
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const chance = (p) => rand() < p;

  try {
    await client.query('BEGIN');

    const existing = await client.query('SELECT id FROM users WHERE email = $1', [DEMO_EMAIL]);
    let userId;

    if (existing.rows.length > 0) {
      userId = existing.rows[0].id;
      await client.query('DELETE FROM transactions WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM budgets WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM goals WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM recurring_transactions WHERE user_id = $1', [userId]);
      await client.query('UPDATE users SET display_name = $2 WHERE id = $1', [userId, DEMO_NAME]);
      console.log('Resetting existing demo user data...');
    } else {
      const passwordHash = await hashPassword(DEMO_PASSWORD);
      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, display_name)
         VALUES ($1, $2, $3) RETURNING id`,
        [DEMO_EMAIL, passwordHash, DEMO_NAME]
      );
      userId = userResult.rows[0].id;
      await seedDefaultCategories(client, userId);
      console.log('Created demo user.');
    }

    const cats = await client.query(`SELECT id, name FROM categories WHERE user_id = $1`, [userId]);
    const catMap = Object.fromEntries(cats.rows.map((c) => [c.name, c.id]));

    const now = new Date();
    const today = now.getDate();
    const transactions = [];

    const groceryStores = ['Imtiaz Super Market', 'Al-Fatah', 'Carrefour', 'Madina Cash & Carry'];
    const coffeeAndChai = ['Chaaye Khana', 'Gloria Jean\u2019s', 'Chai chowk'];
    const restaurants = ['Savour Foods', 'Cheezious', 'KFC', 'McDonald\u2019s', 'Kabul Restaurant', 'Tandoori Hut'];
    const delivery = ['Foodpanda', 'Cheetay'];
    const petrolPumps = ['PSO', 'Shell', 'Total Parco', 'Attock Petroleum'];
    const rides = ['Careem', 'Bykea', 'InDrive'];
    const shops = ['Daraz.pk', 'Khaadi', 'Outfitters', 'Chase Value', 'Gul Ahmed Ideas', 'Servis'];
    const pharmacies = ['D. Watson', 'Shaheen Chemist', 'Fazal Din Pharma'];

    const add = (cat, type, amount, day, month, year, notes) => {
      transactions.push({ cat, type, amount, day, month, year, notes });
    };

    for (let m = MONTHS_OF_HISTORY - 1; m >= 0; m--) {
      const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      const daysInMonth = new Date(year, month, 0).getDate();
      // Don't seed transactions dated in the future for the current month.
      const maxDay = m === 0 ? today : daysInMonth;
      const inRange = (day) => day <= maxDay;
      const isSummer = month >= 5 && month <= 9; // AC season
      const isWinter = month === 12 || month <= 2; // gas heater season

      // --- Income ---
      if (inRange(28)) add('Salary', 'income', 350000, 28, month, year, 'NexTech Solutions \u2014 salary');
      if (chance(0.5)) {
        const day = Math.floor(2 + rand() * 16);
        if (inRange(day)) add('Freelance', 'income', between(25000, 90000, 500), day, month, year, 'Upwork \u2014 client payout');
      }
      if (chance(0.4)) {
        const day = Math.floor(3 + rand() * 20);
        if (inRange(day)) add('Investments', 'income', between(1500, 5500, 50), day, month, year, 'Meezan Bank \u2014 profit on savings');
      }

      // --- Fixed bills ---
      if (inRange(1)) add('Housing', 'expense', 85000, 1, month, year, 'House rent \u2014 Bahria Town Phase 7');
      if (inRange(7)) {
        const base = isSummer ? [14000, 26000] : [6000, 11000];
        add('Utilities', 'expense', between(base[0], base[1], 100), 7, month, year, 'IESCO \u2014 electricity bill');
      }
      if (inRange(10)) {
        const base = isWinter ? [4500, 9000] : [1200, 2500];
        add('Utilities', 'expense', between(base[0], base[1], 50), 10, month, year, 'SNGPL \u2014 gas bill');
      }
      if (inRange(12)) add('Utilities', 'expense', 3499, 12, month, year, 'StormFiber \u2014 internet');
      if (inRange(15)) add('Utilities', 'expense', between(1000, 1600, 50), 15, month, year, 'Jazz \u2014 mobile package');
      if (inRange(18)) add('Utilities', 'expense', between(700, 1100, 50), 18, month, year, 'WASA \u2014 water bill');

      // --- Subscriptions & memberships ---
      if (inRange(3)) add('Entertainment', 'expense', 1100, 3, month, year, 'Netflix');
      if (inRange(6)) add('Entertainment', 'expense', 349, 6, month, year, 'Spotify Premium');
      if (inRange(20)) add('Healthcare', 'expense', 8000, 20, month, year, 'Shapes gym \u2014 monthly membership');

      // --- Groceries: weekly runs plus a monthly bulk trip ---
      for (const day of [2, 9, 16, 23, 29]) {
        const jittered = Math.min(daysInMonth, day + Math.floor(rand() * 3));
        if (!inRange(jittered)) continue;
        add('Food & Dining', 'expense', between(4500, 12000, 50), jittered, month, year, pick(groceryStores));
      }
      if (chance(0.75)) {
        const day = Math.floor(10 + rand() * 10);
        if (inRange(day)) add('Food & Dining', 'expense', between(15000, 28000, 100), day, month, year, 'Metro Cash & Carry');
      }
      if (chance(0.6)) {
        const day = Math.floor(1 + rand() * daysInMonth);
        if (inRange(day)) add('Food & Dining', 'expense', between(1500, 4000, 50), day, month, year, 'Sunday bazaar \u2014 fruits & vegetables');
      }

      // --- Chai & eating out: several small hits per month ---
      const outings = 6 + Math.floor(rand() * 5);
      for (let i = 0; i < outings; i++) {
        const day = 1 + Math.floor(rand() * daysInMonth);
        if (!inRange(day)) continue;
        if (chance(0.35)) {
          add('Food & Dining', 'expense', between(300, 900, 10), day, month, year, pick(coffeeAndChai));
        } else if (chance(0.35)) {
          add('Food & Dining', 'expense', between(1200, 3500, 50), day, month, year, pick(delivery));
        } else {
          add('Food & Dining', 'expense', between(1000, 5500, 50), day, month, year, pick(restaurants));
        }
      }

      // --- Transport ---
      for (const day of [5, 15, 25]) {
        if (!inRange(day) || chance(0.2)) continue;
        add('Transportation', 'expense', between(5000, 9000, 100), day, month, year, `${pick(petrolPumps)} \u2014 fuel`);
      }
      const rideCount = 1 + Math.floor(rand() * 3);
      for (let i = 0; i < rideCount; i++) {
        const day = 1 + Math.floor(rand() * daysInMonth);
        if (inRange(day)) add('Transportation', 'expense', between(300, 1500, 10), day, month, year, pick(rides));
      }
      if (chance(0.3)) {
        const day = 1 + Math.floor(rand() * daysInMonth);
        if (inRange(day)) add('Transportation', 'expense', between(2000, 4500, 100), day, month, year, 'Car service \u2014 oil change');
      }

      // --- Shopping ---
      const shopCount = 2 + Math.floor(rand() * 3);
      for (let i = 0; i < shopCount; i++) {
        const day = 1 + Math.floor(rand() * daysInMonth);
        if (!inRange(day)) continue;
        add('Shopping', 'expense', between(1500, 9000, 50), day, month, year, pick(shops));
      }
      if (chance(0.3)) {
        const day = 1 + Math.floor(rand() * daysInMonth);
        if (inRange(day)) add('Shopping', 'expense', between(15000, 45000, 500), day, month, year, pick(['Sapphire', 'J. Junaid Jamshed', 'Bata \u2014 family shoes']));
      }

      // --- Healthcare & misc ---
      if (chance(0.65)) {
        const day = 1 + Math.floor(rand() * daysInMonth);
        if (inRange(day)) add('Healthcare', 'expense', between(500, 3000, 50), day, month, year, pick(pharmacies));
      }
      if (chance(0.55)) {
        const day = 1 + Math.floor(rand() * daysInMonth);
        if (inRange(day)) add('Other', 'expense', 800, day, month, year, 'Haircut');
      }
      if (chance(0.3)) {
        const day = 1 + Math.floor(rand() * daysInMonth);
        if (inRange(day)) add('Other', 'expense', between(2000, 6000, 100), day, month, year, pick(['Eidi / family gift', 'Dry cleaning', 'Mobile repair']));
      }
    }

    for (const t of transactions) {
      const categoryId = catMap[t.cat];
      if (!categoryId) continue;
      const date = `${t.year}-${String(t.month).padStart(2, '0')}-${String(t.day).padStart(2, '0')}`;
      await client.query(
        `INSERT INTO transactions (user_id, category_id, amount, type, transaction_date, notes)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, categoryId, t.amount, t.type, date, t.notes]
      );
    }

    // --- Budgets aligned with realistic PKR spend levels ---
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const budgets = [
      { cat: 'Housing', amount: 85000 },
      { cat: 'Food & Dining', amount: 70000 },
      { cat: 'Utilities', amount: 35000 },
      { cat: 'Transportation', amount: 25000 },
      { cat: 'Shopping', amount: 30000 },
      { cat: 'Entertainment', amount: 3000 },
      { cat: 'Healthcare', amount: 15000 },
    ];

    for (const b of budgets) {
      const categoryId = catMap[b.cat];
      if (!categoryId) continue;
      await client.query(
        `INSERT INTO budgets (user_id, category_id, month, year, amount)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id, category_id, month, year) DO UPDATE SET amount = $5`,
        [userId, categoryId, currentMonth, currentYear, b.amount]
      );
    }

    // --- Goals ---
    const goals = [
      { name: 'Emergency fund (6 months)', target: 1500000, current: 620000, monthsAhead: 12 },
      { name: 'Umrah with family', target: 900000, current: 340000, monthsAhead: 8 },
      { name: 'New laptop', target: 350000, current: 350000, monthsAhead: 0 },
    ];

    for (const g of goals) {
      const targetDate =
        g.monthsAhead > 0
          ? new Date(currentYear, now.getMonth() + g.monthsAhead, 1).toISOString().slice(0, 10)
          : null;
      await client.query(
        `INSERT INTO goals (user_id, name, target_amount, current_amount, target_date)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, g.name, g.target, g.current, targetDate]
      );
    }

    // --- Recurring transactions mirroring the fixed items above ---
    const recurring = [
      { cat: 'Salary', amount: 350000, type: 'income', day: 28, notes: 'NexTech Solutions \u2014 salary' },
      { cat: 'Housing', amount: 85000, type: 'expense', day: 1, notes: 'House rent \u2014 Bahria Town Phase 7' },
      { cat: 'Utilities', amount: 3499, type: 'expense', day: 12, notes: 'StormFiber \u2014 internet' },
      { cat: 'Entertainment', amount: 1100, type: 'expense', day: 3, notes: 'Netflix' },
      { cat: 'Entertainment', amount: 349, type: 'expense', day: 6, notes: 'Spotify Premium' },
      { cat: 'Healthcare', amount: 8000, type: 'expense', day: 20, notes: 'Shapes gym \u2014 monthly membership' },
    ];

    for (const r of recurring) {
      const categoryId = catMap[r.cat];
      if (!categoryId) continue;
      const startMonth = r.day <= today ? now.getMonth() : now.getMonth() - 1;
      const start = new Date(currentYear, startMonth, r.day);
      const next = new Date(currentYear, startMonth + 1, r.day);
      await client.query(
        `INSERT INTO recurring_transactions
          (user_id, category_id, amount, type, frequency, notes, start_date, next_date)
         VALUES ($1, $2, $3, $4, 'monthly', $5, $6, $7)`,
        [
          userId,
          categoryId,
          r.amount,
          r.type,
          r.notes,
          start.toISOString().slice(0, 10),
          next.toISOString().slice(0, 10),
        ]
      );
    }

    await client.query('COMMIT');
    console.log(`Demo data seeded: ${transactions.length} transactions across ${MONTHS_OF_HISTORY} months (PKR).`);
    console.log(`Login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
    return { email: DEMO_EMAIL, password: DEMO_PASSWORD };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
