import { Schema } from 'effect';

export const WebSocketResponse = Schema.Struct({
  timestamp: Schema.Number,
  message: Schema.String,
});

export type WebSocketResponse = Schema.Schema.Type<typeof WebSocketResponse>;