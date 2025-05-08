#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import * as branches from './operations/codeup/branches.js';
import * as files from './operations/codeup/files.js';
import * as repositories from './operations/codeup/repositories.js';
import * as changeRequests from './operations/codeup/changeRequests.js';
import * as changeRequestComments from './operations/codeup/changeRequestComments.js';
import * as organization from './operations/organization/organization.js';
import * as project from './operations/projex/project.js';
import * as sprint from './operations/projex/sprint.js';
import * as workitem from './operations/projex/workitem.js';
import * as compare from './operations/codeup/compare.js'
import {
    isYunxiaoError,
    YunxiaoAuthenticationError, YunxiaoConflictError,
    YunxiaoError, YunxiaoPermissionError, YunxiaoRateLimitError,
    YunxiaoResourceNotFoundError,
    YunxiaoValidationError
} from "./common/errors.js";
import { VERSION } from "./common/version.js";
import {config} from "dotenv";
import {GetCompareSchema} from "./operations/codeup/compare.js";


const server = new Server(
    {
        name: "alibabacloud-devops-mcp-server",
        version: VERSION,
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

function formatYunxiaoError(error: YunxiaoError): string {
    let message = `Yunxiao API Error: ${error.message}`;

    if (error instanceof YunxiaoValidationError) {
        message = `Validation Error: ${error.message}`;
        if (error.response) {
            message += `\nDetails: ${JSON.stringify(error.response)}`;
        }
    } else if (error instanceof YunxiaoResourceNotFoundError) {
        message = `Not Found: ${error.message}`;
    } else if (error instanceof YunxiaoAuthenticationError) {
        message = `Authentication Failed: ${error.message}`;
    } else if (error instanceof YunxiaoPermissionError) {
        message = `Permission Denied: ${error.message}`;
    } else if (error instanceof YunxiaoRateLimitError) {
        message = `Rate Limit Exceeded: ${error.message}\nResets at: ${error.resetAt.toISOString()}`;
    } else if (error instanceof YunxiaoConflictError) {
        message = `Conflict: ${error.message}`;
    }

    return message;
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            // Branch Operations
            {
                name: "create_branch",
                description: "Create a new branch in a Codeup repository",
                inputSchema: zodToJsonSchema(branches.CreateBranchSchema),
            },
            {
                name: "get_branch",
                description: "Get information about a branch in a Codeup repository",
                inputSchema: zodToJsonSchema(branches.GetBranchSchema),
            },
            {
                name: "delete_branch",
                description: "Delete a branch from a Codeup repository",
                inputSchema: zodToJsonSchema(branches.DeleteBranchSchema),
            },
            {
                name: "list_branches",
                description: "List branches in a Codeup repository",
                inputSchema: zodToJsonSchema(branches.ListBranchesSchema),
            },

            // File Operations
            {
                name: "get_file_blobs",
                description: "Get file content from a Codeup repository",
                inputSchema: zodToJsonSchema(files.GetFileBlobsSchema),
            },
            {
                name: "create_file",
                description: "Create a new file in a Codeup repository",
                inputSchema: zodToJsonSchema(files.CreateFileSchema),
            },
            {
                name: "update_file",
                description: "Update an existing file in a Codeup repository",
                inputSchema: zodToJsonSchema(files.UpdateFileSchema),
            },
            {
                name: "delete_file",
                description: "Delete a file from a Codeup repository",
                inputSchema: zodToJsonSchema(files.DeleteFileSchema),
            },
            {
                name: "compare",
                description: "Query code to compare content",
                inputSchema: zodToJsonSchema(compare.GetCompareSchema),
            },

            // Repository Operations
            {
                name: "get_repository",
                description: "Get information about a Codeup repository",
                inputSchema: zodToJsonSchema(repositories.GetRepositorySchema),
            },
            {
                name: "list_repositories",
                description: "List repositories in an organization",
                inputSchema: zodToJsonSchema(repositories.ListRepositoriesSchema),
            },

            // Change Request Operations
            {
                name: "get_change_request",
                description: "Get information about a change request",
                inputSchema: zodToJsonSchema(changeRequests.GetChangeRequestSchema),
            },
            {
                name: "list_change_requests",
                description: "List change requests",
                inputSchema: zodToJsonSchema(changeRequests.ListChangeRequestsSchema),
            },
            {
                name: "create_change_request",
                description: "Create a new change request",
                inputSchema: zodToJsonSchema(changeRequests.CreateChangeRequestSchema),
            },
            {
                name: "create_change_request_comment",
                description: "Create a comment on a change request",
                inputSchema: zodToJsonSchema(changeRequestComments.CreateChangeRequestCommentSchema),
            },
            {
                name: "list_change_request_comments",
                description: "List comments on a change request",
                inputSchema: zodToJsonSchema(changeRequestComments.ListChangeRequestCommentsSchema),
            },
            {
                name: "list_change_request_patch_sets",
                description: "List patch sets for a change request",
                inputSchema: zodToJsonSchema(changeRequests.ListChangeRequestPatchSetsSchema),
            },

            // Organization Operations
            {
                name: "get_current_organization_info",
                description: "Get information about the current user and organization based on the token",
                inputSchema: zodToJsonSchema(z.object({})),
            },
            {
                name: "get_user_organizations",
                description: "Get the list of organizations the current user belongs to",
                inputSchema: zodToJsonSchema(z.object({})),
            },

            // Project Operations
            {
                name: "get_project",
                description: "Get information about a project",
                inputSchema: zodToJsonSchema(project.GetProjectSchema),
            },
            {
                name: "search_projects",
                description: "Search projects with various filter conditions",
                inputSchema: zodToJsonSchema(project.SearchProjectsSchema),
            },

            // Sprint Operations
            // {
            //     name: "get_sprint",
            //     description: "Get information about a sprint",
            //     inputSchema: zodToJsonSchema(sprint.GetSprintSchema),
            // },
            // {
            //     name: "list_sprints",
            //     description: "List sprints in a project",
            //     inputSchema: zodToJsonSchema(sprint.ListSprintsSchema),
            // },

            // Work Item Operations
            {
                name: "get_work_item",
                description: "Get information about a work item",
                inputSchema: zodToJsonSchema(workitem.GetWorkItemSchema),
            },
            {
                name: "search_workitems",
                description: "Search work items with various filter conditions",
                inputSchema: zodToJsonSchema(workitem.SearchWorkitemsSchema),
            }
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        if (!request.params.arguments) {
            throw new Error("Arguments are required");
        }

        switch (request.params.name) {
            // Branch Operations
            case "create_branch": {
                const args = branches.CreateBranchSchema.parse(request.params.arguments);
                const branch = await branches.createBranchFunc(
                    args.organizationId,
                    args.repositoryId,
                    args.branch,
                    args.ref
                );
                return {
                    content: [{ type: "text", text: JSON.stringify(branch, null, 2) }],
                };
            }

            case "get_branch": {
                const args = branches.GetBranchSchema.parse(request.params.arguments);
                const branch = await branches.getBranchFunc(
                    args.organizationId,
                    args.repositoryId,
                    args.branchName
                );
                return {
                    content: [{ type: "text", text: JSON.stringify(branch, null, 2) }],
                };
            }

            case "delete_branch": {
                const args = branches.DeleteBranchSchema.parse(request.params.arguments);
                const result = await branches.deleteBranchFunc(
                    args.organizationId,
                    args.repositoryId,
                    args.branchName
                );
                return {
                    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
                };
            }

            case "list_branches": {
                const args = branches.ListBranchesSchema.parse(request.params.arguments);
                const branchList = await branches.listBranchesFunc(
                    args.organizationId,
                    args.repositoryId,
                    args.page,
                    args.perPage,
                    args.sort,
                    args.search ?? undefined
                );
                return {
                    content: [{ type: "text", text: JSON.stringify(branchList, null, 2) }],
                };
            }

            // File Operations
            case "get_file_blobs": {
                const args = files.GetFileBlobsSchema.parse(request.params.arguments);
                const fileContent = await files.getFileBlobsFunc(
                    args.organizationId,
                    args.repositoryId,
                    args.filePath,
                    args.ref
                );
                return {
                    content: [{ type: "text", text: JSON.stringify(fileContent, null, 2) }],
                };
            }

            case "create_file": {
                const args = files.CreateFileSchema.parse(request.params.arguments);
                const result = await files.createFileFunc(
                    args.organizationId,
                    args.repositoryId,
                    args.filePath,
                    args.content,
                    args.commitMessage,
                    args.branch,
                    args.encoding
                );
                return {
                    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
                };
            }

            case "update_file": {
                const args = files.UpdateFileSchema.parse(request.params.arguments);
                const result = await files.updateFileFunc(
                    args.organizationId,
                    args.repositoryId,
                    args.filePath,
                    args.content,
                    args.commitMessage,
                    args.branch,
                    args.encoding
                );
                return {
                    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
                };
            }

            case "delete_file": {
                const args = files.DeleteFileSchema.parse(request.params.arguments);
                const result = await files.deleteFileFunc(
                    args.organizationId,
                    args.repositoryId,
                    args.filePath,
                    args.commitMessage,
                    args.branch
                );
                return {
                    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
                };
            }

            case "list_files": {
                const args = files.ListFilesSchema.parse(request.params.arguments);
                const fileList = await files.listFilesFunc(
                    args.organizationId,
                    args.repositoryId,
                    args.path,
                    args.ref,
                    args.type
                );
                return {
                    content: [{ type: "text", text: JSON.stringify(fileList, null, 2) }],
                };
            }

            case "compare": {
                const args = compare.GetCompareSchema.parse(request.params.arguments);
                const compareResult = await compare.getCompareFunc(
                    args.organizationId,
                    args.repositoryId,
                    args.from,
                    args.to,
                    args.sourceType ?? undefined,
                    args.targetType ?? undefined,
                    args.straight ?? undefined
                );

                return {
                    content: [{ type: "text", text: JSON.stringify(compareResult, null, 2) }],
                };
            }

            // Repository Operations
            case "get_repository": {
                const args = repositories.GetRepositorySchema.parse(request.params.arguments);
                const repository = await repositories.getRepositoryFunc(
                    args.organizationId,
                    args.repositoryId
                );
                return {
                    content: [{ type: "text", text: JSON.stringify(repository, null, 2) }],
                };
            }

            case "list_repositories": {
                const args = repositories.ListRepositoriesSchema.parse(request.params.arguments);
                const repositoryList = await repositories.listRepositoriesFunc(
                    args.organizationId,
                    args.page,
                    args.perPage,
                    args.orderBy,
                    args.sort,
                    args.search ?? undefined,
                    args.archived
                );
                return {
                    content: [{ type: "text", text: JSON.stringify(repositoryList, null, 2) }],
                };
            }

            // Change Request Operations
            case "get_change_request": {
                const args = changeRequests.GetChangeRequestSchema.parse(request.params.arguments);
                const changeRequest = await changeRequests.getChangeRequestFunc(
                    args.organizationId,
                    args.repositoryId,
                    args.localId
                );
                return {
                    content: [{ type: "text", text: JSON.stringify(changeRequest, null, 2) }],
                };
            }

            case "list_change_requests": {
                const args = changeRequests.ListChangeRequestsSchema.parse(request.params.arguments);
                const changeRequestList = await changeRequests.listChangeRequestsFunc(
                    args.organizationId,
                    args.page,
                    args.perPage,
                    args.projectIds ?? undefined,
                    args.authorIds ?? undefined,
                    args.reviewerIds ?? undefined,
                    args.state ?? undefined,
                    args.search ?? undefined,
                    args.orderBy,
                    args.sort,
                    args.createdBefore ?? undefined,
                    args.createdAfter ?? undefined
                );
                return {
                    content: [{ type: "text", text: JSON.stringify(changeRequestList, null, 2) }],
                };
            }

            case "create_change_request": {
                const args = changeRequests.CreateChangeRequestSchema.parse(request.params.arguments);
                const changeRequest = await changeRequests.createChangeRequestFunc(
                    args.organizationId,
                    args.repositoryId,
                    args.title,
                    args.sourceBranch,
                    args.targetBranch,
                    args.description ?? undefined,
                    args.sourceProjectId,
                    args.targetProjectId,
                    args.reviewerUserIds ?? undefined,
                    args.workItemIds ?? undefined,
                    args.createFrom
                );
                return {
                    content: [{ type: "text", text: JSON.stringify(changeRequest, null, 2) }],
                };
            }

            case "create_change_request_comment": {
                const args = changeRequestComments.CreateChangeRequestCommentSchema.parse(request.params.arguments);
                const comment = await changeRequestComments.createChangeRequestCommentFunc(
                    args.organizationId,
                    args.repositoryId,
                    args.localId,
                    args.comment_type,
                    args.content,
                    args.draft,
                    args.resolved,
                    args.patchset_biz_id,
                    args.file_path ?? undefined,
                    args.line_number ?? undefined,
                    args.from_patchset_biz_id ?? undefined,
                    args.to_patchset_biz_id ?? undefined,
                    args.parent_comment_biz_id ?? undefined
                );
                return {
                    content: [{ type: "text", text: JSON.stringify(comment, null, 2) }],
                };
            }

            case "list_change_request_comments": {
                const args = changeRequestComments.ListChangeRequestCommentsSchema.parse(request.params.arguments);
                const comments = await changeRequestComments.listChangeRequestCommentsFunc(
                    args.organizationId,
                    args.repositoryId,
                    args.localId,
                    args.patchSetBizIds ?? undefined,
                    args.commentType,
                    args.state,
                    args.resolved,
                    args.filePath ?? undefined
                );
                return {
                    content: [{ type: "text", text: JSON.stringify(comments, null, 2) }],
                };
            }

            case "list_change_request_patch_sets": {
                const args = changeRequests.ListChangeRequestPatchSetsSchema.parse(request.params.arguments);
                const patchSets = await changeRequests.listChangeRequestPatchSetsFunc(
                    args.organizationId,
                    args.repositoryId,
                    args.localId
                );

                return {
                    content: [{ type: "text", text: JSON.stringify(patchSets, null, 2) }],
                };
            }

            // Organization Operations
            case "get_current_organization_info": {
                const currentOrgInfo = await organization.getCurrentOrganizationInfoFunc();
                return {
                    content: [{ type: "text", text: JSON.stringify(currentOrgInfo, null, 2) }],
                };
            }

            case "get_user_organizations": {
                const userOrgs = await organization.getUserOrganizationsFunc();
                return {
                    content: [{ type: "text", text: JSON.stringify(userOrgs, null, 2) }],
                };
            }

            // Project Operations
            case "get_project": {
                const args = project.GetProjectSchema.parse(request.params.arguments);
                const projectInfo = await project.getProjectFunc(
                    args.organizationId,
                    args.id
                );
                return {
                    content: [{ type: "text", text: JSON.stringify(projectInfo, null, 2) }],
                };
            }

            case "search_projects": {
                const args = project.SearchProjectsSchema.parse(request.params.arguments);
                const projects = await project.searchProjectsFunc(
                    args.organizationId,
                    args.name ?? undefined,
                    args.status ?? undefined,
                    args.createdAfter ?? undefined,
                    args.createdBefore ?? undefined,
                    args.creator ?? undefined,
                    args.admin ?? undefined,
                    args.logicalStatus ?? undefined,
                    args.advancedConditions ?? undefined,
                    args.extraConditions ?? undefined,
                    args.orderBy,
                    args.page,
                    args.perPage,
                    args.sort
                );
                return {
                    content: [{ type: "text", text: JSON.stringify(projects, null, 2) }],
                };
            }

            // Sprint Operations
            // case "get_sprint": {
            //     const args = sprint.GetSprintSchema.parse(request.params.arguments);
            //     const sprintInfo = await sprint.getSprintFunc(
            //         args.organizationId,
            //         args.projectId,
            //         args.id
            //     );
            //     return {
            //         content: [{ type: "text", text: JSON.stringify(sprintInfo, null, 2) }],
            //     };
            // }

            // case "list_sprints": {
            //     const args = sprint.ListSprintsSchema.parse(request.params.arguments);
            //     const sprints = await sprint.listSprintsFunc(
            //         args.organizationId,
            //         args.id,
            //         args.status,
            //         args.page,
            //         args.perPage
            //     );
            //     return {
            //         content: [{ type: "text", text: JSON.stringify(sprints, null, 2) }],
            //     };
            // }

            // Work Item Operations
            case "get_work_item": {
                const args = workitem.GetWorkItemSchema.parse(request.params.arguments);
                const workItemInfo = await workitem.getWorkItemFunc(
                    args.organizationId,
                    args.workItemId
                );
                return {
                    content: [{ type: "text", text: JSON.stringify(workItemInfo, null, 2) }],
                };
            }

            case "search_workitems": {
                const args = workitem.SearchWorkitemsSchema.parse(request.params.arguments);
                const workItems = await workitem.searchWorkitemsFunc(
                    args.organizationId,
                    args.category,
                    args.spaceId,
                    args.subject ?? undefined,
                    args.status ?? undefined,
                    args.createdAfter ?? undefined,
                    args.createdBefore ?? undefined,
                    args.creator ?? undefined,
                    args.assignedTo ?? undefined,
                    args.advancedConditions ?? undefined,
                    args.orderBy
                );
                return {
                    content: [{ type: "text", text: JSON.stringify(workItems, null, 2) }],
                };
            }

            default:
                throw new Error(`Unknown tool: ${request.params.name}`);
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new Error(`Invalid input: ${JSON.stringify(error.errors)}`);
        }
        if (isYunxiaoError(error)) {
            throw new Error(formatYunxiaoError(error));
        }
        throw error;
    }
});

// config();

async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Yunxiao MCP Server running on stdio");
}

runServer().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});