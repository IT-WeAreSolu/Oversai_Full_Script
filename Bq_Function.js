// Bigquery

function Stream_To_BigQuery(rows, projectId, datasetId, tableId) {
  const batchSize = 500;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const request = {
      rows: batch.map(row => ({
        insertId: Utilities.getUuid(), // evitar duplicados
        json: row
      }))
    };

    try {
      const response = BigQuery.Tabledata.insertAll(request, projectId, datasetId, tableId);

      if (response.insertErrors && response.insertErrors.length > 0) {
        console.error(`Errors en batch ${i / batchSize + 1}:`, JSON.stringify(response.insertErrors, null, 2));
      } else {
        // console.log(`Se Subio el batch ${i / batchSize + 1} (${batch.length} registros)`);
      }

    } catch (err) {
      console.error(`Error in batch ${i / batchSize + 1}:`, err.message);
      // throw err; // comentado para continuar con los demás batches
    }

    Utilities.sleep(500); // delay asi google no se enoja
  }
};

function Merge_Procesos(projectId, datasetId, datasetId_temp, tableId, tableId_temp) {
  const query = `
    MERGE ${projectId}.${datasetId}.${tableId} T
    USING ${projectId}.${datasetId_temp}.${tableId_temp} S
    ON T.process_id = S.process_id

    WHEN MATCHED THEN UPDATE SET
        process_name=S.process_name,
        status=S.status,
        company_id=S.company_id,
        created_at=S.created_at,
        updated_at=S.updated_at,
        created_by=S.created_by

    WHEN NOT MATCHED THEN
      INSERT (
        process_id,
        process_name,
        status,
        company_id,
        created_at,
        updated_at,
        created_by
      )
      VALUES (
        S.process_id,
        S.process_name,
        S.status,
        S.company_id,
        S.created_at,
        S.updated_at,
        S.created_by
      )
  `;

  let request = 
  {
    query: query,
    useLegacySql: false
  };

  console.log(query);

  try
  {
    let queryResults = BigQuery.Jobs.query(request, config.projectId);
    let jobId = queryResults.jobReference.jobId;
    let insertado = queryResults.dmlStats.insertedRowCount;
    let actualizado = queryResults.dmlStats.updatedRowCount;
  } catch(err){
    console.log('error Update_Tablas : ' + err);
  }
};

function Merge_Preguntas(projectId, datasetId, datasetId_temp, tableId, tableId_temp) {
  const query = `
    MERGE ${projectId}.${datasetId}.${tableId} T
    USING ${projectId}.${datasetId_temp}.${tableId_temp} S
    ON T.answer_id = S.answer_id AND T.question_id = S.question_id 
    WHEN NOT MATCHED THEN
      INSERT (
        processed_at,
        process_id,
        process_name,
        answer_id,
        link,
        user_email,
        created_at,
        updated_at,
        score,
        section_id,
        section_name,
        section_weight,		
        section_score,	
        section_score_weight,
        question_id,
        question_text,
        question_answer,		
        question_reason
      )
      VALUES (
        S.processed_at,
        S.process_id,
        S.process_name,
        S.answer_id,
        S.link,
        S.user_email,
        S.created_at,
        S.updated_at,
        S.score,
        S.section_id,
        S.section_name,
        S.section_weight,		
        S.section_score,	
        S.section_score_weight,
        S.question_id,
        S.question_text,
        S.question_answer,		
        S.question_reason
      )
  `;

  const job = {
    configuration: {
      query: {
        query: query,
        useLegacySql: false
      }
    }
  };

    // Start the merge job
    const insertJob = BigQuery.Jobs.insert(job, projectId);
    Logger.log('Merge job started with ID: ' + insertJob.id);
    
    // Wait for the merge job to complete
    let jobStatus;
    do {
      Utilities.sleep(2000);
      jobStatus = BigQuery.Jobs.get(projectId, insertJob.jobReference.jobId);
      Logger.log('Merge job status: ' + JSON.stringify(jobStatus.status));
    } while (jobStatus.status.state === 'RUNNING');

    if (jobStatus.status.errorResult) {
      throw new Error('Merge job failed: ' + JSON.stringify(jobStatus.status.errorResult));
    }

    // Check if the merge was successful
    const stats = jobStatus.statistics.query;
    Logger.log(`Merge complete. Affected rows: ${stats.numDmlAffectedRows || 0}`);
    return jobStatus.status
};

