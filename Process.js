// Process

function Get_Procesos_Activos() {
    const processes = Get_Procesos();

    if (processes.status === 'success' && processes.data) {
        const rowsToInsert = processes.data.map(p => ({
          process_id: p._id,
          process_name: p.name || '',
          status: p.status,
          company_id: p.company_id || null,
          created_at: p.createda_at || null,
          updated_at: p.updated_at || null,
          created_by: p.created_by || null
        }));

        Stream_To_BigQuery(rowsToInsert, config.projectId, config.datasetId_temp, config.tableId_procesos_temp);
        Utilities.sleep(3000);
    }

    
    if (processes.status === 'success' && processes.data) {
      const activeProcesses = processes.data.filter(process => process.status === 'active');
      return activeProcesses.map(process => ({
        id: process._id,
        name: process.name || ''
      }));
    }
    return [];
};

function Get_Procesos(options = {}) {
  const defaultOptions = {
    page: 1,
    page_size: 100
  };
  
  const queryParams = {...defaultOptions, ...options};
  const queryString = Object.keys(queryParams)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
    .join('&');
  
  const url = `${config.BASE_URL}/v1/processes?${queryString}`;
  
  const requestOptions = {
    method: 'get',
    headers: {
      'Authorization': GetBasicAuthHeader(),
      'Content-Type': 'application/json'
    },
    muteHttpExceptions: true
  };
  
    const response = UrlFetchApp.fetch(url, requestOptions);
    const responseCode = response.getResponseCode();
    const responseData = JSON.parse(response.getContentText());
    
    if (responseCode === 200) {
      return responseData;
    } else {
      throw new Error(`API Error: ${responseCode} - ${JSON.stringify(responseData)}`);
    }
};

function Get_Respuestas_Proceso(processId, options = {}) {
  const defaultOptions = {
    page: 1,
    page_size: 100
  };
  
  const queryParams = {...defaultOptions, ...options, process_id: processId};
  const queryString = Object.keys(queryParams)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
    .join('&');
  
  const url = `${config.BASE_URL}/v1/process/answers?${queryString}`;
  
  const requestOptions = {
    method: 'get',
    headers: {
      'Authorization': GetBasicAuthHeader(),
      'Content-Type': 'application/json'
    },
    muteHttpExceptions: true
  };
  
    const response = UrlFetchApp.fetch(url, requestOptions);
    const responseCode = response.getResponseCode();
    const responseData = JSON.parse(response.getContentText());
    
    if (responseCode === 200) {
      return responseData;
    } else {
      throw new Error(`API Error: ${responseCode} - ${JSON.stringify(responseData)}`);
    }
};

function Generar_Respuestas_BQ(answers) {
  const rows = [];
  
  answers.forEach(answer => {
    const processed_at = new Date().toISOString();
    const baseRow = {
      processed_at: processed_at,
      process_id: answer.process_id,
      process_name: answer.process_name || '',
      answer_id: answer._id,
      link: answer.link,
      user_email: answer.user_email,
      created_at: answer.created_at,
      updated_at: answer.updated_at,
      score: answer.score,
      
    };
    
    // Process each section and its questions
    if (answer.sections && Array.isArray(answer.sections)) {
      answer.sections.forEach(section => {
        if (section.questions && Array.isArray(section.questions)) {
          section.questions.forEach(question => {
            const row = {
              ...baseRow,
              // Section fields
              section_id: section.id,
              section_name: section.name,
              section_weight: section.weight,
              section_score: section.score,
              section_score_weight: section.score_weight,
              // Question fields
              question_id: question.id,
              question_text: question.text,
              question_answer: question.answer,
              question_reason: question.reason
            };
            rows.push(row);
          });
        }
      });
    }
  });
  
  return rows;
};

