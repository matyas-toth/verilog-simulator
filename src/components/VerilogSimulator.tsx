import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import SevenSegmentDisplay from './SevenSegmentDisplay'

interface VerilogSimulatorProps {
  switches: boolean[]
  setSwitches: (switches: boolean[]) => void
  buttons: boolean[]
  setButtons: (buttons: boolean[]) => void
  leds: boolean[]
  sevenSegDisplays: boolean[][]
}

export default function VerilogSimulator({
  switches,
  setSwitches,
  buttons,
  setButtons,
  leds,
  sevenSegDisplays,
}: VerilogSimulatorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-2">Switches</h2>
        <div className="flex space-x-2">
          {switches.map((isOn, index) => (
            <Switch
              key={index}
              checked={isOn}
              onCheckedChange={(checked) => {
                const newSwitches = [...switches]
                newSwitches[index] = checked
                setSwitches(newSwitches)
              }}
            />
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Buttons</h2>
        <div className="flex space-x-2">
          {buttons.map((isPressed, index) => (
            <Button
              key={index}
              variant={isPressed ? 'default' : 'outline'}
              onMouseDown={() => {
                const newButtons = [...buttons]
                newButtons[index] = true
                setButtons(newButtons)
              }}
              onMouseUp={() => {
                const newButtons = [...buttons]
                newButtons[index] = false
                setButtons(newButtons)
              }}
            >
              {index}
            </Button>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">LEDs</h2>
        <div className="flex space-x-2">
          {leds.map((isOn, index) => (
            <div
              key={index}
              className={`w-6 h-6 rounded-full ${
                isOn ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">7-Segment Displays</h2>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {sevenSegDisplays.map((display, index) => (
            <SevenSegmentDisplay key={index} segments={display} />
          ))}
        </div>
      </div>
    </div>
  )
}