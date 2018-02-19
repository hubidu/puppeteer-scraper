/* eslint-disable */

const methodsOfObject = function (obj, className) {
  const methods = [];

  const standard = [
    'constructor',
    'toString',
    'toLocaleString',
    'valueOf',
    'hasOwnProperty',
    'isPrototypeOf',
    'propertyIsEnumerable',
  ];
  // Exclude additional methods  from being wrapped
  const excludes = [
    'grabBrowserLogs',
    'saveScreen',
    'saveScreenshot',
    'defineTimeout',
    'debug',
    'debugSection',
  ]

  while (obj.constructor.name !== className) {
    Object.getOwnPropertyNames(obj).forEach((prop) => {
      if (typeof obj[prop] !== 'function') return;
      if (standard.indexOf(prop) >= 0) return;
      if (excludes.indexOf(prop) >= 0) return;
      if (prop.indexOf('_') === 0) return;
      methods.push(prop);
    });
    obj = obj.__proto__;

    if (!obj || !obj.constructor) break;
  }
  return methods;
};

const wrap = (actor, decoratorFn) => {
  const noDuplicates = arr => arr.filter((item, index, self) => index === self.indexOf(item));

  const methods = noDuplicates(methodsOfObject(actor));

  methods.forEach(method => {
    actor[method] = decoratorFn(actor, actor[method]);
  });
  actor.$isWrapped = true;
  return actor;
}

module.exports = wrap;
