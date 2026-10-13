export interface NeonServicesConfig {
  databaseUrl?: string;
  databaseUrlUnpooled?: string;
  branch?: string;
  aiGatewayBaseUrl?: string;
  aiGatewayToken?: string;
  functionHelloBaseUrl?: string;
}

export function getNeonConfig(): NeonServicesConfig {
  return {
    databaseUrl: process.env.DATABASE_URL,
    databaseUrlUnpooled: process.env.DATABASE_URL_UNPOOLED,
    branch: process.env.NEON_BRANCH,
    aiGatewayBaseUrl: process.env.NEON_AI_GATEWAY_BASE_URL,
    aiGatewayToken: process.env.NEON_AI_GATEWAY_TOKEN,
    functionHelloBaseUrl: process.env.NEON_FUNCTION_HELLO_BASE_URL,
  };
}

export async function invokeNeonFunction(
  functionName: "hello" | string = "hello",
  options: RequestInit = {}
): Promise<{ ok: boolean; status: number; text: string }> {
  let url = process.env.NEON_FUNCTION_HELLO_BASE_URL;

  if (functionName !== "hello") {
    const envKey = `NEON_FUNCTION_${functionName.toUpperCase()}_BASE_URL`;
    url = process.env[envKey] || url;
  }

  if (!url) {
    throw new Error(
      `Neon Function URL for "${functionName}" is not configured in environment variables.`
    );
  }

  const response = await fetch(url, {
    method: options.method || "GET",
    headers: options.headers,
    body: options.body,
    cache: "no-store",
  });

  const text = await response.text();

  return {
    ok: response.ok,
    status: response.status,
    text,
  };
}

export async function checkNeonAIGateway(): Promise<{
  configured: boolean;
  modelCatalogAvailable: boolean;
  status: number;
  message?: string;
  modelsCount?: number;
}> {
  const baseUrl = process.env.NEON_AI_GATEWAY_BASE_URL;
  const token = process.env.NEON_AI_GATEWAY_TOKEN;

  if (!baseUrl || !token) {
    return {
      configured: false,
      modelCatalogAvailable: false,
      status: 0,
      message: "Neon AI Gateway environment variables missing",
    };
  }

  try {
    const response = await fetch(`${baseUrl}/v1/models`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (response.ok) {
      const data = await response.json();
      return {
        configured: true,
        modelCatalogAvailable: true,
        status: response.status,
        modelsCount: Array.isArray(data?.data) ? data.data.length : undefined,
        message: "AI Gateway models catalog reachable",
      };
    }

    const errorText = await response.text();
    return {
      configured: true,
      modelCatalogAvailable: false,
      status: response.status,
      message: errorText,
    };
  } catch (err) {
    return {
      configured: true,
      modelCatalogAvailable: false,
      status: 500,
      message: err instanceof Error ? err.message : String(err),
    };
  }
}
