import { useState, useEffect, useRef } from "react";
import { useSelector, shallowEqual } from "react-redux";
import { FiX } from "react-icons/fi";

import Portal from "../portal";

export default ({
  id = "portal",
  hidden,
  disabled,
  onClick,
  buttonTitle,
  buttonClassName,
  buttonStyle = {},
  title,
  icon,
  body,
  noCancelOnClickOutside = false,
  cancelDisabled = false,
  onCancel,
  cancelButtonTitle,
  cancelButtonClassName,
  confirmDisabled = false,
  onConfirm,
  onConfirmHide = true,
  confirmButtonTitle,
  confirmButtonClassName,
  onClose,
  noButtons,
  modalClassName = "",
}) => {
  const { preferences } = useSelector(
    (state) => ({
      preferences: state.preferences,
    }),
    shallowEqual
  );
  const { theme } = { ...preferences };

  const [open, setOpen] = useState(false);

  const modalRef = useRef(null);

  const show = () => {
    if (onClick) {
      onClick(true);
    }
    setOpen(true);
  };

  const hide = () => {
    if (typeof hidden !== "boolean") {
      setOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!open || !modalRef?.current || modalRef.current.contains(e.target)) {
        return false;
      }

      if (!cancelDisabled) {
        setOpen(!open);

        if (onClose) {
          onClose();
        }
      }
    };

    if (!noCancelOnClickOutside) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [modalRef, open, cancelDisabled]);

  useEffect(() => {
    if (typeof hidden === "boolean") {
      setOpen(!hidden);
    }
  }, [hidden]);

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={show}
        className={
          buttonClassName ||
          "btn btn-default btn-rounded-xl text-black bg-[#14f094] hover:bg-[#00CC66] dark:[#14f094] dark:hover:bg-[#00CC66]"
        }
        style={buttonStyle}
      >
        {buttonTitle}
      </button>

      {open && (
        <Portal selector={`#${id}`}>
          <div className="modal-backdrop fade-in" />
          <div
            data-background={theme}
            className={`modal show ${theme === "dark" ? "dark" : ""}`}
          >
            <div
              ref={modalRef}
              className={`w-full ${
                modalClassName.includes("max-w-") ? "" : "max-w-sm lg:max-w-lg"
              } relative lg:my-4 mx-auto ${modalClassName}`}
            >
              <div className="relative flex flex-col w-full bg-white border-0 shadow-xl outline-none rounded-xl dark:bg-slate-900">
                <div className="relative flex-auto p-4">
                  <div className="flex items-start justify-start p-2 space-x-4">
                    {icon && <div className="flex-shrink-0 w-12">{icon}</div>}
                    <div className="flex flex-col w-full">
                      <div className="mb-2 text-base font-bold uppercase">
                        {title}
                      </div>
                      {body}
                    </div>
                  </div>
                </div>
                {!noButtons && (
                  <div
                    className={`border-t border-slate-100 dark:border-slate-800 border-solid rounded-b flex items-center justify-end ${
                      cancelButtonClassName?.includes("hidden")
                        ? "space-x-0"
                        : "space-x-2"
                    } py-4 px-6`}
                  >
                    <button
                      type="button"
                      disabled={cancelDisabled}
                      onClick={() => {
                        if (onCancel) {
                          onCancel();
                        }
                        hide();
                      }}
                      className={
                        cancelButtonClassName ||
                        "btn btn-default btn-rounded bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800"
                      }
                    >
                      {cancelButtonTitle || "Cancel"}
                    </button>
                    <button
                      type="button"
                      disabled={confirmDisabled}
                      onClick={() => {
                        if (onConfirm) {
                          onConfirm();
                        }
                        if (onConfirmHide) {
                          hide();
                        }
                      }}
                      className={
                        confirmButtonClassName ||
                        "btn btn-default btn-rounded-xl text-black bg-[#14f094] hover:bg-[#00CC66] dark:[#14f094] dark:hover:bg-[#00CC66]"
                      }
                    >
                      {confirmButtonTitle || "Confirm"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
};
