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
import {
  DotsNine,
  Users,
  ArrowUp,
  ArrowDown,
  SmileyXEyes,
} from "phosphor-react";

import {
  getCurrentUser,
  getUserServers,
  deleteUserServers,
} from "../redux/actions/users";
import Tooltip from "../components/Tooltip";
import MyLinkify from "../components/MyLinkify";
import UserEditor from "../components/UserEditor";
import PageTitle from "../components/Typography/PageTitle";
import SectionTitle from "../components/Typography/SectionTitle";
import FullScreenLoading from "../components/FullScreenLoading";
import UsageCell from "../components/TableCells/UsageCell";

const User = () => {
  const user_id = parseInt(useParams().user_id);
  const [isUserEditorOpen, setIsUserEditorOpen] = useState(false);
  const { user, loading: userLoading } = useSelector(
    (state) => state.users.current
  );
  const { userServers, loading: userServersLoading } = useSelector(
    (state) => state.users.userServers
  );
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    dispatch(getCurrentUser(user_id));
  }, [dispatch, user_id]);
  useEffect(() => {
    dispatch(deleteUserServers());
    dispatch(getUserServers(user_id));
  }, [user_id, dispatch, user]);

  if (userLoading) return <FullScreenLoading />;
  return (
    <>
      <div className="flex flex-col justify-start">
        <div className="flex justify-between items-center">
          <PageTitle>User Detail [<span className={user.is_ops ? "text-purple-700" : ""}>{user.email}</span>]</PageTitle>
          <Button
            size="regular"
            onClick={() => {
              setIsUserEditorOpen(true);
            }}
          >
            Edit
          </Button>
        </div>
        {user.notes ? (
          <span>
            Comment: <MyLinkify>{user.notes}</MyLinkify>
          </span>
        ) : null}
      </div>
      <UserEditor
        user={user}
        isModalOpen={isUserEditorOpen}
        setIsModalOpen={setIsUserEditorOpen}
      />
      {!userServersLoading ? (
        userServers.length === 0 ? (
          <SectionTitle>This user has no access to any server or port.</SectionTitle>
        ) : (
          userServers.map((userServer) => (
            <div className="mt-3 flex flex-col">
              <div className="flex flex-row justify-between mb-2">
                <div className="flex flex-row space-x-2">
                  <span>
                    {userServer.server.name} [{userServer.server.address}]
                  </span>
                  <Tooltip tip="All Ports">
                    <Button
                      iconLeft={DotsNine}
                      size="small"
                      layout="outline"
                      onClick={(e) =>
                        history.push(
                          `/app/servers/${userServer.server_id}/ports`
                        )
                      }
                    />
                  </Tooltip>
                  <Tooltip tip="All Users">
                    <Button
                      iconLeft={Users}
                      size="small"
                      layout="outline"
                      onClick={() =>
                        history.push(
                          `/app/servers/${userServer.server_id}/users`
                        )
                      }
                    />
                  </Tooltip>
                  <UsageCell usage={userServer} flexStyle={"row"} />
                </div>
                <div className="flex flex-row">
                  {/* <Button size="regular" iconLeft={ArrowsDownUp} onClick={() => {}}>
                  限制用量
                </Button> */}
                </div>
              </div>
              <TableContainer key={`user_servers_${userServer.server_id}`}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell>Port</TableCell>
                      <TableCell>Traffic</TableCell>
                      {/* <TableCell>动作</TableCell> */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userServer.ports.map((userPort) => (
                      <TableRow>
                        <TableCell>{userPort.port.num}</TableCell>
                        <TableCell>
                          <div className="flex flex-col justify-center">
                            {userPort.usage ? (
                              <>
                                <span className="flex flex-auto items-center">
                                  <ArrowUp size={16} />
                                  {userPort.usage.readable_upload}
                                </span>
                                <span className="flex flex-auto items-center">
                                  <ArrowDown size={16} />
                                  {userPort.usage.readable_download}
                                </span>
                              </>
                            ) : (
                              <SmileyXEyes weight="bold" size={20} />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          ))
        )
      ) : (
        <FullScreenLoading />
      )}
    </>
  );
};

export default User;
