export default function AutomationsPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold">
          Automations
        </h1>

        <p className="mt-2 text-gray-600">
          Build AI-powered workflows for your business.
        </p>

        <div className="mt-8 rounded-xl border bg-white p-8">
          <p className="text-gray-500">
            No automations configured.
          </p>
        </div>
      </div>
    </main>
  );
}