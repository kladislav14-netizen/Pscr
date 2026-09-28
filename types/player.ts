export type StreamCategory = 'plenary' | 'press' | 'committee' | 'seminar' | 'archive' | 'custom';

export interface StreamItem {
  id: string;
  name: string;
  shortTitle: string;
  category: StreamCategory;
  categoryLabel: string;
  url: string;
  portalUrl?: string;
  isLive: boolean;
  description: string;
  roomName: string;
  subtitlesUrl?: string;
  date?: string;
  duration?: string;
  subId?: string;
}

export interface QualityLevel {
  index: number;
  height: number;
  bitrate: number;
  label?: string;
}

export interface PanOffset {
  x: number;
  y: number;
}

export interface PlayerStats {
  resolution: string;
  fps: number;
  currentBitrate: string;
  bufferLength: number;
  droppedFrames: number;
  zoomLevel: number;
  panX: number;
  panY: number;
  audioBoost: number;
  playbackRate: number;
  latencyToLive: number | null;
  codec: string;
}

export interface UserNote {
  id: string;
  timestamp: number;
  text: string;
  author: string;
  createdAt: string;
}

export interface AgendaItem {
  id: string;
  time: string;
  title: string;
  speaker?: string;
  status: 'probíhá' | 'nadcházející' | 'dokončeno';
}
