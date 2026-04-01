const blockedKeys = new Set(['__proto__', 'prototype', 'constructor']);

const sanitizeValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === 'object' && value.constructor === Object) {
    const sanitized = {};

    for (const [key, nestedValue] of Object.entries(value)) {
      if (blockedKeys.has(key) || key.startsWith('$') || key.includes('.')) {
        continue;
      }

      sanitized[key] = sanitizeValue(nestedValue);
    }

    return sanitized;
  }

  return value;
};

export const sanitizeRequestInput = (req, _res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }

  if (req.query && typeof req.query === 'object') {
  const safeQuery = sanitizeValue(req.query);
  req.safeQuery = safeQuery; // optional use
}

  next();
};
