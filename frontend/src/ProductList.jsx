import { useState, useEffect } from "react";
import { Card, Row, Col, Button, Input, Select, Modal } from "antd";

const { Search } = Input;
const { Option } = Select;

export default function ProductList({ onEdit }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sortOption, setSortOption] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [searchQuery, sortOption, products]);

  const fetchProducts = () => {
    fetch("http://localhost:8080/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setFilteredProducts(data);
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

  const showModal = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  return (
    <div>
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
              onClick={() => showModal(product)}
            >
              <p>Price: ${product.price}</p>
              <p>Type: {product.type}</p>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={selectedProduct?.name}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        {selectedProduct && (
          <div>
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              style={{ width: "100%", marginBottom: "10px" }}
            />
            <p>
              <strong>Type:</strong> {selectedProduct.type}
            </p>
            <p>
              <strong>Price:</strong> ${selectedProduct.price}
            </p>
            <p>
              <strong>Description:</strong> {selectedProduct.description}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
