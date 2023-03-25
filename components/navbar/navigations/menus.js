export default [
  {
    id: "swap",
    title: "Swap",
    path: "/swap",
    others_paths: ["/swap/[swap]"],
  },
  {
    id: "bridge",
    title: "Bridge",
    path: "/bridge",
    others_paths: ["/bridge/[bridge]"],
  },
  {
    id: "pools",
    title: "Pools",
    path: "/pools",
    others_paths: ["/pool", "/pool/[pool]"],
  },
  {
    id: "connext explorer",
    title: "Connext Explorer",
    path: process.env.NEXT_PUBLIC_EXPLORER_URL,
    external: true,
  },
  {
    id: "push Subscribe",
    title: "Push Subscribe",
    path: "/push",
  },
];
