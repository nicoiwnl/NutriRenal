"""
Django settings for backend project.

Generated by 'django-admin startproject' using Django 5.1.6.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.1/ref/settings/
"""

from pathlib import Path
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-@b!j7+l224)2dug)23#x+ky+#yn#_0he&7y0#m(9oi&%z^443z'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1","192.168.100.37", "192.168.1.51", "192.168.1.42", "172.20.10.4", "192.168.1.18"]


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',  # Añadir esta línea
    'api',
    'corsheaders',
    'gpt',  # Añadir el módulo GPT
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',

]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'BD_SAFETYIRC',
        'USER': 'postgres',
        'PASSWORD': '1234',
        'HOST': 'localhost',  # O IP del servidor PostgreSQL
        'PORT': '5432',  # Puerto por defecto de PostgreSQL
    }
}



# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

# Cambiar la configuración de zona horaria para usar zona local de América/Santiago
TIME_ZONE = 'America/Santiago'  # Ajustar a tu zona horaria local

# Configurar para que Django no use timezone-aware dates automáticamente,
# esto hará que las fechas se traten como fechas locales
USE_TZ = False


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = '/static/'
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'backend' , 'static')]
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')


# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Si estás usando Django REST framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        # Comentar temporalmente para depuración
        # 'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',  # Cambiar a AllowAny para pruebas
    ],
}

# Configuración global de CORS para desarrollo
CORS_ALLOWED_ORIGINS = [
    'http://127.0.0.1:8081',     # Backend usando IP de la PC
    'http://127.0.0.1:8082',  
    'exp://192.168.100.37:8081',
    'exp://192.168.1.42:8081',
    'exp://172.20.10.4:8081',
    'exp://192.168.100.37:8081',
    'exp://192.168.1.18:8081'
]

# Asegurarse de que los directorios de media existan
import os
os.makedirs(os.path.join(MEDIA_ROOT, 'analisis_comida'), exist_ok=True)

# Configuración de OpenAI
from dotenv import load_dotenv

# Cargar variables desde .env si existe
load_dotenv()

# Configuración de OpenAI - buscar en múltiples fuentes
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')

# Si la clave no está en variables de entorno, intentar cargarla de un archivo local
if not OPENAI_API_KEY:
    try:
        with open(os.path.join(BASE_DIR, 'openai_key.txt'), 'r') as key_file:
            OPENAI_API_KEY = key_file.read().strip()
    except (FileNotFoundError, IOError):
        pass
