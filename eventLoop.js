const fs = require('fs');

console.log('1');
console.log('2');
console.log('3');

setTimeout(() => {
  console.log(5);
  setTimeout(() => {
    console.log(9);
  });
}, 0);

setImmediate(() => {
  console.log(6);
});

process.nextTick(() => {
  console.log(7);
});

fs.readFile('./dev-data/data/tours-simple.json', 'utf-8', () => {
  console.log(8);
});
