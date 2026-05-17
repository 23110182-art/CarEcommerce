import React from 'react';
import { Form, Input, Typography, notification } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { LuxuryButton } from '@/components/common/LuxuryButton';
import { authApi } from '@/features/auth/authApi';
import type { ForgotPasswordInput } from '@/features/auth/authSchemas';
import { forgotPasswordSchema } from '@/features/auth/authSchemas';

const { Title, Text } = Typography;

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { control, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (_, variables) => {
      notification.success({
        message: 'Email Sent',
        description: 'If an account exists for that email, we have sent a reset code.',
      });
      navigate('/reset-password', { state: { email: variables.email } });
    },
    onError: (error: any) => {
      notification.error({
        message: 'Error',
        description: error.response?.data?.message || 'Something went wrong',
      });
    },
  });

  const onSubmit = (data: ForgotPasswordInput) => {
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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
          <Title level={2} style={{ color: 'var(--color-accent)', marginBottom: '8px' }}>Recovery</Title>
          <Text style={{ color: 'var(--color-text-secondary)' }}>Enter your email to receive a reset code</Text>
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

          <Form.Item style={{ marginTop: '40px' }}>
            <LuxuryButton
              htmlType="submit"
              loading={mutation.isPending}
              style={{ width: '100%' }}
            >
              Send Reset Code
            </LuxuryButton>
          </Form.Item>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link to="/login" style={{ color: 'var(--color-accent)' }}>Back to Login</Link>
          </div>
        </Form>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
