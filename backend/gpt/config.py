import os
from pathlib import Path
import logging
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# Obtener la ruta correcta al archivo .env y directorio base
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = os.path.join(BASE_DIR, '.env')
KEY_FILE = os.path.join(BASE_DIR, 'openai_key.txt')

# Función para obtener la API key de OpenAI desde todas las fuentes posibles
def get_openai_api_key():
    # 1. Intentar desde variable de entorno explícita
    api_key = os.environ.get("OPENAI_API_KEY")
    if api_key:
        logger.info("Usando API key de OpenAI desde variable de entorno")
        return api_key
        
    # 2. Intentar desde archivo openai_key.txt
    if os.path.exists(KEY_FILE):
        try:
            with open(KEY_FILE, 'r') as f:
                api_key = f.read().strip()
                if api_key:
                    logger.info("Usando API key de OpenAI desde archivo openai_key.txt")
                    return api_key
        except Exception as e:
            logger.error(f"Error leyendo openai_key.txt: {e}")
    
    # 3. Intentar desde .env
    if os.path.exists(ENV_FILE):
        try:
            load_dotenv(ENV_FILE)
            api_key = os.environ.get("OPENAI_API_KEY")
            if api_key:
                logger.info("Usando API key de OpenAI desde archivo .env")
                return api_key
        except Exception as e:
            logger.error(f"Error cargando .env: {e}")
    
    # 4. Clave predeterminada (desde settings.py)
    try:
        from django.conf import settings
        if hasattr(settings, 'OPENAI_API_KEY') and settings.OPENAI_API_KEY:
            logger.info("Usando API key de OpenAI desde settings.py")
            return settings.OPENAI_API_KEY
    except:
        pass
        
    # No se encontró API key
    logger.error("No se encontró API key de OpenAI en ninguna ubicación")
    return None

# Configuraciones para OpenAI
OPENAI_CONFIG = {
    "api_key": get_openai_api_key(),
    "vision_model": "gpt-4o",  # modelo actualizado que reemplaza a gpt-4-vision-preview
    "text_model": "gpt-4o",
    "max_tokens": int(os.environ.get('GPT_MAX_TOKENS', '4000')),
    "temperature": float(os.environ.get('GPT_TEMPERATURE', '0.2')),
    "timeout": int(os.environ.get('GPT_TIMEOUT', '60')),
}

# Verificar si tenemos API key
if not OPENAI_CONFIG["api_key"]:
    logger.critical("⚠️ NO SE ENCONTRÓ API KEY DE OPENAI - Las funciones de IA no funcionarán")
else:
    # Solo mostrar los primeros caracteres por seguridad
    key_preview = OPENAI_CONFIG["api_key"][:8] + "..." if OPENAI_CONFIG["api_key"] else ""
    logger.info(f"✅ API key de OpenAI configurada correctamente: {key_preview}")
