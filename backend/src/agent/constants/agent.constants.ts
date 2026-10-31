export const AGENT_SESSION_TTL_MS = 45 * 60 * 1000;
export const AGENT_MAX_HISTORY_MESSAGES = 8;
export const AGENT_MAX_MESSAGE_LENGTH = 2000;
/** Room for the full Venwiz progressive narrative + a few project chunks. */
export const AGENT_MAX_CONTEXT_CHARS = 16_000;
export const AGENT_TOP_CHUNKS = 8;
export const AGENT_CHAT_THROTTLE_TTL_MS = 60_000;
export const AGENT_CHAT_THROTTLE_LIMIT = 20;

export const AGENT_STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'and',
  'or',
  'of',
  'to',
  'in',
  'on',
  'for',
  'with',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'what',
  'who',
  'how',
  'why',
  'when',
  'where',
  'about',
  'tell',
  'me',
  'your',
  'you',
  'can',
  'could',
  'would',
  'do',
  'does',
  'did',
  'please',
]);
