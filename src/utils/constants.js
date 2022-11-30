export const SpeedLimitOptions = [
  { label: "kbit/s", value: 1 },
  { label: "Mbit/s", value: 1000 },
  { label: "Gbit/s", value: 1000000 },
];
export const QuotaOptions = [
  { label: "kB", value: 1000 },
  { label: "MB", value: 1000000 },
  { label: "GB", value: 1000000000 },
  { label: "TB", value: 1000000000000 },
];

export const DueActionOptions = [
  { label: "No Action", value: 0 },
  { label: "Speed Limit to 10kb/s", value: 1 },
  { label: "Speed Limit to 100kb/s", value: 2 },
  { label: "Speed Limit to 1Mb/s", value: 3 },
  { label: "Speed Limit to 10Mb/s", value: 4 },
  { label: "Speed Limit to 30Mb/s", value: 5 },
  { label: "Speed Limit to 100Mb/s", value: 6 },
  { label: "Speed Limit to 1Gb/s", value: 7 },
  { label: "Delete Forwarding Rules", value: 8 },
];

export const DateOptions = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  hour12: false,
};

export const ReverseProxies = [
  "caddy"
]