import "dotenv/config";
import axios from "axios";

const baseUrl = () => process.env.FILE_SERVICE_URL;
const authHeaders = (userId) => ({ "x-user-id": String(userId) });
const fail = (err) => {
  throw new Error(err.response?.data?.message || err.message);
};

export const createFolder = async (userId, projectId, name, parentId) => {
  try {
    const { data } = await axios.post(
      `${baseUrl()}/create-folder`,
      { projectId, name, parentId },
      { headers: authHeaders(userId) }
    );
    return data;
  } catch (err) {
    fail(err);
  }
};

export const createFile = async (userId, projectId, name, parentId, content = "", language = "plaintext") => {
  try {
    const { data } = await axios.post(
      `${baseUrl()}/create-file`,
      { projectId, name, parentId, content, language },
      { headers: authHeaders(userId) }
    );
    return data;
  } catch (err) {
    fail(err);
  }
};

// undefined fields are dropped from the JSON body, so they won't overwrite existing values
export const updateFile = async (userId, fileId, content, name) => {
  try {
    const { data } = await axios.patch(
      `${baseUrl()}/update-file`,
      { fileId, content, name },
      { headers: authHeaders(userId) }
    );
    return data;
  } catch (err) {
    fail(err);
  }
};

export const deleteNode = async (userId, fileId) => {
  try {
    const { data } = await axios.delete(`${baseUrl()}/delete-node/${fileId}`, {
      headers: authHeaders(userId),
    });
    return data;
  } catch (err) {
    fail(err);
  }
};

export const getTree = async (userId, projectId) => {
  try {
    const { data } = await axios.get(`${baseUrl()}/get-nodes/${projectId}`, {
      headers: authHeaders(userId),
    });
    return createTree(data);
  } catch (err) {
    fail(err);
  }
};

export const getFile = async (userId, fileId) => {
  try {
    const { data } = await axios.get(`${baseUrl()}/get-file/${fileId}`, {
      headers: authHeaders(userId),
    });
    return data;
  } catch (err) {
    fail(err);
  }
};

const createTree = (nodes = []) => {
  const map = {};
  const roots = [];

  nodes.forEach((node) => {
    map[String(node._id)] = { ...node, children: [] };
  });

  nodes.forEach((node) => {
    const id = String(node._id);
    const parent = node.parent != null ? String(node.parent) : null;
    if (parent && map[parent]) {
      map[parent].children.push(map[id]);
    } else {
      roots.push(map[id]); // root node, or orphan whose parent is missing
    }
  });

  return roots;
};