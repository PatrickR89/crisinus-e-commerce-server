function conditionalArrayParse(array) {
  if (array === null ||
     array === undefined || 
     array === "") return [];
     
  let newArray = [...array];

  if (!Array.isArray(array)) {
    newArray = [...JSON.parse(array)];
  }

  return newArray;
}

module.exports = conditionalArrayParse;
