import { z } from "zod";
import {CodeupBranchSchema} from "../../common/types.js";
import {buildUrl, yunxiaoRequest} from "../../common/utils.js";

// Schema definitions
export const CreateBranchSchema = z.object({
  organizationId: z.string().describe("Organization ID, can be found in the basic information page of the organization admin console"),
  repositoryId: z.string().describe("Repository ID or a combination of organization ID and repository name, for example: 2835387 or organizationId%2Frepo-name (Note: slashes need to be URL encoded as %2F)"),
  branch: z.string().describe("Name of the branch to be created"),
  ref: z.string().default("master").describe("Source branch name, the new branch will be created based on this branch, default value is master"),
});

export const GetBranchSchema = z.object({
  organizationId: z.string().describe("Organization ID, can be found in the basic information page of the organization admin console"),
  repositoryId: z.string().describe("Repository ID or a combination of organization ID and repository name, for example: 2835387 or organizationId%2Frepo-name (Note: slashes need to be URL encoded as %2F)"),
  branchName: z.string().describe("Branch name (if it contains special characters, use URL encoding), example: master or feature%2Fdev"),
});

export const DeleteBranchSchema = z.object({
  organizationId: z.string().describe("Organization ID, can be found in the basic information page of the organization admin console"),
  repositoryId: z.string().describe("Repository ID or a combination of organization ID and repository name, for example: 2835387 or organizationId%2Frepo-name (Note: slashes need to be URL encoded as %2F)"),
  branchName: z.string().describe("Branch name (use URL-Encoder for encoding, example: feature%2Fdev)"),
});

export const ListBranchesSchema = z.object({
  organizationId: z.string().describe("Organization ID, can be found in the basic information page of the organization admin console"),
  repositoryId: z.string().describe("Repository ID or a combination of organization ID and repository name, for example: 2835387 or organizationId%2Frepo-name (Note: slashes need to be URL encoded as %2F)"),
  page: z.number().int().default(1).optional().describe("Page number"),
  perPage: z.number().int().default(20).optional().describe("Items per page"),
  sort: z.enum(["name_asc", "name_desc", "updated_asc", "updated_desc"]).default("name_asc").optional().describe("Sort order: name_asc - name ascending, name_desc - name descending, updated_asc - update time ascending, updated_desc - update time descending"),
  search: z.string().nullable().optional().describe("Search query"),
});

// Type exports
export type CreateBranchOptions = z.infer<typeof CreateBranchSchema>;
export type GetBranchOptions = z.infer<typeof GetBranchSchema>;
export type DeleteBranchOptions = z.infer<typeof DeleteBranchSchema>;
export type ListBranchesOptions = z.infer<typeof ListBranchesSchema>;

// Response type for delete branch operation
interface DeleteBranchResponse {
  branchName: string;
}

// Function implementations
export async function createBranchFunc(
    organizationId: string,
    repositoryId: string,
    branch: string,
    ref: string = "master"
): Promise<z.infer<typeof CodeupBranchSchema>>{
  // Automatically handle unencoded slashes in repositoryId
  if (repositoryId.includes("/")) {
    // Found unencoded slash, automatically URL encode it
    const parts = repositoryId.split("/", 2);
    if (parts.length === 2) {
      const encodedRepoName = encodeURIComponent(parts[1]);
      // Remove + signs from encoding (spaces are encoded as +, but we need %20)
      const formattedEncodedName = encodedRepoName.replace(/\+/g, "%20");
      repositoryId = `${parts[0]}%2F${formattedEncodedName}`;
    }
  }

  const baseUrl = `/oapi/v1/codeup/organizations/${organizationId}/repositories/${repositoryId}/branches`;

  // Build query parameters
  const queryParams: Record<string, string | number | undefined> = {
    branch: branch,
    ref: ref
  };

  const url = buildUrl(baseUrl, queryParams);
  console.error("createBranchFunc url:" + url);

  const response = await yunxiaoRequest(url, {
    method: "POST",
  });
  return CodeupBranchSchema.parse(response);
}

