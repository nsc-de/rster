import { mdiAlertOutline, mdiSearchWeb } from "@mdi/js";
import Icon from "@mdi/react";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Navbar from "react-bootstrap/Navbar";
import Row from "react-bootstrap/Row";

import Sidebar from "./sidebar";

import { InfoClient } from "@rster/info-client";
import { useEffect, useState } from "react";

/**
 * @param {any} obj
 * @param {string[]} path
 */
function objectDeepInsert(obj, path) {
  if (path.length === 0) {
    return null;
  }
  obj[path[0]] = objectDeepInsert(obj[path[0]] ?? {}, path.slice(1));
}

/**
 *
 * @param {import("@rster/info-client").InfoMap} map
 */
async function generateNavbarIndex(map) {
  const children = await map.map;
  const paths = (await Promise.all(children.map((child) => child.path)))
    .sort((a, b) => a.localeCompare(b))
    .map((path) => path.split("/"));

  return paths;
}

export default function App() {
  const [apiBaseUrl, setApiBaseUrl] = useState(
    "http://localhost:3001/api/info"
  );
  const url = new URL(apiBaseUrl);

  const { protocol, host, pathname } = url;

  const [infoClient, setInfoClient] = useState(
    new InfoClient({
      basePath: pathname,
      url: `${protocol}//${host}`,
    })
  );

  const [index, setIndex] = useState(null);

  if (
    infoClient.options.basePath !== pathname ||
    infoClient.options.url !== `${protocol}//${host}`
  ) {
    setInfoClient(
      new InfoClient({
        basePath: pathname,
        url: `${protocol}//${host}`,
      })
    );
  }

  useEffect(() => {
    infoClient
      .getIndex()
      .then((it) => generateNavbarIndex(it))
      .then((index) => {
        setIndex(index);
      })
      .catch((err) => {
        setIndex(null);
      });
  }, [infoClient]);

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
            <Form inline="true">
              <Row>
                <Col xs="auto">
                  <InputGroup>
                    {index == null ? (
                      <InputGroup.Text id="basic-addon1">
                        <Icon path={mdiAlertOutline} size={1} color="orange" />
                      </InputGroup.Text>
                    ) : null}
                    <Form.Control
                      type="text"
                      placeholder="API base URL"
                      className=" mr-sm-2"
                      defaultValue={apiBaseUrl}
                      onChange={(e) => setApiBaseUrl(e.target.value)}
                    />
                  </InputGroup>
                </Col>
              </Row>
            </Form>
          </Container>
        </Navbar>
      </header>

      <Sidebar
        className="border-right"
        title="Sidebar"
        format={
          index
            ? [
                {
                  name: "Paths",
                  map: index.map((path) => ({
                    name: path,
                  })),
                },
              ]
            : [
                {
                  name: "Error loading index",
                },
              ]
        }
      ></Sidebar>
    </div>
  );
}
