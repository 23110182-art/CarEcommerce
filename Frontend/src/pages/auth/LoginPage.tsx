import { Form, Input, Typography, App } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { LuxuryButton } from '@/components/common/LuxuryButton';
import { authApi } from '@/features/auth/authApi';
import type { LoginInput } from '@/features/auth/authSchemas';
import { loginSchema } from '@/features/auth/authSchemas';
import { useAppDispatch } from '@/hooks/redux';
import { setCredentials } from '@/features/auth/authSlice';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { notification } = App.useApp();
  
  const { control, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      notification.success({
        message: 'Welcome Back',
        description: 'You have logged in successfully!',
      });
      dispatch(setCredentials({
        user: data.data.user,
        accessToken: data.data.accessToken
      }));
      navigate('/');
    },
    onError: (error: any) => {
      notification.error({
        message: 'Login Failed',
        description: error.response?.data?.message || 'Invalid email or password',
      });
    },
  });

  const onSubmit = (data: LoginInput) => {
    mutation.mutate(data);
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 150px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px'
    }}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%',
          maxWidth: '450px',
          background: 'var(--color-surface)',
          padding: '40px',
          borderRadius: '16px',
          border: '1px solid var(--color-border)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Title level={2} style={{ color: 'var(--color-accent)', marginBottom: '8px' }}>Log In</Title>
          <Text style={{ color: 'var(--color-text-secondary)' }}>Welcome back to the world of excellence</Text>
        </div>

        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label={<span style={{ color: 'var(--color-text-secondary)' }}>Email Address</span>}
            validateStatus={errors.email ? 'error' : ''}
            help={errors.email?.message}
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  size="large"
                  placeholder="john@example.com"
                  style={{ background: 'transparent', color: 'white' }}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label={
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Password</span>
                <Link to="/forgot-password" style={{ color: 'var(--color-accent)', fontSize: '12px' }}>Forgot Password?</Link>
              </div>
            }
            validateStatus={errors.password ? 'error' : ''}
            help={errors.password?.message}
          >
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  size="large"
                  placeholder="••••••••"
                  style={{ background: 'transparent', color: 'white' }}
                />
              )}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: '40px' }}>
            <LuxuryButton
              htmlType="submit"
              loading={mutation.isPending}
              style={{ width: '100%' }}
            >
              Sign In
            </LuxuryButton>
          </Form.Item>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Text style={{ color: 'var(--color-text-secondary)' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--color-accent)' }}>Register</Link>
            </Text>
          </div>
        </Form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
