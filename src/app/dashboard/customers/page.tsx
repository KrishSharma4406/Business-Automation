export default function CustomersPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold">
          Customers
        </h1>

        <p className="mt-2 text-gray-600">
          Manage your customers and customer information.
        </p>

        <div className="mt-8 rounded-xl border bg-white p-8">
          <p className="text-gray-500">
            No customers yet.
          </p>
        </div>
      </div>
    </main>
  );
}