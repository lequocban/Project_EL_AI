import { cn } from "@/lib/utils";

const LORDICON_BASE = "https://media.lordicon.com/icons/wired/outline";

export const LORDICON_WIRED_OUTLINE = {
  brand: "2443-blazing-flame",
  home: "63-home",
  vocabulary: "112-book",
  lookup: "19-magnifier-zoom-search",
  listening: "464-headphones",
  reading: "56-document",
  stats: "153-bar-chart",
  progress: "161-growth",
  dashboard: "467-dashboard-gauge",
  moderation: "457-shield-security",
  profile: "21-avatar",
  admin: "965-privacy",
  users: "314-three-avatars-icon-calm",
  trophy: "3263-trophy-circle",
  crown: "407-crown-king-lord",
  medal: "1780-medal-first-place",
  layers: "12-layers",
  checklist: "47-to-do-list",
  keyboard: "747-keyboard",
  languages: "3688-chat-english",
  mic: "763-microphone",
  volume: "191-speaker",
  sparkles: "2474-sparkles-glitter",
  lightbulb: "1633-light-bulb-3",
  target: "134-target",
  flame: "2804-fire-flame",
  heart: "20-love-heart",
  globe: "27-globe",
  mail: "145-envelope-mail",
  phone: "23-smartphone-ring",
  mapPin: "3291-house-location-pin",
  fileUpload: "92-document-upload",
};

export default function AnimatedIcon({
  name,
  className,
  size,
  trigger = "hover",
  loading = "interaction",
  target,
  stroke,
  colors,
  ...props
}) {
  const icon = LORDICON_WIRED_OUTLINE[name] || LORDICON_WIRED_OUTLINE.sparkles;
  const style = size ? { width: size, height: size } : undefined;
  const targetProps = target ? { target } : {};
  const strokeProps = stroke ? { stroke } : {};
  const colorProps = colors ? { colors } : {};

  return (
    <lord-icon
      src={`${LORDICON_BASE}/${icon}.li`}
      trigger={trigger}
      loading={loading}
      class={cn("current-color inline-block flex-shrink-0 align-middle", className)}
      style={style}
      {...targetProps}
      {...strokeProps}
      {...colorProps}
      {...props}
    >
      <img alt="" loading="lazy" src={`${LORDICON_BASE}/${icon}.svg`} />
    </lord-icon>
  );
}
