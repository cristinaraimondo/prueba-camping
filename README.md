# Camping Gral. Belgrano

El proyecto pretende administrar el alquiler de cabañas (dormis), parcelas, quincho y contingentes el Camping Municipal de General Belgrano.

## Instalación

El proyecto está compuesto de dos partes principales, cada una con su propio directorio y proyecto npm. Luego de clonar el repositorio debería hacerse un `npm install` en cada directorio.

- /client : contiene el front-end. Es un proyecto create-react-app. Iniciarlo con `cd client` y `npm start`.
- /server: contiene el back-end. Es un proyecto que usa express y la base de datos MongoDB a traves de mongoose. Iniciarlo con `cd server` y `npm run server`.

Si no existe una base de datos, se crea una automáticamente, con un único usuario llamado `admin` con clave `admin123`.

## Opciones del server

El servidor puede arrancarse con las siguientes opciones en la línea de comando:

- `nolog` : No genera log de las llamadas recibidas por la API. (Útil para no llenar de info los test de integración).
- `nows` : No levanta el servidor de Websocket (Útil para deployar a Heroku que no permite utilizar más de un puerto).

### Ejemplo:

- `node server.js nolog nows`

## Herramientas

Se recomienda ejecutar el sistema con las siguientes versiones de los programas:

- MongoDB: version 4.0.1
- node.js: version 10.9.0
- npm: version 6.4.0

## Docker

Hemos contenerizado el proyecto con Docker. Debería ser suficiente descargar el proyecto con `git clone https://gitlab.com/nykros/camping .` y luego `docker-compose up` para tener el proyecto funcionando en tres containers: uno conteniendo la base de datos MongoDB, otro el servidor que provee los servicios de API y WebSocket, y el tercero que provee la aplicación Web con React.
Se debe tener en cuenta que por el momento se está utilizando la versión de desarrollo (no de producción) de React.

Se han definido tres variables de ambiente. Si no se especifican, el programa toma los siguientes valores por defecto:

- MONGO_URL = `"mongodb://localhost:27017/camping"` (en el server)
- API_SERVER_URL = `"http://localhost:4400"` (en el cliente)
- WS_SERVER_URL = `"ws://localhost:4401"` (en el cliente)

## Heroku

Se puede deployar a Heroku ejecutando el comando `npm run deploy-heroku` en el directorio raíz del proyecto (anteriomente se debe haber ejecutado una vez `npm install`). Si todo funciona correctamente, se abrirá una ventana en el navegador con el proyecto deployado.

### Heroku: Bug Bounty

El script deployaba en https://campingbelgrano.herokuapp.com/ para ser utilizado en el Bug Bounty publicado.

### Heroku: QA

El script deploya en https://camping-gb.herokuapp.com/ para ser utilizado en de QA.

### Detalles

Para deployar en Heroku hemos creado nuestro propio script en node.js que:

- Crea un directorio y proyecto git (build-heroku) donde pone los archivos del servidor node.js, configurado con las opciones `nolog` y `nows`.
- Genera el build de producción optimizado del cliente React simulando con el contenido del archivo `client\src\config\SERVER_URL_HEROKU` las variables de entorno que determinan la ubicación del server.
- Ejecuta los comandos de git que suben el proyecto a Heroku

Se deben configurar las siguientes variables de ambiente en la app:

- MONGO_URL : `mongodb://usr:clave@mongoserver:puerto` (normalmente una cuenta de mLab)
- TZ : `America/Argentina/Buenos_Aires`

## Testing

Los test han sido incorporados en el pipeline de CI (Continuous Integration) de Gitlab.

### Tests de unidad

Se corren con el comando `npm test`, tanto en el directorio cliente como el servidor. En el cliente, este comando busca en los subdirectorios `src/components/`, `src/config/` y `src/utils/` todos los archivos .test.js y los ejecuta.

Debido a que ahora el comando `npm test` está restringido a los directorios arriba mencionados, si se quiere ejecutar un test determinado, se debe usar usar `npm run jest <nombre de archivo>`, por ejemplo: `npm run jest src/api/testsIntegracion/clientes`

### Tests de integración

Hacen llamadas a la API desde el lado del cliente. De esta forma se verifica la interacción entre el cliente, el servidor y la base de datos.
Se corren con el comando `npm run tapi` (tapi = "Test API").

**IMPORTANTE**: Los test de integración necesitan la base de datos "recién creada" y el server levantado.

Para borrar la base se puede usar el comando `npm run kdb` (Kill DataBase).
El intérprete de comandos de mongo debe estar en el path de búsqueda del SO.

### Stress Testing

En el subdirectorio stressTest se encuentra un generador de Alquileres que permite cargar el sistema con muchos alquileres de parcelas y dormis forma tal que es posible testear el sistema con carga. Para llenar el sistema con alquileres, se debe:

- Borrar la base de datos
- Levantar el server local
- Ir al subdirectorio stressTest
- La primera vez que se use instalar las librerias (`npm install`)
- Ejecutar el generador (`npm start`)

En el generador hay múltiples variables que se pueden ajustar para determinar el:

- Nivel de ocupación de los días de semana
- Nivel de ocupacion de los fin de semana
- Cantidad de días hacia atrás que hay que generar. etc.

## Integrantes

Grupo (en orden alfabético):

- Cristina Raimondo
- Luz Cuello
- Natalia
- Román García
