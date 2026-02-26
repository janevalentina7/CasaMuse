import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, ArrowLeft, Plus, Minus, Home } from "lucide-react";
import { ROOM_DATA } from "@/data/roomSizes";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface RoomSelection {
  roomId: string;
  count: number;
  size: "small" | "medium" | "large";
  attachedBathroom?: boolean;
}

interface Step2Props {
  rooms: RoomSelection[];
  setRooms: (rooms: RoomSelection[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Step2Rooms = ({ rooms, setRooms, onNext, onPrev }: Step2Props) => {
  const coreRooms = Object.entries(ROOM_DATA).filter(
    ([_, room]) => room.category === "core"
  );
  const additionalRooms = Object.entries(ROOM_DATA).filter(
    ([_, room]) => room.category === "additional"
  );
  const specialtyRooms = Object.entries(ROOM_DATA).filter(
    ([_, room]) => room.category === "specialty"
  );

  const getRoomSelection = (roomId: string) => {
    return rooms.find((r) => r.roomId === roomId);
  };

  const updateRoom = (roomId: string, count: number, size: "small" | "medium" | "large" = "medium") => {
    const existing = rooms.find((r) => r.roomId === roomId);
    
    if (count === 0) {
      setRooms(rooms.filter((r) => r.roomId !== roomId));
    } else if (existing) {
      setRooms(
        rooms.map((r) =>
          r.roomId === roomId ? { ...r, count, size } : r
        )
      );
    } else {
      setRooms([...rooms, { roomId, count, size }]);
    }
  };

  const updateRoomSize = (roomId: string, size: "small" | "medium" | "large") => {
    const existing = rooms.find((r) => r.roomId === roomId);
    if (existing) {
      setRooms(
        rooms.map((r) =>
          r.roomId === roomId ? { ...r, size } : r
        )
      );
    }
  };

  const toggleAttachedBathroom = (roomId: string) => {
    setRooms(
      rooms.map((room) =>
        room.roomId === roomId
          ? { ...room, attachedBathroom: !room.attachedBathroom }
          : room
      )
    );
  };

  const isBedroom = (roomId: string) =>
    roomId === "master_bedroom" || roomId === "bedroom" || roomId === "guest_room";

  const hasMinimumRooms = () => {
    return rooms.some(r => r.count > 0);
  };

  const RoomCard = ({ roomId, roomData }: { roomId: string; roomData: any }) => {
    const selection = getRoomSelection(roomId);
    const count = selection?.count || 0;
    const size = selection?.size || "medium";
    const availableSizes = Object.keys(roomData.sizes);

    return (
      <Card
        className={cn(
          "border-2 transition-all duration-300 hover:shadow-soft glass-card",
          count > 0 
            ? "border-primary ring-4 ring-primary/20 shadow-glow bg-primary/5" 
            : "border-border/50 hover:border-primary/30"
        )}
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-1">{roomData.name}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {roomData.description}
              </p>
            </div>
            <Badge
              variant="secondary"
              className="ml-2 flex-shrink-0"
            >
              {roomData.category}
            </Badge>
          </div>

          {roomData.vastuDirection && (
            <div className="text-xs text-muted-foreground">
              📍 {roomData.vastuDirection.join(", ")}
            </div>
          )}

          {/* Count selector */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 glass-button hover:bg-primary hover:text-primary-foreground"
              onClick={() => updateRoom(roomId, Math.max(0, count - 1), size)}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <div className="flex-1 text-center font-semibold text-foreground">
              {count} {count === 1 ? "room" : "rooms"}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 glass-button hover:bg-primary hover:text-primary-foreground"
              onClick={() => updateRoom(roomId, count + 1, size)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Size selector */}
          {count > 0 && availableSizes.length > 1 && (
            <Select value={size} onValueChange={(val: any) => updateRoomSize(roomId, val)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableSizes.map((sizeKey) => (
                  <SelectItem key={sizeKey} value={sizeKey}>
                    {roomData.sizes[sizeKey].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Attached Bathroom Option for Bedrooms */}
          {count > 0 && isBedroom(roomId) && (
            <div className="flex items-center space-x-2 p-3 rounded-lg bg-muted/30">
              <Checkbox
                id={`bathroom-${roomId}`}
                checked={selection?.attachedBathroom || false}
                onCheckedChange={() => toggleAttachedBathroom(roomId)}
              />
              <label
                htmlFor={`bathroom-${roomId}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Attached Bathroom
              </label>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="glass-card border-2">
        <CardContent className="p-8">
          <div className="text-center space-y-3 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto shadow-glow">
              <Home className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Select Your Rooms
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Choose rooms and specify quantity and size
            </p>
          </div>

          <div className="space-y-6">
            {/* Core Rooms */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Core Rooms
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {coreRooms.map(([id, data]) => (
                  <RoomCard key={id} roomId={id} roomData={data} />
                ))}
              </div>
            </div>

            {/* Additional Rooms */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-secondary" />
                Additional Rooms
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {additionalRooms.map(([id, data]) => (
                  <RoomCard key={id} roomId={id} roomData={data} />
                ))}
              </div>
            </div>

            {/* Specialty Rooms */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                Specialty Rooms
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {specialtyRooms.map(([id, data]) => (
                  <RoomCard key={id} roomId={id} roomData={data} />
                ))}
              </div>
            </div>
          </div>

          {!hasMinimumRooms() && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm text-destructive">
              ⚠️ Please select at least one room to continue
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onPrev}
              className="flex-1"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <Button
              type="button"
              variant="hero"
              size="lg"
              onClick={onNext}
              disabled={!hasMinimumRooms()}
              className="flex-1 group bg-primary text-white hover:bg-primary/90"
            >
              Continue
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
