import { z } from "zod";

// Organization related types
export const CurrentOrganizationInfoSchema = z.object({
  lastOrganization: z.string().optional().describe("Last logged-in organization"),
});

export const OrganizationInfoSchema = z.object({
  id: z.string().optional().describe("Organization ID"),
  name: z.string().optional().describe("Organization name"),
  description: z.string().optional().describe("Organization description"),
});

export const UserOrganizationsInfoSchema = z.array(OrganizationInfoSchema);

// User related types
export const UserInfoSchema = z.object({
  id: z.string().nullable().optional().describe("User ID"),
  name: z.string().nullable().optional().describe("User name"),
});

// Custom field related types
export const FieldItemSchema = z.object({
  displayValue: z.string().nullable().optional().describe("Display value"),
  identifier: z.string().nullable().optional().describe("Identifier"),
});

export const CustomFieldValuesSchema = z.object({
  fieldId: z.string().nullable().optional().describe("Custom field ID"),
  fieldName: z.string().nullable().optional().describe("Custom field name"),
  values: z.array(FieldItemSchema).nullable().optional().describe("Values"),
});

export const ValueSchema = z.object({
  displayValue: z.string().nullable().optional().describe("Display value"),
  identifier: z.string().nullable().optional().describe("Identifier"),
});

export const CustomFieldValueSchema = z.object({
  fieldFormat: z.string().nullable().optional().describe("Field format"),
  fieldId: z.string().nullable().optional().describe("Field ID"),
  fieldName: z.string().nullable().optional().describe("Field name"),
  values: z.array(ValueSchema).nullable().optional().describe("Values"),
});

// Project related types
export const ProjectStatusInfoSchema = z.object({
  id: z.string().nullable().optional().describe("Status ID"),
  name: z.string().nullable().optional().describe("Status name"),
});

export const ProjectInfoSchema = z.object({
  id: z.string().nullable().optional().describe("Project ID, unique identifier for the project"),
  name: z.string().nullable().optional().describe("Project name"),
  description: z.string().nullable().optional().describe("Project description"),
  icon: z.string().nullable().optional().describe("Icon URL"),
  customCode: z.string().nullable().optional().describe("Code number"),
  gmtCreate: z.number().int().nullable().optional().describe("Creation timestamp"),
  gmtModified: z.number().int().nullable().optional().describe("Last update timestamp"),
  logicalStatus: z.string().nullable().optional().describe("Logical status, e.g., normal"),
  scope: z.string().nullable().optional().describe("Public type, enum values: public, private"),
  creator: UserInfoSchema.nullable().optional().describe("Creator"),
  modifier: UserInfoSchema.nullable().optional().describe("Modifier"),
  status: ProjectStatusInfoSchema.nullable().optional().describe("Status"),
  customFieldValues: z.array(CustomFieldValuesSchema).nullable().optional().describe("Custom field values"),
  logoUrl: z.string().nullable().optional().describe("Project logo URL"),
  isArchived: z.boolean().nullable().optional().describe("Whether archived"),
  isPublic: z.boolean().nullable().optional().describe("Whether public"),
  accessLevel: z.string().nullable().optional().describe("Access level"),
  organizationIdentifier: z.string().nullable().optional().describe("Organization identifier"),
  includeSubOrgs: z.boolean().nullable().optional().describe("Whether to include sub-organizations"),
  isTemplate: z.boolean().nullable().optional().describe("Whether it's a template"),
  parentIdentifier: z.string().nullable().optional().describe("Parent identifier"),
  associatedCodes: z.array(z.string()).nullable().optional().describe("Associated code repositories"),
  associatedCodeSources: z.array(z.string()).nullable().optional().describe("Associated code sources"),
  customField: z.record(z.string(), z.any()).nullable().optional().describe("Custom fields"),
  statusInfo: z.object({
    identifier: z.string().nullable().optional().describe("Status identifier"),
    name: z.string().nullable().optional().describe("Status name"),
    color: z.string().nullable().optional().describe("Status color"),
    type: z.string().nullable().optional().describe("Status type"),
    desc: z.string().nullable().optional().describe("Status description"),
  }).nullable().optional().describe("Status information"),
});

