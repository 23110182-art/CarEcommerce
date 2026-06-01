import React, { useEffect, useMemo, useState } from "react";
import {
  App,
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  Upload,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import {
  CalendarOutlined,
  EditOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

import { userApi, type User } from "@/features/user/userApi";
import { uploadApi } from "@/features/upload/uploadApi";
import {
  getMyOrders,
  orderQueryKeys,
  requestCancelOrder,
} from "@/features/order/orderApi";
import type {
  Order,
  OrderListParams,
  OrderStatus,
} from "@/features/order/orderTypes";
import OrderDetailModal from "@/components/OrderDetailModal";

const { Title, Text } = Typography;
const { Option } = Select;

interface ProfileFormValues {
  name: string;
  phone?: string;
  address?: string;
  dob?: Dayjs | null;
  gender?: User["gender"];
}

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
}

const statusColorMap: Record<OrderStatus, string> = {
  pending: "gold",
  confirmed: "blue",
  preparing: "purple",
  shipping: "cyan",
  delivered: "green",
  cancelled: "red",
};

const orderStatusOptions = [
  { label: "Đơn hàng mới", value: "pending" },
  { label: "Đã xác nhận thủ công", value: "confirmed" },
  { label: "Shop đang chuẩn bị hàng", value: "preparing" },
  { label: "Đang giao hàng", value: "shipping" },
  { label: "Đã giao thành công", value: "delivered" },
  { label: "Hủy đơn hàng", value: "cancelled" },
];

const statusLabelMap: Record<OrderStatus, string> = {
  pending: "Đơn hàng mới",
  confirmed: "Đã xác nhận thủ công",
  preparing: "Shop đang chuẩn bị hàng",
  shipping: "Đang giao hàng",
  delivered: "Đã giao thành công",
  cancelled: "Hủy đơn hàng",
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const maybeError = error as {
    response?: { data?: { message?: string }; status?: number };
  };
  return maybeError.response?.data?.message || fallback;
};

export const ProfilePage: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(
    (location.state as { activeTab?: string } | null)?.activeTab || "profile",
  );
  const [filters, setFilters] = useState<OrderListParams>({
    page: 1,
    limit: 6,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>();
  const [orderDetailVisible, setOrderDetailVisible] = useState(false);

  const [form] = Form.useForm<ProfileFormValues>();
  const [passwordForm] = Form.useForm<PasswordFormValues>();
  const [orderFilterForm] = Form.useForm();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await userApi.getProfile();
      setProfile(data);
      form.setFieldsValue({
        name: data.name,
        phone: data.phone || "",
        address: data.address || "",
        dob: data.dob ? dayjs(data.dob) : null,
        gender: data.gender || "male",
      });
    } catch (error) {
      message.error(getErrorMessage(error, "Failed to load profile"));
      const maybeError = error as { response?: { status?: number } };
      if (maybeError.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      message.error("Please log in to access your profile.");
      navigate("/login");
      return;
    }
    fetchProfile();
  }, []);

  const { data: orderData, isLoading: ordersLoading } = useQuery({
    queryKey: orderQueryKeys.mine(filters),
    queryFn: () => getMyOrders(filters),
    enabled: activeTab === "orders",
  });

  const cancelMutation = useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason?: string }) =>
      requestCancelOrder(orderId, { reason }),
    onSuccess: () => {
      message.success("Yêu cầu hủy đơn đã được xử lý.");
      queryClient.invalidateQueries({ queryKey: orderQueryKeys.all });
    },
    onError: () => {
      message.error("Không thể hủy hoặc gửi yêu cầu hủy đơn.");
    },
  });

  const handleUpdateProfile = async (values: ProfileFormValues) => {
    try {
      setLoading(true);
      const formattedValues: Partial<User> = {
        ...values,
        dob: values.dob ? values.dob.toISOString() : undefined,
        avatar: profile?.avatar,
      };
      const updated = await userApi.updateProfile(formattedValues);
      setProfile(updated);
      message.success("Profile updated successfully!");
    } catch (error) {
      message.error(getErrorMessage(error, "Failed to update profile"));
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      setUploading(true);
      const res = await uploadApi.uploadSingle(file);

      if (profile) {
        const updated = await userApi.updateProfile({
          name: profile.name,
          avatar: res.url,
        });
        setProfile(updated);
        message.success("Avatar updated successfully!");
      }
    } catch (error) {
      message.error(getErrorMessage(error, "Failed to upload avatar"));
    } finally {
      setUploading(false);
    }
  };

  const handleChangePassword = async (values: PasswordFormValues) => {
    try {
      setPasswordLoading(true);
      await userApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success("Password changed successfully! Keep it secure.");
      passwordForm.resetFields();
    } catch (error) {
      message.error(getErrorMessage(error, "Failed to change password"));
    } finally {
      setPasswordLoading(false);
    }
  };

  const orders = orderData?.orders ?? [];
  const meta = orderData?.pagination;

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setFilters((prev) => ({
      ...prev,
      page: pagination.current || 1,
      limit: pagination.pageSize || 6,
    }));
  };

  const handleOrderFilter = () => {
    const values = orderFilterForm.getFieldsValue();
    setFilters((prev) => ({
      ...prev,
      page: 1,
      search: values.search || undefined,
      status: values.status || undefined,
      paymentStatus: values.paymentStatus || undefined,
    }));
  };

  const handleCancelOrder = (order: Order) => {
    const isDirectCancel = order.status === "pending";
    Modal.confirm({
      title: isDirectCancel ? "Hủy đơn hàng?" : "Gửi yêu cầu hủy đơn?",
      content: isDirectCancel
        ? "Đơn hàng mới sẽ được hủy ngay."
        : "Đơn hàng đã được xử lý, yêu cầu hủy sẽ chờ admin duyệt.",
      okText: isDirectCancel ? "Hủy đơn" : "Gửi yêu cầu",
      cancelText: "Đóng",
      onOk: () => cancelMutation.mutate({ orderId: order._id }),
    });
  };

  const orderColumns: ColumnsType<Order> = useMemo(
    () => [
      {
        title: "Đơn hàng",
        key: "order",
        render: (_, record) => (
          <Space direction="vertical" size={0}>
            <Text strong>
              {record.orderNumber || record._id.slice(-8).toUpperCase()}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {dayjs(record.createdAt).format("DD/MM/YYYY HH:mm")}
            </Text>
          </Space>
        ),
      },
      {
        title: "Xe",
        key: "car",
        render: (_, record) => {
          const item = record.items?.[0];
          return (
            <Space direction="vertical" size={0}>
              <Text strong>{item?.carName || "Không rõ"}</Text>
              <Text type="secondary">Số lượng: {item?.quantity || 0}</Text>
            </Space>
          );
        },
      },
      {
        title: "Thanh toán",
        key: "payment",
        render: (_, record) => (
          <Space direction="vertical" size={0}>
            <Tag color="gold">{record.paymentMethod.toUpperCase()}</Tag>
            <Text type="secondary">{record.paymentStatus}</Text>
          </Space>
        ),
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        render: (value: OrderStatus, record) => (
          <Space direction="vertical" size={4}>
            <Tag color={statusColorMap[value]}>{statusLabelMap[value]}</Tag>
            {record.cancel_request?.status === "pending" && (
              <Tag color="orange">Đang chờ duyệt hủy</Tag>
            )}
          </Space>
        ),
      },
      {
        title: "Tổng tiền",
        dataIndex: "totalAmount",
        render: (value: number) => `${value.toLocaleString("vi-VN")} VNĐ`,
      },
      {
        title: "Thao tác",
        key: "actions",
        render: (_, record) => {
          const canRequestCancel = [
            "pending",
            "confirmed",
            "preparing",
            "shipping",
          ].includes(record.status);
          const hasPendingCancel = record.cancel_request?.status === "pending";

          return (
            <Space>
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  setSelectedOrderId(record._id);
                  setOrderDetailVisible(true);
                }}
              >
                Xem chi tiết
              </Button>
              <Button
                danger
                size="small"
                disabled={!canRequestCancel || hasPendingCancel}
                loading={cancelMutation.isPending}
                onClick={() => handleCancelOrder(record)}
              >
                {record.status === "pending" ? "Hủy đơn" : "Yêu cầu hủy"}
              </Button>
            </Space>
          );
        },
      },
    ],
    [cancelMutation.isPending],
  );

  return (
    <div style={{ maxWidth: 1200, margin: "40px auto", padding: "0 24px" }}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "profile",
            label: "Thông tin tài khoản",
            children: (
              <Row gutter={[32, 32]}>
                <Col xs={24} md={8}>
                  <Card
                    styles={{ body: { padding: 40 } }}
                    style={{
                      textAlign: "center",
                      borderRadius: 20,
                      boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                      border: "none",
                      background:
                        "linear-gradient(145deg, #ffffff 0%, #f9fbfd 100%)",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        display: "inline-block",
                        marginBottom: 24,
                      }}
                    >
                      <Avatar
                        size={160}
                        src={profile?.avatar}
                        icon={<UserOutlined />}
                        style={{
                          boxShadow: "0 8px 24px rgba(24, 144, 255, 0.15)",
                          border: "4px solid #fff",
                        }}
                      />
                      <Upload
                        accept="image/*"
                        showUploadList={false}
                        beforeUpload={(file) => {
                          handleAvatarUpload(file);
                          return false;
                        }}
                      >
                        <Button
                          type="primary"
                          shape="circle"
                          icon={<EditOutlined />}
                          loading={uploading}
                          style={{
                            position: "absolute",
                            bottom: 5,
                            right: 5,
                            width: 40,
                            height: 40,
                            boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                          }}
                        />
                      </Upload>
                    </div>

                    <Title
                      level={3}
                      style={{
                        marginBottom: 4,
                        fontFamily: "Outfit, sans-serif",
                      }}
                    >
                      {profile?.name}
                    </Title>
                    <Text
                      type="secondary"
                      style={{ display: "block", marginBottom: 12 }}
                    >
                      <MailOutlined style={{ marginRight: 6 }} />{" "}
                      {profile?.email}
                    </Text>

                    <div
                      style={{
                        display: "inline-block",
                        padding: "6px 16px",
                        background: "#e6f7ff",
                        borderRadius: 20,
                      }}
                    >
                      <Text
                        strong
                        style={{
                          color: "#1890ff",
                          textTransform: "uppercase",
                          fontSize: 12,
                        }}
                      >
                        {profile?.role}
                      </Text>
                    </div>

                    <Divider style={{ margin: "24px 0" }} />

                    <div style={{ textAlign: "left" }}>
                      <Title level={5} style={{ marginBottom: 12 }}>
                        Account Info
                      </Title>
                      <div style={{ marginBottom: 8 }}>
                        <Text type="secondary">Member Since:</Text>{" "}
                        <Text strong>
                          {profile?.createdAt
                            ? dayjs(profile.createdAt).format("MMMM D, YYYY")
                            : "-"}
                        </Text>
                      </div>
                      <div>
                        <Text type="secondary">Verified Status:</Text>{" "}
                        <Text
                          strong
                          style={{
                            color: profile?.isVerified ? "#52c41a" : "#faad14",
                          }}
                        >
                          {profile?.isVerified
                            ? "Verified Account"
                            : "Unverified"}
                        </Text>
                      </div>
                    </div>
                  </Card>
                </Col>

                <Col xs={24} md={16}>
                  <Space
                    direction="vertical"
                    size={32}
                    style={{ width: "100%" }}
                  >
                    <Card
                      title={
                        <span
                          style={{
                            fontFamily: "Outfit, sans-serif",
                            fontSize: 20,
                            fontWeight: 600,
                          }}
                        >
                          Personal Profile Details
                        </span>
                      }
                      style={{
                        borderRadius: 20,
                        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                        border: "none",
                      }}
                    >
                      <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleUpdateProfile}
                        requiredMark={false}
                      >
                        <Row gutter={16}>
                          <Col xs={24} sm={12}>
                            <Form.Item
                              name="name"
                              label="Full Name"
                              rules={[
                                {
                                  required: true,
                                  message: "Please input your full name!",
                                },
                              ]}
                            >
                              <Input
                                prefix={<UserOutlined />}
                                placeholder="Your full name"
                                size="large"
                                style={{ borderRadius: 10 }}
                              />
                            </Form.Item>
                          </Col>

                          <Col xs={24} sm={12}>
                            <Form.Item name="phone" label="Phone Number">
                              <Input
                                prefix={<PhoneOutlined />}
                                placeholder="Your phone number"
                                size="large"
                                style={{ borderRadius: 10 }}
                              />
                            </Form.Item>
                          </Col>

                          <Col xs={24} sm={12}>
                            <Form.Item name="dob" label="Date of Birth">
                              <DatePicker
                                style={{ width: "100%", borderRadius: 10 }}
                                size="large"
                                placeholder="Select your birth date"
                                suffixIcon={<CalendarOutlined />}
                              />
                            </Form.Item>
                          </Col>

                          <Col xs={24} sm={12}>
                            <Form.Item name="gender" label="Gender">
                              <Select
                                size="large"
                                style={{ borderRadius: 10 }}
                                dropdownStyle={{ borderRadius: 10 }}
                              >
                                <Option value="male">Male</Option>
                                <Option value="female">Female</Option>
                                <Option value="other">
                                  Other / Rather not say
                                </Option>
                              </Select>
                            </Form.Item>
                          </Col>

                          <Col xs={24}>
                            <Form.Item name="address" label="Address">
                              <Input.TextArea
                                placeholder="Your residential address"
                                rows={3}
                                style={{ borderRadius: 10, paddingLeft: 10 }}
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Form.Item style={{ marginBottom: 0, marginTop: 12 }}>
                          <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            size="large"
                            style={{
                              borderRadius: 10,
                              padding: "0 32px",
                              height: 46,
                              fontWeight: 600,
                              boxShadow: "0 4px 12px rgba(24, 144, 255, 0.25)",
                            }}
                          >
                            Save Changes
                          </Button>
                        </Form.Item>
                      </Form>
                    </Card>

                    <Card
                      title={
                        <span
                          style={{
                            fontFamily: "Outfit, sans-serif",
                            fontSize: 20,
                            fontWeight: 600,
                          }}
                        >
                          Security & Password Management
                        </span>
                      }
                      style={{
                        borderRadius: 20,
                        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                        border: "none",
                      }}
                    >
                      <Form
                        form={passwordForm}
                        layout="vertical"
                        onFinish={handleChangePassword}
                        requiredMark={false}
                      >
                        <Row gutter={16}>
                          <Col xs={24} md={12}>
                            <Form.Item
                              name="currentPassword"
                              label="Current Password"
                              rules={[
                                {
                                  required: true,
                                  message:
                                    "Please input your current password!",
                                },
                              ]}
                            >
                              <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="••••••••"
                                size="large"
                                style={{ borderRadius: 10 }}
                              />
                            </Form.Item>
                          </Col>

                          <Col xs={24} md={12}>
                            <Form.Item
                              name="newPassword"
                              label="New Password"
                              rules={[
                                {
                                  required: true,
                                  message: "Please input a new password!",
                                },
                                {
                                  min: 8,
                                  message:
                                    "Password must be at least 8 characters long!",
                                },
                              ]}
                            >
                              <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Min 8 characters"
                                size="large"
                                style={{ borderRadius: 10 }}
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Form.Item style={{ marginBottom: 0, marginTop: 12 }}>
                          <Button
                            type="primary"
                            htmlType="submit"
                            loading={passwordLoading}
                            danger
                            size="large"
                            style={{
                              borderRadius: 10,
                              padding: "0 32px",
                              height: 46,
                              fontWeight: 600,
                              boxShadow: "0 4px 12px rgba(255, 77, 79, 0.2)",
                            }}
                          >
                            Change Password
                          </Button>
                        </Form.Item>
                      </Form>
                    </Card>
                  </Space>
                </Col>
              </Row>
            ),
          },
          {
            key: "orders",
            label: "Lịch sử đơn hàng",
            children: (
              <Space direction="vertical" size={20} style={{ width: "100%" }}>
                <Card>
                  <Form form={orderFilterForm} layout="vertical">
                    <Row gutter={16} align="bottom">
                      <Col xs={24} md={10}>
                        <Form.Item name="search" label="Tìm kiếm">
                          <Input
                            placeholder="Mã đơn, tên xe..."
                            allowClear
                            onPressEnter={handleOrderFilter}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={7}>
                        <Form.Item name="status" label="Trạng thái">
                          <Select
                            allowClear
                            placeholder="Tất cả"
                            options={orderStatusOptions}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={5}>
                        <Form.Item name="paymentStatus" label="Thanh toán">
                          <Select
                            allowClear
                            placeholder="Tất cả"
                            options={[
                              { label: "Chờ thanh toán", value: "pending" },
                              { label: "Đã thanh toán", value: "paid" },
                              { label: "Hoàn tiền", value: "refunded" },
                              { label: "Thất bại", value: "failed" },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={2}>
                        <Button
                          type="primary"
                          onClick={handleOrderFilter}
                          block
                        >
                          Lọc
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </Card>

                <Card>
                  <Table<Order>
                    rowKey="_id"
                    loading={ordersLoading}
                    columns={orderColumns}
                    dataSource={orders}
                    pagination={{
                      current: meta?.page ?? filters.page,
                      pageSize: meta?.limit ?? filters.limit,
                      total: meta?.total ?? 0,
                      showSizeChanger: true,
                    }}
                    onChange={handleTableChange}
                  />
                </Card>
              </Space>
            ),
          },
        ]}
      />
      <OrderDetailModal
        orderId={selectedOrderId}
        open={orderDetailVisible}
        onClose={() => {
          setOrderDetailVisible(false);
          setSelectedOrderId(undefined);
        }}
      />
    </div>
  );
};

export default ProfilePage;
