!function(t){var e={};function n(r){if(e[r])return e[r].exports;var o=e[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=t,n.c=e,n.d=function(t,e,r){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r})},n.r=function(t){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"===typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)n.d(r,o,function(e){return t[e]}.bind(null,o));return r},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="https://mendel3.bii.a-star.edu.sg/METHODS/corona/gamma/primer/build/",n(n.s=0)}([function(t,e,n){"use strict";function r(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=new Array(e);n<e;n++)r[n]=t[n];return r}function o(t,e){if(t){if("string"===typeof t)return r(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return"Object"===n&&t.constructor&&(n=t.constructor.name),"Map"===n||"Set"===n?Array.from(n):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?r(t,e):void 0}}function a(t){return function(t){if(Array.isArray(t))return r(t)}(t)||function(t){if("undefined"!==typeof Symbol&&Symbol.iterator in Object(t))return Array.from(t)}(t)||o(t)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function i(t){if("undefined"===typeof Symbol||null==t[Symbol.iterator]){if(Array.isArray(t)||(t=o(t))){var e=0,n=function(){};return{s:n,n:function(){return e>=t.length?{done:!0}:{done:!1,value:t[e++]}},e:function(t){throw t},f:n}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var r,a,i=!0,u=!1;return{s:function(){r=t[Symbol.iterator]()},n:function(){var t=r.next();return i=t.done,t},e:function(t){u=!0,a=t},f:function(){try{i||null==r.return||r.return()}finally{if(u)throw a}}}}function u(t,e){return function(t){if(Array.isArray(t))return t}(t)||function(t,e){if("undefined"!==typeof Symbol&&Symbol.iterator in Object(t)){var n=[],r=!0,o=!1,a=void 0;try{for(var i,u=t[Symbol.iterator]();!(r=(i=u.next()).done)&&(n.push(i.value),!e||n.length!==e);r=!0);}catch(s){o=!0,a=s}finally{try{r||null==u.return||u.return()}finally{if(o)throw a}}return n}}(t,e)||o(t,e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}n.r(e),n.d(e,"filterTable",(function(){return c})),n.d(e,"getTotalSubmission",(function(){return d})),n.d(e,"getLineGraphData",(function(){return g})),n.d(e,"getCombinedLineData",(function(){return h})),n.d(e,"makeBarData",(function(){return y})),n.d(e,"makeIntersection",(function(){return S}));var s=function(t){var e=t.timeFrameBrush,n=void 0===e?[]:e,r=t.primers,o=void 0===r?[]:r,a=t.pType,i=void 0===a?[]:a,s=t.countries,c=void 0===s?[]:s,m=t.miss,l=void 0===m?[]:m,f=t.miss3,d=void 0===f?[]:f,p=t.match,b=void 0===p?[]:p;return function(t){var e=!0,r=!0,a=!0,s=!0,m=!0,f=!0,p=!0;if(0!==n.length){var v=new Date(t.date),g=u(n,2),h=g[0],y=g[1];e=v.getTime()>=new Date(h).getTime()&&v.getTime()<=new Date(y).getTime()}return 0!==o.length&&(r=o.includes(t.primer)),0!==i.length&&(a=i.includes(t.type)),0!==c.length&&(s=c.map((function(t){return t.label})).includes(t.country_name)),0!==l.length&&(m=t.misses>=(l[0]||0)&&t.misses<=(l[1]||100)),0!==d.length&&(f=t.misses3>=(d[0]||0)&&t.misses3<=(d[1]||100)),0!==b.length&&(p=t.match_pct>=(b[0]||0)&&t.match_pct<=(b[1]||100)),e&&r&&a&&s&&m&&f&&p}};function c(t){var e=t.baseTableData,n=t.timeFrameBrush,r=void 0===n?[]:n,o=t.primers,a=void 0===o?[]:o,i=t.pType,u=void 0===i?[]:i,c=t.countries,m=void 0===c?[]:c,l=t.miss,f=void 0===l?[]:l,d=t.miss3,p=void 0===d?[]:d,b=t.match,v=void 0===b?[]:b;return e.filter(s({primers:a,pType:u,countries:m,miss:f,miss3:p,match:v,timeFrameBrush:r}))}function m(t,e){for(var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0,r={},o=0,a=Object.keys(e);o<a.length;o++){var i=a[o];r[i]=(t[i]||n)+e[i]}return r}function l(t,e){for(var n={},r=0,o=Object.keys(e);r<o.length;r++){var a=o[r];n[a]=t[a]-e[a]}return n}function f(t,e,n){return 0===e.length?t[n].total:e.reduce((function(e,r){return e+=t[n][r.value]||0}),0)}function d(t){var e=t.dbDaily,n=t.dbCum,r=t.dateRange,o=t.countries,a=t.countryAsTotal,u=t.useCum,s=t.lookBack;if(u){for(var c={},d=0,p=Object.keys(n);d<p.length;d++){var b=p[d];c[b]=a?f(n,o,b):n[b].total}return c}var v,g=function(t,e,n){var r=new Date(n[0]),o=new Date(r),a=new Date(n[n.length-1]);o.setDate(o.getDate()+e);var i=r.toISOString().slice(0,10),u={};u[i]=JSON.parse(JSON.stringify(t[i])),r.setDate(r.getDate()+1);for(var s=r;s<=o;s.setDate(s.getDate()+1)){var c=s.toISOString().slice(0,10),f=new Date(s);f.setDate(f.getDate()-1),f=f.toISOString().slice(0,10),u[c]=m(u[f],t[c]||{})}o.setDate(o.getDate()+1);for(var d=o;d<=a;d.setDate(d.getDate()+1)){var p=d.toISOString().slice(0,10),b=new Date(d);b.setDate(b.getDate()-1);var v=new Date(b);v.setDate(v.getDate()-e),b=b.toISOString().slice(0,10),v=v.toISOString().slice(0,10),u[p]=m(l(u[b],t[v]),t[p]||{})}return u}(e,s,r),h=i(r);try{for(h.s();!(v=h.n()).done;){var y=v.value;g[y]=a?f(g,o,y):g[y].total}}catch(_){h.e(_)}finally{h.f()}return g}function p(t,e,n){if("add"===t){var r=e.mutation_abs+n.mutation_abs,o=e.mutation3_abs+n.mutation3_abs;return{name:e.name,date:e.date,mutation3_abs:o,mutation3_pct:o/e.submission_count*100,mutation_abs:r,mutation_pct:r/e.submission_count*100,submission_count:e.submission_count,countries_considered:e.countries_considered,lookBack:e.lookBack}}if("subtract"===t){var a=e.mutation_abs-n.mutation_abs,i=e.mutation3_abs-n.mutation3_abs;return{name:e.name,date:e.date,mutation3_abs:i,mutation3_pct:i/e.submission_count*100,mutation_abs:a,mutation_pct:a/e.submission_count*100,submission_count:e.submission_count,countries_considered:e.countries_considered,lookBack:e.lookBack}}throw'invalid f, expected "add" or "subtract", got '.concat(t)}function b(t,e){var n=[];if(n.push({name:t[0].name,date:t[0].date,mutation3_abs:t[0].mutation3_abs,mutation3_pct:t[0].mutation3_abs/t[0].submission_count,mutation_abs:t[0].mutation_abs,mutation_pct:t[0].mutation_abs/t[0].submission_count,submission_count:t[0].submission_count,countries_considered:t[0].countries,lookBack:t[0].lookBack}),-1===e)for(var r=1;r<t.length;r++)n.push(p("add",t[r],n[r-1]));else{for(var o=1;o<=e;o++)n.push(p("add",t[o],t[o-1]));for(var a=e+1;a<t.length;a++)n.push(p("add",t[a],p("subtract",n[a-1],t[a-1-e])))}return n}function v(t){var e,n=t.toPlot,r=t.primers,o=t.dateRange,a=t.pType,u=t.countries,c=t.miss,m=t.miss3,l=t.match,f=t.totalSubmission,d=t.useCum,p=t.lookBack,v=performance.now(),g=[],h=i(r);try{var y=function(){var t=e.value;g.push(o.map((function(e){var r=(n[t][e]||[]).reduce((function(t,e){return s({pType:a,countries:u,miss:c,miss3:m,match:l})(e)&&(t[0].add(e.virus_name),e.misses3>=1&&(t[1]=t[1]+1)),t}),[new Set,0]);return{name:t,date:e,mutation3_abs:r[1],mutation3_pct:0,mutation_abs:r[0].size,mutation_pct:0,submission_count:f[e],countries_considered:u,lookBack:d?-1:p}})))};for(h.s();!(e=h.n()).done;)y()}catch(_){h.e(_)}finally{h.f()}return console.log("Finish graph data compute ".concat((performance.now()-v).toFixed(5)," ms")),d?g.map((function(t){return b(t,-1)})):g.map((function(t){return b(t,p)}))}function g(t){for(var e=t.baseData,n=t.dateRange,r=t.primers,o=t.pType,a=t.countries,i=t.miss,u=t.miss3,s=t.match,c=t.totalSubmission,m=t.useCum,l=t.lookBack,f={},d=function(){var t=b[p];(0===r.length||r.find((function(e){return e===t})))&&(f[t]=e[t])},p=0,b=Object.keys(e);p<b.length;p++)d();return v({toPlot:f,primers:0===r.length?Object.keys(e):r,dateRange:n,pType:o,countries:a,miss:i,miss3:u,match:s,totalSubmission:c,useCum:m,lookBack:l})}function h(t,e,n,r,o,a,i,u,s,c,m){return v({toPlot:t,primers:e,dateRange:n,pType:r,countries:o,miss:a,miss3:i,match:u,totalSubmission:s,useCum:c,lookBack:m})}function y(t){var e=t.graphOverview,n=t.dates,r=t.timeFrameBrush,o=t.daysBetweenComparison,i=t.numberOfBars,u=[],s=r[1]||new Date(n[n.length-1]),c=new Date(s);for(c.setDate(c.getDate()-o*i);c.getTime()<new Date(n[0]);)c.setDate(c.getDate()+o);for(var m=function(t){for(var n=[],r=0;r<e.length;r++){var o=e[r].filter((function(e){return e.date===t.toISOString().slice(0,10)}));n.push.apply(n,a(o))}u.push(n)},l=c;l<=s;l.setDate(l.getDate()+o))m(l);return u}function _(t,e,n){var r=!(arguments.length>3&&void 0!==arguments[3])||arguments[3];if(n){var o=t.filter((a=new Set(e.map((function(t){return t[n]}))),function(t){return r===a.has(t[n])}));return o}var a,i=t.filter(function(t){return function(e){return r===t.has(e)}}(new Set(e.map((function(t){return t})))));return i}function S(t,e){console.log("tableData :>> ",t),console.log("primerNames :>> ",e);var n,r=[];if(e.length>1){var o=e.join(", ");return[r=(r=function(t){for(var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"accession_id",n=t[0],r=1;r<t.length;r++)n=_(n,t[r],e);return n}(Object.values(t))).map((n=o,function(t){return t.primer=n,t})),[o]]}return[r,""]}addEventListener("message",(function(t){var n,r=t.data,o=r.type,a=r.method,i=r.id,u=r.params;"RPC"===o&&a&&((n=e[a])?Promise.resolve().then((function(){return n.apply(e,u)})):Promise.reject("No such method")).then((function(t){postMessage({type:"RPC",id:i,result:t})})).catch((function(t){var e={message:t};t.stack&&(e.message=t.message,e.stack=t.stack,e.name=t.name),postMessage({type:"RPC",id:i,error:e})}))})),postMessage({type:"RPC",method:"ready"})}]);
//# sourceMappingURL=5997616f0bb2b4346dd6.worker.js.map