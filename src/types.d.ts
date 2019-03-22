/**
 * BigQuery API
 */
declare namespace bigquery {
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

  type IBigtableColumn = {
    /**
     * [Optional] The encoding of the values when the type is not STRING. Acceptable encoding values are: TEXT - indicates values are alphanumeric text strings. BINARY - indicates values are encoded using HBase Bytes.toBytes family of functions. 'encoding' can also be set at the column family level. However, the setting at this level takes precedence if 'encoding' is set at both levels.
     */
    encoding?: string;
    /**
     * [Optional] If the qualifier is not a valid BigQuery field identifier i.e. does not match [a-zA-Z][a-zA-Z0-9_]*, a valid identifier must be provided as the column field name and is used as field name in queries.
     */
    fieldName?: string;
    /**
     * [Optional] If this is set, only the latest version of value in this column are exposed. 'onlyReadLatest' can also be set at the column family level. However, the setting at this level takes precedence if 'onlyReadLatest' is set at both levels.
     */
    onlyReadLatest?: boolean;
    /**
     * [Required] Qualifier of the column. Columns in the parent column family that has this exact qualifier are exposed as . field. If the qualifier is valid UTF-8 string, it can be specified in the qualifier_string field. Otherwise, a base-64 encoded value must be set to qualifier_encoded. The column field name is the same as the column qualifier. However, if the qualifier is not a valid BigQuery field identifier i.e. does not match [a-zA-Z][a-zA-Z0-9_]*, a valid identifier must be provided as field_name.
     */
    qualifierEncoded?: string;
    qualifierString?: string;
    /**
     * [Optional] The type to convert the value in cells of this column. The values are expected to be encoded using HBase Bytes.toBytes function when using the BINARY encoding value. Following BigQuery types are allowed (case-sensitive) - BYTES STRING INTEGER FLOAT BOOLEAN Default type is BYTES. 'type' can also be set at the column family level. However, the setting at this level takes precedence if 'type' is set at both levels.
     */
    type?: string;
  };

  type IBigtableColumnFamily = {
    /**
     * [Optional] Lists of columns that should be exposed as individual fields as opposed to a list of (column name, value) pairs. All columns whose qualifier matches a qualifier in this list can be accessed as .. Other columns can be accessed as a list through .Column field.
     */
    columns?: Array<IBigtableColumn>;
    /**
     * [Optional] The encoding of the values when the type is not STRING. Acceptable encoding values are: TEXT - indicates values are alphanumeric text strings. BINARY - indicates values are encoded using HBase Bytes.toBytes family of functions. This can be overridden for a specific column by listing that column in 'columns' and specifying an encoding for it.
     */
    encoding?: string;
    /**
     * Identifier of the column family.
     */
    familyId?: string;
    /**
     * [Optional] If this is set only the latest version of value are exposed for all columns in this column family. This can be overridden for a specific column by listing that column in 'columns' and specifying a different setting for that column.
     */
    onlyReadLatest?: boolean;
    /**
     * [Optional] The type to convert the value in cells of this column family. The values are expected to be encoded using HBase Bytes.toBytes function when using the BINARY encoding value. Following BigQuery types are allowed (case-sensitive) - BYTES STRING INTEGER FLOAT BOOLEAN Default type is BYTES. This can be overridden for a specific column by listing that column in 'columns' and specifying a type for it.
     */
    type?: string;
  };

  type IBigtableOptions = {
    /**
     * [Optional] List of column families to expose in the table schema along with their types. This list restricts the column families that can be referenced in queries and specifies their value types. You can use this list to do type conversions - see the 'type' field for more details. If you leave this list empty, all column families are present in the table schema and their values are read as BYTES. During a query only the column families referenced in that query are read from Bigtable.
     */
    columnFamilies?: Array<IBigtableColumnFamily>;
    /**
     * [Optional] If field is true, then the column families that are not specified in columnFamilies list are not exposed in the table schema. Otherwise, they are read with BYTES type values. The default value is false.
     */
    ignoreUnspecifiedColumnFamilies?: boolean;
    /**
     * [Optional] If field is true, then the rowkey column families will be read and converted to string. Otherwise they are read with BYTES type values and users need to manually cast them with CAST if necessary. The default value is false.
     */
    readRowkeyAsString?: boolean;
  };

  type IBqmlIterationResult = {
    /**
     * [Output-only, Beta] Time taken to run the training iteration in milliseconds.
     */
    durationMs?: string;
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
    /**
     * [Output-only, Beta] Training loss computed on the training data at the end of the iteration. The training loss function is defined by model type.
     */
    trainingLoss?: number;
  };

  type IBqmlTrainingRun = {
    /**
     * [Output-only, Beta] List of each iteration results.
     */
    iterationResults?: Array<IBqmlIterationResult>;
    /**
     * [Output-only, Beta] Training run start time in milliseconds since the epoch.
     */
    startTime?: string;
    /**
     * [Output-only, Beta] Different state applicable for a training run. IN PROGRESS: Training run is in progress. FAILED: Training run ended due to a non-retryable failure. SUCCEEDED: Training run successfully completed. CANCELLED: Training run cancelled by the user.
     */
    state?: string;
    /**
     * [Output-only, Beta] Training options used by this training run. These options are mutable for subsequent training runs. Default values are explicitly stored for options not specified in the input query of the first training run. For subsequent training runs, any option not explicitly specified in the input query will be copied from the previous training run.
     */
    trainingOptions?: {
      earlyStop?: boolean;
      l1Reg?: number;
      l2Reg?: number;
      learnRate?: number;
      learnRateStrategy?: string;
      lineSearchInitLearnRate?: number;
      maxIteration?: string;
      minRelProgress?: number;
      warmStart?: boolean;
    };
  };

  type IClustering = {
    /**
     * [Repeated] One or more fields on which data should be clustered. Only top-level, non-repeated, simple-type fields are supported. When you cluster a table using multiple columns, the order of columns you specify is important. The order of the specified columns determines the sort order of the data.
     */
    fields?: Array<string>;
  };

  type ICsvOptions = {
    /**
     * [Optional] Indicates if BigQuery should accept rows that are missing trailing optional columns. If true, BigQuery treats missing trailing columns as null values. If false, records with missing trailing columns are treated as bad records, and if there are too many bad records, an invalid error is returned in the job result. The default value is false.
     */
    allowJaggedRows?: boolean;
    /**
     * [Optional] Indicates if BigQuery should allow quoted data sections that contain newline characters in a CSV file. The default value is false.
     */
    allowQuotedNewlines?: boolean;
    /**
     * [Optional] The character encoding of the data. The supported values are UTF-8 or ISO-8859-1. The default value is UTF-8. BigQuery decodes the data after the raw, binary data has been split using the values of the quote and fieldDelimiter properties.
     */
    encoding?: string;
    /**
     * [Optional] The separator for fields in a CSV file. BigQuery converts the string to ISO-8859-1 encoding, and then uses the first byte of the encoded string to split the data in its raw, binary state. BigQuery also supports the escape sequence "\t" to specify a tab separator. The default value is a comma (',').
     */
    fieldDelimiter?: string;
    /**
     * [Optional] The value that is used to quote data sections in a CSV file. BigQuery converts the string to ISO-8859-1 encoding, and then uses the first byte of the encoded string to split the data in its raw, binary state. The default value is a double-quote ('"'). If your data does not contain quoted sections, set the property value to an empty string. If your data contains quoted newline characters, you must also set the allowQuotedNewlines property to true.
     */
    quote?: string;
    /**
     * [Optional] The number of rows at the top of a CSV file that BigQuery will skip when reading the data. The default value is 0. This property is useful if you have header rows in the file that should be skipped.
     */
    skipLeadingRows?: string;
  };

