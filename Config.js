function Config(){
  return {
    BASE_URL: 'https://ao9cws7z5d.execute-api.us-east-1.amazonaws.com/prod',
    USERNAME: 'soporte_it@wearesolu.com',
    PASSWORD: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    projectId: "data-warehouse-311917",
    datasetId: "Oversai", 
    datasetId_temp: "zt_Temp_Tables",
    tableId_answers: "tbl_Oversai_answers",
    tableId_answers_temp: "tbl_Oversai_answers_temp",
    tableId_procesos: "tbl_Oversai_procesos",
    tableId_procesos_temp: "tbl_Oversai_procesos_temp",
    tableId_interactions: "tbl_Oversai_interactions",
    tableId_interactions_temp: "tbl_Oversai_interactions_temp"
  }
};


function GetBasicAuthHeader() {
  const credentials = Utilities.base64Encode(config.USERNAME + ':' + config.PASSWORD);
  return 'Basic ' + credentials;
};
