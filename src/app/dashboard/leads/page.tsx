export default function LeadsPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold">
          Leads
        </h1>

        <p className="mt-2 text-gray-600">
          Track and manage your business leads.
        </p>

        <div className="mt-8 rounded-xl border bg-white p-8">
          <p className="text-gray-500">
            No leads yet.
          </p>
        </div>
      </div>
    </main>
  );
}