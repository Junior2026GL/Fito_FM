import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import geoData from "../data/francisco_morazan.json";
import { getMunicipioLabel } from "../data/municipios.js";

export const FranciscoMorazanMap = ({
  selectedKey,
  hoverKey,
  onMunicipioClick,
  onMunicipioHover
}) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const zoomRef = useRef(null);
  const [tooltip, setTooltip] = useState({ visible: false, name: "", x: 0, y: 0 });
  const [size, setSize] = useState({ width: 0, height: 0 });

  // Observar el tamaño del contenedor para redibujar al redimensionar
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width: Math.round(width), height: Math.round(height) });
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  // Dibujo del mapa (no depende de la selección, así el zoom no se reinicia al hacer clic)
  useEffect(() => {
    if (!svgRef.current || size.width === 0 || size.height === 0) return undefined;

    const { width, height } = size;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Proyección con padding para que no queden cortados los bordes
    const projection = d3.geoMercator().fitExtent([[32, 32], [width - 32, height - 32]], geoData);
    const pathGen = d3.geoPath().projection(projection);

    const g = svg.append("g");

    g.selectAll("path")
      .data(geoData.features)
      .join("path")
      .attr("d", pathGen)
      .attr("class", "municipio-path")
      .attr("data-name", (d) => d.properties.NAME_2)
      .on("mouseenter", (event, d) => {
        const name = d.properties.NAME_2;
        const rect = svgRef.current.getBoundingClientRect();
        setTooltip({
          visible: true,
          name: getMunicipioLabel(name),
          x: event.clientX - rect.left,
          y: event.clientY - rect.top - 14
        });
        onMunicipioHover?.(name);
      })
      .on("mousemove", (event) => {
        const rect = svgRef.current.getBoundingClientRect();
        setTooltip((t) => ({
          ...t,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top - 14
        }));
      })
      .on("mouseleave", () => {
        setTooltip((t) => ({ ...t, visible: false }));
        onMunicipioHover?.(null);
      })
      .on("click", (_, d) => {
        const name = d.properties.NAME_2;
        onMunicipioClick?.({ key: name, label: getMunicipioLabel(name) });
      });

    // Etiquetas de texto sobre cada municipio
    g.selectAll("text")
      .data(geoData.features)
      .join("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("pointer-events", "none")
      .attr("class", "municipio-label")
      .each(function (d) {
        const label = getMunicipioLabel(d.properties.NAME_2);
        const words = label.split(" ");
        const el = d3.select(this);
        const [cx, cy] = pathGen.centroid(d);
        const lineH = 10.5;
        // Partir en líneas de máx 2 palabras
        const lines = [];
        for (let i = 0; i < words.length; i += 2) {
          lines.push(words.slice(i, i + 2).join(" "));
        }
        const startY = cy - ((lines.length - 1) * lineH) / 2;
        lines.forEach((line, i) => {
          el.append("tspan")
            .attr("x", cx)
            .attr("y", startY + i * lineH)
            .text(line);
        });
      });

    // Zoom + pan
    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", (event) => g.attr("transform", event.transform));
    svg.call(zoom);
    zoomRef.current = zoom;

    return () => svg.on(".zoom", null);
  }, [size, onMunicipioClick, onMunicipioHover]);

  // Sincronizar selección y hover (también los provocados desde el panel lateral)
  useEffect(() => {
    if (!svgRef.current) return;

    d3.select(svgRef.current)
      .selectAll("path.municipio-path")
      .classed("municipio-selected", (d) => d.properties.NAME_2 === selectedKey)
      .classed("municipio-hover", (d) => d.properties.NAME_2 === hoverKey);
  }, [selectedKey, hoverKey, size]);

  const zoomBy = (factor) => {
    if (!zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(200).call(zoomRef.current.scaleBy, factor);
  };

  const resetZoom = () => {
    if (!zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.transform, d3.zoomIdentity);
  };

  return (
    <div className="map-wrapper" ref={containerRef}>
      <svg ref={svgRef} className="map-svg" />

      <div className="map-controls">
        <button type="button" onClick={() => zoomBy(1.5)} aria-label="Acercar" title="Acercar">+</button>
        <button type="button" onClick={() => zoomBy(1 / 1.5)} aria-label="Alejar" title="Alejar">&minus;</button>
        <button type="button" onClick={resetZoom} aria-label="Restablecer vista" title="Restablecer vista">&#8634;</button>
      </div>

      {tooltip.visible && (
        <div
          className="map-tooltip"
          style={{ left: tooltip.x + 12, top: tooltip.y }}
        >
          {tooltip.name}
        </div>
      )}

      <p className="map-hint">
        Clic para detalle · Scroll para zoom · Arrastra para mover
      </p>
    </div>
  );
};