export const ProjectListSchema = z.object({
  totalCount: z.number().optional().describe("Total count of projects"),
  result: z.array(ProjectInfoSchema).optional().describe("List of projects"),
});

export const SearchProjectsParamsSchema = z.object({
  organizationId: z.string().describe("Organization ID"),
  name: z.string().optional().describe("Text contained in project name"),
  creator: z.string().optional().describe("Creator"),
  admin: z.string().optional().describe("Administrator"),
  status: z.string().optional().describe("Project status ID, multiple separated by commas"),
  createdBefore: z.string().optional().describe("Created not later than, format: YYYY-MM-DD"),
  createdAfter: z.string().optional().describe("Created not earlier than, format: YYYY-MM-DD"),
  logicalStatus: z.string().optional().describe("Logical status, e.g., NORMAL"),
  extraConditions: z.string().optional().describe("Additional filter conditions"),
  advancedConditions: z.string().optional().describe("Advanced filter conditions, JSON format"),
  page: z.number().optional().describe("Page number"),
  perPage: z.number().optional().describe("Page size, 0-200, default value is 20"),
  orderBy: z.string().optional().describe("Sort field, default is gmtCreate"),
  sort: z.string().optional().describe("Sort order, default is desc"),
});

// Sprint related types
export const SprintInfoSchema = z.object({
  identifier: z.string().optional().describe("Sprint identifier"),
  name: z.string().optional().describe("Sprint name"),
  goal: z.string().optional().describe("Sprint goal"),
  startDate: z.string().optional().describe("Start date"),
  endDate: z.string().optional().describe("End date"),
  status: z.string().optional().describe("Status"),
  spaceIdentifier: z.string().optional().describe("Project identifier"),
  organizationIdentifier: z.string().optional().describe("Organization identifier"),
  gmtCreate: z.string().optional().describe("Creation time"),
  gmtModified: z.string().optional().describe("Last modified time"),
  capacityHours: z.number().optional().describe("Capacity hours"),
  creator: UserInfoSchema.nullable().optional().describe("Creator"),
  description: z.string().optional().describe("Description"),
  locked: z.boolean().optional().describe("Whether locked"),
  modifier: UserInfoSchema.nullable().optional().describe("Modifier"),
  owners: z.array(UserInfoSchema).nullable().optional().describe("Owners"),
});

export const SprintSchema = z.object({
  id: z.string().optional().describe("Sprint ID"),
  name: z.string().optional().describe("Sprint name"),
});

// Work item related types
export const WorkItemTypeSchema = z.object({
  id: z.string().nullable().optional().describe("Work item type ID"),
  name: z.string().nullable().optional().describe("Work item type name"),
});

export const StatusSchema = z.object({
  displayName: z.string().nullable().optional().describe("Display name"),
  id: z.string().nullable().optional().describe("Status ID"),
  name: z.string().nullable().optional().describe("Status name"),
  nameEn: z.string().nullable().optional().describe("English name"),
});

export const SpaceSchema = z.object({
  id: z.string().optional().describe("Space ID"),
  name: z.string().optional().describe("Space name"),
});

export const LabelSchema = z.object({
  id: z.string().nullable().optional().describe("Label ID"),
  name: z.string().nullable().optional().describe("Label name"),
  color: z.string().nullable().optional().describe("Label color"),
});

export const VersionSchema = z.object({
  id: z.string().nullable().optional().describe("Version ID"),
  name: z.string().nullable().optional().describe("Version name"),
});

