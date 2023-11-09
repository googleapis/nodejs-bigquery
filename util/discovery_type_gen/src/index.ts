'use strict';

import {TypeGenerator} from './generator.js';
import fetch from 'node-fetch';

export async function fetchDiscoDoc(api, version) {
  const url = `https://www.googleapis.com/discovery/v1/apis/${api}/${version}/rest`;

  const response = await fetch(url);
  const json = (await response.json()) as any;
  return json;
}

export function render(json?, options?) {
  return new TypeGenerator(json, options).render();
}

export async function createTypes(api, version) {
  const json = await fetchDiscoDoc(api, version);
  return render(json);
}
