# FilmVault – API REST de películas

API REST desarrollada con Node.js, Express y MongoDB para gestionar un catálogo de películas. El proyecto permite registrar usuarios, iniciar sesión y realizar operaciones CRUD mediante rutas protegidas con JWT.

## Funcionalidades

- Registro e inicio de sesión de usuarios.
- Creación, consulta, actualización y eliminación de películas.
- Búsqueda por título, género, año y rango de años.
- Paginación de resultados.
- Asociación de cada película nueva con el usuario que la agregó.
- Validación de datos, control de duplicados y manejo de errores.
- Almacenamiento de contraseñas mediante hash con bcryptjs.

## Tecnologías

Node.js, Express, MongoDB, Mongoose, JSON Web Token (JWT), bcryptjs, Zod, dotenv, CORS y Nodemailer (notificaciones de errores).

## Requisitos previos

- Node.js 24 recomendado y npm.
- MongoDB Community Server en ejecución o una conexión a MongoDB Atlas.
- Bruno, Postman o cualquier cliente HTTP para probar los endpoints.

## Instalación y configuración

1. Clonar el repositorio desde GitHub o descargar su código fuente.
2. Abrir una terminal en la carpeta `api-utn-films`.
3. Instalar las dependencias:

```bash
npm ci
```

4. Crear un archivo `.env` a partir de `.env.example`:

```bash
cp .env.example .env
```

En PowerShell se puede utilizar `Copy-Item .env.example .env`.

5. Configurar las variables de entorno. Ejemplo para MongoDB local:

```dotenv
PORT=1234
URI_DB=mongodb://127.0.0.1:27017/films
URI_LOCAL_DB=mongodb://127.0.0.1:27017/films
JWT_SECRET=REEMPLAZAR_POR_UNA_CLAVE_SEGURA
GMAIL_USER=
GMAIL_PASS=
```

| Variable | Descripción |
| --- | --- |
| `PORT` | Puerto del servidor HTTP. |
| `URI_DB` | URI de conexión a MongoDB utilizada por el servidor. Para Atlas, utilizar la URI del clúster propio. |
| `URI_LOCAL_DB` | URI alternativa de referencia para MongoDB local. |
| `JWT_SECRET` | Clave privada para firmar y verificar tokens. |
| `GMAIL_USER` | Cuenta de correo para las alertas, si se configura esta función. |
| `GMAIL_PASS` | Contraseña de aplicación de Gmail para las alertas. |

El código original utiliza `URI_DB` directamente; por eso debe contener la URI elegida, incluso si MongoDB es local. Las credenciales de Gmail no son necesarias para probar el CRUD. Las alertas por correo requieren una configuración válida de Nodemailer.

No subir el archivo `.env` al repositorio. Utilizar únicamente valores ficticios en `.env.example`.

## Ejecución

Modo normal:

```bash
npm start
```

Modo desarrollo (reinicio automático al modificar archivos):

```bash
npm run dev
```

La API estará disponible en `http://localhost:1234` si se utiliza el puerto del ejemplo. Para comprobar el servidor, realizar `GET /`. La terminal debe indicar que MongoDB se conectó correctamente.

## Endpoints

| Método | Ruta | Descripción | JWT |
| --- | --- | --- | --- |
| GET | `/` | Estado del servidor | No |
| GET | `/users` | Listar usuarios sin contraseñas | No |
| POST | `/users/register` | Registrar usuario | No |
| POST | `/users/login` | Iniciar sesión | No |
| GET | `/films` | Listar películas | Sí |
| GET | `/films/search` | Buscar y filtrar películas | Sí |
| POST | `/films` | Crear película | Sí |
| PATCH | `/films/:id` | Actualizar película | Sí |
| DELETE | `/films/:id` | Eliminar película | Sí |

## Ejemplos de uso con Bruno

Utilizar `http://localhost:1234` como URL base y seleccionar JSON como tipo de cuerpo para las peticiones POST y PATCH.

### 1. Registrar usuario

`POST /users/register`

```json
{
  "name": "Usuario de prueba",
  "email": "prueba@example.com",
  "password": "ClaveDePrueba123"
}
```

### 2. Iniciar sesión

`POST /users/login`

```json
{
  "email": "prueba@example.com",
  "password": "ClaveDePrueba123"
}
```

Copiar el token devuelto en `data.token`. Tiene una duración de una hora.

En Bruno, seleccionar **Auth → Bearer Token** y pegar el token para todas las peticiones a `/films`. Equivale al encabezado:

```http
Authorization: Bearer TU_TOKEN
```

### 3. Crear película

`POST /films`

```json
{
  "title": "Interestelar",
  "year": 2014,
  "genre": "Ciencia ficción"
}
```

Si el título ya existe, utilizar otro. El backend obtiene el creador desde el JWT; no es necesario enviar `createdBy`.

### 4. Consultar películas

`GET /films`

La respuesta contiene la lista de películas y, cuando está registrado, el nombre del usuario creador. Las películas antiguas pueden no tener un creador asociado.

### 5. Buscar películas

`GET /films/search?genre=Drama&yearFrom=2000&yearTo=2020&results=10&offset=0`

| Parámetro | Descripción |
| --- | --- |
| `title` | Búsqueda parcial por título, sin distinguir mayúsculas. |
| `genre` | Género exacto. |
| `year` | Año exacto. |
| `yearFrom` | Año mínimo. |
| `yearTo` | Año máximo. |
| `results` | Límite de resultados. |
| `offset` | Cantidad de resultados a omitir. |

### 6. Actualizar película

`PATCH /films/:id`

Reemplazar `:id` por el `_id` de una película existente.

```json
{
  "genre": "Drama"
}
```

Se puede actualizar uno o varios campos sin modificar el creador original.

### 7. Eliminar película

`DELETE /films/:id`

Utilizar el identificador de una película de prueba.

## Validaciones y respuestas

El título es obligatorio, el año debe ser entero y estar comprendido entre 1888 y el año actual, y el género debe pertenecer a los valores permitidos por el validador. El registro requiere un nombre de al menos tres caracteres, un correo válido y una contraseña de al menos seis caracteres.

Las respuestas de los controladores utilizan una estructura JSON con `success`, `data` y `message` en caso de éxito, o `success`, `error` y `message` en caso de error. El middleware de autenticación puede devolver un objeto con `error`.

| Código HTTP | Significado |
| --- | --- |
| 200 | Operación exitosa |
| 201 | Recurso creado |
| 400 | Datos inválidos |
| 401 | Credenciales o token inválidos, ausentes o vencidos |
| 404 | Recurso no encontrado |
| 409 | Recurso duplicado |
| 500 | Error interno del servidor |

## Estructura del proyecto

```text
api-utn-films/
├── src/
│   ├── config/          # Conexión con MongoDB
│   ├── constants/       # Mensajes y constantes
│   ├── controllers/     # Lógica de usuarios y películas
│   ├── middleware/      # Autenticación JWT
│   ├── models/          # Modelos de Mongoose
│   ├── routes/          # Rutas de la API
│   ├── utils/           # Funciones auxiliares
│   ├── validators/      # Esquemas de validación Zod
│   └── index.js         # Configuración e inicio del servidor
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
└── README.md
```

## Alcance del proyecto

Trabajo práctico de desarrollo de una API REST con Node.js, Express y MongoDB. La API puede ejecutarse y probarse localmente sin necesidad de una interfaz frontend ni de un despliegue en producción.
