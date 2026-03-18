import React from "react";
import { Button, Result } from "antd";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
      }}
    >
      <Result
        status="404"
        title="404"
        subTitle="抱歉，你访问的页面不存在"
        extra={
          <Button type="primary">
            <Link to="/">返回首页</Link>
          </Button>
        }
      />
    </div>
  );
}

export default NotFound;
