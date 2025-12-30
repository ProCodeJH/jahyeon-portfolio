/**
 * Project File Management
 * Save/Load circuit projects to JSON format
 *
 * Features:
 * - JSON serialization/deserialization
 * - Version control and migration
 * - File validation
 * - Import/Export utilities
 * - Browser storage (localStorage) support
 */

import type { ProjectFile, CircuitDef } from './contracts';

/**
 * Project File Manager
 */
export class ProjectFileManager {
  private static readonly CURRENT_VERSION = '1.0';
  private static readonly FILE_EXTENSION = '.circuitlab';

  /**
   * Create new project
   */
  static createNew(name: string = 'Untitled Circuit'): ProjectFile {
    return {
      version: this.CURRENT_VERSION,
      circuit: {
        components: [],
        wires: [],
        metadata: {
          name,
          version: this.CURRENT_VERSION,
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
        },
      },
      code: {
        language: 'arduino',
        source: '',
      },
      settings: {
        simulationSpeed: 1.0,
      },
    };
  }

  /**
   * Save project to JSON string
   */
  static save(project: ProjectFile): string {
    // Update modified timestamp
    project.circuit.metadata.modified = new Date().toISOString();

    // Serialize to JSON
    const json = JSON.stringify(project, null, 2);
    return json;
  }

  /**
   * Load project from JSON string
   */
  static load(json: string): ProjectFile {
    try {
      const project = JSON.parse(json) as ProjectFile;

      // Validate
      this.validate(project);

      // Migrate if needed
      return this.migrate(project);
    } catch (error) {
      throw new Error(`Failed to load project: ${error}`);
    }
  }

  /**
   * Validate project structure
   */
  private static validate(project: any): void {
    if (!project.version) {
      throw new Error('Invalid project: missing version');
    }

    if (!project.circuit) {
      throw new Error('Invalid project: missing circuit');
    }

    if (!Array.isArray(project.circuit.components)) {
      throw new Error('Invalid project: circuit.components must be array');
    }

    if (!Array.isArray(project.circuit.wires)) {
      throw new Error('Invalid project: circuit.wires must be array');
    }

    if (!project.circuit.metadata) {
      throw new Error('Invalid project: missing metadata');
    }
  }

  /**
   * Migrate project to current version
   */
  private static migrate(project: ProjectFile): ProjectFile {
    // Version 1.0 is current, no migration needed
    if (project.version === this.CURRENT_VERSION) {
      return project;
    }

    console.log(`[ProjectFile] Migrating from v${project.version} to v${this.CURRENT_VERSION}`);

    // Future migration logic would go here
    // Example: if (project.version === '0.9') { ... }

    return project;
  }

  /**
   * Download project as file
   */
  static download(project: ProjectFile, filename?: string): void {
    const json = this.save(project);
    const name = filename || `${project.circuit.metadata.name}${this.FILE_EXTENSION}`;

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();

    URL.revokeObjectURL(url);

    console.log(`[ProjectFile] Downloaded: ${name}`);
  }

