import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Upload, message, Typography, Popconfirm, Avatar } from 'antd';
import { Plus, Edit2, Trash2, UploadCloud } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { brandApi } from '@/features/brand/brandApi';
import { uploadApi } from '@/features/upload/uploadApi';

const { Title, Text } = Typography;

const BrandsManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Queries
  const { data: brands, isLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: brandApi.getAllBrands,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: brandApi.createBrand,
    onSuccess: () => {
      message.success('Brand created successfully!');
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      handleClose();
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Failed to create brand');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => brandApi.updateBrand(id, data),
    onSuccess: () => {
      message.success('Brand updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      handleClose();
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Failed to update brand');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: brandApi.deleteBrand,
    onSuccess: () => {
      message.success('Brand deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Failed to delete brand');
    },
  });

  // Upload Logic
  const handleLogoUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const result = await uploadApi.uploadSingle(file);
      setLogoUrl(result.url);
      form.setFieldsValue({ logo: result.url });
      message.success('Logo uploaded successfully!');
    } catch {
      message.error('Failed to upload logo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpen = (id: string | null = null) => {
    setEditingId(id);
    if (id) {
      const brand = brands?.find((b) => b._id === id);
      if (brand) {
        form.setFieldsValue({
          name: brand.name,
          logo: brand.logo,
        });
        setLogoUrl(brand.logo || null);
      }
    } else {
      form.resetFields();
      setLogoUrl(null);
    }
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setLogoUrl(null);
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
      title: 'Logo',
      dataIndex: 'logo',
      key: 'logo',
      width: '100px',
      render: (logo: string, record: any) => (
        <Avatar 
          src={logo || undefined} 
          shape="square" 
          size={50}
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
        >
          {record.name.substring(0, 2).toUpperCase()}
        </Avatar>
      ),
    },
    {
      title: 'Brand Name',
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
      width: '150px',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<Edit2 size={16} />} 
            onClick={() => handleOpen(record._id)}
            style={{ color: 'var(--color-accent)' }}
          />
          <Popconfirm
            title="Delete Brand"
            description="Are you sure you want to delete this brand?"
            onConfirm={() => deleteMutation.mutate(record._id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button 
              type="text" 
              danger 
              icon={<Trash2 size={16} />} 
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <Title level={2} style={{ color: 'white', margin: 0 }}>Brands Management</Title>
          <Text style={{ color: 'var(--color-text-secondary)' }}>Configure car brands and their logos</Text>
        </div>
        <Button 
          type="primary" 
          icon={<Plus size={18} />} 
          onClick={() => handleOpen()}
          style={{ height: '40px', fontWeight: 600 }}
        >
          Add Brand
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={brands} 
        rowKey="_id"
        loading={isLoading}
        style={{
          background: 'var(--color-surface)',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
        }}
        pagination={{ pageSize: 8 }}
      />

      <Modal
        title={editingId ? 'Edit Brand' : 'Create New Brand'}
        open={isModalOpen}
        onCancel={handleClose}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        styles={{ 
          body: { background: 'var(--color-surface)' }, 
          header: { background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', paddingBottom: '15px' }
        }}
        okText={editingId ? 'Save Changes' : 'Create Brand'}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: '20px' }}
        >
          <Form.Item
            name="name"
            label={<span style={{ color: 'var(--color-text-secondary)' }}>Brand Name</span>}
            rules={[{ required: true, message: 'Please enter brand name' }]}
          >
            <Input 
              placeholder="e.g. Porsche, Ferrari" 
              style={{ background: 'transparent', color: 'white' }}
            />
          </Form.Item>

          <Form.Item
            name="logo"
            label={<span style={{ color: 'var(--color-text-secondary)' }}>Brand Logo URL</span>}
          >
            <Input 
              value={logoUrl || undefined}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png (or upload below)" 
              style={{ background: 'transparent', color: 'white', marginBottom: '15px' }}
            />
          </Form.Item>

          <div style={{ marginBottom: '20px' }}>
            <Upload
              beforeUpload={(file) => {
                handleLogoUpload(file);
                return false; // Stop default upload flow
              }}
              showUploadList={false}
            >
              <Button 
                block 
                loading={isUploading}
                icon={<UploadCloud size={16} />}
                style={{ height: '50px', borderStyle: 'dashed' }}
              >
                Upload Logo Image to Cloudinary
              </Button>
            </Upload>
          </div>

          {logoUrl && (
            <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <img src={logoUrl} alt="Logo Preview" style={{ maxHeight: '100px', objectFit: 'contain' }} />
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default BrandsManagementPage;
