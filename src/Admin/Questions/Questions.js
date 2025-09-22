// src/components/Questions/Questions.js
import AdminLayout from "../../layouts/AdminLayout";
import ApiService from "../Services/ApiService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEye,
  faPen,
  faToggleOn,
  faToggleOff,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import moment from "moment";
import Loading from "../../layouts/Loading";
import axios from "axios";
import Domain, { AuthToken } from "../../Api/Api";

function QuestionsData({ questions, onToggleStatus }) {
  const handleToggleStatus = async (questionId, currentStatus) => {
    try {
      // If trying to activate a question, show warning about deactivating others
      if (!currentStatus) {
        const activeQuestions = questions.filter(
          (q) => q.isActive === true && q.id !== questionId
        );

        let confirmText = "Are you sure you want to activate this question?";
        if (activeQuestions.length > 0) {
          confirmText += ` This will automatically deactivate ${activeQuestions.length} other active question(s).`;
        }

        const result = await Swal.fire({
          title: "Activate Question?",
          text: confirmText,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Yes, activate it!",
          cancelButtonText: "Cancel",
        });

        if (result.isConfirmed) {
          await onToggleStatus(questionId, true);
          Swal.fire(
            "Success!",
            "Question has been activated and others have been deactivated.",
            "success"
          );
        }
      } else {
        // Deactivating current question
        const result = await Swal.fire({
          title: "Deactivate Question?",
          text: "Are you sure you want to deactivate this question?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Yes, deactivate it!",
          cancelButtonText: "Cancel",
        });

        if (result.isConfirmed) {
          await onToggleStatus(questionId, false);
          Swal.fire("Success!", "Question has been deactivated.", "success");
        }
      }
    } catch (error) {
      Swal.fire("Error", "Failed to update question status", "error");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Questions</h1>

      {/* Warning message if more than one active question */}
      {questions.filter((q) => q.isActive === true).length > 1 && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p className="font-bold">Warning!</p>
          <p>
            Multiple questions are currently active. Only one question should be
            active at a time.
          </p>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="w-2/5 py-2">Question</th>
              <th className="w-1/6 py-2">Response</th>
              <th className="w-1/6 py-2">Status</th>
              <th className="w-1/6 py-2">Created</th>
              <th className="w-1/6 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q.id} className="text-center border-b">
                <td className="py-2 max-w-[300px] truncate">{q.question}</td>
                <td className="py-2">{q.answers?.length || 0}</td>
                <td className="py-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      q.isActive === true
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {q.isActive === true ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-2">
                  {moment(q.createdAt).format("MMM D, YYYY h:mm A")}
                </td>
                <td className="py-2 flex justify-around">
                  <Link to={`/Admin/Questions/${q.id}`}>
                    <FontAwesomeIcon className="text-green-500" icon={faEye} />
                  </Link>
                  <Link to={`/Admin/Questions/Update/${q.id}`}>
                    <FontAwesomeIcon className="text-yellow-500" icon={faPen} />
                  </Link>
                  <button
                    onClick={() =>
                      handleToggleStatus(q.id, q.isActive === true)
                    }
                    className={`${
                      q.isActive === true ? "text-green-500" : "text-red-500"
                    } hover:opacity-70`}
                    title={q.isActive === true ? "Deactivate" : "Activate"}
                  >
                    <FontAwesomeIcon
                      icon={q.isActive === true ? faToggleOn : faToggleOff}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Questions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Loading();
    ApiService.fetchList("questions")
      .then((data) => {
        setQuestions(Array.isArray(data) ? data : data.data);
      })
      .catch(() => Swal.fire("Error", "Failed to fetch questions", "error"))
      .finally(() => {
        Swal.close();
        setLoading(false);
      });
  }, []);

  const handleToggleStatus = async (questionId, newStatus) => {
    try {
      if (newStatus) {
        // FORCE UPDATE: When activating a question, deactivate ALL other questions first
        const otherQuestions = questions.filter((q) => q.id !== questionId);

        // Batch deactivate all other questions in parallel for better performance
        const deactivatePromises = otherQuestions
          .filter((q) => q.isActive === true) // Only update actually active questions
          .map((question) =>
            axios.put(
              `${Domain()}/questions/${question.id}`,
              { isActive: false },
              {
                headers: { Authorization: "Bearer " + AuthToken() },
              }
            )
          );

        // Wait for all deactivation requests to complete
        await Promise.all(deactivatePromises);

        // Then activate the selected question
        await axios.put(
          `${Domain()}/questions/${questionId}`,
          { isActive: true },
          {
            headers: { Authorization: "Bearer " + AuthToken() },
          }
        );

        // Update local state - ensure ONLY the selected question is active
        setQuestions((prev) =>
          prev.map((q) => ({
            ...q,
            isActive: q.id === questionId ? true : false,
          }))
        );
      } else {
        // Deactivating question
        await axios.put(
          `${Domain()}/questions/${questionId}`,
          { isActive: false },
          {
            headers: { Authorization: "Bearer " + AuthToken() },
          }
        );

        // Update local state
        setQuestions((prev) =>
          prev.map((q) => (q.id === questionId ? { ...q, isActive: false } : q))
        );
      }
    } catch (error) {
      console.error("Error updating question status:", error);
      throw new Error("Failed to update question status");
    }
  };

  // Optional: Add a force fix function to handle multiple active questions
  const forceFixActiveQuestions = async () => {
    try {
      const activeQuestions = questions.filter((q) => q.isActive === true);

      if (activeQuestions.length <= 1) {
        Swal.fire("Info", "No multiple active questions found.", "info");
        return;
      }

      const result = await Swal.fire({
        title: "Fix Multiple Active Questions?",
        text: `Found ${activeQuestions.length} active questions. Keep the most recent one and deactivate others?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, fix it!",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        // Sort by creation date and keep the most recent
        const sortedActive = [...activeQuestions].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        const keepActive = sortedActive[0];
        const toDeactivate = sortedActive.slice(1);

        // Deactivate all except the most recent
        const deactivatePromises = toDeactivate.map((question) =>
          axios.put(
            `${Domain()}/questions/${question.id}`,
            { isActive: false },
            {
              headers: { Authorization: "Bearer " + AuthToken() },
            }
          )
        );

        await Promise.all(deactivatePromises);

        // Update local state
        setQuestions((prev) =>
          prev.map((q) => ({
            ...q,
            isActive: q.id === keepActive.id ? true : false,
          }))
        );

        Swal.fire(
          "Success!",
          `Fixed! Only the most recent question (${keepActive.question.substring(
            0,
            50
          )}...) remains active.`,
          "success"
        );
      }
    } catch (error) {
      Swal.fire("Error", "Failed to fix active questions", "error");
    }
  };

  const QuestionsContent = (
    <div className="p-4">
      {loading ? (
        Loading()
      ) : (
        <>
          <div className="flex justify-between mb-4">
            <div className="flex gap-2">
              {/* New Question Button */}
              <Link
                to="/Admin/Questions/New"
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-600 flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faPlus} /> New Question
              </Link>

              {/* Force Fix Button - only show if multiple active questions exist */}
              {questions.filter((q) => q.isActive === true).length > 1 && (
                <button
                  onClick={forceFixActiveQuestions}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-orange-600 flex items-center gap-2"
                >
                  Fix Multiple Active
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Total: {questions.length} | Active:{" "}
                {questions.filter((q) => q.isActive === true).length} |
                Inactive: {questions.filter((q) => q.isActive === false).length}
              </span>
            </div>
          </div>
          <QuestionsData
            questions={questions}
            onToggleStatus={handleToggleStatus}
          />
        </>
      )}
    </div>
  );

  return <AdminLayout Content={QuestionsContent} />;
}

export default Questions;
