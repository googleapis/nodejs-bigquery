/**
 * BigQuery API
 */
declare namespace bigquery {
  /**
   * Evaluation metrics for binary classification/classifier models.
   */
  type IBinaryClassificationMetrics = {
    /**
     * Label representing the positive class.
     */
    positiveLabel?: string;
    /**
     * Binary confusion matrix at multiple thresholds.
     */
    binaryConfusionMatrixList?: Array<IBinaryConfusionMatrix>;
    /**
     * Aggregate classification metrics.
     */
    aggregateClassificationMetrics?: IAggregateClassificationMetrics;
    /**
     * Label representing the negative class.
     */
    negativeLabel?: string;
  };

  type IClustering = {
    /**
     * [Repeated] One or more fields on which data should be clustered. Only top-level, non-repeated, simple-type fields are supported. When you cluster a table using multiple columns, the order of columns you specify is important. The order of the specified columns determines the sort order of the data.
     */
    fields?: Array<string>;
  };

  type IBqmlTrainingRun = {
    /**
     * [Output-only, Beta] Training options used by this training run. These options are mutable for subsequent training runs. Default values are explicitly stored for options not specified in the input query of the first training run. For subsequent training runs, any option not explicitly specified in the input query will be copied from the previous training run.
     */
    trainingOptions?: {
      earlyStop?: boolean;
      l1Reg?: number;
      maxIteration?: string;
      learnRate?: number;
      minRelProgress?: number;
      l2Reg?: number;
      warmStart?: boolean;
      learnRateStrategy?: string;
      lineSearchInitLearnRate?: number;
    };
    /**
     * [Output-only, Beta] Different state applicable for a training run. IN PROGRESS: Training run is in progress. FAILED: Training run ended due to a non-retryable failure. SUCCEEDED: Training run successfully completed. CANCELLED: Training run cancelled by the user.
     */
    state?: string;
    /**
     * [Output-only, Beta] List of each iteration results.
     */
    iterationResults?: Array<IBqmlIterationResult>;
    /**
     * [Output-only, Beta] Training run start time in milliseconds since the epoch.
     */
    startTime?: string;
  };

  type IBigtableColumnFamily = {
    /**
     * [Optional] The encoding of the values when the type is not STRING. Acceptable encoding values are: TEXT - indicates values are alphanumeric text strings. BINARY - indicates values are encoded using HBase Bytes.toBytes family of functions. This can be overridden for a specific column by listing that column in 'columns' and specifying an encoding for it.
     */
    encoding?: string;
    /**
     * [Optional] Lists of columns that should be exposed as individual fields as opposed to a list of (column name, value) pairs. All columns whose qualifier matches a qualifier in this list can be accessed as .. Other columns can be accessed as a list through .Column field.
     */
    columns?: Array<IBigtableColumn>;
    /**
     * [Optional] The type to convert the value in cells of this column family. The values are expected to be encoded using HBase Bytes.toBytes function when using the BINARY encoding value. Following BigQuery types are allowed (case-sensitive) - BYTES STRING INTEGER FLOAT BOOLEAN Default type is BYTES. This can be overridden for a specific column by listing that column in 'columns' and specifying a type for it.
     */
    type?: string;
    /**
     * Identifier of the column family.
     */
    familyId?: string;
    /**
     * [Optional] If this is set only the latest version of value are exposed for all columns in this column family. This can be overridden for a specific column by listing that column in 'columns' and specifying a different setting for that column.
     */
    onlyReadLatest?: boolean;
  };

  type IRangePartitioning = {
    /**
     * [TrustedTester] [Required] Defines the ranges for range partitioning.
     */
    range?: {
      /**
       * [TrustedTester] [Required] The end of range partitioning, exclusive.
       */
      end?: string;
      /**
       * [TrustedTester] [Required] The width of each interval.
       */
      interval?: string;
      /**
       * [TrustedTester] [Required] The start of range partitioning, inclusive.
       */
      start?: string;
    };
    /**
     * [TrustedTester] [Required] The table is partitioned by this field. The field must be a top-level NULLABLE/REQUIRED field. The only supported type is INTEGER/INT64.
     */
    field?: string;
  };

  type IJobConfigurationLoad = {
    /**
     * [Optional] Specifies a string that represents a null value in a CSV file. For example, if you specify "\N", BigQuery interprets "\N" as a null value when loading a CSV file. The default value is the empty string. If you set this property to a custom value, BigQuery throws an error if an empty string is present for all data types except for STRING and BYTE. For STRING and BYTE columns, BigQuery interprets the empty string as an empty value.
     */
    nullMarker?: string;
    /**
     * [Optional] The schema for the destination table. The schema can be omitted if the destination table already exists, or if you're loading data from Google Cloud Datastore.
     */
    schema?: ITableSchema;
    /**
     * [Deprecated] The format of the schemaInline property.
     */
    schemaInlineFormat?: string;
    /**
     * [Optional] The value that is used to quote data sections in a CSV file. BigQuery converts the string to ISO-8859-1 encoding, and then uses the first byte of the encoded string to split the data in its raw, binary state. The default value is a double-quote ('"'). If your data does not contain quoted sections, set the property value to an empty string. If your data contains quoted newline characters, you must also set the allowQuotedNewlines property to true.
     */
    quote?: string;
    /**
     * [Optional] Specifies the action that occurs if the destination table already exists. The following values are supported: WRITE_TRUNCATE: If the table already exists, BigQuery overwrites the table data. WRITE_APPEND: If the table already exists, BigQuery appends the data to the table. WRITE_EMPTY: If the table already exists and contains data, a 'duplicate' error is returned in the job result. The default value is WRITE_APPEND. Each action is atomic and only occurs if BigQuery is able to complete the job successfully. Creation, truncation and append actions occur as one atomic update upon job completion.
     */
    writeDisposition?: string;
    /**
     * [Beta] [Optional] Properties with which to create the destination table if it is new.
     */
    destinationTableProperties?: IDestinationTableProperties;
    /**
     * [Optional] The format of the data files. For CSV files, specify "CSV". For datastore backups, specify "DATASTORE_BACKUP". For newline-delimited JSON, specify "NEWLINE_DELIMITED_JSON". For Avro, specify "AVRO". For parquet, specify "PARQUET". For orc, specify "ORC". The default value is CSV.
     */
    sourceFormat?: string;
    /**
     * [Optional] Indicates if BigQuery should allow extra values that are not represented in the table schema. If true, the extra values are ignored. If false, records with extra columns are treated as bad records, and if there are too many bad records, an invalid error is returned in the job result. The default value is false. The sourceFormat property determines what BigQuery treats as an extra value: CSV: Trailing columns JSON: Named values that don't match any column names
     */
    ignoreUnknownValues?: boolean;
    /**
     * [Required] The destination table to load the data into.
     */
    destinationTable?: ITableReference;
    /**
     * [Optional] The character encoding of the data. The supported values are UTF-8 or ISO-8859-1. The default value is UTF-8. BigQuery decodes the data after the raw, binary data has been split using the values of the quote and fieldDelimiter properties.
     */
    encoding?: string;
    /**
     * [Beta] Clustering specification for the destination table. Must be specified with time-based partitioning, data in the table will be first partitioned and subsequently clustered.
     */
    clustering?: IClustering;
    /**
     * [Optional] Specifies whether the job is allowed to create new tables. The following values are supported: CREATE_IF_NEEDED: If the table does not exist, BigQuery creates the table. CREATE_NEVER: The table must already exist. If it does not, a 'notFound' error is returned in the job result. The default value is CREATE_IF_NEEDED. Creation, truncation and append actions occur as one atomic update upon job completion.
     */
    createDisposition?: string;
    /**
     * [Optional, Trusted Tester] If hive partitioning is enabled, which mode to use. Two modes are supported: - AUTO: automatically infer partition key name(s) and type(s). - STRINGS: automatic infer partition key name(s). All types are strings. Not all storage formats support hive partitioning -- requesting hive partitioning on an unsupported format will lead to an error.
     */
    hivePartitioningMode?: string;
    /**
     * [Optional] The maximum number of bad records that BigQuery can ignore when running the job. If the number of bad records exceeds this value, an invalid error is returned in the job result. This is only valid for CSV and JSON. The default value is 0, which requires that all records are valid.
     */
    maxBadRecords?: number;
    /**
     * [Required] The fully-qualified URIs that point to your data in Google Cloud. For Google Cloud Storage URIs: Each URI can contain one '*' wildcard character and it must come after the 'bucket' name. Size limits related to load jobs apply to external data sources. For Google Cloud Bigtable URIs: Exactly one URI can be specified and it has be a fully specified and valid HTTPS URL for a Google Cloud Bigtable table. For Google Cloud Datastore backups: Exactly one URI can be specified. Also, the '*' wildcard character is not allowed.
     */
    sourceUris?: Array<string>;
    /**
     * [Optional] Accept rows that are missing trailing optional columns. The missing values are treated as nulls. If false, records with missing trailing columns are treated as bad records, and if there are too many bad records, an invalid error is returned in the job result. The default value is false. Only applicable to CSV, ignored for other formats.
     */
    allowJaggedRows?: boolean;
    /**
     * [Optional] The separator for fields in a CSV file. The separator can be any ISO-8859-1 single-byte character. To use a character in the range 128-255, you must encode the character as UTF8. BigQuery converts the string to ISO-8859-1 encoding, and then uses the first byte of the encoded string to split the data in its raw, binary state. BigQuery also supports the escape sequence "\t" to specify a tab separator. The default value is a comma (',').
     */
    fieldDelimiter?: string;
    /**
     * If sourceFormat is set to "DATASTORE_BACKUP", indicates which entity properties to load into BigQuery from a Cloud Datastore backup. Property names are case sensitive and must be top-level properties. If no properties are specified, BigQuery loads all properties. If any named property isn't found in the Cloud Datastore backup, an invalid error is returned in the job result.
     */
    projectionFields?: Array<string>;
    /**
     * Indicates if BigQuery should allow quoted data sections that contain newline characters in a CSV file. The default value is false.
     */
    allowQuotedNewlines?: boolean;
    /**
     * [Optional, Trusted Tester] Options to configure hive partitioning support.
     */
    hivePartitioningOptions?: IHivePartitioningOptions;
    /**
     * [Optional] If sourceFormat is set to "AVRO", indicates whether to enable interpreting logical types into their corresponding types (ie. TIMESTAMP), instead of only using their raw types (ie. INTEGER).
     */
    useAvroLogicalTypes?: boolean;
    /**
     * [Optional] The number of rows at the top of a CSV file that BigQuery will skip when loading the data. The default value is 0. This property is useful if you have header rows in the file that should be skipped.
     */
    skipLeadingRows?: number;
    /**
     * Time-based partitioning specification for the destination table. Only one of timePartitioning and rangePartitioning should be specified.
     */
    timePartitioning?: ITimePartitioning;
    /**
     * [Optional] Indicates if we should automatically infer the options and schema for CSV and JSON sources.
     */
    autodetect?: boolean;
    /**
     * Custom encryption configuration (e.g., Cloud KMS keys).
     */
    destinationEncryptionConfiguration?: IEncryptionConfiguration;
    /**
     * Allows the schema of the destination table to be updated as a side effect of the load job if a schema is autodetected or supplied in the job configuration. Schema update options are supported in two cases: when writeDisposition is WRITE_APPEND; when writeDisposition is WRITE_TRUNCATE and the destination table is a partition of a table, specified by partition decorators. For normal tables, WRITE_TRUNCATE will always overwrite the schema. One or more of the following values are specified: ALLOW_FIELD_ADDITION: allow adding a nullable field to the schema. ALLOW_FIELD_RELAXATION: allow relaxing a required field in the original schema to nullable.
     */
    schemaUpdateOptions?: Array<string>;
    /**
     * [Deprecated] The inline schema. For CSV schemas, specify as "Field1:Type1[,Field2:Type2]*". For example, "foo:STRING, bar:INTEGER, baz:FLOAT".
     */
    schemaInline?: string;
    /**
     * [TrustedTester] Range partitioning specification for this table. Only one of timePartitioning and rangePartitioning should be specified.
     */
    rangePartitioning?: IRangePartitioning;
  };

  /**
   * Message containing the information about one cluster.
   */
  type ICluster = {
    /**
     * Count of training data rows that were assigned to this cluster.
     */
    count?: string;
    /**
     * Values of highly variant features for this cluster.
     */
    featureValues?: Array<IFeatureValue>;
    /**
     * Centroid id.
     */
    centroidId?: string;
  };

