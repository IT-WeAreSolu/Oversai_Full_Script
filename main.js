// Main

const config = Config();
const minutosExpire = 30;

function Main() {
  let expire = (minutosExpire * 60 * 1000) + new Date().getTime();
  
  Create_BigQuery_Table(config.projectId, config.datasetId_temp, config.tableId_answers_temp, schema_Answers, expire);
  Utilities.sleep(3000);

  Create_BigQuery_Table(config.projectId, config.datasetId_temp, config.tableId_procesos_temp, schema_Procesos, expire);
  Utilities.sleep(3000);

  Create_BigQuery_Table(config.projectId, config.datasetId_temp, config.tableId_interactions_temp, schema_Interactions, expire);
  Utilities.sleep(2000);

  const activeProcesses = Get_Procesos_Activos();
  console.log('Procesos Activos:', activeProcesses);

  let allAnswers = [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  const updatedAt = Utilities.formatDate(startDate, Session.getScriptTimeZone(), "yyyy-MM-dd");

  // Get respuestas por cada proceso activo
  activeProcesses.forEach(process => {  
    let currentPage = 1;
    let hasMorePages = true;
    
    // Fetch all pages of answers
    while (hasMorePages) {
      const response = Get_Respuestas_Proceso(process.id, { 
        updated_at: `${updatedAt}T00:00:00`,
        page: currentPage, 
        page_size: 100 
      });
      
      if (response && response.data) {
        const answersWithProcessName = response.data.map(answer => ({
          ...answer,
          process_name: process.name
        }));
        
        allAnswers = allAnswers.concat(answersWithProcessName); 
        
        hasMorePages = response.data.length === 100;
        currentPage++;
      } else {
        hasMorePages = false;
      }
    }
  });
    
  console.log(`\nTotal respuestas obtenidas: ${allAnswers.length}`);

  if (allAnswers.length > 0) {
    const rows = Generar_Respuestas_BQ(allAnswers);
    Stream_To_BigQuery(rows, config.projectId, config.datasetId_temp, config.tableId_answers_temp);
  }
    
  Utilities.sleep(1500);
  let res_preguntas = Merge_Preguntas (config.projectId, config.datasetId, config.datasetId_temp, config.tableId_answers, config.tableId_answers_temp)
  Logger.log(res_preguntas);
  
  Utilities.sleep(1500);
  let res_procesos = Merge_Procesos(config.projectId, config.datasetId, config.datasetId_temp, config.tableId_procesos, config.tableId_procesos_temp)
  Logger.log(res_procesos);


  // ---- Interactions sentimientos ----
  const updatedAtInteractions = `${updatedAt}T00:00:00`;

  const allInteractions = Get_All_Interactions({
    updated_at: updatedAtInteractions,
    page_size: 100,
    ai_metrics: true,
    ai_tagging: true,
    sort: 'updated_at'
  });

  console.log(`Total interacciones obtenidas: ${allInteractions.length}`);

  if (allInteractions.length > 0) {
    const rowsInteractions = Generar_Interacciones_BQ(allInteractions);
    Stream_To_BigQuery(rowsInteractions, config.projectId, config.datasetId_temp, config.tableId_interactions_temp);

    Utilities.sleep(1500);
    let res_interactions = Merge_Interactions(
      config.projectId,
      config.datasetId,
      config.datasetId_temp,
      config.tableId_interactions,
      config.tableId_interactions_temp
    );
    Logger.log(res_interactions);
  }
};
