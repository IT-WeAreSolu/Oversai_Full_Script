// Schemas

const schema_Answers = {
  fields: [
    { name: 'processed_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
    { name: 'process_id', type: 'STRING', mode: 'REQUIRED' },
    { name: 'process_name', type: 'STRING', mode: 'NULLABLE' },
    { name: 'answer_id', type: 'STRING', mode: 'REQUIRED' },
    { name: 'link', type: 'STRING', mode: 'NULLABLE' },
    { name: 'user_email', type: 'STRING', mode: 'NULLABLE' },
    { name: 'created_at', type: 'TIMESTAMP', mode: 'NULLABLE' },
    { name: 'updated_at', type: 'TIMESTAMP', mode: 'NULLABLE' },
    { name: 'score', type: 'FLOAT', mode: 'NULLABLE' },
    // Section fields
    { name: 'section_id', type: 'STRING', mode: 'NULLABLE' },
    { name: 'section_name', type: 'STRING', mode: 'NULLABLE' },
    { name: 'section_weight', type: 'FLOAT', mode: 'NULLABLE' },
    { name: 'section_score', type: 'FLOAT', mode: 'NULLABLE' },
    { name: 'section_score_weight', type: 'FLOAT', mode: 'NULLABLE' },
    // Question fields
    { name: 'question_id', type: 'STRING', mode: 'NULLABLE' },
    { name: 'question_text', type: 'STRING', mode: 'NULLABLE' },
    { name: 'question_answer', type: 'STRING', mode: 'NULLABLE' },
    { name: 'question_reason', type: 'STRING', mode: 'NULLABLE' }
  ]
};

const schema_Procesos = {
  fields: [
    { name: 'process_id', type: 'STRING', mode: 'REQUIRED' },
    { name: 'process_name', type: 'STRING', mode: 'REQUIRED' },
    { name: 'status', type: 'STRING', mode: 'REQUIRED' },
    { name: 'company_id', type: 'INTEGER', mode: 'NULLABLE' },
    { name: 'created_at', type: 'TIMESTAMP', mode: 'NULLABLE' },
    { name: 'updated_at', type: 'TIMESTAMP', mode: 'NULLABLE' },
    { name: 'created_by', type: 'STRING', mode: 'NULLABLE' }
  ]
};


const schema_Interactions = {
  fields: [
    { name: 'processed_at', type: 'TIMESTAMP', mode: 'REQUIRED' },

    { name: 'interaction_id', type: 'STRING', mode: 'REQUIRED' },
    { name: 'integration_id', type: 'STRING', mode: 'NULLABLE' },
    { name: 'external_id', type: 'STRING', mode: 'NULLABLE' },
    { name: 'event_id', type: 'STRING', mode: 'NULLABLE' },
    { name: 'channel', type: 'STRING', mode: 'NULLABLE' },
    { name: 'source', type: 'STRING', mode: 'NULLABLE' },
    { name: 'status', type: 'STRING', mode: 'NULLABLE' },
    { name: 'subject', type: 'STRING', mode: 'NULLABLE' },
    { name: 'link', type: 'STRING', mode: 'NULLABLE' },

    // Organización
    { name: 'company_id', type: 'INTEGER', mode: 'NULLABLE' },
    { name: 'team_id', type: 'STRING', mode: 'NULLABLE' },
    { name: 'team_name', type: 'STRING', mode: 'NULLABLE' },

    // Usuario
    { name: 'user_id', type: 'STRING', mode: 'NULLABLE' },
    { name: 'user_email', type: 'STRING', mode: 'NULLABLE' },

    // Tiempos
    { name: 'created_at', type: 'TIMESTAMP', mode: 'NULLABLE' },
    { name: 'updated_at', type: 'TIMESTAMP', mode: 'NULLABLE' },

    // Arrays simples
    { name: 'tags', type: 'STRING', mode: 'REPEATED' },
    { name: 'filters', type: 'STRING', mode: 'REPEATED' },
    { name: 'ai_analyzed', type: 'STRING', mode: 'REPEATED' },

    // Estructura variable (los dejamos como JSON string por ahora)
    { name: 'custom_fields', type: 'STRING', mode: 'NULLABLE' }, // JSON completo
    { name: 'metrics', type: 'STRING', mode: 'NULLABLE' },       // JSON completo

    // Extra (flatten)
    { name: 'extra_priority', type: 'STRING', mode: 'NULLABLE' },
    { name: 'extra_channel_account', type: 'STRING', mode: 'NULLABLE' },
    { name: 'extra_type_id', type: 'INTEGER', mode: 'NULLABLE' },

    // --- AI Tagging planito (flatten al top-level) ---
    { name: 'ai_polarity_agent_sentiment', type: 'FLOAT', mode: 'NULLABLE' },
    { name: 'ai_polarity_customer_sentiment', type: 'FLOAT', mode: 'NULLABLE' },
    { name: 'ai_customer_sentiment', type: 'STRING', mode: 'NULLABLE' },
    { name: 'ai_agent_sentiment', type: 'STRING', mode: 'NULLABLE' },
    { name: 'ai_summary', type: 'STRING', mode: 'NULLABLE' },
    { name: 'ai_topics', type: 'STRING', mode: 'REPEATED' },
    { name: 'ai_suggested_topics', type: 'STRING', mode: 'REPEATED' }
  ]
};