  type IExternalDataConfiguration = {
    /**
     * [Optional] Additional options if sourceFormat is set to GOOGLE_SHEETS.
     */
    googleSheetsOptions?: IGoogleSheetsOptions;
    /**
     * Try to detect schema and format options automatically. Any option specified explicitly will be honored.
     */
    autodetect?: boolean;
    /**
     * [Optional] Indicates if BigQuery should allow extra values that are not represented in the table schema. If true, the extra values are ignored. If false, records with extra columns are treated as bad records, and if there are too many bad records, an invalid error is returned in the job result. The default value is false. The sourceFormat property determines what BigQuery treats as an extra value: CSV: Trailing columns JSON: Named values that don't match any column names Google Cloud Bigtable: This setting is ignored. Google Cloud Datastore backups: This setting is ignored. Avro: This setting is ignored.
     */
    ignoreUnknownValues?: boolean;
    /**
     * [Required] The data format. For CSV files, specify "CSV". For Google sheets, specify "GOOGLE_SHEETS". For newline-delimited JSON, specify "NEWLINE_DELIMITED_JSON". For Avro files, specify "AVRO". For Google Cloud Datastore backups, specify "DATASTORE_BACKUP". [Beta] For Google Cloud Bigtable, specify "BIGTABLE".
     */
    sourceFormat?: string;
    /**
     * [Optional] The compression type of the data source. Possible values include GZIP and NONE. The default value is NONE. This setting is ignored for Google Cloud Bigtable, Google Cloud Datastore backups and Avro formats.
     */
    compression?: string;
    /**
     * [Optional, Trusted Tester] If hive partitioning is enabled, which mode to use. Two modes are supported: - AUTO: automatically infer partition key name(s) and type(s). - STRINGS: automatic infer partition key name(s). All types are strings. Not all storage formats support hive partitioning -- requesting hive partitioning on an unsupported format will lead to an error. Note: this setting is in the process of being deprecated in favor of hivePartitioningOptions.
     */
    hivePartitioningMode?: string;
    /**
     * [Optional] The maximum number of bad records that BigQuery can ignore when reading data. If the number of bad records exceeds this value, an invalid error is returned in the job result. This is only valid for CSV, JSON, and Google Sheets. The default value is 0, which requires that all records are valid. This setting is ignored for Google Cloud Bigtable, Google Cloud Datastore backups and Avro formats.
     */
    maxBadRecords?: number;
    /**
     * [Required] The fully-qualified URIs that point to your data in Google Cloud. For Google Cloud Storage URIs: Each URI can contain one '*' wildcard character and it must come after the 'bucket' name. Size limits related to load jobs apply to external data sources. For Google Cloud Bigtable URIs: Exactly one URI can be specified and it has be a fully specified and valid HTTPS URL for a Google Cloud Bigtable table. For Google Cloud Datastore backups, exactly one URI can be specified. Also, the '*' wildcard character is not allowed.
     */
    sourceUris?: Array<string>;
    /**
     * Additional properties to set if sourceFormat is set to CSV.
     */
    csvOptions?: ICsvOptions;
    /**
     * [Optional] Additional options if sourceFormat is set to BIGTABLE.
     */
    bigtableOptions?: IBigtableOptions;
    /**
     * [Optional] The schema for the data. Schema is required for CSV and JSON formats. Schema is disallowed for Google Cloud Bigtable, Cloud Datastore backups, and Avro formats.
     */
    schema?: ITableSchema;
    /**
     * [Optional, Trusted Tester] Options to configure hive partitioning support.
     */
    hivePartitioningOptions?: IHivePartitioningOptions;
  };

  type IGoogleSheetsOptions = {
    /**
     * [Optional] Range of a sheet to query from. Only used when non-empty. Typical format: sheet_name!top_left_cell_id:bottom_right_cell_id For example: sheet1!A1:B20
     */
    range?: string;
    /**
     * [Optional] The number of rows at the top of a sheet that BigQuery will skip when reading the data. The default value is 0. This property is useful if you have header rows that should be skipped. When autodetect is on, behavior is the following: * skipLeadingRows unspecified - Autodetect tries to detect headers in the first row. If they are not detected, the row is read as data. Otherwise data is read starting from the second row. * skipLeadingRows is 0 - Instructs autodetect that there are no headers and data should be read starting from the first row. * skipLeadingRows = N > 0 - Autodetect skips N-1 rows and tries to detect headers in row N. If headers are not detected, row N is just skipped. Otherwise row N is used to extract column names for the detected schema.
     */
    skipLeadingRows?: string;
  };

  type ITableDataInsertAllRequest = {
    /**
     * The rows to insert.
     */
    rows?: Array<{
      /**
       * [Optional] A unique ID for each row. BigQuery uses this property to detect duplicate insertion requests on a best-effort basis.
       */
      insertId?: string;
      /**
       * [Required] A JSON object that contains a row of data. The object's properties and values must match the destination table's schema.
       */
      json?: IJsonObject;
    }>;
    /**
     * The resource type of the response.
     */
    kind?: string;
    /**
     * If specified, treats the destination table as a base template, and inserts the rows into an instance table named "{destination}{templateSuffix}". BigQuery will manage creation of the instance table, using the schema of the base template table. See https://cloud.google.com/bigquery/streaming-data-into-bigquery#template-tables for considerations when working with templates tables.
     */
    templateSuffix?: string;
    /**
     * [Optional] Accept rows that contain values that do not match the schema. The unknown values are ignored. Default is false, which treats unknown values as errors.
     */
    ignoreUnknownValues?: boolean;
    /**
     * [Optional] Insert all valid rows of a request, even if invalid rows exist. The default value is false, which causes the entire request to fail if any invalid rows exist.
     */
    skipInvalidRows?: boolean;
  };

  type ITableList = {
    /**
     * A token to request the next page of results.
     */
    nextPageToken?: string;
    /**
     * The total number of tables in the dataset.
     */
    totalItems?: number;
    /**
     * The type of list.
     */
    kind?: string;
    /**
     * Tables in the requested dataset.
     */
    tables?: Array<{
      /**
       * The type of table. Possible values are: TABLE, VIEW.
       */
      type?: string;
      /**
       * [Beta] Clustering specification for this table, if configured.
       */
      clustering?: IClustering;
      /**
       * [Optional] The time when this table expires, in milliseconds since the epoch. If not present, the table will persist indefinitely. Expired tables will be deleted and their storage reclaimed.
       */
      expirationTime?: string;
      /**
       * An opaque ID of the table
       */
      id?: string;
      /**
       * A reference uniquely identifying the table.
       */
      tableReference?: ITableReference;
      /**
       * The user-friendly name for this table.
       */
      friendlyName?: string;
      /**
       * The time-based partitioning specification for this table, if configured.
       */
      timePartitioning?: ITimePartitioning;
      /**
       * The resource type.
       */
      kind?: string;
      /**
       * Additional details for a view.
       */
      view?: {
        /**
         * True if view is defined in legacy SQL dialect, false if in standard SQL.
         */
        useLegacySql?: boolean;
      };
      /**
       * The time when this table was created, in milliseconds since the epoch.
       */
      creationTime?: string;
      /**
       * The labels associated with this table. You can use these to organize and group your tables.
       */
      labels?: { [key: string]: string };
    }>;
    /**
     * A hash of this page of results.
     */
    etag?: string;
  };

  type IBigtableColumn = {
    /**
     * [Optional] The type to convert the value in cells of this column. The values are expected to be encoded using HBase Bytes.toBytes function when using the BINARY encoding value. Following BigQuery types are allowed (case-sensitive) - BYTES STRING INTEGER FLOAT BOOLEAN Default type is BYTES. 'type' can also be set at the column family level. However, the setting at this level takes precedence if 'type' is set at both levels.
     */
    type?: string;
    /**
     * [Required] Qualifier of the column. Columns in the parent column family that has this exact qualifier are exposed as . field. If the qualifier is valid UTF-8 string, it can be specified in the qualifier_string field. Otherwise, a base-64 encoded value must be set to qualifier_encoded. The column field name is the same as the column qualifier. However, if the qualifier is not a valid BigQuery field identifier i.e. does not match [a-zA-Z][a-zA-Z0-9_]*, a valid identifier must be provided as field_name.
     */
    qualifierEncoded?: string;
    /**
     * [Optional] If this is set, only the latest version of value in this column are exposed. 'onlyReadLatest' can also be set at the column family level. However, the setting at this level takes precedence if 'onlyReadLatest' is set at both levels.
     */
    onlyReadLatest?: boolean;
    /**
     * [Optional] If the qualifier is not a valid BigQuery field identifier i.e. does not match [a-zA-Z][a-zA-Z0-9_]*, a valid identifier must be provided as the column field name and is used as field name in queries.
     */
    fieldName?: string;
    qualifierString?: string;
    /**
     * [Optional] The encoding of the values when the type is not STRING. Acceptable encoding values are: TEXT - indicates values are alphanumeric text strings. BINARY - indicates values are encoded using HBase Bytes.toBytes family of functions. 'encoding' can also be set at the column family level. However, the setting at this level takes precedence if 'encoding' is set at both levels.
     */
    encoding?: string;
  };

  type ITableFieldSchema = {
    /**
     * [Required] The field name. The name must contain only letters (a-z, A-Z), numbers (0-9), or underscores (_), and must start with a letter or underscore. The maximum length is 128 characters.
     */
    name?: string;
    /**
     * [Required] The field data type. Possible values include STRING, BYTES, INTEGER, INT64 (same as INTEGER), FLOAT, FLOAT64 (same as FLOAT), BOOLEAN, BOOL (same as BOOLEAN), TIMESTAMP, DATE, TIME, DATETIME, RECORD (where RECORD indicates that the field contains a nested schema) or STRUCT (same as RECORD).
     */
    type?: string;
    /**
     * [Optional] The field mode. Possible values include NULLABLE, REQUIRED and REPEATED. The default value is NULLABLE.
     */
    mode?: string;
    /**
     * [Optional] The categories attached to this field, used for field-level access control.
     */
    categories?: {
      /**
       * A list of category resource names. For example, "projects/1/taxonomies/2/categories/3". At most 5 categories are allowed.
       */
      names?: Array<string>;
    };
    /**
     * [Optional] The field description. The maximum length is 1,024 characters.
     */
    description?: string;
    /**
     * [Optional] Describes the nested schema fields if the type property is set to RECORD.
     */
    fields?: Array<ITableFieldSchema>;
  };

  type IBqmlIterationResult = {
    /**
     * [Output-only, Beta] Time taken to run the training iteration in milliseconds.
     */
    durationMs?: string;
    /**
     * [Output-only, Beta] Training loss computed on the training data at the end of the iteration. The training loss function is defined by model type.
     */
    trainingLoss?: number;
    /**
     * [Output-only, Beta] Eval loss computed on the eval data at the end of the iteration. The eval loss is used for early stopping to avoid overfitting. No eval loss if eval_split_method option is specified as no_split or auto_split with input data size less than 500 rows.
     */
    evalLoss?: number;
    /**
     * [Output-only, Beta] Index of the ML training iteration, starting from zero for each training run.
     */
    index?: number;
    /**
     * [Output-only, Beta] Learning rate used for this iteration, it varies for different training iterations if learn_rate_strategy option is not constant.
     */
    learnRate?: number;
  };

  type ITableDataInsertAllResponse = {
    /**
     * An array of errors for rows that were not inserted.
     */
    insertErrors?: Array<{
      /**
       * Error information for the row indicated by the index property.
       */
      errors?: Array<IErrorProto>;
      /**
       * The index of the row that error applies to.
       */
      index?: number;
    }>;
    /**
     * The resource type of the response.
     */
    kind?: string;
  };

  /**
   * Evaluation metrics for clustering models.
   */
  type IClusteringMetrics = {
    /**
     * Mean of squared distances between each sample to its cluster centroid.
     */
    meanSquaredDistance?: number;
    /**
     * Davies-Bouldin index.
     */
    daviesBouldinIndex?: number;
    /**
     * [Beta] Information for all clusters.
     */
    clusters?: Array<ICluster>;
  };

  type IGetServiceAccountResponse = {
    /**
     * The service account email address.
     */
    email?: string;
    /**
     * The resource type of the response.
     */
    kind?: string;
  };

