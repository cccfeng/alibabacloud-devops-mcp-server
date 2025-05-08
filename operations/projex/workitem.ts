import { z } from "zod";
import { yunxiaoRequest } from "../../common/utils.js";
import { WorkItemSchema, FilterConditionSchema, ConditionsSchema } from "../../common/types.js";

// Schema definitions
export const GetWorkItemSchema = z.object({
  organizationId: z.string().describe("Organization ID, can be found in the basic information page of the organization admin console"),
  workItemId: z.string().describe("Work item unique identifier, required parameter"),
});

export const SearchWorkitemsSchema = z.object({
  organizationId: z.string().describe("Organization ID"),
  category: z.string().describe("Search for work item types, such as Req (requirement), Task (task), Bug (defect), etc., multiple values separated by commas"),
  spaceId: z.string().describe("Project ID, project unique identifier"),
  
  // Simplified search parameters
  subject: z.string().nullable().optional().describe("Text contained in the title"),
  status: z.string().nullable().optional().describe("Status ID, multiple separated by commas. Status names and their IDs: Pending Confirmation (28), Pending Processing (100005), Reopened (30), Deferred Fix (34), Confirmed (32), Selected (625489), In Analysis (154395), Analysis Complete (165115), In Progress (100010), In Design (156603), Design Complete (307012), In Development (142838), Development Complete (100011), In Testing (100012)"),
  createdAfter: z.string().nullable().optional().describe("Created not earlier than, format: YYYY-MM-DD"),
  createdBefore: z.string().nullable().optional().describe("Created not later than, format: YYYY-MM-DD"),
  creator: z.string().nullable().optional().describe("Creator ID, multiple separated by commas"),
  assignedTo: z.string().nullable().optional().describe("Assignee ID, multiple separated by commas"),
  
  // Advanced parameters
  advancedConditions: z.string().nullable().optional().describe("Advanced filter conditions, JSON format"),
  orderBy: z.string().optional().default("gmtCreate").describe("Sort field, default is gmtCreate. Possible values: gmtCreate, subject, status, priority, assignedTo"),
});

// Type exports
export type GetWorkItemOptions = z.infer<typeof GetWorkItemSchema>;
export type SearchWorkitemsOptions = z.infer<typeof SearchWorkitemsSchema>;

// Function implementations
export async function getWorkItemFunc(
  organizationId: string,
  workItemId: string
): Promise<z.infer<typeof WorkItemSchema>> {
  const url = `/oapi/v1/projex/organizations/${organizationId}/workitems/${workItemId}`;

  const response = await yunxiaoRequest(url, {
    method: "GET",
  });

  return WorkItemSchema.parse(response);
}

export async function searchWorkitemsFunc(
  organizationId: string,
  category: string,
  spaceId: string,
  subject?: string,
  status?: string,
  createdAfter?: string,
  createdBefore?: string,
  creator?: string,
  assignedTo?: string,
  advancedConditions?: string,
  orderBy: string = "gmtCreate" // Possible values: gmtCreate, subject, status, priority, assignedTo
): Promise<z.infer<typeof WorkItemSchema>[]> {
  const url = `/oapi/v1/projex/organizations/${organizationId}/workitems:search`;

  // Prepare payload
  const payload: Record<string, any> = {
    category: category,
    spaceId: spaceId,
  };

  // Process condition parameters
  const conditions = buildWorkitemConditions({
    subject,
    status,
    createdAfter,
    createdBefore,
    creator,
    assignedTo,
    advancedConditions
  });
  
  if (conditions) {
    payload.conditions = conditions;
  }

  // Add orderBy parameter
  payload.orderBy = orderBy;

  const response = await yunxiaoRequest(url, {
    method: "POST",
    body: payload,
  });

  // Ensure response is an array
  if (!Array.isArray(response)) {
    return [];
  }

  // Parse each work item object
  return response.map(workitem => WorkItemSchema.parse(workitem));
}

// Build work item search conditions
function buildWorkitemConditions(args: {
  subject?: string;
  status?: string;
  createdAfter?: string;
  createdBefore?: string;
  creator?: string;
  assignedTo?: string;
  advancedConditions?: string;
}): string | undefined {
  // If advanced conditions are provided directly, use them preferentially
  if (args.advancedConditions) {
    return args.advancedConditions;
  }

  // Build condition group
  const filterConditions: z.infer<typeof FilterConditionSchema>[] = [];

  // Process title
  if (args.subject) {
    filterConditions.push({
      className: "string",
      fieldIdentifier: "subject",
      format: "input",
      operator: "CONTAINS",
      toValue: null,
      value: [args.subject],
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

  // Process assignee
  if (args.assignedTo) {
    const assignedToValues = args.assignedTo.split(",");
    const values = assignedToValues.map(v => v.trim());

    filterConditions.push({
      className: "user",
      fieldIdentifier: "assignedTo",
      format: "list",
      operator: "CONTAINS",
      toValue: null,
      value: values,
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