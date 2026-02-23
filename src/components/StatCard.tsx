interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
}

export default function StatCard({ title, value, subtitle, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray/50">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-sm text-medium font-medium">{title}</p>
      <p className="text-3xl font-bold text-dark mt-1">{value}</p>
      {subtitle && <p className="text-xs text-light mt-1">{subtitle}</p>}
    </div>
  );
}
