export const validateFormat = (content) => {
  let format = /^>fwd[\s\S]{2}[ACGTacgt]+[\s\S]{1,2}>rev[\s\S]{1,2}[ACGTacgt]+[\s\S]{1,2}>prb[\s\S]{1,2}[ACGTacgt]+[\s\S]{1,2}$/;
  let correct_format = format.exec(content);
  return correct_format !== null;
};

export const getRandomInt = (min, max) => {
  const lower_r = Math.floor(min);
  const upper_r = Math.floor(max);
  return Math.floor(lower_r + Math.random() * (upper_r - lower_r));
};

// credit: https://davidwalsh.name/function-debounce
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
export function debounce(func, wait, immediate) {
  let timeout;
  return function () {
    let context = this,
      args = arguments;
    let later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    let callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

export function addName(primer) {
  /**
   * An annealing function that takes an object and adds [primer] to it with key under "primer"
   * @param {string} primer: value to be added
   * @returns {function} a function that takes in [value] and returns it after adding [primer] to it.
   */
  return (value) => {
    value.primer = primer;
    return value;
  };
}

export function makeBaseGraphData(baseData) {
  /**
   * Converts the incoming {primerName: Missed virus} to
   * {primerName: Date: Missed Virus}
   *
   * @param {Object} baseData: contains the primerDetails
   * @returns {Object}: Mapping from {primerName: Date: Missed Virus}
   */

  const toReturn = {};
  for (const primerName of Object.keys(baseData)) {
    const result = {};
    for (const details of baseData[primerName]) {
      const toAdd = result[details.date] || [];
      toAdd.push(addName(primerName)(details));
      result[details.date] = toAdd;
    }
    toReturn[primerName] = result;
  }
  return toReturn;
}
