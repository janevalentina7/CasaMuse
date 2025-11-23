import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Room {
  roomId: string;
  roomName: string;
  count: number;
}

interface VirtualWalkthroughProps {
  rooms: Room[];
  style: string;
  model3DUrl: string;
  onGenerateRoomView: (roomName: string) => Promise<void>;
  isGenerating: boolean;
}

const VirtualWalkthrough = ({ 
  rooms, 
  style, 
  model3DUrl,
  onGenerateRoomView,
  isGenerating 
}: VirtualWalkthroughProps) => {
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const allRooms = rooms.flatMap(room => 
    Array.from({ length: room.count }, (_, i) => ({
      ...room,
      displayName: room.count > 1 ? `${room.roomName} ${i + 1}` : room.roomName
    }))
  );

  const handleNext = async () => {
    if (currentRoomIndex < allRooms.length - 1) {
      const nextIndex = currentRoomIndex + 1;
      setCurrentRoomIndex(nextIndex);
      await onGenerateRoomView(allRooms[nextIndex].displayName);
    }
  };

  const handlePrevious = async () => {
    if (currentRoomIndex > 0) {
      const prevIndex = currentRoomIndex - 1;
      setCurrentRoomIndex(prevIndex);
      await onGenerateRoomView(allRooms[prevIndex].displayName);
    }
  };

  const currentRoom = allRooms[currentRoomIndex];

  return (
    <>
      <Card className="glass-card border-2 border-accent">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold">Virtual Walkthrough</h3>
              <p className="text-muted-foreground">
                Room {currentRoomIndex + 1} of {allRooms.length}: {currentRoom.displayName}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsFullscreen(true)}
              disabled={isGenerating}
            >
              <Maximize2 className="w-5 h-5" />
            </Button>
          </div>

          <div className="relative rounded-lg overflow-hidden bg-muted/30 aspect-video mb-4">
            {model3DUrl ? (
              <img
                src={model3DUrl}
                alt={`${currentRoom.displayName} view`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Generate a view to start the walkthrough</p>
              </div>
            )}
            {isGenerating && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Generating room view...</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Button
              onClick={handlePrevious}
              disabled={currentRoomIndex === 0 || isGenerating}
              variant="outline"
              size="lg"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Previous Room
            </Button>

            <div className="flex gap-2">
              {allRooms.map((_, index) => (
                <button
                  key={index}
                  onClick={async () => {
                    setCurrentRoomIndex(index);
                    await onGenerateRoomView(allRooms[index].displayName);
                  }}
                  disabled={isGenerating}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentRoomIndex
                      ? 'bg-primary w-8'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                  aria-label={`Go to ${allRooms[index].displayName}`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              disabled={currentRoomIndex === allRooms.length - 1 || isGenerating}
              variant="outline"
              size="lg"
            >
              Next Room
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-7xl h-[90vh] p-0">
          <div className="relative h-full">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-background/80"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="w-5 h-5" />
            </Button>

            <div className="h-full flex flex-col">
              <div className="flex-1 relative">
                {model3DUrl && (
                  <img
                    src={model3DUrl}
                    alt={`${currentRoom.displayName} view`}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              <div className="p-6 bg-background border-t">
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                  <div>
                    <h4 className="text-xl font-bold">{currentRoom.displayName}</h4>
                    <p className="text-muted-foreground">
                      Room {currentRoomIndex + 1} of {allRooms.length}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button
                      onClick={handlePrevious}
                      disabled={currentRoomIndex === 0 || isGenerating}
                      variant="outline"
                    >
                      <ChevronLeft className="w-5 h-5 mr-2" />
                      Previous
                    </Button>

                    <div className="flex gap-2">
                      {allRooms.map((_, index) => (
                        <button
                          key={index}
                          onClick={async () => {
                            setCurrentRoomIndex(index);
                            await onGenerateRoomView(allRooms[index].displayName);
                          }}
                          disabled={isGenerating}
                          className={`w-3 h-3 rounded-full transition-all ${
                            index === currentRoomIndex
                              ? 'bg-primary w-8'
                              : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                          }`}
                        />
                      ))}
                    </div>

                    <Button
                      onClick={handleNext}
                      disabled={currentRoomIndex === allRooms.length - 1 || isGenerating}
                      variant="outline"
                    >
                      Next
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VirtualWalkthrough;
