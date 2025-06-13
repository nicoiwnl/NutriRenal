from django.contrib import admin
from .models import (
    User, Persona, PerfilMedico, CondicionPrevia, UsuarioCondicion, 
    CategoriaAlimento, UnidadMedida, Alimento, PorcionAlimento,
    MinutaNutricional, ComidaTipo, Minuta, Receta, IngredienteReceta, 
    DetalleMinuta, RegistroComida, CentroMedico,
    ConsejoNutricional, Rol, UsuarioRol, Publicacion, Comentario, 
    RespuestaComentario, AnalisisImagen, VinculoPacienteCuidador,
    NutrienteMinuta, RestriccionAlimentos, RestriccionMinutaNutriente, MinutasRestricciones,
    Foro, ForoPersona, SeleccionesAnalisis
)

# User & Authentication
admin.site.register(User)
admin.site.register(Persona)
admin.site.register(PerfilMedico)

# Medical Conditions
admin.site.register(CondicionPrevia)
admin.site.register(UsuarioCondicion)

# Food & Nutrition
admin.site.register(CategoriaAlimento)
admin.site.register(UnidadMedida)
admin.site.register(Alimento)
admin.site.register(PorcionAlimento)
admin.site.register(MinutaNutricional)
admin.site.register(ComidaTipo)
admin.site.register(Minuta)
admin.site.register(Receta)
admin.site.register(IngredienteReceta)
admin.site.register(DetalleMinuta)
admin.site.register(RegistroComida)
admin.site.register(NutrienteMinuta)
admin.site.register(RestriccionAlimentos)
admin.site.register(RestriccionMinutaNutriente)
admin.site.register(MinutasRestricciones)

# Medical Centers
admin.site.register(CentroMedico)

# Nutritional Advice
admin.site.register(ConsejoNutricional)

# Roles & Permissions
admin.site.register(Rol)
admin.site.register(UsuarioRol)

# Patient-Caregiver Relationship
admin.site.register(VinculoPacienteCuidador)

# Image Analysis
admin.site.register(AnalisisImagen)

# Community - with enhanced admin features
class ComentarioInline(admin.TabularInline):
    model = Comentario
    extra = 0
    fields = ('id_persona', 'contenido', 'fecha_creacion', 'activo')
    readonly_fields = ('fecha_creacion',)

class RespuestaInline(admin.TabularInline):
    model = RespuestaComentario
    extra = 0
    fields = ('id_persona', 'contenido', 'fecha_creacion', 'activo')
    readonly_fields = ('fecha_creacion',)

@admin.register(Foro)
class ForoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'es_general', 'activo', 'fecha_creacion')
    list_filter = ('activo', 'es_general')
    search_fields = ('nombre', 'descripcion')
    readonly_fields = ('fecha_creacion',)

@admin.register(Publicacion)
class PublicacionAdmin(admin.ModelAdmin):
    list_display = ('asunto', 'id_persona', 'foro', 'fecha_creacion', 'comentarios_count', 'activo')
    list_filter = ('activo', 'fecha_creacion', 'foro')
    search_fields = ('asunto', 'contenido', 'id_persona__nombres', 'id_persona__apellidos')
    inlines = [ComentarioInline]
    readonly_fields = ('fecha_creacion', 'fecha_actualizacion')
    
    def comentarios_count(self, obj):
        return obj.comentarios.count()
    comentarios_count.short_description = 'Comentarios'

@admin.register(Comentario)
class ComentarioAdmin(admin.ModelAdmin):
    list_display = ('id', 'publicacion', 'id_persona', 'fecha_creacion', 'respuestas_count', 'activo')
    list_filter = ('activo', 'fecha_creacion')
    search_fields = ('contenido', 'id_persona__nombres', 'id_persona__apellidos')
    inlines = [RespuestaInline]
    readonly_fields = ('fecha_creacion', 'fecha_actualizacion')
    
    def respuestas_count(self, obj):
        return obj.respuestas.count()
    respuestas_count.short_description = 'Respuestas'

@admin.register(RespuestaComentario)
class RespuestaComentarioAdmin(admin.ModelAdmin):
    list_display = ('id', 'comentario', 'id_persona', 'fecha_creacion', 'activo')
    list_filter = ('activo', 'fecha_creacion')
    search_fields = ('contenido', 'id_persona__nombres', 'id_persona__apellidos')
    readonly_fields = ('fecha_creacion', 'fecha_actualizacion')

# Registrar el modelo SeleccionesAnalisis en el panel de administración
@admin.register(SeleccionesAnalisis)
class SeleccionesAnalisisAdmin(admin.ModelAdmin):
    list_display = ('id', 'analisis', 'alimento_original', 'alimento_seleccionado', 'unidad_medida', 'cantidad')
    list_filter = ('analisis', 'fecha_seleccion')
    search_fields = ('alimento_original', 'alimento_seleccionado__nombre')
    raw_id_fields = ('analisis', 'persona', 'alimento_seleccionado', 'unidad_medida')
    date_hierarchy = 'fecha_seleccion'