export const WorkItemSchema = z.object({
  id: z.string().nullable().optional().describe("Work item ID"),
  subject: z.string().nullable().optional().describe("Title"),
  description: z.string().nullable().optional().describe("Description"),
  gmtCreate: z.number().int().nullable().optional().describe("Creation time"),
  gmtModified: z.number().int().nullable().optional().describe("Last modification time"),
  workitemType: WorkItemTypeSchema.nullable().optional().describe("Work item type"),
  status: StatusSchema.nullable().optional().describe("Status"),
  formatType: z.string().nullable().optional().describe("Format type"),
  categoryId: z.string().nullable().optional().describe("Category ID"),
  logicalStatus: z.string().nullable().optional().describe("Logical status"),
  parentId: z.string().nullable().optional().describe("Parent ID"),
  serialNumber: z.string().nullable().optional().describe("Serial number"),
  statusStageId: z.string().nullable().optional().describe("Status stage ID"),
  updateStatusAt: z.string().nullable().optional().describe("Status update time"),
  idPath: z.string().nullable().optional().describe("ID path"),
  
  assignedTo: UserInfoSchema.nullable().optional().describe("Assignee"),
  creator: UserInfoSchema.nullable().optional().describe("Creator"),
  modifier: UserInfoSchema.nullable().optional().describe("Modifier"),
  verifier: UserInfoSchema.nullable().optional().describe("Verifier"),
  space: SpaceSchema.nullable().optional().describe("Space"),
  sprint: SprintSchema.nullable().optional().describe("Sprint"),
  
  labels: z.array(LabelSchema).nullable().optional().describe("Labels"),
  participants: z.array(UserInfoSchema).nullable().optional().describe("Participants"),
  trackers: z.array(UserInfoSchema).nullable().optional().describe("Trackers"),
  versions: z.array(VersionSchema).nullable().optional().describe("Versions"),
  customFieldValues: z.array(CustomFieldValueSchema).nullable().optional().describe("Custom field values"),
  
  identifier: z.string().nullable().optional().describe("Work item identifier"),
  priority: z.string().nullable().optional().describe("Priority"),
  spaceIdentifier: z.string().nullable().optional().describe("Project identifier"),
  organizationIdentifier: z.string().nullable().optional().describe("Organization identifier"),
  parentIdentifier: z.string().nullable().optional().describe("Parent work item identifier"),
  customFields: z.record(z.string(), z.any()).nullable().optional().describe("Custom fields"),
  type: z.string().nullable().optional().describe("Type"),
});

// Search condition related types
export const FilterConditionSchema = z.object({
  className: z.string().optional().describe("Class name"),
  fieldIdentifier: z.string().optional().describe("Field identifier"),
  format: z.string().optional().describe("Format"),
  operator: z.string().optional().describe("Operator"),
  toValue: z.string().nullable().optional().describe("To value"),
  value: z.array(z.string()).nullable().optional().describe("Values"),
});

export const ConditionsSchema = z.object({
  conditionGroups: z.array(z.array(z.any())).nullable().optional().describe("Condition groups"),
});

export const CodeupBranchSchema = z.object({
  name: z.string().optional().describe("Branch name"),
  defaultBranch: z.boolean().optional().describe("Whether it is the default branch"),
  commit: z.object({
    authorEmail: z.string().optional().describe("Author email"),
    authorName: z.string().optional().describe("Author name"),
    committedDate: z.string().optional().describe("Commit date"),
    committerEmail: z.string().optional().describe("Committer email"),
    committerName: z.string().optional().describe("Committer name"),
    id: z.string().optional().describe("Commit ID"),
    message: z.string().optional().describe("Commit message"),
    parentIds: z.array(z.string()).optional().describe("Parent commit IDs"),
    shortId: z.string().optional().describe("Code group path"),
    stats: z.object({
      additions: z.number().optional().describe("Added lines"),
      deletions: z.number().optional().describe("Deleted lines"),
      total: z.number().optional().describe("Total lines"),
    }).nullable().optional().describe("Commit statistics"),
    title: z.string().optional().describe("Title, first line of the commit message"),
    webUrl: z.string().url().optional().describe("Web access URL"),
  }).nullable().optional().describe("Commit information"),
  protected: z.boolean().optional().describe("Whether it is a protected branch"),
  webUrl: z.string().url().optional().describe("Web access URL"),
});

export const FileContentSchema = z.object({
  fileName: z.string().optional().describe("File name"),
  filePath: z.string().optional().describe("File path"),
  size: z.string().optional().describe("File size"),
  content: z.string().optional().describe("File content"),
  encoding: z.string().optional().describe("Content encoding (base64 or text)"),
  ref: z.string().optional().describe("Reference (branch, tag, or commit)"),
  blobId: z.string().optional().describe("Blob ID"),
  commitId: z.string().optional().describe("Commit ID"),
});

