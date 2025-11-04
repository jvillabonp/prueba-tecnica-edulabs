# Desarrollo de prueba técnica para cargo Desarrollador Fullstack (eduLABS)

Este contenido muestra una descripción de lo realizado y cómo desplegarlo en ambiente Linux a través de docker.

## 1. Decisiones de diseño

En este desarrollo se optó por utilizar una interfaz limpia con **TailwindCSS** y **SweetAlert2** (para notificaciones). Se implementó un diseño simple y limpio para que sea agradable para el usuario. Adicional un menú lateral que es intuitivo para la navegación entre los diferentes módulos del desarrollo.

## 2. Despliegue

Con el fin de facilitar el despliegue y validar su funcionalidad aquí se describe la guía para poder desplegar la solución.

### 2.1 Clonación del desarrollo

En un ambiente Linux (WSL en Windows o una Máquina virtual Ubuntu) instalar [git](https://git-scm.com/book/es/v2/Inicio---Sobre-el-Control-de-Versiones-Instalaci%C3%B3n-de-Git) y una vez instalado clonar el repositorio
```bash
git clone https://github.com/jvillabonp/prueba-tecnica-edulabs
```

### 2.2 Creación de environment (.env)

Una vez clonado el desarrollo, navegar al directorio **api** y allí en la raíz de este directorio crear un archivo **.env** con el siguiente contenido:
```ini
APP_NAME="Controlador de almacenamiento seguro"
APP_ENV=docker
APP_KEY=
APP_DEBUG=false
APP_URL=http://localhost:9010
APP_LOCALE=es
APP_FALLBACK_LOCALE=es
APP_FAKER_LOCALE=es_CO

APP_MAINTENANCE_DRIVER=file

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=prueba
DB_USERNAME=app
DB_PASSWORD=secure

SESSION_DRIVER=file
SESSION_LIFETIME=3600
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null  

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

CACHE_STORE=file

AWS_ACCESS_KEY_ID=minio
AWS_SECRET_ACCESS_KEY=minio12345
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=prueba-edulabs
AWS_USE_PATH_STYLE_ENDPOINT=true
AWS_ENDPOINT=http://minio:9000

JWT_SECRET=
```

### 2.3 Despliegue de los contendores

En la raíz del proyecto ejecutar el siguiente comando:

```bash
docker compose up -d
```

> **Nota**: Es importante contar con la instalación previa de [docker](https://docs.docker.com/engine/install/ubuntu/) en el sistema operativo.

Esperar hasta que finalice la creación de cada contenedor.

### 2.4 Configuraciones del backend (PHP Laravel)

Una vez finalizado el punto **2.3** en la terminal ejecutar lo siguiente:

#### 2.4.1 Listar contenedores creados

```bash
docker compose ps
```

Esto listara los contendores creados y así mismo los nombres. Vamos a buscar el que tiene como nombre ***api_edulabs***

#### 2.4.2 Ingresar al contendor

Una vez validado que el contedor esté creado y el **STATUS** esté en ***UP*** vamos a ingresar a este para realizar las respectivas configuraciones y ejecutar los siguientes comandos en la ruta ***/var/www/html*** del  contenedor:

##### 2.4.2.1 Entrar al contenedor
```bash
docker exec -it api_edulabs bash
```

##### 2.4.2.2 Generar la llave de encriptación
```bash
php artisan key:generate
```

##### 2.4.2.3 Generar clave secreta para los tokens de acceso
```bash
php artisan jwt:secret
```

##### 2.4.2.4 Migrar la base de datos y los datos iniciales para funcionalidad
```bash
php artisan migrate --seed
```

Con esto, ya podrías ingresar al desarrollo desde el navegador

## 3 Ingreso y uso

Una vez completado el paso **2** podemos ingresar a la solución en http://localhost:8080/
Allí podemos ingresar con 2 usuarios iniciales

**Administrador**:
```
Usuario: admin@edu-labs.com.co
Contraseña: 123456
```

**Usuario**:
```
Usuario: usuario@edu-labs.com.co
Contraseña: 123456
```

La navegación y explicación del desarrollo se encuentra en el siguiente [video](https://drive.google.com/file/d/1CkzxwSw05KnOl56_60yLhr6kA5OL8pfZ/view?usp=drive_link)