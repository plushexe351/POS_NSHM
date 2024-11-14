import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register the elements
ChartJS.register(ArcElement, Tooltip, Legend);

const StatusPieChart = ({ purchaseRequisitions, userRequests }) => {
  let chartData;
  if (purchaseRequisitions) {
    chartData = [
      purchaseRequisitions.length,
      purchaseRequisitions.filter((req) => req.status === "approved").length,
      purchaseRequisitions.filter((req) => req.status === "pending").length,
      purchaseRequisitions.filter((req) => req.status === "rejected").length,
    ];
  } else if (userRequests) {
    chartData = [
      userRequests.length,
      userRequests.filter((req) => req.status.includes("accepted")).length,
      userRequests.filter((req) => req.status.includes("rejected")).length,
      userRequests.filter((req) => req.status === "accepted as admin").length,
      userRequests.filter((req) => req.status === "accepted").length,
    ];
  }
  const data = {
    labels: purchaseRequisitions
      ? ["All", "Accepted", "Pending", "Rejected"]
      : [
          "All Requests",
          "Active Users",
          "Pending Requests",
          "Admins",
          "General Users",
        ],
    datasets: [
      {
        data: chartData,
        backgroundColor: [
          "#00C49F",
          "#FFBB28",
          "#FF8042",
          "#0088FE",
          "#0061A8",
        ],
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // Turn off the legend
      },
      tooltip: { enabled: true },
    },
    maintainAspectRatio: false,
  };

  return (
    <div style={{ width: "90px", height: "90px" }}>
      <Pie data={data} options={options} />
    </div>
  );
};

export default StatusPieChart;