export const FileInfoSchema = z.object({
  id: z.string().optional().describe("File/directory ID"),
  name: z.string().optional().describe("File/directory name"),
  path: z.string().optional().describe("File/directory path"),
  type: z.string().optional().describe("Type of entry: tree (directory) or blob (file)"),
  mode: z.string().optional().describe("File mode"),
  size: z.number().int().optional().describe("File size (not present for directories)"),
});

export const RepositorySchema = z.object({
  id: z.number().int().optional().describe("Repository ID"),
  name: z.string().optional().describe("Repository name"),
  webUrl: z.string().optional().describe("Web URL for accessing the repository"),
  description: z.string().optional().describe("Repository description"),
  path: z.string().optional().describe("Repository path"),
});

export const CodeupUserSchema = z.object({
  userId: z.string().optional().describe("User ID"),
  username: z.string().optional().describe("Username"),
  name: z.string().optional().describe("Full name"),
  email: z.string().optional().describe("Email address"),
  avatar: z.string().optional().describe("Avatar URL"),
  state: z.string().optional().describe("User state"),
});

export const PatchSetSchema = z.object({
  commitId: z.string().nullable().optional(),
  createTime: z.string().nullable().optional(),
  patchSetBizId: z.string().nullable().optional(),
  patchSetName: z.string().optional(),
  ref: z.string().optional(),
  relatedMergeItemType: z.string().optional(),
  shortId: z.string().optional(),
  versionNo: z.number().int().optional(),
});

export const CommentLocationSchema = z.object({
  canLocated: z.boolean().optional().describe("Can be located"),
  locatedFilePath: z.string().optional().describe("Located file path"),
  locatedLineNumber: z.number().optional().describe("Located line number"),
  locatedPatchSetBizId: z.string().optional().describe("Located patch set business ID"),
});

