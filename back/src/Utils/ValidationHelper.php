<?php

class ValidationHelper
{
    /**
     * Valida si un tipo de habitación es 'simple', 'doble' o 'familiar'.
     * @param string $tipo
     * @return bool
     */
    public static function isValidTipoHabitacion($tipo)
    {
        return preg_match('/^(simple|doble|familiar)$/i', $tipo);
    }

    /**
     * Valida si un precio es un número entero positivo.
     * @param mixed $precio
     * @return bool
     */
    public static function isValidPrecio($precio)
    {
        return preg_match('/^\\d+$/', (string)$precio);
    }

    /**
     * Valida si un número es un entero positivo.
     * @param mixed $numero
     * @return bool
     */
    public static function isValidNumeroEntero($numero)
    {
        return preg_match('/^\\d+$/', (string)$numero);
    }

    /**
     * Valida si un DNI tiene entre 7 y 8 dígitos.
     * @param string $dni
     * @return bool
     */
    public static function isValidDni($dni)
    {
        if (!is_string($dni) || $dni === null) {
            return false;
        }
        return preg_match('/^\\d{7,8}$/', $dni);
    }

    /**
     * Valida si un email tiene un formato válido.
     * @param string $email
     * @return bool
     */
    public static function isValidEmail($email)
    {
        if (!is_string($email) || $email === null) {
            return false;
        }
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    /**
     * Valida si un teléfono tiene 10 u 11 dígitos.
     * @param string $telefono
     * @return bool
     */
    public static function isValidTelefono($telefono)
    {
        if (!is_string($telefono) || $telefono === null) {
            return false;
        }
        return preg_match("/^\\d{10,11}$/", $telefono);
    }

    public static function isValidClave($clave)
    {
        if (!is_string($clave) || $clave === null) {
            return false;
        }

        // Longitud entre 6 y 20 caracteres
        if (strlen($clave) < 6 || strlen($clave) > 20) {
            return false;
        }

        return true;
    }
    /**
     * Valida si una fecha tiene el formato YYYY-MM-DD.
     * @param string $date
     * @return bool
     */
    public static function isValidDateFormat($date)
    {
        $d = DateTime::createFromFormat('Y-m-d', $date);
        return $d && $d->format('Y-m-d') === $date;
    }

    /**
     * Valida si una fecha es posterior o igual a la fecha actual.
     * @param string $date
     * @return bool
     */
    public static function isFutureOrPresentDate($date)
    {
        if (!self::isValidDateFormat($date)) {
            return false;
        }
        $today = new DateTime();
        $inputDate = new DateTime($date);
        // Usamos setTime(0,0,0) para comparar solo las fechas, ignorando la hora
        return $inputDate->setTime(0,0,0) >= $today->setTime(0,0,0);
    }

    /**
     * Valida si la fecha de fin es posterior a la fecha de inicio.
     * @param string $fechaInicio
     * @param string $fechaFin
     * @return bool
     */
    public static function isEndDateAfterStartDate($fechaInicio, $fechaFin)
    {
        if (!self::isValidDateFormat($fechaInicio) || !self::isValidDateFormat($fechaFin)) {
            return false;
        }
        return strtotime($fechaFin) > strtotime($fechaInicio);
    }
}