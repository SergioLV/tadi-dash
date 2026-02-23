interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
}

export default function StatCard({ title, value, subtitle, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray/50">
      <div className="flex items-center gap-3 sm:block">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1 sm:mt-3">
          <p className="text-xs sm:text-sm text-medium font-medium">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-dark mt-0.5">{value}</p>
          {subtitle && <p className="text-xs text-light mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
