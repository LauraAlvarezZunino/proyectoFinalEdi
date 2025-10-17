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

        // Debug: Log the received data
        error_log("Registration data received: " . json_encode($data));

        if (!ValidationHelper::isValidDni($dni)) {
            error_log("Invalid DNI: $dni");
            jsonResponse(['error' => 'DNI inválido. Debe tener 7-8 dígitos.'], 400);
        }
        if (!ValidationHelper::isValidEmail($email)) {
            error_log("Invalid email: $email");
            jsonResponse(['error' => 'Email inválido.'], 400);
        }
        if (!ValidationHelper::isValidTelefono($telefono)) {
            error_log("Invalid telefono: $telefono");
            jsonResponse(['error' => 'Teléfono inválido. Debe tener 10-11 dígitos.'], 400);
        }
     // Si la validación es 4-8 alfanuméricos:
if (!ValidationHelper::isValidClave($clave)) {
    // 💡 Corregir el mensaje para que el frontend lo muestre
    jsonResponse(['error' => 'Clave inválida. Debe tener **exactamente** entre 4 y 8 caracteres, solo letras y números.'], 400);
}
        if (empty($nombreApellido)) {
            error_log("Empty nombreApellido");
            jsonResponse(['error' => 'Nombre y apellido son requeridos.'], 400);
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
        $email = $data['email'] ?? null;
        $clave = $data['clave'] ?? null;

        // Debug: Log the received login data
        error_log("Login data received: " . json_encode($data));

        if (empty($email) || empty($clave)) {
            jsonResponse(['error' => 'Email y clave son requeridos.'], 400);
        }

        // First get user by email, then verify password
        $usuario = $this->usuarioRepository->obtenerUsuarioPorEmail($email);
        error_log("User found: " . ($usuario ? 'yes' : 'no'));
        if ($usuario) {
            error_log("Stored hash: " . $usuario->getClave());
            error_log("Input clave: " . $clave);
            error_log("Password verify result: " . (password_verify($clave, $usuario->getClave()) ? 'true' : 'false'));
            error_log("User esAdmin: " . ($usuario->getEsAdmin() ? 'true' : 'false'));
        }
        if ($usuario && password_verify($clave, $usuario->getClave())) {
            error_log("Login successful, generating JWT");
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
            error_log("JWT generated successfully");

            $response = [
                'message' => 'Inicio de sesión exitoso.',
                'token' => $jwt,
                'user_id' => $usuario->getId(),
                'is_admin' => $usuario->getEsAdmin(),
                'nombre_apellido' => $usuario->getNombreApellido()
            ];
            error_log("Sending response: " . json_encode($response));
            jsonResponse($response, 200);
        } else {
            error_log("Login failed - user not found or password incorrect");
            jsonResponse(['error' => 'Email o clave incorrectos.'], 401);
        }
    }
}