import AdminLayout from "../../layouts/AdminLayout";
import Domain from "../../Api/Api";
import { AuthToken } from "../../Api/Api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faFilter,
  faEye,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import axios from "axios";
import ApiService from "../Services/ApiService";
import { Link } from "react-router-dom";
import Loading from "../../layouts/Loading";
import moment from "moment";
import Swal from "sweetalert2";

const TYPES = {
  KEGIATAN: "kegiatan",
  PUBLICATION: "publication",
};

function ArticlesData({ articlesData, title }) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{title || "Contents"}</h1>
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
            {articlesData.map((article) => (
              <tr key={article.id} className="text-center border-b">
                <td className="py-2 max-w-[200px] text-center">
                  <div className="inline-block max-w-full truncate overflow-hidden text-ellipsis whitespace-nowrap">
                    {article.title}
                  </div>
                </td>

                <td className="py-2">{article.tags}</td>
                <td className="py-2">
                  {moment(article.created_at || article.createdAt).format(
                    "MMM D, YYYY [at] h:mm A"
                  )}
                </td>
                <td className="py-2 flex justify-around">
                  <Link to={`/Admin/Articles/${article.id}`}>
                    <FontAwesomeIcon className="text-green-500" icon={faEye} />
                  </Link>
                  <Link to={`/Admin/Articles/Update/${article.id}`}>
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

function Articles() {
  const [articlesData, setArticlesData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(TYPES.KEGIATAN);
  const [isShowedFilter, setIsShowedFilter] = useState("");

  useEffect(() => {
    Loading();
    const endpoint = "articles";
    ApiService.fetchList(endpoint)
      .then((data) => {
        const items = Array.isArray(data) ? data : data?.data || [];
        setArticlesData(items);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        Swal.close();
        setLoading(false);
      });
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredArticles = articlesData.filter((article) => {
    const matchesSearch = article.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = selectedType
      ? article.type?.toLowerCase() === selectedType.toLowerCase()
      : true;
    const matchesIsShowed =
      isShowedFilter !== ""
        ? article.isShowed === (isShowedFilter === "true")
        : true;

    return matchesSearch && matchesType && matchesIsShowed;
  });

  const ArticlesContent = (
    <div className="p-4">
      {loading ? (
        Loading()
      ) : (
        <>
          <div className="flex justify-between mb-4">
            <Link
              to="/Admin/Articles/New"
              state={{ initialType: TYPES.KEGIATAN }}
              className="bg-indigo-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-600"
            >
              <FontAwesomeIcon icon={faPlus} /> New Kegiatan
            </Link>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={handleSearchChange}
                className="border px-2 py-1 rounded-md"
              />
              {/* Type selector removed; this view is Articles-only */}

              <select
                value={isShowedFilter}
                onChange={(e) => setIsShowedFilter(e.target.value)}
                className="border px-2 py-1 rounded-md"
              >
                <option value="">All</option>
                <option value="true">Showed</option>
                <option value="false">Not Showed</option>
              </select>
            </div>
          </div>
          <ArticlesData articlesData={filteredArticles} title="Kegiatan" />
        </>
      )}
    </div>
  );

  return <AdminLayout Content={ArticlesContent} />;
}

export default Articles;
