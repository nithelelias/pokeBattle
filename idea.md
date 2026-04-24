quiero un projecto monolitico con backend y front end 

front end : React + typescript + tailwind

back end: NodeJs + express + typescript + socked.io


--- 

quiero un juego donde dos jugadores se conectan y golpean la foto del otro, la foto es una imagen de 300px  que pueden arrastrar de su lado de pantalla, y pueden golpear/tocar la foto del contrario, esto en RT, por eso el uso de socket.io 

no hay logeo por lo que cada ID de sesion es solo preguntar su nickname y pregutnar por una foto que va elegir de su pc o tomar foto por la camara web, luego se le debe aplicar un compresion con una libreria parauqe no pese mas de 150kb aprox.

el jugador se coencta y luego debe elgir gastar 5 puntos entre HP, damage y speed.

HP es la vida que tiene el jugador.

Damage es el daño que hace el jugador.

Speed es la velocidad que tiene el jugador.

FLujo:

jugador esta en un LOBBY, con su foto, donde puede mover su foto al rededor teniendo en cuenta sus atributos y una foto al lado que es en este caso un DOLLY qe solo esta para tocar y golpear este es una zona de espera mostrando el daño realizado gracias a su atributo de DAMAGE, y el movimiento de su foto depende del speed siendo mas bien como un arrastre con un lerping , abajo debe aparecer un botn que diga "BUSCAR PARTIDA" al darle click debe buscar una partida este boton quedara prendido enlistandolo para pelear, cuando se obtenga un oponente entrara a la zona de batalla, si quiere cancelarlo debe volver a darle click al boton para detener la busqueda de batalla

en la escena de BATALLA, carga la foto de ambos jugadores en los extremos de la pantalla , la posicion incial la da BACK al indicar la actualizacion de la ARENA , esta informacion que viaja tiene, vida de  jugadores, posiciones,  y sirve para renderizar acada personaje en pantalla, cuando el jugador mueve su foto esta se envia al back inmediatamente para actualizar la informacion de la arena, la velocidad de arrastre depende del atributo del speed del personaje, al darle click a la foto del contrario se manda a back un ataque en la posicion y back debe validar si la posicionq ue hace click aun esta el personaje, entonces hay daño, back debe validar si hay daño contrastando la posicion y el tamaño de la foto que estara QUEMADO en 300px, con un simple funcion de distancia radial.  cuando se aplica el daño se actualiza la arena y los clientes renderizan por consiguiente la informacion de vida , posicion de los jugadores, la partida acaba cuando alguno de los jugadores llega a 0 de vida, entonces se muestra un mensaje de quien gano y se vuelve al lobby.

