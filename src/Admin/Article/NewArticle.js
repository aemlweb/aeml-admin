import AdminLayout from "../../layouts/AdminLayout";
import ApiService from "../Services/ApiService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faArrowLeft,
  faTimes,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import tagsData from "../tagsPlaceholder.json"; // import json

const TYPES = {
  KEGIATAN: "kegiatan",
  PUBLICATION: "publication",
};
const MAX_TITLE_LENGTH = 70;
const MAX_SUBTITLE_LENGTH = 200;
const MAX_IMAGES = {
  [TYPES.KEGIATAN]: 1,
  [TYPES.PUBLICATION]: 1,
};

function NewArticle() {
  const location = useLocation();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [body, setBody] = useState("");
  const [subtitleError, setSubtitleError] = useState("");
  const [titleError, setTitleError] = useState("");
  const [images, setImages] = useState([]);
  const [linkDownload, setLinkDownload] = useState("");
  const preselectedType = location.state?.initialType || "";
  const [type, setType] = useState(preselectedType);
  const [createdAt, setCreatedAt] = useState("");
  const [tag, setTag] = useState(""); // NEW TAG state

  const navigate = useNavigate();

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const maxImages = MAX_IMAGES[type] || 10;

    if (images.length + files.length > maxImages) {
      Swal.fire(
        "Error",
        `You can only upload up to ${maxImages} image(s) for ${type}.`,
        "error"
      );
      return;
    }

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    if (type === TYPES.KEGIATAN) {
      setImages(newImages);
    } else {
      setImages((prevImages) => [...prevImages, ...newImages]);
    }
  };

  const handleRemoveImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleSubtitleChange = (e) => {
    const value = e.target.value;
    if (value.length > MAX_SUBTITLE_LENGTH) {
      setSubtitleError(
        `Subtitle cannot exceed ${MAX_SUBTITLE_LENGTH} characters.`
      );
    } else {
      setSubtitleError("");
    }
    setSubtitle(value);
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    if (value.length > MAX_TITLE_LENGTH) {
      setTitleError(`Title cannot exceed ${MAX_TITLE_LENGTH} characters.`);
    } else {
      setTitleError("");
    }
    setTitle(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title || images.length === 0 || !type || !tag) {
      Swal.fire("Error", "Please fill in all required fields", "error");
      return;
    }

    if (type !== TYPES.PUBLICATION && !body) {
      Swal.fire("Error", "Please fill in all required fields", "error");
      return;
    }

    if (type === TYPES.PUBLICATION && !createdAt) {
      Swal.fire("Error", "Please select a publication date", "error");
      return;
    }

    if (type === TYPES.KEGIATAN && !createdAt) {
      Swal.fire("Error", "Please select a date for kegiatan", "error");
      return;
    }

    if (subtitleError || titleError) {
      Swal.fire("Error", "Please fix the errors before submitting.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("subtitle", subtitle);
    formData.append("type", type);
    formData.append("tags", tag); // add TAG to payload

    images.forEach(({ file }) => formData.append("image", file));
    if (linkDownload) formData.append("linkDownload", linkDownload);

    if (type !== TYPES.PUBLICATION) {
      formData.append("body", body.replace(/\n/g, "<br />"));
    }

    if ((type === TYPES.PUBLICATION || type === TYPES.KEGIATAN) && createdAt) {
      // Convert date string to ISO format
      const dateValue = new Date(createdAt).toISOString();
      formData.append("createdAt", dateValue);
      console.log("Adding createdAt to payload:", dateValue);
    }

    Swal.fire({
      title: "Saving...",
      text: "Please wait while we save your content.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const endpoint = "admin/contents";
    ApiService.createItem(endpoint, formData)
      .then((data) => {
        if (data.status === "Content created successfully") {
          Swal.fire("Success", "Content created successfully!", "success").then(
            () => {
              navigate("/Admin/Articles");
            }
          );
        } else {
          Swal.fire(
            "Error",
            data.message || data.error || "Failed to create content",
            "error"
          );
        }
      })
      .catch((error) => {
        console.error("Error creating content:", error);
        Swal.fire(
          "Error",
          "An error occurred while creating the content",
          "error"
        );
      });
  };

  // Check if current type is publication or kegiatan (both need date)
  const isPublicationType = type === TYPES.PUBLICATION;
  const isKegiatanType = type === TYPES.KEGIATAN;
  const needsDate = isPublicationType || isKegiatanType;

  return (
    <AdminLayout
      Content={
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">
              {type === TYPES.PUBLICATION
                ? "New Publication"
                : type === TYPES.KEGIATAN
                ? "New Kegiatan"
                : "New Content"}
            </h1>
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
            {/* Title Input */}
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">
                Title
              </label>
              {title.length >= MAX_TITLE_LENGTH ? (
                <textarea
                  value={title}
                  onChange={handleTitleChange}
                  className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-400 ${
                    titleError ? "border-red-500" : ""
                  }`}
                  rows="3"
                  required
                />
              ) : (
                <input
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-400 ${
                    titleError ? "border-red-500" : ""
                  }`}
                  required
                />
              )}
              {titleError && (
                <p className="text-red-500 text-sm mt-1">{titleError}</p>
              )}
            </div>

            {/* Subtitle Input */}
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">
                Subtitle
              </label>
              {subtitle.length >= MAX_SUBTITLE_LENGTH ? (
                <textarea
                  value={subtitle}
                  onChange={handleSubtitleChange}
                  className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-400 ${
                    subtitleError ? "border-red-500" : ""
                  }`}
                  rows="4"
                />
              ) : (
                <input
                  type="text"
                  value={subtitle}
                  onChange={handleSubtitleChange}
                  className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-400 ${
                    subtitleError ? "border-red-500" : ""
                  }`}
                />
              )}
              {subtitleError && (
                <p className="text-red-500 text-sm mt-1">{subtitleError}</p>
              )}
            </div>

            {/* Date - Show for both publication and kegiatan types */}
            {needsDate && (
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                  {isPublicationType ? "Publication Date" : "Kegiatan Date"}
                </label>
                <input
                  type="date"
                  value={createdAt}
                  onChange={(e) => setCreatedAt(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-400"
                  required={needsDate}
                />
              </div>
            )}

            {/* Body - Hide for publication type */}
            {!isPublicationType && (
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Body
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-400"
                  rows="18"
                  required={!isPublicationType}
                ></textarea>
              </div>
            )}

            {/* Show message for publication type */}
            {isPublicationType && (
              <div className="mb-4 p-4 border rounded-lg bg-blue-50 border-blue-200">
                <p className="text-blue-700 font-medium">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                  This is a publication article. Body content is not required
                  for this type.
                </p>
              </div>
            )}

            {/* Type Select */}
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Type</label>
              {preselectedType ? (
                <input
                  type="text"
                  value={type}
                  readOnly
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                />
              ) : (
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-400 ${
                    !type ? "text-gray-400" : ""
                  }`}
                  required
                >
                  {!type && (
                    <option value="" disabled>
                      Select Type
                    </option>
                  )}
                  {Object.keys(TYPES).map((key) => (
                    <option key={key} value={TYPES[key]}>
                      {TYPES[key]}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Tags Select */}
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Tag</label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-400"
                required
                disabled={!type} // disable sampai type dipilih
              >
                {!tag && (
                  <option value="" disabled>
                    {type ? "Select Tag" : "Select Type first"}
                  </option>
                )}

                {type === TYPES.KEGIATAN &&
                  Object.entries(tagsData.KEGIATAN_TAGS || {}).map(
                    ([key, value]) => (
                      <option key={key} value={value}>
                        {value}
                      </option>
                    )
                  )}

                {type === TYPES.PUBLICATION &&
                  Object.entries(tagsData.PUBLICATION_TAGS || {}).map(
                    ([key, value]) => (
                      <option key={key} value={value}>
                        {value}
                      </option>
                    )
                  )}
              </select>
            </div>
            {/* Image Upload */}
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">
                Upload Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const maxSize = 15 * 1024 * 1024; // 15 MB
                    if (file.size > maxSize) {
                      Swal.fire(
                        "Error",
                        `Maksimal ukuran foto 15 MB!`,
                        "error"
                      );
                      e.target.value = ""; // reset input
                      return;
                    }

                    // Tambahkan file ke array images
                    const newImage = {
                      file,
                      preview: URL.createObjectURL(file),
                    };
                    setImages((prev) => [...prev, newImage]);
                  }
                }}
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-400"
              />

              {/* Preview */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImages((prev) => prev.filter((_, i) => i !== index));
                      }}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                      title="Remove image"
                    >
                      <FontAwesomeIcon icon={faTimes} className="text-xs" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Link Download Input */}
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">
                Download Link
              </label>
              <input
                type="url"
                value={linkDownload}
                onChange={(e) => setLinkDownload(e.target.value)}
                placeholder="https://example.com/download"
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-indigo-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-indigo-600 transition-colors"
              >
                <FontAwesomeIcon icon={faSave} className="mr-2" /> Save
              </button>
            </div>
          </form>
        </div>
      }
    />
  );
}

export default NewArticle;
