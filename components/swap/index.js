import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import _ from "lodash";
import moment from "moment";
import { FixedNumber, utils } from "ethers";
import { TailSpin, Watch, Oval } from "react-loader-spinner";
import { DebounceInput } from "react-debounce-input";
import { Tooltip } from "@material-tailwind/react";
import { TiArrowRight } from "react-icons/ti";
import { MdClose } from "react-icons/md";
import { HiSwitchVertical } from "react-icons/hi";
import {
  BiMessageError,
  BiMessageCheck,
  BiMessageDetail,
  BiEditAlt,
  BiCheckCircle,
  BiInfoCircle,
} from "react-icons/bi";
import { IoWarning } from "react-icons/io5";

import Options from "./options";
import Alert from "../alerts";
import Balance from "../balance";
import Copy from "../copy";
import DecimalsFormat from "../decimals-format";
import Image from "../image";
import SelectAsset from "../select/asset";
import SelectChain from "../select/chain";
import Wallet from "../wallet";
import { getChain } from "../../lib/object/chain";
import { getAsset } from "../../lib/object/asset";
import { getContract } from "../../lib/object/contract";
import { getBalance } from "../../lib/object/balance";
import { getPool } from "../../lib/object/pool";
import {
  split,
  toArray,
  paramsToObj,
  numberToFixed,
  ellipse,
  equalsIgnoreCase,
  loaderColor,
  sleep,
  errorPatterns,
  parseError,
} from "../../lib/utils";
import {
  POOLS_DATA,
  BALANCES_DATA,
  GET_BALANCES_DATA,
} from "../../reducers/types";

const WRAPPED_PREFIX = process.env.NEXT_PUBLIC_WRAPPED_PREFIX;
const GAS_LIMIT_ADJUSTMENT = Number(
  process.env.NEXT_PUBLIC_GAS_LIMIT_ADJUSTMENT
);
const DEFAULT_SWAP_SLIPPAGE_PERCENTAGE = Number(
  process.env.NEXT_PUBLIC_DEFAULT_SWAP_SLIPPAGE_PERCENTAGE
);

const DEFAULT_OPTIONS = {
  infiniteApprove: true,
  slippage: DEFAULT_SWAP_SLIPPAGE_PERCENTAGE,
};

