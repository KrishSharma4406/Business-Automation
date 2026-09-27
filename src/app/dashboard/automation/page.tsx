export default function AutomationPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Automations
            </h1>

            <p className="mt-2 text-gray-600">
              Automate repetitive business tasks with AI.
            </p>
          </div>

          <button className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800">
            + Create Automation
          </button>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">

          <StatCard
            title="Total Automations"
            value="0"
          />

          <StatCard
            title="Active"
            value="0"
          />

          <StatCard
            title="Executions"
            value="0"
          />

        </div>

        <div className="mt-8 rounded-xl border bg-white">

          <div className="border-b p-6">
            <h2 className="font-semibold text-gray-900">
              Your Automations
            </h2>
          </div>

          <div className="p-10 text-center">
            <p className="text-gray-500">
              No automations created yet.
            </p>

            <p className="mt-2 text-sm text-gray-400">
              Create your first workflow to automate
              a repetitive business task.
            </p>

            <button className="mt-6 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white">
              Create your first automation
            </button>
          </div>

        </div>

      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-3 text-3xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}