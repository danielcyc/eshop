import { useState } from "react";
import { Layout, Menu } from "antd";
import ProductList from "./ProductList";
import CreateProductForm from "./CreateProductForm";
import EditProductPage from "./EditProductPage";
import {
  ProductOutlined,
  FileAddOutlined,
  EditOutlined,
} from "@ant-design/icons";
const { Header, Content, Sider } = Layout;

export default function App() {
  const [view, setView] = useState("list");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  function getItem(label, key, icon, children) {
    return {
      key,
      icon,
      children,
      label,
    };
  }

  const items = [
    getItem("Products", "list", <ProductOutlined />),
    getItem("Create Product", "create", <FileAddOutlined />),
    getItem("Edit Product", "edit", <EditOutlined />),
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={sidebarCollapsed}
        onCollapse={(value) => setSidebarCollapsed(value)}
      >
        <h2
          style={{
            color: "white",
            textAlign: "center",
            margin: 10,
          }}
        >
          eShop
        </h2>
        <Menu
          theme="dark"
          mode="inline"
          items={items}
          onClick={(e) => {
            setView(e.key);
          }}
          selectedKeys={view}
        />
      </Sider>

      <Layout style={{ padding: "24px" }}>
        <Content>
          {view === "list" && <ProductList />}
          {view === "create" && (
            <CreateProductForm onBack={() => setView("list")} />
          )}
          {view === "edit" && <EditProductPage />}
        </Content>
      </Layout>
    </Layout>
  );
}
