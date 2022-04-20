// @ts-check
const constantes = require('../config/constantes');
const sharedConstantes = require('../config/sharedConstantes');
const WebSocket = require('ws');

const activarWS = !process.argv.includes('nows');
var wss = null; // Servidor de Websocket

if (activarWS) {
  //Este codigo se ejecuta al inicializar este require. Es super global
  const port = parseInt(process.env.WS_PORT) || constantes.WS_PORT;
  wss = new WebSocket.Server({ port });

  console.info('WebSocket server corriendo en el puerto ' + port);
  wss.on('connection', ws => {
    ws.on('close', () => console.info('Cliente WebSocket desconectado'));
    console.info('Cliente WebSocket conectado');
  });
} else {
  console.info('El servidor de WebSocket no está corriendo');
}

//Envio un "update" a todos los clientes conectados
function broadcastUpdateOcupacion() {
  if (activarWS) {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(sharedConstantes.WS_STR_UPDATE_STATUS);
      }
    });
  }
}

module.exports = { broadcastUpdateOcupacion };
