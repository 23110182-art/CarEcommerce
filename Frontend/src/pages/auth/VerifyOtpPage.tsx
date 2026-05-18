import React, { useEffect } from 'react';
import { Form, Input, Typography, App } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { LuxuryButton } from '@/components/common/LuxuryButton';
import { authApi } from '@/features/auth/authApi';
import { useAppDispatch } from '@/hooks/redux';
import { setCredentials } from '@/features/auth/authSlice';
import { verifyOtpSchema, type VerifyOtpInput } from '@/features/auth/authSchemas';

const { Title, Text } = Typography;

const VerifyOtpPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { notification } = App.useApp();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  const { control, handleSubmit, formState: { errors } } = useForm<VerifyOtpInput>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { email },
  });

  const mutation = useMutation({
    mutationFn: authApi.verifyOtp,
    onSuccess: (data) => {
      notification.success({
        message: 'Verified',
        description: 'Your account has been verified successfully!',
      });
      // Backend returns user and tokens on verify-otp success
      dispatch(setCredentials({
        user: data.data.user,
        accessToken: data.data.accessToken
      }));
      if (data.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    },
    onError: (error: any) => {
      notification.error({
        message: 'Verification Failed',
        description: error.response?.data?.message || 'Invalid OTP',
      });
    },
  });

  const onSubmit = (data: VerifyOtpInput) => {
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
          <Title level={2} style={{ color: 'var(--color-accent)', marginBottom: '8px' }}>Verify Account</Title>
          <Text style={{ color: 'var(--color-text-secondary)' }}>
            We've sent a 6-digit code to <br />
            <Text strong style={{ color: 'white' }}>{email}</Text>
          </Text>
        </div>

        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label={<span style={{ color: 'var(--color-text-secondary)' }}>One-Time Password</span>}
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
                  style={{
                    background: 'transparent',
                    color: 'white',
                    textAlign: 'center',
                    fontSize: '24px',
                    letterSpacing: '10px'
                  }}
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
              Verify & Enter
            </LuxuryButton>
          </Form.Item>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Text style={{ color: 'var(--color-text-secondary)' }}>
              Didn't receive the code?{' '}
              <a href="#" style={{ color: 'var(--color-accent)' }}>Resend OTP</a>
            </Text>
          </div>
        </Form>
      </motion.div>
    </div>
  );
};

export default VerifyOtpPage;
