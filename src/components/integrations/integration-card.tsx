"use client";

import { useState } from "react";
import ConnectModal from "./connect-modal";

type Props = {
    provider: {
        provider: string;
        name: string;
        description: string;
    };

    integration?: {
        id: string;
        provider: string;
        name: string;
        status:
        | "CONNECTED"
        | "DISCONNECTED"
        | "ERROR";
        hasCredentials: boolean;
    };

    onRefresh: () => void;
};

export default function IntegrationCard({
    provider,
    integration,
    onRefresh,
}: Props) {
    const [showModal, setShowModal] =
        useState(false);

    const [deleting, setDeleting] =
        useState(false);

    const connected =
        integration?.status ===
        "CONNECTED";

    async function disconnect() {
        if (!integration) return;

        const confirmed =
            window.confirm(
                `Disconnect ${provider.name}?`
            );

        if (!confirmed) return;

        try {
            setDeleting(true);

            const response =
                await fetch(
                    `/api/integrations/${integration.id}`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify({
                            status: "DISCONNECTED",
                        }),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Failed to disconnect"
                );
            }

            onRefresh();
        } catch (error: any) {
            alert(
                error.message ||
                "Something went wrong"
            );
        } finally {
            setDeleting(false);
        }
    }

    return (
        <>
            <div className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="mb-5">
                    <h2 className="text-xl font-semibold">
                        {provider.name}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        {provider.description}
                    </p>
                </div>

                <div className="mb-6">
                    {connected ? (
                        <span className="text-sm text-green-600">
                            ● Connected
                        </span>
                    ) : integration?.status ===
                        "ERROR" ? (
                        <span className="text-sm text-red-600">
                            ● Connection error
                        </span>
                    ) : (
                        <span className="text-sm text-gray-500">
                            ○ Not connected
                        </span>
                    )}
                </div>

                <div className="flex gap-3">
                    {connected ? (
                        <>
                            <button
                                onClick={() =>
                                    setShowModal(true)
                                }
                                className="rounded-lg border px-4 py-2 text-sm"
                            >
                                Manage
                            </button>

                            <button
                                onClick={disconnect}
                                disabled={deleting}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-50"
                            >
                                {deleting
                                    ? "Disconnecting..."
                                    : "Disconnect"}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() =>
                                setShowModal(true)
                            }
                            className="rounded-lg bg-black px-4 py-2 text-sm text-white"
                        >
                            Connect
                        </button>
                    )}
                </div>
            </div>

            {showModal && (
                <ConnectModal
                    provider={provider}
                    integration={integration}
                    onClose={() =>
                        setShowModal(false)
                    }
                    onSuccess={() => {
                        setShowModal(false);
                        onRefresh();
                    }}
                />
            )}
        </>
    );
}