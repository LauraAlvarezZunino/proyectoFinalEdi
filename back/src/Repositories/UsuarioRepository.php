<?php
require_once __DIR__ . '/../Models/Usuario.php';
require_once __DIR__ . '/../Core/Database.php';

class UsuarioRepository
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function crearUsuario($nombreApellido, $dni, $email, $telefono, $clave)
    {
        $claveHasheada = password_hash($clave, PASSWORD_DEFAULT);
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
                $data['es_admin']
            );
        }
        return $usuarios;
    }

    public function obtenerUsuarioPorId($id)
    {
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
                $data['es_admin']
            );
        }
        return null;
    }

    public function obtenerUsuarioPorEmail($email)
    {
        $stmt = $this->db->prepare("SELECT id, nombre_apellido, dni, email, telefono, clave, es_admin FROM usuarios WHERE email = ?");
        $stmt->execute([$email]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($data) {
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
                $data['es_admin']
            );
        }
        return null;
    }

    public function actualizarUsuario($id, $nuevosDatos)
    {
        $sql = "UPDATE usuarios SET ";
        $updates = [];
        $params = [];

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
            // La clave ya viene hasheada desde el controlador
            $updates[] = "clave = ?";
            $params[] = $nuevosDatos['clave'];
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
                $data['es_admin']
            );
        }

        return null;
    }
}