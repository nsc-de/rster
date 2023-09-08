import Icon from "@mdi/react";
import { mdiChevronRight } from "@mdi/js";
import "./sidebar.sass";
import { useState } from "react";

function RenderDropdown({ className, format, path, title, map }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="btn btn-toggle align-items-center rounded collapsed"
        data-bs-toggle={`sidebar-${[...path, title].join("-")}`}
        data-bs-target={`#sidebar-${[...path, title].join("-")}`}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {/* <Icon path={mdiChevronRight} size={1} /> */}
        {title}
      </button>
      <div
        className={`collapse ${open ? "show" : ""}`}
        id={`sidebar-${[...path, title].join("-")}`}
      >
        <RenderUl format={map} path={path} />
      </div>
    </>
  );
}

function RenderUl({ className, format, path }) {
  path = path ?? [];
  format = format ?? [];

  return (
    <ul className={`list-unstyled ps-0 ${className ?? ""}`}>
      {format.map((item, i) => (
        <li className="mb-1" key={item.name + i}>
          {item.map ? (
            <RenderDropdown
              format={item.map}
              path={[...path, item.name]}
              title={item.name}
            />
          ) : (
            <a href={item.href ?? ""} className="link-dark rounded">
              {" "}
              {item.name}{" "}
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function Sidebar({ className, format, title, logo }) {
  format = format ?? [];
  return (
    <div
      className="flex-shrink-0 p-3 bg-white h-100"
      style={{ width: "280px" }}
    >
      <a
        href="/"
        className="d-flex align-items-center pb-3 mb-3 link-dark text-decoration-none border-bottom"
      >
        <span className="fs-5 fw-semibold">
          {logo ?? ""}
          {title}
        </span>
      </a>
      <RenderUl format={format} />
    </div>
  );
}
