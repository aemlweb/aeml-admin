import AdminLayout from "../../layouts/AdminLayout";
import Domain, { AuthToken } from "../../Api/Api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEye, faPen } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ApiService from "../Services/ApiService";
import Loading from "../../layouts/Loading";
import moment from "moment";
import Swal from "sweetalert2";

function PublicationsData({ data }) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Publications</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="w-1/5 py-2">Title</th>
              <th className="w-1/5 py-2">Tags</th>
              <th className="w-1/5 py-2">Date Created</th>
              <th className="w-1/5 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="text-center border-b">
                <td className="py-2 max-w-[200px] text-center">
                  <div className="inline-block max-w-full truncate overflow-hidden text-ellipsis whitespace-nowrap">
                    {item.title}
                  </div>
                </td>
                <td className="py-2">{item.tags}</td>
                <td className="py-2">
                  {moment(item.created_at || item.createdAt).format(
                    "MMM D, YYYY [at] h:mm A"
                  )}
                </td>
                <td className="py-2 flex justify-around">
                  <Link to={`/Admin/Articles/${item.id}`}>
                    <FontAwesomeIcon className="text-green-500" icon={faEye} />
                  </Link>
                  <Link to={`/Admin/Articles/Update/${item.id}`}>
                    <FontAwesomeIcon className="text-yellow-500" icon={faPen} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Publications() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Loading();
    ApiService.fetchList("publications")
      .then((res) => {
        const items = Array.isArray(res) ? res : res?.data || [];
        setData(items);
      })
      .catch((e) => console.error(e))
      .finally(() => {
        Swal.close();
        setLoading(false);
      });
  }, []);

  const Content = (
    <div className="p-4">
      {loading ? (
        Loading()
      ) : (
        <>
          <div className="flex justify-between mb-4">
            <Link
              to="/Admin/Publications/New"
              state={{ initialType: "publication" }}
              className="bg-indigo-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-600"
            >
              <FontAwesomeIcon icon={faPlus} /> New Publication
            </Link>
          </div>
          <PublicationsData data={data} />
        </>
      )}
    </div>
  );

  return <AdminLayout Content={Content} />;
}

export default Publications;
