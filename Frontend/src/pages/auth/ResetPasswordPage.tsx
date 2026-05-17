import React, { useEffect } from 'react';
import { Form, Input, Typography, notification } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { LuxuryButton } from '@/components/common/LuxuryButton';
import { authApi } from '@/features/auth/authApi';
import { resetPasswordSchema, type ResetPasswordInput } from '@/features/auth/authSchemas';

const { Title, Text } = Typography;

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const { control, handleSubmit, formState: { errors } } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email },
  });

  const mutation = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      notification.success({
        message: 'Success',
        description: 'Your password has been reset successfully. You can now login.',
      });
      navigate('/login');
    },
    onError: (error: any) => {
      notification.error({
        message: 'Reset Failed',
        description: error.response?.data?.message || 'Invalid code or data',
      });
    },
  });

  const onSubmit = (data: ResetPasswordInput) => {
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
          <Title level={2} style={{ color: 'var(--color-accent)', marginBottom: '8px' }}>Reset Password</Title>
          <Text style={{ color: 'var(--color-text-secondary)' }}>Set your new credentials</Text>
        </div>

        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label={<span style={{ color: 'var(--color-text-secondary)' }}>OTP Code</span>}
            validateStatus={errors.otp ? 'error' : ''}
            help={errors.otp?.message}
          >
            <Controller
              name="otp"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  size="large"
                  maxLength={6}
                  placeholder="123456"
                  style={{ background: 'transparent', color: 'white', textAlign: 'center', letterSpacing: '5px' }}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label={<span style={{ color: 'var(--color-text-secondary)' }}>New Password</span>}
            validateStatus={errors.newPassword ? 'error' : ''}
            help={errors.newPassword?.message}
          >
            <Controller
              name="newPassword"
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
              Reset Password
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

export default ResetPasswordPage;
