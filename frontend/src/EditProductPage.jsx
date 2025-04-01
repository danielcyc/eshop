import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Input,
  Upload,
  Select,
  message,
} from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";

const { Search } = Input;
const { Option } = Select;

export default function EditProductPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [sortOption, setSortOption] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [searchQuery, sortOption, products]);

  const fetchProducts = () => {
    fetch("http://localhost:8080/products")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Server Error");
        }
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setFilteredProducts(data);
      })
      .catch((e) => {
        messageApi.error(e.message);
      });
  };

  const filterAndSortProducts = () => {
    let filtered = products.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortOption === "price-asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price-desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortOption === "type-asc") {
      filtered.sort((a, b) => a.type.localeCompare(b.type));
    } else if (sortOption === "type-desc") {
      filtered.sort((a, b) => b.type.localeCompare(a.type));
    }

    setFilteredProducts(filtered);
  };

  const showModal = (p) => {
    setSelectedProduct(p);
    form.setFieldsValue(p);
    setModalVisible(true);
  };

  const handleUpload = ({ fileList }) => {
    setFileList(fileList);
  };

  const handleSubmit = async (values) => {
    const formData = new FormData();
    if (values.name) formData.append("name", values.name);
    if (values.type) formData.append("type", values.type);
    if (values.price) formData.append("price", values.price);
    if (values.description) formData.append("description", values.description);
    if (fileList.length > 0) {
      formData.append("image", fileList[0].originFileObj);
    }

    const response = await fetch(
      `http://localhost:8080/products/${selectedProduct.id}`,
      {
        method: "PUT",
        body: formData,
      }
    );

    if (response.ok) {
      const updatedProduct = await response.json();
      setProducts((prev) =>
        prev.map((p) =>
          p.id === updatedProduct.product.id ? updatedProduct.product : p
        )
      );

      setFilteredProducts((prev) =>
        prev.map((p) =>
          p.id === updatedProduct.product.id ? updatedProduct.product : p
        )
      );
      messageApi.success("Product updated successfully");
    } else {
      messageApi.error("Failed to update product");
    }
    setSelectedProduct(null);
    form.setFieldsValue(null);
    setModalVisible(false);
  };

  const handleDelete = async (id) => {
    const response = await fetch(`http://localhost:8080/products/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setSelectedProduct(null);
      form.setFieldsValue(null);
      setModalVisible(false);
      messageApi.success("Product deleted successfully");
    } else {
      messageApi.error("Failed to delete product");
    }
  };

  return (
    <>
      {contextHolder}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Search
          placeholder="Search by name"
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: 200 }}
        />
        <Select
          placeholder="Sort by"
          onChange={(value) => setSortOption(value)}
          style={{ width: 200 }}
        >
          <Option value="price-asc">Price: Low to High</Option>
          <Option value="price-desc">Price: High to Low</Option>
          <Option value="type-asc">Type: A to Z</Option>
          <Option value="type-desc">Type: Z to A</Option>
        </Select>
      </div>

      <Row gutter={[16, 16]}>
        {filteredProducts.map((product) => (
          <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              title={product.name}
              cover={<img src={product.image} alt={product.name} />}
              hoverable
            >
              <p>Price: ${product.price}</p>
              <p>Type: {product.type}</p>
              <Button type="primary" block onClick={() => showModal(product)}>
                Edit
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title="Edit Product"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        {selectedProduct && (
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item label="Name" name="name">
              <Input />
            </Form.Item>
            <Form.Item label="Type" name="type">
              <Input />
            </Form.Item>
            <Form.Item label="Price" name="price">
              <Input type="number" />
            </Form.Item>
            <Form.Item label="Description" name="description">
              <Input.TextArea />
            </Form.Item>
            <Form.Item label="Image">
              <Upload
                beforeUpload={() => false}
                onChange={handleUpload}
                fileList={fileList}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Upload New Image</Button>
              </Upload>
            </Form.Item>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <Button type="primary" htmlType="submit">
                Save Changes
              </Button>

              <Button
                type="primary"
                danger
                block
                onClick={() => handleDelete(selectedProduct.id)}
                icon={<DeleteOutlined />}
                style={{ width: 100 }}
              >
                Delete
              </Button>
            </div>
          </Form>
        )}
      </Modal>
    </>
  );
}
