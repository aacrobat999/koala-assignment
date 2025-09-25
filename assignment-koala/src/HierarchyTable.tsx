import { useState, useCallback } from "react";
import type { TreeNode } from "./types";
import React from "react";
import "./styles/HierarchyTable.css";

interface TableProps {
  // Array of root nodes to display
  data: TreeNode[];
  // Callback to remove a node by its unique ID
  onRemove: (uid: string) => void;
}

interface RowProps {
  node: TreeNode; // Current node being rendered
  
  level: number; // Current depth in the tree (used for indentation)
  
  expanded: Record<string, boolean>; // Map of node IDs to boolean indicating if they are expanded
  
  toggle: (uid: string) => void; // Toggles the expanded/collapsed state of a node
  
  onRemove: (uid: string) => void; // Removes a node by ID 
  
  isLast?: boolean; // Indicates if this node is the last child in its group
} 

function Row({ node, level, expanded, toggle, onRemove, isLast }: RowProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isOpen = !!expanded[node.uid]; // Expanded/collapsed state
  const rowTitle = node.data["Name"] || node.data["ID"] || "(no name)";

  return (
    <>
      <tr className="tree-row">
        <td className="tree-cell">
          {/* Container for indentation and tree connector lines */}
          <div className="tree-node" style={{ marginLeft: level * 30 }}>
            <div className="tree-lines">
              {/* Draw a vertical branch line unless this is a root node */}
              {level > 0 && (
                <span className={`tree-branch ${isLast ? "last" : ""}`} />
              )}
            </div>

            {/* Expand/collapse button or placeholder if no children */}
            {hasChildren ? (
              <button onClick={() => toggle(node.uid)} className="toggle-btn">
                {isOpen ? "⬇️" : "➡️"}
              </button>
            ) : (
              <span className="toggle-placeholder" />
            )}

            {/* Node title and optional relationship label */}
            <span className="tree-title">{rowTitle}</span>
            {node.relation && (
              <small className="tree-relation">({node.relation})</small>
            )}
          </div>
        </td>

        {/* Display all key/value pairs of the node's data */}
        <td>
          <div className="data-card">
            {Object.entries(node.data).map(([k, v]) => (
              <React.Fragment key={k}>
                <div className="data-key">{k}</div>
                <div className="data-value">{String(v) || "—"}</div>
              </React.Fragment>
            ))}
          </div>
        </td>

        {/* Remove button for this node */}
        <td className="action-cell">
          <button onClick={() => onRemove(node.uid)} className="remove-btn">
            Remove
          </button>
        </td>
      </tr>

      {/* Recursively render child rows if node is expanded */}
      {hasChildren &&
        isOpen &&
        node.children.map((child, idx) => (
          <Row
            key={child.uid}
            node={child}
            level={level + 1}
            expanded={expanded}
            toggle={toggle}
            onRemove={onRemove}
            isLast={idx === node.children.length - 1}
          />
        ))}
    </>
  );
}

//Displays the entire hierarchy as a table with expand/collapse controls
export default function HierarchyTable({ data, onRemove }: TableProps) {
  // State for tracking which nodes are expanded
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Toggle a single node open/closed
  const toggle = useCallback((uid: string) => {
    setExpanded((prev) => ({ ...prev, [uid]: !prev[uid] }));
  }, []);

  // Recursively collect all node IDs for bulk expand/collapse
  const collectAllIds = useCallback((nodes: TreeNode[]): string[] => {
    return nodes.flatMap((n) => [
      n.uid,
      ...(n.children ? collectAllIds(n.children) : []),
    ]);
  }, []);

  // Expand every node in the hierarchy
  const expandAll = useCallback(() => {
    const allIds = collectAllIds(data);
    const newState: Record<string, boolean> = {};
    allIds.forEach((id) => (newState[id] = true));
    setExpanded(newState);
  }, [data, collectAllIds]);

  // Collapse every node in the hierarchy
  const collapseAll = useCallback(() => {
    setExpanded({});
  }, []);

  return (
    <div>
      {/* Control buttons for expanding/collapsing the entire tree */}
      <div className="tree-controls" style={{ marginBottom: "10px" }}>
        <button onClick={expandAll} className="expand-btn">
          Expand All
        </button>
        <button onClick={collapseAll} className="collapse-btn">
          Collapse All
        </button>
      </div>

      {/* Main table layout */}
      <table className="tree-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Attributes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Render each top-level node (roots of the hierarchy) */}
          {data.map((node, idx) => (
            <Row
              key={node.uid}
              node={node}
              level={0}
              expanded={expanded}
              toggle={toggle}
              onRemove={onRemove}
              isLast={idx === data.length - 1}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
