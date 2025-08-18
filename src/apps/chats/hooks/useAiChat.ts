import { useState, useEffect, useCallback, useRef } from "react";
import { useChat, type Message } from "ai/react";
import { useChatsStore } from "../../../stores/useChatsStore";
import { useAppStore } from "@/stores/useAppStore";
import { useInternetExplorerStore } from "@/stores/useInternetExplorerStore";
import { useVideoStore } from "@/stores/useVideoStore";
import { useIpodStore } from "@/stores/useIpodStore";
import { useThemeStore } from "@/stores/useThemeStore";
import { toast } from "@/hooks/useToast";
import { useLaunchApp, type LaunchAppOptions } from "@/hooks/useLaunchApp";
import { AppId } from "@/config/appIds";
import { appRegistry } from "@/config/appRegistry";
import { useFileSystem } from "@/apps/finder/hooks/useFileSystem";
import { useTtsQueue } from "@/hooks/useTtsQueue";
import { useTextEditStore } from "@/stores/useTextEditStore";
import { generateHTML, generateJSON } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { htmlToMarkdown, markdownToHtml } from "@/utils/markdown";
import { AnyExtension, JSONContent } from "@tiptap/core";
import { themes } from "@/themes";
import type { OsThemeId } from "@/themes/types";

// TODO: Move relevant state and logic from ChatsAppComponent here
// - AI chat state (useChat hook)
// - Message processing (app control markup)
// - System state generation
// - Dialog states (clear, save)

//// Replace or update the getSystemState function to use stores
const getSystemState = () => {
  const appStore = useAppStore.getState();
  const ieStore = useInternetExplorerStore.getState();
  const videoStore = useVideoStore.getState();
  const ipodStore = useIpodStore.getState();
  const textEditStore = useTextEditStore.getState();
  const chatsStore = useChatsStore.getState();
  const themeStore = useThemeStore.getState();

  const currentVideo = videoStore.getCurrentVideo();
  const currentTrack =
    ipodStore.tracks &&
    ipodStore.currentIndex >= 0 &&
    ipodStore.currentIndex < ipodStore.tracks.length
      ? ipodStore.tracks[ipodStore.currentIndex]
      : null;

  const runningInstances = Object.entries(appStore.instances)
    .filter(([, instance]) => instance.isOpen)
    .map(([instanceId, instance]) => ({
      instanceId,
      appId: instance.appId,
      isForeground: instance.isForeground || false,
      title: instance.title,
    }));

  const foregroundInstance =
    runningInstances.find((inst) => inst.isForeground) || null;
  const backgroundInstances = runningInstances.filter(
    (inst) => !inst.isForeground
  );

  const nowClient = new Date();
  const userTimeZone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown";
  const userTimeString = nowClient.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const userDateString = nowClient.toLocaleDateString([], {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const textEditInstances = Object.values(textEditStore.instances);
  const textEditInstancesData = textEditInstances.map((instance) => {
    let contentMarkdown: string | null = null;
    if (instance.contentJson) {
      try {
        const htmlStr = generateHTML(instance.contentJson, [
          StarterKit,
          Underline,
          TextAlign.configure({ types: ["heading", "paragraph"] }),
          TaskList,
          TaskItem.configure({ nested: true }),
        ] as AnyExtension[]);
        contentMarkdown = htmlToMarkdown(htmlStr);
      } catch (err) {
        console.error("Failed to convert TextEdit content to markdown:", err);
      }
    }

    let title = "Untitled";
    if (instance.filePath) {
      const filename = instance.filePath.split("/").pop() || "Untitled";
      title = filename.replace(/\.md$/, "");
    } else {
      const appInstance = appStore.instances[instance.instanceId];
      title = appInstance?.title || "Untitled";
    }

    return {
      instanceId: instance.instanceId,
      filePath: instance.filePath,
      title,
      contentMarkdown,
      hasUnsavedChanges: instance.hasUnsavedChanges,
    };
  });

  let ieHtmlMarkdown: string | null = null;
  if (ieStore.aiGeneratedHtml) {
    try {
      ieHtmlMarkdown = htmlToMarkdown(ieStore.aiGeneratedHtml);
    } catch (err) {
      console.error("Failed to convert IE HTML to markdown:", err);
    }
  }

  return {
    apps: appStore.apps,
    username: chatsStore.username,
    authToken: chatsStore.authToken, // Include auth token for API validation
    userLocalTime: {
      timeString: userTimeString,
      dateString: userDateString,
      timeZone: userTimeZone,
    },
    runningApps: {
      foreground: foregroundInstance,
      background: backgroundInstances,
      instanceWindowOrder: appStore.instanceOrder,
    },
    internetExplorer: {
      url: ieStore.url,
      year: ieStore.year,
      status: ieStore.status,
      currentPageTitle: ieStore.currentPageTitle,
      aiGeneratedHtml: ieStore.aiGeneratedHtml,
      aiGeneratedMarkdown: ieHtmlMarkdown,
    },
    video: {
      currentVideo: currentVideo
        ? {
            id: currentVideo.id,
            url: currentVideo.url,
            title: currentVideo.title,
            artist: currentVideo.artist,
          }
        : null,
      isPlaying: videoStore.isPlaying,
      loopAll: videoStore.loopAll,
      loopCurrent: videoStore.loopCurrent,
      isShuffled: videoStore.isShuffled,
    },
    ipod: {
      currentTrack: currentTrack
        ? {
            id: currentTrack.id,
            url: currentTrack.url,
            title: currentTrack.title,
            artist: currentTrack.artist,
          }
        : null,
      isPlaying: ipodStore.isPlaying,
      loopAll: ipodStore.loopAll,
      loopCurrent: ipodStore.loopCurrent,
      isShuffled: ipodStore.isShuffled,
      currentLyrics: ipodStore.currentLyrics,
      library: ipodStore.tracks.map((t) => ({
        id: t.id,
        title: t.title,
        artist: t.artist,
      })),
    },
    textEdit: {
      instances: textEditInstancesData,
    },
    theme: {
      current: themeStore.current,
    },
  };
};

function createDebouncedAction(delay = 150) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (action: () => void) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      action();
      timer = null;
    }, delay);
  };
}
const debouncedInsertTextUpdate = createDebouncedAction(150);

