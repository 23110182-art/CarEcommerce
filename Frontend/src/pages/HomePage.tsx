import React from 'react';
import { Typography, Skeleton, Empty } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LuxuryButton } from '@/components/common/LuxuryButton';
import { LuxuryCard } from '@/components/common/LuxuryCard';
import { carApi } from '@/features/car/carApi';
import type { Car } from '@/features/car/carTypes';

const { Title } = Typography;

const CarSection = ({ title, cars, isLoading, onViewAll }: { title: string; cars?: Car[]; isLoading: boolean; onViewAll?: () => void }) => {
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
        {cars.map((car) => (
          <LuxuryCard 
            key={car._id}
            title={car.name}
            subtitle={`${car.year} • ${car.transmission} • ${car.drivetrain}`}
            price={`$${car.price.toLocaleString()}`}
            imageSrc={car.images[0] || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1000&auto=format&fit=crop'}
          />
        ))}
      </div>
    </section>
  );
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

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

  return (
    <div style={{ padding: '0 50px' }}>
      {/* Hero Section */}
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

      {/* Featured Cars Section */}
      <CarSection 
        title="Featured Vehicles" 
        cars={featuredCars} 
        isLoading={featuredLoading} 
        onViewAll={() => navigate('/cars?is_featured=true')}
      />

      {/* Newest Cars Section */}
      <CarSection 
        title="New Arrivals" 
        cars={newestCars} 
        isLoading={newestLoading} 
        onViewAll={() => navigate('/cars?is_new=true')}
      />

      {/* Best Sellers Section */}
      <CarSection 
        title="Best Sellers" 
        cars={bestSellers} 
        isLoading={bestSellersLoading} 
        onViewAll={() => navigate('/cars?sort=best_selling')}
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
