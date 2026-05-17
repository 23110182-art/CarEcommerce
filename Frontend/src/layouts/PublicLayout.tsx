import { Layout, Button, Space, Typography } from 'antd';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { logout } from '@/features/auth/authSlice';
import { LogOut, User as UserIcon } from 'lucide-react';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

export const PublicLayout = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Header
        style={{
          background: 'rgba(11, 11, 12, 0.85)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 50px',
        }}
      >
        <Link to="/" style={{ color: 'var(--color-accent)', fontSize: '24px', fontFamily: 'var(--font-heading)', fontWeight: 'bold' }}>
          LUXURY AUTO
        </Link>
        
        <Space size="large">
          <nav style={{ display: 'flex', gap: '30px' }}>
            <Link to="/" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}>Home</Link>
            <Link to="/cars" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}>Cars</Link>
            <Link to="/brands" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}>Brands</Link>
          </nav>

          <div style={{ marginLeft: '20px', borderLeft: '1px solid var(--color-border)', paddingLeft: '20px' }}>
            {isAuthenticated ? (
              <Space size="middle">
                <Space size="small">
                  <UserIcon size={16} color="var(--color-accent)" />
                  <Text style={{ color: 'white', fontWeight: 500 }}>{user?.name}</Text>
                </Space>
                <Button 
                  type="text" 
                  icon={<LogOut size={16} />} 
                  onClick={handleLogout}
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Logout
                </Button>
              </Space>
            ) : (
              <Link to="/login" style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
                LOGIN
              </Link>
            )}
          </div>
        </Space>
      </Header>
      
      <Content>
        <Outlet />
      </Content>

      <Footer style={{ textAlign: 'center', background: 'var(--color-surface)', color: 'var(--color-text-secondary)', borderTop: '1px solid var(--color-border)' }}>
        Luxury Auto Showroom ©{new Date().getFullYear()} Created with elegance
      </Footer>
    </Layout>
  );
};
