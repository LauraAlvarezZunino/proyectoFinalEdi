<?php

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
    // Métodos CRUD adaptados para MySQL
    // ===============================================

    public function crearUsuario($nombreApellido, $dni, $email, $telefono, $clave)
    {
        // ¡IMPORTANTE! La clave debe ser hasheada antes de guardar en la BD
        $claveHasheada = password_hash($clave, PASSWORD_DEFAULT);

        $stmt = $this->db->prepare("INSERT INTO usuarios (nombre_apellido, dni, email, telefono, clave) VALUES (?, ?, ?, ?, ?)");
        try {
            $success = $stmt->execute([
                $nombreApellido,
                $dni,
                $email,
                $telefono,
                $claveHasheada
            ]);
            // Si quieres devolver el objeto Usuario con el ID asignado
            if ($success) {
                $id = $this->db->lastInsertId();
                $usuario = new Usuario($id, $nombreApellido, $dni, $email, $telefono, $claveHasheada);
                return $usuario;
            }
            return false;
        } catch (PDOException $e) {
            error_log("Error al crear usuario: " . $e->getMessage());
            // Manejar error de DNI/email duplicado, etc.
            return false;
        }
    }

    // El método generarNuevoId() se vuelve obsoleto, la BD lo maneja con AUTO_INCREMENT

    public function obtenerUsuarios()
    {
        $stmt = $this->db->query("SELECT id, nombre_apellido, dni, email, telefono, clave FROM usuarios");
        $usuariosData = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $usuarios = [];
        foreach ($usuariosData as $data) {
            $usuario = new Usuario(
                $data['id'],
                $data['nombre_apellido'],
                $data['dni'],
                $data['email'],
                $data['telefono'],
                $data['clave']
            );
            $usuarios[] = $usuario;
        }
        return $usuarios;
    }

    public function obtenerUsuarioPorId($id)
    {
        $stmt = $this->db->prepare("SELECT id, nombre_apellido, dni, email, telefono, clave FROM usuarios WHERE id = ?");
        $stmt->execute([$id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($data) {
            return new Usuario(
                $data['id'],
                $data['nombre_apellido'],
                $data['dni'],
                $data['email'],
                $data['telefono'],
                $data['clave']
            );
        }
        return null;
    }

    /**
     * Obtiene un usuario por su dirección de email.
     * @param string $email
     * @return Usuario|null Retorna un objeto Usuario si se encuentra, o null en caso contrario.
     */
    public function obtenerUsuarioPorEmail($email)
    {
        $stmt = $this->db->prepare("SELECT id, nombre_apellido, dni, email, telefono, clave, es_admin FROM usuarios WHERE email = ?");
        $stmt->execute([$email]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($data) {
            $usuario = new Usuario(
                $data['id'],
                $data['nombre_apellido'],
                $data['dni'],
                $data['email'],
                $data['telefono'],
                $data['clave']
            );
            // Si tienes un campo 'es_admin' en tu tabla usuarios, asegúrate de setearlo
            if (isset($data['es_admin'])) {
                $usuario->setEsAdmin($data['es_admin']); // Asegúrate de tener un setter setEsAdmin en la clase Usuario
            }
            return $usuario;
        }
        return null;
    }

    public function obtenerUsuarioPorDni($dni)
    {
        $stmt = $this->db->prepare("SELECT id, nombre_apellido, dni, email, telefono, clave FROM usuarios WHERE dni = ?");
        $stmt->execute([$dni]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($data) {
            return new Usuario(
                $data['id'],
                $data['nombre_apellido'],
                $data['dni'],
                $data['email'],
                $data['telefono'],
                $data['clave']
            );
        }
        return null;
    }

    public function actualizarUsuario($id, $nuevosDatos)
    {
        $sql = "UPDATE usuarios SET ";
        $updates = [];
        $params = [];

        if (isset($nuevosDatos['nombre'])) { // En tu JSON era 'nombre', en DB es 'nombre_apellido'
            $updates[] = "nombre_apellido = ?";
            $params[] = $nuevosDatos['nombre'];
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

        if (empty($updates)) {
            return false; // No hay nada que actualizar
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
            $data['es_admin']  // Pasa es_admin al constructor
        );
    }

    // Si no coincide, devolvemos null
    return null;
}
   
}