import { message } from "ant-design-vue";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useUserStore } from "@/store/module/user";

const userStore = useUserStore();
interface FetchOptions extends RequestInit {
  timeout?: number; // 超时时间（毫秒）
  onUploadProgress?: (progress: {
    lengthComputable: boolean;
    loaded: number;
    total: number;
  }) => void;
  onDownloadProgress?: (progress: {
    lengthComputable: boolean;
    loaded: number;
    total: number;
  }) => void;
  responseType?: "json" | "text" | "blob" | "arrayBuffer" | "formData"; // 返回体类型
}

export async function fetchRequest(
  url: string,
  options: FetchOptions = {}
): Promise<any> {
  const {
    method = "GET",
    headers = {},
    body,
    timeout = 5000, // 默认超时时间为5秒
    onUploadProgress,
    onDownloadProgress,
    responseType = "json", // 默认返回体类型为json
    ...rest
  } = options;

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: userStore.token ? `Bearer ${userStore.token}` : "", // 自动添加token
    ...headers
  };

  NProgress.start();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const fetchPromise = fetch(url, {
      method,
      headers: defaultHeaders,
      body,
      signal: controller.signal,
      ...rest
    });

    // 处理上传进度
    if (onUploadProgress && body instanceof FormData) {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url);
      Object.keys(defaultHeaders).forEach((key) => {
        xhr.setRequestHeader(key, (defaultHeaders as any)[key]);
      });
      xhr.upload.onprogress = onUploadProgress;
      xhr.send(body);
      return new Promise((resolve, reject) => {
        xhr.onload = () => {
          clearTimeout(timeoutId);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(xhr.statusText));
          }
        };
        xhr.onerror = () => reject(new Error("Network Error"));
      });
    }

    const response = await fetchPromise;

    // 处理下载进度
    if (onDownloadProgress && response.body) {
      const reader = response.body.getReader();
      const contentLength = +response.headers.get("Content-Length")!;
      let receivedLength = 0;
      const chunks = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        receivedLength += value.length;
        onDownloadProgress({
          lengthComputable: true,
          loaded: receivedLength,
          total: contentLength
        });
      }
      const responseBody = new TextDecoder("utf-8").decode(
        new Uint8Array(receivedLength)
      );
      return JSON.parse(responseBody);
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      handleErrorResponse(response.status); // 处理HTTP错误码
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await parseResponse(response, responseType);

    // 处理自定义的业务错误码
    if (data.code && data.code !== 0) {
      handleBusinessErrorCode(data.code, data.message); // 处理业务错误码
      throw new Error(`Business error! code: ${data.code}`);
    }

    return data;
  } catch (error) {
    handleRequestError(error as Error); // 处理请求错误
    throw error;
  } finally {
    NProgress.done();
  }
}

// 解析不同的响应类型
async function parseResponse(
  response: Response,
  responseType: FetchOptions["responseType"]
) {
  switch (responseType) {
    case "json":
      return response.json();
    case "text":
      return response.text();
    case "blob":
      return response.blob();
    case "arrayBuffer":
      return response.arrayBuffer();
    case "formData":
      return response.formData();
    default:
      return response.json();
  }
}

// 处理 HTTP 错误码
function handleErrorResponse(status: number) {
  switch (status) {
    case 400:
      message.error("Bad Request (400)");
      break;
    case 401:
      message.error("Unauthorized (401)");
      break;
    case 403:
      message.error("Forbidden (403)");
      break;
    case 404:
      message.error("Not Found (404)");
      break;
    case 500:
      message.error("Internal Server Error (500)");
      break;
    default:
      message.error(`HTTP Error: ${status}`);
  }
}

// 处理业务错误码
function handleBusinessErrorCode(code: number, msg: string) {
  message.error(`Error Code: ${code}, Message: ${msg}`);
}

// 处理请求错误
function handleRequestError(error: Error) {
  if (error.name === "AbortError") {
    message.error("Request timed out");
  } else {
    message.error(`Request failed: ${error.message}`);
  }
}
