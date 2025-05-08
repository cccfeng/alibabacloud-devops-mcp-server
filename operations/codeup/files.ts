import { z } from "zod";
import {yunxiaoRequest, buildUrl, pathEscape} from "../../common/utils.js";
import { 
  FileContentSchema, 
  CreateFileResponseSchema, 
  DeleteFileResponseSchema,
  FileInfoSchema
} from "../../common/types.js";

// Schema definitions
export const GetFileBlobsSchema = z.object({
  organizationId: z.string().describe("Organization ID, can be found in the basic information page of the organization admin console"),
  repositoryId: z.string().describe("Repository ID or a combination of organization ID and repository name, for example: 2835387 or organizationId%2Frepo-name (Note: slashes need to be URL encoded as %2F)"),
  filePath: z.string().describe("File path, needs to be URL encoded, for example: /src/main/java/com/aliyun/test.java"),
  ref: z.string().describe("Reference name, usually branch name, can be branch name, tag name or commit SHA. If not provided, the default branch of the repository will be used, such as master"),
});

export const CreateFileSchema = z.object({
  organizationId: z.string().describe("Organization ID, can be found in the basic information page of the organization admin console"),
  repositoryId: z.string().describe("Repository ID or a combination of organization ID and repository name, for example: 2835387 or organizationId%2Frepo-name (Note: slashes need to be URL encoded as %2F)"),
  filePath: z.string().describe("File path, needs to be URL encoded, for example: /src/main/java/com/aliyun/test.java"),
  content: z.string().describe("File content"),
  commitMessage: z.string().describe("Commit message, not empty, no more than 102400 characters"),
  branch: z.string().describe("Branch name"),
  encoding: z.string().optional().describe("Encoding rule, options {text, base64}, default is text"),
});

export const UpdateFileSchema = z.object({
  organizationId: z.string().describe("Organization ID, can be found in the basic information page of the organization admin console"),
  repositoryId: z.string().describe("Repository ID or a combination of organization ID and repository name, for example: 2835387 or organizationId%2Frepo-name (Note: slashes need to be URL encoded as %2F)"),
  filePath: z.string().describe("File path, needs to be URL encoded, for example: /src/main/java/com/aliyun/test.java"),
  content: z.string().describe("File content"),
  commitMessage: z.string().describe("Commit message, not empty, no more than 102400 characters"),
  branch: z.string().describe("Branch name"),
  encoding: z.string().default("text").optional().describe("Encoding rule, options {text, base64}, default is text"),
});

export const DeleteFileSchema = z.object({
  organizationId: z.string().describe("Organization ID, can be found in the basic information page of the organization admin console"),
  repositoryId: z.string().describe("Repository ID or a combination of organization ID and repository name, for example: 2835387 or organizationId%2Frepo-name (Note: slashes need to be URL encoded as %2F)"),
  filePath: z.string().describe("File path, needs to be URL encoded, for example: /src/main/java/com/aliyun/test.java"),
  commitMessage: z.string().describe("Commit message"),
  branch: z.string().describe("Branch name"),
});

export const ListFilesSchema = z.object({
  organizationId: z.string().describe("Organization ID, can be found in the basic information page of the organization admin console"),
  repositoryId: z.string().describe("Repository ID or a combination of organization ID and repository name, for example: 2835387 or organizationId%2Frepo-name (Note: slashes need to be URL encoded as %2F)"),
  path: z.string().optional().describe("Specific path to query, for example to query files in the src/main directory"),
  ref: z.string().optional().describe("Reference name, usually branch name, can be branch name, tag name or commit SHA. If not provided, the default branch of the repository will be used, such as master"),
  type: z.string().default("RECURSIVE").optional().describe("File tree retrieval method: DIRECT - only get the current directory, default method; RECURSIVE - recursively find all files under the current path; FLATTEN - flat display (if it is a directory, recursively find until the subdirectory contains files or multiple directories)"),
});

// Type exports
export type GetFileBlobsOptions = z.infer<typeof GetFileBlobsSchema>;
export type CreateFileOptions = z.infer<typeof CreateFileSchema>;
export type UpdateFileOptions = z.infer<typeof UpdateFileSchema>;
export type DeleteFileOptions = z.infer<typeof DeleteFileSchema>;
export type ListFilesOptions = z.infer<typeof ListFilesSchema>;