export const ChangeRequestCommentSchema = z.object({
  author: z.object({
    avatar: z.string().nullable().optional().describe("用户头像地址"),
    email: z.string().nullable().optional().describe("用户邮箱"),
    name: z.string().nullable().optional().describe("用户名称"),
    state: z.string().nullable().optional().describe("用户状态：active - 激活可用；blocked - 阻塞暂不可用"),
    userId: z.string().nullable().optional().describe("云效用户ID"),
    username: z.string().nullable().optional().describe("用户登录名")
  }).nullable().optional().describe("评论作者信息"),
  child_comments_list: z.array(z.any()).nullable().optional().describe("子评论列表"),
  comment_biz_id: z.string().nullable().optional().describe("评论业务ID"),
  comment_time: z.string().nullable().optional().describe("评论时间"),
  comment_type: z.string().nullable().optional().describe("评论类型：GLOBAL_COMMENT - 全局评论；INLINE_COMMENT - 行内评论"),
  content: z.string().nullable().optional().describe("评论内容"),
  expression_reply_list: z.array(z.any()).nullable().optional().describe("表情回复列表"),
  filePath: z.string().nullable().optional().describe("文件路径，仅行内评论有"),
  from_patchset_biz_id: z.string().nullable().optional().describe("比较的起始版本ID"),
  is_deleted: z.boolean().nullable().optional().describe("是否已删除"),
  last_edit_time: z.string().nullable().optional().describe("最后编辑时间"),
  last_edit_user: z.object({
    avatar: z.string().nullable().optional().describe("用户头像地址"),
    email: z.string().nullable().optional().describe("用户邮箱"),
    name: z.string().nullable().optional().describe("用户名称"),
    state: z.string().nullable().optional().describe("用户状态"),
    userId: z.string().nullable().optional().describe("云效用户ID"),
    username: z.string().nullable().optional().describe("用户登录名")
  }).nullable().optional().describe("最后编辑用户"),
  last_resolved_status_change_time: z.string().nullable().optional().describe("最后解决状态变更时间"),
  last_resolved_status_change_user: z.object({
    avatar: z.string().nullable().optional().describe("用户头像地址"),
    email: z.string().nullable().optional().describe("用户邮箱"),
    name: z.string().nullable().optional().describe("用户名称"),
    state: z.string().nullable().optional().describe("用户状态"),
    userId: z.string().nullable().optional().describe("云效用户ID"),
    username: z.string().nullable().optional().describe("用户登录名")
  }).nullable().optional().describe("最后解决状态变更用户"),
  line_number: z.number().int().nullable().optional().describe("所在行号"),
  location: z.object({
    can_located: z.boolean().nullable().optional().describe("是否可以定位"),
    located_file_path: z.string().nullable().optional().describe("定位的文件路径"),
    located_line_number: z.number().int().nullable().optional().describe("定位的行号"),
    located_patch_set_biz_id: z.string().nullable().optional().describe("定位的补丁集业务ID")
  }).nullable().optional().describe("位置信息"),
  mr_biz_id: z.string().nullable().optional().describe("所属合并请求的业务ID"),
  out_dated: z.boolean().nullable().optional().describe("是否过期评论"),
  parent_comment_biz_id: z.string().nullable().optional().describe("父评论业务ID"),
  project_id: z.number().int().nullable().optional().describe("代码库ID"),
  related_patchset: z.object({
    commitId: z.string().nullable().optional().describe("版本对应的提交ID"),
    createTime: z.string().nullable().optional().describe("版本创建时间"),
    patchSetBizId: z.string().nullable().optional().describe("版本ID，具有唯一性"),
    patchSetName: z.string().nullable().optional().describe("版本名称"),
    ref: z.string().nullable().optional().describe("版本对应的ref信息"),
    relatedMergeItemType: z.string().nullable().optional().describe("关联的类型：MERGE_SOURCE - 合并源；MERGE_TARGET - 合并目标"),
    shortId: z.string().nullable().optional().describe("提交ID对应的短ID，通常为8位"),
    versionNo: z.number().int().nullable().optional().describe("版本号")
  }).nullable().optional().describe("关联的补丁集信息"),
  resolved: z.boolean().nullable().optional().describe("是否已解决"),
  root_comment_biz_id: z.string().nullable().optional().describe("根评论业务ID"),
  state: z.string().nullable().optional().describe("评论状态：OPENED - 已公开；DRAFT - 草稿"),
  to_patchset_biz_id: z.string().nullable().optional().describe("比较的目标版本ID"),
});

