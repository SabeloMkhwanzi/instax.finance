import { BsThreeDots } from "react-icons/bs";

export const PageWithText = ({
  disabled = false,
  active,
  size,
  onClick,
  activeClassNames = "btn btn-default rounded-xl text-black bg-[#14f094] hover:bg-[#00CC66] dark:[#14f094] dark:hover:bg-[#00CC66] shadow ",
  inactiveClassNames = "btn btn-default bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 shadow rounded text-slate-600 hover:text-slate-700 dark:text-slate-200 dark:hover:text-slate-100",
  children,
}) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={active ? activeClassNames : inactiveClassNames}
    style={{
      padding: size === "small" ? "6px 4px" : undefined,
    }}
  >
    {children}
  </button>
);

export const Page = ({
  disabled = false,
  active,
  onClick,
  activeClassNames = "btn btn-circle text-black bg-[#14f094] hover:bg-[#00CC66] dark:[#14f094] dark:hover:bg-[#00CC66]",
  inactiveClassNames = "btn btn-circle bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 hover:text-slate-700 dark:text-slate-200 dark:hover:text-slate-100",
  children,
}) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={active ? activeClassNames : inactiveClassNames}
  >
    {children}
  </button>
);

export const Pages = ({ items = [], disabled = false, active, onClick }) => {
  const hide = (i) =>
    items.length > 10 &&
    [0, items.length - 1, active - 1].findIndex(
      (_i, index) =>
        Math.floor(Math.abs(i - _i)) <
        (index < 2 ? 3 : items.length < 20 ? 2 : 3)
    ) < 0;

  return (
    <>
      {items.map((i) =>
        hide(i) ? (
          <div key={i} className={`${hide(i - 1) ? "hidden" : ""}`}>
            <BsThreeDots
              size={20}
              className="text-slate-300 dark:text-slate-700 mt-1.5"
            />
          </div>
        ) : (
          <Page
            key={i}
            disabled={disabled}
            active={i + 1 === active}
            onClick={() => onClick(i + 1)}
          >
            {i + 1}
          </Page>
        )
      )}
    </>
  );
};

export const Pagination = ({
  items,
  disabled = false,
  active,
  icons = false,
  previous = "Previous",
  next = "Next",
  onClick,
}) => {
  previous = active - 1 > 0 && previous;
  next = active + 1 <= items.length && next;

  return (
    <div className="flex flex-wrap items-center justify-center space-x-2 pagination">
      {previous &&
        (icons ? (
          <Page disabled={disabled} onClick={() => onClick(active - 1)}>
            {previous}
          </Page>
        ) : (
          <PageWithText disabled={disabled} onClick={() => onClick(active - 1)}>
            {previous}
          </PageWithText>
        ))}
      <Pages
        items={items}
        disabled={disabled}
        active={active}
        onClick={onClick}
      />
      {next &&
        (icons ? (
          <Page disabled={disabled} onClick={() => onClick(active + 1)}>
            {next}
          </Page>
        ) : (
          <PageWithText disabled={disabled} onClick={() => onClick(active + 1)}>
            {next}
          </PageWithText>
        ))}
    </div>
  );
};
