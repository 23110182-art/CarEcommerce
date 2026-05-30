import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { List, Rate, Form, Input, Button, Card, Typography, message, Modal, Space, Tag } from 'antd';
import { reviewApi } from '@/features/car/newFeaturesApi';
import type { Review } from '@/features/car/newFeaturesTypes';

const { Title, Text } = Typography;

interface ReviewsSectionProps {
  productId: string;
}

export const ReviewsSection = ({ productId }: ReviewsSectionProps) => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [rating, setRating] = useState(5);
  const [rewardModal, setRewardModal] = useState<{ visible: boolean; coupon?: string; points?: number }>({
    visible: false,
  });

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => reviewApi.getReviews(productId),
  });

  const createReviewMutation = useMutation({
    mutationFn: (values: { comment: string }) =>
      reviewApi.createReview(productId, rating, values.comment),
    onSuccess: (data: any) => {
      message.success('Đánh giá sản phẩm thành công!');
      form.resetFields();
      setRating(5);
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });

      if (data.rewardCoupon || data.rewardPoints) {
        setRewardModal({
          visible: true,
          coupon: data.rewardCoupon,
          points: data.rewardPoints,
        });
      }
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá');
    },
  });

  const handleSubmit = (values: { comment: string }) => {
    createReviewMutation.mutate(values);
  };

  return (
    <Card
      style={{
        borderRadius: 24,
        background: 'rgba(255, 255, 255, 0.03)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        marginTop: 32,
      }}
    >
      <Title level={3} style={{ marginBottom: 24 }}>
        Đánh giá & Bình luận ({reviews.length})
      </Title>

      <List
        loading={isLoading}
        itemLayout="horizontal"
        dataSource={reviews}
        locale={{ emptyText: 'Chưa có đánh giá nào cho sản phẩm này' }}
        renderItem={(item: Review) => (
          <List.Item style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
            <List.Item.Meta
              title={
                <Space>
                  <Text strong>{item.user?.name || 'Khách hàng'}</Text>
                  <Rate disabled defaultValue={item.rating} style={{ fontSize: 12 }} />
                </Space>
              }
              description={
                <Space direction="vertical" size={4}>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{item.comment}</Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                  </Text>
                </Space>
              }
            />
          </List.Item>
        )}
      />

      <Card
        style={{
          borderRadius: 16,
          background: 'rgba(255, 255, 255, 0.02)',
          borderColor: 'rgba(255, 255, 255, 0.06)',
          marginTop: 24,
        }}
      >
        <Title level={4} style={{ marginBottom: 16 }}>
          Viết đánh giá của bạn
        </Title>
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item label="Đánh giá số sao" required>
            <Rate value={rating} onChange={setRating} />
          </Form.Item>

          <Form.Item
            name="comment"
            label="Nội dung bình luận"
            rules={[{ required: true, message: 'Vui lòng nhập bình luận của bạn' }]}
          >
            <Input.TextArea rows={4} placeholder="Chia sẻ cảm nhận của bạn về chiếc xe..." />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={createReviewMutation.isPending}
              style={{ borderRadius: 8 }}
            >
              Gửi đánh giá
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Modal
        title={<span style={{ fontSize: 20, color: '#faad14' }}>🎉 Chúc mừng bạn!</span>}
        open={rewardModal.visible}
        onCancel={() => setRewardModal({ visible: false })}
        footer={[
          <Button key="ok" type="primary" onClick={() => setRewardModal({ visible: false })}>
            Tuyệt vời, cảm ơn!
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: '100%', padding: '16px 0' }} size={16}>
          <Text style={{ fontSize: 16 }}>
            Cảm ơn bạn đã đóng góp đánh giá chất lượng cho chiếc xe này. Để tri ân, chúng tôi xin gửi tặng bạn:
          </Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {rewardModal.points && (
              <Tag color="gold" style={{ fontSize: 14, padding: '8px 16px', borderRadius: 8 }}>
                💰 Cộng thêm <strong>{rewardModal.points} điểm tích luỹ</strong> vào ví của bạn.
              </Tag>
            )}
            {rewardModal.coupon && (
              <Tag color="green" style={{ fontSize: 14, padding: '8px 16px', borderRadius: 8 }}>
                🎟️ Mã giảm giá 10% cho đơn hàng tiếp theo: <strong>{rewardModal.coupon}</strong>
              </Tag>
            )}
          </div>
        </Space>
      </Modal>
    </Card>
  );
};