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
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

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


// api.php (Sección 4. INICIALIZACIÓN DE REPOSITORIOS)

$usuarioRepository = new UsuarioRepository();
$notificacionRepository = new NotificacionRepository();

// 1. Inicializamos HabitacionRepository (solo necesita NotificacionRepository)
// ¡CORREGIDO! Solo se pasa 1 argumento, evitando el TypeError.
$habitacionRepository = new HabitacionRepository($notificacionRepository); 

// 2. Inicializamos ReservaRepository (ahora HabitacionRepository ya existe)
$reservaRepository = new ReservaRepository($habitacionRepository, $usuarioRepository);

// 3. Rompemos la circularidad inyectando ReservaRepository en HabitacionRepository
$habitacionRepository->setReservaRepository($reservaRepository);
// 5. INICIALIZACIÓN DE CONTROLADORES (Inyección de Dependencias)
$authController = new AuthController($usuarioRepository);
$usuarioController = new UsuarioController($usuarioRepository, $reservaRepository, $notificacionRepository);
$habitacionController = new HabitacionController($habitacionRepository);
/// 6. OBTENER DATOS DE LA SOLICITUD
// 6. OBTENER DATOS DE LA SOLICITUD
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$requestMethod = $_SERVER['REQUEST_METHOD'];

// **[LÓGICA DE LIMPIEZA DE URI MÁS ROBUSTA]**

// 1. Obtiene la ruta base del script (ej: /mi-proyecto/api.php)
$scriptName = $_SERVER['SCRIPT_NAME'];
$path = $requestUri;

// 2. Intenta eliminar el prefijo de la ruta. Usamos strpos/substr para mayor precisión que str_replace simple.
// Esto maneja tanto /mi-proyecto/api.php/recurso como /api.php/recurso
$scriptPosition = strpos($path, $scriptName);
if ($scriptPosition === 0) {
    // Caso 1: La URI contiene la ruta completa del script
    $path = substr($path, strlen($scriptName));
} else {
    // Caso 2: Intenta eliminar solo el nombre del archivo (más común en servidores de desarrollo PHP)
    $scriptFileName = basename($scriptName);
    $scriptFilePosition = strpos($path, $scriptFileName);
    if ($scriptFilePosition !== false) {
        $path = substr($path, $scriptFilePosition + strlen($scriptFileName));
    }
}

// 3. Limpia las barras iniciales/finales y separa los segmentos.
$path = trim($path, '/');
$uriSegments = explode('/', $path);

// 4. Asigna las variables de enrutamiento.
// El primer segmento es el recurso (ej: 'autenticacion').
$resource = $uriSegments[0] ?? '';
$id = $uriSegments[1] ?? null; 
$action = $uriSegments[2] ?? null;

// Obtener el cuerpo de la petición (JSON)
$input = json_decode(file_get_contents('php://input'), true);

// Debug para revisar el valor del recurso (¡Revisa el log!)
error_log("Request URI: " . $requestUri);
error_log("Cleaned Resource: " . $resource);
error_log("Cleaned ID: " . $id);
error_log("Cleaned Action: " . $action);
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
        // **Ruta Parcialmente Protegida**: Permite peticiones sin token (AuthMiddleware::authenticate(true)) 
        // para, por ejemplo, listar habitaciones, pero protege las de modificación dentro del controlador.
        $auth = AuthMiddleware::authenticate(true);
        $habitacionController->handleRequest($requestMethod, $id, $action, $input, $auth);
        break;

    case 'reservas':
        // **Ruta Protegida**: Autenticación requerida
        $auth = AuthMiddleware::authenticate();
        $reservaController->handleRequest($requestMethod, $id, $input, $auth);
        break;

    case 'dashboard':
        // **Ruta Protegida**: Autenticación requerida
        $auth = AuthMiddleware::authenticate();
        
        // Asumiendo que has refactorizado obtenerTodosLosUsuarios a obtenerUsuarios en UsuarioRepository
        // y que obtenerTodasLasNotificaciones existe.
        if ($id === 'admin') {
            // Dashboard para admin
            $habitaciones = count($habitacionRepository->obtenerHabitaciones());
            $reservasActivas = count($reservaRepository->obtenerTodasLasReservas());
            $usuarios = count($usuarioRepository->obtenerUsuarios()); // Usar el método corregido
            $notificaciones = count($notificacionRepository->obtenerTodasLasNotificaciones());
            jsonResponse([
                'habitaciones' => $habitaciones,
                'reservasActivas' => $reservasActivas,
                'usuarios' => $usuarios,
                'notificaciones' => $notificaciones
            ]);
        } elseif ($id === 'user' && $action) {
            // Dashboard para usuario específico
            $userId = $action;
            // Nota: Estos métodos 'obtenerReservasActivasPorUsuarioId' deben existir en ReservaRepository
            $misReservas = count($reservaRepository->obtenerReservasPorUsuarioId($userId));
            // Este método asume que has definido un filtro para reservas 'activas'
            $activas = method_exists($reservaRepository, 'obtenerReservasActivasPorUsuarioId') 
                       ? count($reservaRepository->obtenerReservasActivasPorUsuarioId($userId)) 
                       : $misReservas; 

            jsonResponse([
                'misReservas' => $misReservas,
                'activas' => $activas
            ]);
        }
        // Si no coincide con las rutas de dashboard válidas
        jsonResponse(['message' => 'Ruta de dashboard no válida'], 404);
        break;
        
    case 'notificaciones':
        // **Ruta Protegida**: Autenticación requerida
        $auth = AuthMiddleware::authenticate();
        
        if ($requestMethod === 'GET' && $id == 'user' && $action == $auth->id) {
            // Llama a una función helper o al NotificacionController si existe
            handleGetUserNotifications($notificacionRepository, $auth->id);
        }

        // Si la solicitud es GET /notificaciones/{id_reserva}/leida (ejemplo de sub-recurso)
        if ($requestMethod === 'PUT' && is_numeric($id) && $action === 'leida') {
            // Esto requeriría lógica en NotificacionRepository para marcar como leída
            // $notificacionRepository->marcarComoLeida($id, $auth->id);
            // jsonResponse(['message' => 'Notificación marcada como leída.']);
        }
        
        jsonResponse(['message' => 'Ruta de notificación no válida o acceso denegado'], 404);
        break;

    default:
        jsonResponse(['message' => 'Ruta no encontrada'], 404);
        break;
}

// Función helper para notificaciones (si no hay un NotificacionController)
function handleGetUserNotifications($notificacionRepository, $userId) {
    // Asegúrate de que este método exista en NotificacionRepository
    $notificaciones = $notificacionRepository->obtenerNotificacionesPorUsuarioId($userId); 
    jsonResponse($notificaciones);
}