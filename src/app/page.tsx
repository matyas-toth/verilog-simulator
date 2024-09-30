'use client'

import { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import VerilogSimulator from '@/components/VerilogSimulator'
import { simulateVerilog } from '@/lib/verilogSimulator'

export default function Home() {
  const defaultVerilogCode = `module main(
  input [7:0] sw,
  input [4:0] btn,
  output [9:0] LED
);

  // Example: LED[0] is on when switch 0 is on
  assign LED[0] = sw[0];

  // Example: LED[1] is on when button 0 is pressed
  assign LED[1] = btn[0];

  // Example: LED[2] is on when switch 1 AND switch 2 are on
  assign LED[2] = sw[1] & sw[2];

  // Example: LED[3] is on when switch 3 OR button 1 is on
  assign LED[3] = sw[3] \\| btn[1];

  // Example: LED[4] is on when switch 4 XOR switch 5 is true
  assign LED[4] = sw[4] ^ sw[5];

  // Example: LED[5] is the inverse of switch 6
  assign LED[5] = !sw[6];

  // Example: LED[6] is on when any of the first 4 switches are on
  assign LED[6] = \\|sw[3:0];

  // Example: LED[7] is on when all of the last 4 switches are on
  assign LED[7] = &sw[7:4];

  // Example: LED[8] is on when an odd number of the first 3 buttons are pressed
  assign LED[8] = ^btn[2:0];

  // Example: LED[9] is on when switch 7 is on AND button 4 is not pressed
  assign LED[9] = sw[7] && !btn[4];

endmodule`

  const [verilogCode, setVerilogCode] = useState(defaultVerilogCode)
  const [switches, setSwitches] = useState(Array(8).fill(false))
  const [buttons, setButtons] = useState(Array(5).fill(false))
  const [leds, setLeds] = useState(Array(10).fill(false))
  const [sevenSegDisplays, setSevenSegDisplays] = useState(Array(8).fill(Array(8).fill(false)))

  useEffect(() => {
    const outputs = simulateVerilog(verilogCode, { sw: switches, btn: buttons })
    setLeds(outputs.LED)
    setSevenSegDisplays(outputs.sevenSegDisplays)
  }, [verilogCode, switches, buttons])

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Verilog HDL Simulator</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Textarea
            placeholder="Enter Verilog code here..."
            value={verilogCode}
            onChange={(e) => setVerilogCode(e.target.value)}
            className="h-lvh mb-4"
          />
        </div>
        <div>
          <VerilogSimulator
            switches={switches}
            setSwitches={setSwitches}
            buttons={buttons}
            setButtons={setButtons}
            leds={leds}
            sevenSegDisplays={sevenSegDisplays}
          />
        </div>
      </div>
    </main>
  )
}
