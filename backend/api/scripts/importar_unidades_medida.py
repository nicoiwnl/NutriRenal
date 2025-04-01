from api.models import UnidadMedida

# Lista de unidades de medida para importar
unidades_medida = [
    {"nombre": "Taza", "equivalencia_ml": 200, "equivalencia_g": None, "es_volumen": True},
    {"nombre": "Vaso", "equivalencia_ml": 180, "equivalencia_g": None, "es_volumen": True},
    {"nombre": "Plato hondo", "equivalencia_ml": 250, "equivalencia_g": None, "es_volumen": True},
    {"nombre": "Plato normal", "equivalencia_ml": None, "equivalencia_g": None, "es_volumen": False},
    {"nombre": "Cucharada sopera", "equivalencia_ml": 10, "equivalencia_g": None, "es_volumen": True},
    {"nombre": "Cucharadita de té", "equivalencia_ml": 5, "equivalencia_g": None, "es_volumen": True},
    {"nombre": "Cajita de fósforos", "equivalencia_ml": None, "equivalencia_g": 30, "es_volumen": False},
    {"nombre": "Marraqueta (½ unidad)", "equivalencia_ml": None, "equivalencia_g": 50, "es_volumen": False},
    {"nombre": "Hallulla (½ unidad)", "equivalencia_ml": None, "equivalencia_g": 50, "es_volumen": False},
    {"nombre": "Pan molde (2½ rebanadas)", "equivalencia_ml": None, "equivalencia_g": 60, "es_volumen": False},
    {"nombre": "Pan integral (2½ rebanadas)", "equivalencia_ml": None, "equivalencia_g": 50, "es_volumen": False},
    {"nombre": "Cereal azucarado (1 taza)", "equivalencia_ml": None, "equivalencia_g": 40, "es_volumen": False},
    {"nombre": "Cereal sin azúcar (1 taza)", "equivalencia_ml": None, "equivalencia_g": 40, "es_volumen": False},
    {"nombre": "Granola (⅓ taza)", "equivalencia_ml": None, "equivalencia_g": 30, "es_volumen": False},
    {"nombre": "Arroz cocido (¾ taza)", "equivalencia_ml": None, "equivalencia_g": 130, "es_volumen": False},
    {"nombre": "Fideos cocidos (¾ taza)", "equivalencia_ml": None, "equivalencia_g": 110, "es_volumen": False},
    {"nombre": "Mote trigo (1 taza)", "equivalencia_ml": None, "equivalencia_g": 160, "es_volumen": False},
    {"nombre": "Choclo cocido desgranado (1 taza)", "equivalencia_ml": None, "equivalencia_g": 160, "es_volumen": False},
    {"nombre": "Espinaca cocida (½ taza)", "equivalencia_ml": None, "equivalencia_g": 130, "es_volumen": False},
    {"nombre": "Zanahoria cruda (1 taza)", "equivalencia_ml": None, "equivalencia_g": 50, "es_volumen": False},
    {"nombre": "Brócoli cocido (1 taza)", "equivalencia_ml": None, "equivalencia_g": 100, "es_volumen": False},
    {"nombre": "Poroto cocido (¾ taza)", "equivalencia_ml": None, "equivalencia_g": 140, "es_volumen": False},
    {"nombre": "Lentejas cocidas (¾ taza)", "equivalencia_ml": None, "equivalencia_g": 140, "es_volumen": False},
    {"nombre": "Huevo entero (1 unidad)", "equivalencia_ml": None, "equivalencia_g": 50, "es_volumen": False},
    {"nombre": "Huevo de codorniz (2 unidades)", "equivalencia_ml": None, "equivalencia_g": 25, "es_volumen": False},
    {"nombre": "Leche entera (1 taza)", "equivalencia_ml": 200, "equivalencia_g": None, "es_volumen": True},
    {"nombre": "Yogurt natural (1 unidad)", "equivalencia_ml": 150, "equivalencia_g": None, "es_volumen": True},
    {"nombre": "Queso gauda (2 láminas)", "equivalencia_ml": None, "equivalencia_g": 30, "es_volumen": False},
    {"nombre": "Queso parmesano rallado (5 cdtas)", "equivalencia_ml": None, "equivalencia_g": 25, "es_volumen": False},
    {"nombre": "Queso cottage (4 cdas)", "equivalencia_ml": None, "equivalencia_g": 80, "es_volumen": False},
    {"nombre": "Mayonesa (1 cucharada)", "equivalencia_ml": None, "equivalencia_g": 12, "es_volumen": False},
    {"nombre": "Aceite de oliva (1 cucharadita)", "equivalencia_ml": 5, "equivalencia_g": None, "es_volumen": True},
    {"nombre": "Mantequilla (1 cucharadita)", "equivalencia_ml": None, "equivalencia_g": 6, "es_volumen": False},
    {"nombre": "Helado (½ taza)", "equivalencia_ml": None, "equivalencia_g": 100, "es_volumen": False},
    {"nombre": "Frutillas (1 taza)", "equivalencia_ml": None, "equivalencia_g": 200, "es_volumen": False},
    {"nombre": "Uva (10 unidades)", "equivalencia_ml": None, "equivalencia_g": 90, "es_volumen": False},
    {"nombre": "Manzana (1 unidad chica)", "equivalencia_ml": None, "equivalencia_g": 100, "es_volumen": False},
    {"nombre": "Piña en rodaja (20x2 cm)", "equivalencia_ml": None, "equivalencia_g": 120, "es_volumen": False},
    {"nombre": "Jugo natural (¾ taza)", "equivalencia_ml": 150, "equivalencia_g": None, "es_volumen": True},
    {"nombre": "Cerveza (¾ lata)", "equivalencia_ml": 300, "equivalencia_g": None, "es_volumen": True},
    {"nombre": "Vino (1 vaso vinero)", "equivalencia_ml": 180, "equivalencia_g": None, "es_volumen": True},
]

def run():
    # Contador de registros creados
    creados = 0
    actualizados = 0
    
    for unidad in unidades_medida:
        obj, created = UnidadMedida.objects.update_or_create(
            nombre=unidad['nombre'],
            defaults={
                'equivalencia_ml': unidad['equivalencia_ml'],
                'equivalencia_g': unidad['equivalencia_g'],
                'es_volumen': unidad['es_volumen']
            }
        )
        if created:
            creados += 1
        else:
            actualizados += 1
    
    print(f"Proceso completado: {creados} unidades creadas, {actualizados} unidades actualizadas.")

if __name__ == "__main__":
    print("Este script debe ejecutarse desde el shell de Django.")
