import { z } from "zod";
import { yunxiaoRequest, buildUrl } from "../../common/utils.js";
import { ChangeRequestCommentSchema } from "../../common/types.js";
import { handleRepositoryIdEncoding } from "./utils.js";

// Schema definitions
export const CreateChangeRequestCommentSchema = z.object({
  organizationId: z.string().describe("Organization ID, can be found in the basic information page of the organization admin console"),
  repositoryId: z.string().describe("Repository ID or a combination of organization ID and repository name, for example: 2835387 or organizationId%2Frepo-name (Note: slashes need to be URL encoded as %2F)"),
  localId: z.string().describe("Local ID, represents the nth merge request in the repository"),
  comment_type: z.string().default("GLOBAL_COMMENT").describe("Comment type. Possible values: GLOBAL_COMMENT, INLINE_COMMENT"),
  content: z.string().describe("Comment content, length must be between 1 and 65535"),
  draft: z.boolean().default(false).describe("Whether it is a draft comment"),
  resolved: z.boolean().default(false).describe("Whether to mark as resolved"),
  patchset_biz_id: z.string().describe("Associated version ID, if it's INLINE_COMMENT, choose one from from_patchset_biz_id or to_patchset_biz_id"),
  file_path: z.string().nullable().optional().describe("File name, only for inline comments"),
  line_number: z.number().int().nullable().optional().describe("Line number, only for inline comments"),
  from_patchset_biz_id: z.string().nullable().optional().describe("Start version ID for comparison, required for INLINE_COMMENT type"),
  to_patchset_biz_id: z.string().nullable().optional().describe("Target version ID for comparison, required for INLINE_COMMENT type"),
  parent_comment_biz_id: z.string().nullable().optional().describe("Parent comment ID"),
});

export const ListChangeRequestCommentsSchema = z.object({
  organizationId: z.string().describe("Organization ID, can be found in the basic information page of the organization admin console"),
  repositoryId: z.string().describe("Repository ID or a combination of organization ID and repository name, for example: 2835387 or organizationId%2Frepo-name (Note: slashes need to be URL encoded as %2F)"),
  localId: z.string().describe("Local ID, represents the nth merge request in the repository"),
  patchSetBizIds: z.array(z.string()).nullable().optional().describe("Associated version ID list, each comment is associated with a version, indicating which version the comment was posted on, for global comments, it's associated with the latest merge source version"),
  commentType: z.string().optional().default("GLOBAL_COMMENT").describe("Comment type. Possible values: GLOBAL_COMMENT, INLINE_COMMENT"),
  state: z.string().optional().default("OPENED").describe("Comment state. Possible values: OPENED, DRAFT"),
  resolved: z.boolean().optional().default(false).describe("Whether marked as resolved"),
  filePath: z.string().nullable().optional().describe("File name, only for inline comments"),
});

// Type exports
export type CreateChangeRequestCommentOptions = z.infer<typeof CreateChangeRequestCommentSchema>;
export type ListChangeRequestCommentsOptions = z.infer<typeof ListChangeRequestCommentsSchema>;

// Function implementations
export async function createChangeRequestCommentFunc(
  organizationId: string,
  repositoryId: string,
  localId: string,
  comment_type: string, // Possible values: GLOBAL_COMMENT, INLINE_COMMENT
  content: string,
  draft: boolean,
  resolved: boolean,
  patchset_biz_id: string,
  file_path?: string,
  line_number?: number,
  from_patchset_biz_id?: string,
  to_patchset_biz_id?: string,
  parent_comment_biz_id?: string
): Promise<z.infer<typeof ChangeRequestCommentSchema>> {
  const encodedRepoId = handleRepositoryIdEncoding(repositoryId);

  const url = `/oapi/v1/codeup/organizations/${organizationId}/repositories/${encodedRepoId}/changeRequests/${localId}/comments`;

  // 准备payload
  const payload: Record<string, any> = {
    comment_type: comment_type,
    content: content,
    draft: draft,
    resolved: resolved,
    patchset_biz_id: patchset_biz_id,
  };

  // 根据评论类型添加必要参数
  if (comment_type === "INLINE_COMMENT") {
    // 检查INLINE_COMMENT必需的参数
    if (!file_path || line_number === undefined || !from_patchset_biz_id || !to_patchset_biz_id) {
      throw new Error("For INLINE_COMMENT, file_path, line_number, from_patchset_biz_id, and to_patchset_biz_id are required");
    }

    payload.file_path = file_path;
    payload.line_number = line_number;
    payload.from_patchset_biz_id = from_patchset_biz_id;
    payload.to_patchset_biz_id = to_patchset_biz_id;
  }

  // 添加可选参数
  if (parent_comment_biz_id) {
    payload.parent_comment_biz_id = parent_comment_biz_id;
  }

  const response = await yunxiaoRequest(url, {
    method: "POST",
    body: payload,
  });

  return ChangeRequestCommentSchema.parse(response);
}

export async function listChangeRequestCommentsFunc(
  organizationId: string,
  repositoryId: string,
  localId: string,
  patchSetBizIds?: string[],
  commentType: string = "GLOBAL_COMMENT", // Possible values: GLOBAL_COMMENT, INLINE_COMMENT
  state: string = "OPENED", // Possible values: OPENED, DRAFT
  resolved: boolean = false,
  filePath?: string
): Promise<z.infer<typeof ChangeRequestCommentSchema>[]> {
  const encodedRepoId = handleRepositoryIdEncoding(repositoryId);

  const url = `/oapi/v1/codeup/organizations/${organizationId}/repositories/${encodedRepoId}/changeRequests/${localId}/comments/list`;

  // 准备payload
  const payload: Record<string, any> = {
    patchSetBizIds: patchSetBizIds || [],
    commentType: commentType,
    state: state,
    resolved: resolved,
  };

  // 添加可选参数
  if (filePath) {
    payload.filePath = filePath;
  }

  const response = await yunxiaoRequest(url, {
    method: "POST",
    body: payload,
  });

  // 确保响应是数组
  if (!Array.isArray(response)) {
    return [];
  }

  // 解析每个评论对象
  return response.map(comment => ChangeRequestCommentSchema.parse(comment));
} 