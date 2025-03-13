from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import (
    User, Persona, PerfilMedico, CondicionPrevia, UsuarioCondicion, CategoriaAlimento, UnidadMedida, Alimento, PorcionAlimento,
    MinutaNutricional, ComidaDia, Receta, IngredienteReceta, DetalleMinuta, ImagenComida, RegistroComida, CentroMedico,
    ConsejoNutricional, Rol, UsuarioRol, Publicacion, Comentario, RespuestaComentario, AnalisisImagen, VinculoPacienteCuidador
)
from .serializers import (
    UserSerializer, PersonaSerializer, PerfilMedicoSerializer, CondicionPreviaSerializer, UsuarioCondicionSerializer, CategoriaAlimentoSerializer,
    UnidadMedidaSerializer, AlimentoSerializer, PorcionAlimentoSerializer, MinutaNutricionalSerializer, ComidaDiaSerializer,
    RecetaSerializer, IngredienteRecetaSerializer, DetalleMinutaSerializer, ImagenComidaSerializer, RegistroComidaSerializer,
    CentroMedicoSerializer, ConsejoNutricionalSerializer, RolSerializer, UsuarioRolSerializer, PublicacionSerializer,
    ComentarioSerializer, RespuestaComentarioSerializer, AnalisisImagenSerializer, VinculoPacienteCuidadorSerializer
)
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db import transaction
from django.contrib.auth.hashers import make_password
from datetime import datetime
from django.db.models import Prefetch, Count, F, Sum
from rest_framework.views import APIView

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
                     queryset=RegistroComida.objects.select_related('alimento', 'porcion')
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
                if reg.porcion:
                    porcion_data = {
                        'cantidad': float(reg.porcion.cantidad),
                        'unidad': reg.porcion.unidad.nombre if reg.porcion.unidad else 'unidad'
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

class ComidaDiaViewSet(viewsets.ModelViewSet):
    queryset = ComidaDia.objects.all()
    serializer_class = ComidaDiaSerializer
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

class ImagenComidaViewSet(viewsets.ModelViewSet):
    queryset = ImagenComida.objects.all()
    serializer_class = ImagenComidaSerializer
    permission_classes = [AllowAny]

class RegistroComidaViewSet(viewsets.ModelViewSet):
    queryset = RegistroComida.objects.all()
    serializer_class = RegistroComidaSerializer
    permission_classes = [AllowAny]

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
    queryset = RespuestaComentario.objects.all()
    serializer_class = RespuestaComentarioSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        """Allow filtering responses by comment or persona_id"""
        queryset = RespuestaComentario.objects.filter(activo=True).order_by('fecha_creacion')
        comentario_id = self.request.query_params.get('comentario')
        persona_id = self.request.query_params.get('id_persona')
        
        if comentario_id:
            queryset = queryset.filter(comentario=comentario_id)
        if persona_id:
            queryset = queryset.filter(id_persona=persona_id)
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
