<?php

class Habitacion
{
    protected $id; 
    protected $numero;
    protected $tipo;
    protected $precio;


    public function __construct($id = null, $numero = null, $tipo = null, $precio = null)
    {
        $this->id = $id; 
        $this->numero = $numero;
        $this->tipo = $tipo;
        $this->precio = $precio;
    }

    public function getId()
    {
        return $this->id;
    }

    public function setId($id)
    {
        $this->id = $id;
    }

    public function getNumero()
    {
        return $this->numero;
    }

    public function setNumero($numero)
    {
        $this->numero = $numero;
    }

    public function getTipo()
    {
        return $this->tipo;
    }

    public function setTipo($tipo)
    {
        $this->tipo = $tipo;
    }

    public function getPrecio()
    {
        return $this->precio;
    }

    public function setPrecio($precio)
    {
        $this->precio = $precio;
    }

    public function __toString()
    {
        return "Habitación ID: {$this->id}, Número: {$this->numero}, Tipo: {$this->tipo}, Precio: {$this->precio}";
    }
}