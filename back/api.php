<?php

// Autoload de composer
require_once __DIR__ . '/vendor/autoload.php';
 
// Configuracion inicial y cors
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Clave secreta para JWT, lo ambia por una cadena larga y unica
define('JWT_SECRET_KEY', 'La_Clave_Secreta_Para_Firmar_Tokens_JWT_Aqui'); 

// Cabeceras CORS (Configuradas para aceptar desde cualquier origen en desarrollo)
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// Función de ayuda para enviar respuestas JSON
function jsonResponse($data, $statusCode = 200)
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    jsonResponse(null, 204); // 204 No Content
}

// Requires e inicializacion de clases
require_once __DIR__ . '/src/Core/Database.php';
require_once __DIR__ . '/src/Utils/ValidationHelper.php';

require_once __DIR__ . '/src/Models/Habitacion.php';
require_once __DIR__ . '/src/Models/Usuario.php';
require_once __DIR__ . '/src/Models/Reserva.php';
require_once __DIR__ . '/src/Models/Notificacion.php';

require_once __DIR__ . '/src/Repositories/HabitacionRepository.php';
require_once __DIR__ . '/src/Repositories/UsuarioRepository.php';
require_once __DIR__ . '/src/Repositories/NotificacionRepository.php';
require_once __DIR__ . '/src/Repositories/ReservaRepository.php';

require_once __DIR__ . '/src/Controllers/AuthMiddleware.php';
require_once __DIR__ . '/src/Controllers/AuthController.php';
require_once __DIR__ . '/src/Controllers/UsuarioController.php';
require_once __DIR__ . '/src/Controllers/HabitacionController.php';
require_once __DIR__ . '/src/Controllers/ReservaController.php';


// Inicializacion de repositorios
$usuarioRepository = new UsuarioRepository();
$notificacionRepository = new NotificacionRepository();
$habitacionRepository = new HabitacionRepository($notificacionRepository); 
$reservaRepository = new ReservaRepository($habitacionRepository, $usuarioRepository);

// Inyectamos ReservaRepository en HabitacionRepository
$habitacionRepository->setReservaRepository($reservaRepository);

// Inicializacion de controladores
$authController = new AuthController($usuarioRepository);
$usuarioController = new UsuarioController($usuarioRepository, $reservaRepository, $notificacionRepository);
$habitacionController = new HabitacionController($habitacionRepository);
$reservaController = new ReservaController($reservaRepository, $habitacionRepository, $notificacionRepository, $usuarioRepository);

// Debug logs to validate controller instantiation
error_log("Controllers initialized: auth=" . (isset($authController) ? 'yes' : 'no') . ", usuario=" . (isset($usuarioController) ? 'yes' : 'no') . ", habitacion=" . (isset($habitacionController) ? 'yes' : 'no') . ", reserva=" . (isset($reservaController) ? 'yes' : 'no'));

// Obtener datos de la solicitud
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Se obtiene la ruta base del script
$scriptName = $_SERVER['SCRIPT_NAME'];
$path = $requestUri;

// 2. Intenta eliminar el prefijo de la ruta. Usamos strpos/substr
$scriptPosition = strpos($path, $scriptName);
if ($scriptPosition === 0) {
    // La URI contiene la ruta completa del script
    $path = substr($path, strlen($scriptName));
} else {
    // Intenta eliminar solo el nombre del archivo
    $scriptFileName = basename($scriptName);
    $scriptFilePosition = strpos($path, $scriptFileName);
    if ($scriptFilePosition !== false) {
        $path = substr($path, $scriptFilePosition + strlen($scriptFileName));
    }
}

// Limpia las barras iniciales/finales y separa los segmentos
$path = trim($path, '/');
$uriSegments = explode('/', $path);

// Asigna las variables de enrutamiento, el primer segmento es el recurso (ej: 'autenticacion')
$resource = $uriSegments[0] ?? '';
$id = $uriSegments[1] ?? null; 
$action = $uriSegments[2] ?? null;

// Obtener el cuerpo de la petición (JSON)
$input = json_decode(file_get_contents('php://input'), true);

// Debug para revisar el valor del recurso
//error_log("Request URI: " . $requestUri);
//error_log("Cleaned Resource: " . $resource);
//error_log("Cleaned ID: " . $id);
//error_log("Cleaned Action: " . $action);

// Enrutamiento
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
        // para, por ejemplo, listar habitaciones, pero protege las de modificación dentro del controlador
        $auth = AuthMiddleware::authenticate(true);
        $habitacionController->handleRequest($requestMethod, $id, $action, $input, $auth);
        break;

    case 'reservas':
        // **Ruta Protegida**: Autenticación requerida
        $auth = AuthMiddleware::authenticate();
        error_log("Handling reservas request: method=$requestMethod, id=$id, auth_id=" . ($auth ? $auth->id : 'null'));
        $reservaController->handleRequest($requestMethod, $id, $input, $auth);
        break;

    case 'dashboard':
        // **Ruta Protegida**: Autenticación requerida
        $auth = AuthMiddleware::authenticate();
        
        if ($id === 'admin') {
            // Dashboard para admin
            $habitaciones = count($habitacionRepository->obtenerHabitaciones());
            $reservasActivas = count($reservaRepository->obtenerTodasLasReservas());
            $usuarios = count($usuarioRepository->obtenerUsuarios());
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
            $misReservas = count($reservaRepository->obtenerReservasPorUsuarioId($userId));
            // El método asume que se definio un filtro para reservas 'activas'
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

// Función helper para notificaciones
function handleGetUserNotifications($notificacionRepository, $userId) {
    $notificaciones = $notificacionRepository->obtenerNotificacionesPorUsuarioId($userId); 
    jsonResponse($notificaciones);
}