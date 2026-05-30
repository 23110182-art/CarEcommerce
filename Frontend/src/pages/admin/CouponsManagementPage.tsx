import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Space, Card, Typography, Modal, Form, Input, Select, DatePicker, Switch, message, Popconfirm, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import { couponApi } from '@/features/car/newFeaturesApi';
import type { Coupon } from '@/features/car/newFeaturesTypes';

const { Title } = Typography;

export const CouponsManagementPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [form] = Form.useForm();

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: couponApi.getAllCoupons,
  });

  const createMutation = useMutation({
    mutationFn: couponApi.createCoupon,
    onSuccess: () => {
      message.success('Tạo mã giảm giá thành công');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      handleCloseModal();
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Coupon> }) => couponApi.updateCoupon(id, data),
    onSuccess: () => {
      message.success('Cập nhật mã giảm giá thành công');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      handleCloseModal();
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: couponApi.deleteCoupon,
    onSuccess: () => {
      message.success('Xóa mã giảm giá thành công');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const handleOpenModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      form.setFieldsValue({
        ...coupon,
        expiryDate: dayjs(coupon.expiryDate),
      });
    } else {
      setEditingCoupon(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
    form.resetFields();
  };

  const handleSubmit = (values: any) => {
    const formattedValues = {
      ...values,
      expiryDate: values.expiryDate.toISOString(),
    };

    if (editingCoupon) {
      updateMutation.mutate({ id: editingCoupon._id, data: formattedValues });
    } else {
      createMutation.mutate(formattedValues);
    }
  };

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      render: (text: string) => <strong style={{ color: '#faad14' }}>{text}</strong>,
    },
    {
      title: 'Loại giảm giá',
      dataIndex: 'discountType',
      key: 'discountType',
      render: (type: string) => (type === 'percentage' ? 'Phần trăm (%)' : 'Số tiền cố định'),
    },
    {
      title: 'Giá trị giảm',
      dataIndex: 'discountValue',
      key: 'discountValue',
      render: (val: number, record: Coupon) =>
        record.discountType === 'percentage' ? `${val}%` : `${val.toLocaleString('vi-VN')} đ`,
    },
    {
      title: 'Đơn tối thiểu',
      dataIndex: 'minOrderValue',
      key: 'minOrderValue',
      render: (val: number) => `${(val || 0).toLocaleString('vi-VN')} đ`,
    },
    {
      title: 'Ngày hết hạn',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: boolean) => (
        <Switch disabled checked={active} checkedChildren="Bật" unCheckedChildren="Tắt" />
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Coupon) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
          <Popconfirm
            title="Bạn có chắc muốn xóa mã này?"
            onConfirm={() => deleteMutation.mutate(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      style={{
        borderRadius: 20,
        background: 'rgba(255, 255, 255, 0.03)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0 }}>
          Quản lý mã giảm giá & Coupons
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          Tạo mã mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={coupons}
        rowKey="_id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingCoupon ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã giảm giá mới'}
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ isActive: true }}>
          <Form.Item
            name="code"
            label="Mã giảm giá"
            rules={[{ required: true, message: 'Vui lòng nhập mã giảm giá' }]}
          >
            <Input placeholder="Mã viết liền không dấu, ví dụ: CARNEW10" style={{ textTransform: 'uppercase' }} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="discountType"
                label="Loại giảm giá"
                rules={[{ required: true, message: 'Vui lòng chọn loại giảm giá' }]}
              >
                <Select>
                  <Select.Option value="percentage">Phần trăm (%)</Select.Option>
                  <Select.Option value="fixed">Số tiền cố định</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="discountValue"
                label="Giá trị giảm"
                rules={[{ required: true, message: 'Vui lòng nhập giá trị giảm' }]}
              >
                <Input type="number" placeholder="Ví dụ: 10 (cho 10%) hoặc 100000" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="minOrderValue" label="Giá trị đơn hàng tối thiểu">
                <Input type="number" placeholder="Ví dụ: 500000" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expiryDate"
                label="Ngày hết hạn"
                rules={[{ required: true, message: 'Vui lòng chọn ngày hết hạn' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="isActive" label="Kích hoạt" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default CouponsManagementPage;