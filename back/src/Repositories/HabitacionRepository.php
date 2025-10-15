<?php

require_once __DIR__ . '/../Models/Habitacion.php';
require_once __DIR__ . '/../Core/Database.php';
require_once __DIR__ . '/NotificacionRepository.php';
require_once __DIR__ . '/ReservaRepository.php';

class HabitacionRepository 
{
    private $db;
    // Inyectamos el ReservaControlador (o ReservaRepository) por el constructor
    // Así evitamos la dependencia directa y el bucle de "new" dentro del constructor.
    private $reservaRepository; // Esto debería ser ReservaRepository

    public function __construct($reservaRepository = null)
    {
        $this->db = Database::getInstance()->getConnection();
        // Ya no necesitamos cargar desde JSON aquí
        
        // La dependencia de ReservaControlador se debe inyectar.
        // Esto asume que ReservaControlador también ha sido adaptado para DB.
        $this->reservaRepository= $reservaRepository; 
    }

    // ===============================================
    // Métodos CRUD adaptados para MySQL
    // ===============================================

public function agregarHabitacion(Habitacion $habitacion)
{
    $stmt = $this->db->prepare("INSERT INTO habitaciones (numero, tipo, precio) VALUES (?, ?, ?)");
    try {
        $success = $stmt->execute([
            $habitacion->getNumero(),
            $habitacion->getTipo(),
            $habitacion->getPrecio()
        ]);
        if ($success) {
            $habitacion->setId($this->db->lastInsertId()); 
        }
        return $success;
    } catch (PDOException $e) {
        error_log("Error al agregar habitación: " . $e->getMessage());
        return false;
    }
}

    // Dentro de tu nuevo HabitacionRepository.php (antes HabitacionControlador)
public function obtenerHabitaciones()
{
    $stmt = $this->db->query("SELECT id, numero, tipo, precio FROM habitaciones");
    $habitacionesData = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $habitaciones = [];
    foreach ($habitacionesData as $data) {
        // Pasamos el ID recuperado de la BD
        $habitacion = new Habitacion($data['id'], $data['numero'], $data['tipo'], $data['precio']);
        $habitaciones[] = $habitacion;
    }
    return $habitaciones;
}

public function buscarHabitacionPorNumero($numero)
{
    $stmt = $this->db->prepare("SELECT id, numero, tipo, precio FROM habitaciones WHERE numero = ?");
    $stmt->execute([$numero]);
    $data = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($data) {
        // Pasamos el ID recuperado de la BD
        return new Habitacion($data['id'], $data['numero'], $data['tipo'], $data['precio']);
    }
    return null;
}

public function buscarPorTipo($tipo)
{
    $stmt = $this->db->prepare("SELECT id, numero, tipo, precio FROM habitaciones WHERE LOWER(tipo) = LOWER(?)");
    $stmt->execute([$tipo]);
    $habitacionesData = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $habitaciones = [];
    foreach ($habitacionesData as $data) {
        $habitacion = new Habitacion($data['id'], $data['numero'], $data['tipo'], $data['precio']);
        $habitaciones[] = $habitacion;
    }
    return $habitaciones;
}

