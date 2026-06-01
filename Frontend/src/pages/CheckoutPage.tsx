import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import {
  CreditCard,
  ShieldCheck,
  Sparkles,
  Tag as TagIcon,
} from "lucide-react";

import { carApi } from "@/features/car/carApi";
import type { Car } from "@/features/car/carTypes";
import { createCodOrder } from "@/features/order/orderApi";
import { couponApi } from "@/features/car/newFeaturesApi";
import { promotionApi } from "@/features/promotion/promotionApi";

const { Title, Text, Paragraph } = Typography;

interface CheckoutLocationState {
  car?: Car;
}

const CheckoutPage = () => {
  const { carId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const locationState = location.state as CheckoutLocationState | null;
  const embeddedCar = locationState?.car;

  const {
    data: car,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["car", carId],
    queryFn: () => carApi.getCarDetail(carId as string),
    enabled: !!carId && !embeddedCar,
    initialData: embeddedCar,
  });

  const selectedCar = useMemo(() => car ?? embeddedCar, [car, embeddedCar]);
  const selectedCarImage =
    selectedCar?.images?.[0]?.url ||
    selectedCar?.thumbnail ||
    "/placeholder-car.png";

  // Query promotion for selected car
  const { data: promotionResult, isLoading: promotionLoading } = useQuery({
    queryKey: ["promotion", selectedCar?._id],
    queryFn: () =>
      promotionApi.calculatePromotionForCar(selectedCar?._id as string),
    enabled: !!selectedCar?._id,
  });

  const createOrderMutation = useMutation({
    mutationFn: createCodOrder,
    onSuccess: (order) => {
      message.success(
        "Đơn hàng đã được tạo thành công. Vui lòng chuẩn bị thanh toán khi nhận xe.",
      );
      navigate("/profile", {
        replace: true,
        state: {
          activeTab: "orders",
          orderId: order._id,
        },
      });
    },
    onError: () => {
      message.error("Không thể tạo đơn hàng. Vui lòng thử lại.");
    },
  });

  const handleSubmit = async (values: {
    fullName?: string;
    phone?: string;
    address?: string;
    note?: string;
  }) => {
    if (!selectedCar?._id) {
      message.error("Không tìm thấy thông tin xe để đặt hàng.");
      return;
    }

    createOrderMutation.mutate({
      items: [{ car: selectedCar._id, quantity: 1 }],
      shippingInfo: {
        name: values.fullName || "",
        phone: values.phone || "",
        address: values.address || "",
        note: values.note || "",
      },
      note: values.note || "",
      coupon: couponCode ? { code: couponCode, discountAmount } : undefined,
      loyaltyPoints:
        pointsToUse > 0
          ? { pointsUsed: pointsToUse, pointsValue: pointsDiscount }
          : undefined,
      promotion: promotionResult?.applied_promotion
        ? {
            _id: promotionResult.applied_promotion._id,
            name: promotionResult.applied_promotion.name,
            discountAmount: promotionDiscount,
          }
        : undefined,
      originalAmount: basePrice,
    });
  };

  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [pointsDiscount, setPointsDiscount] = useState(0);

  // Calculate promotion discount
  const basePrice =
    (selectedCar?.salePrice || selectedCar?.sale_price || selectedCar?.price) ??
    0;

  const promotionDiscount = promotionResult?.applied_promotion
    ? promotionResult.applied_promotion.discount_type === "percentage"
      ? (basePrice * promotionResult.applied_promotion.discount_value) / 100
      : promotionResult.applied_promotion.discount_value
    : 0;

  const applyCouponMutation = useMutation({
    mutationFn: () => couponApi.applyCoupon(couponCode, basePrice),
    onSuccess: (data) => {
      setDiscountAmount(data.discountAmount);
      message.success(
        `Đã áp dụng mã giảm giá: Giảm ${data.discountAmount.toLocaleString("vi-VN")} VNĐ`,
      );
    },
    onError: (error: any) => {
      message.error(
        error?.response?.data?.message || "Không thể áp dụng mã giảm giá này.",
      );
    },
  });

  const usePointsMutation = useMutation({
    mutationFn: () =>
      couponApi.usePoints(pointsToUse, basePrice - discountAmount),
    onSuccess: (data) => {
      setPointsDiscount(data.pointsValue);
      message.success(
        `Đã đổi điểm thành công: Giảm ${data.pointsValue.toLocaleString("vi-VN")} VNĐ`,
      );
    },
    onError: (error: any) => {
      message.error(
        error?.response?.data?.message ||
          "Không đủ điểm tích lũy hoặc điểm không hợp lệ.",
      );
    },
  });

  const totalPrice = Math.max(
    0,
    basePrice - discountAmount - pointsDiscount - promotionDiscount,
  );

  return (
    <div className="page-shell">
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "24px 16px 48px",
        }}
      >
        <div
          style={{
            marginBottom: 24,
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <Title level={2} style={{ marginBottom: 8 }}>
              Checkout
            </Title>
            <Paragraph
              style={{ marginBottom: 0, color: "rgba(255,255,255,0.72)" }}
            >
              Xác nhận thông tin và hoàn tất đơn hàng với phương thức thanh toán
              khi nhận xe.
            </Paragraph>
          </div>
          <Space>
            <Tag color="gold" icon={<ShieldCheck size={14} />}>
              COD only
            </Tag>
            <Tag color="geekblue" icon={<Sparkles size={14} />}>
              Luxury service
            </Tag>
          </Space>
        </div>

        {isLoading ? (
          <div
            style={{ minHeight: 360, display: "grid", placeItems: "center" }}
          >
            <Spin size="large" />
          </div>
        ) : isError || !selectedCar ? (
          <Card>
            <Title level={4}>Không thể tải thông tin xe</Title>
            <Paragraph>
              Vui lòng quay lại trang chi tiết xe hoặc danh sách xe để chọn lại
              phương tiện.
            </Paragraph>
            <Button type="primary" onClick={() => navigate("/cars")}>
              Quay lại danh sách xe
            </Button>
          </Card>
        ) : (
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={14}>
              <Card
                style={{
                  borderRadius: 20,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(18,18,18,0.92) 100%)",
                }}
                styles={{ body: { padding: 24 } }}
              >
                <Title level={4} style={{ marginTop: 0 }}>
                  Thông tin người mua
                </Title>

                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  initialValues={{
                    fullName: "",
                    phone: "",
                    address: "",
                    note: "",
                  }}
                >
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Họ và tên"
                        name="fullName"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập họ và tên",
                          },
                        ]}
                      >
                        <Input placeholder="Nguyễn Văn A" size="large" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Số điện thoại"
                        name="phone"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập số điện thoại",
                          },
                        ]}
                      >
                        <Input placeholder="09xxxxxxxx" size="large" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    label="Địa chỉ giao nhận"
                    name="address"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập địa chỉ giao nhận",
                      },
                    ]}
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành..."
                    />
                  </Form.Item>

                  <Form.Item label="Ghi chú" name="note">
                    <Input.TextArea
                      rows={3}
                      placeholder="Yêu cầu thêm về giao nhận, thời gian liên hệ..."
                    />
                  </Form.Item>

                  <Divider style={{ borderColor: "rgba(255,255,255,0.08)" }} />

                  <Space
                    direction="vertical"
                    style={{ width: "100%", marginBottom: 24 }}
                    size={16}
                  >
                    {promotionLoading ? (
                      <Card
                        size="small"
                        style={{
                          background: "rgba(255,193,7,0.1)",
                          borderColor: "rgba(255,193,7,0.3)",
                        }}
                      >
                        <Spin size="small" /> Đang kiểm tra khuyến mãi...
                      </Card>
                    ) : promotionResult?.applied_promotion ? (
                      <Card
                        size="small"
                        style={{
                          background: "rgba(76,175,80,0.1)",
                          borderColor: "rgba(76,175,80,0.3)",
                        }}
                      >
                        <Space direction="vertical" style={{ width: "100%" }}>
                          <div>
                            <Text
                              strong
                              style={{ color: "#4CAF50", display: "block" }}
                            >
                              ✓ {promotionResult.applied_promotion.name}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {promotionResult.applied_promotion.description}
                            </Text>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text>Giảm:</Text>
                            <Text strong style={{ color: "#4CAF50" }}>
                              {promotionDiscount.toLocaleString("vi-VN")} VNĐ
                            </Text>
                          </div>
                        </Space>
                      </Card>
                    ) : null}
                    <div>
                      <Space style={{ marginBottom: 8 }}>
                        <TagIcon size={18} />
                        <Text strong>Mã giảm giá</Text>
                      </Space>
                      <Input.Group compact>
                        <Input
                          style={{ width: "calc(100% - 100px)" }}
                          placeholder="Nhập mã giảm giá của bạn"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                        />
                        <Button
                          type="primary"
                          onClick={() => applyCouponMutation.mutate()}
                          loading={applyCouponMutation.isPending}
                          disabled={!couponCode}
                        >
                          Áp dụng
                        </Button>
                      </Input.Group>
                    </div>

                    <div>
                      <Space style={{ marginBottom: 8 }}>
                        <CreditCard size={18} />
                        <Text strong>Sử dụng điểm tích lũy</Text>
                      </Space>
                      <Input.Group compact>
                        <Input
                          style={{ width: "calc(100% - 100px)" }}
                          type="number"
                          placeholder="Nhập số điểm muốn dùng (1000đ/điểm)"
                          value={pointsToUse || undefined}
                          onChange={(e) =>
                            setPointsToUse(Number(e.target.value))
                          }
                        />
                        <Button
                          type="primary"
                          onClick={() => usePointsMutation.mutate()}
                          loading={usePointsMutation.isPending}
                          disabled={pointsToUse <= 0}
                        >
                          Đổi điểm
                        </Button>
                      </Input.Group>
                    </div>

                    <Card
                      size="small"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        borderColor: "rgba(255,255,255,0.08)",
                      }}
                    >
                      <Space align="start">
                        <CreditCard size={18} style={{ marginTop: 2 }} />
                        <div>
                          <Text strong style={{ display: "block" }}>
                            Phương thức thanh toán
                          </Text>
                          <Text type="secondary">
                            Thanh toán khi nhận xe (COD)
                          </Text>
                        </div>
                      </Space>
                    </Card>
                  </Space>

                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    block
                    loading={createOrderMutation.isPending}
                  >
                    Xác nhận đặt xe COD
                  </Button>
                </Form>
              </Card>
            </Col>

            <Col xs={24} lg={10}>
              <Card
                style={{
                  borderRadius: 20,
                  background:
                    "linear-gradient(180deg, rgba(255,215,0,0.08) 0%, rgba(18,18,18,0.94) 100%)",
                }}
                styles={{ body: { padding: 24 } }}
              >
                <Title level={4} style={{ marginTop: 0 }}>
                  Tóm tắt đơn hàng
                </Title>

                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    alignItems: "flex-start",
                    marginBottom: 20,
                  }}
                >
                  <img
                    src={selectedCarImage}
                    alt={selectedCar.name}
                    style={{
                      width: 120,
                      height: 84,
                      objectFit: "cover",
                      borderRadius: 16,
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ fontSize: 18, display: "block" }}>
                      {selectedCar.name}
                    </Text>
                    <Text type="secondary">
                      {selectedCar.brand?.name} {selectedCar.category?.name}
                    </Text>
                    <div style={{ marginTop: 8 }}>
                      <Tag color="gold">{selectedCar.year}</Tag>
                      <Tag color="blue">{selectedCar.transmission}</Tag>
                      <Tag color="green">{selectedCar.fuelType}</Tag>
                    </div>
                  </div>
                </div>

                <Space direction="vertical" style={{ width: "100%" }} size={12}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Text type="secondary">Giá xe</Text>
                    <Text strong>{basePrice.toLocaleString("vi-VN")} VNĐ</Text>
                  </div>
                  {discountAmount > 0 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text type="secondary">Mã giảm giá</Text>
                      <Text strong style={{ color: "#52c41a" }}>
                        -{discountAmount.toLocaleString("vi-VN")} VNĐ
                      </Text>
                    </div>
                  )}
                  {pointsDiscount > 0 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text type="secondary">Điểm tích lũy</Text>
                      <Text strong style={{ color: "#52c41a" }}>
                        -{pointsDiscount.toLocaleString("vi-VN")} VNĐ
                      </Text>
                    </div>
                  )}
                  {promotionDiscount > 0 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text type="secondary">
                        Khuyến mãi: {promotionResult?.applied_promotion?.name}
                      </Text>
                      <Text strong style={{ color: "#52c41a" }}>
                        -{promotionDiscount.toLocaleString("vi-VN")} VNĐ
                      </Text>
                    </div>
                  )}
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Text type="secondary">Phí đặt cọc</Text>
                    <Text strong>0 VNĐ</Text>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Text type="secondary">Thanh toán</Text>
                    <Tag color="gold">COD</Tag>
                  </div>
                  <Divider
                    style={{
                      margin: "12px 0",
                      borderColor: "rgba(255,255,255,0.08)",
                    }}
                  />
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Text strong>Tổng cộng</Text>
                    <Title level={4} style={{ margin: 0 }}>
                      {totalPrice.toLocaleString("vi-VN")} VNĐ
                    </Title>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