export const ChangeRequestSchema = z.object({
  ahead: z.number().int().nullable().optional().describe("源分支领先目标分支的commit数量"),
  allRequirementsPass: z.boolean().nullable().optional().describe("是否所有卡点项通过"),
  author: z.object({
    avatar: z.string().nullable().optional().describe("用户头像地址"),
    email: z.string().nullable().optional().describe("用户邮箱"),
    name: z.string().nullable().optional().describe("用户名称"),
    state: z.string().nullable().optional().describe("用户状态：active - 激活可用；blocked - 阻塞暂不可用"),
    userId: z.string().nullable().optional().describe("云效用户ID"),
    username: z.string().nullable().optional().describe("用户登录名")
  }).nullable().optional().describe("创建者信息"),
  behind: z.number().int().nullable().optional().describe("目标分支领先源分支的commit数量"),
  canRevertOrCherryPick: z.boolean().nullable().optional().describe("是否能Revert或者CherryPick"),
  conflictCheckStatus: z.string().nullable().optional().describe("冲突检测状态：CHECKING - 检测中；HAS_CONFLICT - 有冲突；NO_CONFLICT - 无冲突；FAILED - 检测失败"),
  createFrom: z.string().nullable().optional().describe("创建来源：WEB - 页面创建；COMMAND_LINE - 命令行创建"),
  createTime: z.string().nullable().optional().describe("创建时间"),
  description: z.string().nullable().optional().describe("描述"),
  detailUrl: z.string().nullable().optional().describe("合并请求详情地址"),
  hasReverted: z.boolean().nullable().optional().describe("是否Revert过"),
  localId: z.union([z.string(), z.number().int()]).nullable().optional().describe("局部ID，表示代码库中第几个合并请求"),
  mergedRevision: z.string().nullable().optional().describe("合并版本（提交ID），仅已合并状态才有值"),
  mrType: z.string().nullable().optional().describe("合并请求类型"),
  projectId: z.number().int().nullable().optional().describe("项目ID"),
  reviewers: z.array(z.object({
    avatar: z.string().nullable().optional().describe("用户头像地址"),
    email: z.string().nullable().optional().describe("用户邮箱"),
    hasCommented: z.boolean().nullable().optional().describe("是否已评论"),
    hasReviewed: z.boolean().nullable().optional().describe("是否已审阅"),
    name: z.string().nullable().optional().describe("用户名称"),
    reviewOpinionStatus: z.string().nullable().optional().describe("审阅意见状态"),
    reviewTime: z.string().nullable().optional().describe("审阅时间"),
    state: z.string().nullable().optional().describe("用户状态"),
    userId: z.string().nullable().optional().describe("云效用户ID"),
    username: z.string().nullable().optional().describe("用户登录名")
  })).nullable().optional().describe("评审人列表"),
  sourceBranch: z.string().nullable().optional().describe("源分支"),
  sourceCommitId: z.string().nullable().optional().describe("源提交ID，当createFrom=COMMAND_LINE时有值"),
  sourceProjectId: z.union([z.string(), z.number().int()]).nullable().optional().describe("源库ID"),
  sourceRef: z.string().nullable().optional().describe("源提交引用，当createFrom=COMMAND_LINE时有值"),
  status: z.string().nullable().optional().describe("合并请求状态：UNDER_DEV - 开发中；UNDER_REVIEW - 评审中；TO_BE_MERGED - 待合并；CLOSED - 已关闭；MERGED - 已合并"),
  subscribers: z.array(z.object({
    avatar: z.string().nullable().optional().describe("用户头像地址"),
    email: z.string().nullable().optional().describe("用户邮箱"),
    name: z.string().nullable().optional().describe("用户名称"),
    state: z.string().nullable().optional().describe("用户状态"),
    userId: z.string().nullable().optional().describe("云效用户ID"),
    username: z.string().nullable().optional().describe("用户登录名")
  })).nullable().optional().describe("订阅人列表"),
  supportMergeFastForwardOnly: z.boolean().nullable().optional().describe("是否支持fast-forward-only"),
  targetBranch: z.string().nullable().optional().describe("目标分支"),
  targetProjectId: z.union([z.string(), z.number().int()]).nullable().optional().describe("目标库ID"),
  targetProjectNameWithNamespace: z.string().nullable().optional().describe("目标库名称（含完整父路径）"),
  targetProjectPathWithNamespace: z.string().nullable().optional().describe("目标库路径（含完整父路径）"),
  title: z.string().nullable().optional().describe("标题"),
  totalCommentCount: z.number().int().nullable().optional().describe("总评论数"),
  unResolvedCommentCount: z.number().int().nullable().optional().describe("未解决评论数"),
  updateTime: z.string().nullable().optional().describe("更新时间"),
  webUrl: z.string().nullable().optional().describe("页面地址")
});

export const StatsSchema = z.object({
  additions: z.number().optional().describe("Added lines"),
  deletions: z.number().optional().describe("Deleted lines"),
  total: z.number().optional().describe("Total lines"),
});

export const CommitSchema = z.object({
  authorEmail: z.string().optional().describe("Author email"),
  authorName: z.string().optional().describe("Author name"),
  authoredDate: z.string().optional().describe("Authored date"),
  committedDate: z.string().optional().describe("Committed date"),
  committerEmail: z.string().optional().describe("Committer email"),
  committerName: z.string().optional().describe("Committer name"),
  id: z.string().optional().describe("Commit ID"),
  message: z.string().optional().describe("Commit message"),
  parentIds: z.array(z.string()).nullable().optional().describe("Parent commit IDs"),
  shortId: z.string().optional().describe("Short ID"),
  stats: StatsSchema.nullable().optional().describe("Commit statistics"),
  title: z.string().optional().describe("Title"),
  webUrl: z.string().optional().describe("Web URL"),
});

