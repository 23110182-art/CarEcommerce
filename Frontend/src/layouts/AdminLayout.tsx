import { Layout, Menu } from 'antd';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Car, LayoutDashboard, Users, Tags, Image as ImageIcon, Percent } from 'lucide-react';

const { Header, Sider, Content } = Layout;

export const AdminLayout = () => {
  const location = useLocation();

  const menuItems = [
    {
      key: '/admin',
      icon: <LayoutDashboard size={18} />,
      label: <Link to="/admin">Dashboard</Link>,
    },
    {
      key: '/admin/cars',
      icon: <Car size={18} />,
      label: <Link to="/admin/cars">Cars Management</Link>,
    },
    {
      key: '/admin/brands',
      icon: <Tags size={18} />,
      label: <Link to="/admin/brands">Brands</Link>,
    },
    {
      key: '/admin/banners',
      icon: <ImageIcon size={18} />,
      label: <Link to="/admin/banners">Banners</Link>,
    },
    {
      key: '/admin/users',
      icon: <Users size={18} />,
      label: <Link to="/admin/users">Users</Link>,
    },
    {
      key: '/admin/promotions',
      icon: <Percent size={18} />,
      label: <Link to="/admin/promotions">Promotions</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        width={250} 
        style={{ 
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)'
        }}
      >
        <div style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--color-border)' }}>
          <h2 style={{ color: 'var(--color-accent)', margin: 0, fontFamily: 'var(--font-heading)' }}>ADMIN PANEL</h2>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ background: 'transparent', borderRight: 0, marginTop: '20px' }}
        />
      </Sider>
      <Layout style={{ background: 'var(--color-bg)' }}>
        <Header style={{ background: 'var(--color-surface)', padding: '0 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <Link to="/" style={{ color: 'var(--color-text-secondary)' }}>Back to Showroom</Link>
        </Header>
        <Content style={{ margin: '24px', background: 'var(--color-surface)', padding: 24, borderRadius: 8, border: '1px solid var(--color-border)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
