// Circuit Solver using Modified Nodal Analysis (MNA)
// Solves for node voltages and branch currents

interface CircuitNode {
    id: string;
    voltage: number;
    isGround: boolean;
    isPowerRail: boolean; // 5V or 3.3V
    powerVoltage?: number;
}

interface CircuitElement {
    id: string;
    type: 'resistor' | 'led' | 'wire' | 'voltage_source' | 'current_source';
    node1: string;
    node2: string;
    value: number; // Resistance in Ohms, or voltage for sources
    current?: number;
}

interface CircuitSolution {
    nodeVoltages: Map<string, number>;
    branchCurrents: Map<string, number>;
    converged: boolean;
    iterations: number;
}

export class CircuitSolver {
    private nodes: Map<string, CircuitNode> = new Map();
    private elements: CircuitElement[] = [];
    private groundNode: string = 'GND';

    constructor() {
        // Initialize ground node
        this.nodes.set('GND', {
            id: 'GND',
            voltage: 0,
            isGround: true,
            isPowerRail: false,
        });
    }

    // Add a node to the circuit
    addNode(id: string, isPowerRail: boolean = false, powerVoltage: number = 0): void {
        if (!this.nodes.has(id)) {
            this.nodes.set(id, {
                id,
                voltage: isPowerRail ? powerVoltage : 0,
                isGround: id === 'GND',
                isPowerRail,
                powerVoltage,
            });
        }
    }

    // Add a resistor
    addResistor(id: string, node1: string, node2: string, resistance: number): void {
        this.addNode(node1);
        this.addNode(node2);
        this.elements.push({
            id,
            type: 'resistor',
            node1,
            node2,
            value: resistance,
        });
    }

    // Add an LED (modeled as diode with forward voltage drop)
    addLED(id: string, anode: string, cathode: string, forwardVoltage: number = 2.0): void {
        this.addNode(anode);
        this.addNode(cathode);
        this.elements.push({
            id,
            type: 'led',
            node1: anode,
            node2: cathode,
            value: forwardVoltage,
        });
    }

    // Add a wire (zero resistance conductor)
    addWire(id: string, node1: string, node2: string): void {
        this.addNode(node1);
        this.addNode(node2);
        this.elements.push({
            id,
            type: 'wire',
            node1,
            node2,
            value: 0.001, // Small resistance to avoid singularity
        });
    }

    // Add a voltage source (like Arduino output pin)
    addVoltageSource(id: string, positive: string, negative: string, voltage: number): void {
        this.addNode(positive);
        this.addNode(negative);
        this.elements.push({
            id,
            type: 'voltage_source',
            node1: positive,
            node2: negative,
            value: voltage,
        });
    }

    // Clear all elements
    clear(): void {
        this.nodes.clear();
        this.elements = [];
        this.nodes.set('GND', {
            id: 'GND',
            voltage: 0,
            isGround: true,
            isPowerRail: false,
        });
    }

