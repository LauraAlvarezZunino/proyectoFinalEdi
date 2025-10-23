<?php

require_once __DIR__ . '/../Models/Reserva.php';
require_once __DIR__ . '/../Models/Habitacion.php';
require_once __DIR__ . '/../Models/Usuario.php'; 
require_once __DIR__ . '/../Core/Database.php';

require_once __DIR__ . '/UsuarioRepository.php';
require_once __DIR__ . '/HabitacionRepository.php';

class ReservaRepository
{
    private $db;
    private $habitacionRepository;
    private $usuarioRepository;

    public function __construct(HabitacionRepository $habitacionRepository, UsuarioRepository $usuarioRepository)
    {
        $this->db = Database::getInstance()->getConnection();
        $this->habitacionRepository = $habitacionRepository;
        $this->usuarioRepository = $usuarioRepository;
    }

    public function agregarReserva(Reserva $reserva)
    {
        // 1- Verifica disponibilidad
        if (!$this->verificarDisponibilidad(
            $reserva->getHabitacion()->getId(),
            $reserva->getFechaInicio(),
            $reserva->getFechaFin(),
            null
        )) {
            error_log("Intento de reserva fallido: La habitación no está disponible para las fechas seleccionadas."); 
            return false;
        }
        
        try {
            // Recalcular costo
            $fechaInicio = new DateTime($reserva->getFechaInicio());
            $fechaFin = new DateTime($reserva->getFechaFin());
            $dias = $fechaInicio->diff($fechaFin)->days;
            $costo = $reserva->getHabitacion()->getPrecio() * $dias;
        
            $stmt = $this->db->prepare("
                INSERT INTO reservas (fecha_inicio, fecha_fin, habitacion_id, costo, usuario_id, fecha_creacion) 
                VALUES (?, ?, ?, ?, ?, NOW())
            ");
            $stmt->execute([
                $reserva->getFechaInicio(),
                $reserva->getFechaFin(),
                $reserva->getHabitacion()->getId(),
                $costo,
                $reserva->getUsuarioId()
            ]);
        
            // 2- Asignar el ID y el costo calculado al objeto Reserva
            $reserva->setId($this->db->lastInsertId());
            $reserva->setCosto($costo);
            return true;
        
        } catch (PDOException $e) {
            error_log("Error al agregar reserva: " . $e->getMessage());
            return false;
        }
    }
    
    public function buscarReservaPorId($id)
    {
        $stmt = $this->db->prepare("
            SELECT r.id, r.fecha_inicio, r.fecha_fin, r.costo, r.usuario_id, 
                   h.id AS habitacion_db_id, h.numero AS habitacion_numero, 
                   h.tipo AS habitacion_tipo, h.precio AS habitacion_precio 
            FROM reservas r 
            JOIN habitaciones h ON r.habitacion_id = h.id 
            WHERE r.id = ?
        ");
        $stmt->execute([$id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($data) {
            $habitacion = new Habitacion(
                $data['habitacion_db_id'],
                $data['habitacion_numero'],
                $data['habitacion_tipo'],
                $data['habitacion_precio']
            );
            return new Reserva(
                $data['id'],
                $data['fecha_inicio'],
                $data['fecha_fin'],
                $habitacion,
                $data['costo'],
                $data['usuario_id']
            );
        }
        return null;
    }

    public function obtenerReservasPorUsuarioId($usuarioId)
    {
        $stmt = $this->db->prepare("
            SELECT r.id, r.fecha_inicio, r.fecha_fin, r.costo, r.usuario_id,
                   h.id AS habitacion_db_id, h.numero AS habitacion_numero,
                   h.tipo AS habitacion_tipo, h.precio AS habitacion_precio
            FROM reservas r
            JOIN habitaciones h ON r.habitacion_id = h.id
            WHERE r.usuario_id = ?
        ");
        $stmt->execute([$usuarioId]);
        $reservasData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
        $reservas = [];
        foreach ($reservasData as $data) {
            $habitacion = new Habitacion(
                $data['habitacion_db_id'],
                $data['habitacion_numero'],
                $data['habitacion_tipo'],
                $data['habitacion_precio']
            );
    
            $reservas[] = new Reserva(
                $data['id'],
                $data['fecha_inicio'],
                $data['fecha_fin'],
                $habitacion,
                $data['costo'],
                $data['usuario_id']
            );
        }
        return $reservas;
    }

    public function obtenerTodasLasReservas()
    {
        $stmt = $this->db->prepare("SELECT r.id, r.fecha_inicio, r.fecha_fin, r.costo, r.usuario_id,
                                           h.id AS habitacion_db_id, h.numero AS habitacion_numero, 
                                           h.tipo AS habitacion_tipo, h.precio AS habitacion_precio
                                    FROM reservas r
                                    JOIN habitaciones h ON r.habitacion_id = h.id");
        $stmt->execute();
        $reservasData = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $reservas = [];
        foreach ($reservasData as $data) {
            $habitacion = new Habitacion(
                $data['habitacion_db_id'],
                $data['habitacion_numero'],
                $data['habitacion_tipo'],
                $data['habitacion_precio']
            );

            $reservas[] = new Reserva(
                $data['id'],
                $data['fecha_inicio'],
                $data['fecha_fin'],
                $habitacion,
                $data['costo'],
                $data['usuario_id']
            );
        }
        return $reservas;
    }

    public function modificarReserva($id, $nuevaFechaInicio, $nuevaFechaFin, Habitacion $nuevaHabitacion, $nuevoCosto)
    {
        // 1- Verificar disponibilidad (ignorando la reserva que estamos modificando)
        if (!$this->verificarDisponibilidad(
            $nuevaHabitacion->getId(),
            $nuevaFechaInicio,
            $nuevaFechaFin,
            $id
        )) {
            error_log("Intento de modificación fallido: La habitación no está disponible para las nuevas fechas."); // Usar error_log
            return false;
        }

        try {
            $stmt = $this->db->prepare("UPDATE reservas SET fecha_inicio = ?, fecha_fin = ?, habitacion_id = ?, costo = ? WHERE id = ?");
            $stmt->execute([
                $nuevaFechaInicio,
                $nuevaFechaFin,
                $nuevaHabitacion->getId(),
                $nuevoCosto,
                $id
            ]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error al modificar reserva: " . $e->getMessage());
            return false;
        }
    }

    public function eliminarReserva($id)
    {
        try {
            $stmt = $this->db->prepare("DELETE FROM reservas WHERE id = ?");
            $stmt->execute([$id]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error al eliminar reserva: " . $e->getMessage()); // Usar error_log
            return false;
        }
    }

    public function verificarDisponibilidad($habitacionId, $fechaInicio, $fechaFin, $reservaId = null)
    {
        // Lógica de solapamiento de rangos de fechas
        $query = "SELECT COUNT(*) FROM reservas 
                  WHERE habitacion_id = :habitacionId
                  AND (
                      (fecha_inicio <= :fechaFin AND fecha_fin >= :fechaInicio)
                  )";
    
        if ($reservaId) {
            $query .= " AND id != :reservaId"; // Ignorar la reserva actual si estamos modificando
        }
    
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':habitacionId', $habitacionId, PDO::PARAM_INT);
        $stmt->bindParam(':fechaInicio', $fechaInicio);
        $stmt->bindParam(':fechaFin', $fechaFin);
    
        if ($reservaId) {
            $stmt->bindParam(':reservaId', $reservaId, PDO::PARAM_INT);
        }
    
        $stmt->execute();
        $count = $stmt->fetchColumn();
    
        return $count == 0;
    }
}