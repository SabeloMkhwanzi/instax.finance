export default [
  {
    id: "lending",
    title: "Lending",
    path: "#",
  },
  // {
  //   id: "borrowing",
  //   title: "borrowing",
  //   path: "/borrowing",
  // },
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
    id: "push alert",
    title: "Push Alert",
    path: "#",
  },
];
