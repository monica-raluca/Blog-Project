import type { ElementTransformer } from '@lexical/markdown';
import { ElementNode, LexicalNode } from 'lexical';
import { $createYouTubeNode, $isYouTubeNode, YouTubeNode } from './YouTubeNode';

// YouTube transformer for markdown compatibility
export const YOUTUBE_TRANSFORMER: ElementTransformer = {
  dependencies: [YouTubeNode],
  export: (node, exportChildren) => {
    if (!$isYouTubeNode(node)) {
      return null;
    }
    const videoID = node.getId();
    // Export as HTML iframe for markdown compatibility
    return `<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/${videoID}" frameborder="0" allowfullscreen data-lexical-youtube="${videoID}"></iframe>`;
  },
  regExp: /<iframe[^>]*data-lexical-youtube="([^"]*)"[^>]*>/,
  replace: (parentNode: ElementNode, children: LexicalNode[], match: string[]) => {
    const videoID = match[1];
    if (videoID) {
      const youtubeNode = $createYouTubeNode(videoID);
      parentNode.append(youtubeNode);
    }
  },
  type: 'element',
};

// Alternative: Simple YouTube URL transformer for markdown
export const YOUTUBE_URL_TRANSFORMER: ElementTransformer = {
  dependencies: [YouTubeNode],
  export: (node, exportChildren) => {
    if (!$isYouTubeNode(node)) {
      return null;
    }
    const videoID = node.getId();
    // Export as simple YouTube URL that can be easily parsed
    return `[YouTube Video](https://www.youtube.com/watch?v=${videoID})`;
  },
  regExp: /^\[YouTube Video\]\(https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})\)$/,
  replace: (parentNode: ElementNode, children: LexicalNode[], match: string[]) => {
    const videoID = match[1];
    if (videoID) {
      const youtubeNode = $createYouTubeNode(videoID);
      parentNode.append(youtubeNode);
    }
  },
  type: 'element',
};