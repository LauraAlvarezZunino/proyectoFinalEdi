<?php

// Asegúrate de incluir los modelos y Core/Database
require_once __DIR__ . '/../Models/Reserva.php';
require_once __DIR__ . '/../Models/Habitacion.php';
require_once __DIR__ . '/../Models/Usuario.php'; // Necesario para obtener usuario por ID
require_once __DIR__ . '/../Core/Database.php';

require_once __DIR__ . '/UsuarioRepository.php';
 require_once __DIR__ . '/HabitacionRepository.php';
class ReservaRepository
{
    private $db;
    private $habitacionRepository;
    private $usuarioRepository; // Necesitamos el usuarioRepository para buscar usuarios por ID

    public function __construct(HabitacionRepository $habitacionRepository, UsuarioRepository $usuarioRepository)
    {
        $this->db = Database::getInstance()->getConnection();
        $this->habitacionRepository = $habitacionRepository;
        $this->usuarioRepository = $usuarioRepository;
    }

    /**
     * Agrega una nueva reserva a la base de datos.
     * @param Reserva $reserva
     * @return bool
     */
    /*
     public function agregarReserva(Reserva $reserva)
    {
        // Primero, verificar si la habitación está disponible para las fechas dadas
        // Asumiendo que verificarDisponibilidad existe y ahora toma fechas y habitacion ID
        if (!$this->verificarDisponibilidad(
            $reserva->getHabitacion()->getId(), // Usar el ID de la habitación
            $reserva->getFechaInicio(),
            $reserva->getFechaFin(),
            null // No hay ID de reserva a ignorar en una nueva reserva
        )) {
            echo "La habitación no está disponible para las fechas seleccionadas.\\n";
            return false;
        }

        try {
            $stmt = $this->db->prepare("INSERT INTO reservas (fecha_inicio, fecha_fin, habitacion_id, costo, usuario_id, fecha_creacion) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([
                $reserva->getFechaInicio(),
                $reserva->getFechaFin(),
                $reserva->getHabitacion()->getId(), // Usar el ID de la habitación
                $reserva->getCosto(),
                $reserva->getUsuarioId() // Usar el ID del usuario
            ]);

            $reserva->setId($this->db->lastInsertId()); // Asignar el ID generado por la BD
            return true;
        } catch (PDOException $e) {
            echo "Error al agregar reserva: " . $e->getMessage() . "\\n";
            return false;
        }
    }
        */

        public function agregarReserva(Reserva $reserva)
        {
            if (!$this->verificarDisponibilidad(
                $reserva->getHabitacion()->getId(),
                $reserva->getFechaInicio(),
                $reserva->getFechaFin(),
                null
            )) {
                echo "La habitación no está disponible para las fechas seleccionadas.\n";
                return false;
            }
        
            try {
                // Calcular cantidad de días
                $fechaInicio = new DateTime($reserva->getFechaInicio());
                $fechaFin = new DateTime($reserva->getFechaFin());
                $dias = $fechaInicio->diff($fechaFin)->days;
        
                // Calcular costo
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
        
                $reserva->setId($this->db->lastInsertId());
                $reserva->setCosto($costo); // Guardamos también el costo en el objeto
                return true;
        
            } catch (PDOException $e) {
                echo "Error al agregar reserva: " . $e->getMessage() . "\n";
                return false;
            }
        }

