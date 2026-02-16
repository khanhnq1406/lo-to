# Generate Tickets Error Fix

## Problem

When clicking "Tạo phiếu dò" button, got this error:

```
[Socket Provider] Error: [
  {
    "code": "invalid_type",
    "expected": "string",
    "received": "undefined",
    "path": ["roomId"],
    "message": "Required"
  }
]
```

## Root Cause

The `generateTickets` function in `SocketProvider.tsx` was missing the `roomId` parameter when emitting the `generate_tickets` event to the server.

**Before:**

```typescript
socket.emit("generate_tickets", { cardCount, boardsPerCard });
```

The server's schema validation (`ClientGenerateTicketsEventSchema`) requires:

- `roomId`: string (required)
- `cardCount`: number (required)
- `boardsPerTicket`: number (optional, deprecated)

## Solution Applied

**File: `providers/SocketProvider.tsx`**

Added:

1. Validation check for `roomId` existence
2. Include `roomId` in the emit payload
3. Enhanced console logging

**After:**

```typescript
const generateTickets = (cardCount: number, boardsPerCard: number) => {
  const socket = socketRef.current;
  if (!socket || !socket.connected) {
    setError("Not connected to server");
    return;
  }
  if (!roomId) {
    setError("Not in a room");
    return;
  }

  console.log("[Socket Provider] Generating tickets:", {
    roomId,
    cardCount,
    boardsPerCard,
  });
  socket.emit("generate_tickets", { roomId, cardCount, boardsPerCard });
};
```

## How It Works Now

1. User clicks "Tạo phiếu dò" button
2. `handleGenerateCards(cardCount)` is called
3. Calls `generateTickets(cardCount, 1)`
4. Function validates:
   - Socket is connected ✓
   - roomId exists ✓
5. Emits event with all required fields: `{ roomId, cardCount, boardsPerCard }`
6. Server validates the data
7. Server generates cards and sends back `tickets_generated` event
8. Client updates the store with new cards

## Testing Checklist

- [x] Click "Tạo phiếu dò" button
- [x] Select different card counts (1-5)
- [x] Cards should generate without errors
- [x] No more "roomId required" validation errors

## Files Modified

- `providers/SocketProvider.tsx` - Added roomId to generateTickets function

## Related Context

- Server schema: `ClientGenerateTicketsEventSchema` in `types/index.ts`
- Server handler: `socket.on('generate_tickets')` in `server/socket-handler.ts`
- The `boardsPerCard` parameter is for future use; currently not validated by server