export async function getBranchFunc(
    organizationId: string,
    repositoryId: string,
    branchName: string
): Promise<z.infer<typeof CodeupBranchSchema>>{
  // Automatically handle unencoded slashes in repositoryId
  if (repositoryId.includes("/")) {
    // Found unencoded slash, automatically URL encode it
    const parts = repositoryId.split("/", 2);
    if (parts.length === 2) {
      const encodedRepoName = encodeURIComponent(parts[1]);
      // Remove + signs from encoding (spaces are encoded as +, but we need %20)
      const formattedEncodedName = encodedRepoName.replace(/\+/g, "%20");
      repositoryId = `${parts[0]}%2F${formattedEncodedName}`;
    }
  }

  // Automatically handle unencoded slashes in branchName
  if (branchName.includes("/")) {
    branchName = encodeURIComponent(branchName);
  }

  const url = `/oapi/v1/codeup/organizations/${organizationId}/repositories/${repositoryId}/branches/${branchName}`;

  const response = await yunxiaoRequest(url, {
    method: "GET",
  });
  return CodeupBranchSchema.parse(response);
}

export async function deleteBranchFunc(
    organizationId: string,
    repositoryId: string,
    branchName: string
): Promise<DeleteBranchResponse> {
  // Automatically handle unencoded slashes in repositoryId
  if (repositoryId.includes("/")) {
    // Found unencoded slash, automatically URL encode it
    const parts = repositoryId.split("/", 2);
    if (parts.length === 2) {
      const encodedRepoName = encodeURIComponent(parts[1]);
      // Remove + signs from encoding (spaces are encoded as +, but we need %20)
      const formattedEncodedName = encodedRepoName.replace(/\+/g, "%20");
      repositoryId = `${parts[0]}%2F${formattedEncodedName}`;
    }
  }

  // Automatically handle unencoded slashes in branchName
  if (branchName.includes("/")) {
    branchName = encodeURIComponent(branchName);
  }

  const url = `/oapi/v1/codeup/organizations/${organizationId}/repositories/${repositoryId}/branches/${branchName}`;

  const response = await yunxiaoRequest(url, {
    method: "DELETE",
  });

  return {
    branchName: branchName
  };
}

export async function listBranchesFunc(
    organizationId: string,
    repositoryId: string,
    page?: number,
    perPage?: number,
    sort?: string, // Possible values: name_asc, name_desc, updated_asc, updated_desc
    search?: string
): Promise<z.infer<typeof CodeupBranchSchema>[]> {
  console.error("listBranchesFunc page:" + page + " perPage:" + perPage + " sort:" + sort + " search:" + search);
  // Automatically handle unencoded slashes in repositoryId
  if (repositoryId.includes("/")) {
    // Found unencoded slash, automatically URL encode it
    const parts = repositoryId.split("/", 2);
    if (parts.length === 2) {
      const encodedRepoName = encodeURIComponent(parts[1]);
      // Remove + signs from encoding (spaces are encoded as +, but we need %20)
      const formattedEncodedName = encodedRepoName.replace(/\+/g, "%20");
      repositoryId = `${parts[0]}%2F${formattedEncodedName}`;
    }
  }

  const baseUrl = `/oapi/v1/codeup/organizations/${organizationId}/repositories/${repositoryId}/branches`;

  // Build query parameters - use lowercase parameter names as expected by the API
  const queryParams: Record<string, string | number | undefined> = {};
  if (page !== undefined && page !== null) {
    queryParams.page = page;
  }
  if (perPage !== undefined && perPage !== null) {
    queryParams.perPage = perPage;
  }
  if (sort !== undefined && sort !== null) {
    queryParams.sort = sort;
  }
  if (search !== undefined && search !== null) {
    queryParams.search = search;
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

  // Map each branch object and handle null values
  return response.map(branchData => {
    // Filter out null values that would cause parsing errors
    // This is a defensive approach until we update all schemas properly
    return CodeupBranchSchema.parse(branchData);
  });
}

