import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import {
  Badge,
  Button,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Input,
  TableBody,
  TableContainer,
  Table,
  TableHeader,
  TableCell,
  TableRow,
  TableFooter,
} from "@windmill/react-ui";
import { CheckCircle, XCircle, NumberZero, NumberOne, Plus, Star } from "phosphor-react";

import { PlusIcon } from "../icons";
import MyLinkify from '../components/MyLinkify';
import Tooltip from "../components/Tooltip"
import Pagination from "../components/Pagination";
import PageTitle from "../components/Typography/PageTitle";
import FullScreenLoading from "../components/FullScreenLoading";

import { getUsers, deleteUser } from "../redux/actions/users";
import UserEditor from "../components/UserEditor";
import Tooptip from "../components/Tooltip";

const privilegeToIcon = (user) => {
  if (!user || !user.allowed_ports || user.allowed_ports.length === 0) return <NumberZero weight="bold" size={20} />
  else if (user.allowed_ports.length === 1) return <NumberOne weight="bold" size={20} />
  else return <span className="flex flex-row"><NumberOne weight="bold" size={20} /><Plus weight="bold" size={20} /></span>
}

const privilegeToBadge = (user, servers, ports) => {
  const components = [];
  // if (!user || !user.allowed_servers || user.allowed_servers.length === 0) {
  //   components.push(<Badge type="danger">0台服务器权限</Badge>)
  // } else {
  //   components.push(<Badge type="danger">{`${user.allowed_servers.length}台服务器权限`}</Badge>)
  //   components.push(<span>{user.allowed_servers.map(s => servers[s.server_id] && servers[s.server_id].name).join(',')}</span>)
  // }
  if (!user || !user.allowed_ports || user.allowed_ports.length === 0) {
    components.push(<Badge type="success">No port usage is allowed.</Badge>)
  } else if (user.allowed_ports.length === 1) {
    components.push(<Badge type="success">{`Allowed to use ${user.allowed_ports.length} port.`}</Badge>)
  } else {
    components.push(<Badge type="success">{`Allowed to use ${user.allowed_ports.length} ports.`}</Badge>)
  }
  return (
    <>
      {components.map(c => c)}
    </>
  )
}

function Users() {
  const { users, loading } = useSelector((state) => state.users.users);
  const servers = useSelector((state) => state.servers.servers);
  const ports = useSelector((state) => state.ports.ports);

  const location = useLocation();
  const query = new URLSearchParams(location.search)
  const page = parseInt(query.get("page") || 1);
  const size = parseInt(query.get('size') || users.size || 20);

  const [currentUser, setCurrentUser] = useState("");
  const [removeRule, setRemoveRule] = useState(true);
  const [isUserEditorOpen, setIsUserEditorOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showPrivilege, setShowPrivilege] = useState({});
  const dispatch = useDispatch();
  const history = useHistory();

  const submitDeleteUser = () => {
    const data = {
      remove_rule: removeRule,
    };
    dispatch(deleteUser(currentUser.id, data));
    setIsDeleteModalOpen(false);
  };

  useEffect(() => {
    dispatch(getUsers(page, size));
    // eslint-disable-next-line
  }, [dispatch, location]);

  return (
    <>
      <div className="flex justify-between items-center">
        <PageTitle>Users</PageTitle>
        <Button
          size="regular"
          iconLeft={PlusIcon}
          onClick={() => {setCurrentUser(null);setIsUserEditorOpen(true)}}
        >
          Add User
        </Button>
      </div>

      <UserEditor
        user={currentUser}
        isModalOpen={isUserEditorOpen}
        setIsModalOpen={setIsUserEditorOpen}
      />
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <ModalHeader>Delete User</ModalHeader>
        <ModalBody>
          <div className="px-4 py-3 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
            <Label>
              <Input
                type="checkbox"
                checked={removeRule}
                onChange={() => setRemoveRule(!removeRule)}
              />
              <span className="ml-2">Delete all forwarding rules and traffic usage info.</span>
            </Label>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="w-full flex flex-row justify-end space-x-2">
            <Button layout="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
          </Button>
            <Button onClick={submitDeleteUser} >
            Confirm
          </Button>
          </div>
        </ModalFooter>
      </Modal>

      {loading ? <FullScreenLoading /> :
      <TableContainer>
        <Table>
          <TableHeader>
            <tr>
              <TableCell>E-mail</TableCell>
              <TableCell>Comment</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Enabled</TableCell>
              <TableCell>Action</TableCell>
            </tr>
          </TableHeader>
          <TableBody>
            {users.items.map(
              (user) =>

                <TableRow key={`users_user_${user.id}`}>
                  <TableCell className="flex flex-row">
                    
                    {user.is_ops ? 
                      <>
                      <span className="text-sm text-purple-700">{user.email}</span>
                      <span className="ml-1">
                      <Tooptip tip="Server Admin">
                        <Star size={12} weight="bold" /> 
                      </Tooptip>
                    </span> </>: <span className="text-sm">{user.email}</span>}
                  </TableCell>
                  <TableCell>
                    <Tooltip tip={<MyLinkify>{user.notes}</MyLinkify>}>
                    {user.notes
                      ? user.notes.length > 10
                        ? `${user.notes.slice(0, 10)}...`
                        : user.notes
                      : "None"}
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <div className="relative z-20 inline-flex items-center">
                      <div
                        onMouseEnter={() => setShowPrivilege({ [user.id]: true })}
                        onMouseLeave={() => setShowPrivilege({ [user.id]: false })}
                      >
                        {privilegeToIcon(user)}
                      </div>
                      {showPrivilege[user.id] ? (
                        <div className="relative">
                          <div className="absolute flex flex-col justify-start items-center top-0 z-30 w-auto p-2 -mt-1 text-sm leading-tight text-black transform -translate-x-1/2 -translate-y-full bg-white rounded-lg shadow-lg">
                            {privilegeToBadge(user, servers, ports)}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {user.is_active ? (
                        <CheckCircle weight="bold" size={20} />
                      ) : (
                          <XCircle weight="bold" size={20} />
                        )}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-row space-x-1">
                      <Button
                        size="small"
                        onClick={() => history.push(`/app/users/${user.id}`)}
                      >
                        Detail
                        </Button>
                      <Button
                        size="small"
                        onClick={() => {
                          setCurrentUser(user);
                          setIsUserEditorOpen(true);
                        }}
                      >
                        Edit
                        </Button>
                      <button
                        className="align-bottom inline-flex items-center justify-center cursor-pointer leading-5 transition-colors duration-150 font-medium focus:outline-none px-3 py-1 rounded-md text-sm text-white bg-red-500 border border-transparent active:bg-red-500 hover:bg-red-600 focus:shadow-outline-red"
                        onClick={() => {
                          setCurrentUser(user);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        Delete
                        </button>
                    </div>
                  </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
          <TableFooter>
            <Pagination
              totalResults={parseInt(users.total)}
              resultsPerPage={parseInt(users.size)}
              currentPage={page}
              onChange={(p) => { p !== page && history.push(`/app/users?page=${p}&size=${size}`) }}
              label="Users"
            />
          </TableFooter>
      </TableContainer>}
    </>
  );
}

export default Users;
