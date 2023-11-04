'use strict';

import fs from 'fs';
import path from 'path';
import template from 'lodash.template';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cache = new Map();

export const typeTemplate = (src?: string) => {
  if (!cache.has(src)) {
    const fullPath = path.join(__dirname, src);
    const tmpl = fs.readFileSync(fullPath, 'utf8');
    cache.set(src, template(tmpl));
  }
  return cache.get(src);
};
