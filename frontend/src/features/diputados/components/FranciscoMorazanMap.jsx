import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import geoData from "../data/francisco_morazan.json";

// Nombres legibles con espacios
const MUNICIPIO_LABELS = {
  Alubarén: "Alubarén",
  Cedros: "Cedros",
  Curarén: "Curarén",
  DistritoCentral: "Distrito Central",
  ElPorvenir: "El Porvenir",
  Guaimaca: "Guaimaca",
  LaLibertad: "La Libertad",
  LaVenta: "La Venta",
  Lepaterique: "Lepaterique",
  Maraita: "Maraita",
  Marale: "Marale",
  NuevaArmenia: "Nueva Armenia",
  Ojojona: "Ojojona",
  Orica: "Orica",
  Reitoca: "Reitoca",
  Sabanagrande: "Sabanagrande",
  SanAntoniodeOriente: "San Antonio de Oriente",
  SanBuenaventura: "San Buenaventura",
  SanIgnacio: "San Ignacio",
  SanJuandeFlores: "San Juan de Flores",
  SanMiguelito: "San Miguelito",
  SantaAna: "Santa Ana",
  SantaLucía: "Santa Lucía",
  Talanga: "Talanga",
  Tatumbla: "Tatumbla",
  "ValledeÁngeles": "Valle de Ángeles",
  Vallecillo: "Vallecillo",
  VilladeSanFrancisco: "Villa de San Francisco",
};

export const FranciscoMorazanMap = ({ onMunicipioClick }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [tooltip, setTooltip] = useState({ visible: false, name: "", x: 0, y: 0 });
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 700;
    const height = container.clientHeight || 680;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Proyección con padding para que no queden cortados los bordes
    const projection = d3.geoMercator().fitExtent([[24, 24], [width - 24, height - 24]], geoData);
    const pathGen = d3.geoPath().projection(projection);

    const g = svg.append("g");

    // Dibujar municipios
    g.selectAll("path")
      .data(geoData.features)
      .join("path")
      .attr("d", pathGen)
      .attr("class", "municipio-path")
      .attr("data-name", (d) => d.properties.NAME_2)
      .on("mouseenter", function (event, d) {
        const name = d.properties.NAME_2;
        if (name !== selected) {
          d3.select(this).classed("municipio-hover", true);
        }
        const rect = svgRef.current.getBoundingClientRect();
        setTooltip({
          visible: true,
          name: MUNICIPIO_LABELS[name] || name,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top - 14,
        });
      })
      .on("mousemove", function (event) {
        const rect = svgRef.current.getBoundingClientRect();
        setTooltip((t) => ({
          ...t,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top - 14,
        }));
      })
      .on("mouseleave", function (_, d) {
        const name = d.properties.NAME_2;
        if (name !== selected) {
          d3.select(this).classed("municipio-hover", false);
        }
        setTooltip((t) => ({ ...t, visible: false }));
      })
      .on("click", function (_, d) {
        const name = d.properties.NAME_2;
        const label = MUNICIPIO_LABELS[name] || name;

        // Deseleccionar anterior
        g.selectAll("path").classed("municipio-selected", false);
        d3.select(this).classed("municipio-selected", true);
        setSelected(name);

        if (onMunicipioClick) onMunicipioClick({ key: name, label });
      });

    // Labels de texto sobre cada municipio
    g.selectAll("text")
      .data(geoData.features)
      .join("text")
      .attr("x", (d) => pathGen.centroid(d)[0])
      .attr("y", (d) => pathGen.centroid(d)[1])
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("pointer-events", "none")
      .attr("fill", "rgba(255,255,255,0.9)")
      .attr("font-size", "7.5px")
      .attr("font-weight", "700")
      .attr("font-family", "Inter, system-ui, sans-serif")
      .attr("paint-order", "stroke")
      .attr("stroke", "rgba(0,0,0,0.45)")
      .attr("stroke-width", "2px")
      .attr("stroke-linejoin", "round")
      .each(function (d) {
        const name = d.properties.NAME_2;
        const label = MUNICIPIO_LABELS[name] || name;
        const words = label.split(" ");
        const el = d3.select(this);
        const cx = pathGen.centroid(d)[0];
        const cy = pathGen.centroid(d)[1];
        const lineH = 9;
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

    return () => svg.on(".zoom", null);
  }, [selected, onMunicipioClick]);

  return (
    <div className="map-wrapper" ref={containerRef}>
      <svg ref={svgRef} className="map-svg" />

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
