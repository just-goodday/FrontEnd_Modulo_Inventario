import React, { useState, useEffect } from 'react';
import { useHeader } from '../../../context/useHeader';
import { StatsCardGrid } from '../../../components/StatsCards/StatCard';
import PageHeader from '../../../components/Header/PageHeader/PageHeader';
import CategoryTable from '../../../components/Table/CategoryTable';
import { useCategoriesContext } from '../../../context/CategoriesContext';
import { getCategories } from '../services/categoryService';
import CategoryForm from '../../../components/Forms/Categories/CategoryForm';

export default function CategoriesList() {
  const { setPageTitle } = useHeader();

  const {
    categories,
    categoryTree,
    pagination,
    loading,
    fetchCategories,
    fetchCategoryTree,
    createCategory,
    updateCategory,
    deleteCategory
  } = useCategoriesContext();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [allCategories, setAllCategories] = useState([]);

  useEffect(() => {
    setPageTitle('Categorías');
  }, [setPageTitle]);

  // 🔥 FIX: Cargar con filtro inicial de nivel 1 y parent_id null
  useEffect(() => {
    // Filtros iniciales: solo categorías principales (nivel 1, sin padre)
    const initialFilters = {
      level: 1,
      parent_id: null
    };

    console.log('🚀 Cargando categorías iniciales con filtros:', initialFilters);

    fetchCategories('', 10, 1, initialFilters);
    fetchCategoryTree(true);
    loadAllCategories();
  }, [fetchCategories, fetchCategoryTree]);

  // Cargar TODAS las categorías activas para el formulario
  const loadAllCategories = async () => {
    try {
      const response = await getCategories('', 1000, 1, { is_active: 1 });
      if (response.data) {
        setAllCategories(response.data || []);
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  const handleCreateCategory = () => {
    setFormMode('create');
    setSelectedCategory(null);
    setIsFormOpen(true);
  };

  const handleEditCategory = (category) => {
    setFormMode('edit');
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const handleDeleteCategory = async (category) => {
    if (window.confirm(`¿Eliminar la categoría "${category.name}"?`)) {
      const result = await deleteCategory(category.id);
      if (result.success) {
        loadAllCategories();
      }
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedCategory(null);
  };

  const handleSubmitForm = async (formData) => {
    try {
      console.log('📝 Datos del formulario:', {
        mode: formMode,
        categoryId: selectedCategory?.id,
        fieldsToSend: Object.keys(formData),
        data: formData
      });

      let result;
      if (formMode === 'create') {
        result = await createCategory(formData);
      } else {
        result = await updateCategory(selectedCategory.id, formData);
      }

      if (result.success) {
        loadAllCategories();
        handleCloseForm();
      }
    } catch (error) {
      console.error('Error al guardar categoría:', error);
    }
  };
  
  const categoryStats = [
    {
      title: 'Total Categorías',
      value: pagination?.total?.toLocaleString() || '0',
      icon: 'FolderTree',
      iconBgColor: 'var(--primary)',
    },
    {
      title: 'Activas',
      value: categories.filter(c => c.is_active || c.activo).length.toLocaleString(),
      icon: 'CheckCircle',
      iconBgColor: 'var(--success)',
    },
    {
      title: 'Nivel 1',
      value: categories.filter(c => c.level === 1).length.toLocaleString(),
      icon: 'Folder',
      iconBgColor: '#3b82f6',
    },
    {
      title: 'Total Productos', // 👈 Cambiar título
      value: categories.reduce((sum, c) => sum + (c.total_products ?? c.product_count ?? 0), 0).toLocaleString(), // 👈 Sumar total_products
      icon: 'Package',
      iconBgColor: '#a855f7',
    }
  ];
  return (
    <>
      <PageHeader
        title="Gestión de Categorías"
        subtitle="Administra las relaciones entre familias y subfamilias"
      />

      <div style={{ marginBottom: '32px' }}>
        <StatsCardGrid stats={categoryStats} columns={4} />
      </div>

      <CategoryTable
        categories={categories}
        categoryTree={categoryTree}
        paginationData={pagination}
        loading={loading}
        onFetchCategories={fetchCategories}
        onCreateCategory={handleCreateCategory}
        onEditCategory={handleEditCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      {isFormOpen && (
        <CategoryForm
          mode={formMode}
          initialData={selectedCategory}
          allCategories={allCategories}
          onSubmit={handleSubmitForm}
          onClose={handleCloseForm}
        />
      )}
    </>
  );
}