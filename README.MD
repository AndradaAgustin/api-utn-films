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

1. Clonar el [repositorio desde GitHub](https://github.com/AndradaAgustin/api-utn-films) o descargar su código fuente.
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
URI_DB=
URI_LOCAL_DB=mongodb://127.0.0.1:27017/films
JWT_SECRET=REEMPLAZAR_POR_UNA_CLAVE_SEGURA
GMAIL_USER=
GMAIL_PASS=
```

| Variable | Descripción |
| --- | --- |
| `PORT` | Puerto del servidor HTTP. |
| `URI_DB` | URI de MongoDB Atlas. Dejar vacía para utilizar MongoDB local. |
| `URI_LOCAL_DB` | URI de MongoDB local, utilizada cuando `URI_DB` está vacía. |
| `JWT_SECRET` | Clave secreta para firmar y verificar tokens. |
| `GMAIL_USER` | Cuenta de correo para las alertas, si se configura esta función. |
| `GMAIL_PASS` | Contraseña de aplicación de Gmail para las alertas. |

Para utilizar MongoDB local, dejar `URI_DB` vacía y completar `URI_LOCAL_DB` con la dirección de MongoDB local. MongoDB Community Server debe estar instalado y ejecutándose. Para utilizar MongoDB Atlas, completar `URI_DB` con la URI del clúster propio.

Reemplazar `JWT_SECRET` por una clave propia. Se puede generar una clave segura con:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Las credenciales de Gmail son opcionales y no son necesarias para probar el CRUD. Las alertas por correo requieren una configuración válida de Nodemailer.

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

## Colección de Bruno

La colección de peticiones HTTP facilita las pruebas de la API. Si se incluye en el repositorio, se encuentra en la carpeta `bruno/`.

1. Abrir Bruno e importar o abrir la colección.
2. Iniciar el servidor con `npm run dev`.
3. Registrar un usuario de prueba.
4. Iniciar sesión y copiar el JWT devuelto en `data.token`.
5. En las peticiones de la carpeta Films, ingresar a **Auth**, seleccionar **Bearer Token** y pegar el JWT sin comillas ni el prefijo `Bearer`. También se puede configurar el token en la carpeta Films y seleccionar `Inherit` en sus peticiones.
6. Probar las operaciones CRUD y los filtros de búsqueda.

Utilizar `http://localhost:1234` como URL base. Para modificar o eliminar películas, reemplazar el identificador de ejemplo por el `_id` de una película existente. Verificar que las peticiones PATCH y DELETE incluyan dicho identificador en la URL y que todas las rutas de películas tengan autenticación.

Si el token vence, iniciar sesión nuevamente. No publicar tokens ni credenciales reales en la colección.

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

En Bruno, seleccionar **Auth → Bearer Token** y pegar el token para todas las peticiones a `/films`, sin escribir el prefijo `Bearer`. Equivale al encabezado:

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
├── bruno/              # Colección de pruebas (si se incluye)
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
└── README.md
```

## Alcance del proyecto

Trabajo práctico de desarrollo de una API REST con Node.js, Express y MongoDB. La API puede ejecutarse y probarse localmente sin necesidad de una interfaz frontend ni de un despliegue en producción.
