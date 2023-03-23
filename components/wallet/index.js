import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import _ from "lodash";
import Web3Modal from "web3modal";
import WalletConnect from "@walletconnect/web3-provider";
import Portis from "@portis/web3";
import Coinbase from "@coinbase/wallet-sdk";
import { providers, utils } from "ethers";
import { Box, Button } from "@chakra-ui/react";

import blocked_addresses from "../../config/blocked_addresses.json";
import { getChain } from "../../lib/object/chain";
import { find, equalsIgnoreCase } from "../../lib/utils";
import { WALLET_DATA, WALLET_RESET } from "../../reducers/types";

const providerOptions = {
  walletconnect: {
    package: WalletConnect,
    options: {
      rpc: {
        1: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
        56: "https://rpc.ankr.com/bsc",
        137: "https://polygon-mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
        43114: "https://rpc.ankr.com/avalanche",
        10: "https://optimism-mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
        42161:
          "https://arbitrum-mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
        42170: "https://nova.arbitrum.io/rpc",
        250: "https://rpc.ankr.com/fantom",
        100: "https://xdai-rpc.gateway.pokt.network",
        1284: "https://rpc.ankr.com/moonbeam",
        5: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
        97: "https://rpc.ankr.com/bsc_testnet_chapel",
        80001:
          "https://polygon-mumbai.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
        43113: "https://rpc.ankr.com/avalanche_fuji",
        420: "https://optimism-goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
        421613: "https://goerli-rollup.arbitrum.io/rpc",
        4002: "https://rpc.ankr.com/fantom_testnet",
        1287: "https://rpc.api.moonbase.moonbeam.network",
      },
    },
  },
  portis: process.env.NEXT_PUBLIC_PORTIS_ID && {
    package: Portis,
    options: {
      id: process.env.NEXT_PUBLIC_PORTIS_ID,
    },
  },
  walletlink: process.env.NEXT_PUBLIC_INFURA_ID && {
    package: Coinbase,
    options: {
      infuraId: process.env.NEXT_PUBLIC_INFURA_ID,
      appName: "Coinbase Wallet",
      appLogoUrl: "/logos/wallets/coinbase.svg",
    },
  },
  tally: {
    package: null,
  },
};

const getNetwork = (chain_id) => {
  return {
    1: "mainnet",
    10: "optimism",
    56: "binance",
    100: "xdai",
    137: "matic",
    250: "fantom",
    1284: "moonbeam",
    42161: "arbitrum",
    43114: "avalanche-mainnet",
    5: "goerli",
    97: "binance-testnet",
    43113: "avalanche-fuji-testnet",
    80001: "mumbai",
  }[chain_id];
};

let web3Modal;

