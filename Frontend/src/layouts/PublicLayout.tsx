import { Layout, Button, Space } from 'antd';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { logout } from '@/features/auth/authSlice';
import { LogOut, User as UserIcon, Heart } from 'lucide-react';

const { Header, Content, Footer } = Layout;

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
                <Link 
                  to="/wishlist" 
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    color: 'white', 
                    transition: 'color 0.3s',
                    marginRight: '8px'
                  }}
                  title="Danh sách yêu thích"
                >
                  <Heart size={18} color="var(--color-accent)" />
                </Link>
                <Link 
                  to="/profile" 
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    color: 'white', 
                    fontWeight: 500,
                    transition: 'color 0.3s'
                  }}
                >
                  <UserIcon size={16} color="var(--color-accent)" />
                  <span>{user?.name}</span>
                </Link>
                {user?.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    style={{ 
                      color: 'var(--color-accent)', 
                      marginLeft: '15px', 
                      fontSize: '12px', 
                      fontWeight: 'bold',
                      border: '1px solid var(--color-accent)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      letterSpacing: '1px',
                      fontFamily: 'var(--font-heading)'
                    }}
                  >
                    ADMIN PANEL
                  </Link>
                )}
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