export const DiffSchema = z.object({
  aMode: z.string().optional().describe("A mode"),
  bMode: z.string().optional().describe("B mode"),
  deletedFile: z.boolean().optional().describe("Whether the file was deleted"),
  diff: z.string().optional().describe("Diff content"),
  isBinary: z.boolean().optional().describe("Whether the file is binary"),
  newFile: z.boolean().optional().describe("Whether the file is new"),
  newId: z.string().optional().describe("New ID"),
  newPath: z.string().optional().describe("New path"),
  oldId: z.string().optional().describe("Old ID"),
  oldPath: z.string().optional().describe("Old path"),
  renamedFile: z.boolean().optional().describe("Whether the file was renamed"),
});

export const CompareSchema = z.object({
  base_commit_sha: z.string().optional(),
  commits: z.array(z.unknown()).optional(),
  commits_count: z.number().optional(),
  diffs: z.array(z.unknown()).optional(),
  files_count: z.number().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export const CreateFileResponseSchema = z.object({
  filePath: z.string().optional().describe("File path"),
  branch: z.string().optional().describe("Branch name"),
  newOid: z.string().optional().describe("Git Object ID"),
});

export const DeleteFileResponseSchema = z.object({
  filePath: z.string().optional().describe("File path"),
  branch: z.string().optional().describe("Branch name"),
  commitId: z.string().optional().describe("Commit ID"),
  commitMessage: z.string().optional().describe("Commit message"),
});

// Type Exports
export type CurrentOrganizationInfo = z.infer<typeof CurrentOrganizationInfoSchema>;
export type OrganizationInfo = z.infer<typeof OrganizationInfoSchema>;
export type UserOrganizationsInfo = z.infer<typeof UserOrganizationsInfoSchema>;

export type UserInfo = z.infer<typeof UserInfoSchema>;
export type FieldItem = z.infer<typeof FieldItemSchema>;
export type CustomFieldValues = z.infer<typeof CustomFieldValuesSchema>;
export type Value = z.infer<typeof ValueSchema>;
export type CustomFieldValue = z.infer<typeof CustomFieldValueSchema>;

export type ProjectStatusInfo = z.infer<typeof ProjectStatusInfoSchema>;
export type ProjectInfo = z.infer<typeof ProjectInfoSchema>;
export type ProjectList = z.infer<typeof ProjectListSchema>;
export type SearchProjectsParams = z.infer<typeof SearchProjectsParamsSchema>;

export type SprintInfo = z.infer<typeof SprintInfoSchema>;
export type Sprint = z.infer<typeof SprintSchema>;

export type WorkItemType = z.infer<typeof WorkItemTypeSchema>;
export type Status = z.infer<typeof StatusSchema>;
export type Space = z.infer<typeof SpaceSchema>;
export type Label = z.infer<typeof LabelSchema>;
export type Version = z.infer<typeof VersionSchema>;
export type WorkItem = z.infer<typeof WorkItemSchema>;

export type FilterCondition = z.infer<typeof FilterConditionSchema>;
export type Conditions = z.infer<typeof ConditionsSchema>;

export type CodeupBranch = z.infer<typeof CodeupBranchSchema>;
export type FileContent = z.infer<typeof FileContentSchema>;
export type FileInfo = z.infer<typeof FileInfoSchema>;
export type Repository = z.infer<typeof RepositorySchema>;
export type CodeupUser = z.infer<typeof CodeupUserSchema>;
export type PatchSet = z.infer<typeof PatchSetSchema>;
export type CommentLocation = z.infer<typeof CommentLocationSchema>;
export type ChangeRequestComment = z.infer<typeof ChangeRequestCommentSchema>;
export type ChangeRequest = z.infer<typeof ChangeRequestSchema>;
export type Stats = z.infer<typeof StatsSchema>;
export type Commit = z.infer<typeof CommitSchema>;
export type Diff = z.infer<typeof DiffSchema>;
export type Compare = z.infer<typeof CompareSchema>;
export type CreateFileResponse = z.infer<typeof CreateFileResponseSchema>;
export type DeleteFileResponse = z.infer<typeof DeleteFileResponseSchema>;