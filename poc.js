const arr = [10, 10, 20, 20, 30, 30, 40, 60, 60];

function uniqueArray(arr) {
  const arrObj = {};
  const uniqueArray = [];
  for (let i = 0; i < arr.length; i++) {
    arrObj[arr[i]] = arrObj[arr[i]] + 1 || 1;
  }

  for (const j in arrObj) {
    uniqueArray.push(j);
  }
  const count = arr.length - uniqueArray.length;

  return { count, array: uniqueArray };
}

console.log(uniqueArray(arr));
