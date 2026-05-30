import { useQuery } from "@tanstack/react-query";
import { Card, Space, Statistic, Typography } from "antd";
import { ShoppingBag, MessageSquare } from "lucide-react";

import { carApi } from "@/features/car/carApi";

const { Text } = Typography;

interface CarStatsSectionProps {
  carId: string;
}

export const CarStatsSection = ({ carId }: CarStatsSectionProps) => {
  const {
    data: stats,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["carStats", carId],
    queryFn: () => carApi.getCarStats(carId),
    enabled: !!carId,
  });

  if (isLoading || isError) {
    return null; // Or a loading/error placeholder
  }

  return (
    <Card
      style={{
        borderRadius: 24,
        background: "rgba(255, 255, 255, 0.03)",
        borderColor: "rgba(255, 255, 255, 0.08)",
        marginTop: 32,
      }}
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Statistic
          title={<Text style={{ color: "rgba(255,255,255,0.72)" }}>Khách hàng đã mua</Text>}
          value={stats?.buyersCount || 0}
          prefix={<ShoppingBag size={20} color="#52c41a" />}
          valueStyle={{ color: "#fff", fontSize: 24 }}
        />
        <Statistic
          title={<Text style={{ color: "rgba(255,255,255,0.72)" }}>Lượt đánh giá</Text>}
          value={stats?.reviewersCount || 0}
          prefix={<MessageSquare size={20} color="#1890ff" />}
          valueStyle={{ color: "#fff", fontSize: 24 }}
        />
      </Space>
    </Card>
  );
};