  type IDataset = {
    /**
     * [Output-only] A URL that can be used to access the resource again. You can use this URL in Get or Update requests to the resource.
     */
    selfLink?: string;
    /**
     * [Optional] The default partition expiration for all partitioned tables in the dataset, in milliseconds. Once this property is set, all newly-created partitioned tables in the dataset will have an expirationMs property in the timePartitioning settings set to this value, and changing the value will only affect new tables, not existing ones. The storage in a partition will have an expiration time of its partition time plus this value. Setting this property overrides the use of defaultTableExpirationMs for partitioned tables: only one of defaultTableExpirationMs and defaultPartitionExpirationMs will be used for any new partitioned table. If you provide an explicit timePartitioning.expirationMs when creating or updating a partitioned table, that value takes precedence over the default partition expiration time indicated by this property.
     */
    defaultPartitionExpirationMs?: string;
    /**
     * [Optional] An array of objects that define dataset access for one or more entities. You can set this property when inserting or updating a dataset in order to control who is allowed to access the data. If unspecified at dataset creation time, BigQuery adds default dataset access for the following entities: access.specialGroup: projectReaders; access.role: READER; access.specialGroup: projectWriters; access.role: WRITER; access.specialGroup: projectOwners; access.role: OWNER; access.userByEmail: [dataset creator email]; access.role: OWNER;
     */
    access?: Array<{
      /**
       * [Pick one] An email address of a user to grant access to. For example: fred@example.com. Maps to IAM policy member "user:EMAIL" or "serviceAccount:EMAIL".
       */
      userByEmail?: string;
      /**
       * [Pick one] A domain to grant access to. Any users signed in with the domain specified will be granted the specified access. Example: "example.com". Maps to IAM policy member "domain:DOMAIN".
       */
      domain?: string;
      /**
       * [Pick one] Some other type of member that appears in the IAM Policy but isn't a user, group, domain, or special group.
       */
      iamMember?: string;
      /**
       * [Pick one] A special group to grant access to. Possible values include: projectOwners: Owners of the enclosing project. projectReaders: Readers of the enclosing project. projectWriters: Writers of the enclosing project. allAuthenticatedUsers: All authenticated BigQuery users. Maps to similarly-named IAM members.
       */
      specialGroup?: string;
      /**
       * [Required] An IAM role ID that should be granted to the user, group, or domain specified in this access entry. The following legacy mappings will be applied: OWNER  roles/bigquery.dataOwner WRITER  roles/bigquery.dataEditor READER  roles/bigquery.dataViewer This field will accept any of the above formats, but will return only the legacy format. For example, if you set this field to "roles/bigquery.dataOwner", it will be returned back as "OWNER".
       */
      role?: string;
      /**
       * [Pick one] A view from a different dataset to grant access to. Queries executed against that view will have read access to tables in this dataset. The role field is not required when this field is set. If that view is updated by any user, access to the view needs to be granted again via an update operation.
       */
      view?: ITableReference;
      /**
       * [Pick one] An email address of a Google Group to grant access to. Maps to IAM policy member "group:GROUP".
       */
      groupByEmail?: string;
    }>;
    /**
     * [Optional] A user-friendly description of the dataset.
     */
    description?: string;
    /**
     * [Output-only] The resource type.
     */
    kind?: string;
    /**
     * [Optional] The default lifetime of all tables in the dataset, in milliseconds. The minimum value is 3600000 milliseconds (one hour). Once this property is set, all newly-created tables in the dataset will have an expirationTime property set to the creation time plus the value in this property, and changing the value will only affect new tables, not existing ones. When the expirationTime for a given table is reached, that table will be deleted automatically. If a table's expirationTime is modified or removed before the table expires, or if you provide an explicit expirationTime when creating a table, that value takes precedence over the default expiration time indicated by this property.
     */
    defaultTableExpirationMs?: string;
    /**
     * [Output-only] A hash of the resource.
     */
    etag?: string;
    /**
     * [Output-only] The time when this dataset was created, in milliseconds since the epoch.
     */
    creationTime?: string;
    /**
     * [Required] A reference that identifies the dataset.
     */
    datasetReference?: IDatasetReference;
    /**
     * [Output-only] The fully-qualified unique name of the dataset in the format projectId:datasetId. The dataset name without the project name is given in the datasetId field. When creating a new dataset, leave this field blank, and instead specify the datasetId field.
     */
    id?: string;
    /**
     * The geographic location where the dataset should reside. The default value is US. See details at https://cloud.google.com/bigquery/docs/locations.
     */
    location?: string;
    /**
     * [Optional] A descriptive name for the dataset.
     */
    friendlyName?: string;
    /**
     * [Output-only] The date when this dataset or any of its tables was last modified, in milliseconds since the epoch.
     */
    lastModifiedTime?: string;
    /**
     * The labels associated with this dataset. You can use these to organize and group your datasets. You can set this property when inserting or updating a dataset. See Creating and Updating Dataset Labels for more information.
     */
    labels?: { [key: string]: string };
    defaultEncryptionConfiguration?: IEncryptionConfiguration;
  };

  type IModelDefinition = {
    /**
     * [Output-only, Beta] Model options used for the first training run. These options are immutable for subsequent training runs. Default values are used for any options not specified in the input query.
     */
    modelOptions?: {
      labels?: Array<string>;
      lossType?: string;
      modelType?: string;
    };
    /**
     * [Output-only, Beta] Information about ml training runs, each training run comprises of multiple iterations and there may be multiple training runs for the model if warm start is used or if a user decides to continue a previously cancelled query.
     */
    trainingRuns?: Array<IBqmlTrainingRun>;
  };

  type IDatasetReference = {
    /**
     * [Required] A unique ID for this dataset, without the project name. The ID must contain only letters (a-z, A-Z), numbers (0-9), or underscores (_). The maximum length is 1,024 characters.
     */
    datasetId?: string;
    /**
     * [Optional] The ID of the project containing this dataset.
     */
    projectId?: string;
  };

  type IJobStatus = {
    /**
     * [Output-only] The first errors encountered during the running of the job. The final message includes the number of errors that caused the process to stop. Errors here do not necessarily mean that the job has completed or was unsuccessful.
     */
    errors?: Array<IErrorProto>;
    /**
     * [Output-only] Running state of the job.
     */
    state?: string;
    /**
     * [Output-only] Final error result of the job. If present, indicates that the job has completed and was unsuccessful.
     */
    errorResult?: IErrorProto;
  };

  type IJobStatistics3 = {
    /**
     * [Output-only] Number of source files in a load job.
     */
    inputFiles?: string;
    /**
     * [Output-only] Number of rows imported in a load job. Note that while an import job is in the running state, this value may change.
     */
    outputRows?: string;
    /**
     * [Output-only] Size of the loaded data in bytes. Note that while a load job is in the running state, this value may change.
     */
    outputBytes?: string;
    /**
     * [Output-only] The number of bad records encountered. Note that if the job has failed because of more bad records encountered than the maximum allowed in the load job configuration, then this number can be less than the total number of bad records present in the input data.
     */
    badRecords?: string;
    /**
     * [Output-only] Number of bytes of source data in a load job.
     */
    inputFileBytes?: string;
  };

  type IListModelsResponse = {
    /**
     * A token to request the next page of results.
     */
    nextPageToken?: string;
    /**
     * Models in the requested dataset. Only the following fields are populated:
     * model_reference, model_type, creation_time, last_modified_time and
     * labels.
     */
    models?: Array<IModel>;
  };

  type IHivePartitioningOptions = {
    /**
     * [Optional, Trusted Tester] When hive partition detection is requested, a common prefix for all source uris should be supplied. The prefix must end immediately before the partition key encoding begins. For example, consider files following this data layout. gs://bucket/path_to_table/dt=2019-01-01/country=BR/id=7/file.avro gs://bucket/path_to_table/dt=2018-12-31/country=CA/id=3/file.avro When hive partitioning is requested with either AUTO or STRINGS detection, the common prefix can be either of gs://bucket/path_to_table or gs://bucket/path_to_table/ (trailing slash does not matter).
     */
    sourceUriPrefix?: string;
    /**
     * [Optional, Trusted Tester] When set, what mode of hive partitioning to use when reading data. Two modes are supported. (1) AUTO: automatically infer partition key name(s) and type(s). (2) STRINGS: automatically infer partition key name(s). All types are interpreted as strings. Not all storage formats support hive partitioning. Requesting hive partitioning on an unsupported format will lead to an error. Currently supported types include: AVRO, CSV, JSON, ORC and Parquet.
     */
    mode?: string;
  };

  /**
   * Represents the count of a single category within the cluster.
   */
  type ICategoryCount = {
    /**
     * The name of category.
     */
    category?: string;
    /**
     * The count of training samples matching the category within the
     * cluster.
     */
    count?: string;
  };

  /**
   * Evaluation metrics of a model. These are either computed on all training
   * data or just the eval data based on whether eval data was used during
   * training. These are not present for imported models.
   */
  type IEvaluationMetrics = {
    /**
     * Populated for binary classification/classifier models.
     */
    binaryClassificationMetrics?: IBinaryClassificationMetrics;
    /**
     * Populated for regression models and explicit feedback type matrix
     * factorization models.
     */
    regressionMetrics?: IRegressionMetrics;
    /**
     * Populated for multi-class classification/classifier models.
     */
    multiClassClassificationMetrics?: IMultiClassClassificationMetrics;
    /**
     * Populated for clustering models.
     */
    clusteringMetrics?: IClusteringMetrics;
  };

  /**
   * A field or a column.
   */
  type IStandardSqlField = {
    /**
     * Optional. The type of this parameter. Absent if not explicitly
     * specified (e.g., CREATE FUNCTION statement can omit the return type;
     * in this case the output parameter does not have this "type" field).
     */
    type?: IStandardSqlDataType;
    /**
     * Optional. The name of this field. Can be absent for struct fields.
     */
    name?: string;
  };

  type IStreamingbuffer = {
    /**
     * [Output-only] A lower-bound estimate of the number of rows currently in the streaming buffer.
     */
    estimatedRows?: string;
    /**
     * [Output-only] Contains the timestamp of the oldest entry in the streaming buffer, in milliseconds since the epoch, if the streaming buffer is available.
     */
    oldestEntryTime?: string;
    /**
     * [Output-only] A lower-bound estimate of the number of bytes currently in the streaming buffer.
     */
    estimatedBytes?: string;
  };

  /**
   * A single entry in the confusion matrix.
   */
  type IEntry = {
    /**
     * Number of items being predicted as this label.
     */
    itemCount?: string;
    /**
     * The predicted label. For confidence_threshold > 0, we will
     * also add an entry indicating the number of items under the
     * confidence threshold.
     */
    predictedLabel?: string;
  };

  type ITable = {
    /**
     * [Optional] Describes the data format, location, and other properties of a table stored outside of BigQuery. By defining these properties, the data source can then be queried as if it were a standard BigQuery table.
     */
    externalDataConfiguration?: IExternalDataConfiguration;
    /**
     * [Output-only, Beta] Present iff this table represents a ML model. Describes the training information for the model, and it is required to run 'PREDICT' queries.
     */
    model?: IModelDefinition;
    /**
     * [Output-only] A URL that can be used to access this resource again.
     */
    selfLink?: string;
    /**
     * [Optional] The time when this table expires, in milliseconds since the epoch. If not present, the table will persist indefinitely. Expired tables will be deleted and their storage reclaimed. The defaultTableExpirationMs property of the encapsulating dataset can be used to set a default expirationTime on newly created tables.
     */
    expirationTime?: string;
    /**
     * [Optional] A user-friendly description of this table.
     */
    description?: string;
    /**
     * [Output-only] The type of the resource.
     */
    kind?: string;
    /**
     * [Output-only] The time when this table was created, in milliseconds since the epoch.
     */
    creationTime?: string;
    /**
     * [TrustedTester] Range partitioning specification for this table. Only one of timePartitioning and rangePartitioning should be specified.
     */
    rangePartitioning?: IRangePartitioning;
    /**
     * [Optional] Describes the schema of this table.
     */
    schema?: ITableSchema;
    /**
     * [Output-only] An opaque ID uniquely identifying the table.
     */
    id?: string;
    /**
     * [Beta] [Optional] If set to true, queries over this table require a partition filter that can be used for partition elimination to be specified.
     */
    requirePartitionFilter?: boolean;
    /**
     * [Required] Reference describing the ID of this table.
     */
    tableReference?: ITableReference;
    /**
     * [Optional] Materialized view definition.
     */
    materializedView?: IMaterializedViewDefinition;
    /**
     * [Output-only] The time when this table was last modified, in milliseconds since the epoch.
     */
    lastModifiedTime?: string;
    /**
     * [Output-only] The number of rows of data in this table, excluding any data in the streaming buffer.
     */
    numRows?: string;
    /**
     * [Beta] Clustering specification for the table. Must be specified with partitioning, data in the table will be first partitioned and subsequently clustered.
     */
    clustering?: IClustering;
    /**
     * [Output-only] Describes the table type. The following values are supported: TABLE: A normal BigQuery table. VIEW: A virtual table defined by a SQL query. [TrustedTester] MATERIALIZED_VIEW: SQL query whose result is persisted. EXTERNAL: A table that references data stored in an external storage system, such as Google Cloud Storage. The default value is TABLE.
     */
    type?: string;
    /**
     * [Output-only] The number of bytes in the table that are considered "long-term storage".
     */
    numLongTermBytes?: string;
    /**
     * [Optional] The view definition.
     */
    view?: IViewDefinition;
    /**
     * [Output-only] A hash of the table metadata. Used to ensure there were no concurrent modifications to the resource when attempting an update. Not guaranteed to change when the table contents or the fields numRows, numBytes, numLongTermBytes or lastModifiedTime change.
     */
    etag?: string;
    /**
     * Custom encryption configuration (e.g., Cloud KMS keys).
     */
    encryptionConfiguration?: IEncryptionConfiguration;
    /**
     * [Output-only] Contains information regarding this table's streaming buffer, if one is present. This field will be absent if the table is not being streamed to or if there is no data in the streaming buffer.
     */
    streamingBuffer?: IStreamingbuffer;
    /**
     * [Output-only] The geographic location where the table resides. This value is inherited from the dataset.
     */
    location?: string;
    /**
     * [Output-only] The size of this table in bytes, excluding any data in the streaming buffer.
     */
    numBytes?: string;
    /**
     * Time-based partitioning specification for this table. Only one of timePartitioning and rangePartitioning should be specified.
     */
    timePartitioning?: ITimePartitioning;
    /**
     * [Optional] A descriptive name for this table.
     */
    friendlyName?: string;
    /**
     * The labels associated with this table. You can use these to organize and group your tables. Label keys and values can be no longer than 63 characters, can only contain lowercase letters, numeric characters, underscores and dashes. International characters are allowed. Label values are optional. Label keys must start with a letter and each label in the list must have a different key.
     */
    labels?: { [key: string]: string };
    /**
     * [Output-only] [TrustedTester] The physical size of this table in bytes, excluding any data in the streaming buffer. This includes compression and storage used for time travel.
     */
    numPhysicalBytes?: string;
  };

