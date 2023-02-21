function conditionalArrayParse(array) {
  let newArray = [...array];

  if (!Array.isArray(array)) {
    newArray = [...JSON.parse(array)];
  }

  return newArray;
}

module.exports = conditionalArrayParse;
