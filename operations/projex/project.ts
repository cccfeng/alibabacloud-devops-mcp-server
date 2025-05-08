import { z } from "zod";
import { yunxiaoRequest } from "../../common/utils.js";
import { ProjectInfoSchema, FilterConditionSchema, ConditionsSchema } from "../../common/types.js";

// Schema definitions
export const GetProjectSchema = z.object({
  organizationId: z.string().describe("Organization ID"),
  id: z.string().describe("Project unique identifier"),
});

export const SearchProjectsSchema = z.object({
  organizationId: z.string().describe("Organization ID"),
  
  // Simplified search parameters
  name: z.string().nullable().optional().describe("Text contained in project name"),
  status: z.string().nullish().optional().describe("Project status ID, multiple separated by commas"),
  createdAfter: z.string().nullable().optional().describe("Created not earlier than, format: YYYY-MM-DD"),
  createdBefore: z.string().nullable().optional().describe("Created not later than, format: YYYY-MM-DD"),
  creator: z.string().nullable().optional().describe("Creator"),
  admin: z.string().nullable().optional().describe("Administrator"),
  logicalStatus: z.string().nullable().optional().describe("Logical status, e.g., NORMAL"),
  
  // Advanced parameters
  advancedConditions: z.string().nullable().optional().describe("Advanced filter conditions, JSON format"),
  extraConditions: z.string().nullable().optional().describe("Additional filter conditions, e.g., projects I manage, projects I participate in, projects I favorited, etc."),
  orderBy: z.string().optional().default("gmtCreate").describe("Sort field, default is gmtCreate, supports: gmtCreate (creation time), name (name)"),
  page: z.number().int().default(1).optional().describe("Pagination parameter, page number"),
  perPage: z.number().int().default(20).optional().describe("Pagination parameter, page size, 0-200, default value is 20"),
  sort: z.string().optional().default("desc").describe("Sort order, default is desc, options: desc (descending), asc (ascending)"),
});

// Type exports
export type GetProjectOptions = z.infer<typeof GetProjectSchema>;
export type SearchProjectsOptions = z.infer<typeof SearchProjectsSchema>;

// Function implementations
export async function getProjectFunc(
  organizationId: string,
  id: string
): Promise<z.infer<typeof ProjectInfoSchema>> {
  const url = `/oapi/v1/projex/organizations/${organizationId}/projects/${id}`;

  const response = await yunxiaoRequest(url, {
    method: "GET",
  });

  return ProjectInfoSchema.parse(response);
}

export async function searchProjectsFunc(
  organizationId: string,
  name?: string,
  status?: string,
  createdAfter?: string,
  createdBefore?: string,
  creator?: string,
  admin?: string,
  logicalStatus?: string,
  advancedConditions?: string,
  extraConditions?: string,
  orderBy?: string, // Possible values: "gmtCreate", "name"
  page?: number,
  perPage?: number,
  sort?: string // Possible values: "desc", "asc"
): Promise<z.infer<typeof ProjectInfoSchema>[]> {
  const url = `/oapi/v1/projex/organizations/${organizationId}/projects:search`;

  // Prepare payload
  const payload: Record<string, any> = {};

  // Process condition parameters
  const conditions = buildProjectConditions({
    name,
    status,
    createdAfter,
    createdBefore,
    creator,
    admin,
    logicalStatus,
    advancedConditions
  });
  
  if (conditions) {
    payload.conditions = conditions;
  }

  // Add other optional parameters
  if (extraConditions) {
    payload.extraConditions = extraConditions;
  }

  if (orderBy) {
    payload.orderBy = orderBy;
  }

  if (page !== undefined) {
    payload.page = page;
  }

  if (perPage !== undefined) {
    payload.perPage = perPage;
  }

  if (sort) {
    payload.sort = sort;
  }

  const response = await yunxiaoRequest(url, {
    method: "POST",
    body: payload,
  });

  // Ensure response is an array
  if (!Array.isArray(response)) {
    return [];
  }

  // Parse each project object
  return response.map(project => ProjectInfoSchema.parse(project));
}

// Build project search conditions
function buildProjectConditions(args: {
  name?: string;
  status?: string;
  createdAfter?: string;
  createdBefore?: string;
  creator?: string;
  admin?: string;
  logicalStatus?: string;
  advancedConditions?: string;
}): string | undefined {
  // If advanced conditions are provided directly, use them preferentially
  if (args.advancedConditions) {
    return args.advancedConditions;
  }

  // Build condition group
  const filterConditions: z.infer<typeof FilterConditionSchema>[] = [];

  // Process name
  if (args.name) {
    filterConditions.push({
      className: "string",
      fieldIdentifier: "name",
      format: "input",
      operator: "CONTAINS",
      toValue: null,
      value: [args.name],
    });
  }

  // Process status
  if (args.status) {
    const statusValues = args.status.split(",");
    const values = statusValues.map(v => v.trim());

    filterConditions.push({
      className: "status",
      fieldIdentifier: "status",
      format: "list",
      operator: "CONTAINS",
      toValue: null,
      value: values,
    });
  }

  // Process creation time range
  if (args.createdAfter) {
    const createdBefore = args.createdBefore ? `${args.createdBefore} 23:59:59` : null;

    filterConditions.push({
      className: "date",
      fieldIdentifier: "gmtCreate",
      format: "input",
      operator: "BETWEEN",
      toValue: createdBefore,
      value: [`${args.createdAfter} 00:00:00`],
    });
  }

  // Process creator
  if (args.creator) {
    const creatorValues = args.creator.split(",");
    const values = creatorValues.map(v => v.trim());

    filterConditions.push({
      className: "user",
      fieldIdentifier: "creator",
      format: "list",
      operator: "CONTAINS",
      toValue: null,
      value: values,
    });
  }

  // Process administrator
  if (args.admin) {
    const adminValues = args.admin.split(",");
    const values = adminValues.map(v => v.trim());

    filterConditions.push({
      className: "user",
      fieldIdentifier: "project.admin",
      format: "multiList",
      operator: "CONTAINS",
      toValue: null,
      value: values,
    });
  }

  // Process logical status
  if (args.logicalStatus) {
    filterConditions.push({
      className: "string",
      fieldIdentifier: "logicalStatus",
      format: "list",
      operator: "CONTAINS",
      toValue: null,
      value: [args.logicalStatus],
    });
  }

  // If there are no conditions, return undefined
  if (filterConditions.length === 0) {
    return undefined;
  }

  // Build complete condition object
  const conditions: z.infer<typeof ConditionsSchema> = {
    conditionGroups: [filterConditions],
  };

  // Serialize to JSON
  return JSON.stringify(conditions);
} 