import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Input,
  Label,
  Select,
  ModalBody,
  ModalFooter,
  Button,
} from "@windmill/react-ui";
import Modal from '../components/Modals/Modal'

import { deleteForwardRule } from "../redux/actions/ports";
import IptablesRuleEditor from "../components/RuleEditors/IptablesRuleEditor";

const MethodOptions = [
  { label: "iptables", value: "iptables" }
];

const ForwardRuleEditor = ({
  forwardRule,
  serverId,
  port,
  isModalOpen,
  setIsModalOpen,
}) => {
  const dispatch = useDispatch();
  const server = useSelector((state) => state.servers.current.server);
  const [method, setMethod] = useState("iptables");
  const [validRuleForm, setValidRuleForm] = useState(() => () => false);
  const [submitRuleForm, setSubmitRuleForm] = useState(() => () => {});
  const [isDelete, setIsDelete] = useState(false);

  const validForm = () => isDelete || validRuleForm();
  const submitForm = () => {
    if (isDelete) {
      dispatch(deleteForwardRule(serverId, port.id));
    } else {
      submitRuleForm();
    }
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (isModalOpen) {
      setIsDelete(false);
      if (forwardRule) {
        setMethod(forwardRule.method);
      } else {
        setMethod("iptables");
      }
    }
  }, [isModalOpen, forwardRule]);

  return (
    <>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="-mt-6 mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300">
          <div className="mt-1 flex flex-row justify-start items-center">
            <span className="w-auto">Port Function</span>
            <div className="w-1/3 ml-3">
              <Select
                className="mt-1 w-1/2"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                {MethodOptions.filter(
                  (option) =>
                    !server ||
                    !server.config ||
                    !server.config[`${option.value}_disabled`]
                ).map((option) => (
                  <option
                    value={option.value}
                    key={`forward_rule_method_${option.value}`}
                  >
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>
        <ModalBody>
          <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
            {method === "iptables" ? (
              <IptablesRuleEditor
                serverId={serverId}
                portId={port.id}
                isModalOpen={isModalOpen}
                method={method}
                forwardRule={forwardRule}
                setValidRuleForm={setValidRuleForm}
                setSubmitRuleForm={setSubmitRuleForm}
              />
            ) : null}

            {forwardRule ? (
              <Label className="mt-6">
                <Input
                  type="checkbox"
                  checked={isDelete}
                  onChange={() => setIsDelete(!isDelete)}
                />
                <span className="ml-2">Port Disable</span>
              </Label>
            ) : null}
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="w-full flex flex-row justify-end space-x-2">
            <Button layout="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitForm} disabled={!validForm()}>
              {forwardRule ? "Apply" : "Add"}
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default ForwardRuleEditor;
