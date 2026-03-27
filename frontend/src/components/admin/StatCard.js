export default function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-stone-500 font-medium">{title}</p>
          <p className="text-lg font-bold text-stone-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