function Merge_Interactions(projectId, datasetId, datasetId_temp, tableId, tableId_temp) {
  const query = `
    MERGE \`${projectId}.${datasetId}.${tableId}\` T
    USING \`${projectId}.${datasetId_temp}.${tableId_temp}\` S
    ON T.interaction_id = S.interaction_id

    WHEN MATCHED THEN UPDATE SET
      processed_at = S.processed_at,
      integration_id = S.integration_id,
      external_id = S.external_id,
      event_id = S.event_id,
      channel = S.channel,
      source = S.source,
      status = S.status,
      subject = S.subject,
      link = S.link,
      company_id = S.company_id,
      team_id = S.team_id,
      team_name = S.team_name,
      user_id = S.user_id,
      user_email = S.user_email,
      created_at = S.created_at,
      updated_at = S.updated_at,
      tags = S.tags,
      filters = S.filters,
      ai_analyzed = S.ai_analyzed,
      custom_fields = S.custom_fields,
      metrics = S.metrics,
      extra_priority = S.extra_priority,
      extra_channel_account = S.extra_channel_account,
      extra_type_id = S.extra_type_id,
      ai_polarity_agent_sentiment = S.ai_polarity_agent_sentiment,
      ai_polarity_customer_sentiment = S.ai_polarity_customer_sentiment,
      ai_customer_sentiment = S.ai_customer_sentiment,
      ai_agent_sentiment = S.ai_agent_sentiment,
      ai_summary = S.ai_summary,
      ai_topics = S.ai_topics,
      ai_suggested_topics = S.ai_suggested_topics

    WHEN NOT MATCHED THEN INSERT (
      processed_at,
      interaction_id,
      integration_id,
      external_id,
      event_id,
      channel,
      source,
      status,
      subject,
      link,
      company_id,
      team_id,
      team_name,
      user_id,
      user_email,
      created_at,
      updated_at,
      tags,
      filters,
      ai_analyzed,
      custom_fields,
      metrics,
      extra_priority,
      extra_channel_account,
      extra_type_id,
      ai_polarity_agent_sentiment,
      ai_polarity_customer_sentiment,
      ai_customer_sentiment,
      ai_agent_sentiment,
      ai_summary,
      ai_topics,
      ai_suggested_topics
    )
    VALUES (
      S.processed_at,
      S.interaction_id,
      S.integration_id,
      S.external_id,
      S.event_id,
      S.channel,
      S.source,
      S.status,
      S.subject,
      S.link,
      S.company_id,
      S.team_id,
      S.team_name,
      S.user_id,
      S.user_email,
      S.created_at,
      S.updated_at,
      S.tags,
      S.filters,
      S.ai_analyzed,
      S.custom_fields,
      S.metrics,
      S.extra_priority,
      S.extra_channel_account,
      S.extra_type_id,
      S.ai_polarity_agent_sentiment,
      S.ai_polarity_customer_sentiment,
      S.ai_customer_sentiment,
      S.ai_agent_sentiment,
      S.ai_summary,
      S.ai_topics,
      S.ai_suggested_topics
    )
  `;

  const job = {
    configuration: {
      query: {
        query: query,
        useLegacySql: false
      }
    }
  };

  const insertJob = BigQuery.Jobs.insert(job, projectId);
  Logger.log('Merge Interactions job started with ID: ' + insertJob.id);

  let jobStatus;
  do {
    Utilities.sleep(2000);
    jobStatus = BigQuery.Jobs.get(projectId, insertJob.jobReference.jobId);
    Logger.log('Merge Interactions status: ' + JSON.stringify(jobStatus.status));
  } while (jobStatus.status.state === 'RUNNING');

  if (jobStatus.status.errorResult) {
    throw new Error('Merge Interactions failed: ' + JSON.stringify(jobStatus.status.errorResult));
  }

  const stats = jobStatus.statistics.query;
  Logger.log(`Merge Interactions complete. Affected rows: ${stats.numDmlAffectedRows || 0}`);
  return jobStatus.status;
};

function Create_BigQuery_Table(projectId, datasetId, tableId, schema, expirationTime = null) {
    try {
      BigQuery.Tables.get(projectId, datasetId, tableId);
      console.log(`La Tabla ya existe`);
    } catch (e) {
      const table = {
        tableReference: {
          projectId: projectId,
          datasetId: datasetId,
          tableId: tableId
        },
        schema: schema,
        expirationTime: expirationTime
      };
      
      BigQuery.Tables.insert(table, projectId, datasetId);
      console.log(`Tabla Creada ${datasetId}.${tableId}`);
    }
};
