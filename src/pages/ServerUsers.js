import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHeader,
  TableRow,
} from "@windmill/react-ui";
import { DotsNine, Star } from "phosphor-react";

import { getReadableSize } from "../utils/formatter";
import {
  getCurrentServer,
  getServerUsers,
  deleteServerUser,
} from "../redux/actions/servers";
import ColoredButton from "../components/Buttons/ColoredButton";
import ConfimationModal from "../components/Modals/ConfirmationModal";
import PageTitle from "../components/Typography/PageTitle";
import FullScreenLoading from "../components/FullScreenLoading";
import ServerPortUserAdd from "../components/Buttons/ServerPortUserAdd";
import ServerUserEditor from "../components/ServerUserEditor";
import { DateOptions } from "../utils/constants";
import AuthSeletor from "../components/AuthSelector";

const ServerUsers = () => {
  const server_id = parseInt(useParams().server_id);
  const dispatch = useDispatch();
  const history = useHistory();

  const { users, loading: usersLoading } = useSelector(
    (state) => state.servers.users
  );
  const { server, loading: serverLoading } = useSelector(
    (state) => state.servers.current
  );

  const [currentServerUser, setCurrentServerUser] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(getCurrentServer(server_id));
    dispatch(getServerUsers(server_id));
  }, [dispatch, server_id]);

  if (serverLoading) return <FullScreenLoading />;
  return (
    <>
      <ServerUserEditor
        serverUser={currentServerUser}
        isModalOpen={isEditorOpen}
        setIsModalOpen={setIsEditorOpen}
      />
      <ConfimationModal
        title="Access Disable Confirmation"
        body={`Are you sure you want to disable access to ${server.name} by ${currentServerUser.email}?`}
        callback={() =>
          dispatch(deleteServerUser(server_id, currentServerUser.id))
        }
        isModalOpen={isDeleting}
        setIsModalOpen={setIsDeleting}
      />

      <PageTitle>
        <div className="flex flex-row justify-start space-x-2">
          <span>
            {server.name}[{server.address}]
          </span>
          <Button
            iconLeft={DotsNine}
            size="small"
            layout="outline"
            onClick={(e) => history.push(`/app/servers/${server_id}/ports`)}
          ></Button>
        </div>
      </PageTitle>

      {usersLoading ? (
        <FullScreenLoading />
      ) : (
          <>
            <div className="flex flex-row justify-between items-center">
              <PageTitle>User Detail</PageTitle>
              <ServerPortUserAdd
                serverId={server_id}
                addingType="server"
                allowedUsers={users}
                isAdding={isAdding}
                setIsAdding={setIsAdding}
              />
            </div>
            <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell>E-mail</TableCell>
                    <TableCell>Traffic Usage</TableCell>
                    <TableCell>Expire Date</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {users.map(
                    (user) =>
                      user.user && (
                        <TableRow key={`server_user_table_${user.user_id}`}>
                          <TableCell className="flex flex-row">
                            <button
                              onClick={() => history.push(`/app/users/${user.user_id}`)}
                              className="text-blue-600"
                            >
                              {user.user.email}
                            </button>
                            <AuthSeletor permissions={["admin"]}>
                              <span>{user.user.is_ops ? <Star size={12} weight="bold" /> : null}</span>
                            </AuthSeletor>
                          </TableCell>
                          <TableCell>
                            <span>
                              Traffic used: {getReadableSize(user.download + user.upload)}
                              {user.config.quota
                                ? ` / ${getReadableSize(user.config.quota)}`
                                : ""}
                            </span>
                          </TableCell>
                          <TableCell>
                            {user.config.valid_until
                              ? new Date(user.config.valid_until).toLocaleString(
                                "en-US",
                                DateOptions
                              )
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-start space-x-1">
                              <ColoredButton
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentServerUser(user);
                                  setIsEditorOpen(true);
                                }}
                              >
                                Limit
                          </ColoredButton>
                              <ColoredButton
                                color="red"
                                scale={500}
                                onClick={(e) => {
                                  e.preventDefault();
                                  console.log(user.user);
                                  setCurrentServerUser(user.user);
                                  setIsDeleting(true);
                                }}
                              >
                                Delete
                          </ColoredButton>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>)}
    </>
  );
};

export default ServerUsers;
