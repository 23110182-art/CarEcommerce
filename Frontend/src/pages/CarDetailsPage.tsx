import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Row, Col, Typography, Carousel, Tag, Button, App, Spin, Space, Descriptions, Divider, Modal, Form, Input, DatePicker, Select, Grid } from 'antd';
import { CalendarOutlined, DashboardOutlined, FireOutlined, TeamOutlined, BgColorsOutlined, CompassOutlined, ArrowLeftOutlined, CheckCircleOutlined, InfoCircleOutlined, MailOutlined, PhoneOutlined, UserOutlined, CalendarTwoTone } from '@ant-design/icons';
import { carApi } from '@/features/car/carApi';
import type { Car } from '@/features/car/carTypes';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

export const CarDetailsPage: React.FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const { message } = App.useApp();
  const screens = useBreakpoint();
  const carouselRef = useRef<any>(null);

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // Booking Modal States
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [bookingForm] = Form.useForm();
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        if (idOrSlug) {
          const data = await carApi.getCarDetail(idOrSlug);
          setCar(data);
        }
      } catch (err: any) {
        message.error(err.response?.data?.message || 'Failed to fetch car details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [idOrSlug]);

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" tip="Entering luxury showroom..." />
      </div>
    );
  }

  if (!car) {
    return (
      <div style={{ padding: 80, textAlign: 'center' }}>
        <Title level={3}>Vehicle Not Found</Title>
        <Paragraph>The vehicle you are looking for might have been sold or removed.</Paragraph>
        <Link to="/cars">
          <Button type="primary" icon={<ArrowLeftOutlined />}>Back to Showroom</Button>
        </Link>
      </div>
    );
  }

  // Combine thumbnail and additional images for the slider
  const allImages = [
    { url: car.thumbnail },
    ...(car.images || [])
  ];

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const handleThumbnailClick = (index: number) => {
    setActiveImageIndex(index);
    if (carouselRef.current) {
      carouselRef.current.goTo(index);
    }
  };

  const handleBookingSubmit = async (values: any) => {
    try {
      setBookingLoading(true);
      // Simulate API call to register showroom booking
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const referenceCode = 'RSV-' + Math.floor(100000 + Math.random() * 900000);
      setBookingRef(referenceCode);
      setBookingSuccess(true);
      message.success('Showroom visit scheduled successfully!');
    } catch {
      message.error('Booking failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleModalClose = () => {
    setBookingModalVisible(false);
    // Wait for animation to finish before resetting
    setTimeout(() => {
      setBookingSuccess(false);
      bookingForm.resetFields();
    }, 300);
  };

  return (
    <div style={{ maxWidth: 1400, margin: '40px auto', padding: '0 24px' }}>
      {/* Breadcrumb & Navigation */}
      <div style={{ marginBottom: 24 }}>
        <Link to="/cars" style={{ display: 'inline-flex', alignItems: 'center', color: '#8c8c8c', transition: 'color 0.3s' }}>
          <ArrowLeftOutlined style={{ marginRight: 8 }} /> Back to Luxury Showroom
        </Link>
      </div>

      <Row gutter={[40, 40]}>
        {/* Left Column: Image Slider */}
        <Col xs={24} lg={14}>
          <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', boxShadow: '0 15px 40px rgba(0,0,0,0.08)' }}>
            <Carousel
              ref={carouselRef}
              effect="scrollx"
              dots={false}
              afterChange={(current) => setActiveImageIndex(current)}
              style={{ background: '#f5f5f7' }}
            >
              {allImages.map((img, idx) => (
                <div key={idx} style={{ position: 'relative', outline: 'none' }}>
                  <img
                    src={img.url}
                    alt={`${car.name} - View ${idx + 1}`}
                    style={{
                      width: '100%',
                      height: screens.md ? 550 : 350,
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    display: 'flex',
                    gap: 8,
                  }}>
                    <Tag color={car.condition === 'new' ? '#52c41a' : '#1890ff'} style={{ padding: '4px 12px', fontSize: 13, border: 'none', borderRadius: 20 }}>
                      {car.condition === 'new' ? 'Brand New' : 'Premium Pre-Owned'}
                    </Tag>
                    {car.is_featured && (
                      <Tag color="#eb2f96" style={{ padding: '4px 12px', fontSize: 13, border: 'none', borderRadius: 20 }}>
                        Featured Model
                      </Tag>
                    )}
                  </div>
                </div>
              ))}
            </Carousel>
          </div>

          {/* Slider Thumbnail Indicators */}
          {allImages.length > 1 && (
            <div style={{
              display: 'flex',
              gap: 12,
              marginTop: 20,
              overflowX: 'auto',
              paddingBottom: 10,
            }}>
              {allImages.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => handleThumbnailClick(idx)}
                  style={{
                    width: 90,
                    height: 60,
                    borderRadius: 12,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: `3px solid ${activeImageIndex === idx ? '#1890ff' : 'transparent'}`,
                    transition: 'all 0.3s',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                    flexShrink: 0,
                  }}
                >
                  <img src={img.url} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </Col>

        {/* Right Column: Pricing & Quick Booking & Specification */}
        <Col xs={24} lg={10}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Header info */}
            <div>
              <Text strong style={{ color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: 1 }}>
                {car.brand_id?.name} Showroom
              </Text>
              <Title level={1} style={{ margin: '8px 0 12px', fontSize: screens.md ? 38 : 28, fontFamily: 'Outfit, sans-serif' }}>
                {car.name}
              </Title>
              <Space size="middle">
                <Tag color="blue" style={{ borderRadius: 8, padding: '2px 10px' }}>{car.year} Release</Tag>
                <Tag style={{ borderRadius: 8, padding: '2px 10px' }}>{car.color}</Tag>
              </Space>
            </div>

            {/* Price Box */}
            <Card
              styles={{ body: { padding: 32 } }}
              style={{
                borderRadius: 24,
                boxShadow: '0 10px 35px rgba(0,0,0,0.04)',
                border: 'none',
                background: 'linear-gradient(135deg, #001529 0%, #002140 100%)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14 }}>Showroom MSRP</Text>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                    <Title level={2} style={{ color: '#fff', margin: 0, fontSize: 32 }}>
                      {formatPrice(car.sale_price || car.price)}
                    </Title>
                    {car.sale_price && (
                      <Text delete style={{ color: 'rgba(255,255,255,0.45)', fontSize: 18 }}>
                        {formatPrice(car.price)}
                      </Text>
                    )}
                  </div>
                </div>

                {car.sale_price && (
                  <Tag color="#f5222d" style={{ border: 'none', borderRadius: 8, padding: '4px 10px', fontSize: 13 }}>
                    Special Promotion
                  </Tag>
                )}
              </div>

              <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '20px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ color: 'rgba(255,255,255,0.65)' }}>Live Stock Availability</Text>
                {car.stock > 0 ? (
                  <Tag color="#52c41a" style={{ border: 'none', borderRadius: 8 }}>
                    {car.stock} Units In Showroom
                  </Tag>
                ) : (
                  <Tag color="#f5222d" style={{ border: 'none', borderRadius: 8 }}>Out Of Stock</Tag>
                )}
              </div>

              <Button
                type="primary"
                size="large"
                disabled={car.stock === 0}
                onClick={() => setBookingModalVisible(true)}
                style={{
                  width: '100%',
                  height: 52,
                  borderRadius: 14,
                  fontSize: 16,
                  fontWeight: 600,
                  background: '#1890ff',
                  border: 'none',
                  boxShadow: '0 6px 20px rgba(24, 144, 255, 0.3)',
                }}
              >
                Schedule Showroom Visit & Reserve
              </Button>
            </Card>

            {/* Promotion Widget */}
            {car.applied_promotion && (
              <Card
                style={{
                  borderRadius: 24,
                  border: '1px dashed #d4af37',
                  background: 'rgba(212, 175, 55, 0.05)',
                  boxShadow: '0 8px 32px rgba(212, 175, 55, 0.05)',
                }}
                styles={{ body: { padding: 24 } }}
              >
                <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                  <InfoCircleOutlined style={{ color: '#d4af37', fontSize: 20, marginTop: 4 }} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Text strong style={{ color: '#d4af37', fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        🔥 ACTIVE CAMPAIGN: {car.applied_promotion.name}
                      </Text>
                    </div>
                    <Paragraph style={{ color: 'var(--color-text-secondary)', margin: '0 0 12px 0', fontSize: 14 }}>
                      {car.applied_promotion.description}
                    </Paragraph>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <Tag color="gold" style={{ fontWeight: 'bold', fontSize: 13, border: 'none', borderRadius: 6 }}>
                        {car.applied_promotion.discount_type === 'percentage' 
                          ? `SAVE ${car.applied_promotion.discount_value}%`
                          : `SAVE ${formatPrice(car.applied_promotion.discount_value)}`
                        }
                      </Tag>
                      <Text style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                        Valid until: {dayjs(car.applied_promotion.end_date).format('DD/MM/YYYY')}
                      </Text>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Quick Specs Grid */}
            <Card
              title="Highlights Specs"
              style={{ borderRadius: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: 'none' }}
            >
              <Row gutter={[20, 20]}>
                <Col span={12}>
                  <Space align="start">
                    <DashboardOutlined style={{ fontSize: 20, color: '#1890ff', marginTop: 4 }} />
                    <div>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>TRANSMISSION</Text>
                      <Text strong style={{ textTransform: 'capitalize' }}>{car.transmission}</Text>
                    </div>
                  </Space>
                </Col>

                <Col span={12}>
                  <Space align="start">
                    <CalendarOutlined style={{ fontSize: 20, color: '#1890ff', marginTop: 4 }} />
                    <div>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>YEAR</Text>
                      <Text strong>{car.year}</Text>
                    </div>
                  </Space>
                </Col>

                <Col span={12}>
                  <Space align="start">
                    <CompassOutlined style={{ fontSize: 20, color: '#1890ff', marginTop: 4 }} />
                    <div>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>MILEAGE</Text>
                      <Text strong>{car.mileage.toLocaleString()} KM</Text>
                    </div>
                  </Space>
                </Col>

                <Col span={12}>
                  <Space align="start">
                    <FireOutlined style={{ fontSize: 20, color: '#1890ff', marginTop: 4 }} />
                    <div>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>FUEL SYSTEM</Text>
                      <Text strong style={{ textTransform: 'capitalize' }}>{car.fuel_type}</Text>
                    </div>
                  </Space>
                </Col>

                <Col span={12}>
                  <Space align="start">
                    <TeamOutlined style={{ fontSize: 20, color: '#1890ff', marginTop: 4 }} />
                    <div>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>SEATING CAPACITY</Text>
                      <Text strong>{car.seats} Adults</Text>
                    </div>
                  </Space>
                </Col>

                <Col span={12}>
                  <Space align="start">
                    <BgColorsOutlined style={{ fontSize: 20, color: '#1890ff', marginTop: 4 }} />
                    <div>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>BODY COLOR</Text>
                      <Text strong>{car.color}</Text>
                    </div>
                  </Space>
                </Col>
              </Row>
            </Card>
          </div>
        </Col>
      </Row>

      <Divider style={{ margin: '40px 0' }} />

      {/* Description & Technical Specifications Grid */}
      <Row gutter={[40, 40]}>
        <Col xs={24} lg={14}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Description */}
            <div>
              <Title level={3} style={{ fontFamily: 'Outfit, sans-serif', marginBottom: 16 }}>Vehicle Overview</Title>
              <Paragraph style={{ fontSize: 16, lineHeight: 1.8, color: '#595959' }}>
                {car.description || `Experience the pure sensation of driving this ${car.name}. Fully inspected by certified technicians, featuring ${car.transmission} gearbox, a solid ${car.fuel_type} engine system, and designed to provide comfort with a capacity of ${car.seats} seats. Please contact our support team to schedule a personal driving consultation.`}
              </Paragraph>
            </div>

            {/* Premium Features Checklist */}
            {car.features && car.features.length > 0 && (
              <div>
                <Title level={3} style={{ fontFamily: 'Outfit, sans-serif', marginBottom: 16 }}>Standard & Optional Equipment</Title>
                <Row gutter={[16, 16]}>
                  {car.features.map((feature, idx) => (
                    <Col xs={12} sm={8} key={idx}>
                      <Card styles={{ body: { padding: '16px 20px' } }} style={{ borderRadius: 12, border: 'none', background: '#f5f5f7' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                          <div>
                            <Text strong style={{ fontSize: 14, display: 'block' }}>{feature.name}</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>{feature.value}</Text>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </Space>
        </Col>

        {/* Technical Specs Card */}
        <Col xs={24} lg={10}>
          <Card
            title="Technical Specifications Sheet"
            style={{ borderRadius: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: 'none' }}
          >
            <Descriptions column={1} bordered size="middle" style={{ borderRadius: 12, overflow: 'hidden' }}>
              <Descriptions.Item label="Model Class">{car.name}</Descriptions.Item>
              <Descriptions.Item label="Manufacturer">{car.brand_id?.name}</Descriptions.Item>
              <Descriptions.Item label="Model Year">{car.year}</Descriptions.Item>
              <Descriptions.Item label="Transmission Class" style={{ textTransform: 'capitalize' }}>{car.transmission}</Descriptions.Item>
              <Descriptions.Item label="Fuel Infrastructure" style={{ textTransform: 'capitalize' }}>{car.fuel_type}</Descriptions.Item>
              <Descriptions.Item label="Displacement / Engine">{car.engine || 'Unavailable'}</Descriptions.Item>
              <Descriptions.Item label="Max Horsepower">{car.horsepower ? `${car.horsepower} HP` : 'Unavailable'}</Descriptions.Item>
              <Descriptions.Item label="Seats Capacity">{car.seats} Seats</Descriptions.Item>
              <Descriptions.Item label="Showroom Odometer">{car.mileage.toLocaleString()} KM</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Showroom Booking / Reservation Modal */}
      <Modal
        visible={bookingModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={550}
        styles={{ body: { padding: 32 } }}
        style={{ borderRadius: 20, overflow: 'hidden' }}
        centered
      >
        {!bookingSuccess ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <CalendarTwoTone twoToneColor="#1890ff" style={{ fontSize: 48, marginBottom: 12 }} />
              <Title level={3} style={{ margin: 0, fontFamily: 'Outfit, sans-serif' }}>Showroom Reservation</Title>
              <Text type="secondary">Book your exclusive viewing session for the {car.name}</Text>
            </div>

            <Form
              form={bookingForm}
              layout="vertical"
              onFinish={handleBookingSubmit}
              requiredMark={false}
              initialValues={{
                carName: car.name,
                preferredTime: 'morning'
              }}
            >
              <Form.Item
                name="carName"
                label="Selected Model"
              >
                <Input disabled size="large" prefix={<DashboardOutlined />} style={{ borderRadius: 10 }} />
              </Form.Item>

              <Row gutter={16}>
                <Col span={24} sm={12}>
                  <Form.Item
                    name="name"
                    label="Your Name"
                    rules={[{ required: true, message: 'Please provide your name' }]}
                  >
                    <Input size="large" prefix={<UserOutlined />} placeholder="Full Name" style={{ borderRadius: 10 }} />
                  </Form.Item>
                </Col>

                <Col span={24} sm={12}>
                  <Form.Item
                    name="phone"
                    label="Phone Number"
                    rules={[{ required: true, message: 'Please provide your phone number' }]}
                  >
                    <Input size="large" prefix={<PhoneOutlined />} placeholder="Mobile Number" style={{ borderRadius: 10 }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24} sm={12}>
                  <Form.Item
                    name="date"
                    label="Preferred Date"
                    rules={[{ required: true, message: 'Please select a date' }]}
                  >
                    <DatePicker 
                      size="large" 
                      style={{ width: '100%', borderRadius: 10 }} 
                      disabledDate={(current) => current && current < dayjs().startOf('day')}
                    />
                  </Form.Item>
                </Col>

                <Col span={24} sm={12}>
                  <Form.Item
                    name="preferredTime"
                    label="Session Bracket"
                  >
                    <Select size="large" style={{ borderRadius: 10 }} dropdownStyle={{ borderRadius: 10 }}>
                      <Option value="morning">Morning (09:00 AM - 12:00 PM)</Option>
                      <Option value="afternoon">Afternoon (01:00 PM - 05:00 PM)</Option>
                      <Option value="evening">Evening (06:00 PM - 08:00 PM)</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="message"
                label="Special Requests (Optional)"
              >
                <Input.TextArea rows={3} placeholder="Tell us if you want to trade-in or arrange financing" style={{ borderRadius: 10 }} />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, marginTop: 12 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={bookingLoading}
                  size="large"
                  style={{
                    width: '100%',
                    height: 48,
                    borderRadius: 12,
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(24, 144, 255, 0.25)',
                  }}
                >
                  Confirm Reservation & Schedule Session
                </Button>
              </Form.Item>
            </Form>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 20 }} />
            <Title level={3} style={{ fontFamily: 'Outfit, sans-serif' }}>Reservation Complete!</Title>
            <Paragraph style={{ fontSize: 16 }}>
              Thank you! Your private showroom viewing session has been registered. Our premium sales executive will contact you shortly to confirm the appointment details.
            </Paragraph>

            <Card style={{ background: '#f6ffed', border: '1px dashed #b7eb8f', borderRadius: 16, margin: '24px 0' }}>
              <Space direction="vertical" size={4}>
                <Text type="secondary" style={{ fontSize: 12 }}>RESERVATION TICKET ID</Text>
                <Title level={4} style={{ margin: 0, color: '#52c41a', fontFamily: 'monospace', letterSpacing: 2 }}>
                  {bookingRef}
                </Title>
              </Space>
            </Card>

            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', color: '#8c8c8c' }}>
                <span><PhoneOutlined /> Hotline: 1900-8888</span>
                <span>•</span>
                <span><MailOutlined /> concierge@ecommerce.com</span>
              </div>
              <Button type="primary" size="large" onClick={handleModalClose} style={{ borderRadius: 10, width: '100%', height: 44, marginTop: 16 }}>
                Return to Showroom Detail
              </Button>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CarDetailsPage;
