<?php
// src/Controllers/UsuarioController.php

class UsuarioController {
    private $usuarioRepository;
    private $reservaRepository;
    private $notificacionRepository;
    
    public function __construct(UsuarioRepository $uRepo, ReservaRepository $rRepo, NotificacionRepository $nRepo) {
        $this->usuarioRepository = $uRepo;
        $this->reservaRepository = $rRepo;
        $this->notificacionRepository = $nRepo;
    }

    public function handleRequest($method, $id, $input, $auth) {
        $loggedInUserId = $auth->id;
        $isAdmin = $auth->is_admin;

        switch ($method) {
            case 'GET':
                if ($id) {
                    $this->getUser($id, $loggedInUserId, $isAdmin);
                } else {
                    // Nuevo: Obtener todos los usuarios (solo admin)
                    if (!$isAdmin) {
                        jsonResponse(['message' => 'Acceso denegado.'], 403);
                    }
                    $this->getAllUsers();
                }
                break;
            case 'PUT':
                $this->updateUser($id, $input, $loggedInUserId, $isAdmin);
                break;
            case 'DELETE':
                $this->deleteUser($id, $loggedInUserId, $isAdmin);
                break;
            default:
                jsonResponse(['message' => 'Método no permitido'], 405);
        }
    }

    // Lógica del handleGetUser original
    private function getUser($id, $loggedInUserId, $isAdmin) {
        // Autorización: Solo puede ver su propio perfil o si es admin
        if ($id != $loggedInUserId && !$isAdmin) {
            jsonResponse(['message' => 'Acceso denegado. No tienes permisos para ver este usuario.'], 403);
        }

        $usuario = $this->usuarioRepository->obtenerUsuarioPorId($id);

        if ($usuario) {
            // Se omiten datos sensibles como la clave hasheada
            jsonResponse([
                'id' => $usuario->getId(),
                'nombre_apellido' => $usuario->getNombreApellido(),
                'dni' => $usuario->getDni(),
                'email' => $usuario->getEmail(),
                'telefono' => $usuario->getTelefono(),
                'es_admin' => $usuario->getEsAdmin()
            ]);
        } else {
            jsonResponse(['error' => 'Usuario no encontrado.'], 404);
        }
    }

    // Lógica del handleUpdateUser original
    private function updateUser($id, $data, $loggedInUserId, $isAdmin) {
        if ($id != $loggedInUserId && !$isAdmin) {
            jsonResponse(['message' => 'Acceso denegado. No tienes permisos para editar este usuario.'], 403);
        }

        $usuarioExistente = $this->usuarioRepository->obtenerUsuarioPorId($id);
        if (!$usuarioExistente) {
            jsonResponse(['error' => 'Usuario no encontrado.'], 404);
        }

        $nuevosDatos = [];
        if (isset($data['nombreApellido'])) { $nuevosDatos['nombre_apellido'] = $data['nombreApellido']; }
        if (isset($data['telefono'])) {
            if (!ValidationHelper::isValidTelefono($data['telefono'])) { jsonResponse(['error' => 'Teléfono inválido.'], 400); }
            $nuevosDatos['telefono'] = $data['telefono'];
        }
        if (isset($data['email'])) {
            if (!ValidationHelper::isValidEmail($data['email'])) { jsonResponse(['error' => 'Email inválido.'], 400); }
            $existingUserWithEmail = $this->usuarioRepository->obtenerUsuarioPorEmail($data['email']);
            if ($existingUserWithEmail && $existingUserWithEmail->getId() != $id) { jsonResponse(['error' => 'El email ya está en uso por otro usuario.'], 409); }
            $nuevosDatos['email'] = $data['email'];
        }
        if (isset($data['clave'])) {
            if (!ValidationHelper::isValidClave($data['clave'])) { jsonResponse(['error' => 'La clave debe tener entre 4 y 8 caracteres y ser alfanumérica.'], 400); }
            $nuevosDatos['clave'] = password_hash($data['clave'], PASSWORD_DEFAULT);
        }
        // Agregar validación de esAdmin si es admin
        if (isset($data['esAdmin']) && $isAdmin) {
            $nuevosDatos['es_admin'] = $data['esAdmin'] ? 1 : 0;
        }

        if (empty($nuevosDatos)) { jsonResponse(['message' => 'No se proporcionaron datos para actualizar.'], 200); }

        if ($this->usuarioRepository->actualizarUsuario($id, $nuevosDatos)) {
            jsonResponse(['message' => 'Usuario actualizado correctamente.']);
        } else {
            jsonResponse(['error' => 'Error al actualizar el usuario.'], 500);
        }
    }

    // Lógica del handleDeleteUser original
    private function deleteUser($id, $loggedInUserId, $isAdmin) {
        if ($id != $loggedInUserId && !$isAdmin) {
            jsonResponse(['message' => 'Acceso denegado. No tienes permisos para eliminar este usuario.'], 403);
        }

        $usuario = $this->usuarioRepository->obtenerUsuarioPorId($id);
        if (!$usuario) { jsonResponse(['error' => 'Usuario no encontrado.'], 404); }

        if ($this->usuarioRepository->eliminarUsuario($id)) {
            // Opcional: limpiar dependencias si no usas CASCADE en la DB
            // $this->reservaRepository->eliminarReservasPorUsuarioId($id);
            // $this->notificacionRepository->eliminarNotificacionesPorUsuarioId($id);

            jsonResponse(['message' => 'Usuario eliminado correctamente.']);
        } else {
            jsonResponse(['error' => 'Error al eliminar el usuario.'], 500);
        }
    }

    // Nuevo método para obtener todos los usuarios (solo admin)
    private function getAllUsers() {
        $usuarios = $this->usuarioRepository->obtenerUsuarios();
        $data = array_map(function($u) {
            return [
                'id' => $u->getId(),
                'nombreApellido' => $u->getNombreApellido(),
                'dni' => $u->getDni(),
                'email' => $u->getEmail(),
                'telefono' => $u->getTelefono(),
                'esAdmin' => $u->getEsAdmin(),
                'estado' => 'Activo' // Asumiendo que todos están activos por defecto
            ];
        }, $usuarios);
        jsonResponse($data);
    }
}