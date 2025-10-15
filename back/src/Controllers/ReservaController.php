<?php
// src/Controllers/ReservaController.php

class ReservaController {
    private $reservaRepository;
    private $habitacionRepository;
    private $notificacionRepository;
    
    // Asume que también necesitas el UsuarioRepository aquí para verificaciones
    private $usuarioRepository; 

    public function __construct(ReservaRepository $rRepo, HabitacionRepository $hRepo, NotificacionRepository $nRepo, UsuarioRepository $uRepo) {
        $this->reservaRepository = $rRepo;
        $this->habitacionRepository = $hRepo;
        $this->notificacionRepository = $nRepo;
        $this->usuarioRepository = $uRepo; // Agregado para consistencia y seguridad
    }

    /**
     * Maneja las peticiones al recurso /api/reservas.
     * @param object $auth Objeto de usuario autenticado.
     */
    public function handleRequest($method, $id, $input, $auth) {
        $loggedInUserId = $auth->id;
        $isAdmin = $auth->is_admin;

        switch ($method) {
            case 'POST':
                $this->createReservation($input, $loggedInUserId);
                break;

            case 'GET':
                if (!$id) {
                    // /api/reservas (Todas las reservas - solo Admin)
                    if (!$isAdmin) { jsonResponse(['message' => 'Acceso denegado.'], 403); }
                    $this->getAllReservations();
                } elseif (is_numeric($id)) {
                    // /api/reservas/{user_id} o /api/reservas/{reserva_id}
                    // Asumimos que $id aquí es el ID del usuario cuyas reservas se buscan
                    $this->getUserReservations($id, $loggedInUserId, $isAdmin);
                }
                break;
                
            case 'PUT':
                if ($id && is_numeric($id)) {
                    $this->updateReservation($id, $input, $loggedInUserId, $isAdmin);
                }
                break;
                
            case 'DELETE':
                if ($id && is_numeric($id)) {
                    $this->cancelReservation($id, $loggedInUserId, $isAdmin);
                }
                break;

            default:
                jsonResponse(['message' => 'Ruta de reserva no válida'], 404);
        }
    }

    // Lógica del handleCreateReservation original (mejorado)
    private function createReservation($data, $loggedInUserId) {
        $fechaInicio = $data['fechaInicio'] ?? null;
        $fechaFin = $data['fechaFin'] ?? null;
        $habitacionId = $data['habitacionId'] ?? null;
        // El usuarioId se toma del token, no del input, por seguridad
        $usuarioId = $loggedInUserId; 

        if (!ValidationHelper::isValidDateFormat($fechaInicio) || 
            !ValidationHelper::isValidDateFormat($fechaFin) ||
            !ValidationHelper::isEndDateAfterStartDate($fechaInicio, $fechaFin) ||
            !ValidationHelper::isValidNumeroEntero($habitacionId)) {
            jsonResponse(['error' => 'Datos de reserva incompletos o inválidos.'], 400);
        }

        $usuario = $this->usuarioRepository->obtenerUsuarioPorId($usuarioId);
        $habitacion = $this->habitacionRepository->obtenerHabitacionPorId($habitacionId);

        if (!$usuario || !$habitacion) {
            jsonResponse(['error' => 'Usuario o habitación no encontrados.'], 404);
        }

        // Cálculo de costo
        $inicio = new DateTime($fechaInicio);
        $fin = new DateTime($fechaFin);
        $dias = $inicio->diff($fin)->days;
        if ($dias <= 0) { jsonResponse(['error' => 'El rango de fechas no es válido.'], 400); }
        $costo = $habitacion->getPrecio() * $dias;

        // Crear la reserva
        $reserva = new Reserva(null, $fechaInicio, $fechaFin, $habitacion, $costo, $usuarioId);

        if ($this->reservaRepository->agregarReserva($reserva)) {
            $mensaje = "Tu reserva ID: {$reserva->getId()} para la habitación {$habitacion->getNumero()} ha sido creada. Costo total: $costo.";
            $notificacion = new Notificacion(null, $reserva->getId(), $mensaje, $usuarioId);
            $this->notificacionRepository->guardarNotificacion($notificacion);

            jsonResponse([
                'message' => 'Reserva creada exitosamente.',
                'id' => $reserva->getId(),
                'costo' => $costo
            ]);
        } else {
            jsonResponse(['error' => 'No se pudo crear la reserva. La habitación podría no estar disponible para esas fechas.'], 409);
        }
    }

    // Lógica del handleGetUserReservations original
    private function getUserReservations($targetUserId, $loggedInUserId, $isAdmin) {
        // Autorización: Solo el propio usuario o el admin puede ver estas reservas
        if ($targetUserId != $loggedInUserId && !$isAdmin) {
            jsonResponse(['message' => 'Acceso denegado. No tienes permisos.'], 403);
        }
        if (!ValidationHelper::isValidNumeroEntero($targetUserId)) {
            jsonResponse(['error' => 'ID de usuario inválido.'], 400);
        }

        $reservas = $this->reservaRepository->obtenerReservasPorUsuarioId($targetUserId);
        $data = array_map(function($r) {
            return [
                'id' => $r->getId(),
                'fechaInicio' => $r->getFechaInicio(),
                'fechaFin' => $r->getFechaFin(),
                'habitacion' => [
                    'id' => $r->getHabitacion()->getId(),
                    'numero' => $r->getHabitacion()->getNumero(),
                    'tipo' => $r->getHabitacion()->getTipo(),
                    'precio' => $r->getHabitacion()->getPrecio(),
                ],
                'costo' => $r->getCosto(),
                'usuarioId' => $r->getUsuarioId()
            ];
        }, $reservas);
        jsonResponse($data);
    }
    
