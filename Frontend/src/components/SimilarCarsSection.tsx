import { useQuery } from "@tanstack/react-query";
import { Card, Col, Row, Typography, Image, Space } from "antd";
import { Link } from "react-router-dom";

import { carApi } from "@/features/car/carApi";
import type { Car } from "@/features/car/carTypes";

const { Title, Text } = Typography;

interface SimilarCarsSectionProps {
  carId: string;
}

export const SimilarCarsSection = ({ carId }: SimilarCarsSectionProps) => {
  const {
    data: similarCars,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["similarCars", carId],
    queryFn: () => carApi.getSimilarCars(carId),
    enabled: !!carId,
  });

  if (isLoading || isError || !similarCars || similarCars.length === 0) {
    return null; // Don't render if no similar cars or loading/error
  }

  return (
    <Card
      style={{
        borderRadius: 24,
        background: "rgba(255, 255, 255, 0.03)",
        borderColor: "rgba(255, 255, 255, 0.08)",
        marginTop: 32,
      }}
    >
      <Title level={3} style={{ marginBottom: 24 }}>
        Sản phẩm tương tự
      </Title>
      <Row gutter={[16, 16]}>
        {similarCars.map((car: Car) => (
          <Col key={car._id} xs={24} sm={12} md={8} lg={6}>
            <Link to={`/cars/${car.slug || car._id}`}>
              <Card
                hoverable
                cover={
                  <Image
                    alt={car.name}
                    src={car.thumbnail || "/placeholder-car.png"}
                    preview={false}
                    style={{ height: 160, objectFit: "cover", borderRadius: "16px 16px 0 0" }}
                  />
                }
                style={{ borderRadius: 16, background: "#1a1a1a", borderColor: "rgba(255,255,255,0.08)" }}
                styles={{ body: { padding: 16 } }}
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Text strong ellipsis style={{ color: "#fff" }}>
                    {car.name}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {car.brand?.name}
                  </Text>
                  <Text type="success" strong style={{ fontSize: 16 }}>
                    {Number(car.price || 0).toLocaleString("vi-VN")} VNĐ
                  </Text>
                </Space>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </Card>
  );
};