  /**
   * Confusion matrix for multi-class classification models.
   */
  type IConfusionMatrix = {
    /**
     * Confidence threshold used when computing the entries of the
     * confusion matrix.
     */
    confidenceThreshold?: number;
    /**
     * One row per actual label.
     */
    rows?: Array<IRow>;
  };

  type ITableCell = { v?: any };

  type IMaterializedViewDefinition = {
    /**
     * [Output-only] [TrustedTester] The time when this materialized view was last modified, in milliseconds since the epoch.
     */
    lastRefreshTime?: string;
    /**
     * [Required] A query whose result is persisted.
     */
    query?: string;
  };

  type IQueryParameterValue = {
    /**
     * [Optional] The value of this value, if a simple scalar type.
     */
    value?: string;
    /**
     * [Optional] The struct field values, in order of the struct type's declaration.
     */
    structValues?: { [key: string]: IQueryParameterValue };
    /**
     * [Optional] The array values, if this is an array type.
     */
    arrayValues?: Array<IQueryParameterValue>;
  };

  type ITableReference = {
    /**
     * [Required] The ID of the dataset containing this table.
     */
    datasetId?: string;
    /**
     * [Required] The ID of the table. The ID must contain only letters (a-z, A-Z), numbers (0-9), or underscores (_). The maximum length is 1,024 characters.
     */
    tableId?: string;
    /**
     * [Required] The ID of the project containing this table.
     */
    projectId?: string;
  };

  type IModel = {
    /**
     * Output only. Input feature columns that were used to train this model.
     */
    featureColumns?: Array<IStandardSqlField>;
    /**
     * [Optional] The time when this model expires, in milliseconds since the
     * epoch. If not present, the model will persist indefinitely. Expired models
     * will be deleted and their storage reclaimed.  The defaultTableExpirationMs
     * property of the encapsulating dataset can be used to set a default
     * expirationTime on newly created models.
     */
    expirationTime?: string;
    /**
     * Output only. Information for all training runs in increasing order of
     * start_time.
     */
    trainingRuns?: Array<ITrainingRun>;
    /**
     * Required. Unique identifier for this model.
     */
    modelReference?: IModelReference;
    /**
     * [Optional] A user-friendly description of this model.
     */
    description?: string;
    /**
     * Output only. A hash of this resource.
     */
    etag?: string;
    /**
     * Output only. The time when this model was created, in millisecs since the
     * epoch.
     */
    creationTime?: string;
    /**
     * Custom encryption configuration (e.g., Cloud KMS keys). This shows the
     * encryption configuration of the model data while stored in BigQuery
     * storage.
     */
    encryptionConfiguration?: IEncryptionConfiguration;
    /**
     * Output only. The geographic location where the model resides. This value
     * is inherited from the dataset.
     */
    location?: string;
    /**
     * [Optional] A descriptive name for this model.
     */
    friendlyName?: string;
    /**
     * Output only. The time when this model was last modified, in millisecs
     * since the epoch.
     */
    lastModifiedTime?: string;
    /**
     * [Optional] The labels associated with this model. You can use these to
     * organize and group your models. Label keys and values can be no longer
     * than 63 characters, can only contain lowercase letters, numeric
     * characters, underscores and dashes. International characters are allowed.
     * Label values are optional. Label keys must start with a letter and each
     * label in the list must have a different key.
     */
    labels?: { [key: string]: string };
    /**
     * Output only. Type of the model resource.
     */
    modelType?:
      | 'MODEL_TYPE_UNSPECIFIED'
      | 'LINEAR_REGRESSION'
      | 'LOGISTIC_REGRESSION'
      | 'KMEANS'
      | 'TENSORFLOW';
    /**
     * Output only. Label columns that were used to train this model.
     * The output of the model will have a "predicted_" prefix to these columns.
     */
    labelColumns?: Array<IStandardSqlField>;
  };

  type IStandardSqlStructType = { fields?: Array<IStandardSqlField> };

  /**
   * The type of a variable, e.g., a function argument.
   * Examples:
   * INT64: {type_kind="INT64"}
   * ARRAY<STRING>: {type_kind="ARRAY", array_element_type="STRING"}
   * STRUCT<x STRING, y ARRAY<DATE>>:
   *   {type_kind="STRUCT",
   *    struct_type={fields=[
   *      {name="x", type={type_kind="STRING"}},
   *      {name="y", type={type_kind="ARRAY", array_element_type="DATE"}}
   *    ]}}
   */
  type IStandardSqlDataType = {
    /**
     * Required. The top level type of this field.
     * Can be any standard SQL data type (e.g., "INT64", "DATE", "ARRAY").
     */
    typeKind?:
      | 'TYPE_KIND_UNSPECIFIED'
      | 'INT64'
      | 'BOOL'
      | 'FLOAT64'
      | 'STRING'
      | 'BYTES'
      | 'TIMESTAMP'
      | 'DATE'
      | 'TIME'
      | 'DATETIME'
      | 'GEOGRAPHY'
      | 'NUMERIC'
      | 'ARRAY'
      | 'STRUCT';
    /**
     * The fields of this struct, in order, if type_kind = "STRUCT".
     */
    structType?: IStandardSqlStructType;
    /**
     * The type of the array's elements, if type_kind = "ARRAY".
     */
    arrayElementType?: IStandardSqlDataType;
  };

  type IJobStatistics4 = {
    /**
     * [Output-only] Number of files per destination URI or URI pattern specified in the extract configuration. These values will be in the same order as the URIs specified in the 'destinationUris' field.
     */
    destinationUriFileCounts?: Array<string>;
    /**
     * [Output-only] Number of user bytes extracted into the result. This is the byte count as computed by BigQuery for billing purposes.
     */
    inputBytes?: string;
  };

  type IModelReference = {
    /**
     * [Required] The ID of the project containing this model.
     */
    projectId?: string;
    /**
     * [Required] The ID of the dataset containing this model.
     */
    datasetId?: string;
    /**
     * [Required] The ID of the model. The ID must contain only letters (a-z, A-Z), numbers (0-9), or underscores (_). The maximum length is 1,024 characters.
     */
    modelId?: string;
  };

  type ICsvOptions = {
    /**
     * [Optional] The character encoding of the data. The supported values are UTF-8 or ISO-8859-1. The default value is UTF-8. BigQuery decodes the data after the raw, binary data has been split using the values of the quote and fieldDelimiter properties.
     */
    encoding?: string;
    /**
     * [Optional] Indicates if BigQuery should allow quoted data sections that contain newline characters in a CSV file. The default value is false.
     */
    allowQuotedNewlines?: boolean;
    /**
     * [Optional] The value that is used to quote data sections in a CSV file. BigQuery converts the string to ISO-8859-1 encoding, and then uses the first byte of the encoded string to split the data in its raw, binary state. The default value is a double-quote ('"'). If your data does not contain quoted sections, set the property value to an empty string. If your data contains quoted newline characters, you must also set the allowQuotedNewlines property to true.
     */
    quote?: string;
    /**
     * [Optional] The number of rows at the top of a CSV file that BigQuery will skip when reading the data. The default value is 0. This property is useful if you have header rows in the file that should be skipped.
     */
    skipLeadingRows?: string;
    /**
     * [Optional] Indicates if BigQuery should accept rows that are missing trailing optional columns. If true, BigQuery treats missing trailing columns as null values. If false, records with missing trailing columns are treated as bad records, and if there are too many bad records, an invalid error is returned in the job result. The default value is false.
     */
    allowJaggedRows?: boolean;
    /**
     * [Optional] The separator for fields in a CSV file. BigQuery converts the string to ISO-8859-1 encoding, and then uses the first byte of the encoded string to split the data in its raw, binary state. BigQuery also supports the escape sequence "\t" to specify a tab separator. The default value is a comma (',').
     */
    fieldDelimiter?: string;
  };

  type IJobConfigurationExtract = {
    /**
     * [Optional] Delimiter to use between fields in the exported data. Default is ','
     */
    fieldDelimiter?: string;
    /**
     * [Pick one] DEPRECATED: Use destinationUris instead, passing only one URI as necessary. The fully-qualified Google Cloud Storage URI where the extracted table should be written.
     */
    destinationUri?: string;
    /**
     * [Optional] Whether to print out a header row in the results. Default is true.
     */
    printHeader?: boolean;
    /**
     * [Optional] The compression type to use for exported files. Possible values include GZIP, DEFLATE, SNAPPY, and NONE. The default value is NONE. DEFLATE and SNAPPY are only supported for Avro.
     */
    compression?: string;
    /**
     * [Pick one] A list of fully-qualified Google Cloud Storage URIs where the extracted table should be written.
     */
    destinationUris?: Array<string>;
    /**
     * [Optional] The exported file format. Possible values include CSV, NEWLINE_DELIMITED_JSON and AVRO. The default value is CSV. Tables with nested or repeated fields cannot be exported as CSV.
     */
    destinationFormat?: string;
    /**
     * A reference to the model being exported.
     */
    sourceModel?: IModelReference;
    /**
     * [Optional] If destinationFormat is set to "AVRO", this flag indicates whether to enable extracting applicable column types (such as TIMESTAMP) to their corresponding AVRO logical types (timestamp-micros), instead of only using their raw types (avro-long).
     */
    useAvroLogicalTypes?: boolean;
    /**
     * A reference to the table being exported.
     */
    sourceTable?: ITableReference;
  };

  type IJobReference = {
    /**
     * The geographic location of the job. See details at https://cloud.google.com/bigquery/docs/locations#specifying_your_location.
     */
    location?: string;
    /**
     * [Required] The ID of the job. The ID must contain only letters (a-z, A-Z), numbers (0-9), underscores (_), or dashes (-). The maximum length is 1,024 characters.
     */
    jobId?: string;
    /**
     * [Required] The ID of the project containing this job.
     */
    projectId?: string;
  };

  type IJobConfigurationQuery = {
    /**
     * Query parameters for standard SQL queries.
     */
    queryParameters?: Array<IQueryParameter>;
    /**
     * Specifies whether to use BigQuery's legacy SQL dialect for this query. The default value is true. If set to false, the query will use BigQuery's standard SQL: https://cloud.google.com/bigquery/sql-reference/ When useLegacySql is set to false, the value of flattenResults is ignored; query will be run as if flattenResults is false.
     */
    useLegacySql?: boolean;
    /**
     * [Beta] Clustering specification for the destination table. Must be specified with time-based partitioning, data in the table will be first partitioned and subsequently clustered.
     */
    clustering?: IClustering;
    /**
     * Custom encryption configuration (e.g., Cloud KMS keys).
     */
    destinationEncryptionConfiguration?: IEncryptionConfiguration;
    /**
     * [Optional] Specifies whether the job is allowed to create new tables. The following values are supported: CREATE_IF_NEEDED: If the table does not exist, BigQuery creates the table. CREATE_NEVER: The table must already exist. If it does not, a 'notFound' error is returned in the job result. The default value is CREATE_IF_NEEDED. Creation, truncation and append actions occur as one atomic update upon job completion.
     */
    createDisposition?: string;
    /**
     * [Optional] Limits the bytes billed for this job. Queries that will have bytes billed beyond this limit will fail (without incurring a charge). If unspecified, this will be set to your project default.
     */
    maximumBytesBilled?: string;
    /**
     * Allows the schema of the destination table to be updated as a side effect of the query job. Schema update options are supported in two cases: when writeDisposition is WRITE_APPEND; when writeDisposition is WRITE_TRUNCATE and the destination table is a partition of a table, specified by partition decorators. For normal tables, WRITE_TRUNCATE will always overwrite the schema. One or more of the following values are specified: ALLOW_FIELD_ADDITION: allow adding a nullable field to the schema. ALLOW_FIELD_RELAXATION: allow relaxing a required field in the original schema to nullable.
     */
    schemaUpdateOptions?: Array<string>;
    /**
     * [Optional] Specifies a priority for the query. Possible values include INTERACTIVE and BATCH. The default value is INTERACTIVE.
     */
    priority?: string;
    /**
     * [Optional] If true and query uses legacy SQL dialect, allows the query to produce arbitrarily large result tables at a slight cost in performance. Requires destinationTable to be set. For standard SQL queries, this flag is ignored and large results are always allowed. However, you must still set destinationTable when result size exceeds the allowed maximum response size.
     */
    allowLargeResults?: boolean;
    /**
     * [TrustedTester] Range partitioning specification for this table. Only one of timePartitioning and rangePartitioning should be specified.
     */
    rangePartitioning?: IRangePartitioning;
    /**
     * Standard SQL only. Set to POSITIONAL to use positional (?) query parameters or to NAMED to use named (@myparam) query parameters in this query.
     */
    parameterMode?: string;
    /**
     * [Optional] Whether to look for the result in the query cache. The query cache is a best-effort cache that will be flushed whenever tables in the query are modified. Moreover, the query cache is only available when a query does not have a destination table specified. The default value is true.
     */
    useQueryCache?: boolean;
    /**
     * [Optional] If true and query uses legacy SQL dialect, flattens all nested and repeated fields in the query results. allowLargeResults must be true if this is set to false. For standard SQL queries, this flag is ignored and results are never flattened.
     */
    flattenResults?: boolean;
    /**
     * [Optional] If querying an external data source outside of BigQuery, describes the data format, location and other properties of the data source. By defining these properties, the data source can then be queried as if it were a standard BigQuery table.
     */
    tableDefinitions?: { [key: string]: IExternalDataConfiguration };
    /**
     * [Optional] Specifies the default dataset to use for unqualified table names in the query. Note that this does not alter behavior of unqualified dataset names.
     */
    defaultDataset?: IDatasetReference;
    /**
     * [Optional] Limits the billing tier for this job. Queries that have resource usage beyond this tier will fail (without incurring a charge). If unspecified, this will be set to your project default.
     */
    maximumBillingTier?: number;
    /**
     * [Deprecated] This property is deprecated.
     */
    preserveNulls?: boolean;
    /**
     * Time-based partitioning specification for the destination table. Only one of timePartitioning and rangePartitioning should be specified.
     */
    timePartitioning?: ITimePartitioning;
    /**
     * [Optional] Specifies the action that occurs if the destination table already exists. The following values are supported: WRITE_TRUNCATE: If the table already exists, BigQuery overwrites the table data and uses the schema from the query result. WRITE_APPEND: If the table already exists, BigQuery appends the data to the table. WRITE_EMPTY: If the table already exists and contains data, a 'duplicate' error is returned in the job result. The default value is WRITE_EMPTY. Each action is atomic and only occurs if BigQuery is able to complete the job successfully. Creation, truncation and append actions occur as one atomic update upon job completion.
     */
    writeDisposition?: string;
    /**
     * [Required] SQL query text to execute. The useLegacySql field can be used to indicate whether the query uses legacy SQL or standard SQL.
     */
    query?: string;
    /**
     * Describes user-defined function resources used in the query.
     */
    userDefinedFunctionResources?: Array<IUserDefinedFunctionResource>;
    /**
     * [Optional] Describes the table where the query results should be stored. If not present, a new table will be created to store the results. This property must be set for large results that exceed the maximum response size.
     */
    destinationTable?: ITableReference;
  };

