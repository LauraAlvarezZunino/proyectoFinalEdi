<?php
class Notificacion
{
    private $id; // Asumiendo que las notificaciones ahora tienen su propio ID en la DB
    private $reservaId;
    private $mensaje;
    private $usuarioId;  // Cambiado a usuarioId

    public function __construct($id, $reservaId, $mensaje, $usuarioId) // Añade $id y cambia $usuarioDni a $usuarioId
    {
        $this->id = $id;
        $this->reservaId = $reservaId;
        $this->mensaje = $mensaje;
        $this->usuarioId = $usuarioId;
    }

    public function getId()
    {
        return $this->id;
    }

    public function setId($id)
    {
        $this->id = $id;
    }

    public function getReservaId()
    {
        return $this->reservaId;
    }

    public function getMensaje()
    {
        return $this->mensaje;
    }

    public function getUsuarioId() // Nuevo getter
    {
        return $this->usuarioId;
    }

    public function setUsuarioId($usuarioId) // Nuevo setter
    {
        $this->usuarioId = $usuarioId;
    }

    public function toArray()
    {
        return [
            'id' => $this->id,
            'reserva_id' => $this->reservaId,
            'notificacion' => $this->mensaje,
            'usuario_id' => $this->usuarioId, // Cambiado aquí
        ];
    }
}