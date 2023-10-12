'use strict';

import { any } from "is";

export class Converter {
  options: any;

  constructor(options) {
    this.options = options;
  }
  createType(schema) {
    const docs = schema.description ? this.toJSDoc(schema.description) : '';
    const name = this.toTypeName(schema.id);
    const type = this.getType(schema);

    return `${docs}type ${name} = ${type}`;
  }
  extend(type, types) {
    if (!Array.isArray(types)) {
      types = [types];
    }

    const refs = types.map(type => this.toTypeName(type));
    return [type, ...refs].join('&');
  }
  getType(schema) {
    let {repeated, ...schemaCopy} = schema;

    if (repeated) {
      return `Array<${this.getType(schemaCopy)}>`;
    }
    if (schema.$ref) {
      return this.toTypeName(schema.$ref);
    }
    if (schema.enum) {
      return this.toLiteralUnion(schema.enum);
    }
    if (schema.type === 'integer') {
      return 'number';
    }
    if (schema.type === 'array') {
      return this.toArray(schema.items, schema.additionalItems);
    }
    if (schema.type !== 'object') {
      return schema.type;
    }

    const type = this.toObject(schema.properties, schema.additionalProperties);
    return schema.extends ? this.extend(type, schema.extends) : type;
  }
  toArray(schema, additional = false) {
    if (Array.isArray(schema)) {
      return this.toTuple(schema, additional);
    }

    const types = [this.getType(schema)];

    if (additional) {
      types.push('any');
    }

    return `Array<${this.toUnion(types)}>`;
  }
  toLiteralUnion(values) {
    const types = values.map(v => (typeof v === 'string' ? `'${v}'` : v));
    return this.toUnion(types);
  }
  toJSDoc(str) {
    const docs = str
      .split('\n')
      .join('\n * ')
      .replace(/\*\//g, '*\\/');
    return `\n/**\n * ${docs}\n */\n`;
  }
  toObject(props = {}, additional: false | any = false) {
    const fields = [];

    Object.keys(props)
      .sort()
      .forEach(name => {
        const prop = props[name];
        const docs = prop.description ? this.toJSDoc(prop.description) : '';
        const prefix = prop.readonly ? 'readonly ' : '';
        const suffix = prop.required ? '' : '?';
        const key = `${prefix}${name}${suffix}`;
        const value = this.getType(prop);
        fields.push(`${docs}${key}: ${value}`);
      });

    if (additional) {
      if (additional === true) additional = {type: 'any'};
      fields.push(`[key: string]: ${this.getType(additional)}`);
    }

    return `{${fields.join(';')}}`;
  }
  toTuple(schemas, additional = false) {
    const types = schemas.map(schema => this.getType(schema));

    if (additional) {
      types.push('...any[]');
    }

    return `[${types.join(', ')}]`;
  }
  toTypeName(ref) {
    return `I${ref}`;
  }
  toUnion(types) {
    return types.join('|');
  }
}

//module.exports = Converter;
