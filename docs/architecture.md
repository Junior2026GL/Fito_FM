# Arquitectura de fito_fm

El proyecto utiliza una arquitectura de **monolito modular**.

## Flujo del backend

```text
Ruta
  ↓
Controlador
  ↓
Servicio
  ↓
Repositorio
  ↓
Base de datos
```

## Responsabilidades

- **routes:** define los endpoints.
- **controller:** recibe la solicitud y devuelve la respuesta.
- **service:** contiene las reglas de negocio.
- **repository:** realiza consultas a la base de datos.
- **schema:** valida los datos.
- **middleware:** autenticación, permisos, errores y seguridad.
- **shared:** componentes reutilizables.
- **infrastructure:** base de datos, archivos, correo y servicios externos.