  type IDataset = {
    /**
     * [Optional] An array of objects that define dataset access for one or more entities. You can set this property when inserting or updating a dataset in order to control who is allowed to access the data. If unspecified at dataset creation time, BigQuery adds default dataset access for the following entities: access.specialGroup: projectReaders; access.role: READER; access.specialGroup: projectWriters; access.role: WRITER; access.specialGroup: projectOwners; access.role: OWNER; access.userByEmail: [dataset creator email]; access.role: OWNER;
     */
    access?: Array<{
      /**
       * [Pick one] A domain to grant access to. Any users signed in with the domain specified will be granted the specified access. Example: "example.com". Maps to IAM policy member "domain:DOMAIN".
       */
      domain?: string;
      /**
       * [Pick one] An email address of a Google Group to grant access to. Maps to IAM policy member "group:GROUP".
       */
      groupByEmail?: string;
      /**
       * [Pick one] Some other type of member that appears in the IAM Policy but isn't a user, group, domain, or special group.
       */
      iamMember?: string;
      /**
       * [Required] An IAM role ID that should be granted to the user, group, or domain specified in this access entry. The following legacy mappings will be applied: OWNER  roles/bigquery.dataOwner WRITER  roles/bigquery.dataEditor READER  roles/bigquery.dataViewer This field will accept any of the above formats, but will return only the legacy format. For example, if you set this field to "roles/bigquery.dataOwner", it will be returned back as "OWNER".
       */
      role?: string;
      /**
       * [Pick one] A special group to grant access to. Possible values include: projectOwners: Owners of the enclosing project. projectReaders: Readers of the enclosing project. projectWriters: Writers of the enclosing project. allAuthenticatedUsers: All authenticated BigQuery users. Maps to similarly-named IAM members.
       */
      specialGroup?: string;
      /**
       * [Pick one] An email address of a user to grant access to. For example: fred@example.com. Maps to IAM policy member "user:EMAIL" or "serviceAccount:EMAIL".
       */
      userByEmail?: string;
      /**
       * [Pick one] A view from a different dataset to grant access to. Queries executed against that view will have read access to tables in this dataset. The role field is not required when this field is set. If that view is updated by any user, access to the view needs to be granted again via an update operation.
       */
      view?: ITableReference;
    }>;
    /**
     * [Output-only] The time when this dataset was created, in milliseconds since the epoch.
     */
    creationTime?: string;
    /**
     * [Required] A reference that identifies the dataset.
     */
    datasetReference?: IDatasetReference;
    /**
     * [Optional] The default partition expiration for all partitioned tables in the dataset, in milliseconds. Once this property is set, all newly-created partitioned tables in the dataset will have an expirationMs property in the timePartitioning settings set to this value, and changing the value will only affect new tables, not existing ones. The storage in a partition will have an expiration time of its partition time plus this value. Setting this property overrides the use of defaultTableExpirationMs for partitioned tables: only one of defaultTableExpirationMs and defaultPartitionExpirationMs will be used for any new partitioned table. If you provide an explicit timePartitioning.expirationMs when creating or updating a partitioned table, that value takes precedence over the default partition expiration time indicated by this property.
     */
    defaultPartitionExpirationMs?: string;
    /**
     * [Optional] The default lifetime of all tables in the dataset, in milliseconds. The minimum value is 3600000 milliseconds (one hour). Once this property is set, all newly-created tables in the dataset will have an expirationTime property set to the creation time plus the value in this property, and changing the value will only affect new tables, not existing ones. When the expirationTime for a given table is reached, that table will be deleted automatically. If a table's expirationTime is modified or removed before the table expires, or if you provide an explicit expirationTime when creating a table, that value takes precedence over the default expiration time indicated by this property.
     */
    defaultTableExpirationMs?: string;
    /**
     * [Optional] A user-friendly description of the dataset.
     */
    description?: string;
    /**
     * [Output-only] A hash of the resource.
     */
    etag?: string;
    /**
     * [Optional] A descriptive name for the dataset.
     */
    friendlyName?: string;
    /**
     * [Output-only] The fully-qualified unique name of the dataset in the format projectId:datasetId. The dataset name without the project name is given in the datasetId field. When creating a new dataset, leave this field blank, and instead specify the datasetId field.
     */
    id?: string;
    /**
     * [Output-only] The resource type.
     */
    kind?: string;
    /**
     * The labels associated with this dataset. You can use these to organize and group your datasets. You can set this property when inserting or updating a dataset. See Creating and Updating Dataset Labels for more information.
     */
    labels?: { [key: string]: string };
    /**
     * [Output-only] The date when this dataset or any of its tables was last modified, in milliseconds since the epoch.
     */
    lastModifiedTime?: string;
    /**
     * The geographic location where the dataset should reside. The default value is US. See details at https://cloud.google.com/bigquery/docs/locations.
     */
    location?: string;
    /**
     * [Output-only] A URL that can be used to access the resource again. You can use this URL in Get or Update requests to the resource.
     */
    selfLink?: string;
  };

