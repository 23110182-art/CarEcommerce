import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, InputNumber, Switch, Upload, message, Typography, Popconfirm, Avatar, Tabs } from 'antd';
import { Plus, Edit2, Trash2, UploadCloud, Eye } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { carApi } from '@/features/car/carApi';
import { brandApi } from '@/features/brand/brandApi';
import { categoryApi } from '@/features/category/categoryApi';
import { uploadApi } from '@/features/upload/uploadApi';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CarsManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Image Upload States
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isThumbnailUploading, setIsThumbnailUploading] = useState(false);
  const [carImages, setCarImages] = useState<string[]>([]);
  const [isImagesUploading, setIsImagesUploading] = useState(false);

  // Queries
  const { data: carsData, isLoading } = useQuery({
    queryKey: ['admin-cars'],
    queryFn: () => carApi.getAllCars({ limit: 100 }), // Fetch larger limit for admin management
  });

  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: brandApi.getAllBrands,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getAllCategories,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: carApi.createCar,
    onSuccess: () => {
      message.success('Car created successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-cars'] });
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      handleClose();
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Failed to create car');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => carApi.updateCar(id, data),
    onSuccess: () => {
      message.success('Car updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-cars'] });
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      handleClose();
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Failed to update car');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: carApi.deleteCar,
    onSuccess: () => {
      message.success('Car deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-cars'] });
      queryClient.invalidateQueries({ queryKey: ['cars'] });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Failed to delete car');
    },
  });

  // Upload Handlers
  const handleThumbnailUpload = async (file: File) => {
    setIsThumbnailUploading(true);
    try {
      const result = await uploadApi.uploadSingle(file);
      setThumbnailUrl(result.url);
      form.setFieldsValue({ thumbnail: result.url });
      message.success('Thumbnail uploaded!');
    } catch {
      message.error('Failed to upload thumbnail.');
    } finally {
      setIsThumbnailUploading(false);
    }
  };

  const handleMultipleImagesUpload = async (fileList: any) => {
    setIsImagesUploading(true);
    const files = Array.from(fileList) as File[];
    try {
      const result = await uploadApi.uploadMultiple(files);
      const newImages = [...carImages, ...result.urls];
      setCarImages(newImages);

      // Update form value
      const formattedImages = newImages.map((url, index) => ({ url, sort_order: index }));
      form.setFieldsValue({ images: formattedImages });

      message.success('Car images uploaded!');
    } catch {
      message.error('Failed to upload images.');
    } finally {
      setIsImagesUploading(false);
    }
  };

  const removeCarImage = (index: number) => {
    const updated = carImages.filter((_, idx) => idx !== index);
    setCarImages(updated);
    const formattedImages = updated.map((url, idx) => ({ url, sort_order: idx }));
    form.setFieldsValue({ images: formattedImages });
  };

  const handleOpen = (id: string | null = null) => {
    setEditingId(id);
    if (id) {
      const car = carsData?.cars.find((c) => c._id === id);
      if (car) {
        // Map details into form fields
        form.setFieldsValue({
          name: car.name,
          brand_id: car.brand?._id || (car as any).brand_id?._id || (car as any).brand_id,
          category_id: (car as any).category_id?._id || (car as any).category_id,
          price: car.price,
          sale_price: (car as any).sale_price,
          year: car.year,
          condition: (car as any).condition || 'new',
          mileage: (car as any).mileage || 0,
          fuel_type: (car as any).fuel_type || 'gasoline',
          transmission: car.transmission || 'automatic',
          seats: (car as any).seats || 4,
          color: (car as any).color || 'Black',
          engine: (car as any).engine,
          horsepower: (car as any).horsepower,
          stock: car.stock || 1,
          description: (car as any).description,
          thumbnail: (car as any).thumbnail || car.images[0],
          is_featured: car.isFeatured || (car as any).is_featured || false,
          images: (car as any).images || car.images.map((url, idx) => ({ url, sort_order: idx })),
          features: (car as any).features || [],
        });
        setThumbnailUrl((car as any).thumbnail || car.images[0] || null);
        setCarImages((car as any).images?.map((img: any) => img.url) || car.images || []);
      }
    } else {
      form.resetFields();
      setThumbnailUrl(null);
      setCarImages([]);
    }
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setThumbnailUrl(null);
    setCarImages([]);
    form.resetFields();
  };

  const handleSubmit = (values: any) => {
    // Form validation and standardizing parameters
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const columns = [
    {
      title: 'Vehicle',
      dataIndex: 'thumbnail',
      key: 'thumbnail',
      width: '100px',
      render: (_: string, record: any) => (
        <Avatar
          src={record.thumbnail || record.images?.[0] || undefined}
          shape="square"
          size={50}
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
        />
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text style={{ color: 'white', fontWeight: 600 }}>{text}</Text>,
    },
    {
      title: 'Brand',
      key: 'brand',
      render: (_: any, record: any) => <Text style={{ color: 'var(--color-text-secondary)' }}>{record.brand?.name || record.brand_id?.name || 'Unknown'}</Text>,
    },
    {
      title: 'Year',
      dataIndex: 'year',
      key: 'year',
      width: '100px',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (p: number) => <Text style={{ color: 'var(--color-accent)', fontWeight: 600 }}>${p.toLocaleString()}</Text>,
    },
    {
      title: 'Featured',
      dataIndex: 'isFeatured',
      key: 'isFeatured',
      render: (feat: boolean, record: any) => {
        const isF = feat || record.is_featured;
        return <Switch checked={isF} disabled />;
      },
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      width: '80px',
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
            title="Delete Vehicle"
            description="Are you sure you want to delete this car?"
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
          <Title level={2} style={{ color: 'white', margin: 0 }}>Cars Management</Title>
          <Text style={{ color: 'var(--color-text-secondary)' }}>Configure vehicle inventory, pricing and options</Text>
        </div>
        <Button
          type="primary"
          icon={<Plus size={18} />}
          onClick={() => handleOpen()}
          style={{ height: '40px', fontWeight: 600 }}
        >
          Add New Vehicle
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={carsData?.cars}
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
        title={editingId ? 'Edit Vehicle Details' : 'Add New Luxury Vehicle'}
        open={isModalOpen}
        onCancel={handleClose}
        width={800}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        styles={{
          body: { background: 'var(--color-surface)' },
          header: { background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', paddingBottom: '15px' }
        }}
        okText={editingId ? 'Save Changes' : 'Create Vehicle'}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: '20px' }}
        >
          <Tabs defaultActiveKey="1" items={[
            {
              key: '1',
              label: 'General Information',
              children: (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxHeight: '450px', overflowY: 'auto', paddingRight: '10px' }}>
                  <Form.Item
                    name="name"
                    label={<span style={{ color: 'var(--color-text-secondary)' }}>Model Name</span>}
                    rules={[{ required: true, message: 'Please enter model name' }]}
                    style={{ gridColumn: 'span 2' }}
                  >
                    <Input placeholder="e.g. Porsche 911 GT3 RS" style={{ background: 'transparent', color: 'white' }} />
                  </Form.Item>

                  <Form.Item
                    name="brand_id"
                    label={<span style={{ color: 'var(--color-text-secondary)' }}>Brand</span>}
                    rules={[{ required: true, message: 'Please select a brand' }]}
                  >
                    <Select placeholder="Select Brand">
                      {brands?.map(b => (
                        <Option key={b._id} value={b._id}>{b.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="category_id"
                    label={<span style={{ color: 'var(--color-text-secondary)' }}>Category</span>}
                    rules={[{ required: true, message: 'Please select a category' }]}
                  >
                    <Select placeholder="Select Category">
                      {categories?.map(c => (
                        <Option key={c._id} value={c._id}>{c.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="price"
                    label={<span style={{ color: 'var(--color-text-secondary)' }}>Base Price ($)</span>}
                    rules={[{ required: true, message: 'Please enter price' }]}
                  >
                    <InputNumber min={0} style={{ width: '100%', background: 'transparent', color: 'white' }} />
                  </Form.Item>

                  <Form.Item
                    name="sale_price"
                    label={<span style={{ color: 'var(--color-text-secondary)' }}>Sale Price ($ - Optional)</span>}
                  >
                    <InputNumber min={0} style={{ width: '100%', background: 'transparent', color: 'white' }} />
                  </Form.Item>

                  <Form.Item
                    name="year"
                    label={<span style={{ color: 'var(--color-text-secondary)' }}>Year</span>}
                    rules={[{ required: true, message: 'Please enter year' }]}
                  >
                    <InputNumber min={1900} max={new Date().getFullYear() + 2} style={{ width: '100%', background: 'transparent', color: 'white' }} />
                  </Form.Item>

                  <Form.Item
                    name="stock"
                    label={<span style={{ color: 'var(--color-text-secondary)' }}>Stock Qty</span>}
                    initialValue={1}
                  >
                    <InputNumber min={0} style={{ width: '100%', background: 'transparent', color: 'white' }} />
                  </Form.Item>

                  <Form.Item
                    name="condition"
                    label={<span style={{ color: 'var(--color-text-secondary)' }}>Condition</span>}
                    rules={[{ required: true }]}
                    initialValue="new"
                  >
                    <Select>
                      <Option value="new">Brand New</Option>
                      <Option value="used">Pre-owned</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="fuel_type"
                    label={<span style={{ color: 'var(--color-text-secondary)' }}>Fuel Type</span>}
                    rules={[{ required: true }]}
                    initialValue="gasoline"
                  >
                    <Select>
                      <Option value="gasoline">Gasoline</Option>
                      <Option value="diesel">Diesel</Option>
                      <Option value="electric">Electric</Option>
                      <Option value="hybrid">Hybrid</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="transmission"
                    label={<span style={{ color: 'var(--color-text-secondary)' }}>Transmission</span>}
                    rules={[{ required: true }]}
                    initialValue="automatic"
                  >
                    <Select>
                      <Option value="manual">Manual</Option>
                      <Option value="automatic">Automatic</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="seats"
                    label={<span style={{ color: 'var(--color-text-secondary)' }}>Seats</span>}
                    rules={[{ required: true }]}
                  >
                    <InputNumber min={1} style={{ width: '100%', background: 'transparent', color: 'white' }} />
                  </Form.Item>

                  <Form.Item
                    name="color"
                    label={<span style={{ color: 'var(--color-text-secondary)' }}>Color</span>}
                    rules={[{ required: true }]}
                  >
                    <Input placeholder="e.g. Jet Black Metallic" style={{ background: 'transparent', color: 'white' }} />
                  </Form.Item>

                  <Form.Item
                    name="engine"
                    label={<span style={{ color: 'var(--color-text-secondary)' }}>Engine Specification</span>}
                  >
                    <Input placeholder="e.g. 4.0L Twin-Turbo V8" style={{ background: 'transparent', color: 'white' }} />
                  </Form.Item>

                  <Form.Item
                    name="is_featured"
                    label={<span style={{ color: 'var(--color-text-secondary)' }}>Featured Vehicle</span>}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item
                    name="description"
                    label={<span style={{ color: 'var(--color-text-secondary)' }}>Mô tả chi tiết</span>}
                    style={{ gridColumn: 'span 2' }}
                  >
                    <TextArea rows={4} placeholder="Write premium copy about this luxury vehicle..." style={{ background: 'transparent', color: 'white' }} />
                  </Form.Item>
                </div>
              )
            },
            {
              key: '2',
              label: 'Images Gallery',
              children: (
                <div style={{ maxHeight: '450px', overflowY: 'auto', paddingRight: '10px' }}>
                  {/* Thumbnail */}
                  <div style={{ marginBottom: '30px' }}>
                    <Text strong style={{ color: 'white', display: 'block', marginBottom: '10px' }}>Cover/Thumbnail Image URL</Text>
                    <Form.Item name="thumbnail" rules={[{ required: true, message: 'Thumbnail image is required' }]}>
                      <Input
                        value={thumbnailUrl || undefined}
                        onChange={(e) => setThumbnailUrl(e.target.value)}
                        placeholder="https://example.com/cover.jpg (or upload below)"
                        style={{ background: 'transparent', color: 'white', marginBottom: '10px' }}
                      />
                    </Form.Item>
                    <Upload
                      beforeUpload={(file) => {
                        handleThumbnailUpload(file);
                        return false;
                      }}
                      showUploadList={false}
                    >
                      <Button loading={isThumbnailUploading} icon={<UploadCloud size={16} />}>Upload Cover Image</Button>
                    </Upload>
                    {thumbnailUrl && (
                      <div style={{ marginTop: '10px', background: '#1e2124', padding: '15px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                        <img src={thumbnailUrl} alt="Thumbnail Preview" style={{ maxHeight: '150px', borderRadius: '4px' }} />
                      </div>
                    )}
                  </div>

                  {/* Multiple Gallery Images */}
                  <div>
                    <Text strong style={{ color: 'white', display: 'block', marginBottom: '10px' }}>Detail Gallery Images</Text>
                    <Upload
                      multiple
                      beforeUpload={(_, fileList) => {
                        handleMultipleImagesUpload(fileList);
                        return false;
                      }}
                      showUploadList={false}
                    >
                      <Button loading={isImagesUploading} icon={<UploadCloud size={16} />} style={{ borderStyle: 'dashed', height: '44px', width: '100%' }}>
                        Upload Multiple Gallery Images to Cloudinary
                      </Button>
                    </Upload>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '15px', marginTop: '20px' }}>
                      {carImages.map((imgUrl, index) => (
                        <div key={index} style={{ position: 'relative', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden', height: '100px' }}>
                          <img src={imgUrl} alt={`Gallery ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <Button
                            danger
                            type="primary"
                            size="small"
                            icon={<Trash2 size={12} />}
                            onClick={() => removeCarImage(index)}
                            style={{ position: 'absolute', top: 5, right: 5, width: 22, height: 22, minWidth: 22, padding: 0 }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            },
            {
              key: '3',
              label: 'Detailed Specifications',
              children: (
                <div style={{ maxHeight: '450px', overflowY: 'auto', paddingRight: '10px' }}>
                  <Text style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: '20px' }}>
                    Add special technical highlights (e.g. Acceleration, Top Speed, Cargo Capacity, etc.)
                  </Text>

                  <Form.List name="features">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                            <Form.Item
                              {...restField}
                              name={[name, 'name']}
                              rules={[{ required: true, message: 'Feature name required' }]}
                            >
                              <Input placeholder="Feature Name (e.g. 0-60 mph)" style={{ background: 'transparent', color: 'white', width: 250 }} />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, 'value']}
                              rules={[{ required: true, message: 'Value required' }]}
                            >
                              <Input placeholder="Value (e.g. 3.2 seconds)" style={{ background: 'transparent', color: 'white', width: 250 }} />
                            </Form.Item>
                            <Button danger type="text" onClick={() => remove(name)} icon={<Trash2 size={16} />} />
                          </Space>
                        ))}
                        <Form.Item>
                          <Button type="dashed" onClick={() => add()} block icon={<Plus size={16} />}>
                            Add Feature Specification Row
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>
                </div>
              )
            }
          ]} />
        </Form>
      </Modal>
    </div>
  );
};

export default CarsManagementPage;
