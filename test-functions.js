const { formatPrice, formatDate, validateEmail } = require('./src/utils/index.ts');

console.log('formatPrice(29.99):', JSON.stringify(formatPrice(29.99)));
console.log('formatPrice(29.99, "USD"):', JSON.stringify(formatPrice(29.99, 'USD')));
console.log('formatPrice(0):', JSON.stringify(formatPrice(0)));
console.log('formatPrice(-10):', JSON.stringify(formatPrice(-10)));

console.log('formatDate("2024-01-15"):', JSON.stringify(formatDate('2024-01-15')));
console.log('formatDate(new Date("2024-12-25")):', JSON.stringify(formatDate(new Date('2024-12-25'))));

console.log('validateEmail("test..email@example.com"):', validateEmail('test..email@example.com'));
