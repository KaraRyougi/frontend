import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Input,
  Label,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@windmill/react-ui";
import { At } from "phosphor-react";

import Modal from "../components/Modals/Modal"
import { TwoDotIcon } from "../icons";
import {
  createServer,
  editServer,
  deleteServer,
  editServerConfig,
} from "../redux/actions/servers";
import FullScreenLoading from "./FullScreenLoading";

const ServerEditor = ({ isModalOpen, setIsModalOpen }) => {
  const dispatch = useDispatch();

  const { server, loading } = useSelector(state => state.servers.current);

  const [lastServer, setLastServer] = useState(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [ansibleName, setAnsibleName] = useState("");
  const [ansibleHost, setAnsibleHost] = useState("");
  const [ansiblePort, setAnsiblePort] = useState(22);
  const [sshUser, setSshUser] = useState("root");
  const [sshPassword, setSshPassword] = useState("");
  const [sshPasswordNeeded, setSshPasswordNeeded] = useState(false);
  const [sudoPassword, setSudoPassword] = useState("");
  const [sudoPasswordNeeded, setSudoPasswordNeeded] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [tab, setTab] = useState({ server: true });

  const validName = () => name.length > 0;
  const validAddress = () => address.length > 0;
  const validAnsibleName = () => ansibleName && ansibleName.length > 0;
  const validAnsibleHost = () => !ansibleHost || ansibleHost.length > 0;
  const validAnsiblePort = () =>
    !ansiblePort ||
    (parseInt(ansiblePort) > 0 && parseInt(ansiblePort) < 65536);

  const validForm = () =>
    isDelete ||
    (validName() &&
      validAddress() &&
      validAnsibleName() &&
      validAnsibleHost() &&
      validAnsiblePort());

  const submitForm = () => {
    setIsModalOpen(false);
    if (isDelete) {
      dispatch(deleteServer(server.id));
    } else {
      const data = {
        name,
        address,
        ansible_name: ansibleName,
        ansible_user: sshUser,
      };
      if (ansibleHost) data.ansible_host = ansibleHost;
      if (ansiblePort) data.ansible_port = ansiblePort;
      if (!sshPasswordNeeded) {
        data.ssh_password = null;
      } else if (sshPassword) {
        data.ssh_password = sshPassword;
      }
      if (!sudoPasswordNeeded) {
        data.sudo_password = null;
      } else if (sudoPassword) {
        data.sudo_password = sudoPassword;
      }

      if (server) {
        dispatch(editServer(server.id, data));
      } else {
        dispatch(createServer(data));
      }
    }
    setName("");
    setAddress("");
    setAnsibleName("");
    setAnsibleHost("");
    setAnsiblePort(22);
    setSshUser("root");
    setSshPasswordNeeded(false);
    setSudoPasswordNeeded(false);
  };
  const toggleApp = (server, app) => {
    const config = {
      [`${app}_disabled`]: !!!server.config[`${app}_disabled`]
    }
    dispatch(editServerConfig(server.id, config));
  }

  useEffect(() => {
    setIsDelete(false);
    setSshPassword("");
    setSudoPassword("");
    setSshPasswordNeeded(false);
    setSudoPasswordNeeded(false);
    if (server) {
      setName(server.name);
      setAddress(server.address);
      setAnsibleName(server.ansible_name);
      setSshUser(server.ansible_user);
      if (server.ansible_host) setAnsibleHost(server.ansible_host);
      else setAnsibleHost("");
      if (server.ansible_port) setAnsiblePort(server.ansible_port);
      else setAnsiblePort("");
      if (server.ssh_password) setSshPasswordNeeded(true);
      if (server.sudo_password) setSudoPasswordNeeded(true);
    } else if (lastServer || !isModalOpen) {
      setName("");
      setAddress("");
      setAnsibleName("");
      setAnsibleHost("");
      setAnsiblePort(22);
      setSshUser("root");
      setTab({ server: true });
    }
    setLastServer(server);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen, server]);

  return (
    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
      {loading ? <FullScreenLoading />
        : (isModalOpen ? <>
          <ModalHeader>{server ? "Apply" : "Add"} a Server</ModalHeader>
          <ModalBody>
            <Label className="mt-4">
              <div className="flex flex-row justify-start items-center space-x-2">
                <Button className="hidden" />
                <div className={`${tab.server ? "border-b-2" : ""}`}>
                  <Button
                    layout="link"
                    onClick={(e) => {
                      e.preventDefault();
                      setTab({ server: true });
                    }}
                  >
                    Basic Info
              </Button>
                </div>
              </div>
            </Label>
            {tab.server ? (
              <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
                <Label className="mt-1">
                  <span>Name</span>
                  <Input
                    className="mt-1"
                    placeholder="US East 1 Oregon"
                    value={name}
                    valid={validName()}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Label>
                <Label className="mt-1">
                  <span>Address</span>
                  <Input
                    className="mt-1"
                    placeholder={"www.example.com"}
                    value={address}
                    valid={validAddress()}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </Label>
                <Label className="mt-1">
                  <span>Ansible Alias (No Special Character or Space)</span>
                  <Input
                    className="mt-1"
                    placeholder={"cn2"}
                    value={ansibleName}
                    valid={validAnsibleName()}
                    onChange={(e) => setAnsibleName(e.target.value)}
                  />
                </Label>
                <Label className="mt-1 flex flex-col">
                  <span>SSH Info</span>
                  <div className="mt-1 flex flex-row items-center">
                    <div className="flex flex-auto">
                      <Input
                        placeholder={"default: root"}
                        value={sshUser}
                        valid={() => sshUser.length > 0}
                        onChange={(e) => setSshUser(e.target.value)}
                      />
                    </div>
                    <At size={24} />
                    <div className="flex flex-auto">
                      <Input
                        placeholder={"default: server address"}
                        value={ansibleHost}
                        valid={validAnsibleHost()}
                        onChange={(e) => setAnsibleHost(e.target.value)}
                      />
                    </div>
                    <TwoDotIcon />
                    <div className="flex flex-auto">
                      <Input
                        placeholder={"default: 22"}
                        value={ansiblePort}
                        valid={validAnsiblePort()}
                        onChange={(e) => setAnsiblePort(e.target.value)}
                      />
                    </div>
                  </div>
                </Label>
                <Label className="mt-1">
                  <div className="flex flex-row justify-between items-center">
                    <span>SSH Password</span>
                    <div>
                      <Input
                        type="checkbox"
                        className="mr-1"
                        checked={!sshPasswordNeeded}
                        onChange={() => setSshPasswordNeeded(!sshPasswordNeeded)}
                      />
                      <span>No Password Required</span>
                    </div>
                  </div>
                  <Input
                    className="mt-1"
                    type="password"
                    placeholder={"Leave empty to use SSH key."}
                    value={sshPassword}
                    valid={sshPasswordNeeded ? () => !sshPassword || sshPassword.length >= 6 : undefined}
                    disabled={!sshPasswordNeeded}
                    onChange={(e) => setSshPassword(e.target.value)}
                  />
                </Label>
                <Label className="mt-1">
                  <div className="flex flex-row justify-between items-center">
                    <span>sudo password</span>
                    <div>
                      <Input
                        type="checkbox"
                        className="mr-1"
                        checked={!sudoPasswordNeeded}
                        onChange={() => setSudoPasswordNeeded(!sudoPasswordNeeded)}
                      />
                      <span>No sudo Password Required</span>
                    </div>
                  </div>
                  <Input
                    className="mt-1"
                    type="password"
                    placeholder={"Leave empty if not required."}
                    value={sudoPassword}
                    valid={sudoPasswordNeeded ? () => !sudoPassword || sudoPassword.length >= 6 : undefined}
                    disabled={!sudoPasswordNeeded}
                    onChange={(e) => setSudoPassword(e.target.value)}
                  />
                </Label>

                {server ? (
                  <Label className="mt-6">
                    <Input
                      type="checkbox"
                      checked={isDelete}
                      onChange={() => setIsDelete(!isDelete)}
                    />
                    <span className="ml-2">Delete Server</span>
                  </Label>
                ) : null}
              </div>
            ) : null}
          </ModalBody>
          <ModalFooter>
            <div className="w-full flex flex-row justify-end space-x-2">
              <Button layout="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
          </Button>
              <Button onClick={submitForm} disabled={!validForm()}>
                {server ? "Apply" : "Add"}
              </Button>
            </div>
          </ModalFooter>
        </> : null)}
    </Modal>
  );
};

export default ServerEditor;
