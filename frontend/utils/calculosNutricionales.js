/**
 * Calcula las calorías necesarias para un paciente en base a sus características
 * Utiliza las ecuaciones de Harris-Benedict revisadas
 * 
 * @param {string} genero - 'Masculino' o 'Femenino'
 * @param {number} peso - Peso en kg
 * @param {number} altura - Altura en metros
 * @param {number} edad - Edad en años
 * @param {string} nivelActividad - 'sedentario', 'ligero', 'moderado', 'activo', 'muy_activo'
 * @param {boolean} ajusteRenal - Si debe aplicar ajuste para pacientes renales (reducción 10%)
 * @param {boolean} categorizar - Si debe redondear a categorías predefinidas
 * @returns {number} - Calorías diarias recomendadas
 */
export const calcularCalorias = (genero, peso, altura, edad, nivelActividad, ajusteRenal = true, categorizar = true) => {
  const factores = {
    'sedentario': 1.2,    'ligera': 1.375,    'ligero': 1.375,         // Alternativa
    'moderada': 1.55,        // Ejercicio moderado 3-5 días por semana
    'moderado': 1.55,        // Alternativa
    'alta': 1.725,           // Ejercicio intenso 6-7 días por semana
    'activo': 1.725,         // Alternativa
    'muy alta': 1.9,         // Ejercicio muy intenso o entrenamiento 2x/día
    'muy_activo': 1.9        // Alternativa
  };
  
  // Calcular TMB (Tasa Metabólica Basal) según la fórmula de Harris-Benedict
  let tmb;
  if (genero === 'Masculino' || genero.toLowerCase() === 'masculino') {
    tmb = 88.362 + (13.397 * peso) + (4.799 * altura * 100) - (5.677 * edad);
  } else {
    tmb = 447.593 + (9.247 * peso) + (3.098 * altura * 100) - (4.330 * edad);
  }
  
  // Aplicar factor de actividad
  const factor = factores[nivelActividad?.toLowerCase()] || factores.moderado;
  
  // Calcular calorías
  let calorias = tmb * factor;
  
  // Aplicar ajuste para pacientes renales (reducción de 10%)
  if (ajusteRenal) {
    calorias = calorias * 0.9;
  }
  
  // Redondear resultado
  const caloriasExactas = Math.round(calorias);
  
  // Si se solicita categorización, devolver también una categoría descriptiva
  if (categorizar) {
    let categoria;
    if (caloriasExactas < 1500) categoria = "bajo";
    else if (caloriasExactas >= 1500 && caloriasExactas < 2000) categoria = "moderado";
    else if (caloriasExactas >= 2000 && caloriasExactas < 2500) categoria = "medio";
    else categoria = "alto";
    
    return {
      calorias: caloriasExactas,
      categoria: categoria
    };
  }
  
  return caloriasExactas;
};

/**
 * Determina la categoría de minuta apropiada para las calorías dadas
 * @param {number} calorias - Calorías calculadas exactas
 * @returns {Object} - Categoría y diferencia
 */
export const determinarCategoriaCalorías = (calorias) => {
  const categoriasMinuta = [1400, 1600, 1800, 2000];
  let categoriaElegida = categoriasMinuta[0];
  let menorDiferencia = Math.abs(calorias - categoriasMinuta[0]);
  
  for (let i = 1; i < categoriasMinuta.length; i++) {
    const diferencia = Math.abs(calorias - categoriasMinuta[i]);
    if (diferencia < menorDiferencia) {
      menorDiferencia = diferencia;
      categoriaElegida = categoriasMinuta[i];
    }
  }
  
  return {
    categoria: categoriaElegida,
    diferencia: menorDiferencia,
    caloriasExactas: calorias
  };
};

