<?php
// src/Controllers/HabitacionController.php

class HabitacionController {
    private $habitacionRepository;

    public function __construct(HabitacionRepository $hRepo) {
        $this->habitacionRepository = $hRepo;
    }

    /**
     * Maneja las peticiones al recurso /api/habitaciones.
     * @param object|null $auth Objeto de usuario autenticado o null si no hay token (para rutas GET públicas).
     */
    public function handleRequest($method, $id, $action, $input, $auth) {
        // La información del administrador se obtiene del objeto de autenticación
        $isAdmin = $auth->is_admin ?? false; 

        switch ($method) {
            case 'GET':
                if ($id === 'por-tipo' && $action) {
                    $this->getRoomsByType($action);
                } elseif ($id && is_numeric($id)) {
                    $this->getRoomById($id);
                } else {
                    $this->getAllRooms();
                }
                break;

            case 'POST':
                if (!$isAdmin) {
                    jsonResponse(['error' => 'Acceso denegado. Se requieren permisos de administrador.'], 403);
                }
                $this->createRoom($input);
                break;

            case 'DELETE':
                if (!$isAdmin) {
                    jsonResponse(['error' => 'Acceso denegado. Se requieren permisos de administrador.'], 403);
                }
                if ($id && is_numeric($id)) {
                    $this->deleteRoom($id);
                }
                jsonResponse(['message' => 'Ruta de eliminación de habitación no válida'], 404);
                break;
                
            default:
                jsonResponse(['message' => 'Método no permitido'], 405);
        }
    }

    // Lógica del handleGetAllRooms original
    private function getAllRooms() {
        $habitaciones = $this->habitacionRepository->obtenerHabitaciones();
        $data = array_map(function($h) {
            return ['id' => $h->getId(), 'numero' => $h->getNumero(), 'tipo' => $h->getTipo(), 'precio' => $h->getPrecio()];
        }, $habitaciones);
        jsonResponse($data);
    }

    // Lógica del handleGetRoomById original
    private function getRoomById($id) {
        $habitacion = $this->habitacionRepository->obtenerHabitacionPorId($id);
        if ($habitacion) {
            jsonResponse(['id' => $habitacion->getId(), 'numero' => $habitacion->getNumero(), 'tipo' => $habitacion->getTipo(), 'precio' => $habitacion->getPrecio()]);
        } else {
            jsonResponse(['error' => 'Habitación no encontrada.'], 404);
        }
    }

    // Lógica del handleGetRoomsByType original
    private function getRoomsByType($type) {
        if (!ValidationHelper::isValidTipoHabitacion($type)) {
            jsonResponse(['error' => 'Tipo de habitación inválido.'], 400);
        }
        $habitaciones = $this->habitacionRepository->buscarPorTipo($type);
        $data = array_map(function($h) {
            return ['id' => $h->getId(), 'numero' => $h->getNumero(), 'tipo' => $h->getTipo(), 'precio' => $h->getPrecio()];
        }, $habitaciones);
        jsonResponse($data);
    }

    // Lógica del handleCreateRoom original
    private function createRoom($data) {
        $numero = $data['numero'] ?? null;
        $tipo = $data['tipo'] ?? null;
        $precio = $data['precio'] ?? null;

        if (!ValidationHelper::isValidNumeroEntero($numero) || !ValidationHelper::isValidTipoHabitacion($tipo) || !ValidationHelper::isValidPrecio($precio)) {
            jsonResponse(['error' => 'Datos de habitación incompletos o inválidos.'], 400);
        }

        if ($this->habitacionRepository->buscarHabitacionPorNumero($numero)) {
            jsonResponse(['error' => 'El número de habitación ya existe.'], 409);
        }

        $habitacion = new Habitacion(null, $numero, $tipo, $precio);
        if ($this->habitacionRepository->agregarHabitacion($habitacion)) {
            jsonResponse(['message' => 'Habitación creada correctamente.', 'id' => $habitacion->getId()]);
        } else {
            jsonResponse(['error' => 'Error al crear la habitación.'], 500);
        }
    }

    // Lógica del handleDeleteRoom original
    private function deleteRoom($id) {
        if (!ValidationHelper::isValidNumeroEntero($id)) {
            jsonResponse(['error' => 'ID de habitación inválido.'], 400);
        }

        if ($this->habitacionRepository->eliminarHabitacion($id)) {
            jsonResponse(['message' => 'Habitación eliminada correctamente.']);
        } else {
            jsonResponse(['error' => 'Error al eliminar la habitación. Podría tener reservas asociadas.'], 409);
        }
    }
}