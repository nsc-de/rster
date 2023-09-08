import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Sidebar from "./sidebar";

export default function App() {
  return (
    <div
      className="App w-100 h-100"
      style={{
        backgroundColor: "#f8f9fa",
      }}
    >
      <header className="App-header">
        <Navbar className="bg-body-tertiary border-bottom">
          <Container>
            <Navbar.Brand href="#home">
              <img
                alt=""
                src="/logo-small.svg"
                width="30"
                height="30"
                className="d-inline-block align-top"
              />{" "}
              <span
                style={{
                  color: "#888",
                  fontSize: "0.8rem",
                  fontWeight: "bold",
                  position: "relative",
                  top: "-0.2rem",
                  paddingLeft: "0.2rem",
                }}
              >
                rster info explorer
              </span>
            </Navbar.Brand>
          </Container>
        </Navbar>
      </header>

      <Sidebar
        className="border-right"
        title="Sidebar"
        format={[
          {
            name: "Home",
            map: [
              {
                name: "Home 1",
                href: "#",
              },
            ],
          },
        ]}
      ></Sidebar>
    </div>
  );
}
