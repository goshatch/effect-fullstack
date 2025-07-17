import { useEffect, useState } from 'react';
import { Effect, Schema, Runtime, Scope, Exit } from 'effect';
import * as BrowserSocket from '@effect/platform-browser/BrowserSocket';
import * as Socket from '@effect/platform/Socket';
import { WebSocketResponse } from '@todo/shared';

interface TimestampData {
  backendTimestamp: number;
  frontendTimestamp: number;
  difference: number;
}

export const TimestampDisplay = () => {
  const [timestampData, setTimestampData] = useState<TimestampData | null>(
    null,
  );
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected'
  >('connecting');

  useEffect(() => {
    const runtime = Runtime.defaultRuntime;

    const program = Effect.gen(function* () {
      const socket = yield* Socket.Socket;

      setConnectionStatus('connected');

      yield* socket.run((data) =>
        Effect.gen(function* () {
          const message = new TextDecoder().decode(data);
          const parsed = JSON.parse(message);

          const validated =
            yield* Schema.decodeUnknown(WebSocketResponse)(parsed);

          const frontendTimestamp = Date.now();
          const difference = frontendTimestamp - validated.timestamp;

          setTimestampData({
            backendTimestamp: validated.timestamp,
            frontendTimestamp,
            difference,
          });
        }).pipe(
          Effect.catchAll((error) =>
            Effect.logError('Failed to parse WebSocket message', error),
          ),
        ),
      );
    });

    const socketLayer = BrowserSocket.layerWebSocket('ws://localhost:3333/ws');

    const scope = Runtime.runSync(runtime)(Scope.make());

    Runtime.runFork(runtime)(
      program.pipe(
        Effect.provide(socketLayer),
        Scope.extend(scope),
        Effect.catchAll((error) => {
          console.error('WebSocket error:', error);
          setConnectionStatus('disconnected');
          return Effect.unit;
        }),
      ),
    );

    return () => {
      Runtime.runSync(runtime)(Scope.close(scope, Exit.unit));
    };
  }, []);

  return (
    <div
      style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}
    >
      <p>
        Status: <strong>{connectionStatus}</strong>
      </p>

      {timestampData && (
        <div style={{ marginTop: '16px' }}>
          <p>
            Backend Timestamp: <code>{timestampData.backendTimestamp}</code>
          </p>
          <p>
            Frontend Timestamp: <code>{timestampData.frontendTimestamp}</code>
          </p>
          <p>
            Difference: <strong>{timestampData.difference}ms</strong>
          </p>
          <p style={{ fontSize: '0.9em', color: '#666' }}>
            Last updated:{' '}
            {new Date(timestampData.frontendTimestamp).toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
};
