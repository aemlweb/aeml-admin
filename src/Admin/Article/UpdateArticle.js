import AdminLayout from "../../layouts/AdminLayout";
import axios from "axios";
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faSave,
  faTimes,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import Domain from "../../Api/Api";
import { AuthToken } from "../../Api/Api";
import Loading from "../../layouts/Loading";
import tagsData from "../tagsPlaceholder.json";

function GetArticle() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [removedImages, setRemovedImages] = useState([]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    body: "",
    type: "",
    tags: "",
    image: [],
    thumbnail: null,
    linkDownload: "",
    createdAt: "",
  });

  useEffect(() => {
    axios
      .get(`${Domain()}/admin/content/${id}`, {
        headers: { Authorization: "Bearer " + AuthToken() },
      })
      .then((response) => {
        const article = response.data.data;

        // Format the createdAt date for input field
        let formattedDate = "";
        if (article.createdAt) {
          const date = new Date(article.createdAt);
          formattedDate = date.toISOString().split("T")[0];
        }

        setFormData({
          title: article.title,
          subtitle: article.subtitle || "",
          body: article.body,
          type: article.type ? article.type.toLowerCase() : "",
          tags: article.tags || "",
          image: article.images || [],
          thumbnail: article.thumbnail || null,
          linkDownload: article.linkDownload || "",
          createdAt: formattedDate,
        });
        setLoading(false);
        Swal.close();
      })
      .catch((error) => {
        console.error("Error fetching article data:", error);
        setLoading(false);
        Swal.close();
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "title" && value.length > 100) {
      Swal.fire("Error", "Title cannot exceed 100 characters.", "error");
      return;
    }

    if (name === "subtitle" && value.length > 120) {
      Swal.fire("Error", "Subtitle cannot exceed 120 characters.", "error");
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    // Validasi ukuran
    for (let file of files) {
      if (file.size > 15 * 1024 * 1024) {
        Swal.fire("Error", `File ${file.name} lebih dari 15 MB!`, "error");
        return;
      }
    }

    // Kalau type kegiatan, maksimal 1 foto
    if (formData.type.toLowerCase() === "kegiatan") {
      if (formData.image.length >= 1) {
        Swal.fire(
          "Error",
          "Untuk kegiatan hanya boleh 1 foto. Hapus foto lama dulu.",
          "error"
        );
        return;
      }
      if (files.length > 1) {
        Swal.fire("Error", "Untuk kegiatan hanya bisa pilih 1 foto.", "error");
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      image: [...prev.image, ...files],
    }));
  };

  const handleRemoveImage = (index) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This image will be removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, remove it!",
    }).then((result) => {
      if (result.isConfirmed) {
        const removedImage = formData.image[index];

        // If it's an existing URL, track it for deletion
        if (typeof removedImage === "string") {
          setRemovedImages((prev) => [...prev, removedImage]);
        }

        // Update state to remove the image
        const updatedPictures = formData.image.filter((_, i) => i !== index);
        setFormData({ ...formData, image: updatedPictures });

        Swal.fire("Removed!", "The image has been removed.", "success");
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    Swal.fire({
      icon: "question",
      title: "Are you sure you want to update this article?",
      confirmButtonText: "Yes, Update",
      showCancelButton: true,
      preConfirm: () => {
        Swal.fire({
          title: "Updating...",
          text: "Please wait while the article is being updated.",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const payload = new FormData();

        Object.keys(formData).forEach((key) => {
          if (key === "type") {
            payload.append("type", formData.type.toLowerCase());
          } else if (key === "tags") {
            payload.append("tags", formData.tags.toLowerCase());
          } else if (key === "image") {
            formData.image.forEach((file) => {
              if (typeof file !== "string") {
                payload.append("image", file);
              }
            });
          } else if (key === "thumbnail" && formData.thumbnail) {
            payload.append("thumbnail", formData.thumbnail);
          } else if (key === "createdAt") {
            if (
              (formData.type.toLowerCase() === "publication" ||
                formData.type.toLowerCase() === "kegiatan") &&
              formData.createdAt
            ) {
              const dateValue = new Date(formData.createdAt).toISOString();
              payload.append("createdAt", dateValue);
              console.log("Adding createdAt to payload:", dateValue);
            }
          } else {
            payload.append(key, formData[key]);
          }
        });

        if (removedImages.length > 0) {
          removedImages.forEach((image) => {
            payload.append("removedImages[]", image);
          });
        } else {
          payload.append("removedImages[]", "");
        }

        return axios.put(`${Domain()}/admin/content/${id}`, payload, {
          headers: {
            Authorization: "Bearer " + AuthToken(),
            "Content-Type": "multipart/form-data",
          },
        });
      },
    })
      .then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            icon: "success",
            title: "Updated!",
            text: "The article has been successfully updated.",
          }).then(() => {
            if (formData.type.toLowerCase() === "publication") {
              navigate("/Admin/Publications");
            } else {
              navigate("/Admin/Articles");
            }
          });
        }
      })

      .catch((error) => {
        console.error("Error updating article:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while updating the article.",
        });
      });
  };

  // Check if current type is publikasi
  const isPublikasi = formData.type.toLowerCase() === "publication";
  const isKegiatan = formData.type.toLowerCase() === "kegiatan";

  // Tentukan opsi tags sesuai type
  const tagOptions = isPublikasi
    ? tagsData.PUBLICATION_TAGS
    : tagsData.KEGIATAN_TAGS;

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Edit Article</h1>
            <Link
              to="/Admin/Articles"
              className="bg-gray-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-600"
            >
              <FontAwesomeIcon icon={faArrowLeft} /> Back
            </Link>
          </div>
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-md rounded-lg p-6"
          >
            {/* Title */}
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
            </div>

            {/* Subtitle */}
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">
                Subtitle
              </label>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Date */}
            {(isPublikasi || isKegiatan) && (
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                  {isPublikasi ? "Publication Date" : "Kegiatan Date"}
                </label>
                <input
                  type="date"
                  name="createdAt"
                  value={formData.createdAt}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            )}

            {/* Body */}
            {!isPublikasi && (
              <>
                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2">
                    Body
                  </label>
                  <textarea
                    name="body"
                    value={formData.body.replace(/<br\s*\/?>/g, "\n")}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        body: e.target.value.replace(/\n/g, "<br />"),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-400"
                    rows="6"
                    required
                  ></textarea>
                </div>

                {/* Body Preview - Only show for non-publikasi types */}
                <div className="mb-4 p-4 border rounded-lg bg-gray-100">
                  <label className="block text-gray-700 font-bold mb-2">
                    Preview
                  </label>
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: formData.body }}
                  ></div>
                </div>
              </>
            )}

            {/* Info Publikasi */}
            {isPublikasi && (
              <div className="mb-4 p-4 border rounded-lg bg-blue-50 border-blue-200">
                <p className="text-blue-700 font-medium">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                  This is a publication article. Body content editing is not
                  available for this type.
                </p>
              </div>
            )}

            {/* Type */}
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Type</label>
              <input
                type="text"
                name="type"
                value={formData.type}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100"
              />
            </div>

            {/* Tags */}
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Tags</label>
              <select
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-400"
                required
              >
                {!formData.tags && (
                  <option value="" disabled>
                    Select Tag
                  </option>
                )}
                {Object.keys(tagOptions).map((key) => (
                  <option key={key} value={key.toLowerCase()}>
                    {tagOptions[key]}
                  </option>
                ))}
              </select>
            </div>

            {/* Images */}
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">
                Images{" "}
                {isKegiatan && (
                  <span className="text-sm text-gray-500">
                    (Maximum 1 image)
                  </span>
                )}
              </label>
              <input
                type="file"
                name="image"
                onChange={handleFileChange}
                multiple={!isKegiatan}
                accept="image/*"
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <div className="grid grid-cols-3 gap-4 mt-4">
                {formData.image.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={
                        typeof image === "string"
                          ? image
                          : URL.createObjectURL(image)
                      }
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                      title="Remove image"
                    >
                      <FontAwesomeIcon icon={faTimes} className="text-xs" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Download Link */}
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">
                Download Link
              </label>
              <input
                type="url"
                name="linkDownload"
                value={formData.linkDownload}
                onChange={handleChange}
                placeholder="https://example.com/download"
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-indigo-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-indigo-600 transition-colors"
              >
                <FontAwesomeIcon icon={faSave} className="mr-2" /> Update
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function UpdateArticle() {
  return <AdminLayout Content={<GetArticle />} />;
}

export default UpdateArticle;
