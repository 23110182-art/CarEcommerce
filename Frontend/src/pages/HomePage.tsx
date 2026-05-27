import React, { useRef } from 'react';
import { Typography, Skeleton, Empty, Carousel } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LuxuryButton } from '@/components/common/LuxuryButton';
import { LuxuryCard } from '@/components/common/LuxuryCard';
import { carApi } from '@/features/car/carApi';
import { bannerApi } from '@/features/banner/bannerApi';
import type { Car } from '@/features/car/carTypes';
import { formatPrice } from '@/utils/format';

const { Title } = Typography;

const CarSection = ({ title, cars, isLoading, onViewAll, onCarClick }: { title: string; cars?: Car[]; isLoading: boolean; onViewAll?: () => void; onCarClick: (id: string) => void }) => {
  if (isLoading) {
    return (
      <div style={{ padding: '60px 0' }}>
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  if (!cars || cars.length === 0) return null;

  return (
    <section style={{ padding: '60px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
        <div>
          <Title level={2} style={{ color: 'white', margin: 0 }}>{title}</Title>
          <div style={{ width: '60px', height: '3px', background: 'var(--color-accent)', marginTop: '10px' }}></div>
        </div>
        <LuxuryButton 
          type="default" 
          style={{ color: 'var(--color-accent)', borderColor: 'var(--color-accent)' }}
          onClick={onViewAll}
        >
          View All
        </LuxuryButton>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
        {cars.map((car) => {
          const discountedPrice = car.sale_price ?? car.salePrice;
          const hasDiscount = !!car.applied_promotion && discountedPrice !== undefined;
          const discountTag = hasDiscount && car.applied_promotion
            ? car.applied_promotion.discount_type === 'percentage'
              ? `-${car.applied_promotion.discount_value}%`
              : `-${formatPrice(car.applied_promotion.discount_value)}`
            : undefined;

          return (
            <LuxuryCard 
              key={car._id}
              title={car.name}
              subtitle={`${car.year} • ${car.transmission} • ${car.fuelType}`}
              price={hasDiscount && discountedPrice !== undefined ? formatPrice(discountedPrice) : formatPrice(car.price)}
              originalPrice={hasDiscount ? formatPrice(car.price) : undefined}
              discountTag={discountTag}
              imageSrc={car.thumbnail || car.images[0]?.url || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1000&auto=format&fit=crop'}
              onClick={() => onCarClick(car._id)}
            />
          );
        })}
      </div>
    </section>
  );
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const carouselRef = useRef<any>(null);

  const { data: featuredCars, isLoading: featuredLoading } = useQuery({
    queryKey: ['cars', 'featured'],
    queryFn: carApi.getFeaturedCars,
  });

  const { data: newestCars, isLoading: newestLoading } = useQuery({
    queryKey: ['cars', 'newest'],
    queryFn: carApi.getNewestCars,
  });

  const { data: bestSellers, isLoading: bestSellersLoading } = useQuery({
    queryKey: ['cars', 'best-sellers'],
    queryFn: carApi.getBestSellerCars,
  });

  const { data: banners } = useQuery({
    queryKey: ['banners'],
    queryFn: () => bannerApi.getAllBanners(),
  });

  const activeBanners = banners?.filter((b) => b.is_active) || [];

  return (
    <div style={{ padding: '0 50px' }}>
      {/* Banner Carousel or Fallback Static Hero Section */}
      {activeBanners.length > 0 ? (
        <div style={{ margin: '0 -50px', overflow: 'hidden', borderRadius: '0 0 40px 40px', position: 'relative' }}>
          <Carousel ref={carouselRef} autoplay autoplaySpeed={5000} effect="fade" dots={{ className: 'luxury-dots' }} draggable>
            {activeBanners.map((banner) => (
              <div key={banner._id}>
                <div style={{ 
                  height: '80vh', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  textAlign: 'center',
                  background: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url("${banner.image}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  padding: '0 50px'
                }}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                  >
                    <h1 style={{ fontSize: '64px', color: 'white', marginBottom: '20px', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}>
                      {banner.title}
                    </h1>
                    {banner.link && (
                      <LuxuryButton type="primary" onClick={() => navigate(banner.link as string)}>
                        Explore Showroom
                      </LuxuryButton>
                    )}
                  </motion.div>
                </div>
              </div>
            ))}
          </Carousel>

          {activeBanners.length > 1 && (
            <>
              {/* Left Navigation Arrow */}
              <button
                onClick={() => carouselRef.current?.prev()}
                style={{
                  position: 'absolute',
                  left: '30px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '18px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                  outline: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-accent)';
                  e.currentTarget.style.color = 'black';
                  e.currentTarget.style.borderColor = 'var(--color-accent)';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                <LeftOutlined />
              </button>

              {/* Right Navigation Arrow */}
              <button
                onClick={() => carouselRef.current?.next()}
                style={{
                  position: 'absolute',
                  right: '30px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '18px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                  outline: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-accent)';
                  e.currentTarget.style.color = 'black';
                  e.currentTarget.style.borderColor = 'var(--color-accent)';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                <RightOutlined />
              </button>
            </>
          )}
        </div>
      ) : (
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ 
            height: '80vh', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center',
            textAlign: 'center',
            background: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url("https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2000&auto=format&fit=crop")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '0 0 40px 40px',
            margin: '0 -50px'
          }}
        >
          <h1 style={{ fontSize: '72px', color: 'white', marginBottom: '20px', fontFamily: 'var(--font-heading)' }}>
            DRIVE THE <span style={{ color: 'var(--color-accent)' }}>EXTRAORDINARY</span>
          </h1>
          <p style={{ fontSize: '20px', color: 'var(--color-text-secondary)', maxWidth: '600px', marginBottom: '40px' }}>
            Experience the pinnacle of automotive excellence with our curated collection of world-class luxury vehicles.
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <LuxuryButton type="primary" onClick={() => navigate('/cars')}>Explore Inventory</LuxuryButton>
            <LuxuryButton type="default" style={{ color: 'white', borderColor: 'white' }}>Learn More</LuxuryButton>
          </div>
        </motion.section>
      )}

      {/* Featured Cars Section */}
      <CarSection 
        title="Featured Vehicles" 
        cars={featuredCars} 
        isLoading={featuredLoading} 
        onViewAll={() => navigate('/cars?isFeatured=true')}
        onCarClick={(id) => navigate(`/cars/${id}`)}
      />

      {/* Newest Cars Section */}
      <CarSection 
        title="New Arrivals" 
        cars={newestCars} 
        isLoading={newestLoading} 
        onViewAll={() => navigate('/cars?is_new=true')}
        onCarClick={(id) => navigate(`/cars/${id}`)}
      />

      {/* Best Sellers Section */}
      <CarSection 
        title="Best Sellers" 
        cars={bestSellers} 
        isLoading={bestSellersLoading} 
        onViewAll={() => navigate('/cars?sort=best_selling')}
        onCarClick={(id) => navigate(`/cars/${id}`)}
      />

      {/* If all sections are empty and not loading */}
      {!featuredLoading && !newestLoading && !bestSellersLoading && 
       (!featuredCars?.length && !newestCars?.length && !bestSellers?.length) && (
        <div style={{ padding: '100px 0', textAlign: 'center' }}>
          <Empty description={<span style={{ color: 'var(--color-text-secondary)' }}>No cars found in our showroom. Check back later!</span>} />
        </div>
      )}
    </div>
  );
};