function Get_All_Interactions(options = {}) {
  const pageSize = options.page_size || 100;
  let page = 1;
  let keepPaging = true;
  const all = [];

  // por si el API cambia no vaya ser que quede en infinito
  const MAX_PAGES = 200;

  while (keepPaging && page <= MAX_PAGES) {
    const resp = Get_Interactions({ ...options, page, page_size: pageSize });

    const data = resp && resp.data ? resp.data : [];

    console.log(`Interactions | página ${page} | recibidos: ${data.length}`);

    if (data.length === 0) {
      keepPaging = false; // no hay más
      break;
    }

    all.push.apply(all, data);

    // si llegó menos que el page_size, es la última página
    if (data.length < pageSize) {
      keepPaging = false;
    } else {
      page++;
      Utilities.sleep(200);
    }
  }

  console.log(`Interactions | total acumulado: ${all.length}`);
  return all;
};

function Get_Interactions(options = {}) {
  const defaultOptions = {
    page: 1,
    page_size: 100,
    ai_metrics: true,
    ai_tagging: true,
    sort: 'updated_at'
  };

  const queryParams = { ...defaultOptions, ...options };
  const queryString = Object.keys(queryParams)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
    .join('&');

  const url = `${config.BASE_URL}/v1/interactions?${queryString}`;

  const requestOptions = {
    method: 'get',
    headers: {
      'Authorization': GetBasicAuthHeader(),
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, requestOptions);
  const responseCode = response.getResponseCode();
  const responseData = JSON.parse(response.getContentText());

  if (responseCode === 200) {
    return responseData;
  } else {
    throw new Error(`API Error en Get_Interactions: ${responseCode} - ${JSON.stringify(responseData)}`);
  }
};

function Generar_Interacciones_BQ(interactions) {
  const rows = [];
  const processed_at = new Date().toISOString();

  interactions.forEach(item => {
    const ai = item.ai_tagging || {};
    const ex = item.extra || {};

    const row = {
      processed_at: processed_at,

      interaction_id: item._id,
      integration_id: item.integration_id || null,
      external_id: item.external_id || null,
      event_id: item.event_id || null,
      channel: item.channel || null,
      source: item.source || null,
      status: item.status || null,
      subject: item.subject || null,
      link: item.link || null,

      company_id: item.company_id !== undefined ? item.company_id : null,
      team_id: item.team_id || null,
      team_name: item.team_name || null,

      user_id: item.user_id || null,
      user_email: item.user_email || null,

      created_at: item.created_at || null,
      updated_at: item.updated_at || null,

      // repeated
      tags: Array.isArray(item.tags) ? item.tags : [],
      filters: Array.isArray(item.filters) ? item.filters : [],
      ai_analyzed: Array.isArray(item.ai_analyzed) ? item.ai_analyzed : [],

      // JSON flex
      custom_fields: item.custom_fields ? JSON.stringify(item.custom_fields) : null,
      metrics: item.metrics ? JSON.stringify(item.metrics) : null,

      // extra flatten
      extra_priority: ex.priority || null,
      extra_channel_account: ex.channel_account || null,
      extra_type_id: (ex.type_id !== undefined && ex.type_id !== null) ? Number(ex.type_id) : null,

      // ai flatten
      ai_polarity_agent_sentiment: (ai.polarity_agent_sentiment !== undefined && ai.polarity_agent_sentiment !== null) ? Number(ai.polarity_agent_sentiment) : null,
      ai_polarity_customer_sentiment: (ai.polarity_customer_sentiment !== undefined && ai.polarity_customer_sentiment !== null) ? Number(ai.polarity_customer_sentiment) : null,
      ai_customer_sentiment: ai.customer_sentiment || null,
      ai_agent_sentiment: ai.agent_sentiment || null,
      ai_summary: ai.summary || null,
      ai_topics: Array.isArray(ai.topics) ? ai.topics : [],
      ai_suggested_topics: Array.isArray(ai.suggested_topics) ? ai.suggested_topics : []
    };

    rows.push(row);
  });

  return rows;
};