  /**
   * Information about a single cluster for clustering model.
   */
  type IClusterInfo = {
    /**
     * Cluster radius, the average distance from centroid
     * to each point assigned to the cluster.
     */
    clusterRadius?: number;
    /**
     * Cluster size, the total number of points assigned to the cluster.
     */
    clusterSize?: string;
    /**
     * Centroid id.
     */
    centroidId?: string;
  };

  /**
   * Representative value of a single feature within the cluster.
   */
  type IFeatureValue = {
    /**
     * The numerical feature value. This is the centroid value for this
     * feature.
     */
    numericalValue?: number;
    /**
     * The feature column name.
     */
    featureColumn?: string;
    /**
     * The categorical feature value.
     */
    categoricalValue?: ICategoricalValue;
  };

  type IQueryParameterType = {
    /**
     * [Optional] The type of the array's elements, if this is an array.
     */
    arrayType?: IQueryParameterType;
    /**
     * [Required] The top level type of this field.
     */
    type?: string;
    /**
     * [Optional] The types of the fields of this struct, in order, if this is a struct.
     */
    structTypes?: Array<{
      /**
       * [Optional] The name of this field.
       */
      name?: string;
      /**
       * [Optional] Human-oriented description of the field.
       */
      description?: string;
      /**
       * [Required] The type of this field.
       */
      type?: IQueryParameterType;
    }>;
  };

  type ITimePartitioning = {
    /**
     * [Beta] [Optional] If not set, the table is partitioned by pseudo column, referenced via either '_PARTITIONTIME' as TIMESTAMP type, or '_PARTITIONDATE' as DATE type. If field is specified, the table is instead partitioned by this field. The field must be a top-level TIMESTAMP or DATE field. Its mode must be NULLABLE or REQUIRED.
     */
    field?: string;
    /**
     * [Optional] Number of milliseconds for which to keep the storage for partitions in the table. The storage in a partition will have an expiration time of its partition time plus this value.
     */
    expirationMs?: string;
    /**
     * [Required] The only type supported is DAY, which will generate one partition per day.
     */
    type?: string;
    requirePartitionFilter?: boolean;
  };

  type IViewDefinition = {
    /**
     * Specifies whether to use BigQuery's legacy SQL for this view. The default value is true. If set to false, the view will use BigQuery's standard SQL: https://cloud.google.com/bigquery/sql-reference/ Queries and views that reference this view must use the same flag value.
     */
    useLegacySql?: boolean;
    /**
     * [Required] A query that BigQuery executes when the view is referenced.
     */
    query?: string;
    /**
     * Describes user-defined function resources used in the query.
     */
    userDefinedFunctionResources?: Array<IUserDefinedFunctionResource>;
  };

  type IJobStatistics = {
    /**
     * [Output-only] Creation time of this job, in milliseconds since the epoch. This field will be present on all jobs.
     */
    creationTime?: string;
    /**
     * [Output-only] Job resource usage breakdown by reservation.
     */
    reservationUsage?: Array<{
      /**
       * [Output-only] Reservation name or "unreserved" for on-demand resources usage.
       */
      name?: string;
      /**
       * [Output-only] Slot-milliseconds the job spent in the given reservation.
       */
      slotMs?: string;
    }>;
    /**
     * [Output-only] Statistics for a load job.
     */
    load?: IJobStatistics3;
    /**
     * [Output-only] Statistics for an extract job.
     */
    extract?: IJobStatistics4;
    /**
     * [Output-only] End time of this job, in milliseconds since the epoch. This field will be present whenever a job is in the DONE state.
     */
    endTime?: string;
    /**
     * [TrustedTester] [Output-only] Job progress (0.0 -> 1.0) for LOAD and EXTRACT jobs.
     */
    completionRatio?: number;
    /**
     * [Output-only] Start time of this job, in milliseconds since the epoch. This field will be present when the job transitions from the PENDING state to either RUNNING or DONE.
     */
    startTime?: string;
    /**
     * [Output-only] Statistics for a query job.
     */
    query?: IJobStatistics2;
    /**
     * [Output-only] [Deprecated] Use the bytes processed in the query statistics instead.
     */
    totalBytesProcessed?: string;
    /**
     * [Output-only] Number of child jobs executed.
     */
    numChildJobs?: string;
    /**
     * [Output-only] Slot-milliseconds for the job.
     */
    totalSlotMs?: string;
    /**
     * [Output-only] Name of the primary reservation assigned to this job. Note that this could be different than reservations reported in the reservation usage field if parent reservations were used to execute this job.
     */
    reservation_id?: string;
    /**
     * [Output-only] If this is a child job, the id of the parent.
     */
    parentJobId?: string;
    /**
     * [Output-only] Quotas which delayed this job's start time.
     */
    quotaDeferments?: Array<string>;
  };

  type IBigQueryModelTraining = {
    /**
     * [Output-only, Beta] Index of current ML training iteration. Updated during create model query job to show job progress.
     */
    currentIteration?: number;
    /**
     * [Output-only, Beta] Expected number of iterations for the create model query job specified as num_iterations in the input query. The actual total number of iterations may be less than this number due to early stop.
     */
    expectedTotalIterations?: string;
  };

  /**
   * BigQuery-specific metadata about a location. This will be set on
   * google.cloud.location.Location.metadata in Cloud Location API
   * responses.
   */
  type ILocationMetadata = {
    /**
     * The legacy BigQuery location ID, e.g. “EU” for the “europe” location.
     * This is for any API consumers that need the legacy “US” and “EU” locations.
     */
    legacyLocationId?: string;
  };

  type IProjectList = {
    /**
     * The total number of projects in the list.
     */
    totalItems?: number;
    /**
     * The type of list.
     */
    kind?: string;
    /**
     * A hash of the page of results
     */
    etag?: string;
    /**
     * Projects to which you have at least READ access.
     */
    projects?: Array<{
      /**
       * A descriptive name for this project.
       */
      friendlyName?: string;
      /**
       * The numeric ID of this project.
       */
      numericId?: string;
      /**
       * The resource type.
       */
      kind?: string;
      /**
       * An opaque ID of this project.
       */
      id?: string;
      /**
       * A unique reference to this project.
       */
      projectReference?: IProjectReference;
    }>;
    /**
     * A token to request the next page of results.
     */
    nextPageToken?: string;
  };

  /**
   * A single row in the confusion matrix.
   */
  type IRow = {
    /**
     * The original label of this row.
     */
    actualLabel?: string;
    /**
     * Info describing predicted label distribution.
     */
    entries?: Array<IEntry>;
  };

  /**
   * Evaluation metrics for regression and explicit feedback type matrix
   * factorization models.
   */
  type IRegressionMetrics = {
    /**
     * R^2 score.
     */
    rSquared?: number;
    /**
     * Median absolute error.
     */
    medianAbsoluteError?: number;
    /**
     * Mean squared log error.
     */
    meanSquaredLogError?: number;
    /**
     * Mean absolute error.
     */
    meanAbsoluteError?: number;
    /**
     * Mean squared error.
     */
    meanSquaredError?: number;
  };

  type IJsonValue = any;

  type IRoutineReference = {
    /**
     * [Required] The ID of the project containing this routine.
     */
    projectId?: string;
    /**
     * [Required] The ID of the dataset containing this routine.
     */
    datasetId?: string;
    /**
     * [Required] The ID of the routine. The ID must contain only letters (a-z, A-Z), numbers (0-9), or underscores (_). The maximum length is 256 characters.
     */
    routineId?: string;
  };

  type IGetQueryResultsResponse = {
    /**
     * An object with as many results as can be contained within the maximum permitted reply size. To get any additional rows, you can call GetQueryResults and specify the jobReference returned above. Present only when the query completes successfully.
     */
    rows?: Array<ITableRow>;
    /**
     * A token used for paging results.
     */
    pageToken?: string;
    /**
     * The resource type of the response.
     */
    kind?: string;
    /**
     * A hash of this response.
     */
    etag?: string;
    /**
     * Reference to the BigQuery Job that was created to run the query. This field will be present even if the original request timed out, in which case GetQueryResults can be used to read the results once the query has completed. Since this API only returns the first page of results, subsequent pages can be fetched via the same mechanism (GetQueryResults).
     */
    jobReference?: IJobReference;
    /**
     * Whether the query result was fetched from the query cache.
     */
    cacheHit?: boolean;
    /**
     * The schema of the results. Present only when the query completes successfully.
     */
    schema?: ITableSchema;
    /**
     * [Output-only] The first errors or warnings encountered during the running of the job. The final message includes the number of errors that caused the process to stop. Errors here do not necessarily mean that the job has completed or was unsuccessful.
     */
    errors?: Array<IErrorProto>;
    /**
     * The total number of bytes processed for this query.
     */
    totalBytesProcessed?: string;
    /**
     * [Output-only] The number of rows affected by a DML statement. Present only for DML statements INSERT, UPDATE or DELETE.
     */
    numDmlAffectedRows?: string;
    /**
     * Whether the query has completed or not. If rows or totalRows are present, this will always be true. If this is false, totalRows will not be available.
     */
    jobComplete?: boolean;
    /**
     * The total number of rows in the complete query result set, which can be more than the number of rows in this single page of results. Present only when the query completes successfully.
     */
    totalRows?: string;
  };

  type IJobList = {
    /**
     * A hash of this page of results.
     */
    etag?: string;
    /**
     * List of jobs that were requested.
     */
    jobs?: Array<{
      /**
       * Job reference uniquely identifying the job.
       */
      jobReference?: IJobReference;
      /**
       * [Full-projection-only] Describes the state of the job.
       */
      status?: IJobStatus;
      /**
       * Running state of the job. When the state is DONE, errorResult can be checked to determine whether the job succeeded or failed.
       */
      state?: string;
      /**
       * [Output-only] Information about the job, including starting time and ending time of the job.
       */
      statistics?: IJobStatistics;
      /**
       * Unique opaque ID of the job.
       */
      id?: string;
      /**
       * [Full-projection-only] Specifies the job configuration.
       */
      configuration?: IJobConfiguration;
      /**
       * [Full-projection-only] Email address of the user who ran the job.
       */
      user_email?: string;
      /**
       * The resource type.
       */
      kind?: string;
      /**
       * A result object that will be present only if the job has failed.
       */
      errorResult?: IErrorProto;
    }>;
    /**
     * A token to request the next page of results.
     */
    nextPageToken?: string;
    /**
     * The resource type of the response.
     */
    kind?: string;
  };

  /**
   * Information about a single iteration of the training run.
   */
  type IIterationResult = {
    /**
     * Information about top clusters for clustering models.
     */
    clusterInfos?: Array<IClusterInfo>;
    /**
     * Loss computed on the training data at the end of iteration.
     */
    trainingLoss?: number;
    /**
     * Loss computed on the eval data at the end of iteration.
     */
    evalLoss?: number;
    /**
     * Index of the iteration, 0 based.
     */
    index?: number;
    /**
     * Learn rate used for this iteration.
     */
    learnRate?: number;
    /**
     * Time taken to run the iteration in milliseconds.
     */
    durationMs?: string;
  };

  type ITableDataList = {
    /**
     * Rows of results.
     */
    rows?: Array<ITableRow>;
    /**
     * A token used for paging results. Providing this token instead of the startIndex parameter can help you retrieve stable results when an underlying table is changing.
     */
    pageToken?: string;
    /**
     * The resource type of the response.
     */
    kind?: string;
    /**
     * The total number of rows in the complete table.
     */
    totalRows?: string;
    /**
     * A hash of this page of results.
     */
    etag?: string;
  };

