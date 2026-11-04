# Soccer League

Aplicación para administrar ligas y equipos, con una relación muchos a muchos entre ambos.

## Requisitos

- .NET 10 SDK
- Node.js y npm (el proyecto especifica npm 12)
- SQL Server accesible desde la máquina (por ejemplo, SQL Server Developer o Express)

## Preparar la base de datos

Ejecuta el script `database\scripts\001-create-soccer-league-database.sql` en SQL Server Management Studio o en una herramienta compatible con SQL Server. El script crea la base `SoccerLeague`, sus tablas y algunos datos de ejemplo.

La API toma la cadena de conexión de `ConnectionStrings:DefaultConnection` en `backend\src\SoccerLeague.API\appsettings.json`:

```text
Server=localhost\SQLEXPRESS;Database=SoccerLeague;Trusted_Connection=True;TrustServerCertificate=True
```

Esta configuración usa autenticación integrada de Windows y la instancia local `SQLEXPRESS`. Si tu instancia es distinta, actualiza la cadena de conexión en `appsettings.json`. No guardes contraseñas ni credenciales personales en archivos versionados.

## Ejecutar la aplicación

Abre dos terminales desde la raíz del repositorio.

### API

Ejecuta la API:

```powershell
dotnet run --project backend\src\SoccerLeague.API\SoccerLeague.API.csproj --launch-profile http
```

La API estará disponible en `http://localhost:5077`. La base de datos debe estar creada y accesible con la cadena de conexión de `appsettings.json` antes de iniciar la API.

### Frontend

```powershell
Set-Location frontend
npm ci
npm start
```

Abre `http://localhost:4200`. El servidor de desarrollo de Angular reenvía las solicitudes `/api` a la API en `http://localhost:5077`.

## Funcionalidades

- Listar, crear, editar, activar/desactivar y eliminar ligas y equipos.
- Asociar equipos con ligas desde ambos formularios.
- Guardar los datos principales y sus asociaciones en una misma petición `POST` o `PUT`.