export default () => {
  const dispatch = useDispatch();
  const {
    preferences,
    chains,
    assets,
    pool_assets,
    pools,
    rpc_providers,
    dev,
    wallet,
    balances,
  } = useSelector(
    (state) => ({
      preferences: state.preferences,
      chains: state.chains,
      assets: state.assets,
      pool_assets: state.pool_assets,
      pools: state.pools,
      rpc_providers: state.rpc_providers,
      dev: state.dev,
      wallet: state.wallet,
      balances: state.balances,
    }),
    shallowEqual
  );
  const { theme } = { ...preferences };
  const { chains_data } = { ...chains };
  const { assets_data } = { ...assets };
  const { pool_assets_data } = { ...pool_assets };
  const { pools_data } = { ...pools };
  const { rpcs } = { ...rpc_providers };
  const { sdk } = { ...dev };
  const { wallet_data } = { ...wallet };
  const { provider, browser_provider, signer, address } = { ...wallet_data };
  const { balances_data } = { ...balances };

  const wallet_chain_id = wallet_data?.chain_id;

  const router = useRouter();
  const { asPath } = { ...router };

  const [swap, setSwap] = useState({});
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [buttonDirection, setButtonDirection] = useState(1);
  const [slippageEditing, setSlippageEditing] = useState(false);

  const [swapAmount, setSwapAmount] = useState(null);
  const [calculateSwapResponse, setCalculateSwapResponse] = useState(null);
  const [priceImpact, setPriceImpact] = useState(null);

  const [approving, setApproving] = useState(null);
  const [approveProcessing, setApproveProcessing] = useState(null);
  const [approveResponse, setApproveResponse] = useState(null);

  const [calling, setCalling] = useState(null);
  const [callProcessing, setCallProcessing] = useState(null);
  const [callResponse, setCallResponse] = useState(null);

  const [pair, setPair] = useState(null);
  const [pairTrigger, setPairTrigger] = useState(null);
  const [balanceTrigger, setBalanceTrigger] = useState(null);

  // get swap from path
  useEffect(() => {
    let updated = false;

    const params = paramsToObj(
      asPath?.indexOf("?") > -1 && asPath.substring(asPath.indexOf("?") + 1)
    );

    let path = !asPath ? "/" : asPath.toLowerCase();
    path = path.includes("?") ? path.substring(0, path.indexOf("?")) : path;

    const { amount, from } = { ...params };

    if (path.includes("on-")) {
      const paths = path.replace("/swap/", "").split("-");

      const chain = paths[paths.indexOf("on") + 1];
      const asset =
        _.head(paths) !== "on"
          ? _.head(paths)
          : process.env.NEXT_PUBLIC_NETWORK === "testnet"
          ? "eth"
          : "usdc";

      const chain_data = getChain(chain, chains_data, false, true);
      const asset_data = getAsset(asset, pool_assets_data);

      if (chain_data) {
        swap.chain = chain;
        updated = true;
      }

      if (asset_data) {
        swap.asset = asset;
        updated = true;
      }

      if (swap.chain) {
        if (!isNaN(amount) && Number(amount) > 0) {
          swap.amount = amount;
          updated = true;
        }

        if (from) {
          swap.origin = "y";
          updated = true;
        }
      }
    }

    if (
      (!path.includes("on-") || !swap.chain) &&
      !path.includes("[swap]") &&
      getChain(null, chains_data, false, true, false, undefined, true)?.length >
        0
    ) {
      const _chain = getChain(null, chains_data, false, true, true)?.id;

      router.push(
        `/swap/on-${_chain}${
          Object.keys(params).length > 0
            ? `?${new URLSearchParams(params).toString()}`
            : ""
        }`,
        undefined,
        {
          shallow: true,
        }
      );
    }

    if (updated) {
      setSwap(swap);
    }
  }, [asPath, chains_data, pool_assets_data]);

  // set swap to path
  useEffect(() => {
    const params = {};

    if (swap) {
      const { chain, asset, amount, origin } = { ...swap };

      const chain_data = getChain(chain, chains_data, true, true);

      const { chain_id } = { ...chain_data };

      if (chain_data) {
        params.chain = chain;

        if (asset && getAsset(asset, pool_assets_data, chain_id)) {
          params.asset = asset;
        }
      }

      if (params.chain && params.asset) {
        if (!isNaN(amount) && Number(amount) > 0) {
          params.amount = amount;
        }

        if (
          origin === "y" &&
          local?.symbol &&
          getAsset(asset, pool_assets_data, chain_id, local.symbol)
        ) {
          params.from = local.symbol;
        }
      }
    }

    if (Object.keys(params).length > 0) {
      const { chain, asset } = { ...params };

      delete params.chain;
      delete params.asset;

      router.push(
        `/swap/${
          chain ? `${asset ? `${asset.toUpperCase()}-` : ""}on-${chain}` : ""
        }${
          Object.keys(params).length > 0
            ? `?${new URLSearchParams(params).toString()}`
            : ""
        }`,
        undefined,
        {
          shallow: true,
        }
      );

      setBalanceTrigger(moment().valueOf());
    }

    setApproveResponse(null);
    setCallResponse(null);
  }, [address, swap]);

  // update balances
  useEffect(() => {
    let { chain } = { ...swap };

    const { id } = { ...getChain(wallet_chain_id, chains_data) };

    if (asPath && id) {
      const params = paramsToObj(
        asPath?.indexOf("?") > -1 && asPath.substring(asPath.indexOf("?") + 1)
      );

      if (!chain && !params?.chain && getChain(id, chains_data, true)) {
        chain = id;
      }

      getBalances(id);
    }

    if (Object.keys(swap).length > 0) {
      chain = chain || getChain(null, chains_data, true, true, true)?.id;
    }

    setSwap({
      ...swap,
      chain,
    });
  }, [asPath, wallet_chain_id, chains_data]);

  // update balances
  useEffect(() => {
    dispatch({
      type: BALANCES_DATA,
      value: null,
    });

    if (address) {
      const { chain } = { ...swap };

      getBalances(chain);
    } else {
      reset("address");
    }
  }, [address]);

  // update balances
  useEffect(() => {
    const getData = () => {
      const { status } = { ...approveResponse };

      if (address && !calling && !["pending"].includes(status)) {
        const { chain } = { ...swap };

        getBalances(chain);
      }
    };

    getData();

    const interval = setInterval(() => getData(), 0.25 * 60 * 1000);

    return () => clearInterval(interval);
  }, [rpcs]);

  // update balances
  useEffect(() => {
    if (pools_data) {
      _.uniq(toArray(pools_data.map((p) => p?.chain_data?.id))).forEach((c) =>
        getBalances(c)
      );
    }
  }, [pools_data]);

  // get pair
  useEffect(() => {
    const getData = async () => {
      const { chain, asset, amount } = { ...swap };

      let failed, _pair;

      if (sdk && chain) {
        if (
          ["string", "number"].includes(typeof amount) &&
          ![""].includes(amount)
        ) {
          setSwapAmount(true);
        } else if (
          ["string", "number"].includes(typeof swapAmount) &&
          ![""].includes(swapAmount)
        ) {
          setSwapAmount(null);
        }

        const chain_changed = !equalsIgnoreCase(chain, pair?.chain_data?.id);

        const asset_changed = !equalsIgnoreCase(asset, pair?.asset_data?.id);

        if (
          chain_changed ||
          asset_changed ||
          !pair?.updated_at ||
          moment().diff(moment(pair.updated_at), "seconds") > 30
        ) {
          try {
            const { chain, asset, amount } = { ...swap };

            if (
              pair === undefined ||
              pair?.error ||
              chain_changed ||
              asset_changed
            ) {
              setPair(getPool(`${chain}_${asset}`, pools_data));
            }

            const chain_data = getChain(chain, chains_data);

            const { chain_id, domain_id } = { ...chain_data };

            const asset_data = getAsset(asset, pool_assets_data);

            const { contracts } = { ...asset_data };

            const contract_data = getContract(chain_id, contracts);

            const { contract_address, is_pool } = { ...contract_data };

            const pool =
              is_pool &&
              _.cloneDeep(
                await sdk.sdkPool.getPool(domain_id, contract_address)
              );

            const { lpTokenAddress, adopted, local } = { ...pool };

            if (adopted) {
              const { balance, decimals } = { ...adopted };

              adopted.balance = utils.formatUnits(
                BigInt(balance || "0"),
                decimals || 18
              );

              pool.adopted = adopted;
            }

            if (local) {
              const { balance, decimals } = { ...local };

              local.balance = utils.formatUnits(
                BigInt(balance || "0"),
                decimals || 18
              );

              pool.local = local;
            }

            let supply, rate, tvl;

            if (lpTokenAddress) {
              console.log("[getTokenSupply]", {
                domain_id,
                lpTokenAddress,
              });

              try {
                supply = await sdk.sdkPool.getTokenSupply(
                  domain_id,
                  lpTokenAddress
                );
                supply = utils.formatUnits(BigInt(supply), 18);

                console.log("[LPTokenSupply]", {
                  domain_id,
                  lpTokenAddress,
                  supply,
                });
              } catch (error) {
                console.log("[getTokenSupply error]", {
                  domain_id,
                  lpTokenAddress,
                  error,
                });
              }
            }

            if (pool) {
              console.log("[getVirtualPrice]", {
                domain_id,
                contract_address,
              });

              try {
                rate = await sdk.sdkPool.getVirtualPrice(
                  domain_id,
                  contract_address
                );
                rate = Number(utils.formatUnits(BigInt(rate || "0"), 18));

                console.log("[virtualPrice]", {
                  domain_id,
                  contract_address,
                  rate,
                });
              } catch (error) {
                console.log("[getVirtualPrice error]", {
                  domain_id,
                  contract_address,
                  error,
                });
              }
            }

            if (
              ["string", "number"].includes(typeof supply) ||
              (adopted?.balance && local?.balance)
            ) {
              const { price } = { ...getAsset(asset_data.id, assets_data) };

              tvl =
                Number(
                  supply ||
                    _.sum(
                      toArray(_.concat(adopted, local)).map(
                        (a) =>
                          Number(a.balance) / (index > 0 && rate > 0 ? rate : 1)
                      )
                    )
                ) * (price || 0);
            }

            _pair = (
              pool
                ? toArray(pool).map((p) => {
                    const { symbol } = { ...p };

                    const symbols = split(symbol, "normal", "-");

                    const asset_data = getAsset(
                      null,
                      pool_assets_data,
                      chain_id,
                      undefined,
                      symbols
                    );

                    return {
                      ...p,
                      chain_data,
                      asset_data,
                      symbols,
                    };
                  })
                : toArray(pair)
            ).find(
              (p) =>
                equalsIgnoreCase(p?.domainId, domain_id) &&
                equalsIgnoreCase(p?.asset_data?.id, asset)
            );

            _pair = _pair && {
              ..._pair,
              id: `${chain}_${asset}`,
              contract_data,
              supply: supply || _pair.supply,
              rate,
              tvl,
              updated_at: moment().valueOf(),
            };

            setPair(is_pool ? _pair : undefined);

            if (is_pool && _pair) {
              dispatch({
                type: POOLS_DATA,
                value: _pair,
              });
            }
          } catch (error) {
            console.log("[getPair error]", {
              swap,
              error,
            });

            setPair({ error });

            calculateSwap(null);

            failed = true;
          }
        } else {
          _pair = pair;
        }

        if (!failed) {
          calculateSwap(_pair);
        }
      }
    };

    getData();
  }, [sdk, swap, pairTrigger]);

  const reset = async (origin) => {
    const reset_swap = !["address", "user_rejected"].includes(origin);

    if (reset_swap) {
      setSwap({
        ...swap,
        amount: null,
      });
    }

    setOptions(DEFAULT_OPTIONS);

    setCalculateSwapResponse(null);

    setApproving(null);
    setApproveProcessing(null);
    setApproveResponse(null);

    setCalling(null);
    setCallProcessing(null);
    setCallResponse(null);

    setPairTrigger(moment().valueOf());
    setBalanceTrigger(moment().valueOf());

    const { chain } = { ...swap };

    getBalances(chain);
  };

  const getBalances = (chain) => {
    dispatch({
      type: GET_BALANCES_DATA,
      value: { chain },
    });
  };

  const call = async () => {
    setCalculateSwapResponse(null);
    setApproving(null);
    setCalling(true);

    let success = false;

    if (sdk) {
      let { amount, origin } = { ...swap };

      origin = origin || "x";

      const {
        chain_data,
        asset_data,
        contract_data,
        domainId,
        adopted,
        local,
        symbols,
      } = { ...pair };

      const { contract_address } = { ...contract_data };

      const x_asset_data = adopted?.address && {
        ...Object.fromEntries(
          Object.entries({ ...asset_data }).filter(
            ([k, v]) => !["contracts"].includes(k)
          )
        ),
        ...(equalsIgnoreCase(adopted.address, contract_address)
          ? contract_data
          : {
              chain_id,
              contract_address: adopted.address,
              decimals: adopted.decimals,
              symbol: adopted.symbol,
            }),
      };

      const y_asset_data = local?.address && {
        ...Object.fromEntries(
          Object.entries({ ...asset_data }).filter(
            ([k, v]) => !["contracts"].includes(k)
          )
        ),
        ...(equalsIgnoreCase(local.address, contract_address)
          ? contract_data
          : {
              chain_id,
              contract_address: local.address,
              decimals: local.decimals,
              symbol: local.symbol,
            }),
      };

      const { infiniteApprove, slippage } = { ...options };
      let { deadline } = { ...options };

      deadline = deadline && moment().add(deadline, "minutes").valueOf();

      let failed = false;

      const _decimals =
        (origin === "x" ? x_asset_data : y_asset_data)?.decimals || 18;
      const recv_decimals =
        (origin === "x" ? y_asset_data : x_asset_data)?.decimals || 18;

      let minDy = 0;

      if (!amount || ["0", "0.0"].includes(amount)) {
        failed = true;

        setApproving(false);
      } else {
        minDy = (
          Number(amount) *
          Number(
            (
              (100 -
                (typeof slippage === "number"
                  ? slippage
                  : DEFAULT_SWAP_SLIPPAGE_PERCENTAGE)) /
              100
            ).toFixed(recv_decimals)
          )
        ).toFixed(recv_decimals);

        amount = utils
          .parseUnits(
            (
              (typeof amount === "string" && amount.indexOf(".") > -1
                ? amount.substring(0, amount.indexOf(".") + _decimals + 1)
                : amount) || 0
            ).toString(),
            _decimals
          )
          .toString();
      }

      minDy = utils
        .parseUnits((minDy || 0).toString(), recv_decimals)
        .toString();

      if (!failed) {
        try {
          const approve_request = await sdk.sdkBase.approveIfNeeded(
            domainId,
            (origin === "x" ? x_asset_data : y_asset_data)?.contract_address,
            amount,
            infiniteApprove
          );

          if (approve_request) {
            setApproving(true);

            const approve_response = await signer.sendTransaction(
              approve_request
            );

            const { hash } = { ...approve_response };

            setApproveResponse({
              status: "pending",
              message: `Waiting for ${
                (origin === "x" ? x_asset_data : y_asset_data)?.symbol
              } approval`,
              tx_hash: hash,
            });

            setApproveProcessing(true);

            const approve_receipt = await signer.provider.waitForTransaction(
              hash
            );

            const { status } = { ...approve_receipt };

            setApproveResponse(
              status
                ? null
                : {
                    status: "failed",
                    message: `Failed to approve ${
                      (origin === "x" ? x_asset_data : y_asset_data)?.symbol
                    }`,
                    tx_hash: hash,
                  }
            );

            failed = !status;

            setApproveProcessing(false);
            setApproving(false);
          } else {
            setApproving(false);
          }
        } catch (error) {
          failed = true;

          const response = parseError(error);

          setApproveResponse({
            status: "failed",
            ...response,
          });

          setApproveProcessing(false);
          setApproving(false);
        }
      }

      if (!failed) {
        try {
          console.log("[swap]", {
            domainId,
            contract_address,
            from: (origin === "x" ? x_asset_data : y_asset_data)
              ?.contract_address,
            to: (origin === "x" ? y_asset_data : x_asset_data)
              ?.contract_address,
            amount,
            minDy,
            deadline,
          });

          const swap_request = await sdk.sdkPool.swap(
            domainId,
            contract_address,
            (origin === "x" ? x_asset_data : y_asset_data)?.contract_address,
            (origin === "x" ? y_asset_data : x_asset_data)?.contract_address,
            amount,
            minDy,
            deadline
          );

          if (swap_request) {
            let gasLimit = await signer.estimateGas(swap_request);

            if (gasLimit) {
              gasLimit = FixedNumber.fromString(gasLimit.toString())
                .mulUnsafe(
                  FixedNumber.fromString(GAS_LIMIT_ADJUSTMENT.toString())
                )
                .round(0)
                .toString()
                .replace(".0", "");

              swap_request.gasLimit = gasLimit;
            }

            const swap_response = await signer.sendTransaction(swap_request);

            const { hash } = { ...swap_response };

            setCallProcessing(true);

            const swap_receipt = await signer.provider.waitForTransaction(hash);

            const { status } = { ...swap_receipt };

            failed = !status;

            const _symbol = (
              origin === "x" ? symbols : _.reverse(_.cloneDeep(symbols))
            ).join("/");

            setCallResponse({
              status: failed ? "failed" : "success",
              message: failed
                ? `Failed to swap ${_symbol}`
                : `Swap ${_symbol} successful`,
              tx_hash: hash,
            });

            success = true;
          }
        } catch (error) {
          const response = parseError(error);

          let { message } = { ...response };

          if (message?.includes("cannot estimate gas")) {
            message =
              "Slippage exceeded. Please try increasing slippage tolerance and resubmitting your transfer.";
          } else if (message?.includes("dy < minDy")) {
            message =
              "Exceeded slippage tolerance. Please increase tolerance and try again.";
          }

          switch (response.code) {
            case "user_rejected":
              reset(response.code);
              break;
            default:
              setCallResponse({
                status: "failed",
                ...response,
                message,
              });
              break;
          }

          failed = true;
        }
      }
    }

    setCallProcessing(false);
    setCalling(false);

    if (sdk && address && success) {
      await sleep(1 * 1000);

      setPairTrigger(moment().valueOf());
      setBalanceTrigger(moment().valueOf());
    }
  };

  const calculateSwap = async (_pair) => {
    const { amount } = { ...swap };

    setCalculateSwapResponse(null);

    if (
      _pair &&
      ["string", "number"].includes(typeof amount) &&
      ![""].includes(amount)
    ) {
      let { amount, origin } = { ...swap };

      origin = origin || "x";

      const {
        asset_data,
        contract_data,
        domainId,
        lpTokenAddress,
        adopted,
        local,
      } = { ..._pair };

      const { contract_address } = { ...contract_data };

      const x_asset_data = adopted?.address && {
        ...Object.fromEntries(
          Object.entries({ ...asset_data }).filter(
            ([k, v]) => !["contracts"].includes(k)
          )
        ),
        ...(equalsIgnoreCase(adopted.address, contract_address)
          ? contract_data
          : {
              chain_id,
              contract_address: adopted.address,
              decimals: adopted.decimals,
              symbol: adopted.symbol,
            }),
      };

      const y_asset_data = local?.address && {
        ...Object.fromEntries(
          Object.entries({ ...asset_data }).filter(
            ([k, v]) => !["contracts"].includes(k)
          )
        ),
        ...(equalsIgnoreCase(local.address, contract_address)
          ? contract_data
          : {
              chain_id,
              contract_address: local.address,
              decimals: local.decimals,
              symbol: local.symbol,
            }),
      };

      if (Number(amount) <= 0) {
        setSwapAmount("0");
      } else {
        if (
          !(
            equalsIgnoreCase(domainId, pair?.domainId) &&
            equalsIgnoreCase(lpTokenAddress, pair?.lpTokenAddress)
          )
        ) {
          setSwapAmount(true);
          setPriceImpact(true);
        }

        try {
          amount = utils
            .parseUnits(
              (
                (typeof amount === "string" && amount.indexOf(".") > -1
                  ? amount.substring(
                      0,
                      amount.indexOf(".") +
                        ((origin === "x" ? x_asset_data : y_asset_data)
                          ?.decimals || 18) +
                        1
                    )
                  : amount) || 0
              ).toString(),
              (origin === "x" ? x_asset_data : y_asset_data)?.decimals || 18
            )
            .toString();

          calculateSwapPriceImpact(
            domainId,
            amount,
            (origin === "x" ? x_asset_data : y_asset_data)?.contract_address,
            (origin === "x" ? y_asset_data : x_asset_data)?.contract_address
          );

          console.log("[getPoolTokenIndex]", {
            domainId,
            contract_address,
            tokenAddress: (origin === "x" ? x_asset_data : y_asset_data)
              ?.contract_address,
          });

          const tokenIndexFrom = await sdk.sdkPool.getPoolTokenIndex(
            domainId,
            contract_address,
            (origin === "x" ? x_asset_data : y_asset_data)?.contract_address
          );

          console.log("[getPoolTokenIndex]", {
            domainId,
            contract_address,
            tokenAddress: (origin === "x" ? y_asset_data : x_asset_data)
              ?.contract_address,
          });

          const tokenIndexTo = await sdk.sdkPool.getPoolTokenIndex(
            domainId,
            contract_address,
            (origin === "x" ? y_asset_data : x_asset_data)?.contract_address
          );

          console.log("[calculateSwap]", {
            domainId,
            contract_address,
            tokenIndexFrom,
            tokenIndexTo,
            amount,
          });

          const _amount = await sdk.sdkPool.calculateSwap(
            domainId,
            contract_address,
            tokenIndexFrom,
            tokenIndexTo,
            amount
          );

          console.log("[amountToReceive]", {
            domainId,
            contract_address,
            tokenIndexFrom,
            tokenIndexTo,
            amount: _amount,
          });

          setSwapAmount(
            utils.formatUnits(
              BigInt(_amount || "0"),
              (origin === "x" ? y_asset_data : x_asset_data)?.decimals || 18
            )
          );
        } catch (error) {
          const response = parseError(error);

          console.log("[calculateSwap]", {
            error,
          });

          setCalculateSwapResponse({
            status: "failed",
            ...response,
          });

          setSwapAmount(null);
        }
      }
    } else {
      setSwapAmount(null);
      setPriceImpact(null);
    }
  };

  const calculateSwapPriceImpact = async (
    domainId,
    amount,
    x_contract_address,
    y_contract_address
  ) => {
    console.log("[calculateSwapPriceImpact]", {
      domainId,
      amount,
      x_contract_address,
      y_contract_address,
    });

    const price_impact = await sdk.sdkPool.calculateSwapPriceImpact(
      domainId,
      amount,
      x_contract_address,
      y_contract_address
    );

    console.log("[swapPriceImpact]", {
      domainId,
      amount,
      x_contract_address,
      y_contract_address,
      price_impact,
    });

    setPriceImpact(
      Number(utils.formatUnits(BigInt(price_impact || "0"), 18)) * 100
    );
  };

  const { chain, asset, amount } = { ...swap };
  let { origin } = { ...swap };

  origin = origin || "x";

  const chain_data = getChain(chain, chains_data);

  const { chain_id, name, image, explorer, color } = { ...chain_data };

  const { url, transaction_path } = { ...explorer };

  const { slippage } = { ...options };

  const { asset_data, contract_data, adopted, local, rate } = { ...pair };

  const { contract_address } = { ...contract_data };

  const _image = contract_data?.image;
  const image_paths = split(_image, "normal", "/");
  const image_name = _.last(image_paths);

  const x_asset_data = adopted?.address && {
    ...Object.fromEntries(
      Object.entries({ ...asset_data }).filter(
        ([k, v]) => !["contracts"].includes(k)
      )
    ),
    ...(equalsIgnoreCase(adopted.address, contract_address)
      ? contract_data
      : {
          chain_id,
          contract_address: adopted.address,
          decimals: adopted.decimals,
          symbol: adopted.symbol,
          image: _image
            ? !adopted.symbol
              ? _image
              : adopted.symbol.startsWith(WRAPPED_PREFIX)
              ? !image_name.startsWith(WRAPPED_PREFIX)
                ? image_paths
                    .map((s, i) =>
                      i === image_paths.length - 1 ? `${WRAPPED_PREFIX}${s}` : s
                    )
                    .join("/")
                : _image
              : !image_name.startsWith(WRAPPED_PREFIX)
              ? _image
              : image_paths
                  .map((s, i) =>
                    i === image_paths.length - 1
                      ? s.substring(WRAPPED_PREFIX.length)
                      : s
                  )
                  .join("/")
            : undefined,
        }),
  };

  const x_balance_amount =
    x_asset_data &&
    getBalance(chain_id, x_asset_data.contract_address, balances_data)?.amount;

  const y_asset_data = local?.address && {
    ...Object.fromEntries(
      Object.entries({ ...asset_data }).filter(
        ([k, v]) => !["contracts"].includes(k)
      )
    ),
    ...(equalsIgnoreCase(local.address, contract_address)
      ? contract_data
      : {
          chain_id,
          contract_address: local.address,
          decimals: local.decimals,
          symbol: local.symbol,
          image: _image
            ? !local.symbol
              ? _image
              : local.symbol.startsWith(WRAPPED_PREFIX)
              ? !image_name.startsWith(WRAPPED_PREFIX)
                ? image_paths
                    .map((s, i) =>
                      i === image_paths.length - 1 ? `${WRAPPED_PREFIX}${s}` : s
                    )
                    .join("/")
                : _image
              : !image_name.startsWith(WRAPPED_PREFIX)
              ? _image
              : image_paths
                  .map((s, i) =>
                    i === image_paths.length - 1
                      ? s.substring(WRAPPED_PREFIX.length)
                      : s
                  )
                  .join("/")
            : undefined,
        }),
  };

  const y_balance_amount =
    y_asset_data &&
    getBalance(chain_id, y_asset_data.contract_address, balances_data)?.amount;

  const valid_amount =
    typeof amount === "string" &&
    !["", "0", "0.0"].includes(amount) &&
    !isNaN(amount) &&
    utils
      .parseUnits(
        (amount.indexOf(".") > -1
          ? amount.substring(
              0,
              amount.indexOf(".") +
                ((origin === "x" ? x_asset_data : y_asset_data)?.decimals ||
                  18) +
                1
            )
          : amount) || "0",
        (origin === "x" ? x_asset_data : y_asset_data)?.decimals || 18
      )
      .toBigInt() <=
      utils
        .parseUnits(
          (
            (origin === "x" ? x_balance_amount : y_balance_amount) || 0
          ).toString(),
          (origin === "x" ? x_asset_data : y_asset_data)?.decimals || 18
        )
        .toBigInt();

  const disabled = swapAmount === true || calling || approving;

  const wrong_chain =
    chain_data && wallet_chain_id !== chain_id && !callResponse;

  const is_walletconnect =
    provider?.constructor?.name === "WalletConnectProvider";

  const boxShadow =
    color && `${color}${theme === "light" ? "44" : "33"} 0px 16px 128px 64px`;

  return (
    <div className="grid items-start grid-cols-1 gap-4 my-4 lg:grid-cols-8">
      <div className="hidden lg:block col-span-0 lg:col-span-2" />
      <div className="col-span-1 lg:col-span-4">
        <div className="flex flex-col items-center justify-center mx-1 my-4 space-y-6 sm:space-y-6 sm:my-6 sm:mx-4">
          <div className="w-full max-w-md space-y-3">
            <div
              className="px-4 pt-5 pb-6 space-y-8 bg-white border dark:bg-slate-900 rounded-2xl dark:border-slate-750 sm:pt-6 sm:pb-7 sm:px-6"
              style={
                chain && boxShadow
                  ? {
                      boxShadow,
                      WebkitBoxShadow: boxShadow,
                      MozBoxShadow: boxShadow,
                    }
                  : undefined
              }
            >
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-1.5">
                  <h1 className="text-xl font-semibold">Swap on</h1>
                  <SelectChain
                    value={
                      chain || getChain(null, chains_data, true, true, true)?.id
                    }
                    onSelect={(c) => {
                      setSwap({
                        ...swap,
                        chain: c,
                      });
                    }}
                    isPool={true}
                    noShadow={true}
                    className="w-fit flex items-center justify-center space-x-1.5 sm:space-x-2 mt-0.25"
                  />
                </div>
                <Options
                  disabled={disabled}
                  applied={
                    !_.isEqual(
                      Object.fromEntries(
                        Object.entries(options).filter(
                          ([k, v]) => !["slippage"].includes(k)
                        )
                      ),
                      Object.fromEntries(
                        Object.entries(DEFAULT_OPTIONS).filter(
                          ([k, v]) => !["slippage"].includes(k)
                        )
                      )
                    )
                  }
                  initialData={options}
                  onChange={(o) => setOptions(o)}
                />
              </div>
              <div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between space-x-2">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-500">
                      Pay with
                    </span>
                    {chain_data &&
                      asset &&
                      (origin === "x" ? x_asset_data : y_asset_data) && (
                        <div className="flex items-center justify-between space-x-2">
                          <div className="flex items-center space-x-1">
                            <div className="text-sm font-medium text-slate-400 dark:text-slate-500">
                              Balance:
                            </div>
                            <button
                              disabled={disabled}
                              onClick={() => {
                                const amount =
                                  origin === "x"
                                    ? x_balance_amount
                                    : y_balance_amount;

                                if (
                                  ["string", "number"].includes(
                                    typeof amount
                                  ) &&
                                  ![""].includes(amount)
                                ) {
                                  setSwap({
                                    ...swap,
                                    amount,
                                  });

                                  setSwapAmount(true);
                                }
                              }}
                            >
                              <Balance
                                chainId={chain_id}
                                asset={asset}
                                contractAddress={
                                  (origin === "x" ? x_asset_data : y_asset_data)
                                    .contract_address
                                }
                                decimals={
                                  (origin === "x" ? x_asset_data : y_asset_data)
                                    .decimals
                                }
                                symbol={
                                  (origin === "x" ? x_asset_data : y_asset_data)
                                    .symbol
                                }
                                hideSymbol={false}
                                trigger={balanceTrigger}
                              />
                            </button>
                          </div>
                        </div>
                      )}
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl border dark:border-slate-700 space-y-0.5 py-2.5 px-3">
                    <div className="flex items-center justify-between space-x-2">
                      <SelectAsset
                        disabled={disabled}
                        value={asset}
                        onSelect={(a, c) => {
                          setSwap({
                            ...swap,
                            asset: a,
                            amount: null,
                            origin:
                              [
                                x_asset_data?.contract_address,
                                y_asset_data?.contract_address,
                              ].findIndex((_c) => equalsIgnoreCase(_c, c)) > -1
                                ? origin === "x"
                                  ? equalsIgnoreCase(
                                      c,
                                      y_asset_data?.contract_address
                                    )
                                    ? "y"
                                    : origin
                                  : equalsIgnoreCase(
                                      c,
                                      x_asset_data?.contract_address
                                    )
                                  ? "x"
                                  : origin
                                : origin,
                          });

                          getBalances(chain);
                        }}
                        chain={chain}
                        isPool={true}
                        data={origin === "x" ? x_asset_data : y_asset_data}
                        className="flex items-center space-x-1.5 sm:space-x-2 sm:-ml-1"
                      />
                      <DebounceInput
                        debounceTimeout={750}
                        size="small"
                        type="number"
                        placeholder="0.00"
                        disabled={
                          (disabled && swapAmount !== true) || !asset || !pair
                        }
                        value={
                          ["string", "number"].includes(typeof amount) &&
                          ![""].includes(amount) &&
                          !isNaN(amount)
                            ? amount
                            : ""
                        }
                        onChange={(e) => {
                          const regex = /^[0-9.\b]+$/;

                          let value;

                          if (
                            e.target.value === "" ||
                            regex.test(e.target.value)
                          ) {
                            value = e.target.value;
                          }

                          if (typeof value === "string") {
                            if (value.startsWith(".")) {
                              value = `0${value}`;
                            }

                            value = numberToFixed(
                              value,
                              (origin === "x" ? x_asset_data : y_asset_data)
                                ?.decimals || 18
                            );
                          }

                          setSwap({
                            ...swap,
                            amount: value,
                          });

                          setSwapAmount(true);
                        }}
                        onWheel={(e) => e.target.blur()}
                        onKeyDown={(e) =>
                          ["e", "E", "-"].includes(e.key) && e.preventDefault()
                        }
                        className={`w-36 sm:w-48 bg-transparent ${
                          disabled ? "cursor-not-allowed" : ""
                        } rounded border-0 focus:ring-0 sm:text-lg font-semibold text-right py-1.5`}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center mt-2 mb-0.5">
                  <button
                    disabled={disabled || !pair}
                    onClick={() => {
                      if (!disabled) {
                        setSwap({
                          ...swap,
                          origin: origin === "x" ? "y" : "x",
                          amount: null,
                        });
                        setSwapAmount(null);
                        setButtonDirection(buttonDirection * -1);

                        getBalances(chain);
                      }
                    }}
                    className={`bg-slate-100 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 ${
                      disabled ? "cursor-not-allowed" : ""
                    } rounded-full sm:border dark:border-slate-700 flex items-center justify-center p-1.5 sm:p-4`}
                  >
                    <HiSwitchVertical
                      size={28}
                      style={
                        buttonDirection < 0
                          ? {
                              transform: "scaleX(-1)",
                            }
                          : undefined
                      }
                    />
                  </button>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between space-x-2">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-500">
                      You Receive
                    </span>
                    {chain_data &&
                      asset &&
                      (origin === "x" ? y_asset_data : x_asset_data) && (
                        <div className="flex items-center justify-between space-x-2">
                          <div className="flex items-center space-x-1">
                            <div className="text-sm font-medium text-slate-400 dark:text-slate-500">
                              Balance:
                            </div>
                            <button
                              disabled={disabled}
                              className="cursor-default"
                            >
                              <Balance
                                chainId={chain_id}
                                asset={asset}
                                contractAddress={
                                  (origin === "x" ? y_asset_data : x_asset_data)
                                    .contract_address
                                }
                                decimals={
                                  (origin === "x" ? y_asset_data : x_asset_data)
                                    .decimals
                                }
                                symbol={
                                  (origin === "x" ? y_asset_data : x_asset_data)
                                    .symbol
                                }
                                hideSymbol={false}
                                trigger={balanceTrigger}
                              />
                            </button>
                          </div>
                        </div>
                      )}
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl border dark:border-slate-700 space-y-0.5 py-2.5 px-3">
                    <div className="flex items-center justify-between space-x-2">
                      <SelectAsset
                        disabled={disabled}
                        value={asset}
                        onSelect={(a, c) => {
                          setSwap({
                            ...swap,
                            asset: a,
                            amount: null,
                            origin:
                              [
                                x_asset_data?.contract_address,
                                y_asset_data?.contract_address,
                              ].findIndex((_c) => equalsIgnoreCase(_c, c)) > -1
                                ? origin === "x"
                                  ? equalsIgnoreCase(
                                      c,
                                      x_asset_data?.contract_address
                                    )
                                    ? "y"
                                    : origin
                                  : equalsIgnoreCase(
                                      c,
                                      y_asset_data?.contract_address
                                    )
                                  ? "x"
                                  : origin
                                : origin,
                          });

                          getBalances(chain);
                        }}
                        chain={chain}
                        isPool={true}
                        data={origin === "x" ? y_asset_data : x_asset_data}
                        className="flex items-center space-x-1.5 sm:space-x-2 sm:-ml-1"
                      />
                      {swapAmount === true ? (
                        <div className="w-36 sm:w-48 flex items-center justify-end py-1.5">
                          <div>
                            <Oval
                              width="20"
                              height="20"
                              color={loaderColor(theme)}
                            />
                          </div>
                        </div>
                      ) : (
                        <DecimalsFormat
                          value={
                            ["string", "number"].includes(typeof swapAmount) &&
                            ![""].includes(swapAmount) &&
                            Number(swapAmount) >= 0
                              ? swapAmount
                              : ["string", "number"].includes(typeof amount) &&
                                ![""].includes(amount)
                              ? "0.00"
                              : "0.00"
                          }
                          className={`w-36 sm:w-48 bg-transparent ${
                            ["", undefined].includes(amount)
                              ? "text-slate-500 dark:text-slate-500"
                              : ""
                          } sm:text-lg font-semibold text-right py-1.5`}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {chain && asset && pair && !pair.error && Number(amount) > 0 && (
                <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl border dark:border-slate-700 space-y-2.5 py-3.5 px-3">
                  <div className="flex items-center justify-between space-x-1">
                    <div className="text-sm font-medium whitespace-nowrap text-slate-500 dark:text-slate-500">
                      Rate
                    </div>
                    <span className="whitespace-nowrap text-sm font-semibold space-x-1.5">
                      <DecimalsFormat value={rate} className="text-sm" />
                    </span>
                  </div>
                  <div className="flex flex-col space-y-0.5">
                    <div className="flex items-start justify-between space-x-1">
                      <Tooltip
                        placement="top"
                        content="The maximum percentage you are willing to lose due to market changes."
                        className="z-50 text-xs text-white bg-dark"
                      >
                        <div className="flex items-center">
                          <div className="text-sm font-medium whitespace-nowrap text-slate-500 dark:text-slate-500">
                            Slippage Tolerance
                          </div>
                          <BiInfoCircle
                            size={14}
                            className="block ml-1 sm:hidden text-slate-400 dark:text-slate-500 sm:ml-0"
                          />
                        </div>
                      </Tooltip>
                      <div className="flex flex-col sm:items-end space-y-1.5">
                        {slippageEditing ? (
                          <>
                            <div className="flex items-center justify-end space-x-1.5">
                              <DebounceInput
                                debounceTimeout={750}
                                size="small"
                                type="number"
                                placeholder="0.00"
                                value={
                                  typeof slippage === "number" && slippage >= 0
                                    ? slippage
                                    : ""
                                }
                                onChange={(e) => {
                                  const regex = /^[0-9.\b]+$/;

                                  let value;

                                  if (
                                    e.target.value === "" ||
                                    regex.test(e.target.value)
                                  ) {
                                    value = e.target.value;
                                  }

                                  if (typeof value === "string") {
                                    if (value.startsWith(".")) {
                                      value = `0${value}`;
                                    }

                                    if (!isNaN(value)) {
                                      value = Number(value);
                                    }
                                  }

                                  value =
                                    value <= 0 || value > 100
                                      ? DEFAULT_SWAP_SLIPPAGE_PERCENTAGE
                                      : value;

                                  setOptions({
                                    ...options,
                                    slippage:
                                      value && !isNaN(value)
                                        ? parseFloat(Number(value).toFixed(6))
                                        : value,
                                  });
                                }}
                                onWheel={(e) => e.target.blur()}
                                onKeyDown={(e) =>
                                  ["e", "E", "-"].includes(e.key) &&
                                  e.preventDefault()
                                }
                                className="w-20 px-2 py-1 text-sm font-semibold text-right border-0 rounded bg-slate-100 focus:bg-slate-200 dark:bg-slate-800 dark:focus:bg-slate-700 focus:ring-0"
                              />
                              <button
                                onClick={() => setSlippageEditing(false)}
                                className="flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-black dark:text-slate-200 dark:hover:text-white"
                              >
                                <BiCheckCircle size={16} />
                              </button>
                            </div>
                            <div className="flex items-center space-x-1.5 -mr-1.5">
                              {[3.0, 1.0, 0.5].map((s, i) => (
                                <div
                                  key={i}
                                  onClick={() => {
                                    setOptions({
                                      ...options,
                                      slippage: s,
                                    });
                                    setSlippageEditing(false);
                                  }}
                                  className={`${
                                    slippage === s
                                      ? "bg-slate-200 dark:bg-slate-700 font-bold"
                                      : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 font-medium hover:font-semibold"
                                  } rounded cursor-pointer text-xs py-1 px-1.5`}
                                >
                                  {s} %
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center space-x-1.5">
                            <DecimalsFormat
                              value={slippage}
                              suffix="%"
                              className="text-sm font-semibold"
                            />
                            <button
                              disabled={disabled}
                              onClick={() => {
                                if (!disabled) {
                                  setSlippageEditing(true);
                                }
                              }}
                              className="rounded-full flex items-center justify-center text-slate-400 hover:text-black dark:text-slate-200 dark:hover:text-white mt-0.5"
                            >
                              <BiEditAlt size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {typeof slippage === "number" &&
                      (slippage < 0.2 || slippage > 5.0) && (
                        <div className="flex items-center space-x-1">
                          <IoWarning
                            size={16}
                            className="min-w-max text-yellow-500 dark:text-yellow-400 mt-0.5"
                          />
                          <div className="text-xs text-yellow-500 dark:text-yellow-400">
                            {slippage < 0.2
                              ? "Your transfer may not complete due to low slippage tolerance."
                              : "Your transfer may be frontrun due to high slippage tolerance."}
                          </div>
                        </div>
                      )}
                  </div>
                  {typeof priceImpact === "number" && (
                    <div className="flex items-center justify-between space-x-1">
                      <Tooltip
                        placement="top"
                        content="Price impact"
                        className="z-50 text-xs text-white bg-dark"
                      >
                        <div className="flex items-center">
                          <div className="text-sm font-medium whitespace-nowrap text-slate-500 dark:text-slate-500">
                            Price Impact
                          </div>
                          <BiInfoCircle
                            size={14}
                            className="block ml-1 sm:hidden text-slate-400 dark:text-slate-500 sm:ml-0"
                          />
                        </div>
                      </Tooltip>
                      <DecimalsFormat
                        value={priceImpact}
                        suffix="%"
                        className="whitespace-nowrap text-sm font-semibold space-x-1.5"
                      />
                    </div>
                  )}
                </div>
              )}
              {browser_provider && wrong_chain ? (
                <Wallet
                  connectChainId={chain_id}
                  className="w-full bg-[#14f094] hover:bg-[#00CC66] dark:[#14f094] dark:hover:bg-[#00CC66] rounded-xl flex items-center justify-center text-black text-base font-medium space-x-1.5 sm:space-x-2 py-3 sm:py-4 px-2 sm:px-3"
                >
                  <span className="mr-1.5 sm:mr-2">
                    {is_walletconnect ? "Reconnect" : "Switch"} to
                  </span>
                  {image && (
                    <Image
                      src={image}
                      width={28}
                      height={28}
                      className="rounded-full"
                    />
                  )}
                  <span className="font-semibold">{name}</span>
                </Wallet>
              ) : chain &&
                asset &&
                (origin === "x" ? x_balance_amount : y_balance_amount) &&
                ((["string", "number"].includes(typeof amount) &&
                  ![""].includes(amount)) ||
                  browser_provider) ? (
                !callResponse &&
                !calling &&
                ["string", "number"].includes(typeof amount) &&
                ![""].includes(amount) &&
                (Number(amount) < 0 ||
                  (utils
                    .parseUnits(
                      (typeof amount === "string" && amount.indexOf(".") > -1
                        ? amount.substring(
                            0,
                            amount.indexOf(".") +
                              ((origin === "x" ? x_asset_data : y_asset_data)
                                ?.decimals || 18) +
                              1
                          )
                        : amount) || "0",
                      (origin === "x" ? x_asset_data : y_asset_data).decimals ||
                        18
                    )
                    .toBigInt() >
                    utils
                      .parseUnits(
                        (origin === "x"
                          ? x_balance_amount
                          : y_balance_amount) || "0",
                        (origin === "x" ? x_asset_data : y_asset_data)
                          .decimals || 18
                      )
                      .toBigInt() &&
                    ["string", "number"].includes(
                      typeof (origin === "x"
                        ? x_balance_amount
                        : y_balance_amount)
                    ))) ? (
                  <Alert
                    color="bg-red-400 dark:bg-red-500 text-white text-sm font-medium"
                    icon={
                      <BiMessageError className="w-4 h-4 mr-3 stroke-current sm:w-6 sm:h-6" />
                    }
                    closeDisabled={true}
                    rounded={true}
                    className="rounded p-4.5"
                  >
                    <span>
                      {Number(amount) < 0
                        ? "The amount cannot be equal to or less than 0."
                        : "Insufficient Balance"}
                    </span>
                  </Alert>
                ) : !(callResponse || calculateSwapResponse) ? (
                  <button
                    disabled={disabled || !pair || !valid_amount}
                    onClick={() => {
                      setSlippageEditing(false);
                      call();
                    }}
                    className={`w-full rounded-2xl ${
                      disabled || !pair || !valid_amount
                        ? calling || approving
                          ? "bg-blue-400 dark:bg-blue-500 text-white"
                          : "bg-slate-100 dark:bg-slate-800 pointer-events-none cursor-not-allowed text-slate-400 dark:text-slate-500"
                        : " bg-[#14f094] hover:bg-[#00CC66] dark:[#14f094] dark:hover:bg-[#00CC66] cursor-pointer text-white"
                    } rounded-xl text-base text-center py-3 sm:py-4 px-2 sm:px-3`}
                  >
                    <span className="flex items-center justify-center space-x-1.5">
                      {disabled && (
                        <TailSpin width="20" height="20" color="white" />
                      )}
                      <span>
                        {calling
                          ? approving
                            ? approveProcessing
                              ? "Approving"
                              : "Please Approve"
                            : callProcessing
                            ? "Swapping"
                            : typeof approving === "boolean"
                            ? "Please Confirm"
                            : "Checking Approval"
                          : swapAmount === true
                          ? "Calculating"
                          : ["string", "number"].includes(typeof amount) &&
                            !["", "0", "0.0"].includes(amount)
                          ? "Swap"
                          : "Enter amount"}
                      </span>
                    </span>
                  </button>
                ) : (
                  (callResponse || approveResponse || calculateSwapResponse) &&
                  toArray(
                    callResponse || approveResponse || calculateSwapResponse
                  ).map((r, i) => {
                    const { status, message, code, tx_hash } = { ...r };

                    return (
                      <Alert
                        key={i}
                        color={`${
                          status === "failed"
                            ? "bg-red-400 dark:bg-red-500"
                            : status === "success"
                            ? "bg-green-400 dark:bg-green-500"
                            : "bg-blue-400 dark:bg-blue-500"
                        } text-white`}
                        icon={
                          status === "failed" ? (
                            <BiMessageError className="w-4 h-4 mr-3 stroke-current sm:w-6 sm:h-6" />
                          ) : status === "success" ? (
                            <BiMessageCheck className="w-4 h-4 mr-3 stroke-current sm:w-6 sm:h-6" />
                          ) : status === "pending" ? (
                            <div className="mr-3">
                              <Watch width="20" height="20" color="white" />
                            </div>
                          ) : (
                            <BiMessageDetail className="w-4 h-4 mr-3 stroke-current sm:w-6 sm:h-6" />
                          )
                        }
                        closeDisabled={true}
                        rounded={true}
                        className="rounded p-4.5"
                      >
                        <div className="flex items-center justify-between space-x-2">
                          <span className="text-sm font-medium break-words">
                            {ellipse(
                              split(message, "normal", " ")
                                .join(" ")
                                .substring(
                                  0,
                                  status === "failed" &&
                                    errorPatterns.findIndex(
                                      (c) => message?.indexOf(c) > -1
                                    ) > -1
                                    ? message.indexOf(
                                        errorPatterns.find(
                                          (c) => message.indexOf(c) > -1
                                        )
                                      )
                                    : undefined
                                ) || message,
                              128
                            )}
                          </span>
                          <div className="flex items-center space-x-1">
                            {status === "failed" &&
                              message &&
                              !calculateSwapResponse && (
                                <Copy
                                  value={message}
                                  className="cursor-pointer text-slate-200 hover:text-white"
                                />
                              )}
                            {url && tx_hash && (
                              <a
                                href={`${url}${transaction_path?.replace(
                                  "{tx}",
                                  tx_hash
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <TiArrowRight
                                  size={20}
                                  className="transform -rotate-45"
                                />
                              </a>
                            )}
                            {status === "failed" ? (
                              <button
                                onClick={() => reset(code)}
                                className="flex items-center justify-center p-1 text-white bg-red-500 rounded-full dark:bg-red-400"
                              >
                                <MdClose size={14} />
                              </button>
                            ) : status === "success" ? (
                              <button
                                onClick={() => reset()}
                                className="flex items-center justify-center p-1 text-white bg-green-500 rounded-full dark:bg-green-400"
                              >
                                <MdClose size={14} />
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </Alert>
                    );
                  })
                )
              ) : browser_provider ? (
                <button
                  disabled={true}
                  onClick={() => call()}
                  className="w-full px-2 py-3 text-base text-center cursor-not-allowed rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 sm:text-base sm:py-4 sm:px-3"
                >
                  {!asset ? (
                    "Swap"
                  ) : pair === undefined ? (
                    `Route doesn't exist`
                  ) : pair ? (
                    pair.error ? (
                      <div className="mx-auto text-sm text-left text-red-600 break-words max-w-fit dark:text-red-400">
                        {pair.error.message}
                      </div>
                    ) : (
                      "Enter amount"
                    )
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <div>
                        <TailSpin
                          width="20"
                          height="20"
                          color={loaderColor(theme)}
                        />
                      </div>
                      <span className="text-base text-slate-400 dark:text-slate-500">
                        Fetching pair information ...
                      </span>
                    </div>
                  )}
                </button>
              ) : (
                <Wallet
                  connectChainId={chain_id}
                  buttonConnectTitle="Connect Wallet"
                  className="w-full px-2 py-3 text-base font-lg text-center rounded-xl text-black bg-[#14f094] hover:bg-[#00CC66] dark:[#14f094] dark:hover:bg-[#00CC66] sm:space-x-2 sm:py-4 sm:px-3"
                >
                  <span>Connect Wallet</span>
                </Wallet>
              )}
            </div>
            {process.env.NEXT_PUBLIC_EXPLORER_URL && (
        <div className="flex flex-wrap items-center mx-5 ml-4 space-x-1 text-xs">
          <a
            href={process.env.NEXT_PUBLIC_EXPLORER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1"
          >
            <span className="font-medium text-slate-400 dark:text-slate-500">
              Built with
            </span>
            <span className="font-bold text-green-500 dark:text-white">
              Connext Protocol SDK v1.0.3-alpha.0
            </span>
          </a>
        </div>
      )}
          </div>
        </div>
      </div>
      
    </div>
  );
};