  type IJobStatistics2 = {
    /**
     * [Output-only] Total number of partitions processed from all partitioned tables referenced in the job.
     */
    totalPartitionsProcessed?: string;
    /**
     * The DDL target table. Present only for CREATE/DROP TABLE/VIEW queries.
     */
    ddlTargetTable?: ITableReference;
    /**
     * [Output-only] The schema of the results. Present only for successful dry run of non-legacy SQL queries.
     */
    schema?: ITableSchema;
    /**
     * [Output-only, Beta] Deprecated; do not use.
     */
    modelTrainingExpectedTotalIteration?: string;
    /**
     * [Output-only] The original estimate of bytes processed for the job.
     */
    estimatedBytesProcessed?: string;
    /**
     * [Output-only] Referenced tables for the job. Queries that reference more than 50 tables will not have a complete list.
     */
    referencedTables?: Array<ITableReference>;
    /**
     * [Output-only, Beta] Deprecated; do not use.
     */
    modelTrainingCurrentIteration?: number;
    /**
     * [Output-only] The number of rows affected by a DML statement. Present only for DML statements INSERT, UPDATE or DELETE.
     */
    numDmlAffectedRows?: string;
    /**
     * [Output-only] Total bytes processed for the job.
     */
    totalBytesProcessed?: string;
    /**
     * [Output-only] Billing tier for the job.
     */
    billingTier?: number;
    /**
     * The DDL operation performed, possibly dependent on the pre-existence of the DDL target. Possible values (new values might be added in the future): "CREATE": The query created the DDL target. "SKIP": No-op. Example cases: the query is CREATE TABLE IF NOT EXISTS while the table already exists, or the query is DROP TABLE IF EXISTS while the table does not exist. "REPLACE": The query replaced the DDL target. Example case: the query is CREATE OR REPLACE TABLE, and the table already exists. "DROP": The query deleted the DDL target.
     */
    ddlOperationPerformed?: string;
    /**
     * The type of query statement, if valid. Possible values (new values might be added in the future): "SELECT": SELECT query. "INSERT": INSERT query; see https://cloud.google.com/bigquery/docs/reference/standard-sql/data-manipulation-language. "UPDATE": UPDATE query; see https://cloud.google.com/bigquery/docs/reference/standard-sql/data-manipulation-language. "DELETE": DELETE query; see https://cloud.google.com/bigquery/docs/reference/standard-sql/data-manipulation-language. "MERGE": MERGE query; see https://cloud.google.com/bigquery/docs/reference/standard-sql/data-manipulation-language. "ALTER_TABLE": ALTER TABLE query. "ALTER_VIEW": ALTER VIEW query. "CREATE_FUNCTION": CREATE FUNCTION query. "CREATE_MODEL": CREATE [OR REPLACE] MODEL ... AS SELECT ... . "CREATE_PROCEDURE": CREATE PROCEDURE query. "CREATE_TABLE": CREATE [OR REPLACE] TABLE without AS SELECT. "CREATE_TABLE_AS_SELECT": CREATE [OR REPLACE] TABLE ... AS SELECT ... . "CREATE_VIEW": CREATE [OR REPLACE] VIEW ... AS SELECT ... . "DROP_FUNCTION" : DROP FUNCTION query. "DROP_PROCEDURE": DROP PROCEDURE query. "DROP_TABLE": DROP TABLE query. "DROP_VIEW": DROP VIEW query.
     */
    statementType?: string;
    /**
     * [Output-only] Slot-milliseconds for the job.
     */
    totalSlotMs?: string;
    /**
     * [Output-only] Total bytes billed for the job.
     */
    totalBytesBilled?: string;
    /**
     * [Output-only] For dry-run jobs, totalBytesProcessed is an estimate and this field specifies the accuracy of the estimate. Possible values can be: UNKNOWN: accuracy of the estimate is unknown. PRECISE: estimate is precise. LOWER_BOUND: estimate is lower bound of what the query would cost. UPPER_BOUND: estimate is upper bound of what the query would cost.
     */
    totalBytesProcessedAccuracy?: string;
    /**
     * [Output-only, Beta] Information about create model query job progress.
     */
    modelTraining?: IBigQueryModelTraining;
    /**
     * [Output-only] Referenced routines (persistent user-defined functions and stored procedures) for the job.
     */
    referencedRoutines?: Array<IRoutineReference>;
    /**
     * [Output-only] [Beta] Describes a timeline of job execution.
     */
    timeline?: Array<IQueryTimelineSample>;
    /**
     * [Output-only] Whether the query result was fetched from the query cache.
     */
    cacheHit?: boolean;
    /**
     * [Output-only] Job resource usage breakdown by reservation.
     */
    reservationUsage?: Array<{
      /**
       * [Output-only] Slot-milliseconds the job spent in the given reservation.
       */
      slotMs?: string;
      /**
       * [Output-only] Reservation name or "unreserved" for on-demand resources usage.
       */
      name?: string;
    }>;
    /**
     * Standard SQL only: list of undeclared query parameters detected during a dry run validation.
     */
    undeclaredQueryParameters?: Array<IQueryParameter>;
    /**
     * The DDL target routine. Present only for CREATE/DROP FUNCTION/PROCEDURE queries.
     */
    ddlTargetRoutine?: IRoutineReference;
    /**
     * [Output-only] Describes execution plan for the query.
     */
    queryPlan?: Array<IExplainQueryStage>;
  };

  /**
   * Representative value of a categorical feature.
   */
  type ICategoricalValue = {
    /**
     * Counts of all categories for the categorical feature. If there are
     * more than ten categories, we return top ten (by count) and return
     * one more CategoryCount with category "_OTHER_" and count as
     * aggregate counts of remaining categories.
     */
    categoryCounts?: Array<ICategoryCount>;
  };

  type IJobCancelResponse = {
    /**
     * The resource type of the response.
     */
    kind?: string;
    /**
     * The final state of the job.
     */
    job?: IJob;
  };

  type IProjectReference = {
    /**
     * [Required] ID of the project. Can be either the numeric ID or the assigned ID of the project.
     */
    projectId?: string;
  };

  type IQueryResponse = {
    /**
     * An object with as many results as can be contained within the maximum permitted reply size. To get any additional rows, you can call GetQueryResults and specify the jobReference returned above.
     */
    rows?: Array<ITableRow>;
    /**
     * [Output-only] The first errors or warnings encountered during the running of the job. The final message includes the number of errors that caused the process to stop. Errors here do not necessarily mean that the job has completed or was unsuccessful.
     */
    errors?: Array<IErrorProto>;
    /**
     * A token used for paging results.
     */
    pageToken?: string;
    /**
     * The resource type.
     */
    kind?: string;
    /**
     * Whether the query has completed or not. If rows or totalRows are present, this will always be true. If this is false, totalRows will not be available.
     */
    jobComplete?: boolean;
    /**
     * [Output-only] The number of rows affected by a DML statement. Present only for DML statements INSERT, UPDATE or DELETE.
     */
    numDmlAffectedRows?: string;
    /**
     * The total number of bytes processed for this query. If this query was a dry run, this is the number of bytes that would be processed if the query were run.
     */
    totalBytesProcessed?: string;
    /**
     * The total number of rows in the complete query result set, which can be more than the number of rows in this single page of results.
     */
    totalRows?: string;
    /**
     * Reference to the Job that was created to run the query. This field will be present even if the original request timed out, in which case GetQueryResults can be used to read the results once the query has completed. Since this API only returns the first page of results, subsequent pages can be fetched via the same mechanism (GetQueryResults).
     */
    jobReference?: IJobReference;
    /**
     * Whether the query result was fetched from the query cache.
     */
    cacheHit?: boolean;
    /**
     * The schema of the results. Present only when the query completes successfully.
     */
    schema?: ITableSchema;
  };

  type IExplainQueryStage = {
    /**
     * Milliseconds the slowest shard spent reading input.
     */
    readMsMax?: string;
    /**
     * Total number of bytes written to shuffle.
     */
    shuffleOutputBytes?: string;
    /**
     * Number of parallel input segments to be processed.
     */
    parallelInputs?: string;
    /**
     * Current status for the stage.
     */
    status?: string;
    /**
     * Human-readable name for stage.
     */
    name?: string;
    /**
     * Relative amount of time the slowest shard spent on CPU-bound tasks.
     */
    computeRatioMax?: number;
    /**
     * List of operations within the stage in dependency order (approximately chronological).
     */
    steps?: Array<IExplainQueryStep>;
    /**
     * Stage start time represented as milliseconds since epoch.
     */
    startMs?: string;
    /**
     * Milliseconds the slowest shard spent on writing output.
     */
    writeMsMax?: string;
    /**
     * Total number of bytes written to shuffle and spilled to disk.
     */
    shuffleOutputBytesSpilled?: string;
    /**
     * Milliseconds the average shard spent reading input.
     */
    readMsAvg?: string;
    /**
     * Milliseconds the average shard spent waiting to be scheduled.
     */
    waitMsAvg?: string;
    /**
     * Number of records read into the stage.
     */
    recordsRead?: string;
    /**
     * Milliseconds the average shard spent on writing output.
     */
    writeMsAvg?: string;
    /**
     * Relative amount of time the slowest shard spent waiting to be scheduled.
     */
    waitRatioMax?: number;
    /**
     * Milliseconds the slowest shard spent waiting to be scheduled.
     */
    waitMsMax?: string;
    /**
     * Relative amount of time the average shard spent on writing output.
     */
    writeRatioAvg?: number;
    /**
     * Relative amount of time the average shard spent on CPU-bound tasks.
     */
    computeRatioAvg?: number;
    /**
     * Number of parallel input segments completed.
     */
    completedParallelInputs?: string;
    /**
     * Relative amount of time the average shard spent waiting to be scheduled.
     */
    waitRatioAvg?: number;
    /**
     * Number of records written by the stage.
     */
    recordsWritten?: string;
    /**
     * Relative amount of time the slowest shard spent reading input.
     */
    readRatioMax?: number;
    /**
     * Relative amount of time the average shard spent reading input.
     */
    readRatioAvg?: number;
    /**
     * Unique ID for stage within plan.
     */
    id?: string;
    /**
     * Stage end time represented as milliseconds since epoch.
     */
    endMs?: string;
    /**
     * Relative amount of time the slowest shard spent on writing output.
     */
    writeRatioMax?: number;
    /**
     * Milliseconds the average shard spent on CPU-bound tasks.
     */
    computeMsAvg?: string;
    /**
     * IDs for stages that are inputs to this stage.
     */
    inputStages?: Array<string>;
    /**
     * Milliseconds the slowest shard spent on CPU-bound tasks.
     */
    computeMsMax?: string;
  };

  type IJob = {
    /**
     * [Output-only] The status of this job. Examine this value when polling an asynchronous job to see if the job is complete.
     */
    status?: IJobStatus;
    /**
     * [Output-only] Information about the job, including starting time and ending time of the job.
     */
    statistics?: IJobStatistics;
    /**
     * [Output-only] A URL that can be used to access this resource again.
     */
    selfLink?: string;
    /**
     * [Output-only] Opaque ID field of the job
     */
    id?: string;
    /**
     * [Required] Describes the job configuration.
     */
    configuration?: IJobConfiguration;
    /**
     * [Output-only] Email address of the user who ran the job.
     */
    user_email?: string;
    /**
     * [Output-only] The type of the resource.
     */
    kind?: string;
    /**
     * [Output-only] A hash of this resource.
     */
    etag?: string;
    /**
     * [Optional] Reference describing the unique-per-user name of the job.
     */
    jobReference?: IJobReference;
  };

  type IEncryptionConfiguration = {
    /**
     * [Optional] Describes the Cloud KMS encryption key that will be used to protect destination BigQuery table. The BigQuery Service Account associated with your project requires access to this encryption key.
     */
    kmsKeyName?: string;
  };

  type IBigtableOptions = {
    /**
     * [Optional] If field is true, then the rowkey column families will be read and converted to string. Otherwise they are read with BYTES type values and users need to manually cast them with CAST if necessary. The default value is false.
     */
    readRowkeyAsString?: boolean;
    /**
     * [Optional] List of column families to expose in the table schema along with their types. This list restricts the column families that can be referenced in queries and specifies their value types. You can use this list to do type conversions - see the 'type' field for more details. If you leave this list empty, all column families are present in the table schema and their values are read as BYTES. During a query only the column families referenced in that query are read from Bigtable.
     */
    columnFamilies?: Array<IBigtableColumnFamily>;
    /**
     * [Optional] If field is true, then the column families that are not specified in columnFamilies list are not exposed in the table schema. Otherwise, they are read with BYTES type values. The default value is false.
     */
    ignoreUnspecifiedColumnFamilies?: boolean;
  };

  type ITableSchema = {
    /**
     * Describes the fields in a table.
     */
    fields?: Array<ITableFieldSchema>;
  };

  type IListRoutinesResponse = {
    /**
     * Routines in the requested dataset. Only the following fields are populated:
     * etag, project_id, dataset_id, routine_id, routine_type, creation_time,
     * last_modified_time, language.
     */
    routines?: Array<IRoutine>;
    /**
     * A token to request the next page of results.
     */
    nextPageToken?: string;
  };

