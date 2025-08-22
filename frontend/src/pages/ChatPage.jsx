import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  createContext,
  useContext,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import Peer from "peerjs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Send,
  Paperclip,
  Copy,
  VideoIcon,
  Pin,
  PinOff,
  X,
  FileText,
  Briefcase,
  User,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";

// Utility functions for binary data conversion
function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

// React component to display a video stream
const VideoPlayer = React.memo(({ stream, username, isMuted }) => {
  const videoRef = useRef(null);
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  return (
    <div className="relative aspect-video w-full rounded-lg bg-black overflow-hidden shadow-lg">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isMuted}
        className="h-full w-full object-cover"
      />
      <div className="absolute bottom-2 left-2 rounded-md px-2 py-1 text-xs font-medium bg-black/50 text-white backdrop-blur-sm">
        {username || "Guest"}
      </div>
    </div>
  );
});

// Main component for the video call logic
const ChatPage = () => {
  const { roomId: paramRoomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [myPeer, setMyPeer] = useState(null);
  const [myPeerId, setMyPeerId] = useState("");
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [messages, setMessages] = useState([]);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [username, setUsername] = useState(user?.fullname || "");
  const [isLobby, setIsLobby] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [projectId, setProjectId] = useState(null); // New state for the project ID
  const [isLoading, setIsLoading] = useState(true); // Loading state

  const connectionsRef = useRef({});
  const usernameRef = useRef(username);

  useEffect(() => {
    usernameRef.current = username;
  }, [username]);

  // --- NEW: Fetch user's project ID on mount and if user changes ---
  useEffect(() => {
    const fetchUserProject = async () => {
      setIsLoading(true);
      if (user && user.token) {
        try {
          const response = await fetch("/api/me", {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          });
          if (response.ok) {
            const userData = await response.json();
            if (userData.project) {
              setProjectId(userData.project);
              // If a project ID is found, automatically join the room
              if (myPeer && myPeer.connect && !isLobby) {
                handleJoinRoom(userData.project, myPeer);
              }
            } else {
              toast.info("No active project found.", {
                description:
                  "You can create a new room or join an existing one.",
              });
            }
          } else {
            toast.error("Failed to fetch user data.");
            console.error("Failed to fetch user data:", response.statusText);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast.error("Network error fetching user data.");
        }
      }
      setIsLoading(false);
    };

    fetchUserProject();
  }, [user, myPeer, isLobby]);
  // --- END NEW ---

  // Initialize PeerJS on component mount
  useEffect(() => {
    try {
      if (!myPeer) {
        const peer = new Peer(undefined, {
          host: "localhost",
          port: 8001,
          path: "/peerjs",
        });
        setMyPeer(peer);
        peer.on("open", (id) => {
          setMyPeerId(id);
        });
        peer.on("error", (err) => {
          console.error("PeerJS Error:", err);
          toast.error("Connection Error", {
            description: "Could not connect to the peer server.",
          });
        });
      }
      return () => {
        if (myPeer && !myPeer.destroyed) {
          myPeer.destroy();
        }
      };
    } catch (e) {
      console.error("Failed to initialize PeerJS:", e);
      toast.error("Initialization Error", {
        description: "Failed to initialize PeerJS. Check console for details.",
      });
    }
  }, [myPeer]);

  // Handle incoming data messages
  const handleData = useCallback((data, peerId) => {
    try {
      const parsedData = JSON.parse(data);
      switch (parsedData.type) {
        case "chat":
          setMessages((prev) => [...prev, parsedData.data]);
          break;
        case "file":
          const { fileName, fileType, fileData, sender } = parsedData.data;
          const arrayBuffer = base64ToArrayBuffer(fileData);
          const blob = new Blob([arrayBuffer], { type: fileType });
          const url = URL.createObjectURL(blob);
          setMessages((prev) => [
            ...prev,
            { type: "file", fileName, url, sender },
          ]);
          break;
        case "username":
          setRemoteStreams((prev) => ({
            ...prev,
            [peerId]: { ...prev[peerId], username: parsedData.data },
          }));
          break;
        default:
          break;
      }
    } catch (e) {
      console.error("Failed to handle incoming data:", e);
    }
  }, []);

  // Add and remove remote streams
  const addRemoteStream = useCallback((peerId, stream, remoteUsername) => {
    setRemoteStreams((prev) => ({
      ...prev,
      [peerId]: { ...prev[peerId], stream, username: remoteUsername },
    }));
  }, []);

  const removeRemoteStream = useCallback((peerId) => {
    setRemoteStreams((prev) => {
      const { [peerId]: _, ...rest } = prev;
      return rest;
    });
    delete connectionsRef.current[peerId];
  }, []);

  // Setup listeners for incoming calls and connections
  useEffect(() => {
    if (!myPeer || !localStream) return;

    const handleNewConnection = (conn) => {
      connectionsRef.current[conn.peer] = conn;
      conn.on("data", (data) => handleData(data, conn.peer));
      conn.on("close", () => removeRemoteStream(conn.peer));
      conn.on("open", () => {
        conn.send(
          JSON.stringify({ type: "username", data: usernameRef.current })
        );
      });
    };

    myPeer.on("call", (call) => {
      call.answer(localStream);
      call.on("stream", (remoteStream) => {
        addRemoteStream(call.peer, remoteStream, "New User");
        setIsCallActive(true);
      });
      call.on("close", () => removeRemoteStream(call.peer));
    });

    myPeer.on("connection", handleNewConnection);

    return () => {
      myPeer.off("call");
      myPeer.off("connection");
    };
  }, [myPeer, localStream, handleData, addRemoteStream, removeRemoteStream]);

  // Broadcast data to all connected peers
  const broadcastData = (data) => {
    Object.values(connectionsRef.current).forEach((conn) => {
      if (conn && conn.open) conn.send(data);
    });
  };

  // Get user's media stream and initiate video call
  const startMediaAndCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      setIsCallActive(true);

      // Call all existing peers with the new stream
      Object.keys(connectionsRef.current).forEach((peerId) => {
        if (myPeer && myPeer.call) {
          const call = myPeer.call(peerId, stream);
          call.on("stream", (remoteStream) => {
            addRemoteStream(peerId, remoteStream, "Peer User");
          });
          call.on("close", () => removeRemoteStream(peerId));
        }
      });
    } catch (e) {
      console.error("Media access failed:", e);
      toast.error("Media Error", {
        description: "Camera and mic access failed. Please grant permissions.",
      });
    }
  };

  // Handle joining an existing room
  const handleJoinRoom = async (roomIdToJoin, peerInstance = myPeer) => {
    if (!username || !peerInstance) {
      toast.error("Username and PeerJS instance required.", {
        description: "Please reload the page if the issue persists.",
      });
      return;
    }
    const conn = peerInstance.connect(roomIdToJoin);
    conn.on("data", (data) => handleData(data, conn.peer));
    conn.on("close", () => removeRemoteStream(conn.peer));
    conn.on("open", () => {
      conn.send(
        JSON.stringify({ type: "username", data: usernameRef.current })
      );
      toast.success("Joined room!", {
        description: `Connected to room: ${roomIdToJoin}`,
      });
    });
    conn.on("error", (err) => {
      console.error("Connection error:", err);
      toast.error("Failed to connect to room.", {
        description: "The room ID may be invalid or the peer is offline.",
      });
    });
    connectionsRef.current[conn.peer] = conn;
    setIsLobby(false);
  };

  // Handle creating a new room
  const handleCreateRoom = async () => {
    if (!username) {
      toast.error("Username required", {
        description: "Enter a name to create a room.",
      });
      return;
    }
    if (!myPeerId) {
      toast.error("Peer ID not ready.", {
        description: "Please wait for the connection to be established.",
      });
      return;
    }
    // Set the projectId to the newly created room ID
    setProjectId(myPeerId);
    setIsLobby(false);
    navigate(`/chat/${myPeerId}`);
    toast.success("Room created!", {
      description: `Share this ID: ${myPeerId}`,
    });
  };

  // Handle leaving the call
  const handleLeave = () => {
    localStream?.getTracks().forEach((track) => track.stop());
    Object.values(connectionsRef.current).forEach((conn) => conn.close());
    setLocalStream(null);
    setRemoteStreams({});
    setMessages([]);
    setPinnedMessages([]);
    connectionsRef.current = {};
    setIsCallActive(false);
    navigate("/chat");
    setIsLobby(true);
    // You might want to unset the projectId here as well
    setProjectId(null);
  };

  // Toggle audio or video tracks on/off
  const toggleMedia = (type) => {
    if (!localStream) return;
    if (type === "audio") {
      localStream
        .getAudioTracks()
        .forEach((track) => (track.enabled = !track.enabled));
      setIsAudioMuted((prev) => !prev);
    } else if (type === "video") {
      localStream
        .getVideoTracks()
        .forEach((track) => (track.enabled = !track.enabled));
      setIsVideoMuted((prev) => !prev);
    }
  };

  // Handle sending a chat message
  const sendMessage = (e) => {
    e.preventDefault();
    const messageText = e.target.message.value;
    if (!messageText) return;
    const messageData = {
      type: "chat",
      data: { text: messageText, sender: username, id: Date.now() },
    };
    broadcastData(JSON.stringify(messageData));
    setMessages((prev) => [...prev, { ...messageData.data, sender: "You" }]);
    e.target.reset();
  };

  // Handle sending a file
  const sendFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const arrayBuffer = event.target.result;
      const base64Data = arrayBufferToBase64(arrayBuffer);
      const fileInfo = {
        type: "file",
        data: {
          fileName: file.name,
          fileType: file.type,
          fileData: base64Data,
          sender: username,
          id: Date.now(),
        },
      };
      broadcastData(JSON.stringify(fileInfo));
      const url = URL.createObjectURL(
        new Blob([arrayBuffer], { type: file.type })
      );
      setMessages((prev) => [
        ...prev,
        { type: "file", fileName: file.name, url, sender: "You" },
      ]);
    };
    reader.readAsArrayBuffer(file);
  };

  // Pin/Unpin message function
  const handlePinMessage = (messageToPin) => {
    setPinnedMessages((prevPinned) => {
      const isPinned = prevPinned.some(
        (pinnedMsg) =>
          pinnedMsg.text === messageToPin.text &&
          pinnedMsg.sender === messageToPin.sender
      );
      if (isPinned) {
        toast.info("Unpinned message");
        return prevPinned.filter(
          (msg) =>
            msg.text !== messageToPin.text || msg.sender !== messageToPin.sender
        );
      } else {
        toast.success("Pinned message!");
        return [...prevPinned, messageToPin];
      }
    });
  };

  const handleProceedToContracts = () => {
    // Use projectId state instead of paramRoomId
    navigate(`/contracts?roomId=${projectId}`);
  };

  const handleProceedToPayments = () => {
    if (projectId) {
      navigate(`/payment/${projectId}`);
    } else {
      toast.error("No active room to proceed to payments.");
    }
  };

  const [isCallMinimized, setIsCallMinimized] = useState(true);

  // If loading, show a loading message
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <p>Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isLobby ? (
          <Lobby
            username={username}
            setUsername={setUsername}
            myPeerId={myPeerId}
            handleCreateRoom={handleCreateRoom}
            handleJoinRoom={handleJoinRoom}
            paramRoomId={paramRoomId || projectId} // Use fetched projectId or URL param
          />
        ) : (
          <CallScreen
            localStream={localStream}
            remoteStreams={remoteStreams}
            messages={messages}
            sendMessage={sendMessage}
            sendFile={sendFile}
            handleLeave={handleLeave}
            toggleMedia={toggleMedia}
            isAudioMuted={isAudioMuted}
            isVideoMuted={isVideoMuted}
            myUsername={username}
            pinnedMessages={pinnedMessages}
            handlePinMessage={handlePinMessage}
            onProceedToContracts={handleProceedToContracts}
            onProceedToPayments={handleProceedToPayments}
            isCallActive={isCallActive}
            onStartCall={startMediaAndCall}
            isCallMinimized={isCallMinimized}
            onToggleCallMinimized={() => setIsCallMinimized(!isCallMinimized)}
          />
        )}
      </div>
      <style>{`
        body {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
};

// Lobby component for joining or creating rooms
const Lobby = ({
  username,
  setUsername,
  myPeerId,
  handleCreateRoom,
  handleJoinRoom,
  paramRoomId,
}) => {
  const [joinId, setJoinId] = useState(paramRoomId || "");

  const copyToClipboard = () => {
    const tempInput = document.createElement("textarea");
    tempInput.value = myPeerId;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    toast.success("Copied!", { description: "Room ID copied to clipboard." });
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="text-center space-y-2">
          <VideoIcon className="mx-auto h-10 w-10 text-primary" />
          <CardTitle className="text-2xl font-bold">
            Peer-to-Peer Video Call
          </CardTitle>
          <CardDescription>
            Create a room or join one using a Room ID.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <Input
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="h-10"
          />
          <Button
            onClick={handleCreateRoom}
            disabled={!myPeerId || !username}
            className="w-full h-10 font-semibold"
          >
            Create New Room
          </Button>
          {myPeerId && (
            <div className="flex items-center space-x-2 rounded-md border p-2 bg-muted">
              <span className="flex-1 truncate text-sm font-mono text-muted-foreground">
                {myPeerId}
              </span>
              <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or Join Existing
              </span>
            </div>
          </div>
          <Input
            placeholder="Enter Room ID to join"
            value={joinId}
            onChange={(e) => setJoinId(e.target.value)}
            className="h-10"
          />
          <Button
            onClick={() => handleJoinRoom(joinId)}
            disabled={!joinId || !username}
            className="w-full h-10 font-semibold"
            variant="secondary"
          >
            Join Room
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// Call screen component with video players and chat
const CallScreen = ({
  localStream,
  remoteStreams,
  messages,
  sendMessage,
  sendFile,
  handleLeave,
  toggleMedia,
  isAudioMuted,
  isVideoMuted,
  myUsername,
  pinnedMessages,
  handlePinMessage,
  onProceedToContracts,
  onProceedToPayments,
  isCallActive,
  onStartCall,
  isCallMinimized,
  onToggleCallMinimized,
}) => {
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll messages to the bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const remotePeers = Object.entries(remoteStreams);
  const allStreams = [
    ...(localStream
      ? [
          {
            id: "local",
            stream: localStream,
            username: myUsername,
            isMuted: true,
          },
        ]
      : []),
    ...remotePeers.map(([peerId, { stream, username }]) => ({
      id: peerId,
      stream,
      username,
      isMuted: false,
    })),
  ];

  // Filter out messages that are already pinned
  const chatMessages = messages.filter(
    (msg) =>
      !pinnedMessages.some(
        (pinnedMsg) =>
          pinnedMsg.text === msg.text && pinnedMsg.sender === msg.sender
      )
  );

  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-4 gap-4 h-[85vh] ${isCallMinimized ? "lg:grid-cols-[0_1fr]" : "lg:grid-cols-[3fr_1fr]"}`}
    >
      {/* Main video area - Conditional rendering based on isCallActive and isCallMinimized */}
      {isCallActive && (
        <div
          className={`flex flex-col bg-black/90 rounded-xl p-4 transition-all duration-300 overflow-hidden`}
        >
          <div className="flex-1 grid gap-4 grid-cols-1 md:grid-cols-2">
            {allStreams.map((s) => (
              <VideoPlayer
                key={s.id}
                stream={s.stream}
                username={s.username}
                isMuted={s.isMuted}
              />
            ))}
          </div>
          {/* Call controls */}
          <div className="mt-4 flex flex-col sm:flex-row justify-center items-center gap-4 bg-black/30 p-2 rounded-full self-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => toggleMedia("audio")}
                    variant={isAudioMuted ? "destructive" : "secondary"}
                    size="icon"
                    className="rounded-full h-12 w-12"
                    disabled={!isCallActive}
                  >
                    {isAudioMuted ? <MicOff /> : <Mic />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isAudioMuted ? "Unmute" : "Mute"}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => toggleMedia("video")}
                    variant={isVideoMuted ? "destructive" : "secondary"}
                    size="icon"
                    className="rounded-full h-12 w-12"
                    disabled={!isCallActive}
                  >
                    {isVideoMuted ? <VideoOff /> : <Video />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isVideoMuted ? "Start Video" : "Stop Video"}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleLeave}
                    variant="destructive"
                    size="icon"
                    className="rounded-full h-12 w-12"
                  >
                    <PhoneOff />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>End Call</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}
      {/* Chat sidebar */}
      <aside
        className={`border rounded-xl flex flex-col bg-card transition-all duration-300 ${isCallMinimized ? "lg:col-span-4" : "lg:col-span-1"}`}
      >
        {/* New buttons section */}
        <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-center gap-2">
          {isCallActive ? (
            <Button
              onClick={onToggleCallMinimized}
              variant="default"
              className="w-full sm:w-auto font-semibold"
            >
              {isCallMinimized ? "Show Video" : "Hide Video"}
            </Button>
          ) : (
            <Button
              onClick={onStartCall}
              variant="default"
              className="w-full sm:w-auto font-semibold"
            >
              Start Video Call
            </Button>
          )}
          <Button
            onClick={onProceedToContracts}
            variant="outline"
            className="w-full sm:w-auto font-semibold"
          >
            Contracts
          </Button>
          <Button
            onClick={onProceedToPayments}
            variant="outline"
            className="w-full sm:w-auto font-semibold"
          >
            Payments
          </Button>
        </div>
        <div className="p-4 border-b font-semibold text-center">Live Chat</div>
        <ScrollArea className="flex-1 p-4 space-y-4">
          {/* Pinned messages section */}
          {pinnedMessages.length > 0 && (
            <div className="sticky top-0 z-10 space-y-2 p-2 rounded-lg bg-yellow-100/30 dark:bg-yellow-900/30 backdrop-blur-sm border-2 border-yellow-300 dark:border-yellow-700">
              <div className="flex items-center text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                <Pin className="h-4 w-4 mr-2" /> Pinned
              </div>
              {pinnedMessages.map((msg, index) => (
                <div
                  key={index}
                  className="relative group p-2 rounded-lg bg-white/50 dark:bg-black/50 shadow-sm"
                >
                  <div className="text-xs text-muted-foreground mb-1 flex justify-between items-center">
                    {msg.sender}
                    <Button
                      onClick={() => handlePinMessage(msg)}
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  {msg.type === "file" ? (
                    <a
                      href={msg.url}
                      download={msg.fileName}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg ${msg.sender === "You" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                    >
                      <Paperclip className="h-4 w-4" /> {msg.fileName}
                    </a>
                  ) : (
                    msg.text
                  )}
                </div>
              ))}
            </div>
          )}
          {/* Main chat messages */}
          {chatMessages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col relative group ${msg.sender === "You" ? "items-end" : "items-start"}`}
            >
              <div className="text-xs mb-1 text-muted-foreground">
                {msg.sender}
              </div>
              <div className="flex items-center gap-2">
                {/* Pin button */}
                <Button
                  onClick={() => handlePinMessage(msg)}
                  variant="ghost"
                  size="icon"
                  className={`h-6 w-6 ${msg.sender === "You" ? "order-2" : ""}`}
                >
                  <Pin className="h-3 w-3" />
                </Button>

                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${msg.sender === "You" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                  {msg.type === "file" ? (
                    <a
                      href={msg.url}
                      download={msg.fileName}
                      className={`flex items-center gap-2 ${msg.sender === "You" ? "text-primary-foreground" : "text-foreground"}`}
                    >
                      <Paperclip className="h-4 w-4" /> {msg.fileName}
                    </a>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </ScrollArea>
        {/* Message input form */}
        <form
          onSubmit={sendMessage}
          className="p-2 border-t flex items-center gap-2"
        >
          <Input
            name="message"
            placeholder="Type a message..."
            className="flex-1 bg-background"
            autoComplete="off"
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={sendFile}
            className="hidden"
          />
          <Button
            type="button"
            onClick={() => fileInputRef.current.click()}
            variant="ghost"
            size="icon"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button type="submit" variant="ghost" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </aside>
    </div>
  );
};

export default ChatPage;
