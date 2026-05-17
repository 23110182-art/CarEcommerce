import React from 'react';
import { Form, Input, Typography, App } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { LuxuryButton } from '@/components/common/LuxuryButton';
import { authApi } from '@/features/auth/authApi';
import type { RegisterInput } from '@/features/auth/authSchemas';
import { registerSchema } from '@/features/auth/authSchemas';

const { Title, Text } = Typography;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { notification } = App.useApp();
  const { control, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      notification.success({
        message: 'Success',
        description: 'Registration successful! An OTP has been sent to your email.',
        placement: 'topRight',
      });
      // Redirect to OTP verification with email in state
      navigate('/verify-otp', { state: { email: data.data.email } });
    },
    onError: (error: any) => {
      notification.error({
        message: 'Registration Failed',
        description: error.response?.data?.message || 'Something went wrong',
      });
    },
  });

  const onSubmit = (data: RegisterInput) => {
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
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
          <Title level={2} style={{ color: 'var(--color-accent)', marginBottom: '8px' }}>Create Account</Title>
          <Text style={{ color: 'var(--color-text-secondary)' }}>Join our exclusive circle of luxury</Text>
        </div>

        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label={<span style={{ color: 'var(--color-text-secondary)' }}>Full Name</span>}
            validateStatus={errors.name ? 'error' : ''}
            help={errors.name?.message}
          >
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  size="large"
                  placeholder="John Doe"
                  style={{ background: 'transparent', color: 'white' }}
                />
              )}
            />
          </Form.Item>

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
            label={<span style={{ color: 'var(--color-text-secondary)' }}>Password</span>}
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
              Sign Up
            </LuxuryButton>
          </Form.Item>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Text style={{ color: 'var(--color-text-secondary)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--color-accent)' }}>Log In</Link>
            </Text>
          </div>
        </Form>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
