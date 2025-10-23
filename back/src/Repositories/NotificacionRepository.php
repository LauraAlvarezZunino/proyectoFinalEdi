<?php

require_once __DIR__ . '/../Models/Notificacion.php';
require_once __DIR__ . '/../Core/Database.php';

class NotificacionRepository
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Guarda una nueva notificación en la base de datos.
     * @param Notificacion $notificacion
     * @return bool
     */

    public function guardarNotificacion(Notificacion $notificacion)
    {
        try {
            $stmt = $this->db->prepare("INSERT INTO notificaciones (reserva_id, mensaje, usuario_id) VALUES (?, ?, ?)");
            $stmt->execute([
                $notificacion->getReservaId(),
                $notificacion->getMensaje(),
                $notificacion->getUsuarioId() // Usamos el ID del usuario
            ]);
            $notificacion->setId($this->db->lastInsertId()); // Asigna el ID generado
            return true;
        } catch (PDOException $e) {
            echo "Error al guardar notificación: " . $e->getMessage() . "\\n";
            return false;
        }
    }

    /**
     * Obtiene notificaciones por ID de usuario.
     * @param int $usuarioId
     * @return Notificacion[]
     */
    public function obtenerNotificacionesPorUsuarioId($usuarioId)
    {
        $stmt = $this->db->prepare("SELECT id, reserva_id, mensaje, usuario_id FROM notificaciones WHERE usuario_id = ? ORDER BY id DESC");
        $stmt->execute([$usuarioId]);
        $notificacionesData = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $notificaciones = [];
        foreach ($notificacionesData as $data) {
            $notificaciones[] = new Notificacion(
                $data['id'],
                $data['reserva_id'],
                $data['mensaje'],
                $data['usuario_id']
            );
        }
        return $notificaciones;
    }

    /**
     * Elimina notificaciones por ID de usuario.
     * @param int $usuarioId
     * @return bool
     */
    public function eliminarNotificacionesPorUsuarioId($usuarioId)
    {
        try {
            $stmt = $this->db->prepare("DELETE FROM notificaciones WHERE usuario_id = ?");
            $stmt->execute([$usuarioId]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            echo "Error al eliminar notificaciones: " . $e->getMessage() . "\\n";
            return false;
        }
    }

    public function mostrarNotificaciones($reservaId)
    {
        $stmt = $this->db->prepare("SELECT id, reserva_id, mensaje, usuario_id FROM notificaciones WHERE reserva_id = ? ORDER BY id DESC");
        $stmt->execute([$reservaId]);
        $notificacionesData = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $notificaciones = [];
        foreach ($notificacionesData as $data) {
            $notificaciones[] = new Notificacion(
                $data['id'],
                $data['reserva_id'],
                $data['mensaje'],
                $data['usuario_id']
            );
        }
        return $notificaciones;
    }
}