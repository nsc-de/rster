import { mdiSearchWeb } from "@mdi/js";
import Icon from "@mdi/react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Navbar from "react-bootstrap/Navbar";
import Row from "react-bootstrap/Row";

import Sidebar from "./sidebar";

import { InfoClient } from "@rster/info-client";
import { useState } from "react";

export default function App() {
  const [apiBaseUrl, setApiBaseUrl] = useState("http://localhost:3001/api/");

  const url = new URL(apiBaseUrl);

  const { protocol, host, pathname } = url;

  const infoClient = new InfoClient({
    basePath: pathname,
    url: `${protocol}//${host}`,
  });

  const index = infoClient.getIndex();

  console.log(index);

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
            <Form inline>
              <Row>
                <Col xs="auto">
                  <Form.Control
                    type="text"
                    placeholder="API base URL"
                    className=" mr-sm-2"
                    defaultValue={apiBaseUrl}
                    onChange={(e) => setApiBaseUrl(e.target.value)}
                  />
                </Col>
              </Row>
            </Form>
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
