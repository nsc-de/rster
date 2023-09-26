import { mdiAlertOutline } from "@mdi/js";
import Icon from "@mdi/react";
import InputGroup from "react-bootstrap/InputGroup";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Navbar from "react-bootstrap/Navbar";
import Row from "react-bootstrap/Row";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Sidebar from "./sidebar";

import { InfoClient } from "@rster/info-client";
import { useEffect, useState } from "react";

async function getInfoClientSettings() {
  const res = await fetch(
    `${process.env.PUBLIC_URL}/info-client-settings.json`
  );
  const json = await res.json();
  return json;
}

/**
 * @param {import("@rster/info-client").InfoMap} map
 */
async function generateNavbarIndex(map) {
  const children = await map.map;
  const paths = (
    await Promise.all(
      children.map(async (child) => ({
        path: await child.path,
        method: await child.method,
        info: child,
      }))
    )
  ).sort((a, b) => a.path.localeCompare(b.path));

  return paths;
}

export default function App() {
  const [apiBaseUrl, setApiBaseUrl] = useState(
    "http://localhost:3001/api/info"
  );

  const [infoClientSettings, setInfoClientSettings] = useState();

  useEffect(() => {
    (async () => {
      const settings = await getInfoClientSettings();
      setInfoClientSettings(settings);
      setApiBaseUrl(settings.address);
    })();
  }, []);

  const url = new URL(apiBaseUrl);
  const { protocol, host, pathname } = url;

  /**
   * @type {[InfoClient, (infoClient: InfoClient) => void]}
   */
  const [infoClient, setInfoClient] = useState();

  /**
   * @type {[import("@rster/info-client").InfoMap, (index: import("@rster/info-client").InfoMap) => void]}
   */
  const [index, setIndex] = useState(null);

  /**
   * @type {[import("@rster/info-client").InfoMap, (index: import("@rster/info-client").InfoMap) => void]}
   */
  const [indexElement, setIndexElement] = useState(null);

  useEffect(() => {
    if (!infoClientSettings) return;
    console.log("infoClientSettings", infoClientSettings);
    if (infoClientSettings.proxy)
      console.log("Using proxy", infoClientSettings.proxy);

    setInfoClient(
      new InfoClient({
        basePath: pathname,
        url: `${protocol}//${host}`,
        proxy: infoClientSettings.proxy ?? undefined,
      })
    );
  }, [pathname, protocol, host, infoClientSettings]);

  useEffect(() => {
    if (!infoClient) return;
    infoClient
      .getIndex()
      .then((it) => {
        setIndexElement(it);
        return generateNavbarIndex(it);
      })
      .then((index) => {
        setIndex(index);
      })
      .catch((err) => {
        setIndex(null);
      });
  }, [infoClient]);

  return (
    <Router>
      <div
        className="App w-100 h-100"
        style={{
          backgroundColor: "#f8f9fa",
        }}
      >
        <header className="App-header">
          <Navbar
            className="bg-body-tertiary border-bottom position-fixed w-100"
            style={{
              zIndex: 3,
              backgroundColor: "#f8f9fa",
            }}
          >
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
                          <Icon
                            path={mdiAlertOutline}
                            size={1}
                            color="orange"
                          />
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
                    map: index.map((item) => ({
                      name: item.path,
                      href: `${item.path}@${item.method}`,
                      method: item.method,
                    })),
                  },
                ]
              : [
                  {
                    name: "Error loading index",
                  },
                ]
          }
          style={{
            width: "320px",
            position: "fixed",
            height: "calc(100% - 56px)",
            top: "56px",
            backgroundColor: "#f8f9fa",
            zIndex: 2,
          }}
        ></Sidebar>

        <div
          className="App-main"
          style={{
            marginLeft: "320px",
            width: "calc(100% - 320px)",
            padding: "2rem",
            position: "relative",
            zIndex: 1,
            height: "calc(100% - 56px)",
            overflow: "auto",
            top: "56px",
          }}
        >
          <Routes>
            {index ? (
              index.map((path) => {
                console.log(`${path.path}@${path.method}`);
                return (
                  <Route
                    path={`${path.path}@${path.method}`}
                    key={`${path.path}@${path.method}`}
                    element={<PathInfo info={path.info} />}
                  />
                );
              })
            ) : (
              <Route element={<div className="p-3">Loading</div>} />
            )}
            <Route path="/" element={<PathInfo info={indexElement} />} />
            <Route path="*" element={<div className="p-3">Not found</div>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

function PathInfo({ info }) {
  const [path, setPath] = useState(null);
  const [method, setMethod] = useState(null);
  const [description, setDescription] = useState(null);
  const [fields, setFields] = useState(null);

  useEffect(() => {
    if (!info) return;

    info.path.then((path) => setPath(path));
    info.method.then((method) => setMethod(method));
    info.description.then((description) => setDescription(description));
    info.fields.then((fields) => setFields(fields));
  }, [info]);

  if (!info) {
    return (
      <div className="p-3">
        <h1>Not found</h1>
      </div>
    );
  }

  return (
    <div className="p-3">
      {path ? (
        <h1
          style={{
            position: "relative",
          }}
        >
          {path}
          <span
            style={{
              right: 0,
              position: "absolute",
              textTransform: "uppercase",
              color: "#999",
            }}
          >
            {method}
          </span>
        </h1>
      ) : null}
      <p>{description?.join("\n") ?? <i>No description defined</i>}</p>

      <h2>Fields</h2>
      {fields
        ? fields
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((field) => (
              <InputGroup
                style={{
                  display: "inline-flex",
                  width: "auto",
                  margin: "1rem",
                }}
              >
                <Form.Control
                  type="text"
                  placeholder={field.name}
                  value={field.name}
                  disabled
                  className="bg-white"
                ></Form.Control>
                <Form.Control
                  type="text"
                  placeholder={field.value}
                  defaultValue={field.value}
                  disabled
                  className="text-end"
                />
              </InputGroup>
            ))
        : null}
    </div>
  );
}
