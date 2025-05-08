import { z } from "zod";
import { yunxiaoRequest, buildUrl } from "../../common/utils.js";
import { RepositorySchema } from "../../common/types.js";

// Schema definitions
export const GetRepositorySchema = z.object({
  organizationId: z.string().describe("Organization ID, can be found in the basic information page of the organization admin console"),
  repositoryId: z.string().describe("Repository ID or a combination of organization ID and repository name, for example: 2835387 or organizationId%2Frepo-name (Note: slashes need to be URL encoded as %2F)"),
});

export const ListRepositoriesSchema = z.object({
  organizationId: z.string().describe("Organization ID, can be found in the basic information page of the organization admin console"),
  page: z.number().int().default(1).optional().describe("Page number, default starts from 1, generally should not exceed 150 pages"),
  perPage: z.number().int().default(20).optional().describe("Items per page, default 20, value range [1, 100]"),
  orderBy: z.string().default("created_at").optional().describe("Sort field, options include {created_at, name, path, last_activity_at}, default is created_at"),
  sort: z.string().default("desc").optional().describe("Sort order, options include {asc, desc}, default is desc"),
  search: z.string().nullable().optional().describe("Search keyword, used to fuzzy match repository paths"),
  archived: z.boolean().default(false).optional().describe("Whether archived"),
});

// Type exports
export type GetRepositoryOptions = z.infer<typeof GetRepositorySchema>;
export type ListRepositoriesOptions = z.infer<typeof ListRepositoriesSchema>;

// Common helper function to handle repositoryId encoding
function handleRepositoryIdEncoding(repositoryId: string): string {
  let encodedRepoId = repositoryId;
  
  // Automatically handle unencoded slashes in repositoryId
  if (repositoryId.includes("/")) {
    // Found unencoded slash, automatically URL encode it
    const parts = repositoryId.split("/", 2);
    if (parts.length === 2) {
      const encodedRepoName = encodeURIComponent(parts[1]);
      // Remove + signs from encoding (spaces are encoded as +, but we need %20)
      const formattedEncodedName = encodedRepoName.replace(/\+/g, "%20");
      encodedRepoId = `${parts[0]}%2F${formattedEncodedName}`;
    }
  }

  return encodedRepoId;
}

// Function implementations
export async function getRepositoryFunc(
  organizationId: string,
  repositoryId: string
): Promise<z.infer<typeof RepositorySchema>> {
  const encodedRepoId = handleRepositoryIdEncoding(repositoryId);

  const url = `/oapi/v1/codeup/organizations/${organizationId}/repositories/${encodedRepoId}`;

  const response = await yunxiaoRequest(url, {
    method: "GET",
  });

  return RepositorySchema.parse(response);
}

export async function listRepositoriesFunc(
  organizationId: string,
  page?: number,
  perPage?: number,
  orderBy?: string,
  sort?: string,
  search?: string,
  archived?: boolean
): Promise<z.infer<typeof RepositorySchema>[]> {
  const baseUrl = `/oapi/v1/codeup/organizations/${organizationId}/repositories`;
  
  // Build query parameters
  const queryParams: Record<string, string | number | undefined> = {};
  
  if (page !== undefined) {
    queryParams.page = page;
  }
  
  if (perPage !== undefined) {
    queryParams.perPage = perPage;
  }
  
  if (orderBy !== undefined) {
    queryParams.orderBy = orderBy;
  }
  
  if (sort !== undefined) {
    queryParams.sort = sort;
  }
  
  if (search !== undefined) {
    queryParams.search = search;
  }
  
  if (archived !== undefined) {
    queryParams.archived = String(archived); // Convert boolean to string
  }

  // Use buildUrl function to construct URL with query parameters
  const url = buildUrl(baseUrl, queryParams);

  const response = await yunxiaoRequest(url, {
    method: "GET",
  });

  // Ensure the response is an array
  if (!Array.isArray(response)) {
    return [];
  }

  // Parse each repository object
  return response.map(repo => RepositorySchema.parse(repo));
} 