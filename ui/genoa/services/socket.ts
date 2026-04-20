import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../config';

// retirer '/api' à la fin de l'URL pour se connecter à la racine du serveur
const SOCKET_URL = API_BASE_URL.replace(/\/api$/, '');

class SocketService {
    private socket: Socket | null = null;

    connect() {
        if (!this.socket) {
            this.socket = io(SOCKET_URL, {
                transports: ['websocket'], // force websocket pour éviter le polling
                autoConnect: true,
            });

            this.socket.on('connect', () => {
                console.log('Socket connecté !');
            });

            this.socket.on('disconnect', () => {
                console.log('Socket déconnecté.');
            });
        }
        return this.socket;
    }

    getSocket() {
        if (!this.socket) {
            return this.connect();
        }
        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

const socketService = new SocketService();
export default socketService;
