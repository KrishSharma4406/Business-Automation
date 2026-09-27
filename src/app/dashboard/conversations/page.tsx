export default function ConversationsPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold">
          Conversations
        </h1>

        <p className="mt-2 text-gray-600">
          Manage customer conversations and AI responses.
        </p>

        <div className="mt-8 rounded-xl border bg-white p-8">
          <p className="text-gray-500">
            No conversations yet.
          </p>
        </div>
      </div>
    </main>
  );
}