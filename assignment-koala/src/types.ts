// Raw JSON record straight from the data file
export interface RawRecord {
  data: Record<string, any>; // attributes for this item
  children?: Record<string, { records: RawRecord[] }>; // nested groups by relation
}

// Processed tree node used by the UI
export interface TreeNode {
  uid: string; // unique ID for React keys and state
  data: Record<string, any>; // same attributes as RawRecord
  relation?: string; // relationship name to parent
  children: TreeNode[]; // direct list of child nodes
}