const getAssistantVisibleText = (message: Message): string => {
  type MessagePart = { type: string; text?: string };
  if (message.parts && message.parts.length > 0) {
    return message.parts
      .filter((part: MessagePart) => part.type === "text")
      .map((part: MessagePart) => {
        const text = part.text || "";
        return text.startsWith("!!!!") ? text.slice(4).trimStart() : text;
      })
      .join("");
  }
  const text = message.content || "";
  return text.startsWith("!!!!") ? text.slice(4).trimStart() : text;
};

export function useAiChat(onPromptSetUsername?: () => void) {
  const {
    aiMessages,
    setAiMessages,
    username,
    authToken,
    ensureAuthToken,
    setAuthToken,
  } = useChatsStore();
  const launchApp = useLaunchApp();
  const closeApp = useAppStore((state) => state.closeApp);
  const aiModel = useAppStore((state) => state.aiModel);
  const speechEnabled = useAppStore((state) => state.speechEnabled);
  const { saveFile } = useFileSystem("/Documents", { skipLoad: true });

  const speechProgressRef = useRef<Record<string, number>>({});
  const [highlightSegment, setHighlightSegment] = useState<{
    messageId: string;
    start: number;
    end: number;
  } | null>(null);
  const highlightQueueRef = useRef<
    { messageId: string; start: number; end: number }[]
  >([]);

  useEffect(() => {
    aiMessages.forEach((msg) => {
      if (msg.role === "assistant") {
        const content = getAssistantVisibleText(msg);
        speechProgressRef.current[msg.id] = content.length;
      }
    });
  }, [aiMessages]);

  useEffect(() => {
    if (username && !authToken) {
      ensureAuthToken().catch((err) => {
        console.error("[useAiChat] Failed to generate auth token", err);
      });
    }
  }, [username, authToken, ensureAuthToken]);

  const { speak, stop: stopTts, isSpeaking } = useTtsQueue();

  const cleanTextForSpeech = (text: string) => {
    const withoutCodeBlocks = text
      .replace(/```[\s\S]*?```/g, "")
      .replace(/<[^>]*>/g, "")
      .replace(/^!+\s*/, "")
      .replace(/^[\s.!?。，！？；：]+/, "")
      .trim();
    return withoutCodeBlocks;
  };

  const [rateLimitError, setRateLimitError] = useState<{
    isAuthenticated: boolean;
    count: number;
    limit: number;
    message: string;
  } | null>(null);
  const [needsUsername, setNeedsUsername] = useState(false);

  // ********* FIX: always include Authorization when we have a token *********
  const apiHeaders: Record<string, string> | undefined =
    authToken || username
      ? {
          ...(username ? { "X-Username": username } : {}),
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        }
      : undefined;
  // **********************************************************************

  const setHighlightSegmentRef = useRef(setHighlightSegment);
  useEffect(() => {
    setHighlightSegmentRef.current = setHighlightSegment;
  }, [setHighlightSegment]);

  const {
    messages: currentSdkMessages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    isLoading,
    reload,
    error,
    stop: sdkStop,
    setMessages: setSdkMessages,
    append,
  } = useChat({
    api: "/api/chat",
    initialMessages: aiMessages,
    experimental_throttle: 50,
    headers: apiHeaders, // <-- Authorization now sent even if username is empty
    body: {
      systemState: getSystemState(),
      model: aiModel,
    },
    maxSteps: 25,
    onResponse: (response) => {
      const newToken = response.headers.get("X-New-Auth-Token");
      if (newToken) {
        console.log("[useAiChat] Received refreshed auth token from server");
        setAuthToken(newToken);
        if (username) {
          const key = `_token_refresh_time_${username}`;
          localStorage.setItem(key, Date.now().toString());
        }
      }
    },
    async onToolCall({ toolCall }) {
      await new Promise<void>((resolve) => setTimeout(resolve, 120));
      try {
        switch (toolCall.toolName) {
          case "aquarium":
            return "Aquarium ready";
          case "switchTheme": {
            const { theme } = toolCall.args as { theme?: OsThemeId };
            if (!theme) return "Failed to switch theme: No theme provided.";
            const { current, setTheme } = useThemeStore.getState();
            if (current === theme) {
              const name = themes[theme]?.name || theme;
              return `${name} theme is already active.`;
            }
            setTheme(theme);
            const name = themes[theme]?.name || theme;
            return `Switched theme to ${name}.`;
          }
          case "launchApp": {
            const { id, url, year } = toolCall.args as {
              id: string;
              url?: string;
              year?: string;
            };
            if (!id) return "Failed to launch app: No app ID provided.";
            const appName = appRegistry[id as AppId]?.name || id;
            const launchOptions: LaunchAppOptions = {};
            if (id === "internet-explorer" && (url || year)) {
              launchOptions.initialData = { url, year: year || "current" };
            }
            launchApp(id as AppId, launchOptions);
            let confirmationMessage = `Launched ${appName}.`;
            if (id === "internet-explorer") {
              const urlPart = url ? ` to ${url}` : "";
              const yearPart = year && year !== "current" ? ` in ${year}` : "";
              confirmationMessage += `${urlPart}${yearPart}`;
            }
            return confirmationMessage + ".";
          }
          case "closeApp": {
            const { id } = toolCall.args as { id: string };
            if (!id) return "Failed to close app: No app ID provided.";
            const appName = appRegistry[id as AppId]?.name || id;
            const appStore = useAppStore.getState();
            const appInstances = appStore.getInstancesByAppId(id as AppId);
            const openInstances = appInstances.filter((inst) => inst.isOpen);
            if (openInstances.length === 0) {
              return `${appName} is not currently running.`;
            }
            openInstances.forEach((instance) => {
              appStore.closeAppInstance(instance.instanceId);
            });
            closeApp(id as AppId);
            return `Closed ${appName} (${openInstances.length} window${
              openInstances.length === 1 ? "" : "s"
            }).`;
          }
          case "textEditSearchReplace": {
            const { search, replace, isRegex, instanceId } = toolCall
              .args as {
              search: string;
              replace: string;
              isRegex?: boolean;
              instanceId?: string;
            };
            if (typeof search !== "string")
              return "Failed to search/replace: No search text provided.";
            if (typeof replace !== "string")
              return "Failed to search/replace: No replacement text provided.";
            if (!instanceId)
              return "Failed to search/replace: No instanceId provided. Check system state for available TextEdit instances.";
            const normalizedSearch = search.replace(/\r\n?/g, "\n");
            const normalizedReplace = replace.replace(/\r\n?/g, "\n");
            const escapeRegExp = (str: string) =>
              str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const textEditState = useTextEditStore.getState();
            const targetInstance = textEditState.instances[instanceId];
            if (!targetInstance) {
              return `TextEdit instance ${instanceId} not found. Available instances: ${
                Object.keys(textEditState.instances).join(", ") || "none"
              }.`;
            }
            const { updateInstance } = textEditState;
            try {
              const currentContentJson = targetInstance.contentJson || {
                type: "doc",
                content: [{ type: "paragraph", content: [] }],
              };
              const htmlStr = generateHTML(currentContentJson, [
                StarterKit,
                Underline,
                TextAlign.configure({ types: ["heading", "paragraph"] }),
                TaskList,
                TaskItem.configure({ nested: true }),
              ] as AnyExtension[]);
              const markdownStr = htmlToMarkdown(htmlStr);
              const updatedMarkdown = (() => {
                try {
                  const pattern = isRegex
                    ? normalizedSearch
                    : escapeRegExp(normalizedSearch);
                  const regex = new RegExp(pattern, "gm");
                  return markdownStr.replace(regex, normalizedReplace);
                } catch (err) {
                  console.error("Error while building/applying regex:", err);
                  throw err;
                }
              })();
              if (updatedMarkdown === markdownStr) {
                return "Nothing found to replace.";
              }
              const updatedHtml = markdownToHtml(updatedMarkdown);
              const updatedJson = generateJSON(updatedHtml, [
                StarterKit,
                Underline,
                TextAlign.configure({ types: ["heading", "paragraph"] }),
                TaskList,
                TaskItem.configure({ nested: true }),
              ] as AnyExtension[]);
              updateInstance(targetInstance.instanceId, {
                contentJson: updatedJson,
                hasUnsavedChanges: true,
              });
              const appStore = useAppStore.getState();
              appStore.bringInstanceToForeground(targetInstance.instanceId);
              const appInstance = appStore.instances[targetInstance.instanceId];
              const displayName = appInstance?.title || "Untitled";
              return `Replaced "${search}" with "${replace}" in ${displayName}.`;
            } catch (err) {
              console.error("searchReplace error:", err);
              return `Failed to apply search/replace: ${
                err instanceof Error ? err.message : "Unknown error"
              }`;
            }
          }
          case "textEditInsertText": {
            const { text, position, instanceId } = toolCall.args as {
              text: string;
              position?: "start" | "end";
              instanceId?: string;
            };
            if (!text)
              return "Failed to insert text: No text content provided.";
            if (!instanceId)
              return "Failed to insert text: No instanceId provided. Check system state for available TextEdit instances.";
            const textEditState = useTextEditStore.getState();
            const targetInstance = textEditState.instances[instanceId];
            if (!targetInstance) {
              return `TextEdit instance ${instanceId} not found. Available instances: ${
                Object.keys(textEditState.instances).join(", ") || "none"
              }.`;
            }
            try {
              const { updateInstance } = textEditState;
              const targetInstanceId = targetInstance.instanceId;
              const htmlFragment = markdownToHtml(text);
              const parsedJson = generateJSON(htmlFragment, [
                StarterKit,
                Underline,
                TextAlign.configure({ types: ["heading", "paragraph"] }),
                TaskList,
                TaskItem.configure({ nested: true }),
              ] as AnyExtension[]);
              const nodesToInsert = Array.isArray(parsedJson.content)
                ? parsedJson.content
                : [];
              let newDocJson: JSONContent;
              if (
                targetInstance.contentJson &&
                Array.isArray(targetInstance.contentJson.content)
              ) {
                const cloned = JSON.parse(
                  JSON.stringify(targetInstance.contentJson)
                );
                if (position === "start") {
                  cloned.content = [...nodesToInsert, ...cloned.content];
                } else {
                  cloned.content = [...cloned.content, ...nodesToInsert];
                }
                newDocJson = cloned;
              } else {
                newDocJson = parsedJson;
              }
              debouncedInsertTextUpdate(() =>
                updateInstance(targetInstanceId, {
                  contentJson: newDocJson,
                  hasUnsavedChanges: true,
                })
              );
              const appStore = useAppStore.getState();
              appStore.bringInstanceToForeground(targetInstanceId);
              const appInstance = appStore.instances[targetInstanceId];
              const displayName = appInstance?.title || "Untitled";
              return `Inserted text at ${
                position === "start" ? "start" : "end"
              } of ${displayName}.`;
            } catch (err) {
              console.error("textEditInsertText error:", err);
              return `Failed to insert text: ${
                err instanceof Error ? err.message : "Unknown error"
              }`;
            }
          }
          case "textEditNewFile": {
            const { title } = toolCall.args as { title?: string };
            const appStore = useAppStore.getState();
            const instanceId = appStore.launchApp(
              "textedit",
              undefined,
              title,
              true
            );
            await new Promise((resolve) => setTimeout(resolve, 200));
            appStore.bringInstanceToForeground(instanceId);
            return `Created a new, untitled document in TextEdit${
              title ? ` (${title})` : ""
            }.`;
          }
          case "ipodPlayPause": {
            const { action } = toolCall.args as {
              action?: "play" | "pause" | "toggle";
            };
            const appState = useAppStore.getState();
            const ipodInstances = appState.getInstancesByAppId("ipod");
            const hasOpenIpodInstance = ipodInstances.some((inst) => inst.isOpen);
            if (!hasOpenIpodInstance) {
              launchApp("ipod");
            }
            const ipod = useIpodStore.getState();
            switch (action) {
              case "play":
                if (!ipod.isPlaying) ipod.setIsPlaying(true);
                break;
              case "pause":
                if (ipod.isPlaying) ipod.setIsPlaying(false);
                break;
              default:
                ipod.togglePlay();
                break;
            }
            const nowPlaying = useIpodStore.getState().isPlaying;
            return nowPlaying ? "iPod is now playing." : "iPod is paused.";
          }
          case "ipodPlaySong": {
            const { id, title, artist } = toolCall.args as {
              id?: string;
              title?: string;
              artist?: string;
            };
            const appState = useAppStore.getState();
            const ipodInstances = appState.getInstancesByAppId("ipod");
            const hasOpenIpodInstance = ipodInstances.some((inst) => inst.isOpen);
            if (!hasOpenIpodInstance) launchApp("ipod");
            const ipodState = useIpodStore.getState();
            const { tracks } = ipodState;
            const ciIncludes = (source?: string, query?: string) =>
              !!source && !!query && source.toLowerCase().includes(query.toLowerCase());
            let finalCandidateIndices: number[] = [];
            const allTracksWithIndices = tracks.map((t, idx) => ({ track: t, index: idx }));
            const idFilteredTracks = id
              ? allTracksWithIndices.filter(({ track }) => track.id === id)
              : allTracksWithIndices;
            const primaryCandidates = idFilteredTracks.filter(({ track }) => {
              const titleMatches = title ? ciIncludes(track.title, title) : true;
              const artistMatches = artist ? ciIncludes(track.artist, artist) : true;
              return titleMatches && artistMatches;
            });
            if (primaryCandidates.length > 0) {
              finalCandidateIndices = primaryCandidates.map(({ index }) => index);
            } else if (title || artist) {
              const secondaryCandidates = idFilteredTracks.filter(({ track }) => {
                const titleInArtistMatches = title ? ciIncludes(track.artist, title) : false;
                const artistInTitleMatches = artist ? ciIncludes(track.title, artist) : false;
                if (title && artist) return titleInArtistMatches || artistInTitleMatches;
                if (title) return titleInArtistMatches;
                if (artist) return artistInTitleMatches;
                return false;
              });
              finalCandidateIndices = secondaryCandidates.map(({ index }) => index);
            }
            if (finalCandidateIndices.length === 0) return "Song not found in iPod library.";
            const randomIndexFromArray =
              finalCandidateIndices[Math.floor(Math.random() * finalCandidateIndices.length)];
            const { setCurrentIndex, setIsPlaying } = useIpodStore.getState();
            setCurrentIndex(randomIndexFromArray);
            setIsPlaying(true);
            const track = tracks[randomIndexFromArray];
            const trackDesc = `${track.title}${track.artist ? ` by ${track.artist}` : ""}`;
            return `Playing ${trackDesc}.`;
          }
          case "ipodAddAndPlaySong": {
            const { id } = toolCall.args as { id: string };
            if (!id) return "Failed to add song: No video ID provided.";
            const appState = useAppStore.getState();
            const ipodInstances = appState.getInstancesByAppId("ipod");
            const hasOpenIpodInstance = ipodInstances.some((inst) => inst.isOpen);
            if (!hasOpenIpodInstance) launchApp("ipod");
            try {
              const addedTrack = await useIpodStore.getState().addTrackFromVideoId(id);
              if (addedTrack) return `Added '${addedTrack.title}' to iPod and started playing.`;
              return `Failed to add ${id} to iPod.`;
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : "Unknown error";
              if (errorMessage.includes("Failed to fetch video info")) {
                return `Cannot add ${id}: Video unavailable or invalid.`;
              }
              return `Failed to add ${id}: ${errorMessage}`;
            }
          }
          case "ipodNextTrack": {
            const appState = useAppStore.getState();
            const ipodInstances = appState.getInstancesByAppId("ipod");
            const hasOpenIpodInstance = ipodInstances.some((inst) => inst.isOpen);
            if (!hasOpenIpodInstance) launchApp("ipod");
            const { nextTrack } = useIpodStore.getState();
            if (typeof nextTrack === "function") nextTrack();
            const updatedIpod = useIpodStore.getState();
            const track = updatedIpod.tracks[updatedIpod.currentIndex];
            if (track) {
              const desc = `${track.title}${track.artist ? ` by ${track.artist}` : ""}`;
              return `Skipped to ${desc}.`;
            }
            return "Skipped to next track.";
          }
          case "ipodPreviousTrack": {
            const appState = useAppStore.getState();
            const ipodInstances = appState.getInstancesByAppId("ipod");
            const hasOpenIpodInstance = ipodInstances.some((inst) => inst.isOpen);
            if (!hasOpenIpodInstance) launchApp("ipod");
            const { previousTrack } = useIpodStore.getState();
            if (typeof previousTrack === "function") previousTrack();
            const updatedIpod = useIpodStore.getState();
            const track = updatedIpod.tracks[updatedIpod.currentIndex];
            if (track) {
              const desc = `${track.title}${track.artist ? ` by ${track.artist}` : ""}`;
              return `Went back to previous track: ${desc}.`;
            }
            return "Went back to previous track.";
          }
          case "generateHtml": {
            const { html } = toolCall.args as { html: string };
            if (!html) return "Failed to generate HTML: No HTML content provided.";
            return html.trim();
          }
          default:
            console.warn("Unhandled tool call:", toolCall.toolName);
            return "";
        }
      } catch (err) {
        console.error("Error executing tool call:", err);
        return `Failed to execute ${toolCall.toolName}`;
      }
    },
    onFinish: () => {
      const finalMessages = currentSdkMessagesRef.current;
      setAiMessages(finalMessages);
      if (!speechEnabled) return;
      const lastMsg = finalMessages.at(-1);
      if (!lastMsg || lastMsg.role !== "assistant") return;
      const progress = speechProgressRef.current[lastMsg.id] ?? 0;
      const content = getAssistantVisibleText(lastMsg);
      if (progress < content.length) {
        const remainingRaw = content.slice(progress);
        const cleaned = cleanTextForSpeech(remainingRaw);
        if (cleaned) {
          const seg = { messageId: lastMsg.id, start: progress, end: content.length };
          highlightQueueRef.current.push(seg);
          if (highlightQueueRef.current.length === 1) {
            setTimeout(() => {
              if (highlightQueueRef.current[0] === seg) {
                setHighlightSegmentRef.current(seg);
              }
            }, 80);
          }
          speak(cleaned, () => {
            highlightQueueRef.current.shift();
            setHighlightSegmentRef.current(highlightQueueRef.current[0] || null);
          });
          speechProgressRef.current[lastMsg.id] = content.length;
        }
      }
    },
    onError: (err) => {
      console.error("AI Chat Error:", err);

      const handleAuthError = (message?: string) => {
        console.error("Authentication error - clearing invalid token");
        const setAuthToken = useChatsStore.getState().setAuthToken;
        setAuthToken(null);
        toast.error("Login Required", {
          description: message || "Please login to continue chatting.",
          duration: 5000,
          action: onPromptSetUsername
            ? { label: "Login", onClick: onPromptSetUsername }
            : undefined,
        });
        setNeedsUsername(true);
      };

      if (err.message) {
        const jsonMatch = err.message.match(/\{.*\}/);
        if (jsonMatch) {
          try {
            const errorData = JSON.parse(jsonMatch[0]);
            if (errorData.error === "rate_limit_exceeded") {
              setRateLimitError(errorData);
              if (!errorData.isAuthenticated) setNeedsUsername(true);
              return;
            }
            if (
              errorData.error === "authentication_failed" ||
              errorData.error === "unauthorized" ||
              errorData.error === "username mismatch"
            ) {
              handleAuthError("Your session has expired. Please login again.");
              return;
            }
          } catch (parseError) {
            console.error("Failed to parse error response:", parseError);
          }
        }
        if (err.message.includes("429") || err.message.includes("rate_limit_exceeded")) {
          setNeedsUsername(true);
          toast.error("Rate Limit Exceeded", {
            description: "You've reached the message limit. Please login to continue.",
            duration: 5000,
            action: onPromptSetUsername
              ? { label: "Login", onClick: onPromptSetUsername }
              : undefined,
          });
          return;
        }
        if (
          err.message.includes("401") ||
          err.message.includes("Unauthorized") ||
          err.message.includes("unauthorized") ||
          err.message.includes("authentication_failed") ||
          err.message.includes("Authentication failed") ||
          err.message.includes("username mismatch") ||
          err.message.includes("Username mismatch")
        ) {
          handleAuthError();
          return;
        }
      }

      toast.error("AI Error", {
        description: err.message || "Failed to get response.",
      });
    },
  });

  const currentSdkMessagesRef = useRef<Message[]>([]);
  useEffect(() => {
    currentSdkMessagesRef.current = currentSdkMessages;
  }, [currentSdkMessages]);

  useEffect(() => {
    if (
      aiMessages.length !== currentSdkMessages.length ||
      (aiMessages.length > 0 &&
        (aiMessages[aiMessages.length - 1].id !==
          currentSdkMessages[currentSdkMessages.length - 1]?.id ||
          aiMessages[aiMessages.length - 1].content !==
            currentSdkMessages[currentSdkMessages.length - 1]?.content))
    ) {
      setSdkMessages(aiMessages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiMessages, setSdkMessages]);

  useEffect(() => {
    if (!speechEnabled) return;
    if (!isLoading) return;
    const lastMsg = currentSdkMessages.at(-1);
    if (!lastMsg || lastMsg.role !== "assistant") return;
    const progress =
      typeof speechProgressRef.current[lastMsg.id] === "number"
        ? (speechProgressRef.current[lastMsg.id] as number)
        : 0;
    const content = getAssistantVisibleText(lastMsg);
    if (progress >= content.length) return;

    let scanPos = progress;
    const processChunk = (endPos: number) => {
      const rawChunk = content.slice(scanPos, endPos);
      const cleaned = cleanTextForSpeech(rawChunk);
      if (cleaned) {
        const seg = { messageId: lastMsg.id, start: scanPos, end: endPos };
        highlightQueueRef.current.push(seg);
        if (!highlightSegment) {
          setTimeout(() => {
            if (highlightQueueRef.current[0] === seg) {
              setHighlightSegment(seg);
            }
          }, 80);
        }
        speak(cleaned, () => {
          highlightQueueRef.current.shift();
          setHighlightSegment(highlightQueueRef.current[0] || null);
        });
      }
      scanPos = endPos;
      speechProgressRef.current[lastMsg.id] = scanPos;
    };

    while (scanPos < content.length) {
      const nextNlIdx = content.indexOf("\n", scanPos);
      if (nextNlIdx === -1) break;
      processChunk(nextNlIdx);
      scanPos = nextNlIdx + 1;
      if (content[scanPos] === "\r") scanPos += 1;
      speechProgressRef.current[lastMsg.id] = scanPos;
    }
  }, [currentSdkMessages, isLoading, speechEnabled, speak, highlightSegment]);

  useEffect(() => {
    if (username && needsUsername) {
      setNeedsUsername(false);
      setRateLimitError(null);
    }
  }, [username, needsUsername]);

  // ⬇️ FIXED: ensure token before sending form submit
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const messageContent = input;
      if (!messageContent.trim()) return;

      if (needsUsername && !username) {
        toast.error("Login Required", {
          description: "Please login to continue chatting.",
          duration: 3000,
        });
        return;
      }

      // ensure we have a fresh token BEFORE sending
      await ensureAuthToken();

      setRateLimitError(null);
      const freshSystemState = getSystemState();
      originalHandleSubmit(e, {
        body: { systemState: freshSystemState, model: aiModel },
      });
    },
    [originalHandleSubmit, input, needsUsername, username, aiModel, ensureAuthToken]
  );

  // ⬇️ FIXED: ensure token before sending direct message
  const handleDirectMessageSubmit = useCallback(
    async (message: string) => {
      if (!message.trim()) return;
      if (needsUsername && !username) {
        toast.error("Login Required", {
          description: "Please login to continue chatting.",
          duration: 3000,
        });
        return;
      }

      // ensure we have a fresh token BEFORE sending
      await ensureAuthToken();

      setRateLimitError(null);
      append(
        { content: message, role: "user" },
        { body: { systemState: getSystemState(), model: aiModel } }
      );
    },
    [append, needsUsername, username, aiModel, ensureAuthToken]
  );

  const handleNudge = useCallback(() => {
    handleDirectMessageSubmit("👋 *nudge sent*");
  }, [handleDirectMessageSubmit]);

  const clearChats = useCallback(() => {
    stopTts();
    speechProgressRef.current = {};
    highlightQueueRef.current = [];
    setHighlightSegment(null);

    const initialMessage: Message = {
      id: "1",
      role: "assistant",
      content: "👋 hey! i'm Keto. ask me anything!",
      createdAt: new Date(),
    };
    speechProgressRef.current[initialMessage.id] = initialMessage.content.length;

    setAiMessages([initialMessage]);
    setSdkMessages([initialMessage]);
  }, [setAiMessages, setSdkMessages, stopTts]);

  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [saveFileName, setSaveFileName] = useState("");

  const confirmClearChats = useCallback(() => {
    setIsClearDialogOpen(false);
    setTimeout(() => {
      clearChats();
      handleInputChange({
        target: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>);
    }, 100);
  }, [clearChats, handleInputChange]);

  const handleSaveTranscript = useCallback(() => {
    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const time = now
      .toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .toLowerCase()
      .replace(":", "-")
      .replace(" ", "");
    setSaveFileName(`chat-${date}-${time}.md`);
    setIsSaveDialogOpen(true);
  }, []);

  const handleSaveSubmit = useCallback(
    async (fileName: string) => {
      const transcript = aiMessages
        .map((msg: Message) => {
          const time = msg.createdAt
            ? new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })
            : "";
          const sender = msg.role === "user" ? username || "You" : "Keto";
          return `**${sender}** (${time}):\n${msg.content}`;
        })
        .join("\n\n");

      const finalFileName = fileName.endsWith(".md")
        ? fileName
        : `${fileName}.md`;
      const filePath = `/Documents/${finalFileName}`;

      try {
        await saveFile({
          path: filePath,
          name: finalFileName,
          content: transcript,
          type: "markdown",
          icon: "/icons/file-text.png",
        });

        setIsSaveDialogOpen(false);
        toast.success("Transcript saved", {
          description: `Saved to ${finalFileName}`,
          duration: 3000,
        });
      } catch (error) {
        console.error("Error saving transcript:", error);
        toast.error("Failed to save transcript", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
    [aiMessages, username, saveFile]
  );

  const stop = useCallback(() => {
    sdkStop();
    stopTts();
  }, [sdkStop, stopTts]);

  return {
    messages: currentSdkMessages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    reload,
    error,
    stop,
    append,
    handleDirectMessageSubmit,
    handleNudge,
    clearChats,
    handleSaveTranscript,
    rateLimitError,
    needsUsername,
    isClearDialogOpen,
    setIsClearDialogOpen,
    confirmClearChats,
    isSaveDialogOpen,
    setIsSaveDialogOpen,
    saveFileName,
    setSaveFileName,
    handleSaveSubmit,
    isSpeaking,
    highlightSegment,
  };
}
