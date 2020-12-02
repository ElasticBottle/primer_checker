!function(t){var e={};function n(r){if(e[r])return e[r].exports;var o=e[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=t,n.c=e,n.d=function(t,e,r){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r})},n.r=function(t){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"===typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)n.d(r,o,function(e){return t[e]}.bind(null,o));return r},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="https://mendel3.bii.a-star.edu.sg/METHODS/corona/gamma/primer/build/",n(n.s=0)}([function(t,e,n){"use strict";function r(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=new Array(e);n<e;n++)r[n]=t[n];return r}function o(t,e){if(t){if("string"===typeof t)return r(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return"Object"===n&&t.constructor&&(n=t.constructor.name),"Map"===n||"Set"===n?Array.from(n):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?r(t,e):void 0}}function a(t){return function(t){if(Array.isArray(t))return r(t)}(t)||function(t){if("undefined"!==typeof Symbol&&Symbol.iterator in Object(t))return Array.from(t)}(t)||o(t)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function i(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function u(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,r)}return n}function s(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?u(Object(n),!0).forEach((function(e){i(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):u(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}function c(t){if("undefined"===typeof Symbol||null==t[Symbol.iterator]){if(Array.isArray(t)||(t=o(t))){var e=0,n=function(){};return{s:n,n:function(){return e>=t.length?{done:!0}:{done:!1,value:t[e++]}},e:function(t){throw t},f:n}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var r,a,i=!0,u=!1;return{s:function(){r=t[Symbol.iterator]()},n:function(){var t=r.next();return i=t.done,t},e:function(t){u=!0,a=t},f:function(){try{i||null==r.return||r.return()}finally{if(u)throw a}}}}function m(t,e){return function(t){if(Array.isArray(t))return t}(t)||function(t,e){if("undefined"!==typeof Symbol&&Symbol.iterator in Object(t)){var n=[],r=!0,o=!1,a=void 0;try{for(var i,u=t[Symbol.iterator]();!(r=(i=u.next()).done)&&(n.push(i.value),!e||n.length!==e);r=!0);}catch(s){o=!0,a=s}finally{try{r||null==u.return||u.return()}finally{if(o)throw a}}return n}}(t,e)||o(t,e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}n.r(e),n.d(e,"filterTable",(function(){return d})),n.d(e,"getTotalSubmission",(function(){return g})),n.d(e,"getLineGraphData",(function(){return O})),n.d(e,"getCombinedLineData",(function(){return S})),n.d(e,"makeBarData",(function(){return D})),n.d(e,"makeIntersection",(function(){return j}));function l(t){return function(e){return e.primer=t,e}}var f=function(t){var e=t.timeFrameBrush,n=void 0===e?[]:e,r=t.primers,o=void 0===r?[]:r,a=t.pType,i=void 0===a?[]:a,u=t.countries,s=void 0===u?[]:u,c=t.miss,l=void 0===c?[]:c,f=t.miss3,d=void 0===f?[]:f,b=t.match,p=void 0===b?[]:b;return function(t){var e=!0,r=!0,a=!0,u=!0,c=!0,f=!0,b=!0;if(0!==n.length){var v=new Date(t.date),g=m(n,2),y=g[0],h=g[1];e=v.getTime()>=new Date(y).getTime()&&v.getTime()<=new Date(h).getTime()}return 0!==o.length&&(r=o.includes(t.primer)),0!==i.length&&(a=i.includes(t.type)),0!==s.length&&(u=s.map((function(t){return t.value})).includes(t.ISO_A3)),0!==l.length&&(c=t.misses>=(l[0]||0)&&t.misses<=(l[1]||100)),0!==d.length&&(f=t.misses3>=(d[0]||0)&&t.misses3<=(d[1]||100)),0!==p.length&&(b=t.match_pct>=(p[0]||0)&&t.match_pct<=(p[1]||100)),e&&r&&a&&u&&c&&f&&b}};function d(t){var e=t.baseTableData,n=t.timeFrameBrush,r=void 0===n?[]:n,o=t.primers,a=void 0===o?[]:o,i=t.pType,u=void 0===i?[]:i,s=t.countries,c=void 0===s?[]:s,m=t.miss,l=void 0===m?[]:m,d=t.miss3,b=void 0===d?[]:d,p=t.match,v=void 0===p?[]:p;return console.log("baseTableData :>> ",e),e.filter(f({primers:a,pType:u,countries:c,miss:l,miss3:b,match:v,timeFrameBrush:r}))}function b(t,e){for(var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0,r={},o=0,a=Object.keys(e);o<a.length;o++){var i=a[o];r[i]=(t[i]||n)+e[i]}return r}function p(t,e){for(var n={},r=0,o=Object.keys(e);r<o.length;r++){var a=o[r];n[a]=t[a]-e[a]}return n}function v(t,e,n){return 0===e.length?t[n].total:e.reduce((function(e,r){return e+=t[n][r.value]||0}),0)}function g(t){var e=t.dbDaily,n=t.dbCum,r=t.dateRange,o=t.countries,a=t.countryAsTotal,i=t.useCum,u=t.lookBack,s=t.separate,m=void 0!==s&&s;if(i){for(var l={},f=0,d=Object.keys(n);f<d.length;f++){var g=d[f];l[g]=a?v(n,o,g):n[g].total}return l}var y=function(t,e,n){var r=new Date(n[0]),o=new Date(r),a=new Date(n[n.length-1]);o.setDate(o.getDate()+e);var i=r.toISOString().slice(0,10),u={};u[i]=JSON.parse(JSON.stringify(t[i])),r.setDate(r.getDate()+1);for(var s=r;s<=o;s.setDate(s.getDate()+1)){var c=s.toISOString().slice(0,10),m=new Date(s);m.setDate(m.getDate()-1),m=m.toISOString().slice(0,10),u[c]=b(u[m],t[c]||{})}o.setDate(o.getDate()+1);for(var l=o;l<=a;l.setDate(l.getDate()+1)){var f=l.toISOString().slice(0,10),d=new Date(l);d.setDate(d.getDate()-1);var v=new Date(d);v.setDate(v.getDate()-e),d=d.toISOString().slice(0,10),v=v.toISOString().slice(0,10),u[f]=b(p(u[d],t[v]),t[f]||{})}return u}(e,u,r);if(m)return y;var h,_=c(r);try{for(_.s();!(h=_.n()).done;){var O=h.value;y[O]=a?v(y,o,O):y[O].total}}catch(S){_.e(S)}finally{_.f()}return y}function y(t,e,n){if("add"===t){var r=e.mutation_abs+n.mutation_abs,o=e.mutation3_abs+n.mutation3_abs;return{name:e.name,date:e.date,mutation3_abs:o,mutation3_pct:100*(o/e.submission_count||0),mutation_abs:r,mutation_pct:100*(r/e.submission_count||0),submission_count:e.submission_count,countries_considered:e.countries_considered,lookBack:e.lookBack}}if("subtract"===t){var a=e.mutation_abs-n.mutation_abs,i=e.mutation3_abs-n.mutation3_abs;return{name:e.name,date:e.date,mutation3_abs:i,mutation3_pct:100*(i/e.submission_count||0),mutation_abs:a,mutation_pct:100*(a/e.submission_count||0),submission_count:e.submission_count,countries_considered:e.countries_considered,lookBack:e.lookBack}}throw Error('invalid f, expected "add" or "subtract", got '.concat(t))}function h(t,e){var n=[];if(n.push({name:t[0].name,date:t[0].date,mutation3_abs:t[0].mutation3_abs,mutation3_pct:100*(t[0].mutation3_abs/t[0].submission_count||0),mutation_abs:t[0].mutation_abs,mutation_pct:100*(t[0].mutation_abs/t[0].submission_count||0),submission_count:t[0].submission_count,countries_considered:t[0].countries,lookBack:t[0].lookBack}),-1===e)for(var r=1;r<t.length;r++)n.push(y("add",t[r],n[r-1]));else{for(var o=1;o<=e;o++)n.push(y("add",t[o],n[o-1]));for(var a=e+1;a<t.length;a++)n.push(y("add",t[a],y("subtract",n[a-1],t[a-1-e])))}return n}function _(t){var e,n=t.toPlot,r=t.primers,o=t.dateRange,a=t.pType,i=t.countries,u=t.miss,s=t.miss3,m=t.match,l=t.totalSubmission,d=t.useCum,b=t.lookBack,p=[],v=c(r);try{var g=function(){var t=e.value;p.push(o.map((function(e){var r=(n[t][e]||[]).reduce((function(t,e){return f({pType:a,countries:i,miss:u,miss3:s,match:m})(e)&&(t[0].add(e.virus_name),e.misses3>=1&&t[1].add(e.virus_name)),t}),[new Set,new Set]);return{name:t,date:e,mutation3_abs:r[1].size,mutation3_pct:0,mutation_abs:r[0].size,mutation_pct:0,submission_count:l[e],countries_considered:i,lookBack:d?-1:b}})))};for(v.s();!(e=v.n()).done;)g()}catch(y){v.e(y)}finally{v.f()}return d?p.map((function(t){return h(t,-1)})):p.map((function(t){return h(t,b)}))}function O(t){for(var e=t.baseData,n=t.dateRange,r=t.primers,o=t.pType,a=t.countries,i=t.miss,u=t.miss3,s=t.match,c=t.totalSubmission,m=t.useCum,l=t.lookBack,f={},d=function(){var t=p[b];(0===r.length||r.find((function(e){return e===t})))&&(f[t]=e[t])},b=0,p=Object.keys(e);b<p.length;b++)d();return _({toPlot:f,primers:0===r.length?Object.keys(e):r,dateRange:n,pType:o,countries:a,miss:i,miss3:u,match:s,totalSubmission:c,useCum:m,lookBack:l})}function S(t,e,n,r,o,a,i,u,s,c,m){return _({toPlot:t,primers:e,dateRange:n,pType:r,countries:o,miss:a,miss3:i,match:u,totalSubmission:s,useCum:c,lookBack:m})}function D(t){var e=t.data,n=t.dbDaily,r=t.countries,o=t.countryAsTotal,i=t.dates,u=t.useCum,m=t.timeFrameBrush;t.daysBetweenComparison,t.numberOfBars;if(u){var l=m[1]||i[i.length-1],f=m[0]||i[0],d=new Date(l);l=d.toISOString().slice(0,10);var b=new Date(f),p=(d.getTime()-b.getTime())/864e5,g=function(t,e,n,a){function i(t,e){for(var n=s({},t),r=0,o=Object.keys(e);r<o.length;r++){var a=o[r];n[a]=e[a]+(t[a]||0)}return n}var u={};u[a]={};var m,l=c(e);try{for(l.s();!(m=l.n()).done;){var f=m.value;f>=n&&f<=a&&(u[a]=i(u[a],t[f]))}}catch(d){l.e(d)}finally{l.f()}return u[a]=o?v(u,r,a):u[a].total,u}(n,i,b.toISOString().slice(0,10),l);return[[],a(e.reduce((function(t,e){return t.has(e.primer)?t.set(e.primer,s(s({},t.get(e.primer)),{},{mutation3_abs:t.get(e.primer).mutation3_abs+e.misses3===0?0:1,mutation3_pct:(t.get(e.primer).mutation3_abs+e.misses3===0?0:1)/g[l]*100,mutation_abs:t.get(e.primer).mutation_abs+1,mutation_pct:(t.get(e.primer).mutation_abs+1)/g[l]*100})):t.set(e.primer,{name:e.primer,date:l,countries_considered:r,lookBack:p,submission_count:g[l],mutation3_abs:1,mutation3_pct:0/g[l]*100,mutation_abs:1,mutation_pct:1/g[l]*100})}),new Map).values())]}}function k(t,e,n){var r=!(arguments.length>3&&void 0!==arguments[3])||arguments[3];if(n){var o=t.filter((a=new Set(e.map((function(t){return t[n]}))),function(t){return r===a.has(t[n])}));return o}var a,i=t.filter(function(t){return function(e){return r===t.has(e)}}(new Set(e.map((function(t){return t})))));return i}function j(t,e){var n=[];if(e.length===Object.values(t).length&&e.length>1){var r=e.join(", ");return[n=(n=function(t,e){for(var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"accession_id",r=t[0],o=1;o<t.length;o++)r=k(r,t[o],n);return r}(Object.values(t),e.length)).map(l(r)),[r]]}return[n,""]}addEventListener("message",(function(t){var n,r=t.data,o=r.type,a=r.method,i=r.id,u=r.params;"RPC"===o&&a&&((n=e[a])?Promise.resolve().then((function(){return n.apply(e,u)})):Promise.reject("No such method")).then((function(t){postMessage({type:"RPC",id:i,result:t})})).catch((function(t){var e={message:t};t.stack&&(e.message=t.message,e.stack=t.stack,e.name=t.name),postMessage({type:"RPC",id:i,error:e})}))})),postMessage({type:"RPC",method:"ready"})}]);
//# sourceMappingURL=e0d61da6d9ad5210a0e8.worker.js.map