  /**
   * Upload project from file
   */
  static async upload(): Promise<ProjectFile> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = `${this.FILE_EXTENSION},.json`;

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }

        try {
          const text = await file.text();
          const project = this.load(text);
          console.log(`[ProjectFile] Uploaded: ${file.name}`);
          resolve(project);
        } catch (error) {
          reject(error);
        }
      };

      input.click();
    });
  }

  /**
   * Save to localStorage
   */
  static saveToLocalStorage(project: ProjectFile, key: string = 'circuit-lab-autosave'): void {
    try {
      const json = this.save(project);
      localStorage.setItem(key, json);
      console.log(`[ProjectFile] Saved to localStorage: ${key}`);
    } catch (error) {
      console.error('[ProjectFile] Failed to save to localStorage:', error);
    }
  }

  /**
   * Load from localStorage
   */
  static loadFromLocalStorage(key: string = 'circuit-lab-autosave'): ProjectFile | null {
    try {
      const json = localStorage.getItem(key);
      if (!json) return null;

      const project = this.load(json);
      console.log(`[ProjectFile] Loaded from localStorage: ${key}`);
      return project;
    } catch (error) {
      console.error('[ProjectFile] Failed to load from localStorage:', error);
      return null;
    }
  }

  /**
   * Auto-save with debouncing
   */
  private static autoSaveTimer: NodeJS.Timeout | null = null;

  static autoSave(project: ProjectFile, delay: number = 5000): void {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }

    this.autoSaveTimer = setTimeout(() => {
      this.saveToLocalStorage(project);
    }, delay);
  }

  /**
   * Export circuit definition only
   */
  static exportCircuit(circuit: CircuitDef): string {
    return JSON.stringify(circuit, null, 2);
  }

  /**
   * Import circuit definition
   */
  static importCircuit(json: string): CircuitDef {
    try {
      const circuit = JSON.parse(json) as CircuitDef;

      if (!Array.isArray(circuit.components) || !Array.isArray(circuit.wires)) {
        throw new Error('Invalid circuit format');
      }

      return circuit;
    } catch (error) {
      throw new Error(`Failed to import circuit: ${error}`);
    }
  }

  /**
   * Get recent projects from localStorage
   */
  static getRecentProjects(maxCount: number = 10): {
    key: string;
    name: string;
    modified: string;
  }[] {
    const recent: { key: string; name: string; modified: string }[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('circuit-lab-')) continue;

      try {
        const json = localStorage.getItem(key);
        if (!json) continue;

        const project = JSON.parse(json) as ProjectFile;
        recent.push({
          key,
          name: project.circuit.metadata.name,
          modified: project.circuit.metadata.modified,
        });
      } catch {
        // Skip invalid projects
      }
    }

    // Sort by modified date (newest first)
    recent.sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());

    return recent.slice(0, maxCount);
  }

  /**
   * Delete project from localStorage
   */
  static deleteFromLocalStorage(key: string): void {
    localStorage.removeItem(key);
    console.log(`[ProjectFile] Deleted from localStorage: ${key}`);
  }

  /**
   * Clear all projects from localStorage
   */
  static clearLocalStorage(): void {
    const keys: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('circuit-lab-')) {
        keys.push(key);
      }
    }

    keys.forEach(key => localStorage.removeItem(key));
    console.log(`[ProjectFile] Cleared ${keys.length} projects from localStorage`);
  }

  /**
   * Get project statistics
   */
  static getStats(project: ProjectFile) {
    return {
      components: project.circuit.components.length,
      wires: project.circuit.wires.length,
      codeLines: project.code.source.split('\n').length,
      size: new Blob([this.save(project)]).size,
      created: project.circuit.metadata.created,
      modified: project.circuit.metadata.modified,
    };
  }

  /**
   * Clone project (deep copy)
   */
  static clone(project: ProjectFile): ProjectFile {
    const json = this.save(project);
    const cloned = this.load(json);

    // Update metadata
    cloned.circuit.metadata.name = `${project.circuit.metadata.name} (Copy)`;
    cloned.circuit.metadata.created = new Date().toISOString();
    cloned.circuit.metadata.modified = new Date().toISOString();

    return cloned;
  }

  /**
   * Merge two projects
   */
  static merge(project1: ProjectFile, project2: ProjectFile): ProjectFile {
    const merged = this.createNew('Merged Circuit');

    // Merge components (with ID suffix to avoid conflicts)
    merged.circuit.components = [
      ...project1.circuit.components.map(c => ({
        ...c,
        id: `${c.id}_a`,
      })),
      ...project2.circuit.components.map(c => ({
        ...c,
        id: `${c.id}_b`,
        position: {
          x: c.position.x + 10, // Offset to avoid overlap
          y: c.position.y,
          z: c.position.z,
        },
      })),
    ];

    // Merge wires (update component references)
    merged.circuit.wires = [
      ...project1.circuit.wires.map(w => ({
        ...w,
        id: `${w.id}_a`,
        from: { ...w.from, component: `${w.from.component}_a` },
        to: { ...w.to, component: `${w.to.component}_a` },
      })),
      ...project2.circuit.wires.map(w => ({
        ...w,
        id: `${w.id}_b`,
        from: { ...w.from, component: `${w.from.component}_b` },
        to: { ...w.to, component: `${w.to.component}_b` },
      })),
    ];

    return merged;
  }
}
