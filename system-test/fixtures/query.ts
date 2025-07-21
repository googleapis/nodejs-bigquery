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

import {
  civilDateString,
  civilDateTimeString,
  civilTimeString,
  timestampString,
} from '../../src/query/format';
import {protos} from '../../src';

export interface QueryParameterTestCase {
  name: string;
  query: string;
  parameters: protos.google.cloud.bigquery.v2.IQueryParameter[];
  wantRowJSON: {[key: string]: any};
  wantRowValues: any[];
}

export function queryParameterTestCases(): QueryParameterTestCase[] {
  const d = new Date('2016-03-20');
  const tm = '15:04:05.003000'; // TODO use civil time type 
  const dtm = new Date('2016-03-20T15:04:05.003Z');
  const ts = new Date('2016-03-20T15:04:05Z');

  return [
    {
      name: 'Int64Param',
      query: 'SELECT @val',
      parameters: [
        {
          name: 'val',
          parameterType: {type: 'INT64'},
          parameterValue: {
            value: {value: '1'},
          },
        },
      ],
      wantRowJSON: {f0_: 1},
      wantRowValues: [1],
    },
    {
      name: 'FloatParam',
      query: 'SELECT @val',
      parameters: [
        {
          name: 'val',
          parameterType: {type: 'FLOAT64'},
          parameterValue: {
            value: {value: '1.3'},
          },
        },
      ],
      wantRowJSON: {f0_: 1.3},
      wantRowValues: [1.3],
    },
    {
      name: 'BoolParam',
      query: 'SELECT @val',
      parameters: [
        {
          name: 'val',
          parameterType: {type: 'BOOL'},
          parameterValue: {value: {value: 'true'}},
        },
      ],
      wantRowJSON: {f0_: true},
      wantRowValues: [true],
    },
    {
      name: 'StringParam',
      query: 'SELECT @val',
      parameters: [
        {
          name: 'val',
          parameterType: {type: 'STRING'},
          parameterValue: {value: {value:'ABC'}},
        },
      ],
      wantRowJSON: {f0_: 'ABC'},
      wantRowValues: ['ABC'],
    },
    {
      name: 'ByteParam',
      query: 'SELECT @val',
      parameters: [
        {
          name: 'val',
          parameterType: {type: 'BYTES'},
          parameterValue: {
            value: {value: Buffer.from('foo').toString('base64')},
          },
        },
      ],
      wantRowJSON: {f0_: Buffer.from('foo').toString('base64')},
      wantRowValues: [Buffer.from('foo').toString('base64')],
    },
    {
      name: 'TimestampParam',
      query: 'SELECT @val',
      parameters: [
        {
          name: 'val',
          parameterType: {type: 'TIMESTAMP'},
          parameterValue: {value: {value:timestampString(ts)}},
        },
      ],
      wantRowJSON: {f0_: String(ts.valueOf() * 1000)},
      wantRowValues: [String(ts.valueOf() * 1000)],
    },
    {
      name: 'TimestampArrayParam',
      query: 'SELECT @val',
      parameters: [
        {
          name: 'val',
          parameterType: {
            type: 'ARRAY',
            arrayType: {
              type: 'TIMESTAMP',
            },
          },
          parameterValue: {
            arrayValues: [{value: {value: timestampString(ts)}}, {value: {value: timestampString(ts)}}],
          },
        },
      ],
      wantRowJSON: {f0_: [String(ts.valueOf() * 1000), String(ts.valueOf() * 1000)]},
      wantRowValues: [[String(ts.valueOf() * 1000), String(ts.valueOf() * 1000)]],
    },
    {
      name: 'DatetimeParam',
      query: 'SELECT @val',
      parameters: [
        {
          name: 'val',
          parameterType: {type: 'DATETIME'},
          parameterValue: {value: {value: civilDateTimeString(dtm)}},
        },
      ],
      wantRowJSON: {f0_: civilDateTimeString(dtm)},
      wantRowValues: [civilDateTimeString(dtm)],
    },
    {
      name: 'DateParam',
      query: 'SELECT @val',
      parameters: [
        {
          name: 'val',
          parameterType: {type: 'DATE'},
          parameterValue: {value: {value:civilDateString(d)}},
        },
      ],
      wantRowJSON: {f0_: civilDateString(d)},
      wantRowValues: [civilDateString(d)],
    },
    {
      name: 'TimeParam',
      query: 'SELECT @val',
      parameters: [
        {
          name: 'val',
          parameterType: {type: 'TIME'},
          parameterValue: {value: {value:civilTimeString(tm)}},
        },
      ],
      wantRowJSON: {f0_: tm},
      wantRowValues: [tm],
    },
    {
      name: 'JsonParam',
      query: 'SELECT @val',
      parameters: [
        {
          name: 'val',
          parameterType: {type: 'JSON'},
          parameterValue: {
            value: {value:'{"alpha":"beta"}'},
          },
        },
      ],
      wantRowJSON: {f0_: '{"alpha":"beta"}'},
      wantRowValues: ['{"alpha":"beta"}'],
    },
    {
      name: 'NestedStructParam',
      query: 'SELECT @val',
      parameters: [
        {
          name: 'val',
          parameterType: {
            type: 'STRUCT',
            structTypes: [
              {
                name: 'Datetime',
                type: {
                  type: 'DATETIME',
                },
              },
              {
                name: 'StringArray',
                type: {
                  type: 'ARRAY',
                  arrayType: {
                    type: 'STRING',
                  },
                },
              },
              {
                name: 'SubStruct',
                type: {
                  type: 'STRUCT',
                  structTypes: [
                    {
                      name: 'String',
                      type: {
                        type: 'STRING',
                      },
                    },
                  ],
                },
              },
              {
                name: 'SubStructArray',
                type: {
                  type: 'ARRAY',
                  arrayType: {
                    type: 'STRUCT',
                    structTypes: [
                      {
                        name: 'String',
                        type: {
                          type: 'STRING',
                        },
                      },
                    ],
                  },
                },
              },
            ],
          },
          parameterValue: {
            structValues: {
              Datetime: {
                value: {value: civilDateTimeString(dtm)},
              },
              StringArray: {
                arrayValues: [{value: {value: 'a'}}, {value: {value: 'b'}}],
              },
              SubStruct: {
                structValues: {
                  String: {
                    value: {value: 'c'},
                  },
                },
              },
              SubStructArray: {
                arrayValues: [
                  {
                    structValues: {
                      String: {
                        value: {value: 'd'},
                      },
                    },
                  },
                  {
                    structValues: {
                      String: {
                        value: {value: 'e'},
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      ],
      wantRowJSON: {
        f0_: {
          Datetime: civilDateTimeString(dtm),
          StringArray: ['a', 'b'],
          SubStruct: {
            String: 'c',
          },
          SubStructArray: [
            {
              String: 'd',
            },
            {
              String: 'e',
            },
          ],
        },
      },
      wantRowValues: [
        [civilDateTimeString(dtm), ['a', 'b'], ['c'], [['d'], ['e']]],
      ],
    },
  ];
}

