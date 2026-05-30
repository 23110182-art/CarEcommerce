import React, { useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Switch,
  message,
  Typography,
  Popconfirm,
  Tag,
  Row,
  Col,
} from "antd";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { promotionApi } from "@/features/promotion/promotionApi";
import { brandApi } from "@/features/brand/brandApi";
import { carApi } from "@/features/car/carApi";
import { categoryApi } from "@/features/category/categoryApi";
import { formatPrice } from "@/utils/format";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const PromotionsManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Watch fields in Form
  const applyToValue = Form.useWatch("apply_to", form);

  // Queries
  const { data: promotions, isLoading: promoLoading } = useQuery({
    queryKey: ["promotions"],
    queryFn: promotionApi.getAllPromotions,
  });

  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: brandApi.getAllBrands,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryApi.getAllCategories,
  });

  const { data: carsResult } = useQuery({
    queryKey: ["cars", { limit: 100 }],
    queryFn: () => carApi.getAllCars({ limit: 100 }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: promotionApi.createPromotion,
    onSuccess: () => {
      message.success("Promotion campaign created successfully!");
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      handleClose();
    },
    onError: (err: any) => {
      message.error(
        err.response?.data?.message || "Failed to create promotion",
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      promotionApi.updatePromotion(id, data),
    onSuccess: () => {
      message.success("Promotion campaign updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      handleClose();
    },
    onError: (err: any) => {
      message.error(
        err.response?.data?.message || "Failed to update promotion",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: promotionApi.deletePromotion,
    onSuccess: () => {
      message.success("Promotion campaign deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      queryClient.invalidateQueries({ queryKey: ["cars"] });
    },
    onError: (err: any) => {
      message.error(
        err.response?.data?.message || "Failed to delete promotion",
      );
    },
  });

  const handleOpen = (id: string | null = null) => {
    setEditingId(id);
    if (id) {
      const promo = promotions?.find((p) => p._id === id);
      if (promo) {
        form.setFieldsValue({
          name: promo.name,
          description: promo.description,
          discount_type: promo.discount_type,
          discount_value: promo.discount_value,
          start_date: dayjs(promo.start_date),
          end_date: dayjs(promo.end_date),
          is_active: promo.is_active,
          apply_to: promo.apply_to,
          applicable_brands: promo.applicable_brands?.map((b) => b._id),
          applicable_categories: promo.applicable_categories?.map((c) => c._id),
          applicable_cars: promo.applicable_cars?.map((c) => c._id),
        });
      }
    } else {
      form.resetFields();
      form.setFieldsValue({
        discount_type: "percentage",
        apply_to: "all",
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingId(null);
    form.resetFields();
  };

  const handleSubmit = (values: any) => {
    const formattedValues = {
      ...values,
      start_date: values.start_date.toISOString(),
      end_date: values.end_date.toISOString(),
      applicable_brands:
        values.apply_to === "brand" ? values.applicable_brands : [],
      applicable_categories:
        values.apply_to === "category" ? values.applicable_categories : [],
      applicable_cars:
        values.apply_to === "specific_cars" ? values.applicable_cars : [],
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formattedValues });
    } else {
      createMutation.mutate(formattedValues);
    }
  };

  const columns = [
    {
      title: "Campaign Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <Space direction="vertical" size={2}>
          <Text style={{ color: "white", fontWeight: 600, fontSize: "15px" }}>
            {text}
          </Text>
          <Paragraph
            ellipsis={{ rows: 1 }}
            style={{
              color: "var(--color-text-secondary)",
              margin: 0,
              fontSize: "12px",
              maxWidth: "250px",
            }}
          >
            {record.description}
          </Paragraph>
        </Space>
      ),
    },
    {
      title: "Discount",
      key: "discount",
      render: (_: any, record: any) => {
        const isPercent = record.discount_type === "percentage";
        return (
          <Tag
            color={isPercent ? "gold" : "blue"}
            style={{
              fontSize: "14px",
              padding: "4px 10px",
              borderRadius: "6px",
              fontWeight: "bold",
            }}
          >
            {isPercent
              ? `-${record.discount_value}%`
              : `-${formatPrice(record.discount_value)}`}
          </Tag>
        );
      },
    },
    {
      title: "Applicable Scope",
      key: "scope",
      render: (_: any, record: any) => {
        let label = "All Showroom";
        let color = "cyan";

        if (record.apply_to === "brand") {
          label = `Brands (${record.applicable_brands?.length || 0})`;
          color = "magenta";
        } else if (record.apply_to === "category") {
          label = `Categories (${record.applicable_categories?.length || 0})`;
          color = "purple";
        } else if (record.apply_to === "specific_cars") {
          label = `Specific Cars (${record.applicable_cars?.length || 0})`;
          color = "orange";
        }

        return (
          <Tag
            color={color}
            style={{ textTransform: "uppercase", fontWeight: 600 }}
          >
            {label}
          </Tag>
        );
      },
    },
    {
      title: "Campaign Period",
      key: "period",
      render: (_: any, record: any) => {
        const start = dayjs(record.start_date).format("DD/MM/YYYY");
        const end = dayjs(record.end_date).format("DD/MM/YYYY");
        return (
          <Text style={{ color: "var(--color-text-secondary)" }}>
            {start} - {end}
          </Text>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "status",
      render: (active: boolean) => (
        <Tag
          color={active ? "success" : "default"}
          style={{
            fontSize: "12px",
            textTransform: "uppercase",
            fontWeight: "bold",
          }}
        >
          {active ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: "120px",
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<Edit2 size={16} />}
            onClick={() => handleOpen(record._id)}
            style={{ color: "var(--color-accent)" }}
          />
          <Popconfirm
            title="Delete Promotion"
            description="Are you sure you want to delete this promotion?"
            onConfirm={() => deleteMutation.mutate(record._id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<Trash2 size={16} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "30px", background: "transparent" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <div>
          <Title level={2} style={{ color: "white", margin: 0 }}>
            Promotions Management
          </Title>
          <Text style={{ color: "var(--color-text-secondary)" }}>
            Manage discount campaigns and pricing rules
          </Text>
        </div>
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={() => handleOpen(null)}
          style={{
            height: "40px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          Add Campaign
        </Button>
      </div>

      <Table
        dataSource={promotions}
        columns={columns}
        rowKey="_id"
        loading={promoLoading}
        pagination={{ pageSize: 10 }}
        style={{
          background: "var(--color-surface)",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid var(--color-border)",
        }}
      />

      <Modal
        title={
          <Title
            level={3}
            style={{
              margin: 0,
              color: "white",
              fontFamily: "Outfit, sans-serif",
            }}
          >
            {editingId
              ? "Edit Promotion Campaign"
              : "Create Promotion Campaign"}
          </Title>
        }
        open={isModalOpen}
        onCancel={handleClose}
        footer={null}
        width={750}
        style={{
          background: "var(--color-bg)",
          border: "1px solid var(--color-border)",
          borderRadius: "16px",
          overflow: "hidden",
        }}
        styles={{
          body: { background: "var(--color-bg)", padding: "24px 0" },
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ padding: "0 24px" }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={16}>
              <Form.Item
                name="name"
                label="Campaign Name"
                rules={[
                  { required: true, message: "Please enter campaign name" },
                ]}
              >
                <Input placeholder="e.g. Luxury Summer Sale" size="large" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item
                name="is_active"
                label="Status"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                  style={{ marginTop: "6px" }}
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                name="description"
                label="Description"
                rules={[
                  { required: true, message: "Please enter description" },
                ]}
              >
                <Input.TextArea
                  placeholder="Provide detail regarding this discount campaign"
                  rows={3}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="discount_type"
                label="Discount Type"
                rules={[
                  { required: true, message: "Please choose discount type" },
                ]}
              >
                <Select size="large">
                  <Option value="percentage">Percentage (%)</Option>
                  <Option value="amount">Fixed Amount (VNĐ)</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="discount_value"
                label="Discount Value"
                rules={[
                  { required: true, message: "Please enter discount value" },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  size="large"
                  min={0}
                  placeholder={
                    applyToValue === "percentage" ? "e.g. 10" : "e.g. 50000"
                  }
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="start_date"
                label="Start Date"
                rules={[
                  { required: true, message: "Please select start date" },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  size="large"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="end_date"
                label="End Date"
                rules={[{ required: true, message: "Please select end date" }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  size="large"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                name="apply_to"
                label="Applicable Scope"
                rules={[
                  { required: true, message: "Please choose target scope" },
                ]}
              >
                <Select size="large">
                  <Option value="all">Entire Showroom (All Cars)</Option>
                  <Option value="brand">Applicable Hãng xe (Brands)</Option>
                  <Option value="category">
                    Applicable Dòng xe (Categories)
                  </Option>
                  <Option value="specific_cars">
                    Specific Vehicles (Chọn từng xe)
                  </Option>
                </Select>
              </Form.Item>
            </Col>

            {applyToValue === "brand" && (
              <Col xs={24}>
                <Form.Item
                  name="applicable_brands"
                  label="Select Brands"
                  rules={[
                    {
                      required: true,
                      message: "Please select at least one Brand",
                    },
                  ]}
                >
                  <Select
                    mode="multiple"
                    placeholder="Select applicable brands"
                    size="large"
                    style={{ width: "100%" }}
                  >
                    {brands?.map((b) => (
                      <Option key={b._id} value={b._id}>
                        {b.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            )}

            {applyToValue === "category" && (
              <Col xs={24}>
                <Form.Item
                  name="applicable_categories"
                  label="Select Categories"
                  rules={[
                    {
                      required: true,
                      message: "Please select at least one Category",
                    },
                  ]}
                >
                  <Select
                    mode="multiple"
                    placeholder="Select applicable categories"
                    size="large"
                    style={{ width: "100%" }}
                  >
                    {categories?.map((c) => (
                      <Option key={c._id} value={c._id}>
                        {c.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            )}

            {applyToValue === "specific_cars" && (
              <Col xs={24}>
                <Form.Item
                  name="applicable_cars"
                  label="Select Vehicles"
                  rules={[
                    {
                      required: true,
                      message: "Please select at least one Car",
                    },
                  ]}
                >
                  <Select
                    mode="multiple"
                    placeholder="Select specific vehicles"
                    size="large"
                    style={{ width: "100%" }}
                  >
                    {carsResult?.cars.map((car) => (
                      <Option key={car._id} value={car._id}>
                        {car.name} ({formatPrice(car.price)})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            )}
          </Row>

          <Space
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "24px",
            }}
          >
            <Button onClick={handleClose} size="large">
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editingId ? "Save Changes" : "Create Campaign"}
            </Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
};

export default PromotionsManagementPage;
