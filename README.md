# fito_fm

Proyecto base con arquitectura de **monolito modular**, preparado para crecer de forma ordenada.

## Tecnologías

### Backend
- Node.js
- Express
- MySQL
- JWT
- Zod
- Helmet
- Morgan

### Frontend
- React
- Vite
- React Router
- Axios

## Estructura principal

```text
fito_fm/
├── backend/
├── frontend/
├── docs/
├── .gitignore
└── README.md
```

## Instalación

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Recomendación

Crea cada funcionalidad dentro de `backend/src/modules` y `frontend/src/features`.

Ejemplo:

```text
modules/
└── usuarios/
    ├── usuarios.controller.js
    ├── usuarios.service.js
    ├── usuarios.repository.js
    ├── usuarios.routes.js
    └── usuarios.schema.js
```
