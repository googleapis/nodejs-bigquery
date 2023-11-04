'use strict';

import isEmpty from 'lodash.isempty';
import prettier from 'prettier';

import {Converter} from './converter.js';
import template from 'lodash.template';

export class TypeGenerator {
  converter: Converter;
  template: any;
  name: string;
  title: string;
  schemas: any;
  resources: any;
  constructor(json, options) {
    this.converter = new Converter(options);
    this.template = template('./templates/types.tmpl');
    this.name = json.name;
    this.title = json.title;
    this.schemas = Object.keys(json.schemas || {})
      .sort()
      .map(id => json.schemas[id]);
    this.resources = Resource.createResourceList(json.resources, this);
  }
  render() {
    const source = this.template({
      title: this.title ? this.converter.toJSDoc(this.title) : '',
      name: this.name,
      schemas: this.schemas.map(schema => this.converter.createType(schema)),
      resources: this.resources.map(resource => resource.render())
    });

    return prettier.format(source, {
      parser: 'typescript',
      singleQuote: true
    });
  }
}

export class Resource {
  generator: any;
  template: any;
  name: string;
  methods: any;
  resources: any;
  constructor(name, {methods, resources}, generator) {
    this.generator = generator;
    this.template = template('./templates/resource.tmpl');
    this.name = name;
    this.methods = Method.createMethodList(methods, generator);
    this.resources = Resource.createResourceList(resources, generator);
  }
  render() {
    return this.template({
      name: this.name,
      methods: this.methods.map(method => method.render()),
      resources: this.resources.map(resource => resource.render())
    });
  }
  static createResourceList(resources = {}, generator) {
    const list = [];

    Object.keys(resources)
      .sort()
      .forEach(name => {
        const schema = resources[name];
        const resource = new Resource(name, schema, generator);
        if (!isEmpty(resource.methods) || !isEmpty(resource.resources)) {
          list.push(resource);
        }
      });

    return list;
  }
}

export class Method {
  generator: any;
  template: any;
  name: string;
  params: any;
  docs: any;
  constructor(name, {description, parameters, title}, generator) {
    this.generator = generator;
    this.template = template('./templates/method.tmpl');
    this.name = name.replace(/^./, $0 => $0.toUpperCase());
    this.params = Method.getQueryParams(parameters);
    this.docs = description || title;
  }
  render() {
    const {converter} = this.generator;

    return this.template({
      docs: this.docs ? converter.toJSDoc(this.docs) : '',
      name: converter.toTypeName(this.name),
      params: converter.toObject(this.params)
    });
  }
  static createMethodList(methods = {}, generator) {
    const list = [];

    Object.keys(methods)
      .sort()
      .forEach(name => {
        const schema = methods[name];
        const method = new Method(name, schema, generator);
        if (!isEmpty(method.params)) {
          list.push(method);
        }
      });

    return list;
  }
  static getQueryParams(params = {}) {
    const queryParams = {};

    Object.keys(params)
      .sort()
      .forEach(name => {
        const param = params[name];
        if (param.location !== 'path') {
          queryParams[name] = param;
        }
      });

    return queryParams;
  }
}

// module.exports = TypeGenerator;
