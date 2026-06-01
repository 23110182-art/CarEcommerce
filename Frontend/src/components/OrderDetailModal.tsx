import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Divider,
  Modal,
  type ModalProps,
  Spin,
  Tag,
  Typography,
  Space,
  Row,
  Col,
  Empty,
  Statistic,
} from "antd";
import dayjs from "dayjs";

import { getOrderById, orderQueryKeys } from "@/features/order/orderApi";
import type { Order } from "@/features/order/orderTypes";

const { Title, Text } = Typography;

interface OrderDetailModalProps extends Omit<ModalProps, "children" | "title"> {
  orderId?: string;
  onClose?: () => void;
}

const statusColorMap: Record<string, string> = {
  pending: "default",
  confirmed: "processing",
  preparing: "processing",
  shipping: "processing",
  delivered: "success",
  cancelled: "error",
};

const statusLabelMap: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  preparing: "Đang chuẩn bị",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

const paymentStatusMap: Record<string, string> = {
  pending: "Chưa thanh toán",
  paid: "Đã thanh toán",
  failed: "Thanh toán thất bại",
  refunded: "Đã hoàn tiền",
};

const OrderDetailModal = ({
  orderId,
  onClose,
  ...modalProps
}: OrderDetailModalProps) => {
  const {
    data: order,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: orderQueryKeys.detail(orderId || ""),
    queryFn: () => getOrderById(orderId as string),
    enabled: !!orderId && modalProps.open,
  });

  const calculateTotalDiscount = () => {
    if (!order) return 0;
    const couponDiscount = order.coupon?.discountAmount || 0;
    const loyaltyDiscount = order.loyaltyPoints?.pointsValue || 0;
    const promotionDiscount = order.promotion?.discountAmount || 0;
    return couponDiscount + loyaltyDiscount + promotionDiscount;
  };

  return (
    <Modal
      title={
        <span style={{ fontSize: 18, fontWeight: 600 }}>
          📋 Chi tiết đơn hàng {order?.orderNumber}
        </span>
      }
      width={800}
      onCancel={onClose}
      footer={null}
      {...modalProps}
    >
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" />
        </div>
      ) : isError ? (
        <Empty
          description="Lỗi khi tải chi tiết đơn hàng"
          style={{ marginTop: 48, marginBottom: 48 }}
        />
      ) : !order ? (
        <Empty description="Không tìm thấy đơn hàng" />
      ) : (
        <Space direction="vertical" style={{ width: "100%" }} size={24}>
          {/* Order Number and Date */}
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Card
                size="small"
                bordered={false}
                style={{ background: "rgba(0,0,0,0.02)" }}
              >
                <Statistic
                  title="Mã đơn hàng"
                  value={order.orderNumber}
                  valueStyle={{ fontSize: 14 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card
                size="small"
                bordered={false}
                style={{ background: "rgba(0,0,0,0.02)" }}
              >
                <Statistic
                  title="Ngày tạo"
                  value={dayjs(order.createdAt).format("DD/MM/YYYY HH:mm")}
                  valueStyle={{ fontSize: 14 }}
                />
              </Card>
            </Col>
          </Row>

          <Divider style={{ margin: "16px 0" }} />

          {/* Car Information */}
          <div>
            <Title level={5}>🚗 Thông tin xe</Title>
            <Card size="small" bordered={false}>
              {order.items && order.items.length > 0 ? (
                <Space direction="vertical" style={{ width: "100%" }} size={12}>
                  {order.items.map((item, idx) => (
                    <div key={idx}>
                      <Row gutter={16} align="middle">
                        <Col xs={6} sm={4}>
                          {item.carImage && (
                            <img
                              src={item.carImage}
                              alt={item.carName}
                              style={{
                                width: "100%",
                                height: 80,
                                objectFit: "cover",
                                borderRadius: 8,
                              }}
                            />
                          )}
                        </Col>
                        <Col xs={18} sm={20}>
                          <Text strong>{item.carName}</Text>
                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Số lượng: {item.quantity}
                            </Text>
                          </div>
                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Đơn giá: {item.salePrice?.toLocaleString("vi-VN")}{" "}
                              VNĐ
                            </Text>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  ))}
                </Space>
              ) : (
                <Empty description="Không có xe nào" />
              )}
            </Card>
          </div>

          <Divider style={{ margin: "16px 0" }} />

          {/* Price Breakdown */}
          <div>
            <Title level={5}>💰 Bảng tính giá</Title>
            <Card
              size="small"
              bordered={false}
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,215,0,0.08) 0%, rgba(18,18,18,0.02) 100%)",
              }}
            >
              <Space direction="vertical" style={{ width: "100%" }} size={8}>
                <Row justify="space-between">
                  <Text>Giá gốc:</Text>
                  <Text strong>
                    {order.originalAmount?.toLocaleString("vi-VN")} VNĐ
                  </Text>
                </Row>

                {order.coupon?.code && order.coupon?.discountAmount > 0 && (
                  <Row justify="space-between" style={{ color: "#52c41a" }}>
                    <Text type="secondary">
                      Giảm mã <Tag color="gold">{order.coupon.code}</Tag>:
                    </Text>
                    <Text strong style={{ color: "#52c41a" }}>
                      -{order.coupon.discountAmount.toLocaleString("vi-VN")} VNĐ
                    </Text>
                  </Row>
                )}

                {order.promotion?.name &&
                  order.promotion?.discountAmount > 0 && (
                    <Row justify="space-between" style={{ color: "#52c41a" }}>
                      <Text type="secondary">
                        Khuyến mãi{" "}
                        <Tag color="blue">{order.promotion.name}</Tag>:
                      </Text>
                      <Text strong style={{ color: "#52c41a" }}>
                        -
                        {order.promotion.discountAmount.toLocaleString("vi-VN")}{" "}
                        VNĐ
                      </Text>
                    </Row>
                  )}

                {order.loyaltyPoints?.pointsUsed &&
                  order.loyaltyPoints?.pointsValue > 0 && (
                    <Row justify="space-between" style={{ color: "#52c41a" }}>
                      <Text type="secondary">
                        Điểm tích lũy (
                        {order.loyaltyPoints.pointsUsed.toLocaleString("vi-VN")}
                        đ):
                      </Text>
                      <Text strong style={{ color: "#52c41a" }}>
                        -
                        {order.loyaltyPoints.pointsValue.toLocaleString(
                          "vi-VN",
                        )}{" "}
                        VNĐ
                      </Text>
                    </Row>
                  )}

                <Divider style={{ margin: "8px 0" }} />

                <Row justify="space-between">
                  <Text type="secondary">Phí vận chuyển:</Text>
                  <Text strong>
                    {order.shippingFee?.toLocaleString("vi-VN")} VNĐ
                  </Text>
                </Row>

                <Divider
                  style={{ margin: "8px 0", borderColor: "rgba(0,0,0,0.2)" }}
                />

                <Row
                  justify="space-between"
                  style={{ paddingTop: 8, fontSize: 18, fontWeight: 700 }}
                >
                  <Text strong>TỔNG TIỀN PHẢI TRẢ:</Text>
                  <Text strong style={{ color: "#faad14", fontSize: 20 }}>
                    {order.totalAmount?.toLocaleString("vi-VN")} VNĐ
                  </Text>
                </Row>
              </Space>
            </Card>
          </div>

          <Divider style={{ margin: "16px 0" }} />

          {/* Shipping Information */}
          <div>
            <Title level={5}>📮 Thông tin giao nhận</Title>
            <Card size="small" bordered={false}>
              <Space direction="vertical" style={{ width: "100%" }} size={8}>
                <Row justify="space-between">
                  <Text type="secondary">Người nhận:</Text>
                  <Text strong>{order.shippingInfo?.name}</Text>
                </Row>
                <Row justify="space-between">
                  <Text type="secondary">Số điện thoại:</Text>
                  <Text strong>{order.shippingInfo?.phone}</Text>
                </Row>
                <Row justify="space-between">
                  <Text type="secondary">Địa chỉ:</Text>
                  <Text strong>{order.shippingInfo?.address}</Text>
                </Row>
                {order.shippingInfo?.note && (
                  <Row justify="space-between">
                    <Text type="secondary">Ghi chú:</Text>
                    <Text strong>{order.shippingInfo.note}</Text>
                  </Row>
                )}
              </Space>
            </Card>
          </div>

          <Divider style={{ margin: "16px 0" }} />

          {/* Order Status */}
          <div>
            <Title level={5}>📊 Trạng thái đơn hàng</Title>
            <Card size="small" bordered={false}>
              <Space direction="vertical" style={{ width: "100%" }} size={12}>
                <Row justify="space-between" align="middle">
                  <Text type="secondary">Trạng thái:</Text>
                  <Tag color={statusColorMap[order.status]}>
                    {statusLabelMap[order.status] || order.status}
                  </Tag>
                </Row>
                <Row justify="space-between" align="middle">
                  <Text type="secondary">Thanh toán:</Text>
                  <Tag
                    color={
                      order.paymentStatus === "paid" ? "success" : "default"
                    }
                  >
                    {paymentStatusMap[order.paymentStatus] ||
                      order.paymentStatus}
                  </Tag>
                </Row>
                <Row justify="space-between" align="middle">
                  <Text type="secondary">Phương thức:</Text>
                  <Tag color="gold">{order.paymentMethod?.toUpperCase()}</Tag>
                </Row>
              </Space>
            </Card>
          </div>
        </Space>
      )}
    </Modal>
  );
};

export default OrderDetailModal;
