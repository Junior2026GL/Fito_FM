import { useEffect, useId, useMemo, useRef, useState } from "react";
import { IconCheck, IconChevronDown, IconSearch } from "./icons.jsx";

const normalizar = (texto) =>
  texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/**
 * Selector desplegable con panel propio (reemplaza al <select> del navegador).
 *
 * options: [{ value, label, sublabel?, hint?, triggerLabel? }]
 *   - label / sublabel: dos líneas en la lista
 *   - hint: etiqueta pequeña a la derecha
 *   - triggerLabel: texto que se muestra en el botón al estar elegida (por defecto, label)
 * allLabel: texto de la opción que limpia la selección (valor "")
 * searchable: agrega un buscador (sin tildes ni mayúsculas) dentro del panel
 *
 * Teclado: ↑ ↓ Inicio Fin recorren, Enter elige, Escape cierra, Tab cierra.
 */
export const Combobox = ({
  id,
  icon: Icon,
  value,
  onChange,
  options,
  allLabel,
  searchable = false,
  searchPlaceholder = "Buscar...",
  emptyText = "Sin resultados",
  disabled = false
}) => {
  const listId = useId();
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const searchRef = useRef(null);
  const listRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const selected = options.find((option) => option.value === value) ?? null;

  // La opción "Todos" solo aparece mientras no se esté buscando
  const items = useMemo(() => {
    const text = normalizar(query.trim());
    if (!text) return [{ value: "", label: allLabel, isAll: true }, ...options];

    return options.filter((option) => normalizar(`${option.label} ${option.sublabel ?? ""}`).includes(text));
  }, [options, query, allLabel]);

  const abrir = () => {
    if (disabled) return;
    setQuery("");
    setActive(selected ? options.indexOf(selected) + 1 : 0);
    setOpen(true);
  };

  const cerrar = (devolverFoco = true) => {
    setOpen(false);
    if (devolverFoco) triggerRef.current?.focus();
  };

  const elegir = (nuevoValor) => {
    onChange(nuevoValor);
    cerrar();
  };

  // Al abrir, el foco pasa al buscador (o a la lista si no hay buscador)
  useEffect(() => {
    if (!open) return;
    (searchable ? searchRef.current : listRef.current)?.focus();
  }, [open, searchable]);

  // Clic fuera del selector lo cierra
  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  // La opción activa siempre queda a la vista al moverse con el teclado
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const handleKeyDown = (event) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActive((i) => Math.min(items.length - 1, i + 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActive((i) => Math.max(0, i - 1));
        break;
      case "Home":
        event.preventDefault();
        setActive(0);
        break;
      case "End":
        event.preventDefault();
        setActive(Math.max(0, items.length - 1));
        break;
      case "Enter":
        event.preventDefault();
        if (items[active]) elegir(items[active].value);
        break;
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        cerrar();
        break;
      case "Tab":
        cerrar(false);
        break;
      default:
    }
  };

  const handleTriggerKeyDown = (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) abrir();
    }
  };

  const handleQuery = (event) => {
    setQuery(event.target.value);
    setActive(0);
  };

  return (
    <div className={`cb${open ? " open" : ""}`} ref={rootRef}>
      <button
        type="button"
        id={id}
        ref={triggerRef}
        className="cb-trigger"
        onClick={() => (open ? cerrar(false) : abrir())}
        onKeyDown={handleTriggerKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
      >
        <span className="cb-icon"><Icon /></span>
        <span className={`cb-value${selected ? "" : " placeholder"}`}>
          {selected ? (selected.triggerLabel ?? selected.label) : allLabel}
        </span>
        <span className="cb-chevron"><IconChevronDown /></span>
      </button>

      {open && (
        <div className="cb-panel" onKeyDown={handleKeyDown}>
          {searchable && (
            <div className="cb-search">
              <IconSearch />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={handleQuery}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                autoComplete="off"
              />
              <span className="cb-count">{options.length}</span>
            </div>
          )}

          <ul id={listId} role="listbox" className="cb-list" ref={listRef} tabIndex={-1}>
            {items.length === 0 ? (
              <li className="cb-empty">{emptyText}</li>
            ) : (
              items.map((item, index) => {
                const esElegida = item.isAll ? !selected : item.value === value;

                return (
                  <li
                    key={item.isAll ? "__todos__" : item.value}
                    role="option"
                    aria-selected={esElegida}
                    data-index={index}
                    className={`cb-option${index === active ? " active" : ""}${esElegida ? " selected" : ""}${item.isAll ? " all" : ""}`}
                    onMouseEnter={() => setActive(index)}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => elegir(item.value)}
                  >
                    <span className="cb-option-text">
                      <span className="cb-option-main">{item.label}</span>
                      {item.sublabel && <span className="cb-option-sub">{item.sublabel}</span>}
                    </span>
                    {item.hint && <span className="cb-option-hint">{item.hint}</span>}
                    <span className="cb-check">{esElegida && <IconCheck />}</span>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