    // Solve the circuit using MNA
    solve(): CircuitSolution {
        const nodeList = Array.from(this.nodes.keys()).filter(n => n !== 'GND');
        const n = nodeList.length;
        const numVoltageSources = this.elements.filter(e => e.type === 'voltage_source').length;
        const size = n + numVoltageSources;

        if (size === 0) {
            return {
                nodeVoltages: new Map([['GND', 0]]),
                branchCurrents: new Map(),
                converged: true,
                iterations: 0,
            };
        }

        // Create MNA matrices
        // [G  B] [v]   [i]
        // [C  D] [j] = [e]
        const G: number[][] = Array(size).fill(null).map(() => Array(size).fill(0));
        const I: number[] = Array(size).fill(0);

        const nodeIndex = new Map<string, number>();
        nodeList.forEach((node, idx) => nodeIndex.set(node, idx));

        let vsIdx = n; // Voltage source index starts after nodes
        const vsMap = new Map<string, number>(); // Maps VS id to matrix index

        // Build conductance matrix G
        for (const element of this.elements) {
            const i1 = element.node1 === 'GND' ? -1 : nodeIndex.get(element.node1)!;
            const i2 = element.node2 === 'GND' ? -1 : nodeIndex.get(element.node2)!;

            switch (element.type) {
                case 'resistor':
                case 'wire': {
                    const g = 1 / element.value; // Conductance
                    if (i1 >= 0) G[i1][i1] += g;
                    if (i2 >= 0) G[i2][i2] += g;
                    if (i1 >= 0 && i2 >= 0) {
                        G[i1][i2] -= g;
                        G[i2][i1] -= g;
                    }
                    break;
                }

                case 'led': {
                    // Simple LED model: if V > Vf, current flows
                    // For now, model as resistor when forward biased
                    const ledResistance = 100; // Internal LED resistance
                    const g = 1 / ledResistance;
                    if (i1 >= 0) G[i1][i1] += g;
                    if (i2 >= 0) G[i2][i2] += g;
                    if (i1 >= 0 && i2 >= 0) {
                        G[i1][i2] -= g;
                        G[i2][i1] -= g;
                    }
                    break;
                }

                case 'voltage_source': {
                    vsMap.set(element.id, vsIdx);
                    // B matrix (stamps for voltage sources)
                    if (i1 >= 0) G[i1][vsIdx] = 1;
                    if (i2 >= 0) G[i2][vsIdx] = -1;
                    // C matrix
                    if (i1 >= 0) G[vsIdx][i1] = 1;
                    if (i2 >= 0) G[vsIdx][i2] = -1;
                    // Voltage value
                    I[vsIdx] = element.value;
                    vsIdx++;
                    break;
                }
            }
        }

        // Handle power rails
        for (const [nodeId, node] of this.nodes) {
            if (node.isPowerRail && nodeId !== 'GND') {
                const idx = nodeIndex.get(nodeId);
                if (idx !== undefined) {
                    // Force voltage to power rail value
                    G[idx] = Array(size).fill(0);
                    G[idx][idx] = 1;
                    I[idx] = node.powerVoltage || 0;
                }
            }
        }

        // Solve Gv = I using Gaussian elimination
        const solution = this.gaussianElimination(G, I);

        // Extract results
        const nodeVoltages = new Map<string, number>();
        nodeVoltages.set('GND', 0);
        nodeList.forEach((node, idx) => {
            nodeVoltages.set(node, solution[idx] || 0);
        });

        // Calculate branch currents
        const branchCurrents = new Map<string, number>();
        for (const element of this.elements) {
            const v1 = nodeVoltages.get(element.node1) || 0;
            const v2 = nodeVoltages.get(element.node2) || 0;

            switch (element.type) {
                case 'resistor':
                case 'wire':
                    element.current = (v1 - v2) / element.value;
                    branchCurrents.set(element.id, element.current);
                    break;
                case 'led':
                    element.current = Math.max(0, (v1 - v2 - element.value) / 100);
                    branchCurrents.set(element.id, element.current);
                    break;
                case 'voltage_source':
                    const vsMatrixIdx = vsMap.get(element.id);
                    if (vsMatrixIdx !== undefined) {
                        element.current = solution[vsMatrixIdx] || 0;
                        branchCurrents.set(element.id, element.current);
                    }
                    break;
            }
        }

        return {
            nodeVoltages,
            branchCurrents,
            converged: true,
            iterations: 1,
        };
    }

    // Gaussian elimination with partial pivoting
    private gaussianElimination(A: number[][], b: number[]): number[] {
        const n = b.length;
        const augmented = A.map((row, i) => [...row, b[i]]);

        // Forward elimination
        for (let col = 0; col < n; col++) {
            // Find pivot
            let maxRow = col;
            for (let row = col + 1; row < n; row++) {
                if (Math.abs(augmented[row][col]) > Math.abs(augmented[maxRow][col])) {
                    maxRow = row;
                }
            }
            [augmented[col], augmented[maxRow]] = [augmented[maxRow], augmented[col]];

            // Check for singularity
            if (Math.abs(augmented[col][col]) < 1e-10) {
                augmented[col][col] = 1e-10; // Avoid division by zero
            }

            // Eliminate below
            for (let row = col + 1; row < n; row++) {
                const factor = augmented[row][col] / augmented[col][col];
                for (let j = col; j <= n; j++) {
                    augmented[row][j] -= factor * augmented[col][j];
                }
            }
        }

        // Back substitution
        const x = Array(n).fill(0);
        for (let row = n - 1; row >= 0; row--) {
            let sum = augmented[row][n];
            for (let col = row + 1; col < n; col++) {
                sum -= augmented[row][col] * x[col];
            }
            x[row] = sum / (augmented[row][row] || 1e-10);
        }

        return x;
    }

    // Get LED brightness (0-1) based on current
    getLEDBrightness(ledId: string): number {
        const led = this.elements.find(e => e.id === ledId && e.type === 'led');
        if (!led || !led.current) return 0;

        // Typical LED current 2-20mA for visible brightness
        const normalizedCurrent = Math.min(led.current * 1000 / 20, 1); // mA / 20mA max
        return Math.max(0, normalizedCurrent);
    }

    // Check for short circuit (overcurrent)
    checkShortCircuit(): { hasShort: boolean; elements: string[] } {
        const shortCircuitElements: string[] = [];
        const maxCurrent = 0.5; // 500mA max safe current

        for (const element of this.elements) {
            if (element.current && Math.abs(element.current) > maxCurrent) {
                shortCircuitElements.push(element.id);
            }
        }

        return {
            hasShort: shortCircuitElements.length > 0,
            elements: shortCircuitElements,
        };
    }
}

// Helper function to create circuit from component/wire arrays
export function buildCircuitFromComponents(
    components: any[],
    wires: any[]
): CircuitSolver {
    const solver = new CircuitSolver();

    // Add 5V power rail
    solver.addNode('5V', true, 5);
    solver.addNode('3.3V', true, 3.3);

    // Process components and wires...
    // This will be integrated with the ArduinoLab component

    return solver;
}
