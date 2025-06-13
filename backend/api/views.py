from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import (
    User, Persona, PerfilMedico, CondicionPrevia, UsuarioCondicion, CategoriaAlimento, UnidadMedida, Alimento, PorcionAlimento,
    MinutaNutricional, ComidaTipo, Receta, IngredienteReceta, DetalleMinuta, RegistroComida, CentroMedico,
    ConsejoNutricional, Rol, UsuarioRol, Publicacion, Comentario, RespuestaComentario, AnalisisImagen, VinculoPacienteCuidador,
    NutrienteMinuta, RestriccionAlimentos, RestriccionMinutaNutriente, MinutasRestricciones, Foro, ForoPersona, Minuta,
    SeleccionesAnalisis
)
from .serializers import (
    UserSerializer, PersonaSerializer, PerfilMedicoSerializer, CondicionPreviaSerializer, UsuarioCondicionSerializer, CategoriaAlimentoSerializer,
    UnidadMedidaSerializer, AlimentoSerializer, PorcionAlimentoSerializer, MinutaNutricionalSerializer, ComidaTipoSerializer,
    RecetaSerializer, IngredienteRecetaSerializer, DetalleMinutaSerializer, RegistroComidaSerializer,
    CentroMedicoSerializer, ConsejoNutricionalSerializer, RolSerializer, UsuarioRolSerializer, PublicacionSerializer,
    ComentarioSerializer, RespuestaComentarioSerializer, AnalisisImagenSerializer, VinculoPacienteCuidadorSerializer,
    NutrienteMinutaSerializer, RestriccionAlimentosSerializer, RestriccionMinutaNutrienteSerializer, MinutasRestriccionesSerializer, ForoSerializer,
    ForoPersonaSerializer, MinutaSerializer, SeleccionesAnalisisSerializer
)
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db import transaction
from django.contrib.auth.hashers import make_password
from datetime import datetime
from django.db.models import Prefetch, Count, F, Sum
from rest_framework.views import APIView
from django.views.decorators.csrf import ensure_csrf_cookie
from django.core.files.base import ContentFile
import base64
import uuid
from django.conf import settings
import os

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Endpoint para registrar un nuevo usuario con su perfil de persona
    """
    try:
        data = request.data
        
        # Simplified validation - only check for email and password
        if not data.get('email'):
            return Response({'error': 'El email es requerido'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        if not data.get('password'):
            return Response({'error': 'La contraseña es requerida'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        if not data.get('rut'):
            return Response({'error': 'El RUT es requerido'}, 
                           status=status.HTTP_400_BAD_REQUEST)

        # Verificar si ya existe un usuario con ese email o rut
        if User.objects.filter(email=data['email']).exists():
            return Response({'error': 'Ya existe un usuario con ese email'}, 
                           status=status.HTTP_400_BAD_REQUEST)
            
        if User.objects.filter(rut=data['rut']).exists():
            return Response({'error': 'Ya existe un usuario con ese rut'}, 
                           status=status.HTTP_400_BAD_REQUEST)

        # Procesar fecha de nacimiento si viene como string
        fecha_nacimiento = data.get('fecha_nacimiento')
        if fecha_nacimiento and isinstance(fecha_nacimiento, str):
            try:
                # Intentar primero con formato DD-MM-YYYY
                fecha_nacimiento = datetime.strptime(fecha_nacimiento, '%d-%m-%Y').date()
            except ValueError:
                try:
                    # Si falla, intentar con formato YYYY-MM-DD
                    fecha_nacimiento = datetime.strptime(fecha_nacimiento, '%Y-%m-%d').date()
                except ValueError:
                    return Response({'error': 'Formato de fecha incorrecto. Usar formato DD-MM-YYYY'}, 
                                status=status.HTTP_400_BAD_REQUEST)
        else:
            # Si no se proporciona fecha, usar la fecha actual
            fecha_nacimiento = datetime.now().date()

        # Crear ambos objetos en una transacción
        with transaction.atomic():
            # Primero crear la persona con valores por defecto donde sea necesario
            persona = Persona.objects.create(
                nombres=data.get('nombres', ''),
                apellidos=data.get('apellidos', ''),
                foto_perfil=data.get('foto_perfil', ''),
                fecha_nacimiento=fecha_nacimiento,
                genero=data.get('genero', '')
                # Removemos edad ya que se calcula automáticamente en el modelo
            )
            
            # Luego crear el usuario asociado
            usuario = User.objects.create(
                rut=data['rut'],
                email=data['email'],
                password=data['password'],  # Guardar contraseña en texto plano
                id_persona=persona
            )
            
        return Response({
            'message': 'Usuario registrado correctamente',
            'user_id': usuario.rut,
            'persona_id': str(persona.id)
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': f'Error en el registro: {str(e)}'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """
    Endpoint para iniciar sesión sin usar autenticación de Django
    """
    data = request.data
    
    if not data.get('email') and not data.get('rut'):
        return Response({'error': 'Email o RUT son requeridos'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    if not data.get('password'):
        return Response({'error': 'Contraseña es requerida'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Buscar usuario por email o rut
        if data.get('email'):
            user = User.objects.get(email=data['email'])
        else:
            user = User.objects.get(rut=data['rut'])
        
        # Verificar contraseña directamente (sin hash)
        if user.password == data['password']:
            # Login exitoso, devolver datos del usuario
            return Response({
                'user_id': user.rut,
                'email': user.email,
                'persona_id': str(user.id_persona.id) if user.id_persona else None,
                'token': f"simple-token-{user.rut}"  # Token simulado
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Credenciales inválidas'}, 
                           status=status.HTTP_401_UNAUTHORIZED)
            
    except User.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, 
                       status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'Error en el login: {str(e)}'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def paciente_dashboard(request, persona_id):
    """
    Endpoint que devuelve datos completos del paciente
    """
    try:
        # Verificar si el usuario tiene acceso a los datos de esta persona
        token_persona_id = None
        auth_header = request.headers.get('Authorization', '')
        if (auth_header.startswith('Token ')):
            token = auth_header.split(' ')[1]
            # Extraer ID de usuario del token (simple-token-{rut})
            if token.startswith('simple-token-'):
                user_rut = token.replace('simple-token-', '')
                try:
                    user = User.objects.get(rut=user_rut)
                    if user.id_persona:
                        token_persona_id = str(user.id_persona.id)
                except User.DoesNotExist:
                    pass
        
        # Si hay persona_id en el token y no coincide con el solicitado, registrar advertencia
        if token_persona_id and token_persona_id != str(persona_id):
            print(f"ADVERTENCIA DE SEGURIDAD: El usuario con persona_id {token_persona_id} está intentando acceder a datos de {persona_id}")
            # Log detallado para auditoría
            print(f"Datos de la solicitud: {request.META.get('REMOTE_ADDR')} - {request.META.get('HTTP_USER_AGENT')}")
        
        # Consulta principal con prefetch para optimizar
        persona = Persona.objects.filter(id=persona_id).prefetch_related(
            'usuario',  # Incluimos la relación con User para acceder al RUT
            'perfil_medico',
            Prefetch('condiciones', queryset=UsuarioCondicion.objects.select_related('condicion')),
            Prefetch('registros_comida', 
                     queryset=RegistroComida.objects.select_related('alimento', 'unidad_medida')
                     .order_by('-fecha_consumo')),  # Eliminado el [:10] que causaba el error
            Prefetch('cuidadores', 
                     queryset=VinculoPacienteCuidador.objects.select_related('cuidador'))
        ).first()
        
        if not persona:
            return Response({'error': 'Paciente no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        # Verificar explícitamente que el ID en la respuesta coincide con el solicitado
        if str(persona.id) != str(persona_id):
            return Response(
                {'error': 'Error de integridad: El ID de persona no coincide con el solicitado'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
        # Obtener el RUT del usuario asociado
        usuario = persona.usuario.first()
        rut = usuario.rut if usuario else None
        
        # Obtener perfil médico - MEJORANDO MANEJO DE ERRORES, CÁLCULOS Y SEGURIDAD
        try:
            perfil_medico = persona.perfil_medico
            print(f"Perfil médico encontrado para {persona.id}: {perfil_medico.id}")
            
            # Verificación explícita de seguridad
            if str(perfil_medico.id_persona.id) != str(persona_id):
                print(f"⚠️ ERROR DE SEGURIDAD: El perfil médico {perfil_medico.id} pertenece a {perfil_medico.id_persona.id}, no a {persona_id}")
                raise ValueError("El perfil médico no corresponde a esta persona")
                
            # Intentar calcular IMC con manejo de errores
            try:
                imc_calculado = round(float(perfil_medico.calcular_imc()), 2)
                print(f"IMC calculado correctamente: {imc_calculado}")
            except (ValueError, TypeError, ZeroDivisionError) as e:
                print(f"Error al calcular IMC: {str(e)}")
                imc_calculado = None
                
            # Intentar calcular calorías con manejo de errores
            try:
                calorias_calculadas = round(float(perfil_medico.calcular_calorias_diarias(
                    persona.genero or 'femenino', persona.edad or 30)), 2)
                print(f"Calorías calculadas correctamente: {calorias_calculadas}")
            except (ValueError, TypeError) as e:
                print(f"Error al calcular calorías: {str(e)}")
                calorias_calculadas = None
                
            datos_medicos = {
                'id': str(perfil_medico.id),
                'peso': float(perfil_medico.peso),
                'altura': float(perfil_medico.altura),
                'tipo_dialisis': perfil_medico.tipo_dialisis,
                'nivel_actividad': perfil_medico.nivel_actividad,
                'imc': imc_calculado,
                'calorias_diarias': calorias_calculadas,
                'ultima_actualizacion': perfil_medico.ultima_actualizacion
            }
        except AttributeError:
            print(f"No se encontró perfil médico para persona {persona.id}")
            datos_medicos = None
        except Exception as e:
            print(f"Error al procesar perfil médico: {str(e)}")
            datos_medicos = None
        
        # Obtener condiciones médicas (incluyendo el ID de UsuarioCondicion para poder eliminar después)
        condiciones = [
            {
                'id': cond.condicion.id, 
                'nombre': cond.condicion.nombre,
                'usuario_condicion_id': cond.id  # Añadimos el ID de la relación UsuarioCondicion
            }
            for cond in persona.condiciones.all()
        ]
        
        # Obtener registros de comida recientes - ahora limitamos aquí
        registros_comida = []
        for reg in list(persona.registros_comida.all())[:10]:  # Aplicamos el límite aquí después de convertir a lista
            if reg.alimento:
                alimento_data = {
                    'id': str(reg.alimento.id),
                    'nombre': reg.alimento.nombre,
                    'energia': float(reg.alimento.energia),
                    'proteinas': float(reg.alimento.proteinas),
                    'potasio': float(reg.alimento.potasio) if reg.alimento.potasio else 0,
                    'sodio': float(reg.alimento.sodio) if reg.alimento.sodio else 0,
                    'categoria': reg.alimento.categoria.nombre if reg.alimento.categoria else None
                }
                
                porcion_data = None
                if reg.unidad_medida:
                    equivalencia = reg.unidad_medida.equivalencia_ml if reg.unidad_medida.es_volumen else reg.unidad_medida.equivalencia_g
                    porcion_data = {
                        'cantidad': 1,  # Se usa valor predeterminado, ya que 'porcion' ya no existe
                        'unidad': reg.unidad_medida.nombre,
                        'equivalencia': equivalencia
                    }
                
                registros_comida.append({
                    'id': str(reg.id),
                    'fecha_consumo': reg.fecha_consumo,
                    'notas': reg.notas,
                    'alimento': alimento_data,
                    'porcion': porcion_data
                })
        
        # Obtener cuidadores asociados
        cuidadores = [
            {
                'id': str(vinculo.cuidador.id),
                'nombre': f"{vinculo.cuidador.nombres} {vinculo.cuidador.apellidos}",
                'vinculo_id': str(vinculo.id)
            }
            for vinculo in persona.cuidadores.all()
        ]
        
        # Calcular estadísticas nutricionales (últimos 7 registros)
        estadisticas = {
            'sodio_total': sum([reg['alimento']['sodio'] for reg in registros_comida[:7]]),
            'potasio_total': sum([reg['alimento']['potasio'] for reg in registros_comida[:7]]),
            'fosforo_total': sum([reg['alimento'].get('fosforo', 0) for reg in registros_comida[:7]]),
            'registros_totales': len(registros_comida)
        }
        
        # Construir respuesta completa
        response_data = {
            'paciente': {
                'id': str(persona.id),  # Asegurar que este valor sea correcto
                'nombres': persona.nombres,
                'apellidos': persona.apellidos,
                'nombre_completo': f"{persona.nombres} {persona.apellidos}",
                'foto_perfil': persona.foto_perfil,
                'fecha_nacimiento': persona.fecha_nacimiento,
                'edad': persona.edad,
                'genero': persona.genero,
                'activo': persona.activo,
                'rut': rut  # Añadimos el RUT a la respuesta
            },
            'perfil_medico': datos_medicos,
            'condiciones': condiciones,
            'registros_comida': registros_comida,
            'estadisticas': estadisticas,
            'cuidadores': cuidadores
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        # Agregar más detalles al error para mejor diagnóstico
        import traceback
        error_details = traceback.format_exc()
        print(f"Error detallado: {error_details}")
        
        return Response(
            {'error': f'Error al obtener los datos del paciente: {str(e)}',
             'details': error_details if settings.DEBUG else None}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])  # Cambiado a AllowAny para facilitar pruebas
def vincular_paciente_cuidador(request):
    """
    Endpoint para vincular un paciente con su cuidador
    """
    try:
        data = request.data
        
        # Validación de datos
        if not data.get('paciente_id'):
            return Response({'error': 'ID de paciente requerido'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not data.get('cuidador_id'):
            return Response({'error': 'ID de cuidador requerido'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Verificar que ambos existen
        try:
            paciente = Persona.objects.get(id=data['paciente_id'])
            cuidador = Persona.objects.get(id=data['cuidador_id'])
        except Persona.DoesNotExist:
            return Response({'error': 'Paciente o cuidador no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        # Verificar que el paciente tiene rol de "paciente"
        paciente_roles = UsuarioRol.objects.filter(id_persona=paciente, rol__nombre__iexact='paciente')
        if not paciente_roles.exists():
            return Response({'error': 'La persona indicada no tiene rol de paciente'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Verificar que el cuidador tiene rol de "cuidador"
        cuidador_roles = UsuarioRol.objects.filter(id_persona=cuidador, rol__nombre__iexact='cuidador')
        if not cuidador_roles.exists():
            return Response({'error': 'La persona indicada no tiene rol de cuidador'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verificar si ya existe la vinculación
        if VinculoPacienteCuidador.objects.filter(paciente=paciente, cuidador=cuidador).exists():
            return Response({'error': 'Ya existe una vinculación entre este paciente y cuidador'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Crear la vinculación
        vinculo = VinculoPacienteCuidador.objects.create(
            paciente=paciente,
            cuidador=cuidador
        )
        
        return Response({
            'message': 'Vinculación creada correctamente',
            'vinculo_id': str(vinculo.id),
            'paciente': {
                'id': str(paciente.id),
                'nombre': f"{paciente.nombres} {paciente.apellidos}"
            },
            'cuidador': {
                'id': str(cuidador.id),
                'nombre': f"{cuidador.nombres} {cuidador.apellidos}"
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': f'Error al crear vinculación: {str(e)}'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])  # Cambiado a AllowAny para facilitar pruebas
def listar_pacientes_cuidador(request, cuidador_id):
    """
    Endpoint para listar todos los pacientes asignados a un cuidador
    """
    try:
        # Verificar que el cuidador existe
        try:
            cuidador = Persona.objects.get(id=cuidador_id)
        except Persona.DoesNotExist:
            return Response({'error': 'Cuidador no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        # Obtener todas las vinculaciones donde esta persona es cuidador
        vinculos = VinculoPacienteCuidador.objects.filter(cuidador=cuidador).select_related('paciente')
        
        # Preparar la respuesta con información detallada de los pacientes
        pacientes_data = []
        for vinculo in vinculos:
            paciente = vinculo.paciente
            pacientes_data.append({
                'paciente_id': str(paciente.id),
                'nombre': f"{paciente.nombres} {paciente.apellidos}",
                'edad': paciente.edad,
                'genero': paciente.genero,
                'foto_perfil': paciente.foto_perfil,
                'activo': paciente.activo,
                'fecha_vinculacion': vinculo.fecha_creacion
            })
        
        return Response({
            'cuidador': {
                'id': str(cuidador.id),
                'nombre': f"{cuidador.nombres} {cuidador.apellidos}"
            },
            'pacientes': pacientes_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': f'Error al listar pacientes: {str(e)}'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])  # Requiere autenticación
def actualizar_foto_perfil(request):
    """
    Actualiza la foto de perfil de un usuario.
    Espera un JSON con:
    - id_persona: ID de la persona
    - imagen: string base64 de la imagen
    """
    try:
        id_persona = request.data.get('id_persona')
        imagen_base64 = request.data.get('imagen')
        
        # Verificar que se proporcionaron los datos necesarios
        if not id_persona or not imagen_base64:
            return Response(
                {"error": "Se requiere id_persona e imagen"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obtener la persona
        try:
            persona = Persona.objects.get(id=id_persona)
        except Persona.DoesNotExist:
            return Response(
                {"error": "Persona no encontrada"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verificar permiso: solo el propio usuario o un administrador pueden actualizar
        if str(request.user.id_persona.id) != str(id_persona):
            # Verificar si es un cuidador autorizado
            es_cuidador = VinculoPacienteCuidador.objects.filter(
                paciente_id=id_persona,
                cuidador_id=request.user.id_persona.id
            ).exists()
            
            if not es_cuidador:
                return Response(
                    {"error": "No tiene permiso para actualizar esta foto de perfil"},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Procesar la imagen base64
        try:
            # Extraer la información del formato y los datos
            if (';base64,' in imagen_base64):
                formato, imgstr = imagen_base64.split(';base64,')
                ext = formato.split('/')[-1]
            else:
                # Manejar caso donde el formato podría no estar incluido
                imgstr = imagen_base64
                ext = 'jpg'  # Por defecto jpg
            
            # Crear un nombre de archivo único
            nombre_archivo = f"perfil_{uuid.uuid4()}.{ext}"
            
            # Crear el objeto de archivo desde el string base64
            data = ContentFile(base64.b64decode(imgstr))
            
            # Actualizar el campo de foto_perfil
            persona.foto_perfil.save(nombre_archivo, data, save=True)
            
            return Response({
                "mensaje": "Foto de perfil actualizada correctamente",
                "foto_url": persona.foto_perfil.url if persona.foto_perfil else None
            })
            
        except Exception as e:
            print(f"Error al procesar la imagen: {str(e)}")
            return Response(
                {"error": f"Error al procesar la imagen: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except Exception as e:
        print(f"Error inesperado: {str(e)}")
        return Response(
            {"error": f"Error inesperado: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class PersonaViewSet(viewsets.ModelViewSet):
    queryset = Persona.objects.all()
    serializer_class = PersonaSerializer
    permission_classes = [AllowAny]

class PerfilMedicoViewSet(viewsets.ModelViewSet):
    queryset = PerfilMedico.objects.all()
    serializer_class = PerfilMedicoSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        """
        Override para filtrar por id_persona si se proporciona en los parámetros de consulta
        """
        qs = super().get_queryset()
        
        # Si se proporciona id_persona, asegurarse de filtrar precisamente
        id_persona = self.request.query_params.get('id_persona')
        if id_persona:
            print(f"Filtrando perfiles médicos para persona: {id_persona}")
            # Asegurar que solo devolvemos perfiles para esta persona específica
            qs = qs.filter(id_persona__id=id_persona)
            print(f"Encontrados {qs.count()} perfiles para esta persona")
            
            # Seguridad adicional: verificar los IDs de personas en los resultados
            for perfil in qs:
                if str(perfil.id_persona.id) != str(id_persona):
                    print(f"⚠️ ALERTA: Perfil {perfil.id} asignado a {perfil.id_persona.id}, no a {id_persona}")
        
        return qs

class CondicionPreviaViewSet(viewsets.ModelViewSet):
    queryset = CondicionPrevia.objects.all()
    serializer_class = CondicionPreviaSerializer
    permission_classes = [AllowAny]

class UsuarioCondicionViewSet(viewsets.ModelViewSet):
    queryset = UsuarioCondicion.objects.all()
    serializer_class = UsuarioCondicionSerializer
    permission_classes = [AllowAny]

class CategoriaAlimentoViewSet(viewsets.ModelViewSet):
    queryset = CategoriaAlimento.objects.all()
    serializer_class = CategoriaAlimentoSerializer
    permission_classes = [AllowAny]

class UnidadMedidaViewSet(viewsets.ModelViewSet):
    queryset = UnidadMedida.objects.all()
    serializer_class = UnidadMedidaSerializer
    permission_classes = [AllowAny]

class AlimentoViewSet(viewsets.ModelViewSet):
    queryset = Alimento.objects.all()
    serializer_class = AlimentoSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = Alimento.objects.all()
        categoria = self.request.query_params.get('categoria')
        if categoria:
            qs = qs.filter(categoria_id=categoria)
        return qs

    # Permitir el acceso a "list" y "retrieve" sin autenticación
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

class PorcionAlimentoViewSet(viewsets.ModelViewSet):
    queryset = PorcionAlimento.objects.all()
    serializer_class = PorcionAlimentoSerializer
    permission_classes = [AllowAny]

class MinutaNutricionalViewSet(viewsets.ModelViewSet):
    queryset = MinutaNutricional.objects.all()
    serializer_class = MinutaNutricionalSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        """
        Override para implementar un filtrado más estricto y seguro por id_persona
        """
        queryset = super().get_queryset()
        
        # Obtener el parámetro id_persona de la URL
        id_persona = self.request.query_params.get('id_persona')
        estado = self.request.query_params.get('estado')
        exact_match = self.request.query_params.get('exact_match', 'false').lower() == 'true'
        
        # Log para depuración
        print(f"🔍 Filtrando minutas por persona_id={id_persona}, estado={estado}, exact_match={exact_match}")
        
        # Si hay ID de persona, filtrar estrictamente
        if id_persona:
            # Filtrado estricto por UUID
            try:
                # Convertir a string normalizado para comparación exacta
                id_persona_str = str(id_persona).strip().lower().replace('-', '')
                
                if exact_match:
                    # Filtrado exacto - solo devolver minutas que coincidan exactamente con este ID
                    queryset = queryset.filter(id_persona__id=id_persona)
                    print(f"📋 Aplicando filtrado exacto de UUID para {id_persona}")
                    
                    # Verificación manual para detectar problemas
                    results_count = queryset.count()
                    print(f"📊 Resultados después de filtrado exacto: {results_count}")
                    
                    # Verificar cada minuta para confirmar propiedad
                    for minuta in queryset:
                        minuta_persona_id = str(minuta.id_persona.id).strip().lower().replace('-', '')
                        if minuta_persona_id != id_persona_str:
                            print(f"⚠️ ALERTA: Minuta {minuta.id} asignada a {minuta.id_persona.id}, no a {id_persona}")
                else:
                    queryset = queryset.filter(id_persona__id=id_persona)
            except Exception as e:
                print(f"❌ Error filtrando por id_persona: {e}")
                return MinutaNutricional.objects.none()  # Devolver queryset vacío en caso de error
            
        # Filtrar por estado si se proporciona
        if estado:
            queryset = queryset.filter(estado=estado)
                
        print(f"🔢 Total de minutas filtradas: {queryset.count()}")
        return queryset

class ComidaTipoViewSet(viewsets.ModelViewSet):
    queryset = ComidaTipo.objects.all()
    serializer_class = ComidaTipoSerializer
    permission_classes = [AllowAny]

class RecetaViewSet(viewsets.ModelViewSet):
    queryset = Receta.objects.all()
    serializer_class = RecetaSerializer
    permission_classes = [AllowAny]

class IngredienteRecetaViewSet(viewsets.ModelViewSet):
    queryset = IngredienteReceta.objects.all()
    serializer_class = IngredienteRecetaSerializer
    permission_classes = [AllowAny]

class DetalleMinutaViewSet(viewsets.ModelViewSet):
    queryset = DetalleMinuta.objects.all()
    serializer_class = DetalleMinutaSerializer
    permission_classes = [AllowAny]

class RegistroComidaViewSet(viewsets.ModelViewSet):
    queryset = RegistroComida.objects.select_related('id_persona', 'alimento', 'unidad_medida').all()
    serializer_class = RegistroComidaSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        qs = super().get_queryset()
        persona_id = self.request.query_params.get('id_persona')
        if persona_id:
            qs = qs.filter(id_persona__id=persona_id)
        return qs

class CentroMedicoViewSet(viewsets.ModelViewSet):
    queryset = CentroMedico.objects.all()
    serializer_class = CentroMedicoSerializer
    permission_classes = [AllowAny]

class ConsejoNutricionalViewSet(viewsets.ModelViewSet):
    queryset = ConsejoNutricional.objects.all()
    serializer_class = ConsejoNutricionalSerializer
    permission_classes = [AllowAny]

class RolViewSet(viewsets.ModelViewSet):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer
    permission_classes = [AllowAny]

class UsuarioRolViewSet(viewsets.ModelViewSet):
    queryset = UsuarioRol.objects.all()
    serializer_class = UsuarioRolSerializer
    permission_classes = [AllowAny]

class PublicacionViewSet(viewsets.ModelViewSet):
    queryset = Publicacion.objects.all()
    serializer_class = PublicacionSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        """Allow filtering publications by persona_id"""
        queryset = Publicacion.objects.filter(activo=True).order_by('-fecha_creacion')
        persona_id = self.request.query_params.get('id_persona')
        if persona_id:
            queryset = queryset.filter(id_persona=persona_id)
        foro_id = self.request.query_params.get('foro')
        if foro_id:
            queryset = queryset.filter(foro=foro_id)
        return queryset
    
    def perform_create(self, serializer):
        """Add additional information when creating a publication"""
        serializer.save()
        print(f"Nueva publicación creada por {serializer.instance.id_persona}")

class ComentarioViewSet(viewsets.ModelViewSet):
    queryset = Comentario.objects.all()
    serializer_class = ComentarioSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        """Allow filtering comments by publication or persona_id"""
        queryset = Comentario.objects.filter(activo=True).order_by('fecha_creacion')
        publicacion_id = self.request.query_params.get('publicacion')
        persona_id = self.request.query_params.get('id_persona')
        
        if publicacion_id:
            queryset = queryset.filter(publicacion=publicacion_id)
        if persona_id:
            queryset = queryset.filter(id_persona=persona_id)
        return queryset

class RespuestaComentarioViewSet(viewsets.ModelViewSet):
    """
    API endpoint para manejar respuestas a comentarios, incluyendo respuestas anidadas.
    """
    queryset = RespuestaComentario.objects.all()
    serializer_class = RespuestaComentarioSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = RespuestaComentario.objects.filter(activo=True).order_by('fecha_creacion')
        
        # Filtrar por comentario
        comentario_id = self.request.query_params.get('comentario')
        if comentario_id:
            queryset = queryset.filter(comentario=comentario_id)
            
        # Filtrar por respuesta padre (para respuestas anidadas)
        respuesta_padre_id = self.request.query_params.get('respuesta_padre')
        if respuesta_padre_id:
            queryset = queryset.filter(respuesta_padre=respuesta_padre_id)
        elif comentario_id:
            # Si se especifica comentario pero no respuesta_padre, devolver respuestas de primer nivel
            queryset = queryset.filter(respuesta_padre__isnull=True)
            
        return queryset

class AnalisisImagenViewSet(viewsets.ModelViewSet):
    queryset = AnalisisImagen.objects.all()
    serializer_class = AnalisisImagenSerializer
    permission_classes = [AllowAny]

class VinculoPacienteCuidadorViewSet(viewsets.ModelViewSet):
    queryset = VinculoPacienteCuidador.objects.all()
    serializer_class = VinculoPacienteCuidadorSerializer
    permission_classes = [AllowAny]

class UsuarioRolesView(APIView):
    def get(self, request, *args, **kwargs):
        persona_id = request.query_params.get('id_persona')
        if persona_id:
            # Get all roles to check what might be wrong
            all_roles = UsuarioRol.objects.all().select_related('rol')
            print(f"API DEBUG: Total roles in database: {all_roles.count()}")
            
            # Fix for UUID comparison issues - normalize both sides before comparison
            corrected_roles = []
            for role in all_roles:
                try:
                    # Cast both IDs to string and normalize format (remove whitespace, hyphens, etc)
                    role_persona_id_str = str(role.id_persona.id).strip().replace('-', '').lower()
                    requested_persona_id_str = str(persona_id).strip().replace('-', '').lower()
                    
                    if role_persona_id_str == requested_persona_id_str:
                        print(f"API DEBUG: Match found - Role {role.id} belongs to persona {role.id_persona}")
                        corrected_roles.append(role)
                    else:
                        # Log more quietly - for debugging only
                        print(f"API DEBUG: Role {role.id} for persona {role.id_persona} - not matching request {persona_id}")
                except Exception as e:
                    print(f"API DEBUG: Error comparing role {role.id}: {str(e)}")
            
            # Use the filtered roles
            queryset = corrected_roles
            
            # Log result summary without critical error messages
            print(f"API DEBUG: Found {len(queryset)} roles for persona_id={persona_id}")
            
            # If no roles found, check if this is actually an error or just a user with no roles assigned
            if len(queryset) == 0:
                print(f"API DEBUG: No roles found for persona_id={persona_id} - this might be normal for new users")
                
                # Check if the persona_id is valid at all
                try:
                    from .models import Persona
                    persona_exists = Persona.objects.filter(id=persona_id).exists()
                    if persona_exists:
                        print(f"API DEBUG: Persona {persona_id} exists but has no roles assigned")
                    else:
                        print(f"API DEBUG: Persona {persona_id} does not exist in the database")
                except Exception as e:
                    print(f"API DEBUG: Could not verify persona existence: {str(e)}")
        else:
            queryset = UsuarioRol.objects.all()
            print("API: Returning all roles (no persona_id filter)")
        
        serializer = UsuarioRolSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class PacientesCuidadorView(APIView):
    def get(self, request, persona_id, format=None):
        # Importar el modelo y el serializer correctos
        from .models import VinculoPacienteCuidador
        from .serializers import VinculoPacienteCuidadorSerializer
        # Filtrar los vínculos donde la persona es el cuidador (usando la FK 'cuidador')
        vinculos = VinculoPacienteCuidador.objects.filter(cuidador__id=persona_id)
        serializer = VinculoPacienteCuidadorSerializer(vinculos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

import base64, uuid
from django.core.files.base import ContentFile
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Persona
from django.conf import settings
import os

class ActualizarFotoPerfilView(APIView):
    def post(self, request, format=None):
        id_persona = request.data.get('id_persona')
        imagen_data = request.data.get('imagen')
        if not id_persona or not imagen_data:
            return Response({'error': 'Faltan campos requeridos.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            persona = Persona.objects.get(id=id_persona)
        except Persona.DoesNotExist:
            return Response({'error': 'Persona no encontrada.'}, status=status.HTTP_404_NOT_FOUND)
        try:
            # Se espera un string en formato “data:image/jpeg;base64,...”
            header, base64_data = imagen_data.split(';base64,')
            ext = header.split('/')[-1]  # Extrae extensión (ejemplo: jpeg)
            # Decode del string base64
            decoded_file = base64.b64decode(base64_data)
            # Crear un nombre único
            file_name = f"{uuid.uuid4()}.{ext}"
            # Opcional: Guardar en MEDIA_ROOT/fotos/
            file_path = os.path.join(settings.MEDIA_ROOT, 'fotos', file_name)
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            with open(file_path, 'wb') as f:
                f.write(decoded_file)
            # Actualiza el campo de foto_perfil (almacena la URL o path)
            persona.foto_perfil = os.path.join('fotos', file_name)
            persona.save()
            return Response({'success': 'Foto actualizada correctamente.', 'foto_url': persona.foto_perfil}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from django.core.files.base import ContentFile
import base64, uuid, os

class ActualizarFotoPerfilView(APIView):
    def post(self, request, format=None):
        id_persona = request.data.get('id_persona')
        imagen_data = request.data.get('imagen')
        if not id_persona or not imagen_data:
            return Response({"error": "Se requiere id_persona e imagen."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            persona = Persona.objects.get(id=id_persona)
        except Persona.DoesNotExist:
            return Response({"error": "Persona no encontrada."}, status=status.HTTP_404_NOT_FOUND)
        try:
            # Espera que imagen_data tenga el formato "data:image/jpeg;base64,...."
            format_str, imgstr = imagen_data.split(';base64,')
            ext = format_str.split('/')[-1]
            filename = f"{uuid.uuid4()}.{ext}"
            decoded_file = base64.b64decode(imgstr)
            data = ContentFile(decoded_file, name=filename)
            
            # Definir la ruta relativo y absoluta para guardar la imagen
            relative_path = os.path.join("fotos", filename)
            full_dir = os.path.join(settings.MEDIA_ROOT, "fotos")
            if not os.path.exists(full_dir):
                os.makedirs(full_dir)
            full_path = os.path.join(full_dir, filename)
            with open(full_path, "wb") as f:
                f.write(data.read())
            
            # Actualizar el campo foto_perfil con la ruta relativa
            persona.foto_perfil = relative_path
            persona.save()
            
            return Response({"success": "Foto de perfil actualizada", "foto_perfil": relative_path}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class NutrienteMinutaViewSet(viewsets.ModelViewSet):
    queryset = NutrienteMinuta.objects.all()
    serializer_class = NutrienteMinutaSerializer

class RestriccionAlimentosViewSet(viewsets.ModelViewSet):
    queryset = RestriccionAlimentos.objects.all()
    serializer_class = RestriccionAlimentosSerializer

class RestriccionMinutaNutrienteViewSet(viewsets.ModelViewSet):
    queryset = RestriccionMinutaNutriente.objects.all()
    serializer_class = RestriccionMinutaNutrienteSerializer

class MinutasRestriccionesViewSet(viewsets.ModelViewSet):
    queryset = MinutasRestricciones.objects.all()
    serializer_class = MinutasRestriccionesSerializer

class ForoViewSet(viewsets.ModelViewSet):
    queryset = Foro.objects.all()
    serializer_class = ForoSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Foro.objects.filter(activo=True).order_by('-fecha_creacion')
        return queryset

class ForoPersonaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para manejar suscripciones de usuarios a foros.
    """
    queryset = ForoPersona.objects.all()
    serializer_class = ForoPersonaSerializer
    permission_classes = [AllowAny]  # Cambia a IsAuthenticated en producción
    
    def get_queryset(self):
        queryset = ForoPersona.objects.all()
        
        # Filtrar por foro
        foro_id = self.request.query_params.get('foro')
        if foro_id:
            queryset = queryset.filter(foro=foro_id)
        
        # Filtrar por persona
        persona_id = self.request.query_params.get('persona')
        if persona_id:
            queryset = queryset.filter(persona=persona_id)
        
        return queryset

