import type { RawRecord, TreeNode } from "./types";
import { useState } from "react";
import React from "react";
import HierarchyTable from "./HierarchyTable.tsx";
import ReactDOM from "react-dom/client";
import data from "./data/example-data.json";

// Render the App component inside the DOM element with id="root".
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

function buildTree(records: RawRecord[]): TreeNode[] {
  let nextUid = 1; // Unique ID counter for each node

  // Recursively create a TreeNode from a RawRecord.
  function makeNode(item: RawRecord, relation?: string): TreeNode {
    const uid = String(nextUid++);      // Assign a unique string ID
    const data = item.data || {};       // Node data object (character attributes)
    const children: TreeNode[] = [];    // Array to hold child nodes

    // If this record has children, process each relationship group
    if (item.children) {
      for (const rel of Object.keys(item.children)) {
        const group = item.children[rel];
        // Only process if the group contains an array of records
        if (group && Array.isArray(group.records)) {
          for (const rec of group.records) {
            // Recursively build child nodes, passing the relationship name
            children.push(makeNode(rec, rel));
          }
        }
      }
    }

    return { uid, data, relation, children };
  }

  // Map each top-level record into a TreeNode
  return records.map((rec) => makeNode(rec));
}


export default function App() {
  // State holds the current tree of nodes.
  // Initialize it by building the tree from the imported JSON data.
  const [tree, setTree] = useState<TreeNode[]>(() => buildTree(data as RawRecord[]));

  /**
   * Remove a node from the tree by its unique ID.
   * Uses a recursive filter to remove the target node from all levels.
   */
  function removeByUid(uidToRemove: string) {
    function filterNodes(nodes: TreeNode[]): TreeNode[] {
      return nodes
        .filter((n) => n.uid !== uidToRemove) // Skip the node if it matches the ID
        .map((n) => ({
          ...n,
          children: filterNodes(n.children || []), // Recursively filter children
        }));
    }
    setTree((prev) => filterNodes(prev));
  }

  // Render the page container and the hierarchy table.
  // If there is no data, display a simple placeholder message.
  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "Segoe UI, sans-serif" }}>Hierarchy Table</h1>
      {tree.length > 0 ? (
        <HierarchyTable data={tree} onRemove={removeByUid} />
      ) : (
        <p>No data loaded.</p>
      )}
    </div>
  );
}
