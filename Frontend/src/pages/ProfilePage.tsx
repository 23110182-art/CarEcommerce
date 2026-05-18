import React, { useState, useEffect } from 'react';
import { Form, Input, Button, DatePicker, Select, Card, Avatar, Upload, App, Space, Row, Col, Divider, Typography } from 'antd';
import { UserOutlined, PhoneOutlined, LockOutlined, EditOutlined, MailOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { userApi, type User } from '@/features/user/userApi';
import { uploadApi } from '@/features/upload/uploadApi';

const { Title, Text } = Typography;
const { Option } = Select;

export const ProfilePage: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await userApi.getProfile();
      setProfile(data);
      form.setFieldsValue({
        name: data.name,
        phone: data.phone || '',
        address: data.address || '',
        dob: data.dob ? dayjs(data.dob) : null,
        gender: data.gender || 'male',
      });
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to load profile');
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      message.error('Please log in to access your profile.');
      navigate('/login');
      return;
    }
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (values: any) => {
    try {
      setLoading(true);
      const formattedValues = {
        ...values,
        dob: values.dob ? values.dob.toISOString() : undefined,
        avatar: profile?.avatar, // Keep existing avatar
      };
      const updated = await userApi.updateProfile(formattedValues);
      setProfile(updated);
      message.success('Profile updated successfully!');
      // Update local storage or session if needed (e.g. name / avatar)
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      setUploading(true);
      const res = await uploadApi.uploadSingle(file);

      // Update local profile state and then database
      if (profile) {
        const updated = await userApi.updateProfile({
          name: profile.name,
          avatar: res.url,
        });
        setProfile(updated);
        message.success('Avatar updated successfully!');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleChangePassword = async (values: any) => {
    try {
      setPasswordLoading(true);
      await userApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success('Password changed successfully! Keep it secure.');
      passwordForm.resetFields();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 24px' }}>
      <Row gutter={[32, 32]}>
        {/* Left Side: Avatar Panel */}
        <Col xs={24} md={8}>
          <Card
            styles={{ body: { padding: 40 } }}
            style={{
              textAlign: 'center',
              borderRadius: 20,
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
              border: 'none',
              background: 'linear-gradient(145deg, #ffffff 0%, #f9fbfd 100%)',
            }}
          >
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 24 }}>
              <Avatar
                size={160}
                src={profile?.avatar}
                icon={<UserOutlined />}
                style={{
                  boxShadow: '0 8px 24px rgba(24, 144, 255, 0.15)',
                  border: '4px solid #fff',
                }}
              />
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={(file) => {
                  handleAvatarUpload(file);
                  return false;
                }}
              >
                <Button
                  type="primary"
                  shape="circle"
                  icon={<EditOutlined />}
                  loading={uploading}
                  style={{
                    position: 'absolute',
                    bottom: 5,
                    right: 5,
                    width: 40,
                    height: 40,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                  }}
                />
              </Upload>
            </div>

            <Title level={3} style={{ marginBottom: 4, fontFamily: 'Outfit, sans-serif' }}>
              {profile?.name}
            </Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
              <MailOutlined style={{ marginRight: 6 }} /> {profile?.email}
            </Text>

            <div style={{ display: 'inline-block', padding: '6px 16px', background: '#e6f7ff', borderRadius: 20 }}>
              <Text strong style={{ color: '#1890ff', textTransform: 'uppercase', fontSize: 12 }}>
                {profile?.role}
              </Text>
            </div>

            <Divider style={{ margin: '24px 0' }} />

            <div style={{ textAlign: 'left' }}>
              <Title level={5} style={{ marginBottom: 12 }}>Account Info</Title>
              <div style={{ marginBottom: 8 }}>
                <Text type="secondary">Member Since:</Text>{' '}
                <Text strong>{profile?.createdAt ? dayjs(profile.createdAt).format('MMMM D, YYYY') : '-'}</Text>
              </div>
              <div>
                <Text type="secondary">Verified Status:</Text>{' '}
                <Text strong style={{ color: profile?.isVerified ? '#52c41a' : '#faad14' }}>
                  {profile?.isVerified ? 'Verified Account' : 'Unverified'}
                </Text>
              </div>
            </div>
          </Card>
        </Col>

        {/* Right Side: Profile Details & Password Card */}
        <Col xs={24} md={16}>
          <Space direction="vertical" size={32} style={{ width: '100%' }}>

            {/* Profile Form Card */}
            <Card
              title={<span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 20, fontWeight: 600 }}>Personal Profile Details</span>}
              style={{
                borderRadius: 20,
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                border: 'none',
              }}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleUpdateProfile}
                requiredMark={false}
              >
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="name"
                      label="Full Name"
                      rules={[{ required: true, message: 'Please input your full name!' }]}
                    >
                      <Input prefix={<UserOutlined />} placeholder="Your full name" size="large" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="phone"
                      label="Phone Number"
                    >
                      <Input prefix={<PhoneOutlined />} placeholder="Your phone number" size="large" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="dob"
                      label="Date of Birth"
                    >
                      <DatePicker
                        style={{ width: '100%', borderRadius: 10 }}
                        size="large"
                        placeholder="Select your birth date"
                        prefix={<CalendarOutlined style={{ marginRight: 6 }} />}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="gender"
                      label="Gender"
                    >
                      <Select size="large" style={{ borderRadius: 10 }} dropdownStyle={{ borderRadius: 10 }}>
                        <Option value="male">Male</Option>
                        <Option value="female">Female</Option>
                        <Option value="other">Other / Rather not say</Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24}>
                    <Form.Item
                      name="address"
                      label="Address"
                    >
                      <Input.TextArea

                        placeholder="Your residential address"
                        rows={3}
                        style={{ borderRadius: 10, paddingLeft: 10 }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item style={{ marginBottom: 0, marginTop: 12 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    size="large"
                    style={{
                      borderRadius: 10,
                      padding: '0 32px',
                      height: 46,
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(24, 144, 255, 0.25)',
                    }}
                  >
                    Save Changes
                  </Button>
                </Form.Item>
              </Form>
            </Card>

            {/* Change Password Card */}
            <Card
              title={<span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 20, fontWeight: 600 }}>Security & Password Management</span>}
              style={{
                borderRadius: 20,
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                border: 'none',
              }}
            >
              <Form
                form={passwordForm}
                layout="vertical"
                onFinish={handleChangePassword}
                requiredMark={false}
              >
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="currentPassword"
                      label="Current Password"
                      rules={[{ required: true, message: 'Please input your current password!' }]}
                    >
                      <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="newPassword"
                      label="New Password"
                      rules={[
                        { required: true, message: 'Please input a new password!' },
                        { min: 8, message: 'Password must be at least 8 characters long!' }
                      ]}
                    >
                      <Input.Password prefix={<LockOutlined />} placeholder="Min 8 characters" size="large" style={{ borderRadius: 10 }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item style={{ marginBottom: 0, marginTop: 12 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={passwordLoading}
                    danger
                    size="large"
                    style={{
                      borderRadius: 10,
                      padding: '0 32px',
                      height: 46,
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(255, 77, 79, 0.2)',
                    }}
                  >
                    Change Password
                  </Button>
                </Form.Item>
              </Form>
            </Card>

          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default ProfilePage;
