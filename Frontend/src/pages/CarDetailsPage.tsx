import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Col, Descriptions, Image, Row, Space, Spin, Tag, Typography, message } from 'antd';
import { ArrowLeft, Heart, ShieldCheck, Sparkles } from 'lucide-react';

import { carApi } from '@/features/car/carApi';
import { ReviewsSection } from '@/components/ReviewsSection';
import { CarStatsSection } from '@/components/CarStatsSection';
import { SimilarCarsSection } from '@/components/SimilarCarsSection';
import { viewedProductsApi, wishlistApi } from '@/features/car/newFeaturesApi';
import { useAppSelector } from '@/hooks/redux';

const { Title, Text, Paragraph } = Typography;

const CarDetailsPage = () => {
  const { carId, idOrSlug } = useParams();
  const carLookupKey = carId || idOrSlug;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const {
    data: car,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['car', carLookupKey],
    queryFn: () => carApi.getCarDetail(carLookupKey as string),
    enabled: !!carLookupKey,
  });

  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist'],
    queryFn: wishlistApi.getWishlist,
    enabled: isAuthenticated,
  });

  const isWishlisted = useMemo(() => {
    if (!car?._id || !wishlist) return false;
    return wishlist.some((item) => item._id === car._id);
  }, [car?._id, wishlist]);

  const toggleWishlistMutation = useMutation({
    mutationFn: () => wishlistApi.toggleWishlist(car?._id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      message.success(isWishlisted ? 'Đã xóa khỏi danh sách yêu thích' : 'Đã thêm vào danh sách yêu thích');
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật danh sách yêu thích');
    }
  });

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      message.warning('Vui lòng đăng nhập để sử dụng tính năng này');
      navigate('/login');
      return;
    }
    toggleWishlistMutation.mutate();
  };

  const heroImage = useMemo(() => {
    return car?.images?.[0]?.url || car?.thumbnail || '/placeholder-car.png';
  }, [car]);

  const handleCheckout = () => {
    if (!car?._id) return;
    navigate(`/checkout/${car._id}`, {
      state: { car },
    });
  };

  useEffect(() => {
    if (carLookupKey) {
      viewedProductsApi.addViewedProduct(carLookupKey).catch(console.error);
    }
  }, [carLookupKey]);

  return (
    <div className="page-shell">
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px 56px' }}>
        <Space style={{ marginBottom: 20 }}>
          <Button type="text" icon={<ArrowLeft size={16} />} onClick={() => navigate('/cars')}>
            Quay lại
          </Button>
        </Space>

        {isLoading ? (
          <div style={{ minHeight: 420, display: 'grid', placeItems: 'center' }}>
            <Spin size="large" />
          </div>
        ) : isError || !car ? (
          <Card
            style={{
              borderRadius: 20,
              background: 'rgba(255,255,255,0.03)',
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            <Title level={3}>Không tìm thấy thông tin xe</Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.72)' }}>
              Xe bạn đang tìm hiện tại không khả dụng hoặc đã được xoá khỏi hệ thống.
            </Paragraph>
            <Button type="primary" onClick={() => navigate('/cars')}>
              Xem danh sách xe
            </Button>
          </Card>
        ) : (
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={14}>
              <Card
                styles={{ body: { padding: 0 } }}
                style={{
                  overflow: 'hidden',
                  borderRadius: 24,
                  background: 'rgba(255,255,255,0.03)',
                  borderColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <Image
                  src={heroImage}
                  alt={car.name}
                  preview={false}
                  style={{ width: '100%', height: 460, objectFit: 'cover' }}
                />
              </Card>
            </Col>

            <Col xs={24} lg={10}>
              <Card
                style={{
                  borderRadius: 24,
                  background:
                    'linear-gradient(180deg, rgba(255,215,0,0.08) 0%, rgba(18,18,18,0.96) 100%)',
                  borderColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <Space direction="vertical" size={18} style={{ width: '100%' }}>
                  <div>
                    <Space wrap>
                      <Tag color="gold" icon={<Sparkles size={14} />}>
                        Luxury
                      </Tag>
                      <Tag color="green" icon={<ShieldCheck size={14} />}>
                        COD available
                      </Tag>
                    </Space>
                    <Title level={2} style={{ marginTop: 12, marginBottom: 8 }}>
                      {car.name}
                    </Title>
                    <Text style={{ color: 'rgba(255,255,255,0.72)' }}>
                      {car.brand?.name}
                    </Text>
                  </div>

                  <div>
                    <Title level={3} style={{ margin: 0 }}>
                      {Number(car.price || 0).toLocaleString('vi-VN')} VNĐ
                    </Title>
                    <Text type="secondary">Giá tham khảo, thanh toán khi nhận xe.</Text>
                  </div>

                  <Descriptions
                    column={1}
                    size="small"
                    bordered
                    styles={{
                      label: { width: 160, color: 'rgba(255,255,255,0.72)' },
                    }}
                  >
                    <Descriptions.Item label="Năm sản xuất">{car.year ?? '-'}</Descriptions.Item>
                    <Descriptions.Item label="Hộp số">{car.transmission ?? '-'}</Descriptions.Item>
                    <Descriptions.Item label="Nhiên liệu">{car.fuelType ?? '-'}</Descriptions.Item>
                    <Descriptions.Item label="Màu sắc">{car.color ?? '-'}</Descriptions.Item>
                    <Descriptions.Item label="Số chỗ">{car.seats ?? '-'}</Descriptions.Item>
                  </Descriptions>

                  <Paragraph style={{ color: 'rgba(255,255,255,0.72)', marginBottom: 0 }}>
                    {car.description}
                  </Paragraph>

                  <Space wrap>
                    <Button type="primary" size="large" onClick={handleCheckout}>
                      Đặt xe COD
                    </Button>
                    <Button size="large" onClick={handleCheckout}>
                      Tiến hành checkout
                    </Button>
                    <Button
                      size="large"
                      icon={<Heart size={20} fill={isWishlisted ? 'var(--color-accent)' : 'none'} color={isWishlisted ? 'var(--color-accent)' : 'white'} />}
                      onClick={handleToggleWishlist}
                      loading={toggleWishlistMutation.isPending}
                      style={{
                        borderColor: isWishlisted ? 'var(--color-accent)' : 'rgba(255,255,255,0.08)',
                        background: isWishlisted ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                      }}
                    >
                      {isWishlisted ? 'Đã thích' : 'Yêu thích'}
                    </Button>
                  </Space>
                </Space>
              </Card>

              {carLookupKey && <CarStatsSection carId={carLookupKey} />}
            </Col>
          </Row>
        )}

        {carLookupKey && <ReviewsSection productId={carLookupKey} />}
        {carLookupKey && <SimilarCarsSection carId={carLookupKey} />}
      </div>
    </div>
  );
};

export default CarDetailsPage;
