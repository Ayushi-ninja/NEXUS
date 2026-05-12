type EventHandler = (...args: any[]) => void;

class SocketClient {
  private socket: WebSocket | null = null;
  private url: string;
  private listeners: Map<string, EventHandler[]> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectDelay: number = 1000; // start with 1 second
  private isIntentionalDisconnect: boolean = false;

  constructor(url: string = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8000/ws/traffic') {
    this.url = url;
  }

  connect(): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isIntentionalDisconnect = false;
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      this.dispatchEvent('connect', null);
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event) {
          this.dispatchEvent(data.event, data.payload || data);
        }
      } catch (error) {
        console.error('WebSocket parse error:', error);
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.socket = null;
      this.dispatchEvent('disconnect', null);

      if (!this.isIntentionalDisconnect) {
        this.attemptReconnect();
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.dispatchEvent('error', error);
    };
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (Attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay);

      // Exponential backoff, cap at 10 seconds
      this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, 10000);
    } else {
      console.error('Max reconnect attempts reached. Giving up.');
    }
  }

  disconnect(): void {
    this.isIntentionalDisconnect = true;
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  on(event: string, callback: EventHandler): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback: EventHandler): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      this.listeners.set(event, eventListeners.filter(cb => cb !== callback));
    }
  }

  private dispatchEvent(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  emit(command: string, data?: any): void {
    if (this.isConnected()) {
      const payload = { command, ...data };
      this.socket!.send(JSON.stringify(payload));
    } else {
      console.warn(`Cannot emit '${command}', WebSocket is not connected.`);
    }
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
}

// Export singleton instance
export const socketClient = new SocketClient();
export default socketClient;
