// Este archivo proporciona datos de análisis simulados para usar mientras 
// el endpoint real no esté disponible

export const generateMockAnalisis = (userId) => {
  // Generar entre 3 y 5 análisis simulados
  const cantidad = Math.floor(Math.random() * 3) + 3;
  const analisis = [];
  
  for (let i = 0; i < cantidad; i++) {
    // Fecha aleatoria en los últimos 30 días
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    // Determinar compatibilidad aleatoriamente
    const compatible = Math.random() > 0.5;
    
    // Generar alimentos aleatorios
    const alimentos = ["arroz", "pollo", "ensalada", "huevo", "pan", "leche", "queso"];
    const alimentosSeleccionados = [];
    const numAlimentos = Math.floor(Math.random() * 3) + 1;
    
    for (let j = 0; j < numAlimentos; j++) {
      const randomIndex = Math.floor(Math.random() * alimentos.length);
      if (!alimentosSeleccionados.includes(alimentos[randomIndex])) {
        alimentosSeleccionados.push(alimentos[randomIndex]);
      }
    }
    
    // Generar valores nutricionales aleatorios
    const sodio = Math.floor(Math.random() * 1000) + 100;
    const potasio = Math.floor(Math.random() * 1500) + 200;
    const fosforo = Math.floor(Math.random() * 600) + 100;
    const proteinas = Math.floor(Math.random() * 40) + 5;
    
    analisis.push({
      id: `mock-${userId}-${i}-${Date.now()}`,
      id_persona: userId,
      fecha_analisis: date.toISOString(),
      conclusion: `Análisis de ${alimentosSeleccionados.join(", ")}`,
      compatible_con_perfil: compatible,
      url_imagen: null, // No hay imagen real disponible
      resultado: {
        alimentos_detectados: alimentosSeleccionados,
        texto_original: {
          alimentos_detectados: alimentosSeleccionados,
          totales: {
            sodio,
            potasio,
            fosforo,
            proteinas,
            energia: Math.floor(Math.random() * 800) + 200
          },
          recomendaciones: compatible 
            ? "Este alimento es adecuado para su consumo." 
            : "Se recomienda moderar el consumo de este alimento debido a sus niveles nutricionales.",
          compatibilidad_renal: compatible
        }
      }
    });
  }
  
  return analisis;
};
