// src/components/Questions/NewQuestion.js
import { useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import ApiService from "../Services/ApiService";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSave } from "@fortawesome/free-solid-svg-icons";

function NewQuestion() {
  const [question, setQuestion] = useState("");
  const navigate = useNavigate();

  // Adjustable character limit
  const MAX_CHARACTERS = 100;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question)
      return Swal.fire("Error", "Question text is required", "error");

    if (question.length > MAX_CHARACTERS)
      return Swal.fire(
        "Error",
        `Question must be ${MAX_CHARACTERS} characters or less`,
        "error"
      );

    const formData = new FormData();
    formData.append("question", question);

    // pastikan ApiService dipakai langsung dengan FormData
    ApiService.createQuestions(question)
      .then((res) => {
        if (res?.statusCode === 201 || res?.id) {
          Swal.fire("Success", "Question created!", "success").then(() =>
            navigate("/Admin/Questions")
          );
        } else {
          throw new Error("Invalid response");
        }
      })
      .catch((err) => {
        console.error("Create error:", err);
        Swal.fire("Error", "Failed to create question", "error");
      });
  };

  const handleQuestionChange = (e) => {
    const value = e.target.value;
    // Allow typing but warn when approaching limit
    setQuestion(value);
  };

  // Check if form is valid
  const isFormValid =
    question.trim().length > 0 && question.length <= MAX_CHARACTERS;
  const isOverLimit = question.length > MAX_CHARACTERS;
  const charactersRemaining = MAX_CHARACTERS - question.length;

  return (
    <AdminLayout
      Content={
        <div className="p-6 bg-white rounded shadow">
          <div className="flex justify-between mb-4">
            <h1 className="text-2xl font-bold">New Question</h1>
            <Link
              to="/Admin/Questions"
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              <FontAwesomeIcon icon={faArrowLeft} /> Back
            </Link>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <textarea
                value={question}
                onChange={handleQuestionChange}
                className={`w-full border rounded p-2 ${
                  isOverLimit
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
                rows="5"
                placeholder="Enter your question"
              />
              <div className="flex justify-between items-center mt-2">
                <div
                  className={`text-sm ${
                    isOverLimit
                      ? "text-red-500"
                      : charactersRemaining <= 20
                      ? "text-orange-500"
                      : "text-gray-500"
                  }`}
                >
                  {charactersRemaining >= 0
                    ? `${charactersRemaining} characters remaining`
                    : `${Math.abs(charactersRemaining)} characters over limit`}
                </div>
                <div className="text-sm text-gray-400">
                  {question.length}/{MAX_CHARACTERS}
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={!isFormValid}
              className={`mt-4 px-6 py-2 rounded transition-colors ${
                isFormValid
                  ? "bg-indigo-500 text-white hover:bg-indigo-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <FontAwesomeIcon icon={faSave} /> Save
            </button>
          </form>
        </div>
      }
    />
  );
}

export default NewQuestion;