// Common helper function to handle repositoryId and filePath encoding
function handlePathEncoding(repositoryId: string, filePath: string): { encodedRepoId: string; encodedFilePath: string } {
  let encodedRepoId = repositoryId;
  let encodedFilePath = filePath;
  
  // 自动处理repositoryId中未编码的斜杠
  if (repositoryId.includes("/")) {
    // 发现未编码的斜杠，自动进行URL编码
    const parts = repositoryId.split("/", 2);
    if (parts.length === 2) {
      const encodedRepoName = encodeURIComponent(parts[1]);
      // 移除编码中的+号（空格被编码为+，但我们需要%20）
      const formattedEncodedName = encodedRepoName.replace(/\+/g, "%20");
      encodedRepoId = `${parts[0]}%2F${formattedEncodedName}`;
    }
  }

  // 确保filePath已被URL编码
  if (filePath.includes("/")) {
    const startsWithSlash = filePath.startsWith("/");
    if (startsWithSlash) {
      encodedFilePath = encodedFilePath.substring(1);
    }
    encodedFilePath = encodeURIComponent(filePath);
  }

  return { encodedRepoId, encodedFilePath };
}

// Function implementations
export async function getFileBlobsFunc(
  organizationId: string,
  repositoryId: string,
  filePath: string,
  ref: string
): Promise<z.infer<typeof FileContentSchema>> {
  // const { encodedRepoId, encodedFilePath } = handlePathEncoding(repositoryId, filePath);
  let encodedRepoId = repositoryId;
  let encodedFilePath = filePath;
  // 自动处理repositoryId中未编码的斜杠
  if (repositoryId.includes("/")) {
    // 发现未编码的斜杠，自动进行URL编码
    const parts = repositoryId.split("/", 2);
    if (parts.length === 2) {
      const encodedRepoName = encodeURIComponent(parts[1]);
      // 移除编码中的+号（空格被编码为+，但我们需要%20）
      const formattedEncodedName = encodedRepoName.replace(/\+/g, "%20");
      encodedRepoId = `${parts[0]}%2F${formattedEncodedName}`;
    }
  }

  // 确保filePath已被URL编码
  if (filePath.includes("/")) {
    encodedFilePath = encodeURIComponent(filePath);
  }

  const baseUrl = `/oapi/v1/codeup/organizations/${organizationId}/repositories/${encodedRepoId}/files/${encodedFilePath}`;
  
  // 构建查询参数
  const queryParams: Record<string, string | number | undefined> = {
    ref: ref
  };

  // 使用buildUrl函数构建包含查询参数的URL
  const url = buildUrl(baseUrl, queryParams);

  const response = await yunxiaoRequest(url, {
    method: "GET",
  });

  return FileContentSchema.parse(response);
}

export async function createFileFunc(
  organizationId: string,
  repositoryId: string,
  filePath: string,
  content: string,
  commitMessage: string,
  branch: string,
  encoding?: string
): Promise<z.infer<typeof CreateFileResponseSchema>> {
  let encodedRepoId = repositoryId;
  let encodedFilePath = filePath;

  if (repositoryId.includes("/")) {
    // 发现未编码的斜杠，自动进行URL编码
    const parts = repositoryId.split("/", 2);
    if (parts.length === 2) {
      const encodedRepoName = encodeURIComponent(parts[1]);
      // 移除编码中的+号（空格被编码为+，但我们需要%20）
      const formattedEncodedName = encodedRepoName.replace(/\+/g, "%20");
      encodedRepoId = `${parts[0]}%2F${formattedEncodedName}`;
    }
  }

  // 确保filePath已被URL编码
  if (filePath.includes("/")) {
    encodedFilePath = pathEscape(filePath);
  }

  const url = `/oapi/v1/codeup/organizations/${organizationId}/repositories/${encodedRepoId}/files`;

  const body = {
    branch: branch,
    filePath: encodedFilePath,
    content: content,
    commitMessage: commitMessage,
    encoding: encoding || "text"  // 默认使用text编码
  };

  const response = await yunxiaoRequest(url, {
    method: "POST",
    body: body
  });

  return CreateFileResponseSchema.parse(response);
}