    /**
     * Obtiene una reserva por su ID.
     * @param int $id
     * @return Reserva|null
     */
    public function buscarReservaPorId($id)
    {
        // Unimos con habitaciones para obtener los datos completos de la habitación
        $stmt = $this->db->prepare("SELECT r.id, r.fecha_check_in, r.fecha_check_out, r.costo, r.usuario_id, h.id AS habitacion_db_id, h.numero AS habitacion_numero, h.tipo AS habitacion_tipo, h.precio AS habitacion_precio FROM reservas r JOIN habitaciones h ON r.habitacion_id = h.id WHERE r.id = ?");
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
                $data['fecha_check_in'],
                $data['fecha_check_out'],
                $habitacion,
                $data['costo'],
                $data['usuario_id'] // Ahora usamos usuario_id
            );
        }
        return null;
    }

    /**
     * Modifica una reserva existente.
     * @param int $id
     * @param string $nuevaFechaInicio
     * @param string $nuevaFechaFin
     * @param Habitacion $nuevaHabitacion
     * @param float $nuevoCosto
     * @return bool
     */
    public function modificarReserva($id, $nuevaFechaInicio, $nuevaFechaFin, Habitacion $nuevaHabitacion, $nuevoCosto)
    {
        // Verificar disponibilidad con el ID de la nueva habitación
        if (!$this->verificarDisponibilidad(
            $nuevaHabitacion->getId(), // Usar el ID de la habitación
            $nuevaFechaInicio,
            $nuevaFechaFin,
            $id // Pasamos el ID de la reserva actual para ignorarla en la verificación
        )) {
            echo "La habitación seleccionada no está disponible para las nuevas fechas.\\n";
            return false;
        }

        try {
            $stmt = $this->db->prepare("UPDATE reservas SET fecha_check_in = ?, fecha_check_out = ?, habitacion_id = ?, costo = ? WHERE id = ?");
            $stmt->execute([
                $nuevaFechaInicio,
                $nuevaFechaFin,
                $nuevaHabitacion->getId(), // Usar el ID de la habitación
                $nuevoCosto,
                $id
            ]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            echo "Error al modificar reserva: " . $e->getMessage() . "\\n";
            return false;
        }
    }


    /**
     * Método nuevo: Obtiene todas las reservas asociadas a un ID de usuario.
     * @param int $usuarioId
     * @return Reserva[] Retorna un array de objetos Reserva.
     */
    public function obtenerReservasPorUsuarioId($usuarioId)
    {
        // Unimos con habitaciones para obtener los datos completos de la habitación
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
            // Reconstruir el objeto Habitacion
            $habitacion = new Habitacion(
                $data['habitacion_db_id'],
                $data['habitacion_numero'],
                $data['habitacion_tipo'],
                $data['habitacion_precio']
            );
    
            $reservas[] = new Reserva(
                $data['id'],
                $data['fecha_inicio'],  // corregido
                $data['fecha_fin'],     // corregido
                $habitacion,
                $data['costo'],
                $data['usuario_id']
            );
        }
        return $reservas;
    }
    /**
     * Elimina una reserva por su ID.
     * @param int $id
     * @return bool
     */
    public function eliminarReserva($id)
    {
        try {
            $stmt = $this->db->prepare("DELETE FROM reservas WHERE id = ?");
            $stmt->execute([$id]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            echo "Error al eliminar reserva: " . $e->getMessage() . "\\n";
            return false;
        }
    }

    /**
     * Verifica la disponibilidad de una habitación para un rango de fechas.
     * @param int $habitacionId El ID de la habitación a verificar.
     * @param string $fechaInicio La fecha de inicio de la posible reserva (YYYY-MM-DD).
     * @param string $fechaFin La fecha de fin de la posible reserva (YYYY-MM-DD).
     * @param int|null $reservaIdToIgnore Opcional: El ID de una reserva existente que debe ser ignorada (útil para modificaciones).
     * @return bool True si la habitación está disponible, false en caso contrario.
     */

     /* comento porque reemplazo por unafuncion que si toma correctamente los valores de la tabla de BD
    public function verificarDisponibilidad($habitacionId, $fechaInicio, $fechaFin, $reservaIdToIgnore = null)
    {
        $sql = "SELECT COUNT(*) FROM reservas
                WHERE habitacion_id = ?
                AND NOT (fecha_check_out <= ? OR fecha_check_in >= ?)";

        $params = [$habitacionId, $fechaInicio, $fechaFin];

        if ($reservaIdToIgnore !== null) {
            $sql .= " AND id != ?";
            $params[] = $reservaIdToIgnore;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $count = $stmt->fetchColumn();

        return $count == 0; // Si count es 0, significa que no hay reservas que se solapen
    }
        */

        public function verificarDisponibilidad($habitacionId, $fechaInicio, $fechaFin, $reservaId = null)
        {
            $query = "SELECT COUNT(*) FROM reservas 
                      WHERE habitacion_id = :habitacionId
                      AND (
                          (fecha_inicio <= :fechaFin AND fecha_fin >= :fechaInicio)
                      )";
        
            if ($reservaId) {
                $query .= " AND id != :reservaId";
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
        
            return $count == 0; // true = disponible, false = ocupada
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

    // ... cualquier otro método que tengas en ReservaRepository ...
}