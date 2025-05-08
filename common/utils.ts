import { getUserAgent } from "universal-user-agent";
import { createYunxiaoError } from "./errors.js";
import { VERSION } from "./version.js";

const DEFAULT_YUNXIAO_API_BASE_URL = "https://openapi-rdc.aliyuncs.com";

/**
 * Get the Yunxiao API base URL from environment variables or use the default
 * @returns The Yunxiao API base URL
 */
export function getYunxiaoApiBaseUrl(): string {
  return process.env.YUNXIAO_API_BASE_URL || DEFAULT_YUNXIAO_API_BASE_URL;
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export function debug(message: string, data?: unknown): void {
  if (data !== undefined) {
    console.error(`[DEBUG] ${message}`, typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
  } else {
    console.error(`[DEBUG] ${message}`);
  }
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

export function buildUrl(baseUrl: string, params: Record<string, string | number | undefined>): string {
  // Handle baseUrl that doesn't have protocol
  const fullBaseUrl = baseUrl.startsWith('http')
    ? baseUrl
    : `${getYunxiaoApiBaseUrl()}${baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`}`;

  try {
    const url = new URL(fullBaseUrl);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, value.toString());
      }
    });

    const result = url.toString();
    console.error(`[DEBUG] Final URL: ${result}`);

    // If we started with a relative URL, return just the path portion
    if (!baseUrl.startsWith('http')) {
      // Extract the path and query string from the full URL
      const urlObj = new URL(result);
      return urlObj.pathname + urlObj.search;
    }

    return result;
  } catch (error) {
    console.error(`[ERROR] Failed to build URL: ${error}`);

    // Fallback: manually append query parameters
    let urlWithParams = baseUrl;
    const queryParts: string[] = [];

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value.toString())}`);
      }
    });

    if (queryParts.length > 0) {
      urlWithParams += (urlWithParams.includes('?') ? '&' : '?') + queryParts.join('&');
    }

    console.error(`[DEBUG] Fallback URL: ${urlWithParams}`);
    return urlWithParams;
  }
}

const USER_AGENT = `modelcontextprotocol/servers/alibabacloud-devops-mcp-server/v${VERSION} ${getUserAgent()}`;

export async function yunxiaoRequest(
  urlPath: string,
  options: RequestOptions = {},
): Promise<unknown> {
  // Check if the URL is already a full URL or a path
  let url = urlPath.startsWith("http") ? urlPath : `${getYunxiaoApiBaseUrl()}${urlPath.startsWith("/") ? urlPath : `/${urlPath}`}`;
  const requestHeaders: Record<string, string> = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "User-Agent": USER_AGENT,
    ...options.headers,
  };

  if (process.env.YUNXIAO_ACCESS_TOKEN) {
    requestHeaders["x-yunxiao-token"] = process.env.YUNXIAO_ACCESS_TOKEN;
  }

  debug(`Request: ${options.method} ${url}`);
  debug(`Headers:`, requestHeaders);

  const response = await fetch(url, {
    method : options.method || "GET",
    headers: requestHeaders,
    body: options.body ? JSON.stringify(options.body) : undefined,
  } as RequestInit);

  const responseBody = await parseResponseBody(response);
  debug(`Response Body:`, responseBody)

  if (!response.ok) {
    throw createYunxiaoError(response.status, responseBody);
  }

  return responseBody;
}

export function pathEscape(filePath: string): string {
  // 先使用encodeURIComponent进行编码
  let encoded = encodeURIComponent(filePath);

  // 将编码后的%2F（/的编码）替换回/
  encoded = encoded.replace(/%2F/gi, "/");

  return encoded;
}
