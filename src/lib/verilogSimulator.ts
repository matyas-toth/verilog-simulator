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
    const wireValues: { [key: string]: boolean | boolean[] } = {}

    // Evaluate all assignments
    for (const [output, expression] of Object.entries(module.assignments)) {
        const value = evaluateExpression(expression, inputs, wireValues)
        if (output.startsWith('LED[')) {
            const index = parseInt(output.match(/\d+/)?.[0] || '0')
            outputs.LED[index] = value as boolean
        } else if (output.match(/d\d+\[\d\]/)) {
            const [display, segment] = output.match(/\d+/g)?.map(Number) || [0, 0]
            outputs.sevenSegDisplays[display][segment] = value as boolean
        } else if (output.match(/d\d+/)) {
            const display = parseInt(output.match(/\d+/)?.[0] || '0')
            if (Array.isArray(value)) {
                outputs.sevenSegDisplays[display] = value.slice(0, 8)
            }
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

        const assignMatch = line.match(/assign\s+(\w+(?:\[\d+\])?|\w+)\s*=\s*(.+);/)
        if (assignMatch) {
            const [_, output, expression] = assignMatch
            module.assignments[output.trim()] = expression.trim()
        }
    }

    return module
}

function evaluateExpression(expression: string, inputs: SimulationInputs, wireValues: { [key: string]: boolean | boolean[] }): boolean | boolean[] {
    if (expression === 'sw' || expression === 'btn') {
        return inputs[expression]
    }

    const tokens = expression.match(/!*\w+(?:\[\d+\])?|&&|\|\||\^|&|\|/g) || []
    const stack: (boolean | boolean[])[] = []

    for (const token of tokens) {
        if (token.startsWith('!sw[')) {
            const index = parseInt(token.match(/\d+/)?.[0] || '0')
            stack.push(!inputs.sw[index])
        } else if (token.startsWith('sw[')) {
            const index = parseInt(token.match(/\d+/)?.[0] || '0')
            stack.push(inputs.sw[index])
        } else if (token.startsWith('!btn[')) {
            const index = parseInt(token.match(/\d+/)?.[0] || '0')
            stack.push(!inputs.btn[index])
        } else if (token.startsWith('btn[')) {
            const index = parseInt(token.match(/\d+/)?.[0] || '0')
            stack.push(inputs.btn[index])
        } else if (token in wireValues) {
            stack.push(wireValues[token])
        } else if (token.startsWith('!') && token.slice(1) in wireValues) {
            const value = wireValues[token.slice(1)]
            stack.push(Array.isArray(value) ? value.map(v => !v) : !value)
        } else if (token === '&&') {
            const b = stack.pop()
            const a = stack.pop()
            stack.push(combineArrays(a, b, (x, y) => x && y))
        } else if (token === '||') {
            const b = stack.pop()
            const a = stack.pop()
            stack.push(combineArrays(a, b, (x, y) => x || y))
        } else if (token === '^') {
            const b = stack.pop()
            const a = stack.pop()
            stack.push(combineArrays(a, b, (x, y) => x !== y))
        } else if (token === '&') {
            const b = stack.pop()
            const a = stack.pop()
            stack.push(combineArrays(a, b, (x, y) => x && y))
        } else if (token === '|') {
            const b = stack.pop()
            const a = stack.pop()
            stack.push(combineArrays(a, b, (x, y) => x || y))
        }
    }

    return stack.pop() || false
}

function combineArrays(a: boolean | boolean[] | undefined, b: boolean | boolean[] | undefined, op: (x: boolean, y: boolean) => boolean): boolean | boolean[] {
    if (Array.isArray(a) && Array.isArray(b)) {
        return a.map((val, index) => op(val, b[index]))
    } else if (Array.isArray(a) && typeof b === 'boolean') {
        return a.map(val => op(val, b))
    } else if (typeof a === 'boolean' && Array.isArray(b)) {
        return b.map(val => op(a, val))
    } else {
        return op(a as boolean, b as boolean)
    }
}