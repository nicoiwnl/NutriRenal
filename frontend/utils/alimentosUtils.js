// Diccionario de términos alimenticios chilenos
const terminosChilenos = {
  'papa': 'papa',
  'maiz': 'choclo',
  'mazorca de maíz': 'choclo',
  'frijol': 'poroto',
  'frijoles': 'porotos',
  'calabaza': 'zapallo',
  'aguacate': 'palta',
  'guisantes': 'arvejas',
  'chícharos': 'arvejas',
  'cacahuate': 'maní',
  'pastel': 'torta',
  'fresa': 'frutilla',
  // Añade más términos según necesites
};

// Función para adaptar los términos alimenticios al español chileno
export const adaptarTerminoChileno = (nombre) => {
  if (!nombre) return '';
  
  const nombreLower = nombre.toLowerCase();
  for (const [termino, chileno] of Object.entries(terminosChilenos)) {
    if (nombreLower.includes(termino.toLowerCase())) {
      return nombre.replace(new RegExp(termino, 'i'), chileno);
    }
  }
  return nombre;
};

export default {
  adaptarTerminoChileno,
  terminosChilenos
};
