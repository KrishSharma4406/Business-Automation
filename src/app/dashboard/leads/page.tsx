"use client";

import { FormEvent, useState } from "react";

export default function LeadsPage() {
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState<any>(null);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setResult(null);

    const formData = new FormData(event.currentTarget);

    const body = {
      name: formData.get("name"),

      email: formData.get("email"),

      phone: formData.get("phone"),

      company: formData.get("company"),

      message: formData.get("message"),

      source: "dashboard",
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(body),
      });

      const data = await response.json();

      setResult(data);

      if (response.ok) {
        event.currentTarget.reset();
      }
    } catch (error) {
      console.error(error);

      setResult({
        success: false,
        error: "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">

        <h1 className="text-3xl font-bold">
          Create Lead
        </h1>

        <p className="mt-2 text-gray-600">
          Add a lead and let AI qualify it automatically.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 rounded-xl border bg-white p-8"
        >

          <div>
            <label className="text-sm font-medium">
              Name
            </label>

            <input
              name="name"
              required
              className="mt-2 w-full rounded-lg border p-3"
              placeholder="Rahul Sharma"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Email
            </label>

            <input
              name="email"
              type="email"
              className="mt-2 w-full rounded-lg border p-3"
              placeholder="rahul@example.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Phone
            </label>

            <input
              name="phone"
              className="mt-2 w-full rounded-lg border p-3"
              placeholder="9876543210"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Company
            </label>

            <input
              name="company"
              className="mt-2 w-full rounded-lg border p-3"
              placeholder="Rahul Technologies"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Requirement
            </label>

            <textarea
              name="message"
              rows={5}
              className="mt-2 w-full rounded-lg border p-3"
              placeholder="Tell us what you need..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-black px-6 py-3 font-medium text-white disabled:opacity-50"
          >
            {loading
              ? "AI is analyzing..."
              : "Create & Analyze Lead"}
          </button>

        </form>

        {result?.success && (
          <div className="mt-8 rounded-xl border bg-white p-8">

            <h2 className="text-xl font-bold">
              AI Qualification
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-3">

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">
                  Score
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {result.lead.aiScore}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">
                  Priority
                </p>

                <p className="mt-1 text-2xl font-bold capitalize">
                  {result.lead.priority}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">
                  Source
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {result.lead.source}
                </p>
              </div>

            </div>

            <div className="mt-6">
              <h3 className="font-semibold">
                AI Summary
              </h3>

              <p className="mt-2 text-gray-600">
                {result.lead.aiSummary}
              </p>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold">
                Suggested Response
              </h3>

              <div className="mt-2 rounded-lg bg-gray-50 p-4 text-gray-700">
                {result.lead.aiResponse}
              </div>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}