  type IDatasetList = {
    /**
     * An array of the dataset resources in the project. Each resource contains basic information. For full information about a particular dataset resource, use the Datasets: get method. This property is omitted when there are no datasets in the project.
     */
    datasets?: Array<{
      /**
       * The dataset reference. Use this property to access specific parts of the dataset's ID, such as project ID or dataset ID.
       */
      datasetReference?: IDatasetReference;
      /**
       * A descriptive name for the dataset, if one exists.
       */
      friendlyName?: string;
      /**
       * The fully-qualified, unique, opaque ID of the dataset.
       */
      id?: string;
      /**
       * The resource type. This property always returns the value "bigquery#dataset".
       */
      kind?: string;
      /**
       * The labels associated with this dataset. You can use these to organize and group your datasets.
       */
      labels?: { [key: string]: string };
      /**
       * The geographic location where the data resides.
       */
      location?: string;
    }>;
    /**
     * A hash value of the results page. You can use this property to determine if the page has changed since the last request.
     */
    etag?: string;
    /**
     * The list type. This property always returns the value "bigquery#datasetList".
     */
    kind?: string;
    /**
     * A token that can be used to request the next results page. This property is omitted on the final results page.
     */
    nextPageToken?: string;
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

  type IDestinationTableProperties = {
    /**
     * [Optional] The description for the destination table. This will only be used if the destination table is newly created. If the table already exists and a value different than the current description is provided, the job will fail.
     */
    description?: string;
    /**
     * [Optional] The friendly name for the destination table. This will only be used if the destination table is newly created. If the table already exists and a value different than the current friendly name is provided, the job will fail.
     */
    friendlyName?: string;
    /**
     * [Optional] The labels associated with this table. You can use these to organize and group your tables. This will only be used if the destination table is newly created. If the table already exists and labels are different than the current labels are provided, the job will fail.
     */
    labels?: { [key: string]: string };
  };

  type IEncryptionConfiguration = {
    /**
     * [Optional] Describes the Cloud KMS encryption key that will be used to protect destination BigQuery table. The BigQuery Service Account associated with your project requires access to this encryption key.
     */
    kmsKeyName?: string;
  };

  type IErrorProto = {
    /**
     * Debugging information. This property is internal to Google and should not be used.
     */
    debugInfo?: string;
    /**
     * Specifies where the error occurred, if present.
     */
    location?: string;
    /**
     * A human-readable description of the error.
     */
    message?: string;
    /**
     * A short error code that summarizes the error.
     */
    reason?: string;
  };

  type IExplainQueryStage = {
    /**
     * Number of parallel input segments completed.
     */
    completedParallelInputs?: string;
    /**
     * Milliseconds the average shard spent on CPU-bound tasks.
     */
    computeMsAvg?: string;
    /**
     * Milliseconds the slowest shard spent on CPU-bound tasks.
     */
    computeMsMax?: string;
    /**
     * Relative amount of time the average shard spent on CPU-bound tasks.
     */
    computeRatioAvg?: number;
    /**
     * Relative amount of time the slowest shard spent on CPU-bound tasks.
     */
    computeRatioMax?: number;
    /**
     * Stage end time represented as milliseconds since epoch.
     */
    endMs?: string;
    /**
     * Unique ID for stage within plan.
     */
    id?: string;
    /**
     * IDs for stages that are inputs to this stage.
     */
    inputStages?: Array<string>;
    /**
     * Human-readable name for stage.
     */
    name?: string;
    /**
     * Number of parallel input segments to be processed.
     */
    parallelInputs?: string;
    /**
     * Milliseconds the average shard spent reading input.
     */
    readMsAvg?: string;
    /**
     * Milliseconds the slowest shard spent reading input.
     */
    readMsMax?: string;
    /**
     * Relative amount of time the average shard spent reading input.
     */
    readRatioAvg?: number;
    /**
     * Relative amount of time the slowest shard spent reading input.
     */
    readRatioMax?: number;
    /**
     * Number of records read into the stage.
     */
    recordsRead?: string;
    /**
     * Number of records written by the stage.
     */
    recordsWritten?: string;
    /**
     * Total number of bytes written to shuffle.
     */
    shuffleOutputBytes?: string;
    /**
     * Total number of bytes written to shuffle and spilled to disk.
     */
    shuffleOutputBytesSpilled?: string;
    /**
     * Stage start time represented as milliseconds since epoch.
     */
    startMs?: string;
    /**
     * Current status for the stage.
     */
    status?: string;
    /**
     * List of operations within the stage in dependency order (approximately chronological).
     */
    steps?: Array<IExplainQueryStep>;
    /**
     * Milliseconds the average shard spent waiting to be scheduled.
     */
    waitMsAvg?: string;
    /**
     * Milliseconds the slowest shard spent waiting to be scheduled.
     */
    waitMsMax?: string;
    /**
     * Relative amount of time the average shard spent waiting to be scheduled.
     */
    waitRatioAvg?: number;
    /**
     * Relative amount of time the slowest shard spent waiting to be scheduled.
     */
    waitRatioMax?: number;
    /**
     * Milliseconds the average shard spent on writing output.
     */
    writeMsAvg?: string;
    /**
     * Milliseconds the slowest shard spent on writing output.
     */
    writeMsMax?: string;
    /**
     * Relative amount of time the average shard spent on writing output.
     */
    writeRatioAvg?: number;
    /**
     * Relative amount of time the slowest shard spent on writing output.
     */
    writeRatioMax?: number;
  };

  type IExplainQueryStep = {
    /**
     * Machine-readable operation type.
     */
    kind?: string;
    /**
     * Human-readable stage descriptions.
     */
    substeps?: Array<string>;
  };

  type IExternalDataConfiguration = {
    /**
     * Try to detect schema and format options automatically. Any option specified explicitly will be honored.
     */
    autodetect?: boolean;
    /**
     * [Optional] Additional options if sourceFormat is set to BIGTABLE.
     */
    bigtableOptions?: IBigtableOptions;
    /**
     * [Optional] The compression type of the data source. Possible values include GZIP and NONE. The default value is NONE. This setting is ignored for Google Cloud Bigtable, Google Cloud Datastore backups and Avro formats.
     */
    compression?: string;
    /**
     * Additional properties to set if sourceFormat is set to CSV.
     */
    csvOptions?: ICsvOptions;
    /**
     * [Optional] Additional options if sourceFormat is set to GOOGLE_SHEETS.
     */
    googleSheetsOptions?: IGoogleSheetsOptions;
    /**
     * [Optional, Experimental] If hive partitioning is enabled, which mode to use. Two modes are supported: - AUTO: automatically infer partition key name(s) and type(s). - STRINGS: automatic infer partition key name(s). All types are strings. Not all storage formats support hive partitioning -- requesting hive partitioning on an unsupported format will lead to an error.
     */
    hivePartitioningMode?: string;
    /**
     * [Optional] Indicates if BigQuery should allow extra values that are not represented in the table schema. If true, the extra values are ignored. If false, records with extra columns are treated as bad records, and if there are too many bad records, an invalid error is returned in the job result. The default value is false. The sourceFormat property determines what BigQuery treats as an extra value: CSV: Trailing columns JSON: Named values that don't match any column names Google Cloud Bigtable: This setting is ignored. Google Cloud Datastore backups: This setting is ignored. Avro: This setting is ignored.
     */
    ignoreUnknownValues?: boolean;
    /**
     * [Optional] The maximum number of bad records that BigQuery can ignore when reading data. If the number of bad records exceeds this value, an invalid error is returned in the job result. This is only valid for CSV, JSON, and Google Sheets. The default value is 0, which requires that all records are valid. This setting is ignored for Google Cloud Bigtable, Google Cloud Datastore backups and Avro formats.
     */
    maxBadRecords?: number;
    /**
     * [Optional] The schema for the data. Schema is required for CSV and JSON formats. Schema is disallowed for Google Cloud Bigtable, Cloud Datastore backups, and Avro formats.
     */
    schema?: ITableSchema;
    /**
     * [Required] The data format. For CSV files, specify "CSV". For Google sheets, specify "GOOGLE_SHEETS". For newline-delimited JSON, specify "NEWLINE_DELIMITED_JSON". For Avro files, specify "AVRO". For Google Cloud Datastore backups, specify "DATASTORE_BACKUP". [Beta] For Google Cloud Bigtable, specify "BIGTABLE".
     */
    sourceFormat?: string;
    /**
     * [Required] The fully-qualified URIs that point to your data in Google Cloud. For Google Cloud Storage URIs: Each URI can contain one '*' wildcard character and it must come after the 'bucket' name. Size limits related to load jobs apply to external data sources. For Google Cloud Bigtable URIs: Exactly one URI can be specified and it has be a fully specified and valid HTTPS URL for a Google Cloud Bigtable table. For Google Cloud Datastore backups, exactly one URI can be specified. Also, the '*' wildcard character is not allowed.
     */
    sourceUris?: Array<string>;
  };

  type IGetQueryResultsResponse = {
    /**
     * Whether the query result was fetched from the query cache.
     */
    cacheHit?: boolean;
    /**
     * [Output-only] The first errors or warnings encountered during the running of the job. The final message includes the number of errors that caused the process to stop. Errors here do not necessarily mean that the job has completed or was unsuccessful.
     */
    errors?: Array<IErrorProto>;
    /**
     * A hash of this response.
     */
    etag?: string;
    /**
     * Whether the query has completed or not. If rows or totalRows are present, this will always be true. If this is false, totalRows will not be available.
     */
    jobComplete?: boolean;
    /**
     * Reference to the BigQuery Job that was created to run the query. This field will be present even if the original request timed out, in which case GetQueryResults can be used to read the results once the query has completed. Since this API only returns the first page of results, subsequent pages can be fetched via the same mechanism (GetQueryResults).
     */
    jobReference?: IJobReference;
    /**
     * The resource type of the response.
     */
    kind?: string;
    /**
     * [Output-only] The number of rows affected by a DML statement. Present only for DML statements INSERT, UPDATE or DELETE.
     */
    numDmlAffectedRows?: string;
    /**
     * A token used for paging results.
     */
    pageToken?: string;
    /**
     * An object with as many results as can be contained within the maximum permitted reply size. To get any additional rows, you can call GetQueryResults and specify the jobReference returned above. Present only when the query completes successfully.
     */
    rows?: Array<ITableRow>;
    /**
     * The schema of the results. Present only when the query completes successfully.
     */
    schema?: ITableSchema;
    /**
     * The total number of bytes processed for this query.
     */
    totalBytesProcessed?: string;
    /**
     * The total number of rows in the complete query result set, which can be more than the number of rows in this single page of results. Present only when the query completes successfully.
     */
    totalRows?: string;
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

  type IGoogleSheetsOptions = {
    /**
     * [Beta] [Optional] Range of a sheet to query from. Only used when non-empty. Typical format: sheet_name!top_left_cell_id:bottom_right_cell_id For example: sheet1!A1:B20
     */
    range?: string;
    /**
     * [Optional] The number of rows at the top of a sheet that BigQuery will skip when reading the data. The default value is 0. This property is useful if you have header rows that should be skipped. When autodetect is on, behavior is the following: * skipLeadingRows unspecified - Autodetect tries to detect headers in the first row. If they are not detected, the row is read as data. Otherwise data is read starting from the second row. * skipLeadingRows is 0 - Instructs autodetect that there are no headers and data should be read starting from the first row. * skipLeadingRows = N > 0 - Autodetect skips N-1 rows and tries to detect headers in row N. If headers are not detected, row N is just skipped. Otherwise row N is used to extract column names for the detected schema.
     */
    skipLeadingRows?: string;
  };

  type IJob = {
    /**
     * [Required] Describes the job configuration.
     */
    configuration?: IJobConfiguration;
    /**
     * [Output-only] A hash of this resource.
     */
    etag?: string;
    /**
     * [Output-only] Opaque ID field of the job
     */
    id?: string;
    /**
     * [Optional] Reference describing the unique-per-user name of the job.
     */
    jobReference?: IJobReference;
    /**
     * [Output-only] The type of the resource.
     */
    kind?: string;
    /**
     * [Output-only] A URL that can be used to access this resource again.
     */
    selfLink?: string;
    /**
     * [Output-only] Information about the job, including starting time and ending time of the job.
     */
    statistics?: IJobStatistics;
    /**
     * [Output-only] The status of this job. Examine this value when polling an asynchronous job to see if the job is complete.
     */
    status?: IJobStatus;
    /**
     * [Output-only] Email address of the user who ran the job.
     */
    user_email?: string;
  };

  type IJobCancelResponse = {
    /**
     * The final state of the job.
     */
    job?: IJob;
    /**
     * The resource type of the response.
     */
    kind?: string;
  };

  type IJobConfiguration = {
    /**
     * [Pick one] Copies a table.
     */
    copy?: IJobConfigurationTableCopy;
    /**
     * [Optional] If set, don't actually run this job. A valid query will return a mostly empty response with some processing statistics, while an invalid query will return the same error it would if it wasn't a dry run. Behavior of non-query jobs is undefined.
     */
    dryRun?: boolean;
    /**
     * [Pick one] Configures an extract job.
     */
    extract?: IJobConfigurationExtract;
    /**
     * [Optional] Job timeout in milliseconds. If this time limit is exceeded, BigQuery may attempt to terminate the job.
     */
    jobTimeoutMs?: string;
    /**
     * [Output-only] The type of the job. Can be QUERY, LOAD, EXTRACT, COPY or UNKNOWN.
     */
    jobType?: string;
    /**
     * The labels associated with this job. You can use these to organize and group your jobs. Label keys and values can be no longer than 63 characters, can only contain lowercase letters, numeric characters, underscores and dashes. International characters are allowed. Label values are optional. Label keys must start with a letter and each label in the list must have a different key.
     */
    labels?: { [key: string]: string };
    /**
     * [Pick one] Configures a load job.
     */
    load?: IJobConfigurationLoad;
    /**
     * [Pick one] Configures a query job.
     */
    query?: IJobConfigurationQuery;
  };

  type IJobConfigurationExtract = {
    /**
     * [Optional] The compression type to use for exported files. Possible values include GZIP, DEFLATE, SNAPPY, and NONE. The default value is NONE. DEFLATE and SNAPPY are only supported for Avro.
     */
    compression?: string;
    /**
     * [Optional] The exported file format. Possible values include CSV, NEWLINE_DELIMITED_JSON and AVRO. The default value is CSV. Tables with nested or repeated fields cannot be exported as CSV.
     */
    destinationFormat?: string;
    /**
     * [Pick one] DEPRECATED: Use destinationUris instead, passing only one URI as necessary. The fully-qualified Google Cloud Storage URI where the extracted table should be written.
     */
    destinationUri?: string;
    /**
     * [Pick one] A list of fully-qualified Google Cloud Storage URIs where the extracted table should be written.
     */
    destinationUris?: Array<string>;
    /**
     * [Optional] Delimiter to use between fields in the exported data. Default is ','
     */
    fieldDelimiter?: string;
    /**
     * [Optional] Whether to print out a header row in the results. Default is true.
     */
    printHeader?: boolean;
    /**
     * [Required] A reference to the table being exported.
     */
    sourceTable?: ITableReference;
  };

  type IJobConfigurationLoad = {
    /**
     * [Optional] Accept rows that are missing trailing optional columns. The missing values are treated as nulls. If false, records with missing trailing columns are treated as bad records, and if there are too many bad records, an invalid error is returned in the job result. The default value is false. Only applicable to CSV, ignored for other formats.
     */
    allowJaggedRows?: boolean;
    /**
     * Indicates if BigQuery should allow quoted data sections that contain newline characters in a CSV file. The default value is false.
     */
    allowQuotedNewlines?: boolean;
    /**
     * [Optional] Indicates if we should automatically infer the options and schema for CSV and JSON sources.
     */
    autodetect?: boolean;
    /**
     * [Beta] Clustering specification for the destination table. Must be specified with time-based partitioning, data in the table will be first partitioned and subsequently clustered.
     */
    clustering?: IClustering;
    /**
     * [Optional] Specifies whether the job is allowed to create new tables. The following values are supported: CREATE_IF_NEEDED: If the table does not exist, BigQuery creates the table. CREATE_NEVER: The table must already exist. If it does not, a 'notFound' error is returned in the job result. The default value is CREATE_IF_NEEDED. Creation, truncation and append actions occur as one atomic update upon job completion.
     */
    createDisposition?: string;
    /**
     * Custom encryption configuration (e.g., Cloud KMS keys).
     */
    destinationEncryptionConfiguration?: IEncryptionConfiguration;
    /**
     * [Required] The destination table to load the data into.
     */
    destinationTable?: ITableReference;
    /**
     * [Beta] [Optional] Properties with which to create the destination table if it is new.
     */
    destinationTableProperties?: IDestinationTableProperties;
    /**
     * [Optional] The character encoding of the data. The supported values are UTF-8 or ISO-8859-1. The default value is UTF-8. BigQuery decodes the data after the raw, binary data has been split using the values of the quote and fieldDelimiter properties.
     */
    encoding?: string;
    /**
     * [Optional] The separator for fields in a CSV file. The separator can be any ISO-8859-1 single-byte character. To use a character in the range 128-255, you must encode the character as UTF8. BigQuery converts the string to ISO-8859-1 encoding, and then uses the first byte of the encoded string to split the data in its raw, binary state. BigQuery also supports the escape sequence "\t" to specify a tab separator. The default value is a comma (',').
     */
    fieldDelimiter?: string;
    /**
     * [Optional, Experimental] If hive partitioning is enabled, which mode to use. Two modes are supported: - AUTO: automatically infer partition key name(s) and type(s). - STRINGS: automatic infer partition key name(s). All types are strings. Not all storage formats support hive partitioning -- requesting hive partitioning on an unsupported format will lead to an error.
     */
    hivePartitioningMode?: string;
    /**
     * [Optional] Indicates if BigQuery should allow extra values that are not represented in the table schema. If true, the extra values are ignored. If false, records with extra columns are treated as bad records, and if there are too many bad records, an invalid error is returned in the job result. The default value is false. The sourceFormat property determines what BigQuery treats as an extra value: CSV: Trailing columns JSON: Named values that don't match any column names
     */
    ignoreUnknownValues?: boolean;
    /**
     * [Optional] The maximum number of bad records that BigQuery can ignore when running the job. If the number of bad records exceeds this value, an invalid error is returned in the job result. This is only valid for CSV and JSON. The default value is 0, which requires that all records are valid.
     */
    maxBadRecords?: number;
    /**
     * [Optional] Specifies a string that represents a null value in a CSV file. For example, if you specify "\N", BigQuery interprets "\N" as a null value when loading a CSV file. The default value is the empty string. If you set this property to a custom value, BigQuery throws an error if an empty string is present for all data types except for STRING and BYTE. For STRING and BYTE columns, BigQuery interprets the empty string as an empty value.
     */
    nullMarker?: string;
    /**
     * If sourceFormat is set to "DATASTORE_BACKUP", indicates which entity properties to load into BigQuery from a Cloud Datastore backup. Property names are case sensitive and must be top-level properties. If no properties are specified, BigQuery loads all properties. If any named property isn't found in the Cloud Datastore backup, an invalid error is returned in the job result.
     */
    projectionFields?: Array<string>;
    /**
     * [Optional] The value that is used to quote data sections in a CSV file. BigQuery converts the string to ISO-8859-1 encoding, and then uses the first byte of the encoded string to split the data in its raw, binary state. The default value is a double-quote ('"'). If your data does not contain quoted sections, set the property value to an empty string. If your data contains quoted newline characters, you must also set the allowQuotedNewlines property to true.
     */
    quote?: string;
    /**
     * [TrustedTester] Range partitioning specification for this table. Only one of timePartitioning and rangePartitioning should be specified.
     */
    rangePartitioning?: IRangePartitioning;
    /**
     * [Optional] The schema for the destination table. The schema can be omitted if the destination table already exists, or if you're loading data from Google Cloud Datastore.
     */
    schema?: ITableSchema;
    /**
     * [Deprecated] The inline schema. For CSV schemas, specify as "Field1:Type1[,Field2:Type2]*". For example, "foo:STRING, bar:INTEGER, baz:FLOAT".
     */
    schemaInline?: string;
    /**
     * [Deprecated] The format of the schemaInline property.
     */
    schemaInlineFormat?: string;
    /**
     * Allows the schema of the destination table to be updated as a side effect of the load job if a schema is autodetected or supplied in the job configuration. Schema update options are supported in two cases: when writeDisposition is WRITE_APPEND; when writeDisposition is WRITE_TRUNCATE and the destination table is a partition of a table, specified by partition decorators. For normal tables, WRITE_TRUNCATE will always overwrite the schema. One or more of the following values are specified: ALLOW_FIELD_ADDITION: allow adding a nullable field to the schema. ALLOW_FIELD_RELAXATION: allow relaxing a required field in the original schema to nullable.
     */
    schemaUpdateOptions?: Array<string>;
    /**
     * [Optional] The number of rows at the top of a CSV file that BigQuery will skip when loading the data. The default value is 0. This property is useful if you have header rows in the file that should be skipped.
     */
    skipLeadingRows?: number;
    /**
     * [Optional] The format of the data files. For CSV files, specify "CSV". For datastore backups, specify "DATASTORE_BACKUP". For newline-delimited JSON, specify "NEWLINE_DELIMITED_JSON". For Avro, specify "AVRO". For parquet, specify "PARQUET". For orc, specify "ORC". The default value is CSV.
     */
    sourceFormat?: string;
    /**
     * [Required] The fully-qualified URIs that point to your data in Google Cloud. For Google Cloud Storage URIs: Each URI can contain one '*' wildcard character and it must come after the 'bucket' name. Size limits related to load jobs apply to external data sources. For Google Cloud Bigtable URIs: Exactly one URI can be specified and it has be a fully specified and valid HTTPS URL for a Google Cloud Bigtable table. For Google Cloud Datastore backups: Exactly one URI can be specified. Also, the '*' wildcard character is not allowed.
     */
    sourceUris?: Array<string>;
    /**
     * Time-based partitioning specification for the destination table. Only one of timePartitioning and rangePartitioning should be specified.
     */
    timePartitioning?: ITimePartitioning;
    /**
     * [Optional] If sourceFormat is set to "AVRO", indicates whether to enable interpreting logical types into their corresponding types (ie. TIMESTAMP), instead of only using their raw types (ie. INTEGER).
     */
    useAvroLogicalTypes?: boolean;
    /**
     * [Optional] Specifies the action that occurs if the destination table already exists. The following values are supported: WRITE_TRUNCATE: If the table already exists, BigQuery overwrites the table data. WRITE_APPEND: If the table already exists, BigQuery appends the data to the table. WRITE_EMPTY: If the table already exists and contains data, a 'duplicate' error is returned in the job result. The default value is WRITE_APPEND. Each action is atomic and only occurs if BigQuery is able to complete the job successfully. Creation, truncation and append actions occur as one atomic update upon job completion.
     */
    writeDisposition?: string;
  };

  type IJobConfigurationQuery = {
    /**
     * [Optional] If true and query uses legacy SQL dialect, allows the query to produce arbitrarily large result tables at a slight cost in performance. Requires destinationTable to be set. For standard SQL queries, this flag is ignored and large results are always allowed. However, you must still set destinationTable when result size exceeds the allowed maximum response size.
     */
    allowLargeResults?: boolean;
    /**
     * [Beta] Clustering specification for the destination table. Must be specified with time-based partitioning, data in the table will be first partitioned and subsequently clustered.
     */
    clustering?: IClustering;
    /**
     * [Optional] Specifies whether the job is allowed to create new tables. The following values are supported: CREATE_IF_NEEDED: If the table does not exist, BigQuery creates the table. CREATE_NEVER: The table must already exist. If it does not, a 'notFound' error is returned in the job result. The default value is CREATE_IF_NEEDED. Creation, truncation and append actions occur as one atomic update upon job completion.
     */
    createDisposition?: string;
    /**
     * [Optional] Specifies the default dataset to use for unqualified table names in the query. Note that this does not alter behavior of unqualified dataset names.
     */
    defaultDataset?: IDatasetReference;
    /**
     * Custom encryption configuration (e.g., Cloud KMS keys).
     */
    destinationEncryptionConfiguration?: IEncryptionConfiguration;
    /**
     * [Optional] Describes the table where the query results should be stored. If not present, a new table will be created to store the results. This property must be set for large results that exceed the maximum response size.
     */
    destinationTable?: ITableReference;
    /**
     * [Optional] If true and query uses legacy SQL dialect, flattens all nested and repeated fields in the query results. allowLargeResults must be true if this is set to false. For standard SQL queries, this flag is ignored and results are never flattened.
     */
    flattenResults?: boolean;
    /**
     * [Optional] Limits the billing tier for this job. Queries that have resource usage beyond this tier will fail (without incurring a charge). If unspecified, this will be set to your project default.
     */
    maximumBillingTier?: number;
    /**
     * [Optional] Limits the bytes billed for this job. Queries that will have bytes billed beyond this limit will fail (without incurring a charge). If unspecified, this will be set to your project default.
     */
    maximumBytesBilled?: string;
    /**
     * Standard SQL only. Set to POSITIONAL to use positional (?) query parameters or to NAMED to use named (@myparam) query parameters in this query.
     */
    parameterMode?: string;
    /**
     * [Deprecated] This property is deprecated.
     */
    preserveNulls?: boolean;
    /**
     * [Optional] Specifies a priority for the query. Possible values include INTERACTIVE and BATCH. The default value is INTERACTIVE.
     */
    priority?: string;
    /**
     * [Required] SQL query text to execute. The useLegacySql field can be used to indicate whether the query uses legacy SQL or standard SQL.
     */
    query?: string;
    /**
     * Query parameters for standard SQL queries.
     */
    queryParameters?: Array<IQueryParameter>;
    /**
     * [TrustedTester] Range partitioning specification for this table. Only one of timePartitioning and rangePartitioning should be specified.
     */
    rangePartitioning?: IRangePartitioning;
    /**
     * Allows the schema of the destination table to be updated as a side effect of the query job. Schema update options are supported in two cases: when writeDisposition is WRITE_APPEND; when writeDisposition is WRITE_TRUNCATE and the destination table is a partition of a table, specified by partition decorators. For normal tables, WRITE_TRUNCATE will always overwrite the schema. One or more of the following values are specified: ALLOW_FIELD_ADDITION: allow adding a nullable field to the schema. ALLOW_FIELD_RELAXATION: allow relaxing a required field in the original schema to nullable.
     */
    schemaUpdateOptions?: Array<string>;
    /**
     * [Optional] If querying an external data source outside of BigQuery, describes the data format, location and other properties of the data source. By defining these properties, the data source can then be queried as if it were a standard BigQuery table.
     */
    tableDefinitions?: { [key: string]: IExternalDataConfiguration };
    /**
     * Time-based partitioning specification for the destination table. Only one of timePartitioning and rangePartitioning should be specified.
     */
    timePartitioning?: ITimePartitioning;
    /**
     * Specifies whether to use BigQuery's legacy SQL dialect for this query. The default value is true. If set to false, the query will use BigQuery's standard SQL: https://cloud.google.com/bigquery/sql-reference/ When useLegacySql is set to false, the value of flattenResults is ignored; query will be run as if flattenResults is false.
     */
    useLegacySql?: boolean;
    /**
     * [Optional] Whether to look for the result in the query cache. The query cache is a best-effort cache that will be flushed whenever tables in the query are modified. Moreover, the query cache is only available when a query does not have a destination table specified. The default value is true.
     */
    useQueryCache?: boolean;
    /**
     * Describes user-defined function resources used in the query.
     */
    userDefinedFunctionResources?: Array<IUserDefinedFunctionResource>;
    /**
     * [Optional] Specifies the action that occurs if the destination table already exists. The following values are supported: WRITE_TRUNCATE: If the table already exists, BigQuery overwrites the table data and uses the schema from the query result. WRITE_APPEND: If the table already exists, BigQuery appends the data to the table. WRITE_EMPTY: If the table already exists and contains data, a 'duplicate' error is returned in the job result. The default value is WRITE_EMPTY. Each action is atomic and only occurs if BigQuery is able to complete the job successfully. Creation, truncation and append actions occur as one atomic update upon job completion.
     */
    writeDisposition?: string;
  };

  type IJobConfigurationTableCopy = {
    /**
     * [Optional] Specifies whether the job is allowed to create new tables. The following values are supported: CREATE_IF_NEEDED: If the table does not exist, BigQuery creates the table. CREATE_NEVER: The table must already exist. If it does not, a 'notFound' error is returned in the job result. The default value is CREATE_IF_NEEDED. Creation, truncation and append actions occur as one atomic update upon job completion.
     */
    createDisposition?: string;
    /**
     * Custom encryption configuration (e.g., Cloud KMS keys).
     */
    destinationEncryptionConfiguration?: IEncryptionConfiguration;
    /**
     * [Required] The destination table
     */
    destinationTable?: ITableReference;
    /**
     * [Pick one] Source table to copy.
     */
    sourceTable?: ITableReference;
    /**
     * [Pick one] Source tables to copy.
     */
    sourceTables?: Array<ITableReference>;
    /**
     * [Optional] Specifies the action that occurs if the destination table already exists. The following values are supported: WRITE_TRUNCATE: If the table already exists, BigQuery overwrites the table data. WRITE_APPEND: If the table already exists, BigQuery appends the data to the table. WRITE_EMPTY: If the table already exists and contains data, a 'duplicate' error is returned in the job result. The default value is WRITE_EMPTY. Each action is atomic and only occurs if BigQuery is able to complete the job successfully. Creation, truncation and append actions occur as one atomic update upon job completion.
     */
    writeDisposition?: string;
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
       * [Full-projection-only] Specifies the job configuration.
       */
      configuration?: IJobConfiguration;
      /**
       * A result object that will be present only if the job has failed.
       */
      errorResult?: IErrorProto;
      /**
       * Unique opaque ID of the job.
       */
      id?: string;
      /**
       * Job reference uniquely identifying the job.
       */
      jobReference?: IJobReference;
      /**
       * The resource type.
       */
      kind?: string;
      /**
       * Running state of the job. When the state is DONE, errorResult can be checked to determine whether the job succeeded or failed.
       */
      state?: string;
      /**
       * [Output-only] Information about the job, including starting time and ending time of the job.
       */
      statistics?: IJobStatistics;
      /**
       * [Full-projection-only] Describes the state of the job.
       */
      status?: IJobStatus;
      /**
       * [Full-projection-only] Email address of the user who ran the job.
       */
      user_email?: string;
    }>;
    /**
     * The resource type of the response.
     */
    kind?: string;
    /**
     * A token to request the next page of results.
     */
    nextPageToken?: string;
  };

  type IJobReference = {
    /**
     * [Required] The ID of the job. The ID must contain only letters (a-z, A-Z), numbers (0-9), underscores (_), or dashes (-). The maximum length is 1,024 characters.
     */
    jobId?: string;
    /**
     * The geographic location of the job. See details at https://cloud.google.com/bigquery/docs/locations#specifying_your_location.
     */
    location?: string;
    /**
     * [Required] The ID of the project containing this job.
     */
    projectId?: string;
  };

  type IJobStatistics = {
    /**
     * [TrustedTester] [Output-only] Job progress (0.0 -> 1.0) for LOAD and EXTRACT jobs.
     */
    completionRatio?: number;
    /**
     * [Output-only] Creation time of this job, in milliseconds since the epoch. This field will be present on all jobs.
     */
    creationTime?: string;
    /**
     * [Output-only] End time of this job, in milliseconds since the epoch. This field will be present whenever a job is in the DONE state.
     */
    endTime?: string;
    /**
     * [Output-only] Statistics for an extract job.
     */
    extract?: IJobStatistics4;
    /**
     * [Output-only] Statistics for a load job.
     */
    load?: IJobStatistics3;
    /**
     * [Output-only] Number of child jobs executed.
     */
    numChildJobs?: string;
    /**
     * [Output-only] If this is a child job, the id of the parent.
     */
    parentJobId?: string;
    /**
     * [Output-only] Statistics for a query job.
     */
    query?: IJobStatistics2;
    /**
     * [Output-only] Quotas which delayed this job's start time.
     */
    quotaDeferments?: Array<string>;
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
     * [Output-only] Start time of this job, in milliseconds since the epoch. This field will be present when the job transitions from the PENDING state to either RUNNING or DONE.
     */
    startTime?: string;
    /**
     * [Output-only] [Deprecated] Use the bytes processed in the query statistics instead.
     */
    totalBytesProcessed?: string;
    /**
     * [Output-only] Slot-milliseconds for the job.
     */
    totalSlotMs?: string;
  };

  type IJobStatistics2 = {
    /**
     * [Output-only] Billing tier for the job.
     */
    billingTier?: number;
    /**
     * [Output-only] Whether the query result was fetched from the query cache.
     */
    cacheHit?: boolean;
    /**
     * The DDL operation performed, possibly dependent on the pre-existence of the DDL target. Possible values (new values might be added in the future): "CREATE": The query created the DDL target. "SKIP": No-op. Example cases: the query is CREATE TABLE IF NOT EXISTS while the table already exists, or the query is DROP TABLE IF EXISTS while the table does not exist. "REPLACE": The query replaced the DDL target. Example case: the query is CREATE OR REPLACE TABLE, and the table already exists. "DROP": The query deleted the DDL target.
     */
    ddlOperationPerformed?: string;
    /**
     * The DDL target routine. Present only for CREATE/DROP FUNCTION/PROCEDURE queries.
     */
    ddlTargetRoutine?: IRoutineReference;
    /**
     * The DDL target table. Present only for CREATE/DROP TABLE/VIEW queries.
     */
    ddlTargetTable?: ITableReference;
    /**
     * [Output-only] The original estimate of bytes processed for the job.
     */
    estimatedBytesProcessed?: string;
    /**
     * [Output-only, Beta] Information about create model query job progress.
     */
    modelTraining?: IBigQueryModelTraining;
    /**
     * [Output-only, Beta] Deprecated; do not use.
     */
    modelTrainingCurrentIteration?: number;
    /**
     * [Output-only, Beta] Deprecated; do not use.
     */
    modelTrainingExpectedTotalIteration?: string;
    /**
     * [Output-only] The number of rows affected by a DML statement. Present only for DML statements INSERT, UPDATE or DELETE.
     */
    numDmlAffectedRows?: string;
    /**
     * [Output-only] Describes execution plan for the query.
     */
    queryPlan?: Array<IExplainQueryStage>;
    /**
     * [Output-only] Referenced tables for the job. Queries that reference more than 50 tables will not have a complete list.
     */
    referencedTables?: Array<ITableReference>;
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
     * [Output-only] The schema of the results. Present only for successful dry run of non-legacy SQL queries.
     */
    schema?: ITableSchema;
    /**
     * The type of query statement, if valid. Possible values (new values might be added in the future): "SELECT": SELECT query. "INSERT": INSERT query; see https://cloud.google.com/bigquery/docs/reference/standard-sql/data-manipulation-language. "UPDATE": UPDATE query; see https://cloud.google.com/bigquery/docs/reference/standard-sql/data-manipulation-language. "DELETE": DELETE query; see https://cloud.google.com/bigquery/docs/reference/standard-sql/data-manipulation-language. "MERGE": MERGE query; see https://cloud.google.com/bigquery/docs/reference/standard-sql/data-manipulation-language. "CREATE_TABLE": CREATE [OR REPLACE] TABLE without AS SELECT. "CREATE_TABLE_AS_SELECT": CREATE [OR REPLACE] TABLE ... AS SELECT ... . "DROP_TABLE": DROP TABLE query. "CREATE_VIEW": CREATE [OR REPLACE] VIEW ... AS SELECT ... . "DROP_VIEW": DROP VIEW query. "CREATE_FUNCTION": CREATE FUNCTION query. "DROP_FUNCTION" : DROP FUNCTION query. "ALTER_TABLE": ALTER TABLE query. "ALTER_VIEW": ALTER VIEW query.
     */
    statementType?: string;
    /**
     * [Output-only] [Beta] Describes a timeline of job execution.
     */
    timeline?: Array<IQueryTimelineSample>;
    /**
     * [Output-only] Total bytes billed for the job.
     */
    totalBytesBilled?: string;
    /**
     * [Output-only] Total bytes processed for the job.
     */
    totalBytesProcessed?: string;
    /**
     * [Output-only] For dry-run jobs, totalBytesProcessed is an estimate and this field specifies the accuracy of the estimate. Possible values can be: UNKNOWN: accuracy of the estimate is unknown. PRECISE: estimate is precise. LOWER_BOUND: estimate is lower bound of what the query would cost. UPPER_BOUND: estimate is upper bound of what the query would cost.
     */
    totalBytesProcessedAccuracy?: string;
    /**
     * [Output-only] Total number of partitions processed from all partitioned tables referenced in the job.
     */
    totalPartitionsProcessed?: string;
    /**
     * [Output-only] Slot-milliseconds for the job.
     */
    totalSlotMs?: string;
    /**
     * Standard SQL only: list of undeclared query parameters detected during a dry run validation.
     */
    undeclaredQueryParameters?: Array<IQueryParameter>;
  };

  type IJobStatistics3 = {
    /**
     * [Output-only] The number of bad records encountered. Note that if the job has failed because of more bad records encountered than the maximum allowed in the load job configuration, then this number can be less than the total number of bad records present in the input data.
     */
    badRecords?: string;
    /**
     * [Output-only] Number of bytes of source data in a load job.
     */
    inputFileBytes?: string;
    /**
     * [Output-only] Number of source files in a load job.
     */
    inputFiles?: string;
    /**
     * [Output-only] Size of the loaded data in bytes. Note that while a load job is in the running state, this value may change.
     */
    outputBytes?: string;
    /**
     * [Output-only] Number of rows imported in a load job. Note that while an import job is in the running state, this value may change.
     */
    outputRows?: string;
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

  type IJobStatus = {
    /**
     * [Output-only] Final error result of the job. If present, indicates that the job has completed and was unsuccessful.
     */
    errorResult?: IErrorProto;
    /**
     * [Output-only] The first errors encountered during the running of the job. The final message includes the number of errors that caused the process to stop. Errors here do not necessarily mean that the job has completed or was unsuccessful.
     */
    errors?: Array<IErrorProto>;
    /**
     * [Output-only] Running state of the job.
     */
    state?: string;
  };

  /**
   * Represents a single JSON object.
   */
  type IJsonObject = { [key: string]: IJsonValue };

  type IJsonValue = any;

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

  type IProjectList = {
    /**
     * A hash of the page of results
     */
    etag?: string;
    /**
     * The type of list.
     */
    kind?: string;
    /**
     * A token to request the next page of results.
     */
    nextPageToken?: string;
    /**
     * Projects to which you have at least READ access.
     */
    projects?: Array<{
      /**
       * A descriptive name for this project.
       */
      friendlyName?: string;
      /**
       * An opaque ID of this project.
       */
      id?: string;
      /**
       * The resource type.
       */
      kind?: string;
      /**
       * The numeric ID of this project.
       */
      numericId?: string;
      /**
       * A unique reference to this project.
       */
      projectReference?: IProjectReference;
    }>;
    /**
     * The total number of projects in the list.
     */
    totalItems?: number;
  };

  type IProjectReference = {
    /**
     * [Required] ID of the project. Can be either the numeric ID or the assigned ID of the project.
     */
    projectId?: string;
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

  type IQueryParameterType = {
    /**
     * [Optional] The type of the array's elements, if this is an array.
     */
    arrayType?: IQueryParameterType;
    /**
     * [Optional] The types of the fields of this struct, in order, if this is a struct.
     */
    structTypes?: Array<{
      /**
       * [Optional] Human-oriented description of the field.
       */
      description?: string;
      /**
       * [Optional] The name of this field.
       */
      name?: string;
      /**
       * [Required] The type of this field.
       */
      type?: IQueryParameterType;
    }>;
    /**
     * [Required] The top level type of this field.
     */
    type?: string;
  };

  type IQueryParameterValue = {
    /**
     * [Optional] The array values, if this is an array type.
     */
    arrayValues?: Array<IQueryParameterValue>;
    /**
     * [Optional] The struct field values, in order of the struct type's declaration.
     */
    structValues?: { [key: string]: IQueryParameterValue };
    /**
     * [Optional] The value of this value, if a simple scalar type.
     */
    value?: string;
  };

  type IQueryRequest = {
    /**
     * [Optional] Specifies the default datasetId and projectId to assume for any unqualified table names in the query. If not set, all table names in the query string must be qualified in the format 'datasetId.tableId'.
     */
    defaultDataset?: IDatasetReference;
    /**
     * [Optional] If set to true, BigQuery doesn't run the job. Instead, if the query is valid, BigQuery returns statistics about the job such as how many bytes would be processed. If the query is invalid, an error returns. The default value is false.
     */
    dryRun?: boolean;
    /**
     * The resource type of the request.
     */
    kind?: string;
    /**
     * The geographic location where the job should run. See details at https://cloud.google.com/bigquery/docs/locations#specifying_your_location.
     */
    location?: string;
    /**
     * [Optional] The maximum number of rows of data to return per page of results. Setting this flag to a small value such as 1000 and then paging through results might improve reliability when the query result set is large. In addition to this limit, responses are also limited to 10 MB. By default, there is no maximum row count, and only the byte limit applies.
     */
    maxResults?: number;
    /**
     * Standard SQL only. Set to POSITIONAL to use positional (?) query parameters or to NAMED to use named (@myparam) query parameters in this query.
     */
    parameterMode?: string;
    /**
     * [Deprecated] This property is deprecated.
     */
    preserveNulls?: boolean;
    /**
     * [Required] A query string, following the BigQuery query syntax, of the query to execute. Example: "SELECT count(f1) FROM [myProjectId:myDatasetId.myTableId]".
     */
    query?: string;
    /**
     * Query parameters for Standard SQL queries.
     */
    queryParameters?: Array<IQueryParameter>;
    /**
     * [Optional] How long to wait for the query to complete, in milliseconds, before the request times out and returns. Note that this is only a timeout for the request, not the query. If the query takes longer to run than the timeout value, the call returns without any results and with the 'jobComplete' flag set to false. You can call GetQueryResults() to wait for the query to complete and read the results. The default value is 10000 milliseconds (10 seconds).
     */
    timeoutMs?: number;
    /**
     * Specifies whether to use BigQuery's legacy SQL dialect for this query. The default value is true. If set to false, the query will use BigQuery's standard SQL: https://cloud.google.com/bigquery/sql-reference/ When useLegacySql is set to false, the value of flattenResults is ignored; query will be run as if flattenResults is false.
     */
    useLegacySql?: boolean;
    /**
     * [Optional] Whether to look for the result in the query cache. The query cache is a best-effort cache that will be flushed whenever tables in the query are modified. The default value is true.
     */
    useQueryCache?: boolean;
  };

  type IQueryResponse = {
    /**
     * Whether the query result was fetched from the query cache.
     */
    cacheHit?: boolean;
    /**
     * [Output-only] The first errors or warnings encountered during the running of the job. The final message includes the number of errors that caused the process to stop. Errors here do not necessarily mean that the job has completed or was unsuccessful.
     */
    errors?: Array<IErrorProto>;
    /**
     * Whether the query has completed or not. If rows or totalRows are present, this will always be true. If this is false, totalRows will not be available.
     */
    jobComplete?: boolean;
    /**
     * Reference to the Job that was created to run the query. This field will be present even if the original request timed out, in which case GetQueryResults can be used to read the results once the query has completed. Since this API only returns the first page of results, subsequent pages can be fetched via the same mechanism (GetQueryResults).
     */
    jobReference?: IJobReference;
    /**
     * The resource type.
     */
    kind?: string;
    /**
     * [Output-only] The number of rows affected by a DML statement. Present only for DML statements INSERT, UPDATE or DELETE.
     */
    numDmlAffectedRows?: string;
    /**
     * A token used for paging results.
     */
    pageToken?: string;
    /**
     * An object with as many results as can be contained within the maximum permitted reply size. To get any additional rows, you can call GetQueryResults and specify the jobReference returned above.
     */
    rows?: Array<ITableRow>;
    /**
     * The schema of the results. Present only when the query completes successfully.
     */
    schema?: ITableSchema;
    /**
     * The total number of bytes processed for this query. If this query was a dry run, this is the number of bytes that would be processed if the query were run.
     */
    totalBytesProcessed?: string;
    /**
     * The total number of rows in the complete query result set, which can be more than the number of rows in this single page of results.
     */
    totalRows?: string;
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

  type IRangePartitioning = {
    /**
     * [TrustedTester] [Required] The table is partitioned by this field. The field must be a top-level NULLABLE/REQUIRED field. The only supported type is INTEGER/INT64.
     */
    field?: string;
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
  };

  type IRoutineReference = {
    /**
     * [Required] The ID of the dataset containing this routine.
     */
    datasetId?: string;
    /**
     * [Required] The ID of the project containing this routine.
     */
    projectId?: string;
    /**
     * [Required] The ID of the routine. The ID must contain only letters (a-z, A-Z), numbers (0-9), or underscores (_). The maximum length is 256 characters.
     */
    routineId?: string;
  };

  type IStreamingbuffer = {
    /**
     * [Output-only] A lower-bound estimate of the number of bytes currently in the streaming buffer.
     */
    estimatedBytes?: string;
    /**
     * [Output-only] A lower-bound estimate of the number of rows currently in the streaming buffer.
     */
    estimatedRows?: string;
    /**
     * [Output-only] Contains the timestamp of the oldest entry in the streaming buffer, in milliseconds since the epoch, if the streaming buffer is available.
     */
    oldestEntryTime?: string;
  };

  type ITable = {
    /**
     * [Beta] Clustering specification for the table. Must be specified with partitioning, data in the table will be first partitioned and subsequently clustered.
     */
    clustering?: IClustering;
    /**
     * [Output-only] The time when this table was created, in milliseconds since the epoch.
     */
    creationTime?: string;
    /**
     * [Optional] A user-friendly description of this table.
     */
    description?: string;
    /**
     * Custom encryption configuration (e.g., Cloud KMS keys).
     */
    encryptionConfiguration?: IEncryptionConfiguration;
    /**
     * [Output-only] A hash of the table metadata. Used to ensure there were no concurrent modifications to the resource when attempting an update. Not guaranteed to change when the table contents or the fields numRows, numBytes, numLongTermBytes or lastModifiedTime change.
     */
    etag?: string;
    /**
     * [Optional] The time when this table expires, in milliseconds since the epoch. If not present, the table will persist indefinitely. Expired tables will be deleted and their storage reclaimed. The defaultTableExpirationMs property of the encapsulating dataset can be used to set a default expirationTime on newly created tables.
     */
    expirationTime?: string;
    /**
     * [Optional] Describes the data format, location, and other properties of a table stored outside of BigQuery. By defining these properties, the data source can then be queried as if it were a standard BigQuery table.
     */
    externalDataConfiguration?: IExternalDataConfiguration;
    /**
     * [Optional] A descriptive name for this table.
     */
    friendlyName?: string;
    /**
     * [Output-only] An opaque ID uniquely identifying the table.
     */
    id?: string;
    /**
     * [Output-only] The type of the resource.
     */
    kind?: string;
    /**
     * The labels associated with this table. You can use these to organize and group your tables. Label keys and values can be no longer than 63 characters, can only contain lowercase letters, numeric characters, underscores and dashes. International characters are allowed. Label values are optional. Label keys must start with a letter and each label in the list must have a different key.
     */
    labels?: { [key: string]: string };
    /**
     * [Output-only] The time when this table was last modified, in milliseconds since the epoch.
     */
    lastModifiedTime?: string;
    /**
     * [Output-only] The geographic location where the table resides. This value is inherited from the dataset.
     */
    location?: string;
    /**
     * [Optional] Materialized view definition.
     */
    materializedView?: IMaterializedViewDefinition;
    /**
     * [Output-only, Beta] Present iff this table represents a ML model. Describes the training information for the model, and it is required to run 'PREDICT' queries.
     */
    model?: IModelDefinition;
    /**
     * [Output-only] The size of this table in bytes, excluding any data in the streaming buffer.
     */
    numBytes?: string;
    /**
     * [Output-only] The number of bytes in the table that are considered "long-term storage".
     */
    numLongTermBytes?: string;
    /**
     * [Output-only] [TrustedTester] The physical size of this table in bytes, excluding any data in the streaming buffer. This includes compression and storage used for time travel.
     */
    numPhysicalBytes?: string;
    /**
     * [Output-only] The number of rows of data in this table, excluding any data in the streaming buffer.
     */
    numRows?: string;
    /**
     * [TrustedTester] Range partitioning specification for this table. Only one of timePartitioning and rangePartitioning should be specified.
     */
    rangePartitioning?: IRangePartitioning;
    /**
     * [Beta] [Optional] If set to true, queries over this table require a partition filter that can be used for partition elimination to be specified.
     */
    requirePartitionFilter?: boolean;
    /**
     * [Optional] Describes the schema of this table.
     */
    schema?: ITableSchema;
    /**
     * [Output-only] A URL that can be used to access this resource again.
     */
    selfLink?: string;
    /**
     * [Output-only] Contains information regarding this table's streaming buffer, if one is present. This field will be absent if the table is not being streamed to or if there is no data in the streaming buffer.
     */
    streamingBuffer?: IStreamingbuffer;
    /**
     * [Required] Reference describing the ID of this table.
     */
    tableReference?: ITableReference;
    /**
     * Time-based partitioning specification for this table. Only one of timePartitioning and rangePartitioning should be specified.
     */
    timePartitioning?: ITimePartitioning;
    /**
     * [Output-only] Describes the table type. The following values are supported: TABLE: A normal BigQuery table. VIEW: A virtual table defined by a SQL query. [TrustedTester] MATERIALIZED_VIEW: SQL query whose result is persisted. EXTERNAL: A table that references data stored in an external storage system, such as Google Cloud Storage. The default value is TABLE.
     */
    type?: string;
    /**
     * [Optional] The view definition.
     */
    view?: IViewDefinition;
  };

  type ITableCell = { v?: any };

  type ITableDataInsertAllRequest = {
    /**
     * [Optional] Accept rows that contain values that do not match the schema. The unknown values are ignored. Default is false, which treats unknown values as errors.
     */
    ignoreUnknownValues?: boolean;
    /**
     * The resource type of the response.
     */
    kind?: string;
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
     * [Optional] Insert all valid rows of a request, even if invalid rows exist. The default value is false, which causes the entire request to fail if any invalid rows exist.
     */
    skipInvalidRows?: boolean;
    /**
     * If specified, treats the destination table as a base template, and inserts the rows into an instance table named "{destination}{templateSuffix}". BigQuery will manage creation of the instance table, using the schema of the base template table. See https://cloud.google.com/bigquery/streaming-data-into-bigquery#template-tables for considerations when working with templates tables.
     */
    templateSuffix?: string;
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

  type ITableDataList = {
    /**
     * A hash of this page of results.
     */
    etag?: string;
    /**
     * The resource type of the response.
     */
    kind?: string;
    /**
     * A token used for paging results. Providing this token instead of the startIndex parameter can help you retrieve stable results when an underlying table is changing.
     */
    pageToken?: string;
    /**
     * Rows of results.
     */
    rows?: Array<ITableRow>;
    /**
     * The total number of rows in the complete table.
     */
    totalRows?: string;
  };

  type ITableFieldSchema = {
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
    /**
     * [Optional] The field mode. Possible values include NULLABLE, REQUIRED and REPEATED. The default value is NULLABLE.
     */
    mode?: string;
    /**
     * [Required] The field name. The name must contain only letters (a-z, A-Z), numbers (0-9), or underscores (_), and must start with a letter or underscore. The maximum length is 128 characters.
     */
    name?: string;
    /**
     * [Required] The field data type. Possible values include STRING, BYTES, INTEGER, INT64 (same as INTEGER), FLOAT, FLOAT64 (same as FLOAT), BOOLEAN, BOOL (same as BOOLEAN), TIMESTAMP, DATE, TIME, DATETIME, RECORD (where RECORD indicates that the field contains a nested schema) or STRUCT (same as RECORD).
     */
    type?: string;
  };

  type ITableList = {
    /**
     * A hash of this page of results.
     */
    etag?: string;
    /**
     * The type of list.
     */
    kind?: string;
    /**
     * A token to request the next page of results.
     */
    nextPageToken?: string;
    /**
     * Tables in the requested dataset.
     */
    tables?: Array<{
      /**
       * [Beta] Clustering specification for this table, if configured.
       */
      clustering?: IClustering;
      /**
       * The time when this table was created, in milliseconds since the epoch.
       */
      creationTime?: string;
      /**
       * [Optional] The time when this table expires, in milliseconds since the epoch. If not present, the table will persist indefinitely. Expired tables will be deleted and their storage reclaimed.
       */
      expirationTime?: string;
      /**
       * The user-friendly name for this table.
       */
      friendlyName?: string;
      /**
       * An opaque ID of the table
       */
      id?: string;
      /**
       * The resource type.
       */
      kind?: string;
      /**
       * The labels associated with this table. You can use these to organize and group your tables.
       */
      labels?: { [key: string]: string };
      /**
       * A reference uniquely identifying the table.
       */
      tableReference?: ITableReference;
      /**
       * The time-based partitioning specification for this table, if configured.
       */
      timePartitioning?: ITimePartitioning;
      /**
       * The type of table. Possible values are: TABLE, VIEW.
       */
      type?: string;
      /**
       * Additional details for a view.
       */
      view?: {
        /**
         * True if view is defined in legacy SQL dialect, false if in standard SQL.
         */
        useLegacySql?: boolean;
      };
    }>;
    /**
     * The total number of tables in the dataset.
     */
    totalItems?: number;
  };

  type ITableReference = {
    /**
     * [Required] The ID of the dataset containing this table.
     */
    datasetId?: string;
    /**
     * [Required] The ID of the project containing this table.
     */
    projectId?: string;
    /**
     * [Required] The ID of the table. The ID must contain only letters (a-z, A-Z), numbers (0-9), or underscores (_). The maximum length is 1,024 characters.
     */
    tableId?: string;
  };

  type ITableRow = {
    /**
     * Represents a single row in the result set, consisting of one or more fields.
     */
    f?: Array<ITableCell>;
  };

  type ITableSchema = {
    /**
     * Describes the fields in a table.
     */
    fields?: Array<ITableFieldSchema>;
  };

  type ITimePartitioning = {
    /**
     * [Optional] Number of milliseconds for which to keep the storage for partitions in the table. The storage in a partition will have an expiration time of its partition time plus this value.
     */
    expirationMs?: string;
    /**
     * [Beta] [Optional] If not set, the table is partitioned by pseudo column, referenced via either '_PARTITIONTIME' as TIMESTAMP type, or '_PARTITIONDATE' as DATE type. If field is specified, the table is instead partitioned by this field. The field must be a top-level TIMESTAMP or DATE field. Its mode must be NULLABLE or REQUIRED.
     */
    field?: string;
    requirePartitionFilter?: boolean;
    /**
     * [Required] The only type supported is DAY, which will generate one partition per day.
     */
    type?: string;
  };

  type IUserDefinedFunctionResource = {
    /**
     * [Pick one] An inline resource that contains code for a user-defined function (UDF). Providing a inline code resource is equivalent to providing a URI for a file containing the same code.
     */
    inlineCode?: string;
    /**
     * [Pick one] A code resource to load from a Google Cloud Storage URI (gs://bucket/path).
     */
    resourceUri?: string;
  };

  type IViewDefinition = {
    /**
     * [Required] A query that BigQuery executes when the view is referenced.
     */
    query?: string;
    /**
     * Specifies whether to use BigQuery's legacy SQL for this view. The default value is true. If set to false, the view will use BigQuery's standard SQL: https://cloud.google.com/bigquery/sql-reference/ Queries and views that reference this view must use the same flag value.
     */
    useLegacySql?: boolean;
    /**
     * Describes user-defined function resources used in the query.
     */
    userDefinedFunctionResources?: Array<IUserDefinedFunctionResource>;
  };

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
       * The maximum number of results to return
       */
      maxResults?: number;
      /**
       * Page token, returned by a previous call, to request the next page of results
       */
      pageToken?: string;
    };
  }

  namespace jobs {
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

    /**
     * Retrieves the results of a query job.
     */
    type IGetQueryResultsParams = {
      /**
       * The geographic location where the job should run. Required except for US and EU. See details at https://cloud.google.com/bigquery/docs/locations#specifying_your_location.
       */
      location?: string;
      /**
       * Maximum number of results to read
       */
      maxResults?: number;
      /**
       * Page token, returned by a previous call, to request the next page of results
       */
      pageToken?: string;
      /**
       * Zero-based index of the starting row
       */
      startIndex?: string;
      /**
       * How long to wait for the query to complete, in milliseconds, before returning. Default is 10 seconds. If the timeout passes before the job completes, the 'jobComplete' field in the response will be false
       */
      timeoutMs?: number;
    };

    /**
     * Lists all jobs that you started in the specified project. Job information is available for a six month period after creation. The job list is sorted in reverse chronological order, by job creation time. Requires the Can View project role, or the Is Owner project role if you set the allUsers property.
     */
    type IListParams = {
      /**
       * Whether to display jobs owned by all users in the project. Default false
       */
      allUsers?: boolean;
      /**
       * Max value for job creation time, in milliseconds since the POSIX epoch. If set, only jobs created before or at this timestamp are returned
       */
      maxCreationTime?: string;
      /**
       * Maximum number of results to return
       */
      maxResults?: number;
      /**
       * Min value for job creation time, in milliseconds since the POSIX epoch. If set, only jobs created after or at this timestamp are returned
       */
      minCreationTime?: string;
      /**
       * Page token, returned by a previous call, to request the next page of results
       */
      pageToken?: string;
      /**
       * Restrict information returned to a set of selected fields
       */
      projection?: 'full' | 'minimal';
      /**
       * Filter for job state
       */
      stateFilter?: 'done' | 'pending' | 'running';
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

  namespace tabledata {
    /**
     * Retrieves table data from a specified set of rows. Requires the READER dataset role.
     */
    type IListParams = {
      /**
       * Maximum number of results to return
       */
      maxResults?: number;
      /**
       * Page token, returned by a previous call, identifying the result set
       */
      pageToken?: string;
      /**
       * List of fields to return (comma-separated). If unspecified, all fields are returned
       */
      selectedFields?: string;
      /**
       * Zero-based index of the starting row to read
       */
      startIndex?: string;
    };
  }

  namespace tables {
    /**
     * Gets the specified table resource by table ID. This method does not return the data in the table, it only returns the table resource, which describes the structure of this table.
     */
    type IGetParams = {
      /**
       * List of fields to return (comma-separated). If unspecified, all fields are returned
       */
      selectedFields?: string;
    };

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
  }
}

export default bigquery;