export default ({
  mainController = false,
  hidden = false,
  disabled = false,
  connectChainId,
  onSwitch,
  children,
  className = "",
}) => {
  const dispatch = useDispatch();
  const { chains, wallet } = useSelector(
    (state) => ({
      chains: state.chains,
      wallet: state.wallet,
    }),
    shallowEqual
  );
  const { chains_data } = { ...chains };
  const { wallet_data } = { ...wallet };
  const { chain_id, provider, browser_provider } = { ...wallet_data };

  const [defaultChainId, setDefaultChainId] = useState(null);

  useEffect(() => {
    if (connectChainId && connectChainId !== defaultChainId) {
      setDefaultChainId(connectChainId);
    }
  }, [connectChainId]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (browser_provider) {
        dispatch({
          type: WALLET_DATA,
          value: {
            default_chain_id: defaultChainId,
          },
        });
      }

      if (false && window.clover) {
        providerOptions["custom-clover"] = {
          package: async () => {
            let provider = null;

            if (typeof window.clover !== "undefined") {
              provider = window.clover;

              try {
                await provider.request({
                  method: "eth_requestAccounts",
                });
              } catch (error) {
                throw new Error("User Rejected");
              }
            } else if (typeof window.ethereum !== "undefined") {
              provider = window.ethereum;

              try {
                await provider.request({
                  method: "eth_requestAccounts",
                });
              } catch (error) {
                throw new Error("User Rejected");
              }
            } else if (window.web3) {
              provider = window.web3.currentProvider;
            } else if (window.celo) {
              provider = window.celo;
            } else {
              throw new Error("No Web3 Provider found");
            }

            return provider;
          },
          connector: async (ProviderPackage, options) => {
            const provider = new ProviderPackage(options);

            try {
              await provider.enable();
            } catch (error) {}

            return provider;
          },
          display: {
            name: "Clover",
            logo: "/logos/wallets/clover.png",
          },
        };
      }

      web3Modal = new Web3Modal({
        network:
          getNetwork(defaultChainId) ||
          (process.env.NETWORK === "testnet" ? "goerli" : "mainnet"),
        cacheProvider: true,
        providerOptions,
      });
    }
  }, [defaultChainId]);

  useEffect(() => {
    if (web3Modal?.cachedProvider) {
      connect();
    }
  }, [web3Modal]);

  const connect = useCallback(async () => {
    const provider = await web3Modal.connect();
    const browser_provider = new providers.Web3Provider(provider);
    const network = await browser_provider.getNetwork();
    const signer = browser_provider.getSigner();
    const address = await signer.getAddress();

    if (find(address, blocked_addresses)) {
      dispatch({
        type: WALLET_RESET,
      });
    } else {
      const { chainId } = { ...network };

      dispatch({
        type: WALLET_DATA,
        value: {
          chain_id: chainId,
          provider,
          browser_provider,
          signer,
          address,
        },
      });
    }
  }, [web3Modal]);

  const disconnect = useCallback(
    async (e, is_reestablish) => {
      if (web3Modal && !is_reestablish) {
        await web3Modal.clearCachedProvider();
      }

      if (typeof provider?.disconnect === "function") {
        await provider.disconnect();
      }

      if (!is_reestablish) {
        dispatch({
          type: WALLET_RESET,
        });
      }
    },
    [web3Modal, provider]
  );

  const switchChain = async () => {
    if (connectChainId && connectChainId !== chain_id && provider) {
      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: utils.hexValue(connectChainId) }],
        });
      } catch (error) {
        const { code } = { ...error };

        if (code === 4902) {
          try {
            const { provider_params } = {
              ...getChain(connectChainId, chains_data),
            };

            await provider.request({
              method: "wallet_addEthereumChain",
              params: provider_params,
            });
          } catch (error) {}
        }
      }
    }
  };

  useEffect(() => {
    if (provider?.on) {
      const handleChainChanged = (chainId) => {
        if (!chainId) {
          disconnect();
        } else {
          connect();
        }
      };

      const handleAccountsChanged = (accounts) => {
        if (!_.head(accounts)) {
          disconnect();
        } else {
          dispatch({
            type: WALLET_DATA,
            value: {
              address: _.head(accounts),
            },
          });
        }
      };

      const handleDisconnect = (e) => {
        const { code } = { ...e };

        disconnect(e, code === 1013);

        if (code === 1013) {
          connect();
        }
      };

      provider.on("chainChanged", handleChainChanged);
      provider.on("accountsChanged", handleAccountsChanged);
      provider.on("disconnect", handleDisconnect);

      return () => {
        if (provider.removeListener) {
          provider.removeListener("chainChanged", handleChainChanged);
          provider.removeListener("accountsChanged", handleAccountsChanged);
          provider.removeListener("disconnect", handleDisconnect);
        }
      };
    }
  }, [provider, disconnect]);

  return (
    !hidden && (
      <>
        {browser_provider ? (
          !mainController && connectChainId && connectChainId !== chain_id ? (
            <Box
              disabled={disabled}
              onClick={() => {
                switchChain();
                if (onSwitch) {
                  onSwitch();
                }
              }}
              className={className}
            >
              {children || (
                <Button
                  borderRadius="xl"
                  color="#fffff"
                  bg="##2D3748"
                  size="md"
                  _hover={{ bg: "#4A5568" }}
                  px={5}
                >
                  Switch Network
                </Button>
              )}
            </Box>
          ) : (
            <Box disabled={disabled} onClick={disconnect} className={className}>
              {children || (
                <Button
                  borderRadius="xl"
                  color="#fffff"
                  bg="#C53030"
                  size="md"
                  _hover={{ bg: "#E53E3E" }}
                  px={5}
                >
                  Disconnect
                </Button>
              )}
            </Box>
          )
        ) : (
          <Box disabled={disabled} onClick={connect} className={className}>
            {children || (
              <Button
                borderRadius="xl"
                color="#000000"
                bg="#14f094"
                size="md"
                _hover={{ bg: "#14f094" }}
                px={5}
              >
                Connect Wallet
              </Button>
            )}
          </Box>
        )}
      </>
    )
  );
};
