import { useQuery } from '@tanstack/react-query';
import { Card, Col, Row, Typography, Image, Space, Button, Empty } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { wishlistApi } from '@/features/car/newFeaturesApi';
import type { Car } from '@/features/car/carTypes';

const { Title, Text } = Typography;

const WishlistPage = () => {
  const navigate = useNavigate();
  const {
    data: wishlistItems = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["wishlist"],
    queryFn: wishlistApi.getWishlist,
  });

  return (
    <div className="page-shell">
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px 56px' }}>
        <Space style={{ marginBottom: 20 }}>
          <Button type="text" icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>
            Quay lại
          </Button>
        </Space>
        <Title level={2} style={{ marginBottom: 32 }}>
          Sản phẩm yêu thích của bạn ({wishlistItems.length})
        </Title>

        {isLoading ? (
          <p>Đang tải danh sách yêu thích...</p>
        ) : isError ? (
          <p>Có lỗi xảy ra khi tải danh sách yêu thích.</p>
        ) : wishlistItems.length === 0 ? (
          <Empty
            description="Bạn chưa có sản phẩm nào trong danh sách yêu thích."
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Row gutter={[24, 24]}>
            {wishlistItems.map((car: Car) => (
              <Col key={car._id} xs={24} sm={12} md={8} lg={6}>
                <Link to={`/cars/${car.slug || car._id}`}>
                  <Card
                    hoverable
                    cover={
                      <Image
                        alt={car.name}
                        src={car.thumbnail || "/placeholder-car.png"}
                        preview={false}
                        style={{ height: 180, objectFit: "cover", borderRadius: "16px 16px 0 0" }}
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
        )}
      </div>
    </div>
  );
};

export default WishlistPage;