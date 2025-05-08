import { z } from "zod";
import { yunxiaoRequest, buildUrl } from "../../common/utils.js";
import { CompareSchema } from "../../common/types.js";

// Schema definitions
export const GetCompareSchema = z.object({
  organizationId: z.string().describe("Organization ID, can be found in the basic information page of the organization admin console"),
  repositoryId: z.string().describe("Repository ID or a combination of organization ID and repository name, for example: 2835387 or organizationId%2Frepo-name (Note: slashes need to be URL encoded as %2F)"),
  from: z.string().describe("Can be CommitSHA, branch name or tag name"),
  to: z.string().describe("Can be CommitSHA, branch name or tag name"),
  sourceType: z.string().nullable().optional().describe("Options: branch, tag; if it's a commit comparison, you can omit this; if it's a branch comparison, you need to provide: branch, or you can omit it but ensure there are no branch or tag name conflicts; if it's a tag comparison, you need to provide: tag; if there are branches and tags with the same name, you need to strictly provide branch or tag"),
  targetType: z.string().nullable().optional().describe("Options: branch, tag; if it's a commit comparison, you can omit this; if it's a branch comparison, you need to provide: branch, or you can omit it but ensure there are no branch or tag name conflicts; if it's a tag comparison, you need to provide: tag; if there are branches and tags with the same name, you need to strictly provide branch or tag"),
  straight: z.string().default("false").nullable().optional().describe("Whether to use Merge-Base: straight=false means using Merge-Base; straight=true means not using Merge-Base; default is false, meaning using Merge-Base"),
});

// Type exports
export type GetCompareOptions = z.infer<typeof GetCompareSchema>;

// Helper function to handle repositoryId encoding
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
export async function getCompareFunc(
  organizationId: string,
  repositoryId: string,
  from: string,
  to: string,
  sourceType?: string, // Possible values: branch, tag
  targetType?: string, // Possible values: branch, tag
  straight?: string
): Promise<z.infer<typeof CompareSchema>> {
  const encodedRepoId = handleRepositoryIdEncoding(repositoryId);

  const baseUrl = `/oapi/v1/codeup/organizations/${organizationId}/repositories/${encodedRepoId}/compares`;
  
  // Build query parameters
  const queryParams: Record<string, string | undefined> = {
    from,
    to
  };
  
  if (sourceType !== undefined) {
    queryParams.sourceType = sourceType;
  }
  
  if (targetType !== undefined) {
    queryParams.targetType = targetType;
  }
  
  if (straight !== undefined) {
    queryParams.straight = straight;
  }

  // Use buildUrl function to construct URL with query parameters
  const url = buildUrl(baseUrl, queryParams);

  const response = await yunxiaoRequest(url, {
    method: "GET",
  });

  return CompareSchema.parse(response);
} 