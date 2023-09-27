import "./sidebar.sass";
import { useState } from "react";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";

function RenderDropdown({ _className, format, path, title }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        className="btn btn-toggle text-left align-items-left rounded collapsed"
        variant="outline-secondary"
        data-bs-toggle={`sidebar-${[...path, title].join("-")}`}
        data-bs-target={`#sidebar-${[...path, title].join("-")}`}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {/* <Icon path={mdiChevronRight} size={1} /> */}
        {title}
      </Button>
      <div
        className={`collapse ${open ? "show" : ""}`}
        id={`sidebar-${[...path, title].join("-")}`}
      >
        <RenderUl format={format} path={path} />
      </div>
    </>
  );
}

function RenderUl({ className, format, path }) {
  path = path ?? [];

  console.log(format);

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
            <Link
              to={item.href ?? ""}
              className="link-dark rounded"
              data-method={item.method ?? "any"}
            >
              {item.name}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function Sidebar({ className, format, title, logo, style }) {
  format = format ?? [];
  return (
    <div
      className={`flex-shrink-0 p-3 bg-888 h-100 sidebar ${className ?? ""}}`}
      style={{
        width: "280px",
        ...style,
      }}
    >
      <Link
        to="/"
        className="d-flex align-items-center pb-3 mb-3 link-dark text-decoration-none border-bottom"
      >
        <span className="fs-5 fw-semibold">
          {logo ?? ""}
          {title}
        </span>
      </Link>
      <RenderUl format={format} />
    </div>
  );
}
