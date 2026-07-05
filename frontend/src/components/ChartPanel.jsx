import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

export default function ChartPanel({ title, data, type = "line", height = 220 }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: !!title,
        text: title,
        color: "#FFFFFF",
        font: { size: 16, weight: 600 },
      },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.8)",
        titleColor: "#FFFFFF",
        bodyColor: "#FFFFFF",
      },
    },
    scales: {
      x: {
        ticks: { color: "#A1A1AA" },
        grid: { color: "rgba(255,255,255,0.08)" },
      },
      y: {
        ticks: { color: "#A1A1AA" },
        grid: { color: "rgba(255,255,255,0.08)" },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, labels: { color: "#A1A1AA" } },
      title: {
        display: !!title,
        text: title,
        color: "#FFFFFF",
        font: { size: 16, weight: 600 },
      },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.8)",
        titleColor: "#FFFFFF",
        bodyColor: "#FFFFFF",
      },
    },
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-brand-card p-5 shadow-glow">
      <div className="h-[230px] w-full">
        {type === "bar" ? (
          <Bar data={data} options={options} height={height} />
        ) : type === "pie" ? (
          <Pie data={data} options={pieOptions} height={height} />
        ) : type === "doughnut" ? (
          <Doughnut data={data} options={pieOptions} height={height} />
        ) : (
          <Line data={data} options={options} height={height} />
        )}
      </div>
    </div>
  );
}