   public function obtenerHabitacionPorId($id)
{
    $stmt = $this->db->prepare("SELECT id, numero, tipo, precio 
                                 FROM habitaciones 
                                 WHERE id = ?");
    $stmt->execute([$id]);
    $data = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($data) {
        $habitacion = new Habitacion($data['id'],$data['numero'], $data['tipo'], $data['precio']);
        $habitacion->setId($data['id']); // si tu clase lo soporta
        return $habitacion;
    }

    return null; // si no encontró nada
}


    // Para actualizar, necesitaríamos un identificador único. 
    // Si 'numero' es único en la BD, se puede usar, si no, el ID de la BD.
    public function actualizarHabitacion($numero, $nuevosDatos)
    {
        $sql = "UPDATE habitaciones SET ";
        $updates = [];
        $params = [];

        if (isset($nuevosDatos['tipo'])) {
            $updates[] = "tipo = ?";
            $params[] = $nuevosDatos['tipo'];
        }
        if (isset($nuevosDatos['precio'])) {
            $updates[] = "precio = ?";
            $params[] = $nuevosDatos['precio'];
        }
        // Puedes agregar más campos aquí como 'disponible', 'descripcion', etc.

        if (empty($updates)) {
            return false; // No hay nada que actualizar
        }

        $sql .= implode(", ", $updates) . " WHERE numero = ?";
        $params[] = $numero; // El número de la habitación a actualizar

        $stmt = $this->db->prepare($sql);
        try {
            return $stmt->execute($params);
        } catch (PDOException $e) {
            error_log("Error al actualizar habitación: " . $e->getMessage());
            return false;
        }
    }

    public function eliminarHabitacion($habitacionNumero) // Cambiado a numero para coincidir con tu lógica actual
    {
        // 1. Verificar si la habitación existe y obtener su ID de la BD
        $habitacionExistente = $this->buscarHabitacionPorNumero($habitacionNumero);

        if (!$habitacionExistente) {
            return "Error: No existe una habitación con el número $habitacionNumero.";
        }

        // Antes de eliminar la habitación, necesitamos un ReservaControlador (ahora un Repositorio)
        // para manejar las reservas asociadas.
        if (!$this->reservasControlador) {
            // Esto es importante: si ReservaControlador no fue inyectado, no podemos operar
            return "Error interno: El gestor de reservas no está configurado.";
        }
        
        // Asumiendo que ReservaControlador ahora usa la BD
        $reservasAsociadas = $this->reservasControlador->mostrarReservasPorHabitacion($habitacionNumero); // Este método deberá ser adaptado también

        // Crear notificaciones y eliminar las reservas asociadas
        // Esto requerirá que NotificacionControlador también haya sido adaptado a la BD
        // O que se inyecte aquí el NotificacionControlador (Repositorio de Notificaciones)
        $notificacionControlador = new NotificacionControlador(); // Esto deberia ser un NotificacionRepository
        
        foreach ($reservasAsociadas as $reservaData) {
            $mensaje = "Tu reserva (ID: {$reservaData['id']}) para la habitación {$habitacionNumero} fue cancelada porque la habitación fue eliminada.";
            
            // Suponiendo que el constructor de NotificacionModel (el que usará la BD) acepta estos parámetros
            // Y que guardarNotificacion es su método de persistencia.
            $notificacion = new Notificacion(
                $reservaData['id'], // ID de la reserva
                $mensaje,
                $reservaData['usuarioDni'] // DNI del usuario de la reserva
            );
            $notificacionControlador->guardarNotificacion($notificacion); 

            // Eliminar la reserva usando el ReservaControlador (ahora Repositorio de Reservas)
            $this->reservasControlador->eliminarReserva($reservaData['id']);
        }

        // Ahora eliminar la habitación de la BD
        $stmt = $this->db->prepare("DELETE FROM habitaciones WHERE numero = ?");
        try {
            $success = $stmt->execute([$habitacionNumero]);
            if ($success && $stmt->rowCount() > 0) {
                return "Habitación y reservas asociadas eliminadas exitosamente.";
            } else {
                return "Error: No se pudo eliminar la habitación con el número $habitacionNumero. Es posible que no existiera o no tuviera reservas.";
            }
        } catch (PDOException $e) {
            error_log("Error al eliminar habitación: " . $e->getMessage());
            return "Error al eliminar la habitación de la base de datos.";
        }
    }

    // ===============================================
    // Métodos JSON (Eliminar o migrar)
    // ===============================================

    // Estos métodos (guardarEnJSON, habitacionToArray, cargarDesdeJSON) 
    // deben ser ELIMINADOS una vez que la migración sea completa.
    // Solo se mantendrían temporalmente para un script de migración de datos.

    /*
    public function guardarEnJSON() { // ELIMINAR }
    public function habitacionToArray($habitacion) { // ELIMINAR }
    public function cargarDesdeJSON() { // ELIMINAR }
    */
}