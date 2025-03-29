import React, { useMemo } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from "chart.js";
import StatusPieChart from "./StatusPieChart";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement
);

const RequisitionsCharts = ({ purchaseRequisitions, userRequests }) => {
  const departmentCounts = purchaseRequisitions.reduce(
    (acc, { department }) => {
      acc[department] = (acc[department] || 0) + 1;
      return acc;
    },
    {}
  );

  const completedDepartmentCounts = purchaseRequisitions.reduce(
    (acc, { department, status }) => {
      if (status === "complete") {
        acc[department] = (acc[department] || 0) + 1;
      }
      return acc;
    },
    {}
  );

  const vendorCounts = purchaseRequisitions.reduce(
    (acc, { selected_vendor }) => {
      acc[selected_vendor] = (acc[selected_vendor] || 0) + 1;
      return acc;
    },
    {}
  );

  const completedVendorCounts = purchaseRequisitions.reduce(
    (acc, { selected_vendor, status }) => {
      if (status === "complete") {
        acc[selected_vendor] = (acc[selected_vendor] || 0) + 1;
      }
      return acc;
    },
    {}
  );

  const departmentChartData = {
    labels: Object.keys(departmentCounts),
    datasets: [
      {
        label: "Requisitions per Department",
        data: Object.values(departmentCounts),
        backgroundColor: "#00C49F",
        borderWidth: 0,
      },
      {
        label: "Completed Requisitions per Department",
        data: Object.keys(departmentCounts).map(
          (dept) => completedDepartmentCounts[dept] || 0
        ),
        backgroundColor: "#0088FE",
        borderWidth: 0,
      },
    ],
  };

  const vendorChartData = {
    labels: Object.keys(vendorCounts),
    datasets: [
      {
        label: "Requisitions per Vendor",
        data: Object.values(vendorCounts),
        backgroundColor: "#FFBB28",
        borderWidth: 0,
      },
      {
        label: "Completed Requisitions per Vendor",
        data: Object.keys(vendorCounts).map(
          (vendor) => completedVendorCounts[vendor] || 0
        ),
        backgroundColor: "#FF8042",
        borderWidth: 0,
      },
    ],
  };

  const requisitionsOverTime = useMemo(() => {
    const counts = {};
    const completedCounts = {};

    purchaseRequisitions.forEach(({ created_at, status }) => {
      const month = new Date(created_at).toISOString().slice(0, 7); // Format: YYYY-MM
      counts[month] = (counts[month] || 0) + 1;
      if (status === "complete") {
        completedCounts[month] = (completedCounts[month] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([month, count]) => ({
        month,
        count,
        completedCount: completedCounts[month] || 0,
      }));
  }, [purchaseRequisitions]);

  const trendsChartData = {
    labels: requisitionsOverTime.map((entry) => entry.month),
    datasets: [
      {
        label: "Requisitions Over Time",
        data: requisitionsOverTime.map((entry) => entry.count),
        borderColor: "crimson",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4,
      },
      {
        label: "Completed Requisitions Over Time",
        data: requisitionsOverTime.map((entry) => entry.completedCount),
        borderColor: "blue",
        backgroundColor: "rgba(0, 0, 255, 0.2)",
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="RequisitionsCharts">
      <div className="bar-container">
        <p>Requisitions by Vendor</p>
        <Bar data={vendorChartData} />
      </div>
      <div className="bar-container">
        <p>Requisitions by Department</p>
        <Bar data={departmentChartData} />
      </div>
      <div className="line-container">
        <p>Requisitions Over Time</p>
        <Line data={trendsChartData} />
      </div>
    </div>
  );
};

export default RequisitionsCharts;