    // Lógica del handleGetAllReservations original
    private function getAllReservations() {
        // La verificación de isAdmin ya ocurrió en handleRequest
        
        $reservas = $this->reservaRepository->obtenerTodasLasReservas(); 
        $data = array_map(function($r) {
            return [
                'id' => $r->getId(),
                'fechaInicio' => $r->getFechaInicio(),
                'fechaFin' => $r->getFechaFin(),
                'habitacion' => [
                    'id' => $r->getHabitacion()->getId(),
                    'numero' => $r->getHabitacion()->getNumero(),
                    'tipo' => $r->getHabitacion()->getTipo(),
                    'precio' => $r->getHabitacion()->getPrecio(),
                ],
                'costo' => $r->getCosto(),
                'usuarioId' => $r->getUsuarioId()
            ];
        }, $reservas);
        jsonResponse($data);
    }


    // Lógica del handleUpdateReservation original
    private function updateReservation($id, $data, $loggedInUserId, $isAdmin) {
        if (!ValidationHelper::isValidNumeroEntero($id)) { jsonResponse(['error' => 'ID de reserva inválido.'], 400); }

        $reserva = $this->reservaRepository->buscarReservaPorId($id);
        if (!$reserva) { jsonResponse(['error' => 'Reserva no encontrada.'], 404); }

        // Autorización: solo el dueño de la reserva o un admin
        if ($reserva->getUsuarioId() !== $loggedInUserId && !$isAdmin) {
             jsonResponse(['message' => 'Acceso denegado. No eres el dueño de esta reserva.'], 403);
        }

        $nuevaFechaInicio = $data['fechaInicio'] ?? $reserva->getFechaInicio();
        $nuevaFechaFin = $data['fechaFin'] ?? $reserva->getFechaFin();
        $nuevaHabitacionId = $data['habitacionId'] ?? $reserva->getHabitacion()->getId();
        $nuevoCosto = $data['costo'] ?? null; // Si se actualiza la fecha/habitación, se debe recalcular el costo

        if (!ValidationHelper::isValidDateFormat($nuevaFechaInicio) || !ValidationHelper::isValidDateFormat($nuevaFechaFin) ||
            !ValidationHelper::isEndDateAfterStartDate($nuevaFechaInicio, $nuevaFechaFin) ||
            !ValidationHelper::isValidNumeroEntero($nuevaHabitacionId)) {
            jsonResponse(['error' => 'Datos de actualización de reserva incompletos o inválidos.'], 400);
        }

        $nuevaHabitacion = $this->habitacionRepository->obtenerHabitacionPorId($nuevaHabitacionId);
        if (!$nuevaHabitacion) { jsonResponse(['error' => 'Nueva habitación no encontrada.'], 404); }
        
        // Recalcular costo si las fechas o la habitación cambian
        $inicio = new DateTime($nuevaFechaInicio);
        $fin = new DateTime($nuevaFechaFin);
        $dias = $inicio->diff($fin)->days;
        $costoFinal = $nuevaHabitacion->getPrecio() * $dias;


        if ($this->reservaRepository->modificarReserva($id, $nuevaFechaInicio, $nuevaFechaFin, $nuevaHabitacion, $costoFinal)) {
            $mensaje = "Tu reserva ID: {$id} ha sido modificada. Costo actualizado: {$costoFinal}.";
            $notificacion = new Notificacion(null, $id, $mensaje, $reserva->getUsuarioId());
            $this->notificacionRepository->guardarNotificacion($notificacion);
            jsonResponse(['message' => 'Reserva actualizada correctamente.', 'costo' => $costoFinal]);
        } else {
            jsonResponse(['error' => 'No se pudo actualizar la reserva o la habitación no está disponible.'], 409);
        }
    }

    // Lógica del handleCancelReservation original
    private function cancelReservation($id, $loggedInUserId, $isAdmin) {
        if (!ValidationHelper::isValidNumeroEntero($id)) { jsonResponse(['error' => 'ID de reserva inválido.'], 400); }

        $reserva = $this->reservaRepository->buscarReservaPorId($id);
        if (!$reserva) { jsonResponse(['error' => 'Reserva no encontrada.'], 404); }

        // Autorización: solo el dueño de la reserva o un admin
        if ($reserva->getUsuarioId() !== $loggedInUserId && !$isAdmin) {
             jsonResponse(['message' => 'Acceso denegado. No tienes permiso para cancelar esta reserva.'], 403);
        }

        if ($this->reservaRepository->eliminarReserva($id)) {
            $mensaje = "Tu reserva ID: {$id} ha sido cancelada.";
            $notificacion = new Notificacion(null, $id, $mensaje, $reserva->getUsuarioId());
            $this->notificacionRepository->guardarNotificacion($notificacion);
            jsonResponse(['message' => 'Reserva cancelada correctamente.']);
        } else {
            jsonResponse(['error' => 'No se pudo cancelar la reserva.'], 500);
        }
    }
}