import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ScrollView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../api';
import { ENDPOINTS } from '../../../config/apiConfig';
import {formatMinerales } from '../../../utils/formatUtils';

/**
 * Componente para seleccionar una variante específica de un alimento
 */
const AlimentoSeleccionPrecisa = ({ 
  visible, 
  onClose, 
  alimentoGenerico, 
  onSelectAlimento,
  titulo = "Seleccionar tipo específico",
  analisisId = null,
  // Prop para recibir unidades desde componente padre
  unidadesMedidaProp = null 
}) => {
  const [loading, setLoading] = useState(true);
  const [variantes, setVariantes] = useState([]);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('select-food');
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [cantidad, setCantidad] = useState('1');
  const [ajustedNutrientes, setAjustedNutrientes] = useState(null);
  // Inicializar con un array vacío hasta cargar desde la API
  const [unidadesMedida, setUnidadesMedida] = useState([]);
  const [loadingUnidades, setLoadingUnidades] = useState(false);
  
  // Nuevo estado para controlar el modal de selección de unidades
  const [showUnitModal, setShowUnitModal] = useState(false);
  
  // Nuevos estados para mejorar la búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [initialSearchDone, setInitialSearchDone] = useState(false);
  const [currentAlimentoGenerico, setCurrentAlimentoGenerico] = useState(''); // Nuevo para tracking
  
  const isMounted = useRef(true);
  const controllerRef = useRef(null);
  const searchPerformed = useRef(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      // Cancel any in-flight requests
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, []);
  
  // Función para cerrar el teclado
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // NUEVA IMPLEMENTACIÓN MEJORADA PARA BUSCAR TÉRMINOS COMPUESTOS
  const buscarAlimentos = async (termino, categoriaId = null, mostrarTodos = false) => {
    if (!termino && !mostrarTodos) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      let resultados = [];
      
      // Si se solicita mostrar todos o es una categoría específica sin término de búsqueda
      if (mostrarTodos || (categoriaId && !termino)) {
        // Construir URL para obtener todos los alimentos de la categoría o todos los alimentos
        let url = '/alimentos/';
        if (categoriaId) {
          url += `?categoria=${categoriaId}`;
        }
        
        const response = await api.get(url);
        
        if (response.data && Array.isArray(response.data)) {
          resultados = response.data;
        }
      } 
      // Búsqueda normal por término
      else if (termino) {
        resultados = await buscarTerminoExacto(termino, categoriaId);
        
        if (resultados.length < 3 && termino.includes(' ')) {
          const resultadosAdicionales = await buscarPorPalabrasSeparadas(termino, categoriaId);
          
          const todosResultados = [...resultados];
          
          resultadosAdicionales.forEach(item => {
            if (!todosResultados.some(r => r.id === item.id)) {
              todosResultados.push(item);
            }
          });
          
          resultados = todosResultados;
        }
      }
      
      const resultadosOrdenados = termino ? ordenarPorRelevancia(resultados, termino) : resultados;
      
      setVariantes(resultadosOrdenados);
    } catch (error) {
      console.error("ERROR API:", error);
      setError("Error al buscar alimentos. Intenta nuevamente.");
      setVariantes([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Nueva función auxiliar para buscar término exacto
  const buscarTerminoExacto = async (termino, categoriaId) => {
    try {
      let url = `/alimentos/?search=${encodeURIComponent(termino)}`;
      if (categoriaId) {
        url += `&categoria=${categoriaId}`;
      }
      
      const response = await api.get(url);
      
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error en búsqueda de término exacto:', error);
      return [];
    }
  };
  
  // Nueva función auxiliar para buscar por palabras separadas
  const buscarPorPalabrasSeparadas = async (termino, categoriaId) => {
    const palabras = termino.split(' ').filter(p => p.length > 2);
    const resultados = [];
    
    try {
      // Buscar para cada palabra individualmente
      for (const palabra of palabras) {
        let url = `/alimentos/?search=${encodeURIComponent(palabra)}`;
        if (categoriaId) {
          url += `&categoria=${categoriaId}`;
        }
        
        const response = await api.get(url);
        
        if (response.data && Array.isArray(response.data)) {
          // Añadir resultados evitando duplicados
          response.data.forEach(item => {
            if (!resultados.some(r => r.id === item.id)) {
              resultados.push(item);
            }
          });
        }
      }
      
      return resultados;
    } catch (error) {
      console.error('Error en búsqueda por palabras separadas:', error);
      return resultados; // Devolver lo que tengamos hasta ahora
    }
  };
  
  // Nueva función para ordenar resultados por relevancia
  const ordenarPorRelevancia = (resultados, termino) => {
    const terminoLower = termino.toLowerCase();
    const palabras = terminoLower.split(' ').filter(p => p.length > 2);
    
    return [...resultados].sort((a, b) => {
      const aName = a.nombre.toLowerCase();
      const bName = b.nombre.toLowerCase();
      
      if (aName === terminoLower && bName !== terminoLower) return -1;
      if (bName === terminoLower && aName !== terminoLower) return 1;
      
      if (aName.includes(terminoLower) && !bName.includes(terminoLower)) return -1;
      if (bName.includes(terminoLower) && !aName.includes(terminoLower)) return 1;
      
      const aMatchCount = palabras.filter(p => aName.includes(p)).length;
      const bMatchCount = palabras.filter(p => bName.includes(p)).length;
      
      if (aMatchCount > bMatchCount) return -1;
      if (bMatchCount > aMatchCount) return 1;
      
      return aName.length - bName.length;
    });
  };
  
  // Función para limpiar y resetear el componente
  const resetComponentState = () => {
    setVariantes([]);
    setSelectedFood(null);
    setSelectedUnit(null);
    setCantidad('1');
    setStep('select-food');
    setAjustedNutrientes(null);
  };

  //Efecto para detectar cambios en el alimento genérico
  useEffect(() => {
    if (visible) {
      // Si el alimento genérico cambió, resetear todo
      if (alimentoGenerico && alimentoGenerico !== currentAlimentoGenerico) {
        resetComponentState();
        setCurrentAlimentoGenerico(alimentoGenerico);
        setSearchQuery(alimentoGenerico);
        
        // Ejecutar búsqueda inmediatamente con el nuevo alimento - SOLO coincidencias estrictas
        buscarAlimentos(alimentoGenerico, null, false);
      } else if (alimentoGenerico && !currentAlimentoGenerico) {
        // Primera apertura del modal
        setCurrentAlimentoGenerico(alimentoGenerico);
        setSearchQuery(alimentoGenerico);
        
        // Ejecutar búsqueda inmediatamente - SOLO coincidencias estrictas
        buscarAlimentos(alimentoGenerico, null, false);
      }
    } else {
      if (!visible && currentAlimentoGenerico) {
        // Modal cerrado
      }
    }
  }, [visible, alimentoGenerico, currentAlimentoGenerico]);
  
  //Efecto para limpiar todo cuando se cierra el modal
  useEffect(() => {
    if (!visible) {
      // Mantener solo currentAlimentoGenerico para comparar en la próxima apertura
      setVariantes([]);
      setSelectedFood(null);
      setSelectedUnit(null);
      setStep('select-food');
      setAjustedNutrientes(null);
    }
  }, [visible]);
  
  // Búsqueda por categoría
  const buscarPorCategoria = (categoria) => {
    setSelectedCategoria(categoria);
    if (categoria) {
      // Si selecciona una categoría, mostrar todos los alimentos de esa categoría
      buscarAlimentos(searchQuery, categoria?.id, !searchQuery);
    } else {
      // Si selecciona "Todas" y hay término de búsqueda, buscar con ese término
      buscarAlimentos(searchQuery, null, false);
    }
  };
  
  // Búsqueda manual desde el input
  const handleSearch = () => {
    buscarAlimentos(searchQuery, selectedCategoria?.id, false);
  };

  // Función para mostrar todos los alimentos
  const mostrarTodos = () => {
    buscarAlimentos('', selectedCategoria?.id, true);
  };

  // Cargar categorías de alimentos al montar el componente
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await api.get('/categorias-alimento/');
        if (response.data && Array.isArray(response.data)) {
          setCategorias(response.data);
        }
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    };
    
    fetchCategorias();
  }, []);

  useEffect(() => {
    if (selectedFood && unidadesMedida.length > 0) {
      // Buscar la unidad con ID 4 que corresponde a "Plato normal"
      const platoNormal = unidadesMedida.find(u => u.id === 4);
      
      // Opciones alternativas si no existe la unidad con ID 4
      const taza = unidadesMedida.find(u => u.nombre === "Taza" || u.id === 1);
      const vaso = unidadesMedida.find(u => u.nombre === "Vaso" || u.id === 2);
      const platoHondo = unidadesMedida.find(u => u.nombre === "Plato hondo" || u.id === 3);
      
      // Seleccionar según disponibilidad, priorizando Plato normal (ID 4)
      const unidadPorDefecto = platoNormal || taza || vaso || platoHondo || unidadesMedida[0];
      
      if (unidadPorDefecto) {
        setSelectedUnit(unidadPorDefecto);
      }
    }
  }, [selectedFood, unidadesMedida.length]);

  // Función para cargar dinámicamente las unidades de medida desde la base de datos
  const loadUnidadesMedida = async () => {
    if (unidadesMedidaProp && unidadesMedidaProp.length > 0) {
      return unidadesMedidaProp;
    }
    
    setLoadingUnidades(true);
    try {
      const endpoint = 'unidades-medida/';
      const response = await api.get(endpoint);
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      } else {
        throw new Error("No se pudieron cargar unidades de medida");
      }
    } catch (error) {
      console.error("Error cargando unidades de medida:", error.message);
      // Devolver un array vacío en caso de error
      return [];
    } finally {
      setLoadingUnidades(false);
    }
  };

  // Usar un efecto para cargar las unidades de medida al montar el componente
  useEffect(() => {
    const fetchUnidades = async () => {
      const unidades = await loadUnidadesMedida();
      if (isMounted.current) {
        setUnidadesMedida(unidades);
        
        // Seleccionar la primera unidad por defecto si existe
        if (unidades.length > 0) {
          setSelectedUnit(unidades[0]);
        }
      }
    };
    
    fetchUnidades();
  }, [unidadesMedidaProp]);

  // Función para seleccionar un alimento específico
  const handleSelectFood = (item) => {
    if (!item.id) {
      // Si es el genérico sin ID, cierra directamente
      onSelectAlimento(item);
      return;
    }
    
    setSelectedFood(item);
    setStep('select-unit');
  };
  
  // Calcular nutrientes ajustados basados en la cantidad y unidad
  const calcularNutrientesAjustados = (alimento, unidad, cantidadValue) => {
    if (!alimento || !unidad) return;
    
    // Determinar factor de conversión según unidad de medida
    let factorConversion = 1;
    
    // Intentar usar equivalencia_g primero, luego equivalencia_ml, y si no hay ninguno, usar 1
    if (unidad.equivalencia_g) {
      factorConversion = (Number(unidad.equivalencia_g) * cantidadValue) / 100;
    } else if (unidad.equivalencia_ml) {
      factorConversion = (Number(unidad.equivalencia_ml) * cantidadValue) / 100;
    } else {
      factorConversion = cantidadValue;
    }
    
    // Calcular valores nutricionales ajustados
    const nutAjustados = {
      sodio: alimento.sodio * factorConversion,
      potasio: alimento.potasio * factorConversion,
      fosforo: alimento.fosforo * factorConversion
    };
    
    // Guardar los valores ajustados
    setAjustedNutrientes({
      ...nutAjustados,
      factor_aplicado: factorConversion
    });
  };
  
  // Al cambiar la unidad o cantidad, recalcular
  useEffect(() => {
    if (selectedFood && selectedUnit) {
      calcularNutrientesAjustados(selectedFood, selectedUnit, parseFloat(cantidad) || 1);
    }
  }, [selectedFood, selectedUnit, cantidad]);
  
  // Función para guardar la selección específica en la BD
  const guardarSeleccionEspecifica = async (alimentoSeleccionado) => {
    // Add a safety check to prevent errors
    if (!analisisId || typeof analisisId !== 'string') {
      return null;
    }
    
    try {
      // Obtener ID de usuario
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        return;
      }
      
      const { persona_id } = JSON.parse(userData);
      if (!persona_id) {
        return;
      }
      
      // Crear objeto de selección específica
      const seleccion = {
        analisis: analisisId,
        persona: persona_id,
        alimento_original: alimentoGenerico,
        alimento_nombre: alimentoSeleccionado.nombre,
        alimento_seleccionado: alimentoSeleccionado.id,
        unidad_nombre: selectedUnit?.nombre || "porción",
        unidad_medida: selectedUnit?.id || 1,
        cantidad: cantidad || "1.00"
      };
      
      const endpoint = ENDPOINTS.SELECCIONES_ANALISIS || '/selecciones-analisis/';
      
      // Enviar a la API usando path relativo (no URL absoluta)
      const response = await api.post(endpoint, seleccion);
      
      return response.data;
    } catch (error) {
      console.error("Error al guardar selección específica:", error);
      return null;
    }
  };

  // Confirmar selección con la cantidad y unidad
  const confirmarSeleccion = async () => {
    if (!selectedFood || !selectedUnit) {
      console.error("No se puede confirmar: falta alimento o unidad");
      return;
    }
    
    // Función helper para formatear cantidad
    const formatCantidad = (cantidad) => {
      const num = parseFloat(cantidad);
      // Si es un número entero, mostrar sin decimales, sino con hasta 2 decimales
      return num % 1 === 0 ? num.toString() : num.toFixed(2).replace(/\.?0+$/, '');
    };
    
    // Añadir información de cantidad y unidad al objeto del alimento
    const alimentoFinal = {
      ...selectedFood,
      cantidad_seleccionada: parseFloat(cantidad) || 1,
      unidad_seleccionada: selectedUnit,
      valores_ajustados: ajustedNutrientes
    };
    
    
    // Guardar la selección en la BD si hay analisisId
    if (analisisId) {
      try {
        await guardarSeleccionEspecifica(alimentoFinal);
      } catch (error) {
        console.error("Error al guardar selección:", error);
        // Continuar aunque falle el guardado
      }
    }
    
    // Retornar el alimento con la nueva información
    onSelectAlimento(alimentoFinal);
  };

  const renderSearchHeader = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <TextInput
          ref={searchInputRef}
          style={styles.searchInput}
          placeholder="Buscar alimento..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={handleSearch}
        >
          <MaterialIcons name="search" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {categorias.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriasContainer}
          contentContainerStyle={styles.categoriasContent}
        >
          <TouchableOpacity
            style={[
              styles.categoriaChip,
              !selectedCategoria && styles.categoriaChipSelected
            ]}
            onPress={() => buscarPorCategoria(null)}
          >
            <Text style={[
              styles.categoriaChipText,
              !selectedCategoria && styles.categoriaChipTextSelected
            ]}>
              Todas
            </Text>
          </TouchableOpacity>
          
          {categorias.map(categoria => (
            <TouchableOpacity
              key={categoria.id}
              style={[
                styles.categoriaChip,
                selectedCategoria?.id === categoria.id && styles.categoriaChipSelected
              ]}
              onPress={() => buscarPorCategoria(categoria)}
            >
              <Text style={[
                styles.categoriaChipText,
                selectedCategoria?.id === categoria.id && styles.categoriaChipTextSelected
              ]}>
                {categoria.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );

  // Modificar cualquier elemento de la lista que pueda mostrar un texto genérico
  const renderAlimentoItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.alimentoItem} 
      onPress={() => handleSelectFood(item)}
    >
      <MaterialIcons 
        name="restaurant" 
        size={24} 
        color="#690B22" 
      />
      
      <View style={styles.alimentoInfo}>
        <Text style={styles.alimentoText}>
          {item.nombre}
        </Text>
        
        {item.categoria_nombre && (
          <Text style={styles.alimentoCategoria}>
            Categoría: {item.categoria_nombre}
          </Text>
        )}
        
        {/* Mostrar valores nutricionales clave si están disponibles */}
        {(item.sodio || item.potasio || item.fosforo) && (
          <View style={styles.nutrientesPreview}>
            {item.sodio && (
              <Text style={styles.nutrienteText}>
                Sodio: {formatMinerales(item.sodio)}
              </Text>
            )}
            {item.potasio && (
              <Text style={styles.nutrienteText}>
                Potasio: {formatMinerales(item.potasio)}
              </Text>
            )}
            {item.fosforo && (
              <Text style={styles.nutrienteText}>
                Fósforo: {formatMinerales(item.fosforo)}
              </Text>
            )}
          </View>
        )}
      </View>
      
      <MaterialIcons 
        name="chevron-right" 
        size={24} 
        color="#999" 
      />
    </TouchableOpacity>
  );

  const renderFooter = () => (
    <View>
      <TouchableOpacity
        style={styles.genericOption}
        onPress={() => handleSelectFood({ nombre: alimentoGenerico })}
      >
        <MaterialIcons name="add-circle" size={24} color="#690B22" />
        <Text style={styles.genericText}>
          Usar "{alimentoGenerico}" como está
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.verTodosButtonFooter}
        onPress={mostrarTodos}
      >
        <MaterialIcons name="format-list-bulleted" size={20} color="#FFFFFF" />
        <Text style={styles.verTodosButtonFooterText}>
          Ver todos los alimentos{selectedCategoria ? ` de ${selectedCategoria.nombre}` : ''}
        </Text>
      </TouchableOpacity>
      
      {/* Añadir sugerencias de búsqueda si no hay resultados */}
      {variantes.length === 0 && !loading && searchQuery && (
        <View style={styles.noResultsHelp}>
          <Text style={styles.noResultsTitle}>No se encontraron alimentos</Text>
          <Text style={styles.noResultsText}>Sugerencias:</Text>
          <Text style={styles.noResultsTip}>• Intenta usar palabras más generales</Text>
          <Text style={styles.noResultsTip}>• Revisa si hay errores ortográficos</Text>
          <Text style={styles.noResultsTip}>• Prueba seleccionar otra categoría</Text>
          
          <View style={styles.noResultsButtonsContainer}>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => buscarAlimentos(alimentoGenerico)}
            >
              <MaterialIcons name="refresh" size={16} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Reintentar búsqueda</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.verTodosButton}
              onPress={mostrarTodos}
            >
              <MaterialIcons name="format-list-bulleted" size={16} color="#FFFFFF" />
              <Text style={styles.verTodosButtonText}>Ver todos</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
  
  // Componente de Modal para seleccionar unidad
  const UnitSelectorModal = () => (
    <Modal
      visible={showUnitModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowUnitModal(false)}
    >
      <View style={styles.unitSelectorOverlay}>
        <View style={styles.unitSelectorContainer}>
          <View style={styles.unitSelectorHeader}>
            <Text style={styles.unitSelectorTitle}>
              Seleccionar unidad de medida
            </Text>
            <TouchableOpacity 
              onPress={() => setShowUnitModal(false)}
              style={styles.unitSelectorCloseButton}
            >
              <MaterialIcons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.unitSelectorCount}>
            <MaterialIcons name="category" size={16} color="#690B22" />
            <Text style={styles.unitSelectorCountText}>
              {unidadesMedida.length} unidades disponibles
            </Text>
          </View>

          {loadingUnidades ? (
            <View style={styles.unitLoadingContainer}>
              <ActivityIndicator size="large" color="#690B22" />
              <Text style={styles.unitLoadingText}>
                Cargando unidades de medida...
              </Text>
            </View>
          ) : (
            <FlatList
              data={unidadesMedida}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              contentContainerStyle={styles.unitListContent}
              renderItem={({ item }) => {
                // Determinar si el ítem es la unidad seleccionada
                const isSelected = selectedUnit?.id === item.id;
                
                // Obtener texto de equivalencia
                let equivalenciaText = '';
                
                if (item.equivalencia_g) {
                  equivalenciaText = `${item.equivalencia_g} g`;
                } else if (item.equivalencia_ml) {
                  equivalenciaText = `${item.equivalencia_ml} ml`;
                }
                
                return (
                  <TouchableOpacity 
                    style={[
                      styles.unitItem, 
                      isSelected && styles.selectedUnitItem
                    ]}
                    onPress={() => {
                      setSelectedUnit(item);
                      setShowUnitModal(false);
                      calcularNutrientesAjustados(selectedFood, item, parseFloat(cantidad) || 1);
                    }}
                  >
                    <View style={styles.unitItemLeft}>
                      <MaterialIcons 
                        name={isSelected ? "radio-button-checked" : "radio-button-unchecked"} 
                        size={22} 
                        color={isSelected ? "#690B22" : "#999"} 
                      />
                    </View>
                    
                    <View style={styles.unitItemContent}>
                      <Text style={[
                        styles.unitItemText,
                        isSelected && styles.selectedUnitItemText
                      ]}>
                        {item.nombre}
                      </Text>
                      {equivalenciaText && (
                        <View style={styles.equivalenciaTag}>
                          <MaterialIcons name="straighten" size={12} color="#555" />
                          <Text style={styles.equivalenciaMedida}>
                            {equivalenciaText}
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    {isSelected && (
                      <MaterialIcons name="check" size={20} color="#690B22" />
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyUnitsContainer}>
                  <MaterialIcons name="error-outline" size={24} color="#666" />
                  <Text style={styles.emptyUnitsText}>
                    No hay unidades de medida disponibles
                  </Text>
                </View>
              }
            />
          )}
          
          <TouchableOpacity 
            style={styles.unitSelectorConfirmButton}
            onPress={() => setShowUnitModal(false)}
          >
            <Text style={styles.unitSelectorConfirmText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Mostrar la vista según el paso actual
  if (step === 'select-unit' && selectedFood) {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Especificar cantidad</Text>
                <TouchableOpacity onPress={() => setStep('select-food')} style={styles.backButton}>
                  <MaterialIcons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              {/* Sección de alimento seleccionado más compacta */}
              <View style={styles.selectedFoodContainerCompact}>
                <MaterialIcons name="check-circle" size={18} color="#1B4D3E" style={styles.selectedFoodIcon} />
                <View style={styles.selectedFoodTextContainer}>
                  <Text style={styles.selectedFoodName} numberOfLines={2}>
                    {selectedFood.nombre}
                  </Text>
                  <Text style={styles.baseReferenceText}>
                    (Valores base por 100g)
                  </Text>
                </View>
              </View>
              
              {/* Contenedor unificado para cantidad y unidad */}
              <View style={styles.cantidadUnidadContainer}>
                <View style={styles.cantidadContainer}>
                  <Text style={styles.unidadLabel}>Cantidad:</Text>
                  <View style={styles.cantidadInputWrapper}>
                    <MaterialIcons name="edit" size={20} color="#690B22" style={styles.unitIcon} />
                    <TextInput
                      style={styles.cantidadInput}
                      value={cantidad}
                      onChangeText={(text) => {
                        setCantidad(text);
                        const cantidadValue = parseFloat(text) || 1;
                        calcularNutrientesAjustados(selectedFood, selectedUnit, cantidadValue);
                      }}
                      keyboardType="numeric"
                      maxLength={5}
                      blurOnSubmit={true}
                    />
                  </View>
                </View>
                
                <View style={styles.unidadContainer}>
                  <Text style={styles.unidadLabel}>Unidad:</Text>
                  <TouchableOpacity 
                    style={styles.unitSelector}
                    onPress={() => setShowUnitModal(true)}
                  >
                    <View style={styles.unitSelectorInner}>
                      <MaterialIcons name="straighten" size={20} color="#690B22" style={styles.unitIcon} />
                      <Text style={styles.unitSelectorText}>
                        {selectedUnit?.nombre || 'Seleccionar unidad'}
                      </Text>
                    </View>
                    <MaterialIcons name="arrow-drop-down" size={24} color="#690B22" />
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Mantener el resumen nutricional mejorado */}
              {ajustedNutrientes && (
                <View style={styles.resumenNutricional}>
                  <Text style={styles.resumenTitle}>
                    Valores nutricionales estimados:
                    <Text style={styles.resumenBase}> (para {cantidad} {selectedUnit?.nombre})</Text>
                  </Text>
                  <View style={styles.resumenGrid}>
                    <View style={styles.resumenItem}>
                      <Text style={styles.resumenValue}>{Math.round(selectedFood.energia * (ajustedNutrientes.factor_aplicado || 1))}</Text>
                      <Text style={styles.resumenLabel}>Calorías</Text>
                    </View>
                    <View style={styles.resumenItem}>
                      <Text style={styles.resumenValue}>{formatMinerales(ajustedNutrientes.sodio)}</Text>
                      <Text style={styles.resumenLabel}>Sodio (mg)</Text>
                    </View>
                    <View style={styles.resumenItem}>
                      <Text style={styles.resumenValue}>{formatMinerales(ajustedNutrientes.potasio)}</Text>
                      <Text style={styles.resumenLabel}>Potasio (mg)</Text>
                    </View>
                    <View style={styles.resumenItem}>
                      <Text style={styles.resumenValue}>{formatMinerales(ajustedNutrientes.fosforo)}</Text>
                      <Text style={styles.resumenLabel}>Fósforo (mg)</Text>
                    </View>
                  </View>
                </View>
              )}
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setStep('select-food')}
                >
                  <Text style={styles.cancelButtonText}>Atrás</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.confirmButton}
                  onPress={confirmarSeleccion}
                >
                  <Text style={styles.confirmButtonText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
        
        {/* Incluir el nuevo modal de selección de unidades */}
        <UnitSelectorModal />
      </Modal>
    );
  }

  // Modificar renderizado principal para mostrar un mensaje de debug
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{titulo}</Text>
              <TouchableOpacity 
                onPress={() => {
                  // Asegurarse de limpiar completamente al cerrar
                  resetComponentState();
                  onClose();
                }} 
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.alimentoGenerico}>
              Alimento detectado: <Text style={styles.alimentoGenericoHighlight}>{alimentoGenerico}</Text>
            </Text>
            
            {__DEV__ && (
              <Text style={styles.debugInfo}>
                {`Búsqueda: "${searchQuery}", Resultados: ${variantes.length}, Alimento Actual: "${currentAlimentoGenerico}"`}
              </Text>
            )}
            
            {/* Añadir barra de búsqueda y filtros */}
            {renderSearchHeader()}
            
            <View style={styles.instructionContainer}>
              <MaterialIcons name="info-outline" size={20} color="#1B4D3E" />
              <Text style={styles.instructionText}>
                Selecciona el tipo específico para obtener información nutricional precisa
              </Text>
            </View>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#690B22" />
                <Text style={styles.loadingText}>
                  Buscando tipos de "{alimentoGenerico}"...
                </Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={40} color="#F44336" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={() => buscarAlimentos(alimentoGenerico)}
                >
                  <MaterialIcons name="refresh" size={16} color="#FFFFFF" />
                  <Text style={styles.retryButtonText}>Reintentar búsqueda</Text>
                </TouchableOpacity>
              </View>
            ) : variantes.length === 0 && !isSearching ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="search-off" size={40} color="#9E9E9E" />
                <Text style={styles.emptyText}>No se encontraron variantes específicas</Text>
                <TouchableOpacity 
                  style={styles.genericButton}
                  onPress={() => handleSelectFood({ nombre: alimentoGenerico })}
                >
                  <Text style={styles.genericButtonText}>
                    Usar "{alimentoGenerico}" como está
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={() => buscarAlimentos(alimentoGenerico)}
                >
                  <MaterialIcons name="refresh" size={16} color="#FFFFFF" />
                  <Text style={styles.retryButtonText}>Reintentar búsqueda</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={variantes}
                keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
                style={styles.list}
                renderItem={renderAlimentoItem}
                ListFooterComponent={renderFooter}
              />
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    padding: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#F1E3D3',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#690B22',
  },
  closeButton: {
    padding: 5,
  },
  alimentoGenerico: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
    paddingHorizontal: 20,
    color: '#333',
  },
  alimentoGenericoHighlight: {
    fontWeight: 'bold',
    color: '#690B22',
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
  },
  instructionText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#1B4D3E',
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#690B22',
    fontSize: 16,
  },
  errorContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 12,
    color: '#F44336',
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 12,
    color: '#666',
    marginBottom: 20,
  },
  list: {
    maxHeight: 400,
    paddingHorizontal: 16,
  },
  varianteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  varianteImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginRight: 16,
  },
  varianteImage: {
    width: '100%',
    height: '100%',
  },
  noImageContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  varianteInfo: {
    flex: 1,
  },
  varianteNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  varianteData: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  genericButton: {
    backgroundColor: '#F1E3D3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    margin: 16,
  },
  genericButtonText: {
    color: '#690B22',
    fontWeight: 'bold',
    fontSize: 16,
  },
  alimentoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  alimentoInfo: {
    flex: 1,
    marginLeft: 12,
  },
  alimentoText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  alimentoCategoria: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  nutrientesPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  nutrienteText: {
    fontSize: 12,
    color: '#1B4D3E',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginTop: 2,
  },
  genericOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#F9F9F9',
  },
  genericText: {
    fontSize: 16,
    color: '#690B22',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  backButton: {
    padding: 5,
  },
  selectedFoodContainer: {
    padding: 16,
    backgroundColor: '#F1E3D3',
    borderRadius: 8,
    margin: 16,
  },
  selectedFoodContainerCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1E3D3',
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#690B22',
  },
  selectedFoodIcon: {
    marginRight: 10,
  },
  selectedFoodTextContainer: {
    flex: 1,
  },
  selectedFoodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#690B22',
  },
  baseReferenceText: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
  },
  cantidadUnidadContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  cantidadContainer: {
    flex: 1,
    marginRight: 8,
  },
  unidadContainer: {
    flex: 1,
    marginLeft: 8,
  },
  cantidadInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F0E8',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cantidadInput: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1B4D3E',
    flex: 1,
  },
  unidadesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  unidadesList: {
    maxHeight: 200,
    width: '100%',
    paddingHorizontal: 16,
  },
  unidadesListContent: {
    paddingBottom: 8,
  },
  verticalUnitItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%',
  },
  verticalUnitItemSelected: {
    backgroundColor: '#f0f0f0',
    borderLeftWidth: 3,
    borderLeftColor: '#690B22',
  },
  verticalUnitText: {
    fontSize: 16,
    color: '#333',
  },
  verticalUnitTextSelected: {
    fontWeight: 'bold',
    color: '#690B22',
  },
  verticalEquivalenciaText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  verticalEquivalenciaTextSelected: {
    color: '#690B22',
    opacity: 0.7,
  },
  equivalenciaContainer: {
    marginLeft: 10,
  },
  equivalenciaLabel: {
    fontSize: 12,
    color: '#690B22',
    fontStyle: 'italic',
  },
  baseReferenceText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  resumenNutricional: {
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    margin: 16,
  },
  resumenTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 8,
  },
  resumenBase: {
    fontWeight: 'normal',
    fontStyle: 'italic',
    fontSize: 12,
  },
  resumenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  resumenItem: {
    width: '48%',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 6
  },
  resumenLabel: {
    fontSize: 14,
    color: '#333',
  },
  resumenValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#690B22',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  confirmButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#690B22',
    marginLeft: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  
  // Nuevos estilos para selector de unidades mejorado
  unitSelectorOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
  },
  unitSelectorContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  unitSelectorHeader: {
    backgroundColor: '#690B22',
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  unitSelectorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  unitSelectorCloseButton: {
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  unitSelectorCount: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#F1E3D3',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  unitSelectorCountText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 6,
  },
  unitListContent: {
    paddingVertical: 8,
  },
  unitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  unitItemLeft: {
    marginRight: 12,
  },
  unitItemContent: {
    flex: 1,
    marginRight: 8,
  },
  selectedUnitItem: {
    backgroundColor: '#F8F0E8',
    borderLeftWidth: 4,
    borderLeftColor: '#690B22',
  },
  unitItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedUnitItemText: {
    fontWeight: 'bold',
    color: '#1B4D3E',
  },
  equivalenciaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  equivalenciaMedida: {
    fontSize: 13,
    color: '#555',
    marginLeft: 4,
  },
  unitSelectorConfirmButton: {
    backgroundColor: '#1B4D3E',
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 8,
  },
  unitSelectorConfirmText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  unitLoadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  unitLoadingText: {
    marginTop: 12,
    color: '#666',
  },
  emptyUnitsContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyUnitsText: {
    marginTop: 10,
    color: '#666',
    textAlign: 'center',
  },
  
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#690B22',
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriasContainer: {
    marginTop: 12,
    maxHeight: 40,
  },
  categoriasContent: {
    paddingVertical: 4,
  },
  categoriaChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoriaChipSelected: {
    backgroundColor: '#690B22',
    borderColor: '#690B22',
  },
  categoriaChipText: {
    fontSize: 14,
    color: '#333',
  },
  categoriaChipTextSelected: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#690B22',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
  debugInfo: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  mostrarTodosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1E3D3',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#690B22',
    alignSelf: 'center',
  },
  mostrarTodosText: {
    fontSize: 14,
    color: '#690B22',
    marginLeft: 6,
  },
  noResultsButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  verTodosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B4D3E',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  verTodosButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  verTodosButtonFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B4D3E',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  verTodosButtonFooterText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  debugUnitsContainer: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 8,
    marginBottom: 4,
  },
  debugUnitsTitle: {
    color: '#6c757d',
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 2,
  },
  // Mejoras en los estilos del selector de unidades
  formGroup: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  formLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 8,
  },
  unitSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F0E8',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unitSelectorInner: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  unitIcon: {
    marginRight: 8,
  },
  unitSelectorText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1B4D3E',
  },
  equivalenciaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#F1E3D3',
    padding: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  equivalenciaLabel: {
    fontSize: 12,
    color: '#690B22',
    fontStyle: 'italic',
  },
});

export default AlimentoSeleccionPrecisa;

