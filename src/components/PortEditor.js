import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import {
  Button,
  Input,
  Label,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  HelperText,
} from "@windmill/react-ui";
import Modal from '../components/Modals/Modal'

import AuthSelector from "../components/AuthSelector"
import {
  createServerPort,
  bulkCreateServerPort,
  editServerPort,
  deleteServerPort,
  editServerPortUsage,
} from "../redux/actions/ports";
import { formatSpeed, formatQuota } from "../utils/formatter";
import { SpeedLimitOptions, QuotaOptions, DueActionOptions, DateOptions } from "../utils/constants"


const PortEditor = ({ port, serverId, isModalOpen, setIsModalOpen }) => {
  const dispatch = useDispatch();
  const [num, setNum] = useState("");
  const [externalNum, setExternalNum] = useState("");
  const [notes, setNotes] = useState("");
  const [egressLimit, setEgressLimit] = useState("");
  const [egressLimitScalar, setEgressLimitScalar] = useState(1);
  const [ingressLimit, setIngressLimit] = useState("");
  const [ingressLimitScalar, setIngressLimitScalar] = useState(1);
  const [validUntilDate, setValidUntilDate] = useState("");
  const [dueAction, setDueAction] = useState(0);
  const [quota, setQuota] = useState("");
  const [quotaScalar, setQuotaScalar] = useState(1000000000);
  const [quotaAction, setQuotaAction] = useState(0);
  const [isDelete, setIsDelete] = useState(false);

  const validNum = () => {
    if (num) {
      const numStr = num.toString();
      const idx = numStr.indexOf('-')
      if (idx !== -1) {
        return parseInt(numStr.slice(0, idx)) < parseInt(numStr.slice(idx + 1))
      }
      return parseInt(num) > 0 && parseInt(num) < 65536
    }
    return false
  }
  const validExternalNum = () =>
    !externalNum || (externalNum > 0 && externalNum < 65536);
  const validEgress = () => !egressLimit || egressLimit > 0;
  const validIngress = () => !ingressLimit || ingressLimit > 0;
  const validValidUntilDate = () =>
    !validUntilDate ||
    (!isNaN(new Date(validUntilDate)) &&
      new Date(validUntilDate) > Date.now());

  const validForm = () =>
    isDelete || (validNum() && validExternalNum() && validValidUntilDate());

  const resetUsage = () => {
    const data = {
      port_id: port.id,
      download: 0,
      upload: 0,
      download_accumulate: 0,
      upload_accumulate: 0,
      download_checkpoint: 0,
      upload_checkpoint: 0,
    };
    dispatch(editServerPortUsage(serverId, port.id, data));
    setIsModalOpen(false);
  };
  const submitForm = () => {
    if (isDelete) {
      dispatch(deleteServerPort(serverId, port.id));
    } else {
      const data = {
        num,
        external_num: null,
        config: {
          egress_limit: null,
          ingress_limit: null,
          valid_until: null,
          due_action: 0,
          quota: null,
          quota_action: 0,
        },
      };
      if (externalNum) data.external_num = externalNum;
      data.notes = notes;
      if (egressLimit)
        data.config.egress_limit = egressLimit * egressLimitScalar;
      if (ingressLimit)
        data.config.ingress_limit = ingressLimit * ingressLimitScalar;
      if (validUntilDate) data.config.valid_until = Date.parse(validUntilDate);
      if (dueAction) data.config.due_action = parseInt(dueAction);
      if (quota) data.config.quota = quota * quotaScalar;
      if (quotaAction) data.config.quota_action = parseInt(quotaAction);

      if (port) {
        dispatch(editServerPort(serverId, port.id, data));
      } else {
        const numStr = num.toString();
        const idx = numStr.indexOf('-')
        if (idx !== -1) {
          const start = parseInt(numStr.slice(0, idx))
          const end = parseInt(numStr.slice(idx + 1))
          dispatch(bulkCreateServerPort(serverId, [...Array(end - start + 1).keys()].map(i => (
            {
              num: i + start,
              external_num: null,
              config: {
                egress_limit: null,
                ingress_limit: null,
                valid_until: null,
                due_action: 0,
                quota: null,
                quota_action: 0,
              }
            }))));
        } else {
          dispatch(createServerPort(serverId, data));
        }
      }
    }
    setIsModalOpen(false);
  };

  useEffect(() => {
    setIsDelete(false);
    if (port) {
      setNum(port.num);
      if (port.external_num) setExternalNum(port.external_num);
      else setExternalNum("");
      if (port.notes) setNotes(port.notes);
      else setNotes("");
      if (port.config.egress_limit) {
        formatSpeed(
          port.config.egress_limit,
          setEgressLimit,
          setEgressLimitScalar
        );
      } else setEgressLimit("");
      if (port.config.ingress_limit) {
        formatSpeed(
          port.config.ingress_limit,
          setIngressLimit,
          setIngressLimitScalar
        );
      } else setIngressLimit("");
      if (port.config.valid_until) {
        setValidUntilDate(new Date(port.config.valid_until).toISOString());
      } else setValidUntilDate("");
      if (port.config.due_action) {
        setDueAction(port.config.due_action);
      } else setDueAction(0);

      formatQuota(port.config.quota, setQuota, setQuotaScalar);
      if (port.config.quota_action) {
        setQuotaAction(port.config.quota_action);
      } else {
        setQuotaAction(0);
      }
    } else {
      setNum("");
      setExternalNum("");
      setNotes("");
      setEgressLimit("");
      setIngressLimit("");
      setEgressLimitScalar(1);
      setIngressLimitScalar(1);
    }
  }, [isModalOpen, port]);

  return (
    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
      <ModalHeader>{port ? "Apply" : "Add"} a Port</ModalHeader>
      {port ?
        <ModalBody>
          <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
            <AuthSelector permissions={['admin', 'ops']}>
              <Label className="mt-2">
                <span>Port</span>
                <Input className="mt-1" value={num} disabled={true} />
              </Label>
              <Label className="mt-1">
                <span>Public Open Port</span>
                <Input
                  className="mt-1"
                  placeholder={"Only required for servers behind NAT."}
                  value={externalNum}
                  valid={validExternalNum()}
                  onChange={(e) => setExternalNum(e.target.value)}
                />
              </Label>
              <Label className="mt-1">
                <div className="flex flex-row">
                  <span className="w-1/2">Limit Inbound Traffic</span>
                  <span className="w-1/2">Limit Outbound Traffic</span>
                </div>
                <div className="mt-1 flex flex-row items-center">
                  <div className="flex w-1/4">
                    <Input
                      placeholder={"Leave empty for no limit."}
                      value={egressLimit}
                      valid={validEgress()}
                      onChange={(e) => setEgressLimit(e.target.value)}
                    />
                  </div>
                  <div className="flex w-1/4">
                    <Select
                      value={egressLimitScalar}
                      onChange={(e) => setEgressLimitScalar(e.target.value)}
                    >
                      {SpeedLimitOptions.map((option) => (
                        <option
                          value={option.value}
                          key={`egress_limit_options_${option.value}`}
                        >
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="flex w-1/4">
                    <Input
                      placeholder={"Leave empty for no limit."}
                      value={ingressLimit}
                      valid={validIngress()}
                      onChange={(e) => setIngressLimit(e.target.value)}
                    />
                  </div>
                  <div className="flex w-1/4">
                    <Select
                      value={ingressLimitScalar}
                      onChange={(e) => setIngressLimitScalar(e.target.value)}
                    >
                      {SpeedLimitOptions.map((option) => (
                        <option
                          value={option.value}
                          key={`ingress_limit_options_${option.value}`}
                        >
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              </Label>
              <Label className="mt-1">
                <div className="flex flex-row">
                  <span className="w-1/2">Expire Date</span>
                  <span className="w-1/2">Action when Expired</span>
                </div>
                <div className="mt-1 flex flex-row items-center">
                  <div className="flex w-1/2">
                    <Input
                      placeholder={"Leave empty for no limit."}
                      value={validUntilDate}
                      valid={validValidUntilDate()}
                      onChange={(e) => {
                        setValidUntilDate(e.target.value);
                      }}
                    />
                  </div>
                  <div className="flex w-1/2">
                    <Select
                      value={dueAction}
                      onChange={(e) => setDueAction(e.target.value)}
                    >
                      {DueActionOptions.map((option) => (
                        <option
                          value={option.value}
                          key={`due_action_options_${option.value}`}
                        >
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
                {isNaN(Date.parse(validUntilDate)) ? null : (
                  <div className="flex flex-row items-center">
                    <HelperText>{`The rule will expire on ${new Date(validUntilDate).toLocaleString(
                      "en-US",
                      DateOptions
                    )}.`}</HelperText>
                  </div>
                )}
              </Label>
              <Label className="mt-1">
                <div className="flex flex-row">
                  <span className="w-1/2">Limit Traffic Usage</span>
                  <span className="w-1/2">Overuse Action</span>
                </div>
                <div className="mt-1 flex flex-row items-center">
                  <div className="flex w-1/4">
                    <Input
                      placeholder={"Leave empty for no limit."}
                      value={quota}
                      valid={validValidUntilDate()}
                      onChange={(e) => {
                        setQuota(e.target.value);
                      }}
                    />
                  </div>
                  <div className="flex w-1/4">
                    <Select
                      value={quotaScalar}
                      onChange={(e) => setQuotaScalar(e.target.value)}
                    >
                      {QuotaOptions.map((option) => (
                        <option
                          value={option.value}
                          key={`quota_options_${option.value}`}
                        >
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="flex w-1/2">
                    <Select
                      value={quotaAction}
                      onChange={(e) => setQuotaAction(e.target.value)}
                    >
                      {DueActionOptions.map((option) => (
                        <option
                          value={option.value}
                          key={`quota_action_options_${option.value}`}
                        >
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              </Label>
            </AuthSelector>
            <Label className="mt-1">
              <span>Comment</span>
              <Input
                className="mt-1"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Label>
            <AuthSelector permissions={['admin', 'ops']}>
              {port ? (
                <Label className="mt-4">
                  <Input
                    type="checkbox"
                    checked={isDelete}
                    onChange={() => setIsDelete(!isDelete)}
                  />
                  <span className="ml-2">Delete Port</span>
                </Label>
              ) : null}
            </AuthSelector>
          </div>
        </ModalBody>
        :
        <ModalBody>
          <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
            <AuthSelector permissions={['admin', 'ops']}>
              <Label className="mt-2">
                <span>Port</span>
                <Input
                  className="mt-1"
                  placeholder={"A single port or a port range (e.g. 8000-8080)."}
                  value={num}
                  valid={validNum()}
                  onChange={(e) => setNum(e.target.value)}
                />
              </Label>
              <Label className="mt-1">
                <span>Public Open Port</span>
                <Input
                  className="mt-1"
                  placeholder={"Only required for servers behind NAT."}
                  value={externalNum}
                  valid={validExternalNum()}
                  onChange={(e) => setExternalNum(e.target.value)}
                />
              </Label>
            </AuthSelector>
          </div>
        </ModalBody>}
      <ModalFooter>
        <div className="w-full flex flex-row justify-end space-x-2">
          {port ? (
            <Button layout="outline" onClick={resetUsage}>
              Traffic Usage Reset
            </Button>
          ) : null}
          <Button layout="outline" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submitForm} disabled={!validForm()}>
            {port ? "Apply" : "Add"}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default PortEditor;
