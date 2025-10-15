<?php

// require_once 'Controlador/habitacionControlador.php'; // Esto es un require antiguo, ya no es necesario aquí

class Reserva
{
    private $id;
    private $fechaInicio;
    private $fechaFin;
    private Habitacion $habitacion;
    private $costo;
    private $usuarioId; // Cambiamos de $usuarioDni a $usuarioId

    public function __construct($id, $fechaInicio, $fechaFin, Habitacion $habitacion, $costo, $usuarioId) // Cambiar $usuarioDni por $usuarioId
    {
        $this->id = $id;
        $this->fechaInicio = $fechaInicio;
        $this->fechaFin = $fechaFin;
        $this->habitacion = $habitacion;
        $this->costo = $costo;
        $this->usuarioId = $usuarioId; // Asignar el nuevo campo
    }

    // Getters y Setters
    public function getId()
    {
        return $this->id;
    }

    public function setId($id)
    {
        $this->id = $id;
    }

    public function getFechaInicio()
    {
        return $this->fechaInicio;
    }

    public function setFechaInicio($fecha_inicio)
    {
        $this->fechaInicio = $fecha_inicio;
    }

    public function getFechaFin()
    {
        return $this->fechaFin;
    }

    public function setFechaFin($fechaFin)
    {
        $this->fechaFin = $fechaFin;
    }

    public function getCosto()
    {
        return $this->costo;
    }

    public function setCosto($costo)
    {
        $this->costo = $costo;
    }

    public function getHabitacion()
    {
        return $this->habitacion;
    }

    public function setHabitacion(Habitacion $habitacion)
    {
        $this->habitacion = $habitacion;
    }

    public function setUsuarioId($id) // Nuevo setter
    {
        $this->usuarioId = $id;
    }

    public function getUsuarioId() // Nuevo getter
    {
        return $this->usuarioId;
    }

    // El método toArray (si lo usas para JSON o logs) también debería cambiar
    public function reservaToArray($reserva)
    {
        return [
            'id' => $reserva->getId(),
            'Fecha inicio' => $reserva->getFechaInicio(),
            'Fecha fin' => $reserva->getFechaFin(),
            'Habitacion' => $reserva->getHabitacion()->getNumero(),
            'Costo' => $reserva->getCosto(),
            'Reservado por ID de Usuario' => $reserva->getUsuarioId(), // Cambiado aquí
        ];
    }
}