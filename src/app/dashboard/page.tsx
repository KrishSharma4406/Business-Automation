export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900">
          AI Business OS
        </h1>

        <p className="mt-2 text-gray-600">
          Manage your business with AI-powered automation.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Customers"
            value="0"
            description="Total customers"
          />

          <DashboardCard
            title="Leads"
            value="0"
            description="Active leads"
          />

          <DashboardCard
            title="Conversations"
            value="0"
            description="Customer conversations"
          />

          <DashboardCard
            title="Automations"
            value="0"
            description="Active automations"
          />
        </div>
      </div>
    </main>
  );
}

function DashboardCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-sm font-medium text-gray-500">
        {title}
      </h2>

      <p className="mt-3 text-3xl font-bold text-gray-900">
        {value}
      </p>

      <p className="mt-2 text-sm text-gray-500">
        {description}
      </p>
    </div>
  );
}