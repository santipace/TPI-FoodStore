# Food Store

Trabajo Práctico Integrador de **Programación 4** (Tecnicatura Universitaria en Programación a Distancia, UTN).
Aplicación web completa para un negocio de comidas: los clientes se registran, recorren el catálogo, arman un
carrito y confirman pedidos; el administrador gestiona categorías, productos, stock, pedidos y usuarios.

- **Autor:** Pace Santiago Julian


## Stack

| Parte | Tecnologías |
|---|---|
| Backend | Python 3.11 a 3.13, FastAPI, SQLModel, PostgreSQL (SQLite para desarrollo), JWT en cookie HttpOnly (python-jose), bcrypt (passlib), pydantic-settings |
| Frontend | React 19 + TypeScript (strict), Vite, Tailwind CSS 4, TanStack Query / Form / Table, Zustand, Axios, React Router 7, pnpm |

## Estructura del proyecto

```
.
├── README.md
├── backend/
│   ├── .env.example
│   ├── requirements.txt
│   └── app/
│       ├── main.py                 FastAPI, CORS con credenciales y routers bajo /api/v1
│       ├── core/                   config, database, security, deps, unit_of_work, base_repository
│       ├── modules/
│       │   ├── auth/               router, service, schemas (usa el modelo Usuario)
│       │   ├── usuarios/           models, schemas, repository, unit_of_work, service, router
│       │   ├── categorias/         misma cadena de archivos
│       │   ├── productos/          misma cadena de archivos
│       │   └── pedidos/            models, schemas, repository, unit_of_work, service, router
│       └── db/seed.py              seed idempotente
└── frontend/
    ├── .env.example
    ├── package.json / pnpm-lock.yaml
    └── src/
        ├── shared/                 api (axios, errores, queryClient), ui, components, layout
        ├── features/               auth, categorias, productos, usuarios, pedidos (pages, components, hooks, api, types)
        ├── store/                  authStore y cartStore (Zustand + persist)
        ├── routes/                 AppRouter y ProtectedRoute
        ├── App.tsx / main.tsx / index.css
```

## Requisitos

- Python 3.11, 3.12 o 3.13 (SQLModel 0.0.22 no funciona con 3.14)
- Node.js 20.19 o superior y pnpm 9 o superior (`npm install -g pnpm`)
- PostgreSQL 15 o superior (opcional: para desarrollo local se puede usar SQLite, ver más abajo)

## Backend: instalación y ejecución

Desde la carpeta `backend/`:

```bash
# 1. Entorno virtual
python -m venv venv
source venv/bin/activate          # Linux / macOS
venv\Scripts\activate             # Windows (CMD o PowerShell)

# 2. Dependencias (versiones fijadas)
pip install -r requirements.txt

# 3. Variables de entorno
cp .env.example .env              # Windows: copy .env.example .env
# editar .env: usuario, clave y nombre de la base en DATABASE_URL
```

**Base de datos.** Con PostgreSQL, crear la base antes de seguir (el nombre tiene que coincidir con `DATABASE_URL`):

```bash
psql -U postgres -c "CREATE DATABASE foodstore_db;"
```

Para probar sin PostgreSQL, en `.env` usar `DATABASE_URL=sqlite:///./foodstore.db`.
Las tablas se crean solas al iniciar la API o al correr el seed.

```bash
# 4. Seed: crea el admin, 4 categorías y 8 productos con stock (se puede correr varias veces)
python -m app.db.seed

# 5. Levantar la API en http://localhost:8000
uvicorn app.main:app --reload
```

La documentación interactiva queda en <http://localhost:8000/docs> y <http://localhost:8000/redoc>.
Todos los endpoints viven bajo el prefijo `/api/v1`.

### Variables de entorno del backend (`backend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base | `postgresql://user:pass@localhost:5432/foodstore_db` |
| `SECRET_KEY` | Firma del JWT (mínimo 32 caracteres) | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Vencimiento de la cookie y del token | `30` |
| `FRONTEND_ORIGIN` | Origen permitido en CORS | `http://localhost:5173` |

## Frontend: instalación y ejecución

Desde la carpeta `frontend/`:

