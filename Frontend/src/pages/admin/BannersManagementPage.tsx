import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Switch, Upload, message, Typography, Popconfirm, Avatar } from 'antd';
import { Plus, Edit2, Trash2, UploadCloud } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bannerApi } from '@/features/banner/bannerApi';
import { uploadApi } from '@/features/upload/uploadApi';

const { Title, Text } = Typography;

const BannersManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Queries
  const { data: banners, isLoading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: () => bannerApi.getAllBanners(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: bannerApi.createBanner,
    onSuccess: () => {
      message.success('Banner created successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      handleClose();
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Failed to create banner');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => bannerApi.updateBanner(id, data),
    onSuccess: () => {
      message.success('Banner updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      handleClose();
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Failed to update banner');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) => 
      bannerApi.updateBanner(id, { is_active }),
    onSuccess: () => {
      message.success('Banner status updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Failed to toggle banner status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: bannerApi.deleteBanner,
    onSuccess: () => {
      message.success('Banner deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Failed to delete banner');
    },
  });

  // Upload Handlers
  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const result = await uploadApi.uploadSingle(file);
      setImageUrl(result.url);
      form.setFieldsValue({ image: result.url });
      message.success('Banner image uploaded!');
    } catch {
      message.error('Failed to upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpen = (id: string | null = null) => {
    setEditingId(id);
    if (id) {
      const banner = banners?.find((b) => b._id === id);
      if (banner) {
        form.setFieldsValue({
          title: banner.title,
          image: banner.image,
          link: banner.link,
          is_active: banner.is_active,
        });
        setImageUrl(banner.image);
      }
    } else {
      form.resetFields();
      setImageUrl(null);
      form.setFieldsValue({ is_active: true });
    }
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setImageUrl(null);
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
      title: 'Banner Image',
      dataIndex: 'image',
      key: 'image',
      width: '180px',
      render: (img: string) => (
        <Avatar 
          src={img} 
          shape="square" 
          style={{ width: '140px', height: '60px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '6px' }}
        />
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <Text style={{ color: 'white', fontWeight: 600 }}>{text}</Text>,
    },
    {
      title: 'Link URL',
      dataIndex: 'link',
      key: 'link',
      render: (text: string) => <Text style={{ color: 'var(--color-text-secondary)' }}>{text || 'None'}</Text>,
    },
    {
      title: 'Active',
      dataIndex: 'is_active',
      key: 'is_active',
      width: '120px',
      render: (active: boolean, record: any) => (
        <Switch 
          checked={active} 
          onChange={(checked) => toggleActiveMutation.mutate({ id: record._id, is_active: checked })}
          disabled={toggleActiveMutation.isPending}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '120px',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<Edit2 size={16} />} 
            onClick={() => handleOpen(record._id)}
            style={{ color: 'var(--color-accent)' }}
          />
          <Popconfirm
            title="Delete Banner"
            description="Are you sure you want to delete this promotional banner?"
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
          <Title level={2} style={{ color: 'white', margin: 0 }}>Banners Management</Title>
          <Text style={{ color: 'var(--color-text-secondary)' }}>Configure promotional and slider banners for the homepage showroom</Text>
        </div>
        <Button 
          type="primary" 
          icon={<Plus size={18} />} 
          onClick={() => handleOpen()}
          style={{ height: '40px', fontWeight: 600 }}
        >
          Add Banner
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={banners} 
        rowKey="_id"
        loading={isLoading}
        style={{
          background: 'var(--color-surface)',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
        }}
        pagination={{ pageSize: 5 }}
      />

      <Modal
        title={editingId ? 'Edit Banner Slide' : 'Create New Showroom Banner'}
        open={isModalOpen}
        onCancel={handleClose}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        styles={{ 
          body: { background: 'var(--color-surface)' }, 
          header: { background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', paddingBottom: '15px' }
        }}
        okText={editingId ? 'Save Changes' : 'Create Banner'}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: '20px' }}
        >
          <Form.Item
            name="title"
            label={<span style={{ color: 'var(--color-text-secondary)' }}>Banner Title</span>}
            rules={[{ required: true, message: 'Please enter banner title' }]}
          >
            <Input 
              placeholder="e.g. Experience the Speed: Porsche Carrera GT" 
              style={{ background: 'transparent', color: 'white' }}
            />
          </Form.Item>

          <Form.Item
            name="link"
            label={<span style={{ color: 'var(--color-text-secondary)' }}>Promotional Link URL (Optional)</span>}
          >
            <Input 
              placeholder="/cars?brand=Porsche" 
              style={{ background: 'transparent', color: 'white' }}
            />
          </Form.Item>

          <Form.Item
            name="image"
            label={<span style={{ color: 'var(--color-text-secondary)' }}>Banner Image URL</span>}
            rules={[{ required: true, message: 'Banner image is required' }]}
          >
            <Input 
              value={imageUrl || undefined}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/banner.jpg (or upload below)" 
              style={{ background: 'transparent', color: 'white', marginBottom: '15px' }}
            />
          </Form.Item>

          <div style={{ marginBottom: '20px' }}>
            <Upload
              beforeUpload={(file) => {
                handleImageUpload(file);
                return false;
              }}
              showUploadList={false}
            >
              <Button 
                block 
                loading={isUploading}
                icon={<UploadCloud size={16} />}
                style={{ height: '50px', borderStyle: 'dashed' }}
              >
                Upload Banner Image to Cloudinary
              </Button>
            </Upload>
          </div>

          {imageUrl && (
            <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <img src={imageUrl} alt="Banner Preview" style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '4px', objectFit: 'cover' }} />
            </div>
          )}

          <Form.Item
            name="is_active"
            label={<span style={{ color: 'var(--color-text-secondary)' }}>Active (Display on Homepage Carousel)</span>}
            valuePropName="checked"
            style={{ marginTop: '20px' }}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BannersManagementPage;
