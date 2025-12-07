import { useCallback, useState, useEffect, useMemo } from 'react';
import { Tabs, Cascader } from 'antd';
import { Image, Upload, Loader2, FileQuestion } from 'lucide-react';
import styles from './ProductForm.module.css';
import ConfirmModal from '../../ConfirmMessage/ConfirmModal';
import { useProducts } from '../../../features/Products/hook/productHook';
import { useToast } from '../../../context/ToastContext';
import { generateProductInfo } from '../../../services/geminiService';
import { usePriceListsContext } from '../../../context/PriceListsContext'; // 👈 NUEVO
import { useWarehousesContext } from '../../../context/WarehousesContext'; // 👈 NUEVO

const ProductForm = ({
  mode = 'create',
  initialData = null,
  onSubmit,
  onClose,
  categories
}) => {
  const isEditMode = mode === 'edit';
  const { success, error: toastError, } = useToast();
  const { activePriceLists: priceLists, loading: priceListsLoading } = usePriceListsContext(); // 👈 NUEVO
  const { warehouses, loading: warehousesLoading } = useWarehousesContext(); // 👈 NUEVO
  // ✅ FUNCIÓN PARA CORREGIR URLs DE IMÁGENES
  const getCorrectImageUrl = (image) => {
    if (!image) return null;

    const url = image.original_url || image.medium_url || image.thumb_url || image.url;

    if (url && url.includes('localhost/storage')) {
      return url.replace('http://localhost/', 'http://localhost:8000/');
    }

    return url;
  };

  // ✅ Transformar categoryTree para Cascader
  const transformTreeToCascader = (tree) => {
    if (!tree || !Array.isArray(tree)) return [];

    return tree.map(node => ({
      value: node.id,
      label: node.name,
      children: node.children && node.children.length > 0
        ? transformTreeToCascader(node.children)
        : undefined
    }));
  };

  // ✅ Función para obtener el path completo de una categoría
  const getCategoryPath = (options, targetId) => {
    if (!options || !targetId) return [];

    const findPath = (items, target, currentPath = []) => {
      for (const item of items) {
        const newPath = [...currentPath, item.value];

        if (item.value === target) {
          return newPath;
        }

        if (item.children) {
          const found = findPath(item.children, target, newPath);
          if (found) return found;
        }
      }
      return null;
    };

    return findPath(options, targetId) || [];
  };
  const categoryOptions = useMemo(() =>
    transformTreeToCascader(categories),
    [categories]
  );
  const [formData, setFormData] = useState(() => ({
    sku: initialData?.sku || '',
    primary_name: initialData?.primary_name || '',
    secondary_name: initialData?.secondary_name || '',
    description: initialData?.description || '',
    category_id: initialData?.category?.id || initialData?.category_id || null,
    category_path: [], // 👈 Vacío inicialmente
    brand: initialData?.brand || '',
    min_stock: initialData?.min_stock || 10,
    is_active: initialData?.is_active ?? true,
    is_featured: initialData?.is_featured ?? false,
    visible_online: initialData?.visible_online ?? false,
    is_new: initialData?.is_new ?? false,
    barcode: initialData?.barcode || '',
    distribution_price: initialData?.distribution_price || '',
    unit_measure: isEditMode ? (initialData?.unit_measure || null) : 'NIU',
    weight: initialData?.weight || '',
    tax_type: isEditMode ? (initialData?.tax_type || null) : '10',
  }));

  const [uploadedImages, setUploadedImages] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('general'); // ✅ DECLARAR ANTES DE USARLO
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [specifications, setSpecifications] = useState(initialData?.specifications || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [loadingSpecs, setLoadingSpecs] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [generatedWithAI, setGeneratedWithAI] = useState(false);

  const [prices, setPrices] = useState([]);
  const [categoryMargins, setCategoryMargins] = useState({
    markup: 0,
    minMarkup: 0
  });
  const [averageCost, setAverageCost] = useState(0);

  const {
    fetchProductAttributes,
    uploadImage,
    deleteImage,
    fetchProductById,
    setPrimaryImage
  } = useProducts();

  const getAvailablePriceLists = useCallback((currentIndex = null) => {
    if (!priceLists || priceLists.length === 0) return [];

    // Obtener combinaciones ya usadas
    const usedCombinations = prices
      .map((p, idx) => {
        // Si es el índice actual, no contar (para permitir cambio)
        if (idx === currentIndex) return null;

        return `${p.price_list_id}-${p.warehouse_id || 'null'}`;
      })
      .filter(Boolean);

    // Filtrar listas disponibles
    return priceLists.filter(pl => {
      // Verificar si esta lista ya está usada con almacén null (general)
      const generalKey = `${pl.id}-null`;
      return !usedCombinations.includes(generalKey);
    });
  }, [priceLists, prices]);

  /**
   * Verificar si una combinación (lista + almacén) ya existe
   */
  const isDuplicateCombination = useCallback((priceListId, warehouseId, currentIndex = null) => {
    return prices.some((p, idx) => {
      if (idx === currentIndex) return false; // No comparar consigo mismo

      return p.price_list_id === priceListId &&
        (p.warehouse_id || null) === (warehouseId || null);
    });
  }, [prices]);

  /**
   * Verificar si se puede agregar más precios
   */
  const canAddMorePrices = useCallback(() => {
    const availableLists = getAvailablePriceLists();
    return availableLists.length > 0;
  }, [getAvailablePriceLists]);

  useEffect(() => {
    const loadPriceData = async () => {
      // 👇 Solo cargar una vez, no cada vez que cambia el tab
      if (activeTab !== 'precios' || prices.length > 0) return;

      try {
        // ✅ Ya NO necesitamos cargar priceLists ni warehouses porque vienen del contexto
        console.log('📋 Listas de precios del contexto:', priceLists);
        console.log('🏢 Almacenes del contexto:', warehouses);

        // ✅ 3. Cargar costo promedio del producto
        if (initialData?.average_cost) {
          const cost = parseFloat(initialData.average_cost);
          setAverageCost(cost);

          // Actualizar formData con el costo promedio
          setFormData(prev => ({
            ...prev,
            average_cost: cost
          }));
        }

        // ✅ 4. Cargar márgenes de la categoría
        if (initialData?.category) {
          const markup = parseFloat(initialData.category.normal_margin_percentage || initialData.category.default_markup || 0);
          const minMarkup = parseFloat(initialData.category.min_margin_percentage || initialData.category.min_markup || 0);

          setCategoryMargins({
            markup,
            minMarkup
          });
        }

        // ✅ 5. Cargar precios existentes del producto
        if (isEditMode && initialData?.all_prices && initialData.all_prices.length > 0) {
          console.log('📊 Cargando precios existentes:', initialData.all_prices);

          const cost = parseFloat(initialData.average_cost || 0);

          const loadedPrices = initialData.all_prices.map(p => {
            const price = parseFloat(p.price || 0);
            const calculatedMargin = cost > 0
              ? (((price - cost) / cost) * 100).toFixed(2)
              : '0.00';

            return {
              id: p.id,
              price_list_id: p.price_list_id,
              warehouse_id: p.warehouse_id || null,
              price: price,
              min_price: p.min_price ? parseFloat(p.min_price) : null,
              currency: p.currency || 'PEN',
              min_quantity: p.min_quantity || 1,
              valid_from: p.valid_from ? p.valid_from.split(' ')[0] : new Date().toISOString().split('T')[0],
              valid_to: p.valid_to ? p.valid_to.split(' ')[0] : null,
              is_active: p.is_active ?? true,
              calculated_margin: calculatedMargin,
              use_margin: false,
              margin_percentage: ''
            };
          });

          setPrices(loadedPrices);
          console.log('✅ Precios cargados:', loadedPrices);
        } else if (!isEditMode) {
          // En modo creación, inicializar con un precio vacío
          setPrices([{
            price_list_id: null,
            warehouse_id: null,
            price: 0,
            min_price: null,
            currency: 'PEN',
            min_quantity: 1,
            valid_from: new Date().toISOString().split('T')[0],
            valid_to: null,
            is_active: true,
            calculated_margin: '0.00',
            use_margin: false,
            margin_percentage: ''
          }]);
        }
      } catch (error) {
        console.error('❌ Error cargando datos de precios:', error);
        toastError('Error al cargar información de precios');
      }
    };

    loadPriceData();
  }, [activeTab, initialData, isEditMode]);

  const addPrice = () => {
    if (!priceLists || priceLists.length === 0) {
      toastError('No hay listas de precios disponibles');
      return;
    }

    // ✅ Verificar si hay listas disponibles
    const availableLists = getAvailablePriceLists();

    if (availableLists.length === 0) {
      toastError('Ya has configurado precios para todas las listas disponibles');
      return;
    }

    // Usar la primera lista disponible como default
    const defaultPriceList = availableLists[0];

    setPrices([
      ...prices,
      {
        price_list_id: defaultPriceList.id,
        warehouse_id: null,
        price: 0,
        min_price: null,
        currency: 'PEN',
        min_quantity: 1,
        valid_from: new Date().toISOString().split('T')[0],
        valid_to: null,
        is_active: true,
        calculated_margin: '0.00',
        use_margin: false,
        margin_percentage: ''
      }
    ]);
    setHasChanges(true);
  };

  const updatePrice = (index, field, value) => {
    const newPrices = [...prices];

    // ✅ Validar duplicados al cambiar lista o almacén
    if (field === 'price_list_id' || field === 'warehouse_id') {
      const priceListId = field === 'price_list_id' ? value : newPrices[index].price_list_id;
      const warehouseId = field === 'warehouse_id' ? value : newPrices[index].warehouse_id;

      if (isDuplicateCombination(priceListId, warehouseId, index)) {
        toastError('Ya existe un precio para esta combinación de lista y almacén');
        return;
      }
    }

    newPrices[index][field] = value;

    // 🔥 Cuando cambia el precio MANUALMENTE
    if (field === 'price') {
      // Calcular margen basado en el nuevo precio
      if (averageCost > 0) {
        const margin = ((value - averageCost) / averageCost) * 100;
        newPrices[index].calculated_margin = margin.toFixed(2);
      }

      // 👇 SIEMPRE desactivar el uso de margen cuando se cambia precio manual
      newPrices[index].use_margin = false;
      newPrices[index].margin_percentage = '';
    }

    // 🔥 Cuando activa/desactiva el checkbox de margen
    if (field === 'use_margin') {
      if (value) {
        // Activar: usar el margen calculado actual o el de categoría
        const currentMargin = newPrices[index].calculated_margin || categoryMargins.markup || 0;
        newPrices[index].margin_percentage = parseFloat(currentMargin).toFixed(2);

        // Recalcular precio basado en el margen
        if (averageCost > 0) {
          const calculatedPrice = (averageCost * (1 + parseFloat(currentMargin) / 100)).toFixed(2);
          newPrices[index].price = parseFloat(calculatedPrice);
          newPrices[index].calculated_margin = parseFloat(currentMargin).toFixed(2);
        }
      } else {
        // Desactivar: mantener precio actual pero limpiar input de margen
        newPrices[index].margin_percentage = '';
      }
    }

    // 🔥 Cuando cambia el porcentaje de margen (solo si está activado)
    if (field === 'margin_percentage' && newPrices[index].use_margin) {
      if (averageCost > 0) {
        const calculatedPrice = (averageCost * (1 + value / 100)).toFixed(2);
        newPrices[index].price = parseFloat(calculatedPrice);
        newPrices[index].calculated_margin = value.toFixed(2);
      }
    }

    setPrices(newPrices);
    setHasChanges(true);
  };

  const removePrice = (index) => {
    if (prices.length > 1) {
      const newPrices = prices.filter((_, i) => i !== index);
      setPrices(newPrices);
      setHasChanges(true);
    }
  };

  const calculateSuggestedPrice = (priceListCode) => {
    if (averageCost <= 0) return 0;

    let markup = 0;

    // 👇 Usar códigos reales de las listas de precios
    if (priceListCode === 'RETAIL' || priceListCode === 'DISTRIBUTOR') {
      // Minorista y Distribuidor: margen normal
      markup = categoryMargins.markup || 0;
    } else if (priceListCode === 'WHOLESALE' || priceListCode === 'MIN_RETAIL') {
      // Mayorista y Mínimo: margen mínimo
      markup = categoryMargins.minMarkup || 0;
    } else {
      // Por defecto: margen normal
      markup = categoryMargins.markup || 0;
    }

    return (averageCost * (1 + markup / 100)).toFixed(2);
  };

  // ✅ Cargar imágenes existentes en modo edición
  useEffect(() => {
    if (isEditMode && initialData?.images) {
      const sorted = [...initialData.images].sort((a, b) => {
        const aPrimary = a.custom_properties?.primary === true ? 1 : 0;
        const bPrimary = b.custom_properties?.primary === true ? 1 : 0;
        return bPrimary - aPrimary;
      });

      const existingImages = sorted.map((img, index) => ({
        id: img.id,
        url: getCorrectImageUrl(img),
        name: img.file_name || `Imagen ${index + 1}`,
        isExisting: true
      }));

      setUploadedImages(existingImages);
      setMainImageIndex(0);
    }
  }, [isEditMode, initialData]);

  useEffect(() => {
    const categoryId = initialData?.category_id || initialData?.category?.id;

    if (isEditMode && categoryId && categoryOptions.length > 0) {
      const path = getCategoryPath(categoryOptions, categoryId);

      if (path.length > 0) {
        setFormData(prev => {
          // 👇 Solo actualizar si realmente cambió
          if (JSON.stringify(prev.category_path) !== JSON.stringify(path)) {
            return {
              ...prev,
              category_path: path,
              category_id: categoryId
            };
          }
          return prev;
        });
      }
    }
  }, [isEditMode, categoryOptions]);

  // ✅ Cargar atributos del producto en modo edición
  useEffect(() => {
    const loadProductAttributes = async () => {
      if (isEditMode && initialData?.id && activeTab === 'especificaciones' && !generatedWithAI) {
        setLoadingSpecs(true);
        try {
          const result = await fetchProductAttributes(initialData.id);
          if (result.success && result.data) {
            const attributesAsSpecs = result.data.map(attr => ({
              id: attr.id, // 👈 INCLUIR ID
              name: attr.name,
              value: attr.value
            }));
            setSpecifications(attributesAsSpecs);
          }
        } catch (error) {
          console.error('Error cargando especificaciones:', error);
        } finally {
          setLoadingSpecs(false);
        }
      }
    };

    loadProductAttributes();
  }, [isEditMode, initialData?.id, activeTab, fetchProductAttributes, generatedWithAI]);
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (uploadedImages.length + files.length > 5) {
      toastError('Máximo 5 imágenes permitidas');
      return;
    }

    const newImages = files.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      isExisting: false
    }));

    setUploadedImages([...uploadedImages, ...newImages]);
    setHasChanges(true);
  };

  const refreshProductImages = async (productId) => {
    try {
      const productResponse = await fetchProductById(productId);

      if (productResponse.success) {
        const updatedProduct = productResponse.data;

        if (updatedProduct.images && updatedProduct.images.length > 0) {
          const sorted = [...updatedProduct.images].sort((a, b) => {
            const aPrimary = a.custom_properties?.primary === true ? 1 : 0;
            const bPrimary = b.custom_properties?.primary === true ? 1 : 0;
            return bPrimary - aPrimary;
          });

          const updatedImages = sorted.map((img, index) => ({
            id: img.id,
            url: getCorrectImageUrl(img),
            name: img.file_name || `Imagen ${index + 1}`,
            isExisting: true
          }));

          setUploadedImages(updatedImages);
          setMainImageIndex(0);

          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('❌ Error actualizando imágenes:', error);
      return false;
    }
  };

  const handleRemoveImage = async (id) => {
    const imageToRemove = uploadedImages.find(img => img.id === id);

    if (imageToRemove?.isExisting && isEditMode && initialData?.id) {
      const confirmar = window.confirm('¿Estás seguro de que quieres eliminar esta imagen del servidor?');
      if (!confirmar) return;

      try {
        await deleteImage(initialData.id, imageToRemove.id, { skipRefresh: true });
      } catch (error) {
        console.error('❌ Error eliminando imagen del servidor:', error);
        toastError('Error al eliminar la imagen del servidor');
        return;
      }
    }

    const newImages = uploadedImages.filter(img => img.id !== id);
    setUploadedImages(newImages);
    if (mainImageIndex >= newImages.length) {
      setMainImageIndex(Math.max(0, newImages.length - 1));
    }
    setHasChanges(true);
  };

  const handleSetMainImage = (index) => {
    setMainImageIndex(index);
    setHasChanges(true);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCategoryChange = (value) => {
    if (!value || value.length === 0) {
      setFormData(prev => ({
        ...prev,
        category_id: null,
        category_path: []
      }));
      setHasChanges(true);
      return;
    }

    const selectedId = value[value.length - 1];

    setFormData(prev => ({
      ...prev,
      category_id: selectedId,
      category_path: value
    }));
    setHasChanges(true);
  };

  const handleToggle = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
    setHasChanges(true);
  };

  const addSpecification = () => {
    setSpecifications([...specifications, { name: '', value: '' }]);
    setHasChanges(true);
  };

  const updateSpecification = (index, field, value) => {
    const newSpecs = [...specifications];
    newSpecs[index][field] = value;
    setSpecifications(newSpecs);
    setHasChanges(true);
  };

  const removeSpecification = (index) => {
    if (specifications.length > 1) {
      const newSpecs = specifications.filter((_, i) => i !== index);
      setSpecifications(newSpecs);
      setHasChanges(true);
    }
  };

  const handleGenerateWithAI = async () => {
    if (!formData.primary_name.trim()) {
      toastError('Por favor ingresa el nombre del producto primero');
      return;
    }

    const confirmar = window.confirm(
      `¿Quieres generar automáticamente la descripción y especificaciones para "${formData.primary_name}"?\n\nEsto sobrescribirá el contenido actual.`
    );

    if (!confirmar) return;

    setIsGeneratingAI(true);

    try {
      const response = await generateProductInfo(formData.primary_name);

      if (!response.success) {
        throw new Error(response.message || 'Error al generar contenido');
      }

      const data = response.data;

      setFormData(prev => ({
        ...prev,
        description: data.description || ''
      }));

      if (Array.isArray(data.specifications) && data.specifications.length > 0) {
        const formattedSpecs = data.specifications.map(s => ({
          id: null,
          name: s.name || '',
          value: s.value || ''
        }));

        setSpecifications(formattedSpecs);
        setGeneratedWithAI(true);
      }

      setHasChanges(true);
    } catch (error) {
      console.error('❌ Error generando IA:', error);
      toastError('No se pudo generar la información con IA. Intenta nuevamente.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.primary_name.trim()) {
      newErrors.primary_name = 'El nombre principal es requerido';
    }

    if (!formData.min_stock || formData.min_stock < 0) {
      newErrors.min_stock = 'El stock mínimo debe ser ≥ 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 👇 FUNCIÓN handleSubmit CORREGIDA
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toastError('Por favor corrige los errores del formulario');
      return;
    }

    // 👇 ACTIVAR LOADING
    setIsSubmitting(true);

    const submitData = {
      primary_name: formData.primary_name,
      secondary_name: formData.secondary_name || null,
      distribution_price: formData.distribution_price ? parseFloat(formData.distribution_price) : null,
      description: formData.description || null,
      category_id: formData.category_id,
      brand: formData.brand || null,
      min_stock: parseInt(formData.min_stock) || 10,
      is_active: formData.is_active,
      is_featured: formData.is_featured,
      visible_online: formData.visible_online,
      is_new: formData.is_new,
      barcode: formData.barcode || null,
      unit_measure: formData.unit_measure || null,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      tax_type: formData.tax_type,

      // 👇 AGREGAR atributos como array
      attributes: specifications
        .filter(spec => spec.name && spec.value)
        .map(spec => ({
          ...(spec.id && { id: spec.id }), // Si tiene ID, es update
          name: spec.name,
          value: spec.value
        })),

      // 👇 AGREGAR precios como array
      prices: prices
        .filter(p => p.price_list_id && p.price > 0) // Solo válidos
        .map(p => ({
          ...(p.id && { id: p.id }), // Si tiene ID, es update
          price_list_id: p.price_list_id,
          warehouse_id: p.warehouse_id || null,
          price: parseFloat(p.price),
          min_price: p.min_price ? parseFloat(p.min_price) : null,
          currency: p.currency || 'PEN',
          min_quantity: p.min_quantity || 1,
          valid_from: p.valid_from || new Date().toISOString().split('T')[0],
          valid_to: p.valid_to || null,
          is_active: p.is_active ?? true
        }))
    };

    try {
      console.log('📤 Enviando formulario:', { mode, submitData });

      // 1️⃣ Crear/Actualizar Producto
      const result = await onSubmit(submitData);

      // ✅ VERIFICAR RESULTADO DEL PRODUCTO
      if (!result.success) {
        console.error('❌ Error en operación del producto:', result.error);
        toastError(`${result.error}`);
        return;
      }

      console.log('✅ Operación exitosa', result);

      const productId = result.id || result.data?.id || result.data?.data?.id || initialData?.id;
      console.log('🆔 ID del producto:', productId);

      if (!productId) {
        toastError('No se pudo obtener el ID del producto');
        return;
      }

      // 3️⃣ Subir imágenes nuevas - VERIFICAR CADA UNA
      const newImages = uploadedImages.filter(img => !img.isExisting && img.file);

      if (newImages.length > 0) {
        console.log(`📸 Subiendo ${newImages.length} imagen(es)...`);

        // ⚠️ IMPORTANTE: Esperar a que TODAS las imágenes se suban
        const uploadResults = await Promise.all(
          newImages.map(async (img) => {
            try {
              const uploadResult = await uploadImage(productId, img.file, { skipRefresh: true });

              if (!uploadResult.success) {
                console.error(`❌ Imagen "${img.name}" falló:`, uploadResult.error);
                return {
                  success: false,
                  image: img.name,
                  error: uploadResult.error
                };
              }

              console.log(`✅ Imagen "${img.name}" subida correctamente`);
              return {
                success: true,
                image: img.name
              };

            } catch (error) {
              console.error(`❌ Error subiendo "${img.name}":`, error);
              return {
                success: false,
                image: img.name,
                error: error.message || 'Error desconocido'
              };
            }
          })
        );

        // 🔍 VERIFICAR SI HUBO ERRORES EN LAS IMÁGENES
        const failedUploads = uploadResults.filter(r => !r.success);

        if (failedUploads.length > 0) {
          console.error("❌ Algunas imágenes fallaron:", failedUploads);

          const errorMessages = failedUploads
            .map(f => `• ${f.image}: ${f.error}`)
            .join('\n');

          toastError(`El producto se guardó pero hubo errores:\n${errorMessages}`);

          await refreshProductImages(productId);

          // NO CERRAR EL MODAL - dejar que el usuario corrija
          return;
        }

        console.log('✅ Todas las imágenes subidas correctamente');

        // Refrescar imágenes del producto
        await refreshProductImages(productId);
      }

      // 4️⃣ Establecer imagen principal (si aplica)
      if (uploadedImages.length > 0) {
        const localMain = uploadedImages[mainImageIndex];

        fetchProductById(productId).then(refreshed => {
          const serverImg = refreshed.data.images?.find(i => i.file_name === localMain.name);
          if (serverImg) {
            setPrimaryImage(productId, serverImg.id)
              .catch(err => console.error("❌ Error estableciendo imagen principal:", err));
          }
        }).catch(err => console.error("❌ Error en fetchProductById:", err));
      }

      // 5️⃣ Recargar tabla
      window.dispatchEvent(new CustomEvent('products-reload', {
        detail: { productId, action: mode }
      }));

      // 6️⃣ Cerrar modal
      onClose();

    } catch (err) {
      console.error('❌ Error al guardar producto:', err);

      const errorMessage = err.message ||
        err.response?.data?.message ||
        err.error ||
        'Error desconocido al guardar el producto';

      toastError(`${errorMessage}`);

    } finally {
      // 👇 DESACTIVAR LOADING SIEMPRE
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      setShowExitConfirm(true);
    } else {
      onClose();
    }
  };

  const tabItems = [
    { key: 'general', label: 'General' },
    { key: 'especificaciones', label: 'Especificaciones' },
    { key: 'atributos', label: 'Atributos' },
    { key: 'precios', label: 'Precios' },
  ];
  return (
    <div className={styles.container}>

      <div
        className={`${styles.modal} ${isEditMode ? styles.editMode : ''} ${isGeneratingAI ? styles.modalDisabled : ''
          }`}
      >
        {/* 🔥 OVERLAY CUANDO IA ESTÁ GENERANDO */}
        {isGeneratingAI && (
          <div className={styles.aiOverlay}>
            <div className={styles.aiBarsWrapper}>

              {/* Contenedor solo para las barras */}
              <div className={styles.aiBarsLoader}>
                <div className={styles.aiBar}></div>
                <div className={styles.aiBar}></div>
                <div className={styles.aiBar}></div>
                <div className={styles.aiBar}></div>
                <div className={styles.aiBar}></div>
              </div>

              {/* Texto debajo */}
              <p className={styles.aiBarsText}>Generando con IA...</p>

            </div>
          </div>
        )}

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h2 className={styles.title}>
              {isEditMode ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            {hasChanges && (
              <span className={styles.badge}>Sin guardar</span>
            )}
          </div>
          <button
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Cerrar"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33" opacity="0.7" />
              <path d="M4 4L12 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33" opacity="0.7" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabsWrapper}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            className={styles.customTabs}
          />
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className={styles.formWrapper}>
          <div className={styles.form}>
            {/* TAB: GENERAL */}
            {activeTab === 'general' && (
              <>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>SKU</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Se generará automáticamente"
                      value={formData.sku}
                      disabled
                    />
                    <p className={styles.hint}>Código único del producto (se genera automáticamente)</p>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>
                      Nombre del Producto *
                      <button
                        type="button"
                        onClick={handleGenerateWithAI}
                        disabled={isGeneratingAI || !formData.primary_name.trim()}
                        className={styles.aiButton}
                        title="Generar descripción y especificaciones con IA"
                      >
                        {isGeneratingAI ? (
                          <svg className={styles.aiIconSpinning} width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="60" strokeLinecap="round" opacity="0.25" />
                            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                          </svg>
                        ) : (
                          <svg className={styles.aiIcon} width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
                          </svg>
                        )}
                      </button>
                    </label>
                    <input
                      type="text"
                      className={`${styles.input} ${errors.primary_name ? styles.inputError : ''}`}
                      placeholder="Ej: Laptop HP Pavilion 15"
                      value={formData.primary_name}
                      onChange={(e) => handleInputChange('primary_name', e.target.value)}
                    />
                    {errors.primary_name && <p className={styles.errorText}>{errors.primary_name}</p>}
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Nombre Secundario (Opcional)</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Ej: i7-11va Gen, 16GB RAM"
                    value={formData.secondary_name}
                    onChange={(e) => handleInputChange('secondary_name', e.target.value)}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Descripción</label>
                  <div className={styles.textareaWrapper}>
                    <textarea
                      className={styles.textarea}
                      placeholder="Descripción detallada del producto..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      maxLength={500}
                    />
                    <span className={styles.charCount}>{formData.description.length}/500</span>
                  </div>
                </div>

                <div className={styles.rowThree}>
                  <div className={styles.field}>
                    <label className={styles.label}>Categoría</label>
                    <Cascader
                      options={categoryOptions}
                      onChange={handleCategoryChange}
                      value={formData.category_path}
                      placeholder="Seleccionar categoría"
                      className={styles.cascader}
                      changeOnSelect
                      expandTrigger="hover"
                      showSearch={{
                        filter: (inputValue, path) =>
                          path.some(
                            (option) =>
                              option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
                          ),
                      }}
                      displayRender={(labels) => labels.join(' / ')}
                      popupClassName={styles.cascaderDropdown}
                      notFoundContent="No se encontraron categorías"
                      allowClear
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Marca</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Ej: HP, Dell, Logitech"
                      value={formData.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Stock Mínimo *</label>
                    <input
                      type="number"
                      className={`${styles.input} ${errors.min_stock ? styles.inputError : ''}`}
                      placeholder="10"
                      value={formData.min_stock}
                      onChange={(e) => handleInputChange('min_stock', e.target.value)}
                      min="0"
                      step="1"
                    />
                    {errors.min_stock && <p className={styles.errorText}>{errors.min_stock}</p>}
                  </div>
                </div>

                {/* Contenedor para toggles en línea */}
                <div className={styles.togglesRow}>
                  <div className={styles.toggleContainer}>
                    <label className={styles.toggleLabel}>Producto Activo</label>
                    <button
                      type="button"
                      className={`${styles.toggle} ${formData.is_active ? styles.toggleActive : ''}`}
                      onClick={() => handleToggle('is_active')}
                    >
                      <span className={styles.toggleThumb} />
                    </button>
                  </div>

                  <div className={styles.toggleContainer}>
                    <label className={styles.toggleLabel}>Producto Destacado</label>
                    <button
                      type="button"
                      className={`${styles.toggle} ${formData.is_featured ? styles.toggleActive : ''}`}
                      onClick={() => handleToggle('is_featured')}
                    >
                      <span className={styles.toggleThumb} />
                    </button>
                  </div>
                </div>
                {/* ✅ AGREGAR ESTOS DOS TOGGLES NUEVOS */}
                <div className={styles.toggleContainer}>
                  <label className={styles.toggleLabel}>Visible Online</label>
                  <button
                    type="button"
                    className={`${styles.toggle} ${formData.visible_online ? styles.toggleActive : ''}`}
                    onClick={() => handleToggle('visible_online')}
                  >
                    <span className={styles.toggleThumb} />
                  </button>
                </div>

                <div className={styles.toggleContainer}>
                  <label className={styles.toggleLabel}>Producto Nuevo</label>
                  <button
                    type="button"
                    className={`${styles.toggle} ${formData.is_new ? styles.toggleActive : ''}`}
                    onClick={() => handleToggle('is_new')}
                  >
                    <span className={styles.toggleThumb} />
                  </button>
                </div>
              </>
            )}

            {/* TAB: ESPECIFICACIONES */}
            {activeTab === 'especificaciones' && (
              <>
                <div className={styles.specsHeader}>
                  <div className={styles.specsHeaderContent}>
                    <h3 className={styles.specsTitle}>Especificaciones Técnicas</h3>
                    <p className={styles.specsDescription}>
                      Agrega las características técnicas que se mostrarán en el E-commerce.
                    </p>
                  </div>
                </div>

                <div className={styles.specsContainer}>

                  {/* 🔥 LOADING — muestra solo el loader */}
                  {loadingSpecs && (
                    <div className={styles.specsLoaderOverlay}>
                      <div className={styles.specsLoaderCard}>
                        <Loader2 className={styles.specsLoaderSpinner} />
                        <p>Cargando especificaciones...</p>
                      </div>
                    </div>
                  )}

                  {!loadingSpecs && specifications.length === 0 && (
                    <div className={styles.emptySpecsState}>
                      <FileQuestion className={styles.emptySpecsIcon} />
                      <h3 className={styles.emptySpecsTitle}>Parece que no hay especificaciones</h3>
                      <p className={styles.emptySpecsText}>Puedes agregar tus primeras especificaciones.</p>
                    </div>
                  )}

                  {/* 🔥 LISTA DE ESPECIFICACIONES */}
                  {!loadingSpecs && specifications.length > 0 && (
                    specifications.map((spec, index) => (
                      <div key={index} className={styles.specItem}>
                        <div className={styles.specRow}>
                          <div className={styles.field}>
                            <label className={styles.label}>Nombre de la especificación</label>
                            <input
                              type="text"
                              className={styles.input}
                              placeholder="Ej: Procesador"
                              value={spec.name}
                              onChange={(e) => updateSpecification(index, 'name', e.target.value)}
                            />
                          </div>

                          <div className={styles.field}>
                            <label className={styles.label}>Descripción</label>
                            <input
                              type="text"
                              className={styles.input}
                              placeholder="Ej: Intel Core i7"
                              value={spec.value}
                              onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                            />
                          </div>

                          {specifications.length > 1 && (
                            <button
                              type="button"
                              className={styles.removeSpecButton}
                              onClick={() => removeSpecification(index)}
                              title="Eliminar especificación"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <button
                  type="button"
                  className={styles.addSpecButton}
                  onClick={addSpecification}
                >
                  + Agregar Especificación
                </button>
              </>
            )}


            {/* TAB: ATRIBUTOS */}
            {activeTab === 'atributos' && (
              <>
                <div className={styles.field}>
                  <div className={styles.rowInline2}>
                    <label className={styles.storesTitle}>Imágenes del Producto ({uploadedImages.length}/5)</label>

                    <label className={styles.btnUpload}>
                      <Upload size={18} strokeWidth={2} /> Subir Imagen
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                    </label>

                  </div>
                  <div className={styles.imageUpload}>
                    {uploadedImages.length === 0 ? (
                      <div className={styles.imageUploadPlaceholder}>
                        <Image size={60} color="#666666" />
                        <p style={{ fontWeight: 500, fontSize: '18px' }}>No hay imágenes cargadas</p>
                        <p>Puedes subir hasta 5 mágenes por producto</p>
                      </div>
                    ) : (
                      <>
                        <div className={styles.imageGrid}>
                          {uploadedImages.map((img, index) => (
                            <div
                              key={img.id}
                              className={`${styles.imageGridItem} ${index === mainImageIndex ? styles.mainImage : ''}`}
                              onClick={() => handleSetMainImage(index)}
                            >
                              <img src={img.url} alt={img.name} />
                              {index === mainImageIndex && (
                                <span className={styles.mainImageBadge}>Principal</span>
                              )}
                              <button
                                type="button"
                                className={styles.removeImageBtn}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveImage(img.id);
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          {uploadedImages.length < 5 && (
                            <label className={styles.imageGridItemAdd}>
                              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                <path d="M16 8V24M8 16H24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                              <span>Agregar</span>
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                              />
                            </label>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  <p className={styles.hint}>
                    * Formatos: JPG, PNG, WebP<br />
                    * Tamaño máximo: 5MB por imagen<br />
                    * La primera imagen será la principal
                  </p>
                </div>
                <div className={styles.rowInline}>
                  <div className={styles.field}>
                    <label className={styles.label}>Código de barras</label>
                    <input
                      type="number"
                      className={`${styles.input} ${errors.barcode ? styles.inputError : ''}`}
                      placeholder="123456789"
                      value={formData.barcode}
                      onChange={(e) => handleInputChange('barcode', e.target.value)}
                      min="0"
                      step="1"
                    />
                    {errors.barcode && <p className={styles.errorText}>{errors.barcode}</p>}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Unidad de medida</label>
                    <input
                      type="text"
                      className={`${styles.input} ${errors.unit_measure ? styles.inputError : ''}`}
                      placeholder="Ej: NIU, KG, LTS"
                      value={formData.unit_measure}
                      onChange={(e) => handleInputChange('unit_measure', e.target.value)}
                      min="0"
                      step="1"
                    />
                    {errors.unit_measure && <p className={styles.errorText}>{errors.unit_measure}</p>}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Peso</label>
                    <input
                      type="number"
                      className={`${styles.input} ${errors.weight ? styles.inputError : ''}`}
                      placeholder="0 kg"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      min="0"
                      step="1"
                    />
                    {errors.weight && <p className={styles.errorText}>{errors.weight}</p>}
                  </div>
                </div>
                <div className={styles.rowThree}>
                  <div className={`${styles.field} ${styles.fullRow}`}>
                    <label className={styles.label}>Tipo de Impuesto</label>
                    <select
                      className={styles.input}
                      value={formData.tax_type}
                      onChange={(e) => handleInputChange('tax_type', e.target.value)}
                    >
                      {isEditMode && (
                        <option value="">-- Seleccionar afectación --</option>
                      )}
                      <option value="10">Gravado - Operación Onerosa (10)</option>
                      <option value="20">Exonerado (20)</option>
                      <option value="30">Inafecto (30)</option>
                      <option value="40">Exportación (40)</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* TAB: PRECIOS */}
            {activeTab === 'precios' && (
              <>
                {/* Header con información de categoría */}
                <div className={styles.pricesHeader}>
                  <div className={styles.pricesHeaderContent}>
                    <h3 className={styles.pricesTitle}>Gestión de Precios</h3>
                    <p className={styles.pricesDescription}>
                      Configura los precios de venta para cada lista de precios y almacén.
                    </p>
                  </div>

                  {/* Info de márgenes de categoría */}
                  {formData.category_id && (
                    <div className={styles.categoryMarginInfo}>
                      <div className={styles.marginBadge}>
                        <span className={styles.marginLabel}>Margen de categoría:</span>
                        <span className={styles.marginValue}>{categoryMargins.markup}%</span>
                      </div>
                      <div className={styles.marginBadge}>
                        <span className={styles.marginLabel}>Margen mínimo:</span>
                        <span className={styles.marginValue}>{categoryMargins.minMarkup}%</span>
                      </div>
                      {formData.average_cost > 0 && (
                        <div className={styles.marginBadge}>
                          <span className={styles.marginLabel}>Precio de compra:</span>
                          <span className={styles.marginValue}>S/{formData.average_cost}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Container de precios */}
                <div className={styles.pricesContainer}>
                  {prices.length === 0 ? (
                    <div className={styles.emptyPricesState}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className={styles.emptyPricesIcon}>
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <h3 className={styles.emptyPricesTitle}>Sin precios configurados</h3>
                      <p className={styles.emptyPricesText}>
                        Agrega el primer precio para este producto
                      </p>
                    </div>
                  ) : (
                    prices.map((price, index) => {
                      const priceList = priceLists.find(pl => pl.id === price.price_list_id);
                      const suggestedPrice = calculateSuggestedPrice(priceList?.code);

                      return (
                        <div key={index} className={styles.priceItem}>
                          <div className={styles.priceHeader}>
                            <h4 className={styles.priceItemTitle}>
                              Precio {index + 1}
                              {priceList && (
                                <span className={styles.priceListBadge}>
                                  {priceList.name}
                                </span>
                              )}
                            </h4>
                            {prices.length > 1 && (
                              <button
                                type="button"
                                className={styles.removePriceButton}
                                onClick={() => removePrice(index)}
                                title="Eliminar precio"
                              >
                                ×
                              </button>
                            )}
                          </div>

                          {/* Fila 1: Lista de precios y Almacén */}
                          <div className={styles.priceRow}>
                            <div className={styles.field}>
                              <label className={styles.label}>Tipo de precio *</label>
                              <select
                                className={styles.input}
                                value={price.price_list_id || ''}
                                onChange={(e) => updatePrice(index, 'price_list_id', parseInt(e.target.value))}
                              >
                                <option value="">Seleccionar lista</option>
                                {priceLists
                                  .filter(pl => {
                                    // Mostrar la lista actual siempre
                                    if (pl.id === price.price_list_id) return true;

                                    // Mostrar solo listas que no estén usadas con este almacén
                                    const isUsed = prices.some((p, idx) => {
                                      if (idx === index) return false; // No comparar consigo mismo
                                      return p.price_list_id === pl.id &&
                                        (p.warehouse_id || null) === (price.warehouse_id || null);
                                    });

                                    return !isUsed;
                                  })
                                  .map(pl => (
                                    <option key={pl.id} value={pl.id}>
                                      {pl.name} ({pl.code})
                                    </option>
                                  ))
                                }
                              </select>
                              {/* ✅ Mensaje de ayuda */}
                              {price.price_list_id && (
                                <p className={styles.hint}>
                                  Lista seleccionada: <strong>{priceLists.find(p => p.id === price.price_list_id)?.name}</strong>
                                </p>
                              )}
                            </div>

                            <div className={styles.field}>
                              <label className={styles.label}>Almacén</label>
                              <select
                                className={styles.input}
                                value={price.warehouse_id || ''}
                                onChange={(e) => updatePrice(index, 'warehouse_id', e.target.value ? parseInt(e.target.value) : null)}
                              >
                                <option value="">Todos los almacenes (General)</option>
                                {warehouses
                                  .filter(w => {
                                    // Mostrar el almacén actual siempre
                                    if (w.id === price.warehouse_id) return true;

                                    // Mostrar solo almacenes que no estén usados con esta lista
                                    if (!price.price_list_id) return true; // Si no hay lista, mostrar todos

                                    const isUsed = prices.some((p, idx) => {
                                      if (idx === index) return false;
                                      return p.price_list_id === price.price_list_id &&
                                        p.warehouse_id === w.id;
                                    });

                                    return !isUsed;
                                  })
                                  .map(w => (
                                    <option key={w.id} value={w.id}>
                                      {w.name}
                                    </option>
                                  ))
                                }
                              </select>
                              <p className={styles.hint}>
                                {price.warehouse_id
                                  ? `Precio específico para: ${warehouses.find(w => w.id === price.warehouse_id)?.name}`
                                  : 'Este precio aplica a todos los almacenes'
                                }
                              </p>
                            </div>
                          </div>

                          {/* Fila 2: Precio y Porcentaje de ganancia */}
                          <div className={styles.priceRow}>
                            <div className={styles.field}>
                              <label className={styles.label}>
                                Precio *
                                {suggestedPrice > 0 && (
                                  <span className={styles.suggestedPrice} title={
                                    priceList?.code === 'WHOLESALE' || priceList?.code === 'MIN_RETAIL'
                                      ? `Calculado con margen mínimo (${categoryMargins.minMarkup}%)`
                                      : `Calculado con margen normal (${categoryMargins.markup}%)`
                                  }>
                                    Sugerido: S/{suggestedPrice}
                                  </span>
                                )}
                              </label>
                              <div className={styles.inputWithPrefix}>
                                <span className={styles.inputPrefix}>S/</span>
                                <input
                                  type="number"
                                  className={styles.inputWithPrefixField}
                                  placeholder="0.00"
                                  value={price.price || ''}
                                  onChange={(e) => updatePrice(index, 'price', parseFloat(e.target.value) || 0)}
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              {price.min_price && (
                                <p className={styles.hint}>
                                  Precio mínimo: S/{price.min_price}
                                </p>
                              )}
                            </div>

                            <div className={styles.field}>
                              <label className={styles.label}>
                                Porcentaje de ganancia %
                                <input
                                  type="checkbox"
                                  className={styles.marginCheckbox}
                                  checked={!!price.use_margin}
                                  onChange={(e) => updatePrice(index, 'use_margin', e.target.checked)}
                                  title={price.use_margin ? "Desactivar control por margen" : "Activar control por margen"}
                                />
                              </label>
                              <div className={styles.inputWithSuffix}>
                                <input
                                  type="number"
                                  className={styles.inputWithSuffixField}
                                  placeholder={price.calculated_margin || '0.0'}
                                  value={price.margin_percentage || ''}
                                  onChange={(e) => {
                                    const margin = parseFloat(e.target.value) || 0;
                                    updatePrice(index, 'margin_percentage', margin);
                                  }}
                                  disabled={!price.use_margin}
                                  min="0"
                                  step="0.1"
                                />
                                <span className={styles.inputSuffix}>%</span>
                              </div>
                              {/* 👇 SIEMPRE mostrar el margen calculado */}
                              <p className={styles.hint} style={{
                                color: price.use_margin ? 'var(--primary)' : '#666',
                                fontWeight: price.use_margin ? 500 : 400
                              }}>
                                {price.use_margin
                                  ? `Margen configurado: ${price.calculated_margin || '0.00'}%`
                                  : `Margen calculado: ${price.calculated_margin || '0.00'}%`
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Botón agregar precio con validación */}
                {canAddMorePrices() ? (
                  <button
                    type="button"
                    className={styles.addPriceButton}
                    onClick={addPrice}
                    disabled={!priceLists || priceLists.length === 0 || priceListsLoading}
                  >
                    {priceListsLoading ? 'Cargando listas...' : '+ Agregar nuevo precio'}
                  </button>
                ) : (
                  <div className={styles.noPricesAvailable}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={styles.infoIcon}>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <p>Ya has configurado precios para todas las listas de precios disponibles</p>
                  </div>
                )}
              </>)}
          </div>

          {/* Footer con botón de submit */}
          <div className={styles.formFooter}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting} // 👈 DESHABILITAR CUANDO ESTÁ CARGANDO
            >
              {isSubmitting ? (
                <>
                  <svg
                    className={styles.spinner}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{ marginRight: '8px' }}
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeDasharray="60"
                      strokeLinecap="round"
                      opacity="0.25"
                    />
                    <path
                      d="M12 2a10 10 0 0 1 10 10"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                  {mode === 'create' ? 'Creando...' : 'Actualizando...'}
                </>
              ) : (
                isEditMode ? 'Actualizar Producto' : 'Crear Producto'
              )}
            </button>
          </div>
        </form>
      </div>
      {/* Modal de Confirmación */}
      <ConfirmModal
        open={showExitConfirm}
        message="¿Seguro que deseas salir? Los cambios no se guardarán."
        onCancel={() => setShowExitConfirm(false)}
        onConfirm={() => {
          setShowExitConfirm(false);
          onClose();
        }}
      />
    </div>
  );
};

export default ProductForm;