export async function updateFileFunc(
  organizationId: string,
  repositoryId: string,
  filePath: string,
  content: string,
  commitMessage: string,
  branch: string,
  encoding?: string
): Promise<z.infer<typeof CreateFileResponseSchema>> {
  //const { encodedRepoId, encodedFilePath } = handlePathEncoding(repositoryId, filePath);
  let encodedRepoId = repositoryId;
  let encodedFilePath = filePath;

  // 自动处理repositoryId中未编码的斜杠
  if (repositoryId.includes("/")) {
    // 发现未编码的斜杠，自动进行URL编码
    const parts = repositoryId.split("/", 2);
    if (parts.length === 2) {
      const encodedRepoName = encodeURIComponent(parts[1]);
      // 移除编码中的+号（空格被编码为+，但我们需要%20）
      const formattedEncodedName = encodedRepoName.replace(/\+/g, "%20");
      encodedRepoId = `${parts[0]}%2F${formattedEncodedName}`;
    }
  }

  // 确保filePath已被URL编码
  if (filePath.includes("/")) {
    const pathToEncode = filePath.startsWith("/") ? filePath.substring(1) : filePath;
    encodedFilePath = encodeURIComponent(pathToEncode);
  }

  const url = `/oapi/v1/codeup/organizations/${organizationId}/repositories/${encodedRepoId}/files/${encodedFilePath}`;

  const body = {
    branch: branch,
    commitMessage: commitMessage,
    content: content,
    encoding: encoding || "text"  // 默认使用text编码
  };

  const response = await yunxiaoRequest(url, {
    method: "PUT",
    body: body
  });

  return CreateFileResponseSchema.parse(response);
}

export async function deleteFileFunc(
  organizationId: string,
  repositoryId: string,
  filePath: string,
  commitMessage: string,
  branch: string
): Promise<z.infer<typeof DeleteFileResponseSchema>> {
  let encodedRepoId = repositoryId;
  let encodedFilePath = filePath;

  if (repositoryId.includes("/")) {
    // 发现未编码的斜杠，自动进行URL编码
    const parts = repositoryId.split("/", 2);
    if (parts.length === 2) {
      const encodedRepoName = encodeURIComponent(parts[1]);
      // 移除编码中的+号（空格被编码为+，但我们需要%20）
      const formattedEncodedName = encodedRepoName.replace(/\+/g, "%20");
      encodedRepoId = `${parts[0]}%2F${formattedEncodedName}`;
    }
  }

  // 确保filePath已被URL编码
  if (filePath.includes("/")) {
    encodedFilePath = encodeURIComponent(filePath);
  }

  const baseUrl = `/oapi/v1/codeup/organizations/${organizationId}/repositories/${encodedRepoId}/files/${encodedFilePath}`;
  
  // 构建查询参数
  const queryParams: Record<string, string | number | undefined> = {
    branch: branch,
    commitMessage: commitMessage
  };

  // 使用buildUrl函数构建包含查询参数的URL
  const url = buildUrl(baseUrl, queryParams);

  const response = await yunxiaoRequest(url, {
    method: "DELETE",
  });

  return DeleteFileResponseSchema.parse(response);
}

export async function listFilesFunc(
  organizationId: string,
  repositoryId: string,
  path?: string,
  ref?: string,
  type?: string // Possible values: DIRECT, RECURSIVE, FLATTEN
): Promise<z.infer<typeof FileInfoSchema>[]> {
  // 自动处理repositoryId中未编码的斜杠
  let encodedRepoId = repositoryId;
  if (repositoryId.includes("/")) {
    // 发现未编码的斜杠，自动进行URL编码
    const parts = repositoryId.split("/", 2);
    if (parts.length === 2) {
      const encodedRepoName = encodeURIComponent(parts[1]);
      // 移除编码中的+号（空格被编码为+，但我们需要%20）
      const formattedEncodedName = encodedRepoName.replace(/\+/g, "%20");
      encodedRepoId = `${parts[0]}%2F${formattedEncodedName}`;
    }
  }

  const baseUrl = `/oapi/v1/codeup/organizations/${organizationId}/repositories/${encodedRepoId}/files/tree`;
  
  // 构建查询参数
  const queryParams: Record<string, string | number | undefined> = {};
  
  if (path) {
    queryParams.path = path;
  }
  
  if (ref) {
    queryParams.ref = ref;
  }
  
  if (type) {
    queryParams.type = type;
  }

  // 使用buildUrl函数构建包含查询参数的URL
  const url = buildUrl(baseUrl, queryParams);

  const response = await yunxiaoRequest(url, {
    method: "GET",
  });

  // 确保响应是数组
  if (!Array.isArray(response)) {
    return [];
  }

  // 解析每个文件信息对象
  return response.map(fileInfo => FileInfoSchema.parse(fileInfo));
} 