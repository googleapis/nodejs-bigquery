/**
 * A Complex API Schema
 */
declare namespace complex {
  type IExtendedSchema = {id?: number} & IOtherSchema;

  type IOtherSchema = {prop?: string};

  /**
   * A complex schema!
   */
  type ISchema = {
    array?: Array<IOtherSchema>;
    custom?: IOtherSchema;
    /**
     * A description
     */
    doc?: string;
    integer?: number;
    literalUnion?: 'a' | 'b' | 'c';
    /**
     * A much longer description.
     * On multiple lines!
     */
    multilineDoc?: string;
    nested?: Array<{
      /**
       * A nested property
       */
      nestedProp?: IExtendedSchema;
    }>;
    nestedRepeated?: Array<{nestedRepeatedProp?: Array<'foo' | 'bar'>}>;
    obj?: {key: string; [key: string]: string};
    readonly readOnly?: string;
    repeated?: Array<'done' | 'pending' | 'running'>;
    required: string;
    tuple?: [string, number];
  };
}

export default complex;
