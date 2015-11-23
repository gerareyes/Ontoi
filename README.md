# Ontoi - Evaluación por Competencias-Desarrollador MID

#### Antecedente ####
La secretaria de turismo, está desarrollando una aplicación móvil tanto en iOS como en andro
id para fomentar el turismo en Tijuana y recompensar a los usuarios en base a sus visitas a lugares turisticos.

#### Reto ####
Construir un programa que se encargue de manejar la información necesaria y la comunicación con los dispositivos móviles.

#### Solucion ####
Se desarrollara un servicio web REST que se encargará de manejar información y cálculos necesarios.

El servicio manejara usuarios que se autentican por medio de un request al servicio.

Se podrán crear usuarios mediante la siguiente llamada:
* http://website.com/users/register
* Usuario deberá tener la siguiente información (* requeridos)
  * Nombre *
  * Apellido
  * Edad *
  * Email *
  * Sexo
* La respuesta deberá contener:
  * response_status: “success” o “error”
  * response_message: Mensaje relacionado al request
    * Ej “User successfully created”
    * Ej “Missing required information”

El usuario podrá iniciar sesión mediante la siguiente llamada:
* http://website.com/users/login
* La información necesaria para hacer login es:
  * email
  * password
* Se deberá recibir una respuesta que contenga de igual manera
  * response_status: “success” o “error”
  * response_message: Mensaje relacionado al request
* Adicional al código de respuesta se regresará un token que será una cadena única
generada por el servicio para manejar la sesión de cada usuario.

El usuario podrá hacer logout mediante la siguiente llamada que a la vez invalidaría el token de sesión anteriormente creado:
* http:/website.com/users/logout
* La respuesta deberá contener:
  * response_status: “success” o “error”
  * response_message: Mensaje relacionado al request
* Ej “User successfully created”
* Ej “Missing required information”


Se tendrá una lista de lugares previamente generados por la secretaría de turismo de los cuales se tendrá:
* Nombre del lugar
* Descripcion
* Ubicacion
  * Latitud
  * Longitud

Estos lugares podrán ser accesados por medio de una llamada al servicio que te regresara los 5 lugares más próxim
os a la ubicación del usuario de la aplicación móvil.
Esto se llevara a cabo usando la ubicación de la siguiente manera:
* http://website.com/places/nearby
* Este request recibira la ubicacion del usuario
  * Latitud
  * Longitud
* También recibirá en los headers del request el token previamente recibido al hacer login
(si el token no es enviado o es inválido se deberá responder con un error)
La respuesta deberá contener:
  * response_status: “success” o “error”
  * response_message: Mensaje relacionado al request
  

El servicio también se encargará del manejo de checkin y checkout a los lugares previamente establecidos:
* http://website.com/places/:id/checkin
* http://website.com/places/:id/checkout

También se tendrán una serie de llamadas al servicio que proporcionaran información al usuar
io acerca de su interacción con los lugares.
* http://website.com/places/checkin_count
  * Regresará un listado de lugares visitados con el contador de cuantas veces se ha hecho checkin
  a algún lugar ordenado de manera ascendente.
* http://website.com/places/:place_id/rate
  * Recibirá el id del lugar el cual usara para calificar el lugar
  * La respuesta deberá contener:
    * response_status: “success” o “error”
    * response_message: Mensaje relacionado al request
      * Ej “User successfully created”
      * Ej “Missing required information”
* http://website.com/places/:place_id/time_spent
  * recibirá el id del lugar para calcular el tiempo pasado en un lugar específico, sumando todas visitas anteriores a ese lugar.
