import os
import base64
import json
import logging
from .config import OPENAI_CONFIG

# Configurar logging
logger = logging.getLogger(__name__)

# Detectar la versión de OpenAI y usar la importación adecuada
try:
    # Intentar importación de la versión nueva (1.0.0+)
    from openai import OpenAI, APIError, RateLimitError, AuthenticationError
    USING_NEW_API = True
    logger.info("Usando la API de OpenAI v1.0.0+")
except ImportError:
    # Fallback para la versión anterior
    import openai
    from openai.error import APIError, RateLimitError, AuthenticationError
    USING_NEW_API = False
    logger.info("Usando la API de OpenAI anterior a v1.0.0")

def analizar_imagen_alimentos(image_data, api_key=None):
    """
    Analiza una imagen de alimentos utilizando la API de Vision de OpenAI.
    Compatible con versiones anteriores y posteriores a 1.0.0 de la biblioteca.
    
    Args:
        image_data: Datos de la imagen en base64
        api_key: Clave API opcional, si no se proporciona usará la del config
    
    Returns:
        dict: Resultados del análisis de la imagen
    """
    try:
        # Verificar API key - usar la proporcionada o la del config
        if not api_key:
            api_key = OPENAI_CONFIG["api_key"]
            if not api_key:
                raise ValueError("No se encontró API key para OpenAI en ninguna ubicación")
        
        # Prompt para el análisis de alimentos
        prompt = """
        Analiza esta imagen de alimentos e identifica los siguientes aspectos:
        1. ¿Qué alimentos están presentes en la imagen? (Recuerda usar nombres comunes Chilenos como por ejemplo de spaghetti por fideos o tallarines)
        2. Estima los valores nutricionales aproximados del plato o alimento principal: 
           calorías, sodio (mg), potasio (mg), fósforo (mg), proteínas (g)
        3. ¿Esta comida es adecuada para personas con enfermedad renal crónica? , 
        Para definir si es adecuada recuerda tener en cuenta la porcion de la comida y los dias que podria comer eso una sola vez y multiples veces 
        sin problemas, pero define si es positivo o negativo solo por una vez pero detallalo en la recomendacion .
        
        Formatea tu respuesta como un JSON con los siguientes campos:
        {
          "alimentos_detectados": [lista de alimentos],
          "totales": {
            "energia": valor_calorias,
            "sodio": valor_sodio,
            "potasio": valor_potasio,
            "fosforo": valor_fosforo,
            "proteinas": valor_proteinas
          },
          "recomendaciones": "texto con recomendaciones para pacientes renales",
          "compatibilidad_renal": booleano
        }
        """
        
        # Usar el modelo desde la configuración
        vision_model = OPENAI_CONFIG["vision_model"]
        max_tokens = OPENAI_CONFIG["max_tokens"]
        
        logger.info(f"Usando modelo: {vision_model} con max_tokens={max_tokens}")
        
        # Lógica diferente según la versión de la API
        if USING_NEW_API:
            # Versión nueva (1.0.0+)
            client = OpenAI(api_key=api_key)
            response = client.chat.completions.create(
                model=vision_model,
                messages=[
                    {"role": "system", "content": "Eres un nutricionista especializado en enfermedad renal."},
                    {"role": "user", "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_data}"}}
                    ]}
                ],
                max_tokens=max_tokens,
                temperature=OPENAI_CONFIG["temperature"]
            )
            result_text = response.choices[0].message.content
            
        else:
            # Versión antigua (pre-1.0.0)
            openai.api_key = api_key
            response = openai.ChatCompletion.create(
                model=vision_model,
                messages=[
                    {"role": "system", "content": "Eres un nutricionista especializado en enfermedad renal."},
                    {"role": "user", "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": f"data:image/jpeg;base64,{image_data}"}
                    ]}
                ],
                max_tokens=max_tokens,
                temperature=OPENAI_CONFIG["temperature"]
            )
            result_text = response.choices[0].message['content']
        
        # Guardar el texto original para referencia
        texto_original = result_text
        
        # Extraer el JSON de la respuesta
        try:
            # Primero intentar analizar directamente
            result_json = json.loads(result_text)
            
        except json.JSONDecodeError:
            # Si falla, intentar extraer solo la parte JSON
            import re
            json_match = re.search(r'```json\n(.*?)\n```', result_text, re.DOTALL)
            if json_match:
                try:
                    result_json = json.loads(json_match.group(1))
                except:
                    raise ValueError(f"No se pudo extraer JSON válido de la respuesta: {result_text}")
            else:
                raise ValueError(f"No se pudo extraer JSON válido de la respuesta: {result_text}")
        
        # Agregar el texto original a los resultados
        result_json["texto_original"] = texto_original
        
        return result_json
        
    except (APIError, RateLimitError, AuthenticationError) as e:
        error_msg = f"Error de autenticación con OpenAI: {str(e)}"
        logger.error(error_msg)
        raise Exception(error_msg)
    except Exception as e:
        error_msg = f"Error procesando la imagen: {str(e)}"
        logger.error(error_msg)
        raise Exception(error_msg)

