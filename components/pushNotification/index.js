import NotificationItems from "../NotificationItems";
import * as PushSDK from "@pushprotocol/restapi";
import React from "react";

export default function PushNotifiction() {
  const OptInChannel = async () => {
    await PushSDK.channels.subscribe({
      signer: signer,
      channelAddress: "eip155:5:0xD8634C39BBFd4033c0d3289C4515275102423681",
      userAddress: `${address}`,
      onSuccess: () => {
        console.log("opt in success");
      },
      onError: () => {
        console.error("opt in error");
      },
      env: "staging",
    });
  };

  return (
    <div>
      {notifications && <NotificationItems OptInChannel={OptInChannel} />}
    </div>
  );
}
