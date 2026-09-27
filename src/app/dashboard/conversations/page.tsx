export default function ConversationsPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Conversations
            </h1>

            <p className="mt-2 text-gray-600">
              Manage customer conversations and AI responses.
            </p>
          </div>

          <button className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800">
            + New Conversation
          </button>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">

          <StatCard
            title="Total Conversations"
            value="0"
          />

          <StatCard
            title="Open"
            value="0"
          />

          <StatCard
            title="AI Resolved"
            value="0"
          />

        </div>

        <div className="mt-8 overflow-hidden rounded-xl border bg-white">

          <div className="border-b p-6">
            <h2 className="font-semibold text-gray-900">
              Recent Conversations
            </h2>
          </div>

          <div className="divide-y">

            <ConversationRow
              customer="No conversations"
              message="Customer conversations will appear here."
              channel="—"
              status="—"
            />

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

function ConversationRow({
  customer,
  message,
  channel,
  status,
}: {
  customer: string;
  message: string;
  channel: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between p-6">
      <div>
        <p className="font-medium text-gray-900">
          {customer}
        </p>

        <p className="mt-1 text-sm text-gray-500">
          {message}
        </p>
      </div>

      <div className="flex items-center gap-6 text-sm text-gray-500">
        <span>{channel}</span>
        <span>{status}</span>
      </div>
    </div>
  );
}