def analizar_ingredientes_alimentos(image_data, api_key=None):
    """
    Analiza una imagen de ingredientes utilizando la API de Vision de OpenAI.
    
    Args:
        image_data: Datos de la imagen en base64
        api_key: Clave API opcional, si no se proporciona usará la del config
    
    Returns:
        dict: Resultados del análisis de los ingredientes
    """
    try:
        # Verificar API key - usar la proporcionada o la del config
        if not api_key:
            api_key = OPENAI_CONFIG["api_key"]
            if not api_key:
                raise ValueError("No se encontró API key para OpenAI en ninguna ubicación")
        
        # Prompt específico para análisis de ingredientes en etiquetas de productos
        prompt = """
        Analiza esta imagen de una etiqueta de ingredientes y proporciona la siguiente información:
        1. Identifica el nombre del producto si está disponible
        2. Extrae la lista completa de ingredientes
        3. Identifica qué ingredientes podrían ser problemáticos para pacientes con enfermedad renal crónica, especificando por qué
        4. Proporciona una recomendación general sobre si el producto es adecuado para pacientes renales
        
        Presta especial atención a ingredientes como:
        - Alto contenido de sodio, potasio o fósforo
        - Aditivos y conservantes que puedan afectar la función renal
        - Ingredientes artificiales o procesados que puedan ser perjudiciales
        
        Formatea tu respuesta como un JSON con los siguientes campos:
        {
          "nombre_producto": "Nombre del producto (si está visible)",
          "ingredientes_detectados": [
            {
              "nombre": "nombre_ingrediente",
              "descripcion": "breve descripción del ingrediente"
            }
          ],
          "ingredientes_riesgo": [
            {
              "nombre": "nombre_ingrediente",
              "motivo": "razón por la que es problemático para pacientes renales"
            }
          ],
          "recomendacion": "texto con recomendaciones específicas para el paciente renal",
          "es_recomendado": true/false
        }
        """
        
        # Usar el modelo desde la configuración
        vision_model = OPENAI_CONFIG["vision_model"]
        max_tokens = OPENAI_CONFIG["max_tokens"]
        
        logger.info(f"Usando modelo para análisis de ingredientes: {vision_model} con max_tokens={max_tokens}")
        
        # Lógica diferente según la versión de la API
        if USING_NEW_API:
            # Versión nueva (1.0.0+)
            client = OpenAI(api_key=api_key)
            response = client.chat.completions.create(
                model=vision_model,
                messages=[
                    {"role": "system", "content": "Eres un nutricionista especialista en enfermedad renal crónica."},
                    {"role": "user", "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_data}"}}
                    ]}
                ],
                max_tokens=max_tokens,
                temperature=OPENAI_CONFIG["temperature"]
            )
            result_text = response.choices[0].message.content
            
        else:
            # Versión antigua (pre-1.0.0)
            openai.api_key = api_key
            response = openai.ChatCompletion.create(
                model=vision_model,
                messages=[
                    {"role": "system", "content": "Eres un nutricionista especialista en enfermedad renal crónica."},
                    {"role": "user", "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": f"data:image/jpeg;base64,{image_data}"}
                    ]}
                ],
                max_tokens=max_tokens,
                temperature=OPENAI_CONFIG["temperature"]
            )
            result_text = response.choices[0].message['content']
        
        # Guardar el texto original para referencia
        texto_original = result_text
        
        # Extraer el JSON de la respuesta
        try:
            # Primero intentar analizar directamente
            result_json = json.loads(result_text)
            
        except json.JSONDecodeError:
            # Si falla, intentar extraer solo la parte JSON
            import re
            json_match = re.search(r'```json\n(.*?)\n```', result_text, re.DOTALL)
            if json_match:
                try:
                    result_json = json.loads(json_match.group(1))
                except:
                    raise ValueError(f"No se pudo extraer JSON válido de la respuesta: {result_text}")
            else:
                raise ValueError(f"No se pudo extraer JSON válido de la respuesta: {result_text}")
        
        # Agregar el texto original a los resultados
        result_json["texto_original"] = texto_original
        
        return result_json
        
    except (APIError, RateLimitError, AuthenticationError) as e:
        error_msg = f"Error de autenticación con OpenAI: {str(e)}"
        logger.error(error_msg)
        raise Exception(error_msg)
    except Exception as e:
        error_msg = f"Error procesando la imagen de ingredientes: {str(e)}"
        logger.error(error_msg)
        raise Exception(error_msg)
