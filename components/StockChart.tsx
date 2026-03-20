"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { PricePoint } from "@/lib/indicators";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface StockChartProps {
  data: PricePoint[];
  sma20: number | null;
  sma50: number | null;
}

export function StockChart({ data, sma20, sma50 }: StockChartProps) {
  if (data.length === 0) return null;

  const labels = data.map((d) => d.date.slice(5));
  const prices = data.map((d) => d.close);

  const sma20Values: (number | null)[] = [];
  const sma50Values: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    sma20Values.push(
      i >= 19
        ? data.slice(i - 19, i + 1).reduce((a, b) => a + b.close, 0) / 20
        : null
    );
    sma50Values.push(
      i >= 49
        ? data.slice(i - 49, i + 1).reduce((a, b) => a + b.close, 0) / 50
        : null
    );
  }

  const datasets: Array<{
    label: string;
    data: (number | null)[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
    tension: number;
    pointRadius: number;
    pointHoverRadius: number;
    borderDash?: number[];
  }> = [
    {
      label: "Price",
      data: prices,
      borderColor: "rgb(34, 197, 94)",
      backgroundColor: "rgba(34, 197, 94, 0.1)",
      fill: true,
      tension: 0.1,
      pointRadius: 0,
      pointHoverRadius: 4,
    },
  ];
  if (sma20 != null) {
    datasets.push({
      label: "SMA 20",
      data: sma20Values,
      borderColor: "rgb(59, 130, 246)",
      backgroundColor: "transparent",
      fill: false,
      tension: 0.1,
      pointRadius: 0,
      pointHoverRadius: 4,
      borderDash: [4, 4],
    });
  }
  if (sma50 != null) {
    datasets.push({
      label: "SMA 50",
      data: sma50Values,
      borderColor: "rgb(245, 158, 11)",
      backgroundColor: "transparent",
      fill: false,
      tension: 0.1,
      pointRadius: 0,
      pointHoverRadius: 4,
      borderDash: [4, 4],
    });
  }

  const chartData = { labels, datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: (ctx: { dataset: { label?: string }; raw: unknown }) =>
            `${ctx.dataset.label}: ฿${Number(ctx.raw).toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(51, 65, 85, 0.3)" },
        ticks: { color: "#94a3b8", maxTicksLimit: 8 },
      },
      y: {
        grid: { color: "rgba(51, 65, 85, 0.3)" },
        ticks: {
          color: "#94a3b8",
          callback: (value: string | number) => `฿${value}`,
        },
      },
    },
  };

  return (
    <div className="h-80 w-full">
      <Line data={chartData} options={options} />
    </div>
  );
}
