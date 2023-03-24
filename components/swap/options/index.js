import { useState, useEffect } from "react";
import { useSelector, shallowEqual } from "react-redux";
import _ from "lodash";
import Switch from "react-switch";
import { DebounceInput } from "react-debounce-input";
import { Tooltip } from "@material-tailwind/react";
import { RiSettings3Line } from "react-icons/ri";
import { BiInfoCircle } from "react-icons/bi";

import Modal from "../../modals";
import { toArray, switchColor } from "../../../lib/utils";

const DEFAULT_SWAP_SLIPPAGE_PERCENTAGE = Number(
  process.env.NEXT_PUBLIC_DEFAULT_SWAP_SLIPPAGE_PERCENTAGE
);

export default ({
  disabled = false,
  applied = false,
  initialData,
  onChange,
}) => {
  const { preferences } = useSelector(
    (state) => ({
      preferences: state.preferences,
    }),
    shallowEqual
  );
  const { theme } = { ...preferences };

  const [data, setData] = useState(initialData);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const reset = () => setData(initialData);

  const fields = [
    {
      label: "Infinite Approval",
      tooltip:
        "This allows you to only need to pay for approval on your first transfer.",
      name: "infiniteApprove",
      type: "switch",
    },
  ];

  const changed = !_.isEqual(data, initialData);

  return (
    <Modal
      disabled={disabled}
      buttonTitle={
        <div
          className={`bg-slate-100 rounded-xl hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700  flex items-center ${
            applied
              ? "text-green-400 rounded-xl hover:text-green-500 dark:text-green-500 dark:hover:text-green-400"
              : "text-slate-600 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-200"
          } space-x-1 py-2 px-2`}
        >
          <RiSettings3Line size={20} />
        </div>
      }
      buttonClassName={`min-w-max ${
        disabled ? "cursor-not-allowed" : ""
      } rounded ${
        applied ? "border border-green-400 dark:border-green-500" : ""
      } flex items-center justify-center`}
      title={<span className="normal-case">Advanced options</span>}
      body={
        <div className="mt-2 form ">
          {fields.map((f, i) => {
            const {
              label,
              tooltip,
              name,
              size,
              type,
              placeholder,
              options,
              presets,
              postfix,
            } = { ...f };

            return (
              <div key={i} className="form-element">
                {label &&
                  (tooltip ? (
                    <Tooltip
                      placement="right"
                      content={tooltip}
                      className="z-50 text-xs text-white bg-dark"
                    >
                      <div className="flex items-center w-fit">
                        <div className="mb-1 font-medium max-w-fit text-slate-600 dark:text-slate-200">
                          {label}
                        </div>
                        <BiInfoCircle
                          size={16}
                          className="block sm:hidden text-slate-400 dark:text-slate-500 mb-0.5 ml-1 sm:ml-0"
                        />
                      </div>
                    </Tooltip>
                  ) : (
                    <div className="font-medium form-label text-slate-600 dark:text-slate-200">
                      {label}
                    </div>
                  ))}
                {type === "select" ? (
                  <select
                    placeholder={placeholder}
                    value={data?.[name]}
                    onChange={(e) => {
                      setData({
                        ...data,
                        [name]: e.target.value,
                      });
                    }}
                    className="border-0 rounded form-select bg-slate-50 focus:ring-0"
                  >
                    {toArray(options).map((o, j) => {
                      const { title, value, name } = { ...o };

                      return (
                        <option key={j} title={title} value={value}>
                          {name}
                        </option>
                      );
                    })}
                  </select>
                ) : type === "switch" ? (
                  <Switch
                    checked={
                      typeof data?.[name] === "boolean" ? data[name] : false
                    }
                    onChange={(e) => {
                      setData({
                        ...data,
                        [name]: !data?.[name],
                      });
                    }}
                    checkedIcon={false}
                    uncheckedIcon={false}
                    onColor={switchColor(theme).on}
                    onHandleColor="#f8fafc"
                    offColor={switchColor(theme).off}
                    offHandleColor="#f8fafc"
                  />
                ) : type === "textarea" ? (
                  <textarea
                    type="text"
                    rows="5"
                    placeholder={placeholder}
                    value={data?.[name]}
                    onChange={(e) => {
                      setData({
                        ...data,
                        [name]: e.target.value,
                      });
                    }}
                    className="rounded-xl form-textarea focus:ring-0"
                  />
                ) : type === "number" ? (
                  <div className="flex items-center space-x-3">
                    <DebounceInput
                      debounceTimeout={750}
                      size={size || "small"}
                      type={type}
                      placeholder={placeholder}
                      value={
                        typeof data?.[name] === "number" && data[name] >= 0
                          ? data[name]
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
                          ["slippage"].includes(name) &&
                          (value <= 0 || value > 100)
                            ? DEFAULT_SWAP_SLIPPAGE_PERCENTAGE
                            : value;

                        setData({
                          ...data,
                          [name]:
                            value && !isNaN(value)
                              ? parseFloat(Number(value).toFixed(6))
                              : value,
                        });
                      }}
                      onWheel={(e) => e.target.blur()}
                      onKeyDown={(e) =>
                        ["e", "E", "-"].includes(e.key) && e.preventDefault()
                      }
                      className="w-20 bg-slate-100 dark:bg-slate-800 rounded border-0 focus:ring-0 font-semibold py-1.5 px-2.5"
                    />
                    {presets?.length > 0 && (
                      <div className="flex items-center space-x-2.5">
                        {presets.map((p, j) => (
                          <div
                            key={j}
                            onClick={() => {
                              setData({
                                ...data,
                                [name]: p,
                              });
                            }}
                            className={`${
                              data?.[name] === p
                                ? "bg-slate-100 dark:bg-slate-800 font-bold"
                                : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 font-medium hover:font-semibold"
                            } rounded cursor-pointer py-1 px-2`}
                          >
                            {p} {postfix}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={data?.[name]}
                    onChange={(e) => {
                      setData({
                        ...data,
                        [name]: e.target.value,
                      });
                    }}
                    className="border-0 rounded form-input focus:ring-0"
                  />
                )}
              </div>
            );
          })}
        </div>
      }
      onCancel={() => reset()}
      confirmDisabled={!changed}
      onConfirm={() => {
        if (onChange) {
          onChange(data);
        }
      }}
      confirmButtonTitle="Apply"
      onClose={() => reset()}
    />
  );
};
