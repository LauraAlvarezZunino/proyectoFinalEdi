<?php
// src/Controllers/AuthMiddleware.php

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

// Asume que jsonResponse() es global o incluido

class AuthMiddleware {
    
    /**
     * Verifica el token JWT en la cabecera Authorization.
     * * @param bool $optional Si es true, permite que la solicitud pase sin token y devuelve null.
     * @return object|null Objeto de datos del usuario si es exitoso, o null si $optional es true.
     */
    public static function authenticate(bool $optional = false): ?object
    {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            if ($optional) {
                return null;
            }
            jsonResponse(['error' => 'Token no proporcionado o formato inválido.'], 401); 
        }

        $jwt = $matches[1];

        try {
            $decoded = JWT::decode($jwt, new Key(JWT_SECRET_KEY, 'HS256'));
            // Devuelve el objeto de datos del usuario autenticado (id, is_admin)
            return $decoded->data; 

        } catch (\Firebase\JWT\ExpiredException $e) {
            jsonResponse(['error' => 'Token expirado.'], 401);
        } catch (\Exception $e) {
            jsonResponse(['error' => 'Token de autenticación inválido.'], 401);
        }
        return null; 
    }
}