import React from 'react';
import { Table, Button, Space, message, Typography, Popconfirm, Tag, Select } from 'antd';
import { Trash2, Shield, User as UserIcon } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/features/user/userApi';

const { Title, Text } = Typography;
const { Option } = Select;

const UsersManagementPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Queries
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: userApi.getAllUsers,
  });

  // Mutations
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => userApi.updateUser(id, data),
    onSuccess: () => {
      message.success('User updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Failed to update user');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: () => {
      message.success('User deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Failed to delete user');
    },
  });

  const handleRoleChange = (id: string, newRole: 'user' | 'admin') => {
    updateMutation.mutate({ id, data: { role: newRole } });
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text style={{ color: 'white', fontWeight: 600 }}>{text}</Text>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text: string) => <Text style={{ color: 'var(--color-text-secondary)' }}>{text}</Text>,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: '150px',
      render: (role: 'user' | 'admin', record: any) => (
        <Select
          value={role}
          onChange={(val) => handleRoleChange(record._id, val)}
          style={{ width: '120px' }}
          disabled={updateMutation.isPending}
        >
          <Option value="user">
            <Space>
              <UserIcon size={12} />
              User
            </Space>
          </Option>
          <Option value="admin">
            <Space style={{ color: 'var(--color-accent)' }}>
              <Shield size={12} />
              Admin
            </Space>
          </Option>
        </Select>
      ),
    },
    {
      title: 'Verification Status',
      dataIndex: 'isVerified',
      key: 'isVerified',
      width: '160px',
      render: (verified: boolean) => (
        <Tag color={verified ? 'success' : 'warning'} style={{ borderRadius: '4px', fontWeight: 600 }}>
          {verified ? 'VERIFIED' : 'UNVERIFIED'}
        </Tag>
      ),
    },
    {
      title: 'Joined Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => <Text style={{ color: 'var(--color-text-secondary)' }}>{new Date(date).toLocaleDateString()}</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '100px',
      render: (_: any, record: any) => (
        <Popconfirm
          title="Delete Account"
          description="Are you sure you want to permanently delete this user?"
          onConfirm={() => deleteMutation.mutate(record._id)}
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
        >
          <Button 
            type="text" 
            danger 
            icon={<Trash2 size={16} />} 
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <Title level={2} style={{ color: 'white', margin: 0 }}>Users Management</Title>
        <Text style={{ color: 'var(--color-text-secondary)' }}>Manage system users, access privileges and account security</Text>
      </div>

      <Table 
        columns={columns} 
        dataSource={users} 
        rowKey="_id"
        loading={isLoading}
        style={{
          background: 'var(--color-surface)',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
        }}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default UsersManagementPage;
