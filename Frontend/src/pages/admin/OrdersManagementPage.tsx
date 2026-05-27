import { useMemo, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Descriptions,
  Form,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { getAdminOrders, orderQueryKeys, reviewCancelRequest, updateOrderStatus } from '@/features/order/orderApi';
import type { Order, OrderListParams, OrderStatus } from '@/features/order/orderTypes';

const { Title, Text } = Typography;

const statusColorMap: Record<OrderStatus, string> = {
  pending: 'gold',
  confirmed: 'blue',
  preparing: 'purple',
  shipping: 'cyan',
  delivered: 'green',
  cancelled: 'red',
};

const statusOptions = [
  { label: 'Đơn hàng mới', value: 'pending' },
  { label: 'Đã xác nhận thủ công', value: 'confirmed' },
  { label: 'Shop đang chuẩn bị hàng', value: 'preparing' },
  { label: 'Đang giao hàng', value: 'shipping' },
  { label: 'Đã giao thành công', value: 'delivered' },
  { label: 'Hủy đơn hàng', value: 'cancelled' },
];

const statusLabelMap: Record<OrderStatus, string> = {
  pending: 'Đơn hàng mới',
  confirmed: 'Đã xác nhận thủ công',
  preparing: 'Shop đang chuẩn bị hàng',
  shipping: 'Đang giao hàng',
  delivered: 'Đã giao thành công',
  cancelled: 'Hủy đơn hàng',
};

const paymentStatusOptions = [
  { label: 'Chờ thanh toán', value: 'pending' },
  { label: 'Đã thanh toán', value: 'paid' },
  { label: 'Hoàn tiền', value: 'refunded' },
  { label: 'Thất bại', value: 'failed' },
];

const OrdersManagementPage = () => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<OrderListParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data, isLoading } = useQuery({
    queryKey: orderQueryKeys.list(filters),
    queryFn: () => getAdminOrders(filters),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      updateOrderStatus(orderId, { status }),
    onSuccess: () => {
      message.success('Cập nhật trạng thái đơn hàng thành công.');
      queryClient.invalidateQueries({ queryKey: orderQueryKeys.all });
    },
    onError: () => {
      message.error('Không thể cập nhật trạng thái đơn hàng.');
    },
  });

  const reviewCancelMutation = useMutation({
    mutationFn: ({
      orderId,
      action,
      adminNote,
    }: {
      orderId: string;
      action: 'approve' | 'reject';
      adminNote?: string;
    }) => reviewCancelRequest(orderId, { action, adminNote }),
    onSuccess: () => {
      message.success('Đã xử lý yêu cầu hủy đơn.');
      queryClient.invalidateQueries({ queryKey: orderQueryKeys.all });
    },
    onError: () => {
      message.error('Không thể xử lý yêu cầu hủy đơn.');
    },
  });

  const orders = data?.orders ?? [];
  const meta = data?.pagination;

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setFilters((prev) => ({
      ...prev,
      page: pagination.current || 1,
      limit: pagination.pageSize || 10,
    }));
  };

  const handleSearch = () => {
    const values = form.getFieldsValue();
    setFilters((prev) => ({
      ...prev,
      page: 1,
      search: values.search || undefined,
      status: values.status || undefined,
      paymentStatus: values.paymentStatus || undefined,
      cancelRequestStatus: values.cancelRequestStatus || undefined,
      from: values.range?.[0]?.format('YYYY-MM-DD'),
      to: values.range?.[1]?.format('YYYY-MM-DD'),
    }));
  };

  const columns: ColumnsType<Order> = useMemo(
    () => [
      {
        title: 'Mã đơn',
        dataIndex: 'orderNumber',
        key: 'orderNumber',
        render: (value: string | undefined, record) => (
          <Space direction="vertical" size={0}>
            <Text strong>{value || record._id.slice(-8).toUpperCase()}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {dayjs(record.createdAt).format('DD/MM/YYYY HH:mm')}
            </Text>
          </Space>
        ),
      },
      {
        title: 'Khách hàng',
        key: 'customer',
        render: (_, record) => {
          return (
            <Space direction="vertical" size={0}>
              <Text strong>{record.customer?.name || 'Khách hàng'}</Text>
              <Text type="secondary">{record.customer?.email || record.customer?.phone}</Text>
            </Space>
          );
        },
      },
      {
        title: 'Xe',
        key: 'car',
        render: (_, record) => {
          const item = record.items?.[0];
          return (
            <Space direction="vertical" size={0}>
              <Text strong>{item?.carName || 'Không có thông tin xe'}</Text>
              <Text type="secondary">
                Số lượng: {item?.quantity || 0}
              </Text>
            </Space>
          );
        },
      },
      {
        title: 'Thanh toán',
        dataIndex: 'paymentMethod',
        render: (value, record) => (
          <Space direction="vertical" size={0}>
            <Tag color="gold">{String(value).toUpperCase()}</Tag>
            <Text type="secondary">{record.paymentStatus}</Text>
          </Space>
        ),
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        render: (value: OrderStatus, record) => (
          <Space direction="vertical" size={4}>
            <Tag color={statusColorMap[value]}>{statusLabelMap[value]}</Tag>
            {record.cancel_request?.status === 'pending' && (
              <Tag color="orange">Có yêu cầu hủy</Tag>
            )}
          </Space>
        ),
      },
      {
        title: 'Tổng tiền',
        dataIndex: 'totalAmount',
        render: (value: number) => `${value.toLocaleString('vi-VN')} VNĐ`,
      },
      {
        title: 'Thao tác',
        key: 'actions',
        fixed: 'right',
        render: (_, record) => (
          <Space direction="vertical">
            <Select
              value={record.status}
              style={{ width: 220 }}
              options={statusOptions}
              loading={updateStatusMutation.isPending}
              disabled={record.status === 'cancelled'}
              onChange={(status) => updateStatusMutation.mutate({ orderId: record._id, status })}
            />
            {record.cancel_request?.status === 'pending' && (
              <Space>
                <Popconfirm
                  title="Duyệt hủy đơn?"
                  okText="Duyệt"
                  cancelText="Đóng"
                  onConfirm={() => reviewCancelMutation.mutate({ orderId: record._id, action: 'approve' })}
                >
                  <Button size="small" danger loading={reviewCancelMutation.isPending}>
                    Duyệt hủy
                  </Button>
                </Popconfirm>
                <Popconfirm
                  title="Từ chối yêu cầu hủy?"
                  okText="Từ chối"
                  cancelText="Đóng"
                  onConfirm={() => reviewCancelMutation.mutate({ orderId: record._id, action: 'reject' })}
                >
                  <Button size="small" loading={reviewCancelMutation.isPending}>
                    Từ chối
                  </Button>
                </Popconfirm>
              </Space>
            )}
          </Space>
        ),
      },
    ],
    [reviewCancelMutation, updateStatusMutation]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <Title level={2} style={{ marginBottom: 8 }}>
          Quản lý đơn hàng
        </Title>
        <Text type="secondary">Theo dõi, lọc và cập nhật trạng thái đơn hàng khách hàng.</Text>
      </div>

      <Card
        style={{
          borderRadius: 20,
          background: 'rgba(255,255,255,0.03)',
          borderColor: 'rgba(255,255,255,0.08)',
        }}
      >
        <Form form={form} layout="vertical" initialValues={{}}>
          <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
            <Form.Item name="search" label="Tìm kiếm" style={{ minWidth: 220, marginBottom: 0 }}>
              <Input placeholder="Mã đơn, khách hàng, xe..." allowClear />
            </Form.Item>
            <Form.Item name="status" label="Trạng thái" style={{ minWidth: 180, marginBottom: 0 }}>
              <Select allowClear placeholder="Tất cả" options={statusOptions} />
            </Form.Item>
            <Form.Item name="paymentStatus" label="Thanh toán" style={{ minWidth: 180, marginBottom: 0 }}>
              <Select allowClear placeholder="Tất cả" options={paymentStatusOptions} />
            </Form.Item>
            <Form.Item name="cancelRequestStatus" label="Yêu cầu hủy" style={{ minWidth: 180, marginBottom: 0 }}>
              <Select
                allowClear
                placeholder="Tất cả"
                options={[
                  { label: 'Không có', value: 'none' },
                  { label: 'Chờ duyệt', value: 'pending' },
                  { label: 'Đã duyệt', value: 'approved' },
                  { label: 'Từ chối', value: 'rejected' },
                ]}
              />
            </Form.Item>
            <Form.Item name="range" label="Khoảng thời gian" style={{ minWidth: 260, marginBottom: 0 }}>
              <DatePicker.RangePicker style={{ width: '100%' }} />
            </Form.Item>
            <Button type="primary" onClick={handleSearch}>
              Lọc
            </Button>
          </Space>
        </Form>
      </Card>

      <Card
        style={{
          borderRadius: 20,
          background: 'rgba(255,255,255,0.03)',
          borderColor: 'rgba(255,255,255,0.08)',
        }}
      >
        <Table<Order>
          rowKey="_id"
          loading={isLoading}
          columns={columns}
          dataSource={orders}
          pagination={{
            current: meta?.page ?? filters.page,
            pageSize: meta?.limit ?? filters.limit,
            total: meta?.total ?? 0,
            showSizeChanger: true,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />

        {meta && (
          <Descriptions size="small" column={4} style={{ marginTop: 16 }}>
            <Descriptions.Item label="Tổng đơn">{meta.total}</Descriptions.Item>
            <Descriptions.Item label="Trang hiện tại">{meta.page}</Descriptions.Item>
            <Descriptions.Item label="Tổng trang">{meta.totalPages}</Descriptions.Item>
            <Descriptions.Item label="Kích thước trang">{meta.limit}</Descriptions.Item>
          </Descriptions>
        )}
      </Card>
    </div>
  );
};

export default OrdersManagementPage;
