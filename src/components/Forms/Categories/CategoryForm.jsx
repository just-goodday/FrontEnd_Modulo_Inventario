import { useState } from 'react';
import { Cascader } from 'antd';
import styles from './CategoryForm.module.css';

const CategoryForm = ({
  mode = 'create',
  initialData = null,
  onSubmit,
  onClose,
  allCategories = [] // Para el selector de padre
}) => {
  const isEditMode = mode === 'edit';

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    parent_id: initialData?.parent_id || null,
    description: initialData?.description || '',
    order: initialData?.order || '',
    is_active: initialData?.is_active ?? true,
    min_margin_percentage: initialData?.min_margin_percentage || '', // 👈 NUEVO
    normal_margin_percentage: initialData?.normal_margin_percentage || '', // 👈 NUEVO
  });

  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Calcular nivel según el padre seleccionado
  const calculateLevel = (parentId) => {
    if (!parentId) return 1;
    const parent = allCategories.find(cat => cat.id === parentId);
    if (!parent) return 1;
    return (parent.level || 1) + 1;
  };

  // Construir opciones del cascader (máximo 2 niveles para selección)
  const buildCascaderOptions = () => {
    const options = [];

    // Nivel 1 (Categorías principales)
    const level1 = allCategories.filter(cat => cat.level === 1);

    level1.forEach(cat1 => {
      // Filtrar la categoría actual en modo edición
      if (isEditMode && initialData?.id === cat1.id) return;

      const option = {
        value: cat1.id,
        label: cat1.name || cat1.nombre,
        disabled: cat1.level >= 3, // No permitir si ya es nivel 3
        children: []
      };

      // Nivel 2 (Familias)
      const level2 = allCategories.filter(cat =>
        (cat.parent_id === cat1.id || cat.parent?.id === cat1.id) && cat.level === 2
      );

      if (level2.length > 0) {
        level2.forEach(cat2 => {
          // Filtrar la categoría actual en modo edición
          if (isEditMode && initialData?.id === cat2.id) return;

          option.children.push({
            value: cat2.id,
            label: cat2.name || cat2.nombre,
            disabled: cat2.level >= 3
          });
        });
      }

      // Solo agregar si tiene children o si no está deshabilitado
      if (option.children.length > 0 || !option.disabled) {
        options.push(option);
      }
    });

    return options;
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

  const handleParentChange = (value) => {
    const parentId = value && value.length > 0 ? value[value.length - 1] : null;
    setFormData(prev => ({
      ...prev,
      parent_id: parentId
    }));
    setHasChanges(true);
  };

  // Construir el valor del cascader según el parent_id
  const getCascaderValue = () => {
    if (!formData.parent_id) return [];

    const parent = allCategories.find(cat => cat.id === formData.parent_id);
    if (!parent) return [];

    // Si es nivel 2, solo devolver su ID
    if (parent.level === 1) {
      return [parent.id];
    }

    // Si es nivel 3, devolver [parent_id del nivel 1, parent_id del nivel 2]
    if (parent.level === 2 && parent.parent_id) {
      return [parent.parent_id, parent.id];
    }

    return [parent.id];
  };

  const handleToggle = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
    setHasChanges(true);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    const level = calculateLevel(formData.parent_id);
    if (level > 3) {
      newErrors.parent_id = 'No se pueden crear más de 3 niveles de categorías';
    }

    // 👇 VALIDAR MÁRGENES
    const minMargin = parseFloat(formData.min_margin_percentage) || 0;
    const normalMargin = parseFloat(formData.normal_margin_percentage) || 0;

    if (minMargin < 0 || minMargin > 100) {
      newErrors.min_margin_percentage = 'El margen debe estar entre 0 y 100';
    }

    if (normalMargin < 0 || normalMargin > 100) {
      newErrors.normal_margin_percentage = 'El margen debe estar entre 0 y 100';
    }

    // ✅ Solo validar que normal >= mínimo si AMBOS son > 0
    // Si alguno es 0, significa que hereda, así que no validar
    if (minMargin > 0 && normalMargin > 0 && normalMargin < minMargin) {
      newErrors.normal_margin_percentage = 'El margen normal debe ser mayor o igual al mínimo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const level = calculateLevel(formData.parent_id);

    // 🔥 NUEVO: Construir objeto solo con campos modificados
    let dataToSend = {};

    if (isEditMode) {
      // Modo edición: enviar solo lo que cambió
      Object.keys(formData).forEach(key => {
        const currentValue = formData[key];
        const initialValue = initialData?.[key];

        // Comparar valores (considerar null, undefined, '' como equivalentes para algunos campos)
        const hasChanged = key === 'parent_id'
          ? currentValue !== initialValue
          : key === 'is_active'
            ? currentValue !== initialValue
            : String(currentValue || '') !== String(initialValue || '');

        if (hasChanged) {
          dataToSend[key] = currentValue;
        }
      });

      // Si cambió parent_id, incluir level recalculado
      if (dataToSend.parent_id !== undefined) {
        dataToSend.level = level;
      }

      // Convertir márgenes a número si están presentes
      if (dataToSend.min_margin_percentage !== undefined) {
        dataToSend.min_margin_percentage = dataToSend.min_margin_percentage
          ? parseFloat(dataToSend.min_margin_percentage)
          : 0;
      }
      if (dataToSend.normal_margin_percentage !== undefined) {
        dataToSend.normal_margin_percentage = dataToSend.normal_margin_percentage
          ? parseFloat(dataToSend.normal_margin_percentage)
          : 0;
      }

      // Si no hay cambios, no enviar nada
      if (Object.keys(dataToSend).length === 0) {
        onClose();
        return;
      }

      console.log('📤 Enviando solo campos modificados:', dataToSend);
    } else {
      // Modo creación: enviar todo
      dataToSend = {
        ...formData,
        level,
        parent_id: formData.parent_id || null,
        min_margin_percentage: formData.min_margin_percentage
          ? parseFloat(formData.min_margin_percentage)
          : 0,
        normal_margin_percentage: formData.normal_margin_percentage
          ? parseFloat(formData.normal_margin_percentage)
          : 0,
      };
    }

    if (onSubmit) {
      onSubmit(dataToSend);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      if (window.confirm('¿Seguro que deseas salir? Los cambios no se guardarán')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const currentLevel = calculateLevel(formData.parent_id);
  const levelText = currentLevel === 1 ? 'Categoría Principal' :
    currentLevel === 2 ? 'Familia' :
      'Subfamilia';

  return (
    <div className={styles.container}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h2 className={styles.title}>
              {isEditMode ? 'Editar Categoría' : 'Nueva Categoría'}
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

        {/* Form Content */}
        <div className={styles.formWrapper}>
          <div className={styles.form}>

            {/* Nivel indicador */}
            <div className={styles.levelIndicator}>
              <span className={styles.levelBadge}>
                Nivel {currentLevel}: {levelText}
              </span>
            </div>

            {/* Nombre */}
            <div className={styles.field}>
              <label className={styles.label}>Nombre de la Categoría *</label>
              <input
                type="text"
                className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                placeholder="Ej: Electrónica, Computadoras, Laptops"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                onKeyPress={handleKeyPress}
                autoFocus
              />
              {errors.name && <p className={styles.errorText}>{errors.name}</p>}
            </div>

            {/* Categoría Padre */}
            <div className={styles.field}>
              <label className={styles.label}>Categoría Padre</label>
              <Cascader
                options={buildCascaderOptions()}
                onChange={handleParentChange}
                value={getCascaderValue()}
                placeholder="Sin categoría padre (será nivel 1)"
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
                allowClear
              />
              <p className={styles.hint}>
                {formData.parent_id
                  ? `Esta categoría será de nivel ${currentLevel}`
                  : 'Dejar vacío para crear una categoría principal (nivel 1)'}
              </p>
              {errors.parent_id && <p className={styles.errorText}>{errors.parent_id}</p>}
            </div>

            {/* Descripción */}
            <div className={styles.field}>
              <label className={styles.label}>Descripción</label>
              <div className={styles.textareaWrapper}>
                <textarea
                  className={styles.textarea}
                  placeholder="Descripción de la categoría (opcional)..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  maxLength={255}
                />
                <span className={styles.charCount}>{formData.description.length}/255</span>
              </div>
            </div>

            {/* Márgenes */}
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Margen Mínimo (%)</label>
                <input
                  type="number"
                  className={`${styles.input} ${errors.min_margin_percentage ? styles.inputError : ''}`}
                  placeholder="0.00"
                  value={formData.min_margin_percentage}
                  onChange={(e) => handleInputChange('min_margin_percentage', e.target.value)}
                  min="0"
                  max="100"
                  step="0.01"
                />
                {errors.min_margin_percentage && (
                  <p className={styles.errorText}>{errors.min_margin_percentage}</p>
                )}
                <p className={styles.hint}>
                  {formData.parent_id
                    ? 'Dejar en 0 para heredar del padre'
                    : 'Dejar en 0 para usar configuración del sistema'}
                </p>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Margen Normal (%)</label>
                <input
                  type="number"
                  className={`${styles.input} ${errors.normal_margin_percentage ? styles.inputError : ''}`}
                  placeholder="0.00"
                  value={formData.normal_margin_percentage}
                  onChange={(e) => handleInputChange('normal_margin_percentage', e.target.value)}
                  min="0"
                  max="100"
                  step="0.01"
                />
                {errors.normal_margin_percentage && (
                  <p className={styles.errorText}>{errors.normal_margin_percentage}</p>
                )}
                <p className={styles.hint}>
                  {formData.parent_id
                    ? 'Dejar en 0 para heredar del padre'
                    : 'Dejar en 0 para usar configuración del sistema'}
                </p>
              </div>
            </div>

            {/* Orden */}
            <div className={styles.field}>
              <label className={styles.label}>Orden de Visualización</label>
              <input
                type="number"
                className={styles.input}
                placeholder="0 (se asigna automáticamente)"
                value={formData.order}
                onChange={(e) => handleInputChange('order', e.target.value)}
                onKeyPress={handleKeyPress}
                min="0"
                step="1"
              />
              <p className={styles.hint}>
                Dejar en blanco para asignar automáticamente al final
              </p>
            </div>

            {/* Toggle Activo */}
            <div className={styles.toggleContainer}>
              <label className={styles.toggleLabel}>Categoría Activa</label>
              <button
                type="button"
                className={`${styles.toggle} ${formData.is_active ? styles.toggleActive : ''}`}
                onClick={() => handleToggle('is_active')}
              >
                <span className={styles.toggleThumb} />
              </button>
            </div>

          </div>

          {/* Footer con botón */}
          <div className={styles.formFooter}>
            <button
              type="button"
              className={styles.submitButton}
              onClick={handleSubmit}
            >
              {isEditMode ? 'Actualizar Categoría' : 'Crear Categoría'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryForm;