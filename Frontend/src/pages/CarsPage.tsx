import React, { useState } from 'react';
import { Layout, Typography, Input, Select, Slider, Pagination, Space, Card, Skeleton, Empty, Button, Drawer } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Filter, Search, X } from 'lucide-react';
import { carApi } from '@/features/car/carApi';
import { brandApi } from '@/features/brand/brandApi';
import { LuxuryCard } from '@/components/common/LuxuryCard';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const CarsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync state with URL params
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const brand = searchParams.get('brand') || undefined;
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : 0;
  const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : 500000;

  // Queries
  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: brandApi.getAllBrands,
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['cars', { page, search, brand, sort, minPrice, maxPrice }],
    queryFn: () => carApi.getAllCars({
      page,
      search,
      brand,
      sort,
      minPrice: minPrice > 0 ? minPrice : undefined,
      maxPrice: maxPrice < 500000 ? maxPrice : undefined,
      limit: 9
    }),
  });

  const updateParams = (updates: Record<string, string | number | undefined>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === 0) {
        newParams.delete(key);
      } else {
        newParams.set(key, value.toString());
      }
    });
    // Reset to page 1 when filters change (except when page itself is being changed)
    if (!updates.page) newParams.delete('page');
    setSearchParams(newParams);
  };

  const handlePriceChange = (value: number[]) => {
    updateParams({ minPrice: value[0], maxPrice: value[1] });
  };

  const FilterContent = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Text strong style={{ color: 'var(--color-accent)', textTransform: 'uppercase', fontSize: '12px' }}>Search</Text>
        <Input
          prefix={<Search size={16} color="var(--color-text-secondary)" />}
          placeholder="Search by name..."
          defaultValue={search}
          onPressEnter={(e) => updateParams({ search: (e.target as HTMLInputElement).value })}
          style={{ marginTop: '8px', background: '#1e2124', border: '1px solid #2a2d31' }}
        />
      </div>

      <div>
        <Text strong style={{ color: 'var(--color-accent)', textTransform: 'uppercase', fontSize: '12px' }}>Brand</Text>
        <Select
          style={{ width: '100%', marginTop: '8px' }}
          placeholder="All Brands"
          value={brand}
          onChange={(val) => updateParams({ brand: val })}
          allowClear
        >
          {brands?.map(b => (
            <Option key={b._id} value={b._id}>{b.name}</Option>
          ))}
        </Select>
      </div>

      <div>
        <Text strong style={{ color: 'var(--color-accent)', textTransform: 'uppercase', fontSize: '12px' }}>Price Range</Text>
        <div style={{ padding: '0 10px' }}>
          <Slider
            range
            min={0}
            max={500000}
            step={5000}
            defaultValue={[minPrice, maxPrice]}
            onAfterChange={handlePriceChange}
            tooltip={{ formatter: (v) => `$${v?.toLocaleString()}` }}
            style={{ marginTop: '25px' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            <Text style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>$0</Text>
            <Text style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>$500k+</Text>
          </div>
        </div>
      </div>

      <Button
        block
        icon={<X size={16} />}
        onClick={() => setSearchParams({})}
        style={{ marginTop: '20px' }}
      >
        Clear Filters
      </Button>
    </Space>
  );

  return (
    <div style={{ padding: '40px 50px' }}>
      <Layout style={{ background: 'transparent' }}>
        {/* Desktop Sidebar */}
        <Sider
          width={300}
          style={{ background: 'transparent', marginRight: '40px' }}
          breakpoint="lg"
          collapsedWidth={0}
          trigger={null}
        >
          <div style={{
            background: 'var(--color-surface)',
            padding: '30px',
            borderRadius: '16px',
            position: 'sticky',
            top: '100px',
            border: '1px solid var(--color-border)'
          }}>
            <Title level={4} style={{ marginBottom: '30px', color: 'white' }}>Filters</Title>
            <FilterContent />
          </div>
        </Sider>

        <Content>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div>
              <Title level={2} style={{ color: 'white', margin: 0 }}>Exclusive Collection</Title>
              <Text style={{ color: 'var(--color-text-secondary)' }}>Showing {data?.pagination.total || 0} vehicles</Text>
            </div>

            <Space>
              <Button
                className="mobile-filter-btn"
                icon={<Filter size={18} />}
                style={{ display: 'none' }} // Visible via media query in CSS
                onClick={() => setIsMobileFilterOpen(true)}
              >
                Filters
              </Button>
              <Select
                defaultValue="newest"
                style={{ width: 180 }}
                value={sort}
                onChange={(val) => updateParams({ sort: val })}
              >
                <Option value="newest">Newest First</Option>
                <Option value="price_asc">Price: Low to High</Option>
                <Option value="price_desc">Price: High to Low</Option>
                <Option value="best_selling">Best Selling</Option>
              </Select>
            </Space>
          </div>

          {(isLoading || isFetching) ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
              {[...Array(6)].map((_, i) => (
                <Card key={i} style={{ background: 'var(--color-surface)', border: 'none' }}>
                  <Skeleton active paragraph={{ rows: 3 }} />
                </Card>
              ))}
            </div>
          ) : data?.cars.length === 0 ? (
            <Empty
              style={{ padding: '100px 0' }}
              description={<Text style={{ color: 'var(--color-text-secondary)' }}>No vehicles match your criteria.</Text>}
            />
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                {data?.cars.map((car) => {
                  const hasDiscount = !!car.applied_promotion && car.sale_price !== undefined;
                  const discountTag = hasDiscount && car.applied_promotion
                    ? car.applied_promotion.discount_type === 'percentage'
                      ? `-${car.applied_promotion.discount_value}%`
                      : `-$${car.applied_promotion.discount_value.toLocaleString()}`
                    : undefined;

                  return (
                    <LuxuryCard
                      key={car._id}
                      title={car.name}
                      subtitle={`${car.year} • ${car.transmission} • ${car.fuel_type}`}
                      price={hasDiscount && car.sale_price !== undefined ? `$${car.sale_price.toLocaleString()}` : `$${car.price.toLocaleString()}`}
                      originalPrice={hasDiscount ? `$${car.price.toLocaleString()}` : undefined}
                      discountTag={discountTag}
                      imageSrc={car.thumbnail || car.images[0]?.url || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1000&auto=format&fit=crop'}
                      onClick={() => navigate(`/cars/${car._id}`)}
                    />
                  );
                })}
              </div>

              <div style={{ marginTop: '50px', textAlign: 'center' }}>
                <Pagination
                  current={page}
                  total={data?.pagination.total}
                  pageSize={data?.pagination.limit}
                  onChange={(p) => updateParams({ page: p })}
                  showSizeChanger={false}
                />
              </div>
            </>
          )}
        </Content>
      </Layout>

      {/* Mobile Drawer */}
      <Drawer
        title="Filter Vehicles"
        placement="right"
        onClose={() => setIsMobileFilterOpen(false)}
        open={isMobileFilterOpen}
        styles={{ body: { background: 'var(--color-bg)' }, header: { background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' } }}
      >
        <FilterContent />
      </Drawer>

      <style>{`
        @media (max-width: 992px) {
          .mobile-filter-btn { display: inline-flex !important; }
        }
      `}</style>
    </div>
  );
};

export default CarsPage;
