// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

export function civilDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function civilTimeString(value: string | Date): string {
  if (value instanceof Date) {
    const h = `${value.getHours()}`.padStart(2, '0');
    const m = `${value.getMinutes()}`.padStart(2, '0');
    const s = `${value.getSeconds()}`.padStart(2, '0');
    const f = `${value.getMilliseconds() * 1000}`.padStart(6, '0');
    return `${h}:${m}:${s}.${f}`;
  }
  return value;
}

export function civilDateTimeString(value: Date | string): string {
  if (value instanceof Date) {
    let time;
    if (value.getHours()) {
      time = civilTimeString(value);
    }
    const y = `${value.getFullYear()}`.padStart(2, '0');
    const m = `${value.getMonth() + 1}`.padStart(2, '0');
    const d = `${value.getDate()}`.padStart(2, '0');
    time = time ? 'T' + time : '';
    return `${y}-${m}-${d}${time}`;
  }
  return value.replace(/^(.*)T(.*)Z$/, '$1 $2');
}

export function timestampString(ts: Date): string {
  return ts.toISOString().replace('T', ' ').replace('Z', '');
}
