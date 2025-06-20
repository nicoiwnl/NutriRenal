from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    register_user, login_user, paciente_dashboard, vincular_paciente_cuidador, listar_pacientes_cuidador,
    UserViewSet, PersonaViewSet, PerfilMedicoViewSet, CondicionPreviaViewSet, UsuarioCondicionViewSet,
    CategoriaAlimentoViewSet, UnidadMedidaViewSet, AlimentoViewSet, PorcionAlimentoViewSet, MinutaNutricionalViewSet,
    ComidaTipoViewSet, RecetaViewSet, IngredienteRecetaViewSet, DetalleMinutaViewSet,
    RegistroComidaViewSet, CentroMedicoViewSet, ConsejoNutricionalViewSet, RolViewSet,
    UsuarioRolViewSet, UsuarioRolesView, PublicacionViewSet, ComentarioViewSet, RespuestaComentarioViewSet,
    AnalisisImagenViewSet, VinculoPacienteCuidadorViewSet, PacientesCuidadorView, ActualizarFotoPerfilView,
    NutrienteMinutaViewSet, RestriccionAlimentosViewSet, RestriccionMinutaNutrienteViewSet, MinutasRestriccionesViewSet,
    ForoViewSet, ForoPersonaViewSet, suscribir_a_foro, desuscribir_de_foro, MinutaViewSet, analizar_imagen,
    SeleccionesAnalisisViewSet, guardar_seleccion_analisis, analizar_ingredientes, AnalisisIngredientesViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'personas', PersonaViewSet)
router.register(r'perfiles-medicos', PerfilMedicoViewSet)
router.register(r'condiciones-previas', CondicionPreviaViewSet)
router.register(r'usuario-condiciones', UsuarioCondicionViewSet)
router.register(r'categorias-alimento', CategoriaAlimentoViewSet)
router.register(r'unidades-medida', UnidadMedidaViewSet)
router.register(r'alimentos', AlimentoViewSet)
router.register(r'porciones-alimento', PorcionAlimentoViewSet)
router.register(r'minutas-nutricionales', MinutaNutricionalViewSet)
router.register(r'comidas-tipo', ComidaTipoViewSet)
router.register(r'recetas', RecetaViewSet)
router.register(r'ingredientes-receta', IngredienteRecetaViewSet)
router.register(r'detalles-minuta', DetalleMinutaViewSet)
router.register(r'registros-comida', RegistroComidaViewSet)
router.register(r'centros-medicos', CentroMedicoViewSet)
router.register(r'consejos-nutricionales', ConsejoNutricionalViewSet)
router.register(r'roles', RolViewSet)
router.register(r'usuario-rol', UsuarioRolViewSet)
router.register(r'publicaciones', PublicacionViewSet)
router.register(r'comentarios', ComentarioViewSet)
router.register(r'respuestas-comentario', RespuestaComentarioViewSet)
router.register(r'analisis-imagen', AnalisisImagenViewSet)
router.register(r'vinculos-paciente-cuidador', VinculoPacienteCuidadorViewSet)
router.register(r'nutrientes-minuta', NutrienteMinutaViewSet)
router.register(r'restricciones-alimentos', RestriccionAlimentosViewSet)
router.register(r'restricciones-minuta-nutrientes', RestriccionMinutaNutrienteViewSet)
router.register(r'minutas-restricciones', MinutasRestriccionesViewSet)
router.register(r'foros', ForoViewSet)
router.register(r'foro-suscripciones', ForoPersonaViewSet)
router.register(r'minutas', MinutaViewSet)
router.register(r'selecciones-analisis', SeleccionesAnalisisViewSet)
router.register(r'analisis-ingredientes', AnalisisIngredientesViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', register_user, name='register'),
    path('token/', login_user, name='token'),
    path('paciente-dashboard/<uuid:persona_id>/', paciente_dashboard, name='paciente_dashboard'),
    path('vincular-paciente-cuidador/', vincular_paciente_cuidador, name='vincular_paciente_cuidador'),
    path('pacientes-cuidador/<uuid:cuidador_id>/', listar_pacientes_cuidador, name='pacientes_cuidador'),
    path('usuario-roles/', UsuarioRolesView.as_view(), name='usuario_roles'),
    path('pacientes-por-cuidador/<uuid:persona_id>/', PacientesCuidadorView.as_view(), name='pacientes_por_cuidador'),
    path('actualizar-foto-perfil/', ActualizarFotoPerfilView.as_view(), name='actualizar-foto-perfil'),
    path('suscribir-foro/', suscribir_a_foro, name='suscribir_foro'),
    path('desuscribir-foro/', desuscribir_de_foro, name='desuscribir_foro'),
    path('analizar-imagen/', analizar_imagen, name='analizar_imagen'),
    path('guardar-seleccion-analisis/', guardar_seleccion_analisis, name='guardar_seleccion_analisis'),
    path('analizar-ingredientes/', analizar_ingredientes, name='analizar_ingredientes'),
]
