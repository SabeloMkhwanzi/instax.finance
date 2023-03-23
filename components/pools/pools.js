import Link from "next/link";
import { useState, useEffect } from "react";
import { useSelector, shallowEqual } from "react-redux";
import _ from "lodash";
import { TailSpin } from "react-loader-spinner";
import { Tooltip } from "@material-tailwind/react";
import { MdKeyboardArrowUp, MdKeyboardArrowDown } from "react-icons/md";

import Datatable from "../datatable";
import DecimalsFormat from "../decimals-format";
import Image from "../image";
import { ProgressBar } from "../progress-bars";
import { currency_symbol } from "../../lib/object/currency";
import { getChain } from "../../lib/object/chain";
import { getAsset } from "../../lib/object/asset";
import { getPool } from "../../lib/object/pool";
import { toArray, equalsIgnoreCase, loaderColor } from "../../lib/utils";

const WRAPPED_PREFIX = process.env.NEXT_PUBLIC_WRAPPED_PREFIX;

export default ({ view, userPoolsData }) => {
  const { preferences, chains, assets, pool_assets, pools, wallet } =
    useSelector(
      (state) => ({
        preferences: state.preferences,
        chains: state.chains,
        assets: state.assets,
        pool_assets: state.pool_assets,
        pools: state.pools,
        wallet: state.wallet,
      }),
      shallowEqual
    );
  const { theme } = { ...preferences };
  const { chains_data } = { ...chains };
  const { assets_data } = { ...assets };
  const { pool_assets_data } = { ...pool_assets };
  const { pools_data } = { ...pools };
  const { wallet_data } = { ...wallet };
  const { chain_id, address } = { ...wallet_data };

  const [uncollapseAssetIds, setUncollapseAssetIds] = useState(null);

  useEffect(() => {
    if (pools_data && (!uncollapseAssetIds || uncollapseAssetIds.length < 4)) {
      setUncollapseAssetIds(toArray(pools_data.map((p) => p?.asset_data?.id)));
    }
  }, [pools_data]);

  const data =
    view === "my_positions"
      ? userPoolsData
        ? userPoolsData
            .filter((d) => Number(d?.lpTokenBalance) > 0)
            .map((d) => {
              const { chain_data, asset_data, lpTokenBalance } = { ...d };
              let { id, share } = { ...d };

              id = id || `${chain_data?.id}_${asset_data?.id}`;

              const pool_data = getPool(id, pools_data);

              const { adopted, local, supply } = { ...pool_data };

              share = !isNaN(supply)
                ? (Number(lpTokenBalance) * 100) / Number(supply)
                : share;

              const { price } = { ...getAsset(asset_data?.id, assets_data) };

              const tvl =
                Number(
                  supply ||
                    _.sum(
                      toArray(_.concat(adopted, local)).map((a) =>
                        Number(a.balance)
                      )
                    )
                ) * (price || 0);

              return {
                ...d,
                share,
                tvl,
              };
            })
        : null
      : pools_data || pool_assets_data?.length === 0
      ? _.orderBy(
          Object.entries(_.groupBy(toArray(pools_data), "asset_data.id")).map(
            ([k, v]) => {
              return {
                id: k,
                asset_data: _.head(v)?.asset_data,
                i: toArray(pool_assets_data).findIndex((a) =>
                  equalsIgnoreCase(a?.id, k)
                ),
                pools: _.orderBy(
                  toArray(
                    _.concat(
                      v,
                      toArray(pool_assets_data)
                        .filter((a) =>
                          equalsIgnoreCase(
                            a?.id,
                            getAsset(k, pool_assets_data)?.id
                          )
                        )
                        .flatMap((a) =>
                          toArray(a.contracts).filter(
                            (c) =>
                              v.findIndex(
                                (d) => d.chain_data?.chain_id === c?.chain_id
                              ) < 0
                          )
                        )
                        .map((d) => {
                          const chain_data = getChain(d.chain_id, chains_data);
                          const asset_data = getAsset(k, pool_assets_data);

                          if (chain_data && asset_data) {
                            const { chain_id } = { ...chain_data };

                            const contract_data = d;

                            return {
                              id: `${chain_data.id}_${asset_data.id}`,
                              name: `${
                                contract_data.symbol || asset_data.symbol
                              } Pool`,
                              chain_id,
                              chain_data,
                              asset_data,
                              contract_data,
                            };
                          } else {
                            return null;
                          }
                        })
                    )
                  ).map((d) => {
                    const { chain_data, tvl, apy } = { ...d };

                    return {
                      ...d,
                      i: toArray(chains_data).findIndex((c) =>
                        equalsIgnoreCase(c?.id, chain_data?.id)
                      ),
                      _tvl: !isNaN(tvl) ? tvl : -1,
                      _apy: !isNaN(apy) ? apy : -1,
                    };
                  }),
                  ["i", "_tvl", "_apy"],
                  ["asc", "desc", "desc"]
                ),
              };
            }
          ),
          ["i"],
          ["asc"]
        )
      : null;

  const chain_data = address && getChain(chain_id, chains_data);

  const { color } = { ...chain_data };

  const boxShadow = `${color || "#e53f3f"}${
    theme === "light" ? "44" : "33"
  } 0px 32px 128px 64px`;

  const no_positions = view === "my_positions" && data && data.length < 1;

  return data ? (
    <div className="grid my-4 sm:my-6">
      {no_positions ? (
        <div className="ml-2 whitespace-nowrap text-slate-800 dark:text-slate-200">
          You currently don't have any positions.
        </div>
      ) : (
        <>
          <div
            className="w-32 mx-auto sm:w-64"
            style={{
              boxShadow,
              WebkitBoxShadow: boxShadow,
              MozBoxShadow: boxShadow,
            }}
          />
          <Datatable
            columns={[
              {
                Header: "Token",
                accessor: "asset_data",
                disableSortBy: true,
                Cell: (props) => {
                  const { row, value } = { ...props };

                  const { id, pools, chain_data, asset_data, contract_data } = {
                    ...row.original,
                  };
                  let { name } = { ...row.original };

                  const { image, symbol } = { ...value };

                  const _symbol =
                    view === "my_positions"
                      ? contract_data?.symbol || symbol
                      : symbol;
                  name = name || _symbol;

                  const chain = chain_data?.id;
                  const asset = asset_data?.id;

                  return (
                    <div className="flex flex-col space-y-3">
                      {view === "my_positions" ? (
                        <Link
                          href={`/pool/${
                            chain
                              ? `${
                                  asset ? `${asset.toUpperCase()}-` : ""
                                }on-${chain}`
                              : ""
                          }`}
                          className="flex items-center h-6 font-medium"
                        >
                          {name}
                        </Link>
                      ) : (
                        <>
                          <div className="flex items-center h-6 space-x-2">
                            {image && (
                              <Image
                                src={image}
                                width={24}
                                height={24}
                                className="rounded-full"
                              />
                            )}
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                              {_symbol}
                            </span>
                          </div>
                          {uncollapseAssetIds?.includes(id) &&
                            toArray(pools).map((p, i) => {
                              const { chain_data, asset_data, contract_data } =
                                { ...p };
                              let { name } = { ...p };
                              let { symbol } = { ...contract_data };

                              symbol = symbol || asset_data?.symbol;
                              name = name || symbol;

                              const chain = chain_data?.id;
                              const asset = asset_data?.id;

                              return (
                                <Link
                                  key={i}
                                  href={`/pool/${
                                    chain
                                      ? `${
                                          asset ? `${asset.toUpperCase()}-` : ""
                                        }on-${chain}`
                                      : ""
                                  }`}
                                  className="flex items-center h-6 ml-8 font-medium"
                                >
                                  {name}
                                </Link>
                              );
                            })}
                        </>
                      )}
                    </div>
                  );
                },
              },
              {
                Header: "Chains",
                accessor: "chain_data",
                disableSortBy: true,
                Cell: (props) => {
                  const { row, value } = { ...props };

                  const { id, pools, chain_data, asset_data } = {
                    ...row.original,
                  };

                  const { name, image } = { ...value };

                  const chain = chain_data?.id;
                  const asset = asset_data?.id;

                  const onClick = () => {
                    if (pools?.length > 0) {
                      setUncollapseAssetIds(
                        uncollapseAssetIds?.includes(id)
                          ? uncollapseAssetIds.filter((_id) => _id !== id)
                          : _.concat(toArray(uncollapseAssetIds), id)
                      );
                    }
                  };

                  return (
                    <div className="flex flex-col space-y-3">
                      {view === "my_positions" ? (
                        <Link
                          href={`/pool/${
                            chain
                              ? `${
                                  asset ? `${asset.toUpperCase()}-` : ""
                                }on-${chain}`
                              : ""
                          }`}
                        >
                          <div className="flex items-center h-6 space-x-2 min-w-max">
                            {image && (
                              <Image
                                src={image}
                                width={24}
                                height={24}
                                className="rounded-full"
                              />
                            )}
                            <span className="text-sm font-medium">{name}</span>
                          </div>
                        </Link>
                      ) : (
                        <>
                          <div
                            onClick={() => onClick()}
                            className={`w-fit h-6 ${
                              pools?.length > 0 ? "cursor-pointer" : ""
                            } flex items-center`}
                          >
                            {pools?.length > 0 ? (
                              <>
                                {_.slice(pools, 0, 3).map((p, i) => {
                                  const { chain_data } = { ...p };

                                  const { name, image } = { ...chain_data };

                                  return (
                                    <div
                                      key={i}
                                      title={name}
                                      className="w-5 h-6 flex items-center mr-1.5"
                                    >
                                      {image && (
                                        <Image
                                          src={image}
                                          width={20}
                                          height={20}
                                          className="rounded-full"
                                        />
                                      )}
                                    </div>
                                  );
                                })}
                                {pools.length > 3 && (
                                  <div className="flex items-center h-6">
                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                      (+{pools.length - 3})
                                    </span>
                                  </div>
                                )}
                                <div className="mr-1.5">
                                  <button
                                    onClick={() => onClick()}
                                    className="flex items-center justify-center w-5 h-6 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900"
                                  >
                                    {uncollapseAssetIds?.includes(id) ? (
                                      <MdKeyboardArrowUp size={16} />
                                    ) : (
                                      <MdKeyboardArrowDown size={16} />
                                    )}
                                  </button>
                                </div>
                              </>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500">
                                No chains supported
                              </span>
                            )}
                          </div>
                          {uncollapseAssetIds?.includes(id) &&
                            toArray(pools).map((p, i) => {
                              const { chain_data, asset_data } = { ...p };

                              const { name, image } = { ...chain_data };

                              const chain = chain_data?.id;
                              const asset = asset_data?.id;

                              return (
                                <Link
                                  key={i}
                                  href={`/pool/${
                                    chain
                                      ? `${
                                          asset ? `${asset.toUpperCase()}-` : ""
                                        }on-${chain}`
                                      : ""
                                  }`}
                                >
                                  <div className="flex items-center h-6 space-x-2">
                                    {image && (
                                      <Image
                                        src={image}
                                        width={24}
                                        height={24}
                                        className="rounded-full"
                                      />
                                    )}
                                    <span className="hidden text-sm font-medium sm:block">
                                      {name}
                                    </span>
                                  </div>
                                </Link>
                              );
                            })}
                        </>
                      )}
                    </div>
                  );
                },
              },
              {
                Header: "Pool Ratio",
                accessor: "assets",
                sortType: (a, b) => (a.original.tvl > b.original.tvl ? 1 : -1),
                Cell: (props) => {
                  const { row } = { ...props };

                  const { id, asset_data, pools } = { ...row.original };

                  const native_assets = toArray(pools).map((p) => {
                    const { adopted, local } = { ...p };

                    const asset = !adopted?.symbol?.startsWith(WRAPPED_PREFIX)
                      ? adopted
                      : local;

                    return {
                      ...p,
                      asset,
                    };
                  });

                  const wrapped_assets = toArray(pools).map((p) => {
                    const { adopted, local } = { ...p };

                    const asset = adopted?.symbol?.startsWith(WRAPPED_PREFIX)
                      ? adopted
                      : local;

                    return {
                      ...p,
                      asset,
                    };
                  });

                  const native_asset = _.head(native_assets);
                  const wrapped_asset = _.head(wrapped_assets);

                  const native_amount = _.sum(
                    native_assets.map((a) => Number(a.asset?.balance || "0"))
                  );
                  const wrapped_amount = _.sum(
                    wrapped_assets.map((a) => Number(a?.asset?.balance || "0"))
                  );
                  const total_amount = native_amount + wrapped_amount;

                  const { color } = { ...asset_data };

                  return (
                    <div
                      className="flex flex-col items-end space-y-3"
                      style={{
                        minWidth: "8rem",
                      }}
                    >
                      {total_amount > 0 ? (
                        <div className="flex flex-col items-end justify-center w-full h-6 pt-2 pb-1 space-y-0">
                          <ProgressBar
                            width={(native_amount * 100) / total_amount}
                            className="w-full rounded-lg"
                            backgroundClassName="rounded-lg"
                            style={{
                              backgroundColor: color,
                            }}
                            backgroundStyle={{
                              backgroundColor: `${color}33`,
                            }}
                          />
                          <div className="flex items-center justify-between w-full space-x-2">
                            <div className="flex flex-col items-start space-y-0.5">
                              <Tooltip
                                placement="top"
                                content={
                                  <div className="flex flex-col items-end space-y-1">
                                    <div className="flex items-center space-x-1">
                                      {native_asset?.asset_data?.image && (
                                        <Image
                                          src={native_asset.asset_data.image}
                                          width={14}
                                          height={14}
                                          className="rounded-full"
                                        />
                                      )}
                                      <span className="font-medium leading-3 text-2xs">
                                        {native_asset?.asset?.symbol ||
                                          native_asset?.asset_data?.symbol}
                                      </span>
                                    </div>
                                    <DecimalsFormat
                                      value={native_amount}
                                      noTooltip={true}
                                      className="font-medium leading-3 text-2xs"
                                    />
                                  </div>
                                }
                                className="z-50 text-xs text-white bg-dark"
                              >
                                <div>
                                  <DecimalsFormat
                                    value={(native_amount * 100) / total_amount}
                                    suffix="%"
                                    noTooltip={true}
                                    className="font-medium leading-3 text-slate-600 dark:text-slate-400 text-2xs"
                                  />
                                </div>
                              </Tooltip>
                            </div>
                            <div className="flex flex-col items-end space-y-0.5">
                              <Tooltip
                                placement="top"
                                content={
                                  <div className="flex flex-col items-end space-y-1">
                                    <div className="flex items-center space-x-1">
                                      {(wrapped_asset?.contract_data?.next_asset
                                        ?.image ||
                                        wrapped_asset?.asset_data?.image) && (
                                        <Image
                                          src={
                                            wrapped_asset?.contract_data
                                              ?.next_asset?.image ||
                                            wrapped_asset?.asset_data?.image
                                          }
                                          width={14}
                                          height={14}
                                          className="rounded-full"
                                        />
                                      )}
                                      <span className="font-medium leading-3 text-2xs">
                                        {wrapped_asset?.asset?.symbol ||
                                          wrapped_asset?.contract_data
                                            ?.next_asset?.symbol}
                                      </span>
                                    </div>
                                    <DecimalsFormat
                                      value={wrapped_amount}
                                      noTooltip={true}
                                      className="font-medium leading-3 text-2xs"
                                    />
                                  </div>
                                }
                                className="z-50 text-xs text-white bg-dark"
                              >
                                <div>
                                  <DecimalsFormat
                                    value={
                                      100 - (native_amount * 100) / total_amount
                                    }
                                    suffix="%"
                                    noTooltip={true}
                                    className="font-medium leading-3 text-slate-600 dark:text-slate-400 text-2xs"
                                  />
                                </div>
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end h-6">
                          <span className="text-slate-400 dark:text-slate-500">
                            No liquidity
                          </span>
                        </div>
                      )}
                      {uncollapseAssetIds?.includes(id) &&
                        toArray(pools).map((p, i) => {
                          const {
                            chain_data,
                            asset_data,
                            contract_data,
                            adopted,
                            local,
                            lpTokenAddress,
                            error,
                          } = { ...p };

                          const chain = chain_data?.id;
                          const asset = asset_data?.id;

                          const native_asset = !adopted?.symbol?.startsWith(
                            WRAPPED_PREFIX
                          )
                            ? adopted
                            : local;
                          const wrapped_asset = adopted?.symbol?.startsWith(
                            WRAPPED_PREFIX
                          )
                            ? adopted
                            : local;

                          const native_amount = Number(
                            native_asset?.balance || "0"
                          );
                          const wrapped_amount = Number(
                            wrapped_asset?.balance || "0"
                          );
                          const total_amount = native_amount + wrapped_amount;

                          const { color } = { ...asset_data };

                          return (
                            <div key={i} className="w-full h-6">
                              <Link
                                href={`/pool/${
                                  chain
                                    ? `${
                                        asset ? `${asset.toUpperCase()}-` : ""
                                      }on-${chain}`
                                    : ""
                                }`}
                              >
                                <div className="flex items-center justify-end text-sm font-medium text-right">
                                  {!lpTokenAddress && !error ? (
                                    <div className="flex items-center justify-end">
                                      <TailSpin
                                        width="18"
                                        height="18"
                                        color={loaderColor(theme)}
                                      />
                                    </div>
                                  ) : total_amount > 0 ? (
                                    <div className="flex flex-col items-end justify-center w-full h-6 pt-2 pb-1 space-y-0">
                                      <ProgressBar
                                        width={
                                          (native_amount * 100) / total_amount
                                        }
                                        className="w-full rounded-lg"
                                        backgroundClassName="rounded-lg"
                                        style={{
                                          backgroundColor: color,
                                        }}
                                        backgroundStyle={{
                                          backgroundColor: `${color}33`,
                                        }}
                                      />
                                      <div className="flex items-center justify-between w-full space-x-2">
                                        <div className="flex flex-col items-start space-y-0.5">
                                          <Tooltip
                                            placement="top"
                                            content={
                                              <div className="flex flex-col items-end space-y-1">
                                                <div className="flex items-center space-x-1">
                                                  {asset_data?.image && (
                                                    <Image
                                                      src={asset_data.image}
                                                      width={14}
                                                      height={14}
                                                      className="rounded-full"
                                                    />
                                                  )}
                                                  <span className="font-medium leading-3 text-2xs">
                                                    {native_asset?.symbol ||
                                                      asset_data?.symbol}
                                                  </span>
                                                </div>
                                                <DecimalsFormat
                                                  value={native_amount}
                                                  noTooltip={true}
                                                  className="font-medium leading-3 text-2xs"
                                                />
                                              </div>
                                            }
                                            className="z-50 text-xs text-white bg-dark"
                                          >
                                            <div>
                                              <DecimalsFormat
                                                value={
                                                  (native_amount * 100) /
                                                  total_amount
                                                }
                                                suffix="%"
                                                noTooltip={true}
                                                className="font-medium leading-3 text-slate-600 dark:text-slate-400 text-2xs"
                                              />
                                            </div>
                                          </Tooltip>
                                        </div>
                                        <div className="flex flex-col items-end space-y-0.5">
                                          <Tooltip
                                            placement="top"
                                            content={
                                              <div className="flex flex-col items-end space-y-1">
                                                <div className="flex items-center space-x-1">
                                                  {(contract_data?.next_asset
                                                    ?.image ||
                                                    asset_data?.image) && (
                                                    <Image
                                                      src={
                                                        contract_data
                                                          ?.next_asset?.image ||
                                                        asset_data?.image
                                                      }
                                                      width={14}
                                                      height={14}
                                                      className="rounded-full"
                                                    />
                                                  )}
                                                  <span className="font-medium leading-3 text-2xs">
                                                    {wrapped_asset?.symbol ||
                                                      contract_data?.next_asset
                                                        ?.symbol}
                                                  </span>
                                                </div>
                                                <DecimalsFormat
                                                  value={wrapped_amount}
                                                  noTooltip={true}
                                                  className="font-medium leading-3 text-2xs"
                                                />
                                              </div>
                                            }
                                            className="z-50 text-xs text-white bg-dark"
                                          >
                                            <div>
                                              <DecimalsFormat
                                                value={
                                                  100 -
                                                  (native_amount * 100) /
                                                    total_amount
                                                }
                                                suffix="%"
                                                noTooltip={true}
                                                className="font-medium leading-3 text-slate-600 dark:text-slate-400 text-2xs"
                                              />
                                            </div>
                                          </Tooltip>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-end h-6">
                                      <span className="text-slate-400 dark:text-slate-500">
                                        No liquidity
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </Link>
                            </div>
                          );
                        })}
                    </div>
                  );
                },
                headerClassName: "whitespace-nowrap justify-end text-right",
              },
              {
                Header: "Liquidity",
                accessor: "tvl",
                sortType: (a, b) =>
                  _.sumBy(a.original.pools, "tvl") >
                  _.sumBy(b.original.pools, "tvl")
                    ? 1
                    : -1,
                Cell: (props) => {
                  const { row } = { ...props };

                  const { id, pools } = { ...row.original };

                  const value = _.sumBy(pools, "tvl");

                  return (
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center justify-end h-6 text-right">
                        <DecimalsFormat
                          value={value}
                          prefix={currency_symbol}
                          className="text-sm font-medium uppercase text-slate-600 dark:text-slate-400"
                        />
                      </div>
                      {uncollapseAssetIds?.includes(id) &&
                        toArray(pools).map((p, i) => {
                          const {
                            chain_data,
                            asset_data,
                            tvl,
                            lpTokenAddress,
                            error,
                          } = { ...p };

                          const chain = chain_data?.id;
                          const asset = asset_data?.id;
                          const value = tvl;

                          return (
                            <Link
                              key={i}
                              href={`/pool/${
                                chain
                                  ? `${
                                      asset ? `${asset.toUpperCase()}-` : ""
                                    }on-${chain}`
                                  : ""
                              }`}
                            >
                              <div className="flex items-center justify-end h-6 text-sm font-medium text-right">
                                {!lpTokenAddress && !error ? (
                                  <div className="flex items-center justify-end">
                                    <TailSpin
                                      width="18"
                                      height="18"
                                      color={loaderColor(theme)}
                                    />
                                  </div>
                                ) : (
                                  <DecimalsFormat
                                    value={value}
                                    prefix={currency_symbol}
                                    className="uppercase"
                                  />
                                )}
                              </div>
                            </Link>
                          );
                        })}
                    </div>
                  );
                },
                headerClassName: "whitespace-nowrap justify-end text-right",
              },
              {
                Header: "Volume (7d)",
                accessor: "volume_value",
                sortType: (a, b) =>
                  _.sumBy(a.original.pools, "volume_value") >
                  _.sumBy(b.original.pools, "volume_value")
                    ? 1
                    : -1,
                Cell: (props) => {
                  const { row } = { ...props };

                  const { id, pools } = { ...props.row.original };

                  const value = _.sumBy(pools, "volume_value");

                  return (
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center justify-end h-6 text-right">
                        {!isNaN(value) ? (
                          <DecimalsFormat
                            value={value}
                            prefix={currency_symbol}
                            className="text-sm font-medium uppercase text-slate-600 dark:text-slate-400"
                          />
                        ) : (
                          "TBD"
                        )}
                      </div>
                      {uncollapseAssetIds?.includes(id) &&
                        toArray(pools).map((p, i) => {
                          const { chain_data, asset_data, volume_value } = {
                            ...p,
                          };

                          const chain = chain_data?.id;
                          const asset = asset_data?.id;
                          const value = volume_value;

                          return (
                            <Link
                              key={i}
                              href={`/pool/${
                                chain
                                  ? `${
                                      asset ? `${asset.toUpperCase()}-` : ""
                                    }on-${chain}`
                                  : ""
                              }`}
                            >
                              <div className="flex items-center justify-end h-6 text-sm font-medium text-right">
                                {!isNaN(value) ? (
                                  <DecimalsFormat
                                    value={value}
                                    prefix={currency_symbol}
                                    className="uppercase"
                                  />
                                ) : (
                                  "TBD"
                                )}
                              </div>
                            </Link>
                          );
                        })}
                    </div>
                  );
                },
                headerClassName: "whitespace-nowrap justify-end text-right",
              },
              {
                Header: "Fees (7d)",
                accessor: "fees_value",
                sortType: (a, b) =>
                  _.sumBy(a.original.pools, "fees_value") >
                  _.sumBy(b.original.pools, "fees_value")
                    ? 1
                    : -1,
                Cell: (props) => {
                  const { row } = { ...props };

                  const { id, pools } = { ...row.original };

                  const value = _.sumBy(pools, "fees_value");

                  return (
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center justify-end h-6 text-right">
                        {!isNaN(value) ? (
                          <DecimalsFormat
                            value={value}
                            prefix={currency_symbol}
                            className="text-sm font-medium uppercase text-slate-600 dark:text-slate-400"
                          />
                        ) : (
                          "TBD"
                        )}
                      </div>
                      {uncollapseAssetIds?.includes(id) &&
                        toArray(pools).map((p, i) => {
                          const { chain_data, asset_data, fees_value } = {
                            ...p,
                          };

                          const chain = chain_data?.id;
                          const asset = asset_data?.id;
                          const value = fees_value;

                          return (
                            <Link
                              key={i}
                              href={`/pool/${
                                chain
                                  ? `${
                                      asset ? `${asset.toUpperCase()}-` : ""
                                    }on-${chain}`
                                  : ""
                              }`}
                            >
                              <div className="flex items-center justify-end h-6 text-sm font-medium text-right">
                                {!isNaN(value) ? (
                                  <DecimalsFormat
                                    value={value}
                                    prefix={currency_symbol}
                                    className="uppercase"
                                  />
                                ) : (
                                  "TBD"
                                )}
                              </div>
                            </Link>
                          );
                        })}
                    </div>
                  );
                },
                headerClassName: "whitespace-nowrap justify-end text-right",
              },
              {
                Header: (
                  <Tooltip
                    placement="top"
                    content="Yield from 0.04% user swap fees"
                    className="z-50 text-xs text-white bg-dark"
                  >
                    <div>APY</div>
                  </Tooltip>
                ),
                accessor: "apy",
                sortType: (a, b) =>
                  _.meanBy(a.original.pools, "apy") >
                  _.sumBy(b.original.pools, "apy")
                    ? 1
                    : -1,
                Cell: (props) => {
                  const { row } = { ...props };

                  const { id, pools } = { ...row.original };

                  const value =
                    _.sumBy(
                      pools.map((p) => {
                        const { apy, tvl } = { ...p };

                        return {
                          ...p,
                          weighted_apy: (apy || 0) * (tvl || 0),
                        };
                      }),
                      "weighted_apy"
                    ) / _.sumBy(pools, "tvl");

                  return (
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center justify-end h-6 text-sm font-medium text-right text-slate-600 dark:text-slate-400">
                        {/*!isNaN(value) ?
                              <DecimalsFormat
                                value={value * 100}
                                maxDecimals={2}
                                suffix="%"
                                className="uppercase"
                              /> :
                              'TBD'
                            */}
                      </div>
                      {uncollapseAssetIds?.includes(id) &&
                        toArray(pools).map((p, i) => {
                          const { chain_data, asset_data, apy } = { ...p };

                          const chain = chain_data?.id;
                          const asset = asset_data?.id;
                          const value = apy;

                          return (
                            <Link
                              key={i}
                              href={`/pool/${
                                chain
                                  ? `${
                                      asset ? `${asset.toUpperCase()}-` : ""
                                    }on-${chain}`
                                  : ""
                              }`}
                            >
                              <div className="flex items-center justify-end h-6 text-sm font-medium text-right">
                                {!isNaN(value) ? (
                                  <DecimalsFormat
                                    value={value * 100}
                                    maxDecimals={2}
                                    suffix="%"
                                    className="uppercase"
                                  />
                                ) : (
                                  "TBD"
                                )}
                              </div>
                            </Link>
                          );
                        })}
                    </div>
                  );
                },
                headerClassName: "whitespace-nowrap justify-end text-right",
              },
              {
                Header: "Your Pool Tokens",
                accessor: "lpTokenBalance",
                sortType: (a, b) =>
                  Number(a.original.lpTokenBalance) * a.original.price >
                  Number(b.original.lpTokenBalance) * b.original.price
                    ? 1
                    : -1,
                Cell: (props) => {
                  const { row, value } = { ...props };

                  const { chain_data, asset_data, symbol, price } = {
                    ...row.original,
                  };

                  const chain = chain_data?.id;
                  const asset = asset_data?.id;

                  return (
                    <Link
                      href={`/pool/${
                        chain
                          ? `${
                              asset ? `${asset.toUpperCase()}-` : ""
                            }on-${chain}`
                          : ""
                      }`}
                      className="flex flex-col justify-center h-6 space-y-1"
                    >
                      <div className="flex items-center space-x-1 text-sm font-medium text-right">
                        <DecimalsFormat value={value} className="uppercase" />
                        {symbol && <span>{symbol}</span>}
                      </div>
                      {price > 0 && (
                        <div className="text-sm text-right text-slate-800 dark:text-slate-200">
                          <DecimalsFormat
                            value={value * price}
                            prefix={currency_symbol}
                            className="uppercase"
                          />
                        </div>
                      )}
                    </Link>
                  );
                },
                headerClassName: "whitespace-nowrap",
              },
              {
                Header: "Pooled Tokens",
                accessor: "balances",
                sortType: (a, b) => (a.original.tvl > b.original.tvl ? 1 : -1),
                Cell: (props) => {
                  const { row } = { ...props };

                  const { chain_data, asset_data, adopted, local } = {
                    ...row.original,
                  };

                  const chain = chain_data?.id;
                  const asset = asset_data?.id;

                  return (
                    <Link
                      href={`/pool/${
                        chain
                          ? `${
                              asset ? `${asset.toUpperCase()}-` : ""
                            }on-${chain}`
                          : ""
                      }`}
                      className="h-6 flex items-center justify-end space-x-1.5"
                    >
                      <div className="flex items-center space-x-1 text-sm font-medium">
                        <DecimalsFormat
                          value={adopted?.balance}
                          className="uppercase"
                        />
                        {adopted?.symbol && <span>{adopted.symbol}</span>}
                      </div>
                      <span className="text-sm font-medium">/</span>
                      <div className="flex items-center space-x-1 text-sm font-medium">
                        <DecimalsFormat
                          value={local?.balance}
                          className="uppercase"
                        />
                        {local?.symbol && <span>{local.symbol}</span>}
                      </div>
                    </Link>
                  );
                },
                headerClassName: "whitespace-nowrap justify-end text-right",
              },
              {
                Header: "Pool Share",
                accessor: "share",
                sortType: (a, b) =>
                  a.original.share > b.original.share ? 1 : -1,
                Cell: (props) => {
                  const { row, value } = { ...props };

                  const { chain_data, asset_data } = { ...row.original };

                  const chain = chain_data?.id;
                  const asset = asset_data?.id;

                  return (
                    <Link
                      href={`/pool/${
                        chain
                          ? `${
                              asset ? `${asset.toUpperCase()}-` : ""
                            }on-${chain}`
                          : ""
                      }`}
                      className="flex items-center justify-end h-6 text-right"
                    >
                      <DecimalsFormat
                        value={typeof value === "number" ? value : "-"}
                        suffix="%"
                        className="text-sm font-medium"
                      />
                    </Link>
                  );
                },
                headerClassName: "whitespace-nowrap justify-end text-right",
              },
            ].filter(
              (c) =>
                !(
                  view === "my_positions"
                    ? ["assets", "tvl", "volume_value", "fees_value", "apy"]
                    : ["lpTokenBalance", "balances", "share"]
                ).includes(c.accessor)
            )}
            data={data}
            noPagination={data.length <= 10}
            defaultPageSize={50}
            className="no-border"
          />
        </>
      )}
    </div>
  ) : (
    <div className="my-4 ml-2 sm:my-6">
      <TailSpin width="32" height="32" color={loaderColor(theme)} />
    </div>
  );
};
