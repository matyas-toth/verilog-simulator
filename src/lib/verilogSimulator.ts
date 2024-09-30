type SimulationInputs = {
    sw: boolean[]
    btn: boolean[]
}

type SimulationOutputs = {
    LED: boolean[]
    sevenSegDisplays: boolean[][]
}

type Module = {
    inputs: { [key: string]: number[] }
    outputs: { [key: string]: number[] }
    wires: Set<string>
    assignments: { [key: string]: string }
}

export function simulateVerilog(code: string, inputs: SimulationInputs): SimulationOutputs {
    const module = parseModule(code)
    const outputs: SimulationOutputs = {
        LED: Array(10).fill(false),
        sevenSegDisplays: Array(8).fill(null).map(() => Array(8).fill(false))
    }
    const wireValues: { [key: string]: boolean } = {}

    // Evaluate all assignments
    for (const [output, expression] of Object.entries(module.assignments)) {
        const value = evaluateExpression(expression, inputs, wireValues)
        if (output.startsWith('LED[')) {
            const index = parseInt(output.match(/\d+/)?.[0] || '0')
            outputs.LED[index] = value
        } else if (output.match(/d\d+\[\d\]/)) {
            const [display, segment] = output.match(/\d+/g)?.map(Number) || [0, 0]
            outputs.sevenSegDisplays[display][segment] = value
        } else {
            wireValues[output] = value
        }
    }

    return outputs
}

function parseModule(code: string): Module {
    const module: Module = {
        inputs: {},
        outputs: {},
        wires: new Set(),
        assignments: {},
    }

    const lines = code.split('\n')
    for (const line of lines) {
        const inputMatch = line.match(/input\s+\[(\d+):(\d+)\]\s+(\w+)/)
        if (inputMatch) {
            const [_, high, low, name] = inputMatch
            module.inputs[name] = [parseInt(high), parseInt(low)]
        }

        const outputMatch = line.match(/output\s+\[(\d+):(\d+)\]\s+(\w+)/)
        if (outputMatch) {
            const [_, high, low, name] = outputMatch
            module.outputs[name] = [parseInt(high), parseInt(low)]
        }

        const wireMatch = line.match(/wire\s+(\w+);/)
        if (wireMatch) {
            const [_, name] = wireMatch
            module.wires.add(name)
        }

        const assignMatch = line.match(/assign\s+(\w+(?:\[\d+\])?)\s*=\s*(.+);/)
        if (assignMatch) {
            const [_, output, expression] = assignMatch
            module.assignments[output] = expression.trim()
        }
    }

    return module
}

function evaluateExpression(expression: string, inputs: SimulationInputs, wireValues: { [key: string]: boolean }): boolean {
    const tokens = expression.match(/!*\w+(?:\[\d+\])?|&&|\|\||\^|&|\|/g) || [];
    const stack: boolean[] = [];

    for (const token of tokens) {
        if (token.startsWith('!sw[')) {
            const index = parseInt(token.match(/\d+/)?.[0] || '0');
            stack.push(!inputs.sw[index]);
        } else if (token.startsWith('sw[')) {
            const index = parseInt(token.match(/\d+/)?.[0] || '0');
            stack.push(inputs.sw[index]);
        } else if (token.startsWith('!btn[')) {
            const index = parseInt(token.match(/\d+/)?.[0] || '0');
            stack.push(!inputs.btn[index]);
        } else if (token.startsWith('btn[')) {
            const index = parseInt(token.match(/\d+/)?.[0] || '0');
            stack.push(inputs.btn[index]);
        } else if (token in wireValues) {
            stack.push(wireValues[token]);
        } else if (token.startsWith('!') && token.slice(1) in wireValues) {
            stack.push(!wireValues[token.slice(1)]);
        } else if (token === '&&') {
            const b = stack.pop() || false;
            const a = stack.pop() || false;
            stack.push(a && b);
        } else if (token === '||') {
            const b = stack.pop() || false;
            const a = stack.pop() || false;
            stack.push(a || b);
        } else if (token === '^') {
            const b = stack.pop() || false;
            const a = stack.pop() || false;
            stack.push(a !== b);
        } else if (token === '&') {
            const b = stack.pop() || false;
            const a = stack.pop() || false;
            stack.push(a && b);
        } else if (token === '|') {
            const b = stack.pop() || false;
            const a = stack.pop() || false;
            stack.push(a || b);
        }
    }

    return stack.pop() || false;
}