  type IDestinationTableProperties = {
    /**
     * [Optional] The friendly name for the destination table. This will only be used if the destination table is newly created. If the table already exists and a value different than the current friendly name is provided, the job will fail.
     */
    friendlyName?: string;
    /**
     * [Optional] The description for the destination table. This will only be used if the destination table is newly created. If the table already exists and a value different than the current description is provided, the job will fail.
     */
    description?: string;
    /**
     * [Optional] The labels associated with this table. You can use these to organize and group your tables. This will only be used if the destination table is newly created. If the table already exists and labels are different than the current labels are provided, the job will fail.
     */
    labels?: { [key: string]: string };
  };

  type ITrainingOptions = {
    /**
     * Optimization strategy for training linear regression models.
     */
    optimizationStrategy?:
      | 'OPTIMIZATION_STRATEGY_UNSPECIFIED'
      | 'BATCH_GRADIENT_DESCENT'
      | 'NORMAL_EQUATION';
    /**
     * Learning rate in training. Used only for iterative training algorithms.
     */
    learnRate?: number;
    /**
     * The column to split data with. This column won't be used as a
     * feature.
     * 1. When data_split_method is CUSTOM, the corresponding column should
     * be boolean. The rows with true value tag are eval data, and the false
     * are training data.
     * 2. When data_split_method is SEQ, the first DATA_SPLIT_EVAL_FRACTION
     * rows (from smallest to largest) in the corresponding column are used
     * as training data, and the rest are eval data. It respects the order
     * in Orderable data types:
     * https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#data-type-properties
     */
    dataSplitColumn?: string;
    /**
     * The maximum number of iterations in training. Used only for iterative
     * training algorithms.
     */
    maxIterations?: string;
    /**
     * Weights associated with each label class, for rebalancing the
     * training data. Only applicable for classification models.
     */
    labelClassWeights?: { [key: string]: number };
    /**
     * L2 regularization coefficient.
     */
    l2Regularization?: number;
    /**
     * Whether to stop early when the loss doesn't improve significantly
     * any more (compared to min_relative_progress). Used only for iterative
     * training algorithms.
     */
    earlyStop?: boolean;
    /**
     * The fraction of evaluation data over the whole input data. The rest
     * of data will be used as training data. The format should be double.
     * Accurate to two decimal places.
     * Default value is 0.2.
     */
    dataSplitEvalFraction?: number;
    /**
     * [Beta] Google Cloud Storage URI from which the model was imported. Only
     * applicable for imported models.
     */
    modelUri?: string;
    /**
     * When early_stop is true, stops training when accuracy improvement is
     * less than 'min_relative_progress'. Used only for iterative training
     * algorithms.
     */
    minRelativeProgress?: number;
    /**
     * Specifies the initial learning rate for the line search learn rate
     * strategy.
     */
    initialLearnRate?: number;
    /**
     * The column used to provide the initial centroids for kmeans algorithm
     * when kmeans_initialization_method is CUSTOM.
     */
    kmeansInitializationColumn?: string;
    /**
     * Name of input label columns in training data.
     */
    inputLabelColumns?: Array<string>;
    /**
     * Number of clusters for clustering models.
     */
    numClusters?: string;
    /**
     * Whether to train a model from the last checkpoint.
     */
    warmStart?: boolean;
    /**
     * The strategy to determine learn rate for the current iteration.
     */
    learnRateStrategy?:
      | 'LEARN_RATE_STRATEGY_UNSPECIFIED'
      | 'LINE_SEARCH'
      | 'CONSTANT';
    /**
     * The data split type for training and evaluation, e.g. RANDOM.
     */
    dataSplitMethod?:
      | 'DATA_SPLIT_METHOD_UNSPECIFIED'
      | 'RANDOM'
      | 'CUSTOM'
      | 'SEQUENTIAL'
      | 'NO_SPLIT'
      | 'AUTO_SPLIT';
    /**
     * Type of loss function used during training run.
     */
    lossType?: 'LOSS_TYPE_UNSPECIFIED' | 'MEAN_SQUARED_LOSS' | 'MEAN_LOG_LOSS';
    /**
     * L1 regularization coefficient.
     */
    l1Regularization?: number;
    /**
     * The method used to initialize the centroids for kmeans algorithm.
     */
    kmeansInitializationMethod?:
      | 'KMEANS_INITIALIZATION_METHOD_UNSPECIFIED'
      | 'RANDOM'
      | 'CUSTOM';
    /**
     * Distance type for clustering models.
     */
    distanceType?: 'DISTANCE_TYPE_UNSPECIFIED' | 'EUCLIDEAN' | 'COSINE';
  };

  /**
   * Information about a single training query run for the model.
   */
  type ITrainingRun = {
    /**
     * The start time of this training run.
     */
    startTime?: string;
    /**
     * Output of each iteration run, results.size() <= max_iterations.
     */
    results?: Array<IIterationResult>;
    /**
     * The evaluation metrics over training/eval data that were computed at the
     * end of training.
     */
    evaluationMetrics?: IEvaluationMetrics;
    /**
     * Options that were used for this training run, includes
     * user specified and default options that were used.
     */
    trainingOptions?: ITrainingOptions;
  };

  /**
   * A user-defined function or a stored procedure.
   */
  type IRoutine = {
    /**
     * Optional if language = "SQL"; required otherwise.
     *
     * If absent, the return type is inferred from definition_body at query time
     * in each query that references this routine. If present, then the evaluated
     * result will be cast to the specified returned type at query time.
     *
     * For example, for the functions created with the following statements:
     *
     * * `CREATE FUNCTION Add(x FLOAT64, y FLOAT64) RETURNS FLOAT64 AS (x + y);`
     *
     * * `CREATE FUNCTION Increment(x FLOAT64) AS (Add(x, 1));`
     *
     * * `CREATE FUNCTION Decrement(x FLOAT64) RETURNS FLOAT64 AS (Add(x, -1));`
     *
     * The return_type is `{type_kind: "FLOAT64"}` for `Add` and `Decrement`, and
     * is absent for `Increment` (inferred as FLOAT64 at query time).
     *
     * Suppose the function `Add` is replaced by
     *   `CREATE OR REPLACE FUNCTION Add(x INT64, y INT64) AS (x + y);`
     *
     * Then the inferred return type of `Increment` is automatically changed to
     * INT64 at query time, while the return type of `Decrement` remains FLOAT64.
     */
    returnType?: IStandardSqlDataType;
    /**
     * Optional. Defaults to "SQL".
     */
    language?: 'LANGUAGE_UNSPECIFIED' | 'SQL' | 'JAVASCRIPT';
    /**
     * Output only. The time when this routine was last modified, in milliseconds
     * since the epoch.
     */
    lastModifiedTime?: string;
    /**
     * Required. The body of the routine.
     *
     * For functions, this is the expression in the AS clause.
     *
     * If language=SQL, it is the substring inside (but excluding) the
     * parentheses. For example, for the function created with the following
     * statement:
     *
     * `CREATE FUNCTION JoinLines(x string, y string) as (concat(x, "\n", y))`
     *
     * The definition_body is `concat(x, "\n", y)` (\n is not replaced with
     * linebreak).
     *
     * If language=JAVASCRIPT, it is the evaluated string in the AS clause.
     * For example, for the function created with the following statement:
     *
     * `CREATE FUNCTION f() RETURNS STRING LANGUAGE js AS 'return "\n";\n'`
     *
     * The definition_body is
     *
     * `return "\n";\n`
     *
     * Note that both \n are replaced with linebreaks.
     */
    definitionBody?: string;
    /**
     * Output only. A hash of this resource.
     */
    etag?: string;
    /**
     * Output only. The time when this routine was created, in milliseconds since
     * the epoch.
     */
    creationTime?: string;
    /**
     * Required.
     */
    routineType?: 'ROUTINE_TYPE_UNSPECIFIED' | 'SCALAR_FUNCTION' | 'PROCEDURE';
    /**
     * Required. Reference describing the ID of this routine.
     */
    routineReference?: IRoutineReference;
    /**
     * Optional.
     */
    arguments?: Array<IArgument>;
    /**
     * Optional. If language = "JAVASCRIPT", this field stores the path of the
     * imported JAVASCRIPT libraries.
     */
    importedLibraries?: Array<string>;
  };

  type IJobConfiguration = {
    /**
     * [Pick one] Copies a table.
     */
    copy?: IJobConfigurationTableCopy;
    /**
     * [Optional] Job timeout in milliseconds. If this time limit is exceeded, BigQuery may attempt to terminate the job.
     */
    jobTimeoutMs?: string;
    /**
     * [Pick one] Configures a query job.
     */
    query?: IJobConfigurationQuery;
    /**
     * [Pick one] Configures a load job.
     */
    load?: IJobConfigurationLoad;
    /**
     * The labels associated with this job. You can use these to organize and group your jobs. Label keys and values can be no longer than 63 characters, can only contain lowercase letters, numeric characters, underscores and dashes. International characters are allowed. Label values are optional. Label keys must start with a letter and each label in the list must have a different key.
     */
    labels?: { [key: string]: string };
    /**
     * [Optional] If set, don't actually run this job. A valid query will return a mostly empty response with some processing statistics, while an invalid query will return the same error it would if it wasn't a dry run. Behavior of non-query jobs is undefined.
     */
    dryRun?: boolean;
    /**
     * [Output-only] The type of the job. Can be QUERY, LOAD, EXTRACT, COPY or UNKNOWN.
     */
    jobType?: string;
    /**
     * [Pick one] Configures an extract job.
     */
    extract?: IJobConfigurationExtract;
  };

  type IUserDefinedFunctionResource = {
    /**
     * [Pick one] A code resource to load from a Google Cloud Storage URI (gs://bucket/path).
     */
    resourceUri?: string;
    /**
     * [Pick one] An inline resource that contains code for a user-defined function (UDF). Providing a inline code resource is equivalent to providing a URI for a file containing the same code.
     */
    inlineCode?: string;
  };

  /**
   * Represents a single JSON object.
   */
  type IJsonObject = { [key: string]: IJsonValue };

  /**
   * Aggregate metrics for classification/classifier models. For multi-class
   * models, the metrics are either macro-averaged or micro-averaged. When
   * macro-averaged, the metrics are calculated for each label and then an
   * unweighted average is taken of those values. When micro-averaged, the
   * metric is calculated globally by counting the total number of correctly
   * predicted rows.
   */
  type IAggregateClassificationMetrics = {
    /**
     * Accuracy is the fraction of predictions given the correct label. For
     * multiclass this is a micro-averaged metric.
     */
    accuracy?: number;
    /**
     * Recall is the fraction of actual positive labels that were given a
     * positive prediction. For multiclass this is a macro-averaged metric.
     */
    recall?: number;
    /**
     * Threshold at which the metrics are computed. For binary
     * classification models this is the positive class threshold.
     * For multi-class classfication models this is the confidence
     * threshold.
     */
    threshold?: number;
    /**
     * Area Under a ROC Curve. For multiclass this is a macro-averaged
     * metric.
     */
    rocAuc?: number;
    /**
     * Logarithmic Loss. For multiclass this is a macro-averaged metric.
     */
    logLoss?: number;
    /**
     * The F1 score is an average of recall and precision. For multiclass
     * this is a macro-averaged metric.
     */
    f1Score?: number;
    /**
     * Precision is the fraction of actual positive predictions that had
     * positive actual labels. For multiclass this is a macro-averaged
     * metric treating each class as a binary classifier.
     */
    precision?: number;
  };

  type IExplainQueryStep = {
    /**
     * Human-readable stage descriptions.
     */
    substeps?: Array<string>;
    /**
     * Machine-readable operation type.
     */
    kind?: string;
  };

  /**
   * Input/output argument of a function or a stored procedure.
   */
  type IArgument = {
    /**
     * Optional. Defaults to FIXED_TYPE.
     */
    argumentKind?: 'ARGUMENT_KIND_UNSPECIFIED' | 'FIXED_TYPE' | 'ANY_TYPE';
    /**
     * Optional. Specifies whether the argument is input or output.
     * Can be set for procedures only.
     */
    mode?: 'MODE_UNSPECIFIED' | 'IN' | 'OUT' | 'INOUT';
    /**
     * Required unless argument_kind = ANY_TYPE.
     */
    dataType?: IStandardSqlDataType;
    /**
     * Optional. The name of this argument. Can be absent for function return
     * argument.
     */
    name?: string;
  };

  type IQueryParameter = {
    /**
     * [Optional] If unset, this is a positional parameter. Otherwise, should be unique within a query.
     */
    name?: string;
    /**
     * [Required] The type of this parameter.
     */
    parameterType?: IQueryParameterType;
    /**
     * [Required] The value of this parameter.
     */
    parameterValue?: IQueryParameterValue;
  };

