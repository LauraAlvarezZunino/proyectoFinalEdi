<?php
// src/Repositories/HabitacionRepository.php

require_once __DIR__ . '/../Models/Habitacion.php';
require_once __DIR__ . '/../Core/Database.php';
require_once __DIR__ . '/NotificacionRepository.php';
require_once __DIR__ . '/ReservaRepository.php';

class HabitacionRepository 
{
    private $db;
    private $reservaRepository; // Se inyectará vía setter
    private $notificacionRepository;

    /**
     * Constructor. Solo inyecta NotificacionRepository para evitar la circularidad.
     * La dependencia de ReservaRepository se inyectará después con setReservaRepository().
     */
    public function __construct(NotificacionRepository $notificacionRepository)
    {
        $this->db = Database::getInstance()->getConnection();
        $this->notificacionRepository = $notificacionRepository;
        // $this->reservaRepository = null; // Inicialmente es null
    }

    /**
     * Rompe la dependencia circular inyectando ReservaRepository después de la inicialización.
     */
    public function setReservaRepository(ReservaRepository $reservaRepository)
    {
        $this->reservaRepository = $reservaRepository;
    }

    // ===============================================
    // Métodos CRUD
    // ===============================================

    public function agregarHabitacion(Habitacion $habitacion)
    {
        $stmt = $this->db->prepare("INSERT INTO habitaciones (numero, tipo, precio) VALUES (?, ?, ?)");
        try {
            $success = $stmt->execute([
                $habitacion->getNumero(),
                $habitacion->getTipo(),
                $habitacion->getPrecio()
            ]);
            if ($success) {
                $habitacion->setId($this->db->lastInsertId()); 
            }
            return $success;
        } catch (PDOException $e) {
            error_log("Error al agregar habitación: " . $e->getMessage());
            return false;
        }
    }

    public function obtenerHabitaciones()
    {
        $stmt = $this->db->query("SELECT id, numero, tipo, precio FROM habitaciones");
        $habitacionesData = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $habitaciones = [];
        foreach ($habitacionesData as $data) {
            $habitaciones[] = new Habitacion($data['id'], $data['numero'], $data['tipo'], $data['precio']);
        }
        return $habitaciones;
    }
    
    // ... (Se asumen los métodos: buscarHabitacionPorNumero, buscarPorTipo, obtenerHabitacionPorId, actualizarHabitacion) ...

    /**
     * Elimina una habitación y cancela las reservas asociadas.
     */
    public function eliminarHabitacion($habitacionNumero)
    {
        // Verificar que el Repositorio de Reservas haya sido inyectado
        if (!$this->reservaRepository) {
            error_log("Error: ReservaRepository no inyectado en HabitacionRepository.");
            return false;
        }

        // 1. Verificar si la habitación existe y obtener su ID
        $habitacionExistente = $this->buscarHabitacionPorNumero($habitacionNumero);
        if (!$habitacionExistente) {
            error_log("Intento de eliminar habitación fallido: No existe habitación con número $habitacionNumero.");
            return false;
        }
        $habitacionId = $habitacionExistente->getId();

        // 2. Obtener y eliminar reservas asociadas 
        $reservasAsociadas = $this->reservaRepository->obtenerReservasPorHabitacionId($habitacionId);

        foreach ($reservasAsociadas as $reserva) {
            $reservaId = $reserva->getId();
            $usuarioId = $reserva->getUsuarioId();
            
            // Crear notificación
            $mensaje = "Tu reserva (ID: {$reservaId}) para la habitación {$habitacionNumero} fue cancelada porque la habitación fue eliminada.";
            
            $this->notificacionRepository->guardarNotificacion(
                new Notificacion(null, $reservaId, $mensaje, $usuarioId)
            ); 

            // Eliminar la reserva
            $this->reservaRepository->eliminarReserva($reservaId);
        }

        // 3. Eliminar la habitación de la BD
        $stmt = $this->db->prepare("DELETE FROM habitaciones WHERE id = ?");
        try {
            $success = $stmt->execute([$habitacionId]);
            return $success && $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error fatal al eliminar habitación: " . $e->getMessage());
            return false;
        }
    }
}