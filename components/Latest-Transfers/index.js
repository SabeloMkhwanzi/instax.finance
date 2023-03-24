import { useState, useEffect } from "react";
import { useSelector, shallowEqual } from "react-redux";
import _ from "lodash";
import { XTransferStatus } from "@connext/nxtp-utils";
import { TiArrowRight } from "react-icons/ti";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";

import TransferStatus from "../transfer-status";
import { toArray } from "../../lib/utils";

const NUM_TRANSFER_DISPLAY = 3;

export default ({ data = [], trigger, onUpdateSize }) => {
  const { preferences, dev, wallet } = useSelector(
    (state) => ({
      preferences: state.preferences,
      dev: state.dev,
      wallet: state.wallet,
    }),
    shallowEqual
  );
  const { page_visible } = { ...preferences };
  const { sdk } = { ...dev };
  const { wallet_data } = { ...wallet };
  const { address } = { ...wallet_data };

  const [transfers, setTransfers] = useState(null);
  const [collapse, setCollapse] = useState(null);
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    const getData = async () => {
      if (page_visible && sdk && address) {
        try {
          let response = toArray(
            await sdk.sdkUtils.getTransfers({ userAddress: address })
          );

          response = _.orderBy(
            _.uniqBy(
              toArray(_.concat(response, data)),
              "xcall_transaction_hash"
            ),
            ["xcall_timestamp"],
            ["desc"]
          );

          if (
            response.findIndex(
              (t) =>
                toArray(transfers).findIndex((_t) => _t?.transfer_id) < 0 &&
                ![
                  XTransferStatus.Executed,
                  XTransferStatus.CompletedFast,
                  XTransferStatus.CompletedSlow,
                ].includes(t.status)
            ) > -1
          ) {
            setCollapse(false);
          }

          setTransfers(response);
        } catch (error) {
          setTransfers(null);
        }
      } else {
        setTransfers(null);
      }
    };

    getData();

    const interval = setInterval(() => getData(), 10 * 1000);

    return () => clearInterval(interval);
  }, [page_visible, sdk, address, trigger]);

  useEffect(() => {
    if (onUpdateSize) {
      onUpdateSize(toArray(transfers).length);
    }
  }, [onUpdateSize, transfers]);

  const transfersComponent = _.slice(
    toArray(transfers).map((t, i) => {
      return (
        <div key={i} className="mx-auto w-70">
          <TransferStatus data={t} />
        </div>
      );
    }),
    0,
    NUM_TRANSFER_DISPLAY
  );

  return (
    transfers?.length > 0 && (
      <div className="lg:max-w-xs xl:ml-auto">
        <button
          onClick={() => setCollapse(!collapse)}
          className={`w-full flex items-center justify-center ${
            collapse
              ? "text-slate-300 hover:text-slate-800 dark:text-slate-700 dark:hover:text-slate-200 font-medium"
              : "font-semibold"
          } space-x-1 mb-3`}
        >
          <span className="text-sm capitalize">Latest Transfers</span>
          {collapse ? <BiChevronDown size={18} /> : <BiChevronUp size={18} />}
        </button>
        {!collapse && (
          <>
            <div className="grid max-w-xl gap-4 mx-auto sm:grid-cols-1 lg:grid-cols-1">
              {transfersComponent}
            </div>
            {address && transfers.length > NUM_TRANSFER_DISPLAY && (
              <a
                href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center text-green-500 dark:text-slate-200 mt-2.5"
              >
                <span className="font-medium">See more</span>
                <TiArrowRight
                  size={18}
                  className="transform -rotate-45 mt-0.5"
                />
              </a>
            )}
          </>
        )}
      </div>
    )
  );
};
