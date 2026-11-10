import { tool } from "@langchain/core/tools";
import { z } from "zod";
import {
  getTree,
  getFile,
  createFolder,
  createFile,
  updateFile,
  deleteNode,
} from "../utils/fetchFileApis.js";

const compactTree = (items = []) =>
  items.map((item) => ({
    _id: item._id,
    name: item.name,
    parent: item.parent,
    type: item.type,
    extension: item.extension,
    children: compactTree(item.children || []),
  }));

const pick = (file, extra = {}) => ({
  _id: file._id,
  name: file.name,
  parent: file.parent,
  type: file.type,
  extension: file.extension,
  ...extra,
});

export const fileTools = ({ projectId, userId }) => {
  const getTreeTool = tool(
    async () => {
      const result = await getTree(userId, projectId);
      return JSON.stringify({ success: true, tree: compactTree(result) });
    },
    {
      name: "get_tree",
      description: `Get the complete project file and folder tree.
1. Use this when project structure is unknown.
2. Do not call get_tree repeatedly.
3. type = "folder" means folder, type = "file" means file.
4. Folder ids are used as parentId. Never call get_file with a folder id.
5. Use the exact ids returned by this tool.
Fields: _id, name, parent (null for root), type, extension, children.`,
      schema: z.object({}),
    }
  );

  const getFileTool = tool(
    async ({ fileId }) => {
      const file = await getFile(userId, fileId);
      if (!file || file.type === "folder") {
        return JSON.stringify({
          success: false,
          message: "File not found or is a folder.",
          instructions: "Do not call get_file for folders. Use the folder id as the parentId.",
        });
      }
      return JSON.stringify({
        success: true,
        file: pick(file, { content: file.content || "", language: file.language }),
      });
    },
    {
      name: "get_file",
      description: `Get the content of a file by its _id.
1. Never pass a folder id.
2. Do not call repeatedly for the same file.
3. Use the exact ids returned by get_tree.`,
      schema: z.object({ fileId: z.string() }),
    }
  );

  const createFolderTool = tool(
    async ({ parentId, name }) => {
      const folder = await createFolder(userId, projectId, name, parentId);
      if (!folder) return JSON.stringify({ success: false, message: "Failed to create folder." });
      return JSON.stringify({ success: true, operation: "create_folder", folder: pick(folder) });
    },
    {
      name: "create_folder",
      description: `Create a new folder in the project.
1. parentId must be the _id of an existing folder.
2. Create parent folders before subfolders.
3. Do not create duplicate folder names in the same parent.
4. Do not call get_tree afterwards; use the returned folder object.`,
      schema: z.object({ parentId: z.string().nullable(), name: z.string() }),
    }
  );

  const createFileTool = tool(
    async ({ parentId, name, content = "", language = "plaintext" }) => {
      const file = await createFile(userId, projectId, name, parentId, content, language);
      if (!file) return JSON.stringify({ success: false, message: "Failed to create file." });
      return JSON.stringify({
        success: true,
        operation: "create_file",
        file: pick(file, { content: file.content || "", language: file.language }),
      });
    },
    {
      name: "create_file",
      description: `Create a new file in the project.
1. parentId must be the _id of an existing folder.
2. name must be non-empty.
3. content defaults to "" and language defaults to "plaintext".`,
      schema: z.object({
        parentId: z.string(),
        name: z.string(),
        content: z.string().optional(),
        language: z.string().optional(),
      }),
    }
  );

  const updateFileTool = tool(
    async ({ fileId, content, name }) => {
      const file = await updateFile(userId, fileId, content, name);
      if (!file) return JSON.stringify({ success: false, message: "Failed to update file." });
      return JSON.stringify({
        success: true,
        operation: "file_updated",
        file: pick(file, { content: file.content || "" }),
      });
    },
    {
      name: "update_file",
      description: `Update an existing file.
1. fileId must be the _id of a file.
2. Pass content to replace the file content, and/or name to rename it.
3. Fields you omit are left unchanged.`,
      schema: z.object({
        fileId: z.string(),
        content: z.string().optional(),
        name: z.string().optional(),
      }),
    }
  );

  const deleteFileTool = tool(
    async ({ fileId }) => {
      const result = await deleteNode(userId, fileId);
      if (!result) return JSON.stringify({ success: false, message: "Failed to delete file." });
      return JSON.stringify({ success: true, operation: "file_deleted", file: { _id: fileId } });
    },
    {
      name: "delete_file",
      description: `Delete an existing file.
1. fileId must be the _id of a file.
2. Do not call get_tree afterwards.`,
      schema: z.object({ fileId: z.string() }),
    }
  );

  return [getTreeTool, getFileTool, createFolderTool, createFileTool, updateFileTool, deleteFileTool];
};