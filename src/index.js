function isUndefined(value) {
  return value === undefined;
}

function isNull(value) {
  return value === null;
}

function isBoolean(value) {
  return typeof value === 'boolean';
}

function isObject(value) {
  return value === Object(value);
}

function isArray(value) {
  return Array.isArray(value);
}

function isDate(value) {
  return value instanceof Date;
}

function isBlob(value) {
  return (
    value &&
    typeof value.size === 'number' &&
    typeof value.type === 'string' &&
    typeof value.slice === 'function'
  );
}

function isFile(value) {
  return (
    isBlob(value) &&
    typeof value.name === 'string' &&
    (typeof value.lastModifiedDate === 'object' ||
      typeof value.lastModified === 'number')
  );
}

function initCfgValue(value) {
  return isUndefined(value) ? false : value;
}

function serialize(obj, cfg, fd, pre) {
  cfg = cfg || {};
  fd = fd || new FormData();

  Object.keys(cfg).forEach((opt) => {
    const value = cfg[opt];

    cfg[opt] = isUndefined(value) ? false : value;
  });

  if (isUndefined(obj)) {
    return fd;
  } else if (isNull(obj)) {
    if (!cfg.nullsAsUndefineds) {
      fd.append(pre, '');
    }
  } else if (isBoolean(obj)) {
    if (cfg.booleansAsIntegers) {
      fd.append(pre, obj ? 1 : 0);
    } else {
      fd.append(pre, obj);
    }
  } else if (isArray(obj)) {
    if (obj.length) {
      obj.forEach((value, index) => {
        let key = pre + '[' + (cfg.indices ? index : '') + ']';

        if (cfg.noFilesWithArrayNotation && isFile(value)) {
          key = pre;
        }

        serialize(value, cfg, fd, key);
      });
    } else if (cfg.allowEmptyArrays) {
      fd.append(pre + '[]', '');
    }
  } else if (isDate(obj)) {
    fd.append(pre, obj.toISOString());
  } else if (isObject(obj) && !isFile(obj) && !isBlob(obj)) {
    Object.keys(obj).forEach((prop) => {
      const value = obj[prop];

      if (isArray(value)) {
        while (prop.length > 2 && prop.lastIndexOf('[]') === prop.length - 2) {
          prop = prop.substring(0, prop.length - 2);
        }
      }

      const key = pre ? pre + '[' + prop + ']' : prop;

      serialize(value, cfg, fd, key);
    });
  } else {
    fd.append(pre, obj);
  }

  return fd;
}

module.exports = {
  serialize,
};
