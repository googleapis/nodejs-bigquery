'use strict';

import fs from 'fs';
import path from 'path';
import template from 'lodash.template';

const cache = new Map();

module.exports = src => {
  if (!cache.has(src)) {
    const fullPath = path.join(__dirname, src);
    const tmpl = fs.readFileSync(fullPath, 'utf8');
    cache.set(src, template(tmpl));
  }
  return cache.get(src);
};
