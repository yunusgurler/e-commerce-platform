"use client";

import React, { useEffect, useState } from "react";
import { Card, Statistic, Table, Spin } from "antd";
import { useAuth } from "../../../../context/AuthContext";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { apiFetch } from "../../../../utils/api";

const AdminDashboard = () => {
  const [data, setData] = useState<any>(null);
  const router = useRouter();
  const { accessToken, user, loading } = useAuth();

  // redirect non-admins
  useEffect(() => {
    if (!loading && user?.role !== "admin") {
      router.push("/login");
    }
  }, [user, loading, router]);

  // fetch dashboard once we have token and user is admin
  useEffect(() => {
    if (loading) return;
    if (!accessToken) return;
    if (user?.role !== "admin") return;

    (async () => {
      try {
        const resp = await apiFetch("/api/admin/dashboard", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setData(resp);
      } catch (err) {
        console.error("Failed to load admin dashboard:", err);
      }
    })();
  }, [accessToken, user, loading]);

  if (loading || !data)
    return (
      <div className="flex justify-center items-center h-full">
        <Spin size="large" />
      </div>
    );

  const trendData =
    data.salesTrend?.map((d: any) => ({
      day: d._id?.day || "",
      sales: d.sales,
      orders: d.count,
    })) || [];

  const statusData =
    data.statusDist?.map((d: any) => ({
      name: d._id,
      value: d.count,
    })) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <Statistic
            title="Total Sales"
            value={data.totalSales ? data.totalSales.toFixed(2) : 0}
            prefix="$"
          />
        </Card>
        <Card>
          <Statistic title="Orders" value={data.orderCount || 0} />
        </Card>
        <Card>
          <Statistic title="Customers" value={data.customerCount || 0} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Orders">
          <Table
            dataSource={data.recentOrders}
            rowKey="_id"
            pagination={false}
            columns={[
              { title: "Order ID", dataIndex: "_id" },
              {
                title: "User",
                render: (r: any) => r.userId?.email || "—",
              },
              {
                title: "Total",
                dataIndex: "total",
                render: (v: number) => `$${v.toFixed(2)}`,
              },
              { title: "Status", dataIndex: "status" },
              {
                title: "Created",
                dataIndex: "createdAt",
                render: (d: string) => new Date(d).toLocaleDateString(),
              },
            ]}
          />
        </Card>
        <Card title="Popular Products">
          <Table
            dataSource={data.popularProducts}
            rowKey="_id"
            pagination={false}
            columns={[
              { title: "Name", dataIndex: "name" },
              { title: "Reviews", dataIndex: "reviewCount" },
              { title: "Rating", dataIndex: "averageRating" },
            ]}
          />
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
