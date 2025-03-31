import { useState } from "react";
import { Form, Input, Button, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";

export default function CreateProductForm({ onBack }) {
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const handleUpload = ({ fileList }) => {
    setFileList(fileList);
  };

  const handleSubmit = async (values) => {
    if (fileList.length === 0) {
      messageApi.error("Please upload an image.");
      return;
    }

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("type", values.type);
    formData.append("price", values.price);
    formData.append("description", values.description);
    formData.append("image", fileList[0].originFileObj);

    const response = await fetch("http://localhost:8080/products", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      messageApi.success("Product created successfully!");
      form.resetFields();
      setFileList([]);
      onBack();
    } else {
      messageApi.error("Failed to create product.");
    }
  };

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical">
      {contextHolder}
      <Form.Item
        label="Name"
        name="name"
        rules={[{ required: true, message: "Please enter a product name" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Type"
        name="type"
        rules={[{ required: true, message: "Please enter a product type" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Price"
        name="price"
        rules={[{ required: true, message: "Please enter a price" }]}
      >
        <Input type="number" />
      </Form.Item>
      <Form.Item
        label="Description"
        name="description"
        rules={[{ required: true, message: "Please enter a description" }]}
      >
        <Input.TextArea />
      </Form.Item>
      <Form.Item label="Image" required>
        <Upload
          beforeUpload={() => false}
          onChange={handleUpload}
          fileList={fileList}
          maxCount={1}
          multiple={false}
        >
          <Button icon={<UploadOutlined />}>Upload Image</Button>
        </Upload>
      </Form.Item>
      <Button type="primary" htmlType="submit">
        Create Product
      </Button>
      <Button style={{ marginLeft: "10px" }} onClick={onBack}>
        Back
      </Button>
    </Form>
  );
}
