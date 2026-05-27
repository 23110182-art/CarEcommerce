import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm, Typography } from 'antd';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '@/features/category/categoryApi';

const { Title, Text } = Typography;

const CategoriesManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fetch categories
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getAllCategories,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: categoryApi.createCategory,
    onSuccess: () => {
      message.success('Category created');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      handleClose();
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Create failed');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => categoryApi.updateCategory(id, data),
    onSuccess: () => {
      message.success('Category updated');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      handleClose();
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Update failed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: categoryApi.deleteCategory,
    onSuccess: () => {
      message.success('Category deleted');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Delete failed');
    },
  });

  const openModal = (id?: string) => {
    setEditingId(id || null);
    if (id && categories) {
      const cat = categories.find((c) => c._id === id);
      if (cat) {
        form.setFieldsValue({ name: cat.name });
      }
    } else {
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingId(null);
    form.resetFields();
  };

  const handleSubmit = (values: any) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text style={{ color: 'white', fontWeight: 600 }}>{text}</Text>,
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      render: (text: string) => <Text style={{ color: 'var(--color-text-secondary)' }}>{text}</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="text" icon={<Edit2 size={16} />} onClick={() => openModal(record._id)} style={{ color: 'var(--color-accent)' }} />
          <Popconfirm
            title="Delete Category"
            description="Are you sure you want to delete this category?"
            onConfirm={() => deleteMutation.mutate(record._id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<Trash2 size={16} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <Title level={2} style={{ color: 'white', margin: 0 }}>
            Categories Management
          </Title>
          <Text style={{ color: 'var(--color-text-secondary)' }}>Manage car categories</Text>
        </div>
        <Button type="primary" icon={<Plus size={18} />} onClick={() => openModal()} style={{ height: '40px', fontWeight: 600 }}>
          Add Category
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={categories}
        rowKey="_id"
        loading={isLoading}
        pagination={{ pageSize: 8 }}
        style={{
          background: 'var(--color-surface)',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
        }}
      />
      <Modal
        title={editingId ? 'Edit Category' : 'Create Category'}
        open={isModalOpen}
        onCancel={handleClose}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText={editingId ? 'Save' : 'Create'}
        styles={{
          body: { background: 'var(--color-surface)' },
          header: { background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', paddingBottom: '15px' },
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label={<span style={{ color: 'var(--color-text-secondary)' }}>Category Name</span>}
            rules={[{ required: true, message: 'Please enter category name' }]}
          >
            <Input placeholder="e.g. SUV, Sedan" style={{ background: 'transparent', color: 'white' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoriesManagementPage;
