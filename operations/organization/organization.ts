import { z } from "zod";
import { yunxiaoRequest } from "../../common/utils.js";
import { CurrentOrganizationInfoSchema, UserOrganizationsInfoSchema } from "../../common/types.js";

// Function implementations
export async function getCurrentOrganizationInfoFunc(
): Promise<z.infer<typeof CurrentOrganizationInfoSchema>> {
  const url = "/oapi/v1/platform/user";

  const response = await yunxiaoRequest(url, {
    method: "GET",
  });

  return CurrentOrganizationInfoSchema.parse(response);
}

export async function getUserOrganizationsFunc(
): Promise<z.infer<typeof UserOrganizationsInfoSchema>> {
  const url = "/oapi/v1/platform/organizations";

  const response = await yunxiaoRequest(url, {
    method: "GET",
  });

  // Ensure response is an array
  if (!Array.isArray(response)) {
    return [];
  }

  return UserOrganizationsInfoSchema.parse(response);
} 