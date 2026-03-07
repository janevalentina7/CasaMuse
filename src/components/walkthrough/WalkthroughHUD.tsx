import { useMemo } from "react";

interface WalkthroughHUDProps {
  currentRoom: string | null;
  isLocked: boolean;
  isDayMode: boolean;
  onToggleDayMode: () => void;
  rooms: { name: string; x: number; z: number; width: number; depth: number }[];
  playerX: number;
  playerZ: number;
  onTeleport?: (x: number, z: number) => void;
}

const WalkthroughHUD = ({
  currentRoom,
  isLocked,
  isDayMode,
  onToggleDayMode,
  rooms,
  playerX,
  playerZ,
}: WalkthroughHUDProps) => {
  // Mini-map scale
  const mapScale = 8;
  const bounds = useMemo(() => {
    if (rooms.length === 0) return { minX: -5, maxX: 5, minZ: -5, maxZ: 5 };
    return rooms.reduce(
      (b, r) => ({
        minX: Math.min(b.minX, r.x) - 1,
        maxX: Math.max(b.maxX, r.x + r.width) + 1,
        minZ: Math.min(b.minZ, r.z) - 1,
        maxZ: Math.max(b.maxZ, r.z + r.depth) + 1,
      }),
      { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity }
    );
  }, [rooms]);

  const mapWidth = 180;
  const mapHeight = 180;
  const scaleX = mapWidth / (bounds.maxX - bounds.minX);
  const scaleZ = mapHeight / (bounds.maxZ - bounds.minZ);
  const scale = Math.min(scaleX, scaleZ);

  const toMapX = (x: number) => (x - bounds.minX) * scale;
  const toMapZ = (z: number) => (z - bounds.minZ) * scale;

  return (
    <>
      {/* Room Label */}
      {currentRoom && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="bg-background/80 backdrop-blur-sm border border-border rounded-lg px-6 py-3 shadow-lg">
            <p className="text-lg font-bold text-center text-foreground">{currentRoom}</p>
          </div>
        </div>
      )}

      {/* Click to enter prompt */}
      {!isLocked && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div className="bg-background/90 backdrop-blur-md border border-border rounded-xl px-8 py-6 shadow-xl text-center">
            <p className="text-xl font-bold text-foreground mb-2">Click to Enter Walkthrough</p>
            <p className="text-sm text-muted-foreground">Use WASD or Arrow Keys to move • Mouse to look around</p>
          </div>
        </div>
      )}

      {/* Controls help (bottom left) */}
      {isLocked && (
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
          <div className="bg-background/70 backdrop-blur-sm border border-border rounded-lg px-4 py-3 text-xs space-y-1">
            <p className="font-semibold text-foreground">Controls</p>
            <p className="text-muted-foreground">W/↑ Forward • S/↓ Back</p>
            <p className="text-muted-foreground">A/← Left • D/→ Right</p>
            <p className="text-muted-foreground">Mouse: Look around</p>
            <p className="text-muted-foreground">ESC: Release cursor</p>
          </div>
        </div>
      )}

      {/* Day/Night toggle (top right) */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={onToggleDayMode}
          className="bg-background/80 backdrop-blur-sm border border-border rounded-lg px-4 py-2 text-sm font-medium hover:bg-accent/20 transition-colors"
        >
          {isDayMode ? "🌙 Night" : "☀️ Day"}
        </button>
      </div>

      {/* Mini-map (bottom right) */}
      <div className="absolute bottom-4 right-4 z-20">
        <div className="bg-background/80 backdrop-blur-sm border border-border rounded-lg p-2 shadow-lg">
          <p className="text-[10px] font-semibold text-center text-muted-foreground mb-1">Mini Map</p>
          <svg width={mapWidth} height={mapHeight} className="rounded">
            <rect width={mapWidth} height={mapHeight} fill="hsl(var(--muted))" rx={4} />
            {/* Rooms */}
            {rooms.map((room, i) => (
              <g key={i}>
                <rect
                  x={toMapX(room.x)}
                  y={toMapZ(room.z)}
                  width={room.width * scale}
                  height={room.depth * scale}
                  fill={currentRoom === room.name ? "hsl(var(--primary) / 0.3)" : "hsl(var(--background))"}
                  stroke={currentRoom === room.name ? "hsl(var(--primary))" : "hsl(var(--border))"}
                  strokeWidth={currentRoom === room.name ? 2 : 1}
                  rx={2}
                />
                <text
                  x={toMapX(room.x) + (room.width * scale) / 2}
                  y={toMapZ(room.z) + (room.depth * scale) / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={Math.min(8, room.width * scale / room.name.length * 1.5)}
                  fill="hsl(var(--foreground))"
                  className="select-none"
                >
                  {room.name.length > 10 ? room.name.slice(0, 8) + "…" : room.name}
                </text>
              </g>
            ))}
            {/* Player dot */}
            <circle
              cx={toMapX(playerX)}
              cy={toMapZ(playerZ)}
              r={4}
              fill="hsl(var(--primary))"
              stroke="hsl(var(--primary-foreground))"
              strokeWidth={2}
            />
          </svg>
        </div>
      </div>
    </>
  );
};

export default WalkthroughHUD;
