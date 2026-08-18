import { Tooltip } from "@/components/Tooltip/Tooltip";
import ComponentDemo from "../ComponentsDemo";
import PropsTable from "@/components/Personal/PropsTable";
import { Button } from "@/components/Button/Button";
import { Info, Settings } from "lucide-react";

const TooltipPage = () => {
  const basicUsageCode = `import { Tooltip } from "@/components/Tooltip/Tooltip";

<Tooltip content="This is a tooltip">
  <Button>Hover me</Button>
</Tooltip>`;

  const positionsCode = `<div className="flex flex-wrap items-center justify-center gap-6">
  <Tooltip content="Tooltip on top" side="top">
    <Button variant="outline">Top</Button>
  </Tooltip>

  <Tooltip content="Tooltip on right" side="right">
    <Button variant="outline">Right</Button>
  </Tooltip>

  <Tooltip content="Tooltip on bottom" side="bottom">
    <Button variant="outline">Bottom</Button>
  </Tooltip>

  <Tooltip content="Tooltip on left" side="left">
    <Button variant="outline">Left</Button>
  </Tooltip>
</div>`;

  const advancedUsageCode = `<Tooltip
  content="Configure your component"
  side="bottom"
  align="start"
  delayDuration={300}
>
  <Button variant="dark" size="icon" aria-label="Open settings">
    <Settings size={18} />
  </Button>
</Tooltip>`;

  const propsData = [
    {
      prop: "content",
      type: "React.ReactNode",
      default: "-",
      description: "Content displayed inside the tooltip.",
    },
    {
      prop: "side",
      type: '"top" | "right" | "bottom" | "left"',
      default: '"top"',
      description:
        "Preferred side of the trigger. The tooltip automatically flips when there is not enough viewport space.",
    },
    {
      prop: "align",
      type: '"start" | "center" | "end"',
      default: '"center"',
      description: "Controls alignment of the tooltip relative to its trigger.",
    },
    {
      prop: "sideOffset",
      type: "number",
      default: "8",
      description: "Distance in pixels between the trigger and tooltip.",
    },
    {
      prop: "delayDuration",
      type: "number",
      default: "200",
      description: "Delay in milliseconds before the tooltip opens.",
    },
    {
      prop: "disabled",
      type: "boolean",
      default: "false",
      description: "Disables the tooltip when true.",
    },
    {
      prop: "className",
      type: "string",
      default: "-",
      description: "Additional classes for custom tooltip styling.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-12">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Tooltip</h1>
        <p className="text-lg text-gray-600">
          Displays contextual information when users hover or focus an
          interactive element.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Usage</h2>
        <ComponentDemo code={basicUsageCode}>
          <Tooltip content="This is a tooltip">
            <Button hoverAnimation="scale">Hover me</Button>
          </Tooltip>
        </ComponentDemo>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Positions</h2>
        <ComponentDemo code={positionsCode}>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Tooltip content="Tooltip on top" side="top">
              <Button variant="outline">Top</Button>
            </Tooltip>

            <Tooltip content="Tooltip on right" side="right">
              <Button variant="outline">Right</Button>
            </Tooltip>

            <Tooltip content="Tooltip on bottom" side="bottom">
              <Button variant="outline">Bottom</Button>
            </Tooltip>

            <Tooltip content="Tooltip on left" side="left">
              <Button variant="outline">Left</Button>
            </Tooltip>
          </div>
        </ComponentDemo>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Advanced</h2>
        <ComponentDemo code={advancedUsageCode}>
          <div className="flex items-center gap-4">
            <Tooltip
              content="Configure your component"
              side="bottom"
              align="start"
              delayDuration={300}
            >
              <Button
                variant="dark"
                size="icon"
                aria-label="Open settings"
              >
                <Settings size={18} />
              </Button>
            </Tooltip>

            <Tooltip content="Additional information">
              <span
                tabIndex={0}
                className="inline-flex h-10 w-10 cursor-help items-center justify-center rounded-full border border-gray-300 text-gray-600 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                aria-label="More information"
              >
                <Info size={18} />
              </span>
            </Tooltip>
          </div>
        </ComponentDemo>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">API Reference</h2>
        <PropsTable data={propsData} />
      </section>
    </div>
  );
};

export default TooltipPage;
