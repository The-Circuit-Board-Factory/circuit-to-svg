import type { PcbSmtPad } from "circuit-json"
import { applyToPoint } from "transformation-matrix"
import { layerNameToColor } from "../layer-name-to-color"
import type { PcbContext } from "../convert-circuit-json-to-pcb-svg"

export function createSvgObjectsFromSmtPad(
  pad: PcbSmtPad,
  ctx: PcbContext,
): any {
  const { transform, layer: layerFilter, colorMap } = ctx

  if (layerFilter && pad.layer !== layerFilter) return []

  // Helper function to create pad number text
  const createPadNumberText = (x: number, y: number, transform?: string) => {
    const padNumber = pad.port_hints?.[0] || "X"

    console.log("padNumber", padNumber, transform)
    
    return {
      name: "text",
      type: "element",
      attributes: {
        x: "0",
        y: "0",
        fill: "#ffffff",
        "font-family": "Arial, sans-serif",
        "font-size": "20",
        "text-anchor": "middle",
        "dominant-baseline": "central",
        transform: transform || `translate(${x} ${y})`,
      },
      children: [
        {
          type: "text",
          value: padNumber,
          name: "",
          attributes: {},
          children: [],
        },
      ],
      value: "",
    }
  }

  if (pad.shape === "rect" || pad.shape === "rotated_rect") {
    const width = pad.width * Math.abs(transform.a)
    const height = pad.height * Math.abs(transform.d)
    const [x, y] = applyToPoint(transform, [pad.x, pad.y])

    if (pad.shape === "rotated_rect" && pad.ccw_rotation) {
      const padRect = {
        name: "rect",
        type: "element",
        attributes: {
          class: "pcb-pad",
          fill: layerNameToColor(pad.layer, colorMap),
          x: (-width / 2).toString(),
          y: (-height / 2).toString(),
          width: width.toString(),
          height: height.toString(),
          transform: `translate(${x} ${y}) rotate(${-pad.ccw_rotation})`,
          "data-layer": pad.layer,
        },
      }
      
      const padNumberText = createPadNumberText(x, y, `translate(${x} ${y}) rotate(${-pad.ccw_rotation})`)

      return padNumberText ? [padRect, padNumberText] : [padRect]
    }

    const padRect = {
      name: "rect",
      type: "element",
      attributes: {
        class: "pcb-pad",
        fill: layerNameToColor(pad.layer, colorMap),
        x: (x - width / 2).toString(),
        y: (y - height / 2).toString(),
        width: width.toString(),
        height: height.toString(),
        "data-layer": pad.layer,
      },
    }
    
    const padNumberText = createPadNumberText(x, y)
    
    return padNumberText ? [padRect, padNumberText] : [padRect]
  }

  if (pad.shape === "pill") {
    const width = pad.width * Math.abs(transform.a)
    const height = pad.height * Math.abs(transform.d)
    const radius = pad.radius * Math.abs(transform.a)
    const [x, y] = applyToPoint(transform, [pad.x, pad.y])

    const padRect = {
      name: "rect",
      type: "element",
      attributes: {
        class: "pcb-pad",
        fill: layerNameToColor(pad.layer, colorMap),
        x: (x - width / 2).toString(),
        y: (y - height / 2).toString(),
        width: width.toString(),
        height: height.toString(),
        rx: radius.toString(),
        ry: radius.toString(),
        "data-layer": pad.layer,
      },
    }
    
    const padNumberText = createPadNumberText(x, y)
    
    return padNumberText ? [padRect, padNumberText] : [padRect]
  }
  if (pad.shape === "circle") {
    const radius = pad.radius * Math.abs(transform.a)
    const [x, y] = applyToPoint(transform, [pad.x, pad.y])

    const padCircle = {
      name: "circle",
      type: "element",
      attributes: {
        class: "pcb-pad",
        fill: layerNameToColor(pad.layer, colorMap),
        cx: x.toString(),
        cy: y.toString(),
        r: radius.toString(),
        "data-layer": pad.layer,
      },
    }
    
    const padNumberText = createPadNumberText(x, y)
    
    return padNumberText ? [padCircle, padNumberText] : [padCircle]
  }

  if (pad.shape === "polygon") {
    const points = (pad.points ?? []).map((point) =>
      applyToPoint(transform, [point.x, point.y]),
    )
    const [x, y] = applyToPoint(transform, [pad.x, pad.y])

    const padPolygon = {
      name: "polygon",
      type: "element",
      attributes: {
        class: "pcb-pad",
        fill: layerNameToColor(pad.layer, colorMap),
        points: points,
        "data-layer": pad.layer,
      },
    }
    
    const padNumberText = createPadNumberText(x, y)
    
    return padNumberText ? [padPolygon, padNumberText] : [padPolygon]
  }

  // TODO: Implement SMT pad circles/ovals etc.
  return []
}
