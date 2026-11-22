/**
 * A fake, constantly changing list of products.
 *
 * Serverless functions can't keep state in memory between requests, so the
 * list is derived from the current time instead. Every caller sees the same
 * list at the same moment, and the list changes over time: products appear,
 * disappear, and change price.
 */

const ADJECTIVES = [
  'Small', 'Ergonomic', 'Rustic', 'Intelligent', 'Gorgeous', 'Incredible',
  'Fantastic', 'Practical', 'Sleek', 'Awesome', 'Generic', 'Handcrafted',
  'Handmade', 'Licensed', 'Refined', 'Unbranded', 'Tasty',
];
const MATERIALS = [
  'Steel', 'Wooden', 'Concrete', 'Plastic', 'Cotton', 'Granite', 'Rubber',
  'Metal', 'Soft', 'Fresh', 'Frozen',
];
const PRODUCTS = [
  'Chair', 'Car', 'Computer', 'Keyboard', 'Mouse', 'Bike', 'Ball', 'Gloves',
  'Pants', 'Shirt', 'Table', 'Shoes', 'Hat', 'Towels', 'Soap', 'Tuna',
  'Chicken', 'Fish', 'Cheese', 'Bacon', 'Pizza', 'Salad', 'Sausages', 'Chips',
];

// A new product appears every BIRTH_INTERVAL seconds and stays for
// MIN_LIFESPAN to MAX_LIFESPAN seconds, so about 3 to 6 are listed at once.
const BIRTH_INTERVAL = 4;
const MIN_LIFESPAN = 12;
const MAX_LIFESPAN = 24;

// Each product changes price every MIN_PRICE_INTERVAL to MAX_PRICE_INTERVAL seconds.
const MIN_PRICE_INTERVAL = 4;
const MAX_PRICE_INTERVAL = 12;

/**
 * Deterministic pseudo random number in [0, 1) for a list of integers.
 */
const random = (...ints) => {
  let h = 2166136261;

  ints.forEach((n) => {
    h ^= n;
    h = Math.imul(h, 16777619);
    h ^= h >>> 13;
    h = Math.imul(h, 0x5bd1e995);
    h ^= h >>> 15;
  });

  return (h >>> 0) / 4294967296;
};

const between = (min, max, ...seed) => min + Math.floor(random(...seed) * (max - min + 1));
const pick = (list, ...seed) => list[Math.floor(random(...seed) * list.length)];

const makeItem = (id, now) => {
  const priceInterval = between(MIN_PRICE_INTERVAL, MAX_PRICE_INTERVAL, id, 3);
  const priceVersion = Math.floor((now + between(0, priceInterval, id, 4)) / priceInterval);

  return {
    // Keep ids short for display. They repeat every 1,000 products, long after
    // any one product has left the list.
    id: id % 1000,
    name: `${pick(ADJECTIVES, id, 5)} ${pick(MATERIALS, id, 6)} ${pick(PRODUCTS, id, 7)}`,
    price: parseFloat((random(id, priceVersion, 8) * 999).toFixed(2)),
  };
};

/**
 * Get the list of products at a moment in time.
 * @param {number} nowMs Time in milliseconds since the epoch.
 */
const getItems = (nowMs = Date.now()) => {
  const now = Math.floor(nowMs / 1000);
  const latest = Math.floor(now / BIRTH_INTERVAL);
  const oldest = Math.floor((now - MAX_LIFESPAN) / BIRTH_INTERVAL);
  const items = [];

  for (let id = oldest; id <= latest; id += 1) {
    const born = id * BIRTH_INTERVAL;
    const lifespan = between(MIN_LIFESPAN, MAX_LIFESPAN, id, 2);

    if (born <= now && now < born + lifespan) {
      items.push(makeItem(id, now));
    }
  }

  return items;
};

module.exports = { getItems };
