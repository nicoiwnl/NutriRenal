from django.db.models import Q
import Levenshtein

def buscar_alimentos_similares(nombre_alimento, modelo_alimento, umbral_similitud=0.75):
    """
    Busca alimentos similares en la base de datos usando búsqueda fuzzy
    
    Args:
        nombre_alimento: Nombre del alimento a buscar
        modelo_alimento: Modelo Django para la tabla de alimentos
        umbral_similitud: Score mínimo para considerar una coincidencia (0-1)
        
    Returns:
        list: Lista de alimentos que coinciden, ordenados por relevancia
    """
    # Primero intentamos búsqueda exacta
    resultados_exactos = modelo_alimento.objects.filter(
        Q(nombre__iexact=nombre_alimento),
        activo=True  # Asegurar que solo se busquen alimentos activos
    )
    
    if resultados_exactos.exists():
        return list(resultados_exactos)
    
    # Búsqueda por palabras contenidas
    resultados_parciales = modelo_alimento.objects.filter(
        Q(nombre__icontains=nombre_alimento),
        activo=True
    )
    
    if resultados_parciales.exists():
        # Si hay muchos resultados, limitamos
        if resultados_parciales.count() > 10:
            return list(resultados_parciales[:10])
        return list(resultados_parciales)
    
    # Si no hay resultados, hacemos búsqueda fuzzy
    todos_alimentos = modelo_alimento.objects.filter(activo=True)
    resultados_fuzzy = []
    
    for alimento in todos_alimentos:
        # Calcular distancia de Levenshtein normalizada
        max_len = max(len(nombre_alimento), len(alimento.nombre))
        if max_len == 0:
            continue
            
        distancia = Levenshtein.distance(nombre_alimento.lower(), alimento.nombre.lower())
        similitud = 1 - (distancia / max_len)
        
        if similitud >= umbral_similitud:
            resultados_fuzzy.append((alimento, similitud))
    
    # Ordenar por similitud y devolver solo los alimentos
    resultados_fuzzy.sort(key=lambda x: x[1], reverse=True)
    return [res[0] for res in resultados_fuzzy[:5]]  # Limitar a 5 resultados

def calcular_nutrientes_por_cantidad(alimento, cantidad_str):
    """
    Calcula los valores nutricionales según la cantidad especificada
    
    Args:
        alimento: Objeto alimento de la base de datos
        cantidad_str: String con cantidad y unidad (ej. "100g", "200ml")
        
    Returns:
        dict: Valores nutricionales ajustados
    """
    # Extraer número y unidad
    import re
    match = re.match(r'(\d+)(\w+)', cantidad_str)
    if not match:
        return None
        
    cantidad = float(match.group(1))
    unidad = match.group(2)
    
    # Factor de conversión según unidad
    factor = 1.0
    if unidad.lower() in ['g', 'gr', 'grs', 'gramos']:
        factor = cantidad / 100  # Base de datos usa valores por 100g
    elif unidad.lower() in ['ml', 'mls', 'mililitros']:
        # Aproximación: 1ml ≈ 1g para la mayoría de los líquidos
        factor = cantidad / 100
    else:
        # Unidad no reconocida, usar cantidad como factor directo
        factor = cantidad / 100
    
    # Calcular valores nutricionales ajustados - Adaptados a la tabla api_alimento
    valores = {
        # Macronutrientes principales
        "energia": round(float(alimento.energia or 0) * factor, 1),
        "proteinas": round(float(alimento.proteinas or 0) * factor, 1),
        "hidratos_carbono": round(float(alimento.hidratos_carbono or 0) * factor, 1),
        "lipidos": round(float(alimento.lipidos_totales or 0) * factor, 1),
        
        # Minerales críticos para pacientes renales
        "sodio": round(float(alimento.sodio or 0) * factor),
        "potasio": round(float(alimento.potasio or 0) * factor),
        "fosforo": round(float(alimento.fosforo or 0) * factor),
        
        # Información adicional que puede ser útil
        "azucares": round(float(alimento.azucares_totales or 0) * factor, 1),
        "fibra": round(float(alimento.fibra_dietetica or 0) * factor, 1),
    }
    
    return valores
