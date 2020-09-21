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
  var timeout;
  return function () {
    var context = this,
      args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}
