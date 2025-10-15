<?php

class Usuario
{
    protected $id; 
    protected $nombreApellido;
    protected $dni;
    protected $email;
    protected $telefono;
    protected $clave;
    private $esAdmin;

    public function __construct($id = null, $nombreApellido = null, $dni = null, $email = null, $telefono = null, $clave = null, $esAdmin = 0)
    {
        $this->id = $id;
        $this->nombreApellido = $nombreApellido;
        $this->dni = $dni;
        $this->email = $email;
        $this->telefono = $telefono;
        $this->clave = $clave;
        $this->esAdmin = isset($esAdmin) ? (bool)$esAdmin : false;
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

    public function getNombreApellido()
    {
        return $this->nombreApellido;
    }

    public function setNombreApellido($nombreApellido)
    {
        $this->nombreApellido = $nombreApellido;
    }

    public function getDni()
    {
        return $this->dni;
    }

    public function setDni($dni)
    {
        $this->dni = $dni;
    }

    public function getEmail()
    {
        return $this->email;
    }

    public function setEmail($email)
    {
        $this->email = $email;
    }

    public function getTelefono()
    {
        return $this->telefono;
    }

    public function setTelefono($telefono)
    {
        $this->telefono = $telefono;
    }

    public function getClave()
    {
        return $this->clave;
    }

    public function setClave($clave)
    {
        $this->clave = $clave;
    }
  public function getEsAdmin()
    {
        return $this->esAdmin;
    }

    public function setEsAdmin($esAdmin)
    {
        $this->esAdmin = (bool) $esAdmin;
    }
    public function __toString()
    {
        return 'ID: ' . $this->id . ', Nombre: ' . $this->nombreApellido . ', DNI: ' . $this->dni . ', Email: ' . $this->email . ', Teléfono: ' . $this->telefono;
    }
}