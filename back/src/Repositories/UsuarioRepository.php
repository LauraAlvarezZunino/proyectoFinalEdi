<?php
// src/Repositories/UsuarioRepository.php

// Ajusta las rutas
require_once __DIR__ . '/../Models/Usuario.php';
require_once __DIR__ . '/../Core/Database.php';

class UsuarioRepository
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    // ===============================================
    // Métodos CRUD
    // ===============================================

    public function crearUsuario($nombreApellido, $dni, $email, $telefono, $clave)
    {
        // ¡IMPORTANTE! La clave debe ser hasheada antes de guardar en la BD
        $claveHasheada = password_hash($clave, PASSWORD_DEFAULT);

        // Los usuarios recién creados no son administradores (asume es_admin = 0)
        $stmt = $this->db->prepare("INSERT INTO usuarios (nombre_apellido, dni, email, telefono, clave, es_admin) VALUES (?, ?, ?, ?, ?, 0)");
        try {
            $success = $stmt->execute([
                $nombreApellido,
                $dni,
                $email,
                $telefono,
                $claveHasheada
            ]);
            
            if ($success) {
                $id = $this->db->lastInsertId();
                // Al crear, se sabe que es_admin es 0
                $usuario = new Usuario($id, $nombreApellido, $dni, $email, $telefono, $claveHasheada, 0); 
                return $usuario;
            }
            return false;
        } catch (PDOException $e) {
            error_log("Error al crear usuario: " . $e->getMessage());
            return false;
        }
    }

    public function obtenerUsuarios()
    {
        // ✅ CORREGIDO: Incluir 'es_admin' en el SELECT
        $stmt = $this->db->query("SELECT id, nombre_apellido, dni, email, telefono, clave, es_admin FROM usuarios");
        $usuariosData = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $usuarios = [];
        foreach ($usuariosData as $data) {
            $usuarios[] = new Usuario(
                $data['id'],
                $data['nombre_apellido'],
                $data['dni'],
                $data['email'],
                $data['telefono'],
                $data['clave'],
                $data['es_admin'] // ✅ CORREGIDO: Pasar 'es_admin' al constructor
            );
        }
        return $usuarios;
    }

    public function obtenerUsuarioPorId($id)
    {
        // ✅ CORREGIDO: Incluir 'es_admin' en el SELECT
        $stmt = $this->db->prepare("SELECT id, nombre_apellido, dni, email, telefono, clave, es_admin FROM usuarios WHERE id = ?");
        $stmt->execute([$id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($data) {
            return new Usuario(
                $data['id'],
                $data['nombre_apellido'],
                $data['dni'],
                $data['email'],
                $data['telefono'],
                $data['clave'],
                $data['es_admin'] // ✅ CORREGIDO: Pasar 'es_admin' al constructor
            );
        }
        return null;
    }

    public function obtenerUsuarioPorEmail($email)
    {
        // Ya incluía 'es_admin'
        $stmt = $this->db->prepare("SELECT id, nombre_apellido, dni, email, telefono, clave, es_admin FROM usuarios WHERE email = ?");
        $stmt->execute([$email]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($data) {
            // ✅ CORREGIDO: Usar el constructor con 'es_admin' directamente (se simplifica la lógica)
            return new Usuario(
                $data['id'],
                $data['nombre_apellido'],
                $data['dni'],
                $data['email'],
                $data['telefono'],
                $data['clave'],
                $data['es_admin'] 
            );
        }
        return null;
    }

    public function obtenerUsuarioPorDni($dni)
    {
        // ✅ CORREGIDO: Incluir 'es_admin' en el SELECT
        $stmt = $this->db->prepare("SELECT id, nombre_apellido, dni, email, telefono, clave, es_admin FROM usuarios WHERE dni = ?");
        $stmt->execute([$dni]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($data) {
            return new Usuario(
                $data['id'],
                $data['nombre_apellido'],
                $data['dni'],
                $data['email'],
                $data['telefono'],
                $data['clave'],
                $data['es_admin'] // ✅ CORREGIDO: Pasar 'es_admin' al constructor
            );
        }
        return null;
    }

    public function actualizarUsuario($id, $nuevosDatos)
    {
        $sql = "UPDATE usuarios SET ";
        $updates = [];
        $params = [];

        // Cambiado de 'nombre' a 'nombre_apellido' para ser consistente con la BD
        if (isset($nuevosDatos['nombre_apellido'])) { 
            $updates[] = "nombre_apellido = ?";
            $params[] = $nuevosDatos['nombre_apellido'];
        }
        if (isset($nuevosDatos['email'])) {
            $updates[] = "email = ?";
            $params[] = $nuevosDatos['email'];
        }
        if (isset($nuevosDatos['telefono'])) {
            $updates[] = "telefono = ?";
            $params[] = $nuevosDatos['telefono'];
        }
        if (isset($nuevosDatos['clave'])) {
            // ¡IMPORTANTE! Hashear la nueva clave
            $updates[] = "clave = ?";
            $params[] = password_hash($nuevosDatos['clave'], PASSWORD_DEFAULT);
        }
        // Si se permite actualizar el rol
        if (isset($nuevosDatos['es_admin'])) {
            $updates[] = "es_admin = ?";
            $params[] = $nuevosDatos['es_admin'];
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
            error_log("Error al actualizar usuario: " . $e->getMessage());
            return false;
        }
    }

    public function eliminarUsuario($id)
    {
        $stmt = $this->db->prepare("DELETE FROM usuarios WHERE id = ?");
        try {
            return $stmt->execute([$id]);
        } catch (PDOException $e) {
            error_log("Error al eliminar usuario: " . $e->getMessage());
            return false;
        }
    }

    public function autenticarUsuario($dni, $clave)
    {
        // Ya incluía 'es_admin'
        $stmt = $this->db->prepare("SELECT id, nombre_apellido, dni, email, telefono, clave, es_admin FROM usuarios WHERE dni = ?");
        $stmt->execute([$dni]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($data && password_verify($clave, $data['clave'])) {
            // Devuelve un objeto Usuario si las credenciales son correctas
            return new Usuario(
                $data['id'],
                $data['nombre_apellido'],
                $data['dni'],
                $data['email'],
                $data['telefono'],
                $data['clave'],
                $data['es_admin'] // Pasa es_admin al constructor
            );
        }

        return null;
    }
}