  type IDatasetList = {
    /**
     * The list type. This property always returns the value "bigquery#datasetList".
     */
    kind?: string;
    /**
     * A hash value of the results page. You can use this property to determine if the page has changed since the last request.
     */
    etag?: string;
    /**
     * An array of the dataset resources in the project. Each resource contains basic information. For full information about a particular dataset resource, use the Datasets: get method. This property is omitted when there are no datasets in the project.
     */
    datasets?: Array<{
      /**
       * The geographic location where the data resides.
       */
      location?: string;
      /**
       * A descriptive name for the dataset, if one exists.
       */
      friendlyName?: string;
      /**
       * The resource type. This property always returns the value "bigquery#dataset".
       */
      kind?: string;
      /**
       * The labels associated with this dataset. You can use these to organize and group your datasets.
       */
      labels?: { [key: string]: string };
      /**
       * The dataset reference. Use this property to access specific parts of the dataset's ID, such as project ID or dataset ID.
       */
      datasetReference?: IDatasetReference;
      /**
       * The fully-qualified, unique, opaque ID of the dataset.
       */
      id?: string;
    }>;
    /**
     * A token that can be used to request the next results page. This property is omitted on the final results page.
     */
    nextPageToken?: string;
  };

  type IJobConfigurationTableCopy = {
    /**
     * [Pick one] Source table to copy.
     */
    sourceTable?: ITableReference;
    /**
     * [Optional] Specifies the action that occurs if the destination table already exists. The following values are supported: WRITE_TRUNCATE: If the table already exists, BigQuery overwrites the table data. WRITE_APPEND: If the table already exists, BigQuery appends the data to the table. WRITE_EMPTY: If the table already exists and contains data, a 'duplicate' error is returned in the job result. The default value is WRITE_EMPTY. Each action is atomic and only occurs if BigQuery is able to complete the job successfully. Creation, truncation and append actions occur as one atomic update upon job completion.
     */
    writeDisposition?: string;
    /**
     * [Required] The destination table
     */
    destinationTable?: ITableReference;
    /**
     * Custom encryption configuration (e.g., Cloud KMS keys).
     */
    destinationEncryptionConfiguration?: IEncryptionConfiguration;
    /**
     * [Pick one] Source tables to copy.
     */
    sourceTables?: Array<ITableReference>;
    /**
     * [Optional] Specifies whether the job is allowed to create new tables. The following values are supported: CREATE_IF_NEEDED: If the table does not exist, BigQuery creates the table. CREATE_NEVER: The table must already exist. If it does not, a 'notFound' error is returned in the job result. The default value is CREATE_IF_NEEDED. Creation, truncation and append actions occur as one atomic update upon job completion.
     */
    createDisposition?: string;
  };

  /**
   * Confusion matrix for binary classification models.
   */
  type IBinaryConfusionMatrix = {
    /**
     * Threshold value used when computing each of the following metric.
     */
    positiveClassThreshold?: number;
    /**
     * The fraction of predictions given the correct label.
     */
    accuracy?: number;
    /**
     * Number of true samples predicted as true.
     */
    truePositives?: string;
    /**
     * The fraction of actual positive labels that were given a positive
     * prediction.
     */
    recall?: number;
    /**
     * Number of false samples predicted as false.
     */
    falseNegatives?: string;
    /**
     * Number of false samples predicted as true.
     */
    falsePositives?: string;
    /**
     * Number of true samples predicted as false.
     */
    trueNegatives?: string;
    /**
     * The equally weighted average of recall and precision.
     */
    f1Score?: number;
    /**
     * The fraction of actual positive predictions that had positive actual
     * labels.
     */
    precision?: number;
  };

  type ITableRow = {
    /**
     * Represents a single row in the result set, consisting of one or more fields.
     */
    f?: Array<ITableCell>;
  };

  type IQueryTimelineSample = {
    /**
     * Total number of units currently being processed by workers. This does not correspond directly to slot usage. This is the largest value observed since the last sample.
     */
    activeUnits?: string;
    /**
     * Total parallel units of work completed by this query.
     */
    completedUnits?: string;
    /**
     * Milliseconds elapsed since the start of query execution.
     */
    elapsedMs?: string;
    /**
     * Total parallel units of work remaining for the active stages.
     */
    pendingUnits?: string;
    /**
     * Cumulative slot-ms consumed by the query.
     */
    totalSlotMs?: string;
  };

  /**
   * Evaluation metrics for multi-class classification/classifier models.
   */
  type IMultiClassClassificationMetrics = {
    /**
     * Aggregate classification metrics.
     */
    aggregateClassificationMetrics?: IAggregateClassificationMetrics;
    /**
     * Confusion matrix at different thresholds.
     */
    confusionMatrixList?: Array<IConfusionMatrix>;
  };

  type IQueryRequest = {
    /**
     * The geographic location where the job should run. See details at https://cloud.google.com/bigquery/docs/locations#specifying_your_location.
     */
    location?: string;
    /**
     * [Deprecated] This property is deprecated.
     */
    preserveNulls?: boolean;
    /**
     * [Optional] The maximum number of rows of data to return per page of results. Setting this flag to a small value such as 1000 and then paging through results might improve reliability when the query result set is large. In addition to this limit, responses are also limited to 10 MB. By default, there is no maximum row count, and only the byte limit applies.
     */
    maxResults?: number;
    /**
     * [Required] A query string, following the BigQuery query syntax, of the query to execute. Example: "SELECT count(f1) FROM [myProjectId:myDatasetId.myTableId]".
     */
    query?: string;
    /**
     * [Optional] If set to true, BigQuery doesn't run the job. Instead, if the query is valid, BigQuery returns statistics about the job such as how many bytes would be processed. If the query is invalid, an error returns. The default value is false.
     */
    dryRun?: boolean;
    /**
     * Query parameters for Standard SQL queries.
     */
    queryParameters?: Array<IQueryParameter>;
    /**
     * Specifies whether to use BigQuery's legacy SQL dialect for this query. The default value is true. If set to false, the query will use BigQuery's standard SQL: https://cloud.google.com/bigquery/sql-reference/ When useLegacySql is set to false, the value of flattenResults is ignored; query will be run as if flattenResults is false.
     */
    useLegacySql?: boolean;
    /**
     * [Optional] How long to wait for the query to complete, in milliseconds, before the request times out and returns. Note that this is only a timeout for the request, not the query. If the query takes longer to run than the timeout value, the call returns without any results and with the 'jobComplete' flag set to false. You can call GetQueryResults() to wait for the query to complete and read the results. The default value is 10000 milliseconds (10 seconds).
     */
    timeoutMs?: number;
    /**
     * The resource type of the request.
     */
    kind?: string;
    /**
     * Standard SQL only. Set to POSITIONAL to use positional (?) query parameters or to NAMED to use named (@myparam) query parameters in this query.
     */
    parameterMode?: string;
    /**
     * [Optional] Whether to look for the result in the query cache. The query cache is a best-effort cache that will be flushed whenever tables in the query are modified. The default value is true.
     */
    useQueryCache?: boolean;
    /**
     * [Optional] Specifies the default datasetId and projectId to assume for any unqualified table names in the query. If not set, all table names in the query string must be qualified in the format 'datasetId.tableId'.
     */
    defaultDataset?: IDatasetReference;
  };

  type IErrorProto = {
    /**
     * A human-readable description of the error.
     */
    message?: string;
    /**
     * Specifies where the error occurred, if present.
     */
    location?: string;
    /**
     * Debugging information. This property is internal to Google and should not be used.
     */
    debugInfo?: string;
    /**
     * A short error code that summarizes the error.
     */
    reason?: string;
  };

  namespace tabledata {
    /**
     * Retrieves table data from a specified set of rows. Requires the READER dataset role.
     */
    type IListParams = {
      /**
       * List of fields to return (comma-separated). If unspecified, all fields are returned
       */
      selectedFields?: string;
      /**
       * Zero-based index of the starting row to read
       */
      startIndex?: string;
      /**
       * Page token, returned by a previous call, identifying the result set
       */
      pageToken?: string;
      /**
       * Maximum number of results to return
       */
      maxResults?: number;
    };
  }

  namespace tables {
    /**
     * Lists all tables in the specified dataset. Requires the READER dataset role.
     */
    type IListParams = {
      /**
       * Maximum number of results to return
       */
      maxResults?: number;
      /**
       * Page token, returned by a previous call, to request the next page of results
       */
      pageToken?: string;
    };

    /**
     * Gets the specified table resource by table ID. This method does not return the data in the table, it only returns the table resource, which describes the structure of this table.
     */
    type IGetParams = {
      /**
       * List of fields to return (comma-separated). If unspecified, all fields are returned
       */
      selectedFields?: string;
    };
  }

  namespace routines {
    /**
     * Gets the specified routine resource by routine ID.
     */
    type IGetParams = {
      /**
       * If set, only the Routine fields in the field mask are returned in the
       * response. If unset, all Routine fields are returned.
       */
      fieldMask?: string;
    };

    /**
     * Lists all routines in the specified dataset. Requires the READER dataset
     * role.
     */
    type IListParams = {
      /**
       * Page token, returned by a previous call, to request the next page of
       * results
       */
      pageToken?: string;
      /**
       * The maximum number of results to return in a single response page.
       * Leverage the page tokens to iterate through the entire collection.
       */
      maxResults?: number;
    };
  }

  namespace datasets {
    /**
     * Deletes the dataset specified by the datasetId value. Before you can delete a dataset, you must delete all its tables, either manually or by specifying deleteContents. Immediately after deletion, you can create another dataset with the same name.
     */
    type IDeleteParams = {
      /**
       * If True, delete all the tables in the dataset. If False and the dataset contains tables, the request will fail. Default is False
       */
      deleteContents?: boolean;
    };

    /**
     * Lists all datasets in the specified project to which you have been granted the READER dataset role.
     */
    type IListParams = {
      /**
       * Whether to list all datasets, including hidden ones
       */
      all?: boolean;
      /**
       * An expression for filtering the results of the request by label. The syntax is "labels.<name>[:<value>]". Multiple filters can be ANDed together by connecting with a space. Example: "labels.department:receiving labels.active". See Filtering datasets using labels for details.
       */
      filter?: string;
      /**
       * Page token, returned by a previous call, to request the next page of results
       */
      pageToken?: string;
      /**
       * The maximum number of results to return
       */
      maxResults?: number;
    };
  }

  namespace models {
    /**
     * Lists all models in the specified dataset. Requires the READER dataset
     * role.
     */
    type IListParams = {
      /**
       * Page token, returned by a previous call to request the next page of
       * results
       */
      pageToken?: string;
      /**
       * The maximum number of results to return in a single response page.
       * Leverage the page tokens to iterate through the entire collection.
       */
      maxResults?: number;
    };
  }

  namespace jobs {
    /**
     * Lists all jobs that you started in the specified project. Job information is available for a six month period after creation. The job list is sorted in reverse chronological order, by job creation time. Requires the Can View project role, or the Is Owner project role if you set the allUsers property.
     */
    type IListParams = {
      /**
       * Maximum number of results to return
       */
      maxResults?: number;
      /**
       * Max value for job creation time, in milliseconds since the POSIX epoch. If set, only jobs created before or at this timestamp are returned
       */
      maxCreationTime?: string;
      /**
       * Filter for job state
       */
      stateFilter?: 'done' | 'pending' | 'running';
      /**
       * Restrict information returned to a set of selected fields
       */
      projection?: 'full' | 'minimal';
      /**
       * If set, retrieves only jobs whose parent is this job. Otherwise, retrieves only jobs which have no parent
       */
      parentJobId?: string;
      /**
       * Min value for job creation time, in milliseconds since the POSIX epoch. If set, only jobs created after or at this timestamp are returned
       */
      minCreationTime?: string;
      /**
       * Page token, returned by a previous call, to request the next page of results
       */
      pageToken?: string;
      /**
       * Whether to display jobs owned by all users in the project. Default false
       */
      allUsers?: boolean;
    };

    /**
     * Retrieves the results of a query job.
     */
    type IGetQueryResultsParams = {
      /**
       * Zero-based index of the starting row
       */
      startIndex?: string;
      /**
       * The geographic location where the job should run. Required except for US and EU. See details at https://cloud.google.com/bigquery/docs/locations#specifying_your_location.
       */
      location?: string;
      /**
       * Page token, returned by a previous call, to request the next page of results
       */
      pageToken?: string;
      /**
       * How long to wait for the query to complete, in milliseconds, before returning. Default is 10 seconds. If the timeout passes before the job completes, the 'jobComplete' field in the response will be false
       */
      timeoutMs?: number;
      /**
       * Maximum number of results to read
       */
      maxResults?: number;
    };

    /**
     * Requests that a job be cancelled. This call will return immediately, and the client will need to poll for the job status to see if the cancel completed successfully. Cancelled jobs may still incur costs.
     */
    type ICancelParams = {
      /**
       * The geographic location of the job. Required except for US and EU. See details at https://cloud.google.com/bigquery/docs/locations#specifying_your_location.
       */
      location?: string;
    };

    /**
     * Returns information about a specific job. Job information is available for a six month period after creation. Requires that you're the person who ran the job, or have the Is Owner project role.
     */
    type IGetParams = {
      /**
       * The geographic location of the job. Required except for US and EU. See details at https://cloud.google.com/bigquery/docs/locations#specifying_your_location.
       */
      location?: string;
    };
  }

  namespace projects {
    /**
     * Lists all projects to which you have been granted any project role.
     */
    type IListParams = {
      /**
       * Maximum number of results to return
       */
      maxResults?: number;
      /**
       * Page token, returned by a previous call, to request the next page of results
       */
      pageToken?: string;
    };
  }
}

export default bigquery;

