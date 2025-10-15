<?php
// src/Controllers/AuthController.php

use \Firebase\JWT\JWT;

class AuthController {
    private $usuarioRepository;

    public function __construct(UsuarioRepository $uRepo) {
        $this->usuarioRepository = $uRepo;
    }

    public function handleRequest($id, $input) {
        switch ($id) {
            case 'registro':
                $this->register($input);
                break;
            case 'inicio-sesion':
                $this->login($input);
                break;
            default:
                jsonResponse(['message' => 'Ruta de autenticación no válida'], 404);
        }
    }

    // Lógica del handleRegister original
    public function register($data) {
        $nombreApellido = $data['nombreApellido'] ?? null;
        $dni = $data['dni'] ?? null;
        $email = $data['email'] ?? null;
        $telefono = $data['telefono'] ?? null;
        $clave = $data['clave'] ?? null;

        if (!ValidationHelper::isValidDni($dni) || !ValidationHelper::isValidEmail($email) || !ValidationHelper::isValidTelefono($telefono) || !ValidationHelper::isValidClave($clave) || empty($nombreApellido)) {
            jsonResponse(['error' => 'Datos de registro incompletos o inválidos.'], 400);
        }

        if ($this->usuarioRepository->obtenerUsuarioPorDni($dni) || $this->usuarioRepository->obtenerUsuarioPorEmail($email)) {
            jsonResponse(['error' => 'DNI o email ya registrados.'], 409);
        }

        if ($this->usuarioRepository->crearUsuario($nombreApellido, $dni, $email, $telefono, $clave)) {
            jsonResponse(['message' => 'Usuario registrado exitosamente.']);
        } else {
            jsonResponse(['error' => 'Error al registrar el usuario.'], 500);
        }
    }

    // Lógica del handleLogin original (¡con JWT!)
    public function login($data) {
        $dni = $data['dni'] ?? null;
        $clave = $data['clave'] ?? null;

        if (empty($dni) || empty($clave)) {
            jsonResponse(['error' => 'DNI y clave son requeridos.'], 400);
        }

        $usuario = $this->usuarioRepository->autenticarUsuario($dni, $clave);

        if ($usuario) {
            $issuedAt = time();
            $expirationTime = $issuedAt + (60 * 60 * 2); // 2 horas de validez
            
            $payload = [
                'iat' => $issuedAt,
                'exp' => $expirationTime,
                'data' => [
                    'id' => $usuario->getId(),
                    'is_admin' => $usuario->getEsAdmin()
                ]
            ];

            $jwt = JWT::encode($payload, JWT_SECRET_KEY, 'HS256');

            jsonResponse([
                'message' => 'Inicio de sesión exitoso.',
                'token' => $jwt,
                'user_id' => $usuario->getId(),
                'is_admin' => $usuario->getEsAdmin()
            ], 200);
        } else {
            jsonResponse(['error' => 'DNI o clave incorrectos.'], 401);
        }
    }
}