```bash
pnpm install
cp .env.example .env              # Windows: copy .env.example .env
pnpm build                        # verifica los tipos (tsc strict) y genera el build
pnpm dev                          # http://localhost:5173
```

### Variables de entorno del frontend (`frontend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API (con el prefijo /api/v1) | `http://localhost:8000/api/v1` |

## Usuario del seed

| Rol | Usuario | Contraseña |
|---|---|---|
| Administrador | `admin` | `Admin1234!` |

Los clientes se crean desde la pantalla **Registrarse** (el registro público siempre crea usuarios con rol `user`).

## Cómo funciona

**Autenticación.** `POST /auth/token` valida las credenciales y entrega el JWT en la cookie HttpOnly `access_token`
(vence a los 30 minutos). El cuerpo de la respuesta no incluye el token y el frontend nunca lo lee ni lo guarda:
Axios usa `withCredentials: true` y el navegador adjunta la cookie. En `localStorage` solo se persiste el usuario
(nombre, email y rol) y el carrito. La protección real de los endpoints está en el backend (`get_current_user`,
`get_current_active_user`, `require_role`); `ProtectedRoute` solo mejora la experiencia en pantalla.

**Arquitectura en capas.** Router → Service → Unit of Work → Repository → Model. El commit ocurre únicamente en el
`__exit__` del `UnitOfWork` (rollback si hay excepción, close siempre). Los Services abren `with self.uow as uow:` y
devuelven el schema de salida dentro del bloque; los Routers obtienen el Service con `Depends` y nunca abren el
Unit of Work. Ningún Service ni Router llama a `session.commit()`.

**Reglas de negocio de pedidos** (`backend/app/modules/pedidos/service.py`):

| Regla | Dónde |
|---|---|
| RN-01 Crear pedido: sin repetidos, validación de stock, descuento y copia de nombre/precio en una sola transacción | `PedidoService.crear` |
| RN-02 Máquina de estados como diccionario; transición inválida responde 400 | `TRANSICIONES`, `_aplicar_transicion` |
| RN-03 Cancelar restituye el stock de cada línea en la misma transacción | `_aplicar_transicion` |
| RN-04 El cliente solo ve y cancela sus pedidos (y solo en PENDIENTE); el admin ve todos | `listar`, `obtener`, `cancelar_propio` |
| RN-05 Líneas y total inmutables; no hay endpoints de edición ni borrado | schemas y router |
| RN-06 `forma_pago` y `direccion_entrega` validadas en el schema | `PedidoCreate` |

**Baja lógica.** Usuarios (`disabled`), categorías, productos (`activo`). Un registro dado de baja se trata como
inexistente (404) y la baja de una categoría no libera su nombre único.

## Pantallas del frontend

| Ruta | Acceso | Qué hace |
|---|---|---|
| `/` | Público | Catálogo paginado en el servidor, búsqueda, filtro por categoría, skeleton y estado vacío |
| `/login`, `/register` | Público | Formularios con TanStack Form |
| `/carrito` | Público | Carrito persistido en el navegador |
| `/checkout` | Sesión | Dirección, forma de pago y notas; crea el pedido y vacía el carrito |
| `/mis-pedidos` | Sesión | Pedidos propios con detalle y cancelación en PENDIENTE |
| `/admin/resumen` | admin | Tarjetas con los indicadores |
| `/admin/pedidos` | admin | Filtro por estado y botones para avanzar o cancelar según la máquina de estados |
| `/admin/productos`, `/admin/categorias` | admin | ABM con TanStack Table y TanStack Form, cambio de stock y disponibilidad |
| `/admin/usuarios` | admin | Activar y desactivar usuarios (el admin no puede desactivarse a sí mismo) |
| `/unauthorized` | Público | Aviso de falta de permisos |

## Calidad

- TypeScript con `strict: true` y sin `any`; `pnpm build` compila sin errores ni advertencias.
- Dependencias con versiones fijadas en `requirements.txt` y `package.json` (incluye `passlib[bcrypt]==1.7.4` y `bcrypt==4.0.1`).
- Fuera de alcance, según el enunciado: direcciones guardadas, varias categorías por producto, historial de estados,
  gráficos, pasarela de pago, pruebas automatizadas y notificaciones.
