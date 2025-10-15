<?php
// api.php - El nuevo archivo principal y Router

// 1. AUTOLOAD DE COMPOSER (Asegúrate de ejecutar 'composer install' para JWT)
require_once __DIR__ . '/vendor/autoload.php';
 
// 2. CONFIGURACIÓN INICIAL Y CORS
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Clave secreta para JWT (¡CAMBIA ESTO POR UNA CADENA LARGA Y ÚNICA!)
define('JWT_SECRET_KEY', 'La_Clave_Secreta_Para_Firmar_Tokens_JWT_Aqui'); 

// Cabeceras CORS (Configuradas para aceptar desde cualquier origen en desarrollo)
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Función de ayuda para enviar respuestas JSON (Conservada por simplicidad)
function jsonResponse($data, $statusCode = 200)
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// Manejar Preflight (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    jsonResponse(null, 204); // 204 No Content
}

// 3. REQUIRES E INICIALIZACIÓN DE CLASES (Manteniendo tu estructura original de includes)
// Rutas a tus archivos (ajusta según tu estructura real)
require_once __DIR__ . '/src/Core/Database.php';
require_once __DIR__ . '/src/Utils/ValidationHelper.php';

// Models
require_once __DIR__ . '/src/Models/Habitacion.php';
require_once __DIR__ . '/src/Models/Usuario.php';
require_once __DIR__ . '/src/Models/Reserva.php';
require_once __DIR__ . '/src/Models/Notificacion.php';

// Repositories
require_once __DIR__ . '/src/Repositories/HabitacionRepository.php';
require_once __DIR__ . '/src/Repositories/UsuarioRepository.php';
require_once __DIR__ . '/src/Repositories/NotificacionRepository.php';
require_once __DIR__ . '/src/Repositories/ReservaRepository.php';

// NUEVOS ARCHIVOS DE CONTROLADOR/MIDDLEWARE
require_once __DIR__ . '/src/Controllers/AuthMiddleware.php';
require_once __DIR__ . '/src/Controllers/AuthController.php';
require_once __DIR__ . '/src/Controllers/UsuarioController.php';
require_once __DIR__ . '/src/Controllers/HabitacionController.php';
require_once __DIR__ . '/src/Controllers/ReservaController.php';


// 4. INICIALIZACIÓN DE REPOSITORIOS
$habitacionRepository = new HabitacionRepository();
$usuarioRepository = new UsuarioRepository();
$notificacionRepository = new NotificacionRepository();
$reservaRepository = new ReservaRepository($habitacionRepository, $usuarioRepository);


// 5. INICIALIZACIÓN DE CONTROLADORES (Inyección de Dependencias)
$authController = new AuthController($usuarioRepository);
$usuarioController = new UsuarioController($usuarioRepository, $reservaRepository, $notificacionRepository);
$habitacionController = new HabitacionController($habitacionRepository);
// ReservaController necesita 4 repositorios (Reservas, Habitación, Notificación y Usuario)
$reservaController = new ReservaController($reservaRepository, $habitacionRepository, $notificacionRepository, $usuarioRepository);

// 6. OBTENER DATOS DE LA SOLICITUD
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uriSegments = explode('/', trim($requestUri, '/'));
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Debug: Imprimir la URI para verificar
error_log("Request URI: " . $requestUri);
error_log("URI Segments: " . json_encode($uriSegments));

$resource = $uriSegments[0] ?? '';  // Cambiado de [1] a [0]
$id = $uriSegments[1] ?? null;       // Cambiado de [2] a [1]
$action = $uriSegments[2] ?? null;   // Cambiado de [3] a [2]

$input = json_decode(file_get_contents('php://input'), true);


// 7. ENRUTAMIENTO (Router Final)
switch ($resource) {
    case 'autenticacion':
        $authController->handleRequest($id, $input);
        break; 

    case 'usuarios':
        // **Ruta Protegida**: Autenticación requerida
        $auth = AuthMiddleware::authenticate();
        $usuarioController->handleRequest($requestMethod, $id, $input, $auth);
        break;

    case 'habitaciones':
        // **Ruta Parcialmente Protegida**: Manejo de permisos dentro del controlador
        $auth = AuthMiddleware::authenticate(true); // 'true' para permitir null si no hay token
        $habitacionController->handleRequest($requestMethod, $id, $action, $input, $auth);
        break;

    case 'reservas':
        // **Ruta Protegida**: Autenticación requerida
        $auth = AuthMiddleware::authenticate();
        $reservaController->handleRequest($requestMethod, $id, $input, $auth);
        break;
        
    case 'notificaciones':
        // **Ruta Protegida**: Autenticación requerida
        $auth = AuthMiddleware::authenticate();
        // Lógica simple, se puede extender a un NotificacionController si es más complejo
        if ($requestMethod === 'GET' && $id == $auth->id) { 
            handleGetUserNotifications($notificacionRepository, $id);
        }
        jsonResponse(['message' => 'Ruta de notificación no válida o acceso denegado'], 404);
        break;

    default:
        jsonResponse(['message' => 'Ruta no encontrada'], 404);
        break;
}