<?php

require_once __DIR__ . '/../Models/Habitacion.php';
require_once __DIR__ . '/../Core/Database.php';
require_once __DIR__ . '/NotificacionRepository.php';
require_once __DIR__ . '/ReservaRepository.php';

class HabitacionRepository 
{
    private $db;
    private $reservaRepository;
    private $notificacionRepository;

    /**
     * Constructor. Solo inyecta NotificacionRepository para evitar la circularidad.
     * La dependencia de ReservaRepository se inyectará después con setReservaRepository().
     */
    public function __construct(NotificacionRepository $notificacionRepository)
    {
        $this->db = Database::getInstance()->getConnection();
        $this->notificacionRepository = $notificacionRepository;
    }

    /**
     * Rompe la dependencia circular inyectando ReservaRepository después de la inicialización.
     */
    public function setReservaRepository(ReservaRepository $reservaRepository)
    {
        $this->reservaRepository = $reservaRepository;
    }

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

    public function obtenerHabitacionPorId($id)
    {
        $stmt = $this->db->prepare("SELECT id, numero, tipo, precio FROM habitaciones WHERE id = ?");
        $stmt->execute([$id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($data) {
            return new Habitacion($data['id'], $data['numero'], $data['tipo'], $data['precio']);
        }
        return null;
    }

    public function buscarHabitacionPorNumero($numero)
    {
        $stmt = $this->db->prepare("SELECT id, numero, tipo, precio FROM habitaciones WHERE numero = ?");
        $stmt->execute([$numero]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($data) {
            return new Habitacion($data['id'], $data['numero'], $data['tipo'], $data['precio']);
        }
        return null;
    }

    public function buscarPorTipo($tipo)
    {
        $stmt = $this->db->prepare("SELECT id, numero, tipo, precio FROM habitaciones WHERE tipo = ?");
        $stmt->execute([$tipo]);
        $habitacionesData = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $habitaciones = [];
        foreach ($habitacionesData as $data) {
            $habitaciones[] = new Habitacion($data['id'], $data['numero'], $data['tipo'], $data['precio']);
        }
        return $habitaciones;
    }

    public function actualizarHabitacion($id, $nuevosDatos)
    {
        $sql = "UPDATE habitaciones SET ";
        $updates = [];
        $params = [];

        if (isset($nuevosDatos['numero'])) {
            $updates[] = "numero = ?";
            $params[] = $nuevosDatos['numero'];
        }
        if (isset($nuevosDatos['tipo'])) {
            $updates[] = "tipo = ?";
            $params[] = $nuevosDatos['tipo'];
        }
        if (isset($nuevosDatos['precio'])) {
            $updates[] = "precio = ?";
            $params[] = $nuevosDatos['precio'];
        }

        if (empty($updates)) {
            return false;
        }

        $sql .= implode(", ", $updates) . " WHERE id = ?";
        $params[] = $id;

        $stmt = $this->db->prepare($sql);
        try {
            return $stmt->execute($params);
        } catch (PDOException $e) {
            error_log("Error al actualizar habitación: " . $e->getMessage());
            return false;
        }
    }

    //Elimina una habitación y cancela las reservas asociadas.
    public function eliminarHabitacion($habitacionNumero)
    {
        // Verificar que el Repositorio de Reservas haya sido inyectado
        if (!$this->reservaRepository) {
            error_log("Error: ReservaRepository no inyectado en HabitacionRepository.");
            return false;
        }

        // 1- Verificar que la habitacion existe y trae el id
        $habitacionExistente = $this->buscarHabitacionPorNumero($habitacionNumero);
        if (!$habitacionExistente) {
            error_log("Intento de eliminar habitación fallido: No existe habitación con número $habitacionNumero.");
            return false;
        }
        $habitacionId = $habitacionExistente->getId();

        // 2- Obtiene y elimina las reservas asociadas 
        $reservasAsociadas = $this->reservaRepository->obtenerReservasPorHabitacionId($habitacionId);

        foreach ($reservasAsociadas as $reserva) {
            $reservaId = $reserva->getId();
            $usuarioId = $reserva->getUsuarioId();
            
            // Crea notificación
            $mensaje = "Tu reserva (ID: {$reservaId}) para la habitación {$habitacionNumero} fue cancelada porque la habitación fue eliminada.";
            
            $this->notificacionRepository->guardarNotificacion(
                new Notificacion(null, $reservaId, $mensaje, $usuarioId)
            ); 

            // Elimina la reserva
            $this->reservaRepository->eliminarReserva($reservaId);
        }

        // 3- Elimina la habitación de la BD
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