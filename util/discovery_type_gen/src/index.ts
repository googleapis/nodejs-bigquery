'use strict';

import {TypeGenerator} from './generator.js';
import got from 'got';

export async function fetch(api, version) {
  const url = `https://www.${api}.googleapis.com/discovery/v1/apis/${api}/${version}/rest`;
  // for some reason this isn't working despite updates to the got package
  const response = await got(url).json();
  return response.body;
}

export function render(json?, options?) {
  return new TypeGenerator(json, options).render();
}

export async function createTypes(api, version) {
  const json = await fetch(api, version);
  return render(json);
}
