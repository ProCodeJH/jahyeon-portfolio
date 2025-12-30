export type Id = string;

export interface ComponentDef {
  id: Id;
  name: string;
  pins: string[];
}

export interface ComponentInstance {
  id: Id;
  defId: Id;
  label: string;
  position: { x: number; y: number };
}

export interface Net {
  id: Id;
  name: string;
  nodeIds: Id[];
}

export interface ConnectivityGraph {
  components: ComponentInstance[];
  nets: Net[];
}

export interface SimState {
  tick: number;
  graph: ConnectivityGraph;
  updatedAt: number;
}