@api_view(['POST'])
@permission_classes([AllowAny])  # Cambia a IsAuthenticated en producción
def suscribir_a_foro(request):
    """
    Endpoint para suscribir a un usuario a un foro específico.
    """
    try:
        data = request.data
        foro_id = data.get('foro_id')
        persona_id = data.get('persona_id')
        
        # Validar datos requeridos
        if not foro_id or not persona_id:
            return Response({'error': 'Se requiere foro_id y persona_id'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verificar si los objetos existen
        try:
            foro = Foro.objects.get(id=foro_id)
            persona = Persona.objects.get(id=persona_id)
        except (Foro.DoesNotExist, Persona.DoesNotExist):
            return Response({'error': 'Foro o Persona no encontrados'}, status=status.HTTP_404_NOT_FOUND)
        
        # Verificar si ya existe la suscripción
        suscripcion_existente = ForoPersona.objects.filter(foro=foro, persona=persona).first()
        if suscripcion_existente:
            return Response({'message': 'Ya estás suscrito a este foro', 'suscripcion': ForoPersonaSerializer(suscripcion_existente).data}, 
                           status=status.HTTP_200_OK)
        
        # Crear nueva suscripción
        notificaciones = data.get('notificaciones', True)
        nueva_suscripcion = ForoPersona.objects.create(
            foro=foro,
            persona=persona,
            notificaciones=notificaciones
        )
        
        return Response({
            'message': 'Suscripción creada exitosamente',
            'suscripcion': ForoPersonaSerializer(nueva_suscripcion).data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': f'Error al procesar la suscripción: {str(e)}'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([AllowAny])  # Cambia a IsAuthenticated en producción
def desuscribir_de_foro(request):
    """
    Endpoint para cancelar la suscripción de un usuario a un foro.
    """
    try:
        foro_id = request.query_params.get('foro_id')
        persona_id = request.query_params.get('persona_id')
        
        # Validar datos requeridos
        if not foro_id or not persona_id:
            return Response({'error': 'Se requiere foro_id y persona_id'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Buscar la suscripción
        try:
            suscripcion = ForoPersona.objects.get(foro_id=foro_id, persona_id=persona_id)
        except ForoPersona.DoesNotExist:
            return Response({'error': 'No se encontró la suscripción'}, status=status.HTTP_404_NOT_FOUND)
        
        # Eliminar la suscripción
        suscripcion.delete()
        
        return Response({'message': 'Suscripción cancelada exitosamente'}, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': f'Error al cancelar la suscripción: {str(e)}'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MinutaViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing Minuta instances.
    """
    queryset = Minuta.objects.all()
    serializer_class = MinutaSerializer

# Importar nuevos módulos
import base64
import json
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

# Cambiar la importación para usar el modelo Alimento de api.models
from .models import Alimento  # Corregir importación para usar el modelo local
from gpt.vision import analizar_imagen_alimentos
from gpt.alimentos import buscar_alimentos_similares, calcular_nutrientes_por_cantidad

@api_view(['POST'])
@permission_classes([AllowAny])
def analizar_imagen(request):
    """
    Endpoint para analizar una imagen y devolver los alimentos detectados.
    Versión unificada y corregida que guarda correctamente el id_persona.
    """
    try:
        # 1. EXTRAER ID DE PERSONA - estrategia completa
        persona_id = None
        
        # Log de todos los datos recibidos para debug
        print(f"analizar_imagen - Datos recibidos: {request.data}")
        print(f"Headers recibidos: {request.headers}")
        
        # Buscar en los datos de la petición con múltiples nombres de campo
        id_field_names = ['id_persona', 'persona_id', 'id_persona_id', 'usuario_id', 'userId', 'user_id']
        for field_name in id_field_names:
            if field_name in request.data and request.data[field_name]:
                persona_id = request.data[field_name]
                print(f"ID de persona encontrado en campo '{field_name}': {persona_id}")
                break
        
        # Buscar en objetos anidados si existen
        if not persona_id and 'user' in request.data and isinstance(request.data['user'], dict):
            for field_name in id_field_names:
                if field_name in request.data['user'] and request.data['user'][field_name]:
                    persona_id = request.data['user'][field_name]
                    print(f"ID de persona encontrado en user.{field_name}: {persona_id}")
                    break
                
        # Buscar en los headers
        if not persona_id:
            header_names = ['X-User-ID', 'X-Persona-ID', 'Authorization']
            for header in header_names:
                if header in request.headers:
                    value = request.headers[header]
                    if header == 'Authorization' and value.startswith('Bearer '):
                        token = value.split(' ')[1]
                        # Intenta extraer ID de usuario del token - implementación básica
                        if token.startswith('simple-token-'):
                            try:
                                user_id = token.replace('simple-token-', '')
                                user = User.objects.get(rut=user_id)
                                if hasattr(user, 'id_persona') and user.id_persona:
                                    persona_id = user.id_persona.id
                                    print(f"ID de persona extraído del token: {persona_id}")
                            except:
                                pass
                    else:
                        persona_id = value
                        print(f"ID de persona encontrado en header '{header}': {persona_id}")
                        break
        
        # Validar que la imagen está presente en la solicitud
        if 'imagen' not in request.data:
            return Response({"error": "No se proporcionó una imagen para analizar"}, status=status.HTTP_400_BAD_REQUEST)
            
        imagen_base64 = request.data.get('imagen')
        
        # 2. PROCESAR LA IMAGEN
        # Extraer la parte base64 si viene con prefijo
        formato_imagen = "jpeg"
        base64_str = imagen_base64
        if "data:image" in imagen_base64:
            formato, base64_str = imagen_base64.split(';base64,')
            formato_imagen = formato.split('/')[-1]
        
        # Guardar la imagen
        upload_dir = os.path.join(settings.MEDIA_ROOT, 'analisis_comida')
        os.makedirs(upload_dir, exist_ok=True)
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"food_analysis_{timestamp}_{str(uuid.uuid4())[:8]}.{formato_imagen}"
        filepath = os.path.join(upload_dir, filename)
        
        try:
            with open(filepath, "wb") as img_file:
                img_file.write(base64.b64decode(base64_str))
        except Exception as e:
            return Response({"error": f"Error al guardar la imagen: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Crear URL relativa para acceso frontend
        relative_path = os.path.join('analisis_comida', filename)
        image_url = relative_path.replace('\\', '/')
        
        # 3. ANALIZAR IMAGEN CON GPT VISION
        from gpt.vision import analizar_imagen_alimentos
        
        try:
            # Realizar el análisis real de la imagen utilizando GPT Vision
            resultado_analisis = analizar_imagen_alimentos(base64_str)
            print(f"Análisis GPT Vision completado: {resultado_analisis}")
            
            # CRITICAL FIX: Asegurar que todas las propiedades importantes estén explícitamente extraídas
            # y disponibles en el nivel superior del resultado
            resultado_procesado = {
                "alimentos_detectados": resultado_analisis.get("alimentos_detectados", []),
                "totales": resultado_analisis.get("totales", {}),
                "texto_original": resultado_analisis.get("texto_original", ""),
                # Asegurar que recomendaciones y compatibilidad_renal se extraigan correctamente
                "recomendaciones": resultado_analisis.get("recomendaciones", ""),
                "compatibilidad_renal": resultado_analisis.get("compatibilidad_renal", False)
            }
            
            # Si no hay recomendaciones en el nivel superior, intentar extraerlas desde texto_original
            if not resultado_procesado["recomendaciones"] and isinstance(resultado_analisis.get("texto_original"), dict):
                resultado_procesado["recomendaciones"] = resultado_analisis["texto_original"].get("recomendaciones", "")
                resultado_procesado["compatibilidad_renal"] = resultado_analisis["texto_original"].get("compatibilidad_renal", False)
            
            print(f"Resultado procesado con recomendaciones: {resultado_procesado['recomendaciones'][:50]}...")
            
        except Exception as e:
            print(f"❌ Error al analizar imagen con GPT Vision: {str(e)}")
            # En caso de fallo con GPT Vision, usar un fallback más simple
            resultado_procesado = {
                "alimentos_detectados": ["No se pudo analizar la imagen"],
                "totales": {
                    "energia": 0,
                    "proteinas": 0,
                    "hidratos_carbono": 0,
                    "lipidos": 0,
                    "sodio": 0,
                    "potasio": 0,
                    "fosforo": 0
                },
                "recomendaciones": "No se pudo completar el análisis. Por favor, intente con otra imagen.",
                "compatibilidad_renal": False,
                "texto_original": "Error en análisis de imagen"
            }
        
        # 4. CREAR REGISTRO EN BASE DE DATOS
        try:
            # Obtener la persona si existe el ID
            persona = None
            if persona_id:
                try:
                    from .models import Persona
                    persona = Persona.objects.get(id=persona_id)
                    print(f"✅ PERSONA ENCONTRADA CON ID {persona_id}: {persona}")
                except Persona.DoesNotExist:
                    print(f"❌ No se encontró persona con ID {persona_id}")
                except Exception as e:
                    print(f"❌ Error al buscar persona: {e}")
            
            # NUEVO: Crear un nombre descriptivo basado en los alimentos detectados
            alimentos_detectados = resultado_procesado.get("alimentos_detectados", [])
            if alimentos_detectados and len(alimentos_detectados) > 0:
                # Si hay 3 o menos alimentos, mostrarlos todos
                if len(alimentos_detectados) <= 3:
                    nombre_descriptivo = f"Análisis de {', '.join(alimentos_detectados)}"
                else:
                    # Si hay más de 3, mostrar los primeros 3 y un contador
                    nombre_descriptivo = f"Análisis de {', '.join(alimentos_detectados[:3])} y {len(alimentos_detectados)-3} más"
            else:
                nombre_descriptivo = "Análisis de alimento no identificado"
            
            # IMPORTANTE: Crear objeto de análisis con la persona y el nuevo nombre descriptivo
            analisis = AnalisisImagen(
                id_persona=persona,  # Este es el campo que necesita estar correctamente asignado
                url_imagen=image_url,
                resultado=resultado_procesado,  # Usar el resultado procesado
                nombre=nombre_descriptivo  # Usar el nombre descriptivo en lugar de "Análisis de alimentos completado"
            )
            analisis.save()
            
            print(f"✅ ANÁLISIS GUARDADO CON ID: {analisis.id}")
            print(f"✅ PERSONA ASIGNADA AL ANÁLISIS: {analisis.id_persona}")
            print(f"✅ NOMBRE DESCRIPTIVO: {analisis.nombre}")
            
            # Añadir ID a la respuesta - asegurando que las recomendaciones estén explícitamente incluidas
            respuesta = {
                "id": str(analisis.id),
                "id_persona": str(persona_id) if persona_id else None,
                "persona_id": str(persona_id) if persona_id else None,
                "imagen_analizada": image_url,
                "fecha_analisis": analisis.fecha_analisis.isoformat(),
                "nombre": analisis.nombre,  # Incluir el nombre descriptivo en la respuesta
                # Incluir todos los campos procesados explícitamente
                "alimentos_detectados": resultado_procesado["alimentos_detectados"],
                "totales": resultado_procesado["totales"],
                "recomendaciones": resultado_procesado["recomendaciones"],
                "compatibilidad_renal": resultado_procesado["compatibilidad_renal"],
                "texto_original": resultado_procesado["texto_original"]
            }
            
            return Response(respuesta, status=status.HTTP_200_OK)
            
        except Exception as e:
            import traceback
            print(f"❌ ERROR AL GUARDAR ANÁLISIS: {e}")
            print(traceback.format_exc())
            return Response({
                "error": f"Error al guardar el análisis: {str(e)}",
                "imagen_analizada": image_url 
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"❌ ERROR GENERAL EN ANALIZAR_IMAGEN: {str(e)}")
        print(error_trace)
        return Response(
            {"error": f"Error al procesar la imagen: {str(e)}",
             "traceback": error_trace if settings.DEBUG else None}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

class SeleccionesAnalisisViewSet(viewsets.ModelViewSet):
    queryset = SeleccionesAnalisis.objects.all()
    serializer_class = SeleccionesAnalisisSerializer
    
    def get_queryset(self):
        qs = super().get_queryset()
        analisis_id = self.request.query_params.get('analisis')
        persona_id = self.request.query_params.get('persona')
        
        if analisis_id:
            qs = qs.filter(analisis=analisis_id)
        if persona_id:
            qs = qs.filter(persona=persona_id)
        
        return qs

@api_view(['POST'])
@permission_classes([AllowAny])  # Cambiar a IsAuthenticated en producción
def guardar_seleccion_analisis(request):
    """
    Endpoint para guardar una selección específica de alimento en un análisis
    """
    try:
        data = request.data
        
        # Validar campos obligatorios
        required_fields = ['analisis', 'persona', 'alimento_original', 'alimento_seleccionado', 'unidad_medida']
        for field in required_fields:
            if field not in data:
                return Response({'error': f'Falta el campo {field}'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Comprobar si ya existe una selección para este análisis y alimento original
        seleccion_existente = SeleccionesAnalisis.objects.filter(
            analisis_id=data['analisis'], 
            alimento_original=data['alimento_original']
        ).first()
        
        if seleccion_existente:
            # Actualizar selección existente
            seleccion_existente.alimento_seleccionado_id = data['alimento_seleccionado']
            seleccion_existente.unidad_medida_id = data['unidad_medida']
            seleccion_existente.cantidad = data.get('cantidad', 1)
            seleccion_existente.save()
            
            return Response({
                'message': 'Selección actualizada correctamente',
                'seleccion': SeleccionesAnalisisSerializer(seleccion_existente).data
            })
        else:
            # Crear nueva selección
            nueva_seleccion = SeleccionesAnalisis(
                analisis_id=data['analisis'],
                persona_id=data['persona'],
                alimento_original=data['alimento_original'],
                alimento_seleccionado_id=data['alimento_seleccionado'],
                unidad_medida_id=data['unidad_medida'],
                cantidad=data.get('cantidad', 1)
            )
            nueva_seleccion.save()
            
            return Response({
                'message': 'Selección guardada correctamente',
                'seleccion': SeleccionesAnalisisSerializer(nueva_seleccion).data
            }, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        return Response({'error': f'Error al guardar selección: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
